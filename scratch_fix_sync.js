const fs = require('fs');
let code = fs.readFileSync('src/hooks/auth.ts', 'utf8');

code = code.replace(
  /if \(session && session\.user && \(\!storedSession \|\| needsShopId\)\) \{/,
  `if (session && session.user) {`
);

fs.writeFileSync('src/hooks/auth.ts', code);
console.log('Fixed checkSupabaseAuth if block');
