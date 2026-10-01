const fs = require('fs');

const files = [
  'src/app/b/[shopId]/page.tsx',
  'src/app/(dashboard_digital)/dashboard_digital/equipe/page.tsx',
  'src/app/(dashboard_digital)/dashboard_digital/produits/page.tsx',
  'src/app/(dashboard_digital)/dashboard_digital/parametres/page.tsx',
  'src/app/(dashboard_digital)/dashboard_digital/abonnement/page.tsx',
  'src/app/(dashboard_digital)/dashboard_digital/boutique/page.tsx',
  'src/app/(dashboard_digital)/dashboard_digital/factures/[id]/page.tsx',
  'src/app/(dashboard_digital)/dashboard_digital/factures/nouvelle/page.tsx',
  'src/app/(dashboard)/dashboard/produits/page.tsx',
  'src/app/(dashboard)/dashboard/factures/[id]/page.tsx',
  'src/app/(dashboard)/dashboard/factures/nouvelle/page.tsx',
  'src/app/(dashboard)/dashboard/parametres/page.tsx',
  'src/app/(dashboard)/dashboard/equipe/page.tsx',
  'src/app/(dashboard)/dashboard/abonnement/page.tsx',
  'src/app/(dashboard)/dashboard/boutique/page.tsx'
];

for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('alert(')) {
    if (!content.includes('sonner')) {
      let lines = content.split('\n');
      if (lines[0].includes('use client')) {
        lines.splice(1, 0, 'import { toast } from "sonner";');
      } else {
        lines.unshift('import { toast } from "sonner";');
      }
      content = lines.join('\n');
    } else if (!content.includes('toast')) {
      content = content.replace(/import \{.*\} from "sonner";/, 'import { toast } from "sonner";');
    }
    
    // Replace all alert occurrences
    content = content.replace(/alert\("Aucun produit à exporter\."\);/g, 'toast.error("Aucun produit à exporter.");');
    content = content.replace(/alert\("Veuillez sélectionner un client\."\);/g, 'toast.error("Veuillez sélectionner un client.");');
    content = content.replace(/alert\("Erreur: " \+ res\.error\);/g, 'toast.error("Erreur: " + res.error);');
    content = content.replace(/alert\("Veuillez renseigner le nom\."\);/g, 'toast.error("Veuillez renseigner le nom.");');
    content = content.replace(/alert\(error\.message \|\| "Une erreur est survenue"\);/g, 'toast.error(error.message || "Une erreur est survenue");');
    content = content.replace(/alert\("Les accès ont été copiés dans le presse-papier ! Vous pouvez les coller dans un message\."\);/g, 'toast.success("Les accès ont été copiés dans le presse-papier ! Vous pouvez les coller dans un message.");');
    content = content.replace(/alert\("Erreur lors de la copie\. Voici les informations :\\n" \+ message\);/g, 'toast.error("Erreur lors de la copie. Voici les informations :\\n" + message);');
    content = content.replace(/alert\("Lien de connexion copié dans le presse-papier !"\);/g, 'toast.success("Lien de connexion copié dans le presse-papier !");');
    content = content.replace(/alert\("Lien de connexion copié !"\);/g, 'toast.success("Lien de connexion copié !");');
    content = content.replace(/alert\(`Redirection vers SASPay en cours pour payer \$\{amount\} FCFA \(\$\{planName\}\)\.\.\.`\);/g, 'toast.info(`Redirection vers SASPay en cours pour payer ${amount} FCFA (${planName})...`);');
    content = content.replace(/alert\("Lien copié dans le presse-papier !"\);/g, 'toast.success("Lien copié dans le presse-papier !");');
    content = content.replace(/alert\(`Ce devis a été converti avec succès en Facture officielle : \$\{newInvoiceNumber\} !`\);/g, 'toast.success(`Ce devis a été converti avec succès en Facture officielle : ${newInvoiceNumber} !`);');
    content = content.replace(/alert\("Erreur lors de la conversion\."\);/g, 'toast.error("Erreur lors de la conversion.");');
    content = content.replace(/alert\(error\.message\);/g, 'toast.error(error.message);');
    content = content.replace(/alert\("Veuillez entrer votre nom\."\);/g, 'toast.error("Veuillez entrer votre nom.");');
    content = content.replace(/alert\("Veuillez remplir les champs obligatoires\."\);/g, 'toast.error("Veuillez remplir les champs obligatoires.");');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed " + file);
  }
}
