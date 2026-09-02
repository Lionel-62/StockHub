import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface User {
  id: string;
  name: string;
  identifier: string; // The login identifier (e.g. "patron" or "employe1")
  pinCode: string; // 4-digit code (e.g. "1234")
  role: "owner" | "employee";
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
      if (session && session.user && !storedSession) {
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email || 'Utilisateur Google',
          identifier: session.user.email || '',
          pinCode: '0000', // Dummy pin for OAuth users
          role: 'owner',
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
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email || 'Utilisateur Google',
          identifier: session.user.email || '',
          pinCode: '0000',
          role: 'owner',
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('identifier', identifier)
      .eq('pin_code', pinCode)
      .single();

    if (!error && data) {
      if (allowedRole && data.role !== allowedRole) {
        return { success: false, error: allowedRole === "owner" ? "Veuillez utiliser l'espace employé." : "Veuillez utiliser l'espace propriétaire." };
      }

      const user: User = {
        id: data.id,
        name: data.name,
        identifier: data.identifier,
        pinCode: data.pin_code,
        role: data.role,
        permissions: typeof data.permissions === 'string' ? JSON.parse(data.permissions) : data.permissions,
        createdAt: data.created_at
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
    // Optimistic update
    setUsers([...users, user]);
    
    await supabase.from('profiles').insert({
      id: user.id,
      name: user.name,
      identifier: user.identifier,
      pin_code: user.pinCode,
      role: user.role,
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
