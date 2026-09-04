const fs = require('fs');

let authActionsPath = 'src/app/actions/auth.actions.ts';
let code = fs.readFileSync(authActionsPath, 'utf8');

code = code.replace(
  /export async function loginAction\(identifier: string, pinCode: string, allowedRole\?: "owner" \| "employee"\) \{[\s\S]*?const { data, error } = await supabase\.rpc\('verify_pin_login', \{\n    p_identifier: identifier,\n    p_pin_code: pinCode,\n  \}\);\n\n  const userRecord = data\?\.\[0\];/,
  `export async function loginAction(identifier: string, pinCode: string, allowedRole?: "owner" | "employee", shopSlug?: string) {
  const rateLimit = checkRateLimit(identifier);
  if (!rateLimit.allowed) {
    return { success: false, error: \`Trop de tentatives. Veuillez réessayer dans \${rateLimit.retryAfter} secondes.\` };
  }

  const supabase = createAdminClient();
  
  let query = supabase
    .from('profiles')
    .select('*, shops!inner(slug, name)')
    .eq('identifier', identifier)
    .eq('pin_code', pinCode);
    
  if (allowedRole === "employee" && shopSlug) {
    query = query.eq('shops.slug', shopSlug);
  }

  const { data, error } = await query.single();
  const userRecord = data;`
);

code = code.replace(
  /shopSlug: userRecord\.shop_slug,/,
  `shopSlug: userRecord.shops?.slug || userRecord.shop_slug,`
);

code = code.replace(
  /shopName: userRecord\.shop_name,/,
  `shopName: userRecord.shops?.name || userRecord.shop_name,`
);

fs.writeFileSync(authActionsPath, code);
console.log("auth.actions.ts updated");
