const fs = require('fs');
const path = require('path');

// 1. Créer LogoLoader
const loaderCode = `import React from 'react';

export function LogoLoader({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
      <div className="relative flex flex-col items-center">
        {/* Logo avec effet de pulsation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-100/50 rounded-full animate-ping opacity-75 scale-150"></div>
          <img 
            src="/logo.png" 
            alt="StockHub Logo" 
            className="relative h-16 sm:h-20 w-auto object-contain z-10 drop-shadow-md" 
          />
        </div>
        
        {/* Petit spinner et texte */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}
`;

fs.mkdirSync('src/components/ui', { recursive: true });
fs.writeFileSync('src/components/ui/logo-loader.tsx', loaderCode);
console.log("LogoLoader created");

// 2. Remplacer les loaders existants
let authGuard = fs.readFileSync('src/components/dashboard/auth-guard.tsx', 'utf8');
authGuard = authGuard.replace(
  /return \(\n      <div className="min-h-screen flex items-center justify-center bg-slate-50">\n        <div className="flex flex-col items-center">\n          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"><\/div>\n          <p className="text-slate-500 font-medium">Chargement de votre session...<\/p>\n        <\/div>\n      <\/div>\n    \);/,
  `return (\n      <div className="min-h-screen flex items-center justify-center bg-slate-50">\n        <LogoLoader message="Chargement de votre session..." />\n      </div>\n    );`
);
if (!authGuard.includes("LogoLoader")) {
    authGuard = `import { LogoLoader } from "@/components/ui/logo-loader";\n` + authGuard;
}
fs.writeFileSync('src/components/dashboard/auth-guard.tsx', authGuard);
console.log("AuthGuard updated");

let empLogin = fs.readFileSync('src/app/(employe)/employe/[shopSlug]/login/page.tsx', 'utf8');
empLogin = empLogin.replace(
  /return \(\n      <div className="min-h-\[calc\(100vh-4rem\)\] bg-slate-50 flex items-center justify-center">\n        <div className="flex flex-col items-center">\n          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"><\/div>\n          <p className="text-slate-500 font-medium">Chargement de l'espace vendeur...<\/p>\n        <\/div>\n      <\/div>\n    \);/,
  `return (\n      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">\n        <LogoLoader message="Chargement de l'espace vendeur..." />\n      </div>\n    );`
);
if (!empLogin.includes("LogoLoader")) {
    empLogin = empLogin.replace(/import \{ Button \} from "@\/components\/ui\/button";/, `import { Button } from "@/components/ui/button";\nimport { LogoLoader } from "@/components/ui/logo-loader";`);
}
// Enlarge logo
empLogin = empLogin.replace(/className="h-10 sm:h-12 w-auto object-contain mx-auto mb-4"/, 'className="h-14 sm:h-16 w-auto object-contain mx-auto mb-6"');
fs.writeFileSync('src/app/(employe)/employe/[shopSlug]/login/page.tsx', empLogin);
console.log("EmployeLogin updated");

let login = fs.readFileSync('src/app/login/page.tsx', 'utf8');
login = login.replace(/if \(!isLoaded || currentUser\) return null;/, `if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LogoLoader message="Préparation de l'interface..." />
      </div>
    );
  }
  
  if (currentUser) return null;`);
if (!login.includes("LogoLoader")) {
    login = login.replace(/import \{ Button \} from "@\/components\/ui\/button";/, `import { Button } from "@/components/ui/button";\nimport { LogoLoader } from "@/components/ui/logo-loader";`);
}
// Enlarge logo
login = login.replace(/className="h-10 sm:h-12 w-auto object-contain mx-auto mb-2"/, 'className="h-14 sm:h-16 w-auto object-contain mx-auto mb-4"');
fs.writeFileSync('src/app/login/page.tsx', login);
console.log("Login updated");

let sidebar = fs.readFileSync('src/components/dashboard/sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/className="h-8 w-auto"/, 'className="h-10 w-auto"');
fs.writeFileSync('src/components/dashboard/sidebar.tsx', sidebar);
console.log("Sidebar updated");

let topbar = fs.readFileSync('src/components/dashboard/topbar.tsx', 'utf8');
topbar = topbar.replace(/className="h-7 w-auto"/, 'className="h-9 w-auto"');
fs.writeFileSync('src/components/dashboard/topbar.tsx', topbar);
console.log("Topbar updated");

let header = fs.readFileSync('src/components/landing/header.tsx', 'utf8');
header = header.replace(/className="h-10 sm:h-12 w-auto object-contain"/, 'className="h-12 sm:h-14 w-auto object-contain"');
fs.writeFileSync('src/components/landing/header.tsx', header);
console.log("Header updated");

let footer = fs.readFileSync('src/components/landing/footer.tsx', 'utf8');
footer = footer.replace(/className="h-12 sm:h-14 w-auto object-contain"/, 'className="h-14 sm:h-16 w-auto object-contain"');
fs.writeFileSync('src/components/landing/footer.tsx', footer);
console.log("Footer updated");
