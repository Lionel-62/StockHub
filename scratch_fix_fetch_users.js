const fs = require('fs');
let code = fs.readFileSync('src/hooks/auth.ts', 'utf8');

code = code.replace(
  /const fetchUsers = async \(\) => \{[\s\S]*?setIsLoaded\(true\);\n  \};/,
  `const fetchUsers = async () => {
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
    setIsLoaded(true);
  };`
);

fs.writeFileSync('src/hooks/auth.ts', code);
console.log('Fixed fetchUsers in auth.ts');
