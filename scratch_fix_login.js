const fs = require('fs');
let code = fs.readFileSync('src/hooks/auth.ts', 'utf8');

const newLoginLogout = `  const login = async (identifier: string, pinCode: string, allowedRole?: "owner" | "employee") => {
    const res = await loginAction(identifier, pinCode, allowedRole);
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
    setCurrentUser(null);
    localStorage.removeItem("stockhub_session");
    await logoutAction();
    await supabase.auth.signOut();
  };`;

code = code.replace(/const login = async \([^)]*\) => {[\s\S]*?(?=const addUser = async)/, newLoginLogout + '\n\n');
fs.writeFileSync('src/hooks/auth.ts', code);
console.log('Fixed login and logout');
