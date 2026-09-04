const fs = require('fs');

let pagePath = 'src/app/(employe)/employe/[shopSlug]/login/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Ensure import for getShopBySlugAction
if (!pageCode.includes('getShopBySlugAction')) {
  pageCode = pageCode.replace(
    /import \{ useAuth \} from "@\/hooks\/auth";/,
    `import { useAuth } from "@/hooks/auth";\nimport { getShopBySlugAction } from "@/app/actions/shop.actions";`
  );
}

// Replace the fetch call with server action call
pageCode = pageCode.replace(
  /const res = await fetch\(`\/api\/shop\/\$\{params\.shopSlug\}`\);\n        if \(res\.ok\) \{\n          const data = await res\.json\(\);\n          setShopName\(data\.name\);\n        \}/,
  `const res = await getShopBySlugAction(params.shopSlug);\n        if (res.success && res.data) {\n          setShopName(res.data.name);\n        }`
);

fs.writeFileSync(pagePath, pageCode);
console.log("page updated with server action");
