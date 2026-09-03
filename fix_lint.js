const fs = require('fs');
const path = require('path');

const filesToFix = {
  'src/components/dashboard/topbar.tsx': [
    { search: "d'affichage", replace: "d&apos;affichage" }
  ],
  'src/components/landing/features.tsx': [
    { search: "d'outils", replace: "d&apos;outils" },
    { search: "d'achat", replace: "d&apos;achat" },
    { search: "\"Bonjour ! Commande", replace: "&quot;Bonjour ! Commande" },
    { search: "Orange Money.\"", replace: "Orange Money.&quot;" }
  ],
  'src/components/landing/final-cta.tsx': [
    { search: "d'essai", replace: "d&apos;essai" }
  ],
  'src/components/landing/footer.tsx': [
    { search: "d'Afrique", replace: "d&apos;Afrique" },
    { search: "d'affichage", replace: "d&apos;affichage" },
    { search: "d'aide", replace: "d&apos;aide" }
  ],
  'src/components/landing/how-it-works.tsx': [
    { search: "d'être", replace: "d&apos;être" },
    { search: "d'un", replace: "d&apos;un" }
  ],
  'src/components/landing/pricing.tsx': [
    { search: "l'offre", replace: "l&apos;offre" },
    { search: "d'essai", replace: "d&apos;essai" },
    { search: "d'image", replace: "d&apos;image" }
  ],
  'src/components/landing/problem.tsx': [
    { search: "d'argent", replace: "d&apos;argent" },
    { search: "d'Afrique", replace: "d&apos;Afrique" },
    { search: "d'inventaires", replace: "d&apos;inventaires" },
    { search: "\"prix svp\"", replace: "&quot;prix svp&quot;" }
  ],
  'src/components/landing/testimonials.tsx': [
    { search: "d'Ivoire", replace: "d&apos;Ivoire" },
    { search: "\"Avant", replace: "&quot;Avant" },
    { search: "la nuit !\"", replace: "la nuit !&quot;" },
    { search: "\"Mes 3", replace: "&quot;Mes 3" },
    { search: "ultra-réactif.\"", replace: "ultra-réactif.&quot;" },
    { search: "\"Je n'avais", replace: "&quot;Je n&apos;avais" },
    { search: "2 mois !\"", replace: "2 mois !&quot;" }
  ]
};

Object.keys(filesToFix).forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    filesToFix[file].forEach(repl => {
      content = content.replace(repl.search, repl.replace);
    });
    fs.writeFileSync(fullPath, content, 'utf8');
  }
});
