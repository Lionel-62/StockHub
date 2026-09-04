const fs = require('fs');

let equipePath = 'src/app/(dashboard)/dashboard/equipe/page.tsx';
let equipeCode = fs.readFileSync(equipePath, 'utf8');

equipeCode = equipeCode.replace(
  /const loginUrl = \`\$\{window\.location\.origin\}\/employe\/login\`;/,
  `const loginUrl = \`\$\{window.location.origin\}/employe/\$\{currentUser?.shopSlug\}/login\`;`
);

fs.writeFileSync(equipePath, equipeCode);
console.log("equipe page updated");
