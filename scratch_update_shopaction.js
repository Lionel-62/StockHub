const fs = require('fs');

let shopActionsPath = 'src/app/actions/shop.actions.ts';
let code = fs.readFileSync(shopActionsPath, 'utf8');

const newAction = `
export async function getShopBySlugAction(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return { success: false, error: 'Boutique introuvable' };
  }
  
  return { success: true, data };
}
`;

fs.writeFileSync(shopActionsPath, code + newAction);
console.log("shop.actions.ts updated");
