const fs = require('fs');
let code = fs.readFileSync('src/hooks/auth.ts', 'utf8');

code = code.replace(
  'import { loginAction, logoutAction } from "@/app/actions/auth.actions";',
  'import { loginAction, logoutAction, syncSessionAction } from "@/app/actions/auth.actions";'
);

code = code.replace(
  /const checkSupabaseAuth = async \(\) => {[\s\S]*?localStorage\.setItem\("stockhub_session", JSON\.stringify\(user\)\);\n      }\n    };/,
  `const checkSupabaseAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const parsedSession = storedSession ? JSON.parse(storedSession) : null;
      const needsShopId = parsedSession && !parsedSession.shopId;

      if (session && session.user && (!storedSession || needsShopId)) {
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
      }
    };`
);

code = code.replace(
  /const { data: authListener } = supabase\.auth\.onAuthStateChange\(async \(event, session\) => {[\s\S]*?localStorage\.setItem\("stockhub_session", JSON\.stringify\(user\)\);\n      } else if \(event === 'SIGNED_OUT'\) {/,
  `const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        await syncSessionAction(user);
      } else if (event === 'SIGNED_OUT') {`
);

fs.writeFileSync('src/hooks/auth.ts', code);
console.log('Fixed Google OAuth Syncing');
