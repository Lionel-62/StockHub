import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface User {
  id: string;
  name: string;
  identifier: string; // The login identifier (e.g. "patron" or "employe1")
  pinCode: string; // 4-digit code (e.g. "1234")
  role: "owner" | "employee";
  shopId?: string;
  shopSlug?: string;
  shopName?: string;
  permissions: {
    canViewDashboard: boolean;
  };
  createdAt: string;
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load current session from localStorage (PIN auth)
    const storedSession = localStorage.getItem("stockhub_session");
    if (storedSession) {
      setCurrentUser(JSON.parse(storedSession));
    }
    
    // Check Supabase Auth (for Google OAuth)
    const checkSupabaseAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const parsedSession = storedSession ? JSON.parse(storedSession) : null;
      const needsShopId = parsedSession && !parsedSession.shopId;

      if (session && session.user && (!storedSession || needsShopId)) {
        const { data: profile } = await supabase.from('profiles').select('shop_id').eq('id', session.user.id).single();
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email || 'Utilisateur Google',
          identifier: session.user.email || '',
          pinCode: '0000', // Dummy pin for OAuth users
          role: 'owner',
          shopId: profile?.shop_id,
          permissions: { canViewDashboard: true },
          createdAt: session.user.created_at
        };
        setCurrentUser(user);
        localStorage.setItem("stockhub_session", JSON.stringify(user));
      }
    };
    
    checkSupabaseAuth();

    // Fetch all profiles from Supabase
    fetchUsers();

    // Listen to Auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase.from('profiles').select('shop_id').eq('id', session.user.id).single();
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email || 'Utilisateur Google',
          identifier: session.user.email || '',
          pinCode: '0000',
          role: 'owner',
          shopId: profile?.shop_id,
          permissions: { canViewDashboard: true },
          createdAt: session.user.created_at
        };
        setCurrentUser(user);
        localStorage.setItem("stockhub_session", JSON.stringify(user));
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem("stockhub_session");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) {
      // Map DB snake_case to camelCase
      const mappedUsers: User[] = data.map(d => ({
        id: d.id,
        name: d.name,
        identifier: d.identifier,
        pinCode: d.pin_code,
        role: d.role,
        permissions: typeof d.permissions === 'string' ? JSON.parse(d.permissions) : d.permissions,
        createdAt: d.created_at
      }));
      setUsers(mappedUsers);
    }
    setIsLoaded(true);
  };

  const login = async (identifier: string, pinCode: string, allowedRole?: "owner" | "employee") => {
    // We use a custom RPC function to bypass RLS securely for PIN login
    const { data, error } = await supabase
      .rpc('verify_pin_login', {
        p_identifier: identifier,
        p_pin_code: pinCode
      });

    const userRecord = data?.[0]; // The RPC returns a table/array

    if (!error && userRecord) {
      if (allowedRole && userRecord.role !== allowedRole) {
        return { success: false, error: allowedRole === "owner" ? "Veuillez utiliser l'espace employé." : "Veuillez utiliser l'espace propriétaire." };
      }

      const user: User = {
        id: userRecord.id,
        name: userRecord.name,
        identifier: userRecord.identifier,
        pinCode: pinCode, // Not returned securely, we use the input
        role: userRecord.role,
        shopId: userRecord.shop_id,
        shopSlug: userRecord.shop_slug,
        shopName: userRecord.shop_name,
        permissions: typeof userRecord.permissions === 'string' ? JSON.parse(userRecord.permissions) : userRecord.permissions,
        createdAt: new Date().toISOString() // Or return from RPC if needed
      };
      setCurrentUser(user);
      localStorage.setItem("stockhub_session", JSON.stringify(user));
      return { success: true };
    }
    return { success: false, error: "Identifiant ou code PIN incorrect." };
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem("stockhub_session");
    await supabase.auth.signOut();
  };

  const addUser = async (user: User) => {
    // Generate a unique slug for the shop based on the name
    const shopSlug = user.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    // Create the shop first
    const { data: shopData, error: shopError } = await supabase.from('shops').insert({
      name: user.name,
      slug: shopSlug,
    }).select().single();

    if (shopError || !shopData) {
      console.error("Error creating shop", shopError);
      throw new Error("Impossible de créer la boutique.");
    }

    const newUserWithShop = { ...user, shopId: shopData.id, shopSlug: shopData.slug, shopName: shopData.name };
    
    // Optimistic update
    setUsers([...users, newUserWithShop]);
    
    await supabase.from('profiles').insert({
      id: user.id,
      name: "Gérant", // Owner's default name
      identifier: user.identifier,
      pin_code: user.pinCode,
      role: user.role,
      shop_id: shopData.id,
      permissions: user.permissions, // JSONB
      created_at: user.createdAt
    });
  };

  const deleteUser = async (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    await supabase.from('profiles').delete().eq('id', id);
  };

  return {
    currentUser,
    users,
    addUser,
    deleteUser,
    login,
    logout,
    isLoaded
  };
}
