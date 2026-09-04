const fs = require('fs');

let authPath = 'src/hooks/auth.ts';
let authCode = fs.readFileSync(authPath, 'utf8');

authCode = authCode.replace(
  /const checkSupabaseAuth = async \(\) => \{\n      const \{ data: \{ session \} \} = await supabase\.auth\.getSession\(\);\n      \n      const parsedSession = storedSession \? JSON\.parse\(storedSession\) : null;\n      const needsShopId = parsedSession && !parsedSession\.shopId;/,
  `const checkSupabaseAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const parsedSession = storedSession ? JSON.parse(storedSession) : null;
      if (parsedSession && parsedSession.role === 'employee') {
        return; // Do not overwrite employee session with underlying Google owner session
      }
      const needsShopId = parsedSession && !parsedSession.shopId;`
);

authCode = authCode.replace(
  /const \{ data: authListener \} = supabase\.auth\.onAuthStateChange\(async \(event, session\) => \{\n      if \(event === 'SIGNED_IN' && session\?\.user\) \{/,
  `const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const currentLocalSession = localStorage.getItem("stockhub_session");
        if (currentLocalSession) {
          const parsed = JSON.parse(currentLocalSession);
          if (parsed.role === 'employee') return; // Do not overwrite employee session
        }`
);

fs.writeFileSync(authPath, authCode);
console.log("auth.ts updated with employee guard");
