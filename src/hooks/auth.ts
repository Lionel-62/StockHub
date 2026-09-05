import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { loginAction, logoutAction, syncSessionAction, completeGoogleSignupAction } from "@/app/actions/auth.actions";
import { getTeamMembersAction, addTeamMemberAction, deleteTeamMemberAction } from "@/app/actions/team.actions";

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
      setIsLoaded(true); // Optimistic instant UI load
    }
    
    // Check Supabase Auth (for Google OAuth)
    const checkSupabaseAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const parsedSession = storedSession ? JSON.parse(storedSession) : null;
      if (parsedSession && parsedSession.role === 'employee') {
        if (!storedSession) setIsLoaded(true);
        return; // Do not overwrite employee session with underlying Google owner session
      }

      if (session && session.user) {
        let { data: profile } = await supabase.from('profiles').select('shop_id').eq('id', session.user.id).single();
        
        // Check flow from URL
        const isSignupFlow = typeof window !== 'undefined' && window.location.search.includes('flow=signup');

        if (!profile && isSignupFlow) {
          // Complete Google Signup
          const res = await completeGoogleSignupAction(
            session.user.id, 
            session.user.email || '', 
            session.user.user_metadata?.full_name || ''
          );
          if (res.success) {
            // Re-fetch profile
            const { data: newProfile } = await supabase.from('profiles').select('shop_id').eq('id', session.user.id).single();
            profile = newProfile;
          }
        }

        // Si le profil n'existe toujours pas (ou que ce n'est pas un flux d'inscription valide)
        if (!profile) {
          await supabase.auth.signOut();
          localStorage.removeItem("stockhub_session");
          setCurrentUser(null);
          setIsLoaded(true);
          
          if (!isSignupFlow && window.location.pathname !== '/login') {
            window.location.href = '/login?error=account_not_found';
          }
          return;
        }

        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email || 'Utilisateur Google',
          identifier: session.user.email || '',
          pinCode: '0000',
          role: 'owner',
          shopId: profile.shop_id,
          permissions: { canViewDashboard: true },
          createdAt: session.user.created_at
        };
        setCurrentUser(user);
        localStorage.setItem("stockhub_session", JSON.stringify(user));
        await syncSessionAction(user);
      }
      
      if (!storedSession) {
        setIsLoaded(true);
      }
    };
    
    checkSupabaseAuth();

    // Listen to Auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const currentLocalSession = localStorage.getItem("stockhub_session");
        if (currentLocalSession) {
          const parsed = JSON.parse(currentLocalSession);
          if (parsed.role === 'employee') return; // Do not overwrite employee session
        }
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
        await syncSessionAction(user);
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
    const res = await getTeamMembersAction();
    if (res.success && res.data) {
      // Map DB snake_case to camelCase
      const mappedUsers: User[] = res.data.map((d: any) => ({
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
  };

    const login = async (identifier: string, pinCode: string, allowedRole?: "owner" | "employee", shopSlug?: string) => {
    const res = await loginAction(identifier, pinCode, allowedRole, shopSlug);
    if (res.success && res.user) {
      const user = {
        ...res.user,
        pinCode: pinCode
      } as User;
      setCurrentUser(user);
      localStorage.setItem("stockhub_session", JSON.stringify(user));
      return { success: true };
    }
    return { success: false, error: res.error || "Identifiant ou code PIN incorrect." };
  };

  const logout = async () => {
    const isEmployee = currentUser?.role === "employee";
    setCurrentUser(null);
    localStorage.removeItem("stockhub_session");
    await logoutAction();
    
    if (!isEmployee) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } else {
      // If employee logs out, we keep the underlying Google session (if any)
      // and reload to let the app restore the owner session automatically.
      window.location.href = "/dashboard";
    }
  };

const addUser = async (user: User) => {
    if (user.role === "employee") {
      if (!currentUser?.shopId) {
        throw new Error("Action non autorisée. Boutique introuvable.");
      }
      
      const currentEmployees = users.filter(u => u.role !== "owner");
      if (currentEmployees.length >= 2) {
        throw new Error("Limite atteinte : Vous ne pouvez pas ajouter plus de 2 employés.");
      }

      const res = await addTeamMemberAction({
        name: user.name,
        identifier: user.identifier,
        pinCode: user.pinCode,
        role: user.role,
        permissions: user.permissions,
        createdAt: user.createdAt
      });
      
      if (!res.success) {
        console.error("Error creating employee", res.error);
        throw new Error(res.error || "Impossible de créer l'employé.");
      }
      
      const newUserWithShop = { ...user, shopId: currentUser.shopId };
      setUsers([...users, newUserWithShop]);
    } else {
      throw new Error("Action non autorisée.");
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    await deleteTeamMemberAction(id);
  };

  return {
    currentUser,
    users,
    addUser,
    deleteUser,
    login,
    logout,
    isLoaded,
    fetchUsers
  };
}
