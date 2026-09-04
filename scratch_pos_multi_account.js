const fs = require('fs');

// 1. Update employe/login/page.tsx
let employeLoginPath = 'src/app/(employe)/employe/login/page.tsx';
let employeLoginCode = fs.readFileSync(employeLoginPath, 'utf8');

employeLoginCode = employeLoginCode.replace(
  /\} else if \(currentUser\.role === "owner"\) \{\n        router\.push\("\/dashboard"\); \/\/ Redirige le gérant vers son tableau de bord\n      \}/g,
  `}`
);
fs.writeFileSync(employeLoginPath, employeLoginCode);


// 2. Update auth.ts
let authPath = 'src/hooks/auth.ts';
let authCode = fs.readFileSync(authPath, 'utf8');

authCode = authCode.replace(
  /const logout = async \(\) => \{\n    setCurrentUser\(null\);\n    localStorage\.removeItem\("stockhub_session"\);\n    await logoutAction\(\);\n    await supabase\.auth\.signOut\(\);\n  \};/g,
  `const logout = async () => {
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
  };`
);
fs.writeFileSync(authPath, authCode);

console.log('Bypassed! POS Multi-account mode enabled.');
