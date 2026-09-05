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
  onboardingCompleted?: boolean;
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
    let isHandled = false; // Prevent double-processing

    // Single unified function that validates the Google session
    const validateAndSetGoogleSession = async (session: any, isSignupFlow: boolean) => {
      if (isHandled) return;
      isHandled = true;

      // Block employee sessions from being overwritten
      const storedSession = localStorage.getItem("stockhub_session");
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed.role === 'employee') {
          setIsLoaded(true);
          return;
        }
      }

      if (!session?.user) {
        // No active Google session
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          // Employees use PIN auth (no Supabase session), trust their localStorage
          if (parsed.role === 'employee') {
            setCurrentUser(parsed);
            setIsLoaded(true);
            return;
          }
          // Owners use Google OAuth - if there's no Google session but there IS a stored owner session,
          // it means the session is stale (expired or from a cleared DB). Clear it.
          localStorage.removeItem("stockhub_session");
          setCurrentUser(null);
        }
        setIsLoaded(true);
        return;
      }

      // STEP 1: Check if the user has a profile in our database
      let { data: profile } = await supabase.from('profiles').select('shop_id, onboarding_completed').eq('id', session.user.id).single();

      // STEP 2: If no profile and this is a SIGNUP flow, create the profile
      if (!profile && isSignupFlow) {
        const res = await completeGoogleSignupAction(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata?.full_name || ''
        );
        if (res.success) {
          const { data: newProfile } = await supabase.from('profiles').select('shop_id, onboarding_completed').eq('id', session.user.id).single();
          profile = newProfile;
        }
      }

      // STEP 3: If still no profile → REJECT. User must register first.
      if (!profile) {
        await supabase.auth.signOut();
        localStorage.removeItem("stockhub_session");
        setCurrentUser(null);
        setIsLoaded(true);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?error=account_not_found';
        }
        return;
      }

      // STEP 4: Profile found → create session
      const needsOnboarding = !profile.onboarding_completed || !profile.shop_id;
      const user: User = {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.email || 'Utilisateur Google',
        identifier: session.user.email || '',
        pinCode: '0000',
        role: 'owner',
        shopId: profile.shop_id,
        onboardingCompleted: profile.onboarding_completed ?? false,
        permissions: { canViewDashboard: true },
        createdAt: session.user.created_at
      };
      setCurrentUser(user);
      localStorage.setItem("stockhub_session", JSON.stringify(user));
      await syncSessionAction(user);
      setIsLoaded(true);

      // STEP 5: Explicit routing based on onboarding status
      // Only redirect if we're on /auth/callback (just came from OAuth) or dashboard
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (needsOnboarding && path !== '/onboarding') {
          window.location.href = '/onboarding';
        } else if (!needsOnboarding && path !== '/dashboard' && (path.startsWith('/auth') || path === '/login')) {
          window.location.href = '/dashboard';
        }
      }
    };

    // On initial load: check if a Google session already exists
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isSignupFlow = typeof window !== 'undefined' && window.location.search.includes('flow=signup');
      await validateAndSetGoogleSession(session, isSignupFlow);
    };

    init();

    // Listen to auth state changes (called when Google OAuth redirects back)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const isSignupFlow = typeof window !== 'undefined' && window.location.search.includes('flow=signup');
        isHandled = false; // Allow re-validation on new sign-in
        await validateAndSetGoogleSession(session, isSignupFlow);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem("stockhub_session");
        setIsLoaded(true);
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
