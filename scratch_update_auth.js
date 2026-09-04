const fs = require('fs');

let authPath = 'src/hooks/auth.ts';
let authCode = fs.readFileSync(authPath, 'utf8');

authCode = authCode.replace(
  /const login = async \(identifier: string, pinCode: string, allowedRole\?: "owner" \| "employee"\) => \{/,
  `const login = async (identifier: string, pinCode: string, allowedRole?: "owner" | "employee", shopSlug?: string) => {`
);

authCode = authCode.replace(
  /const res = await loginAction\(identifier, pinCode, allowedRole\);/,
  `const res = await loginAction(identifier, pinCode, allowedRole, shopSlug);`
);

fs.writeFileSync(authPath, authCode);
console.log("auth.ts updated");
