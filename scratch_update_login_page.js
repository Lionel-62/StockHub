const fs = require('fs');

let pagePath = 'src/app/(employe)/employe/[shopSlug]/login/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Update function signature
pageCode = pageCode.replace(
  /export default function EmployeLoginPage\(\) \{/,
  `export default function EmployeLoginPage({ params }: { params: { shopSlug: string } }) {`
);

// Add shopSlug to login call
pageCode = pageCode.replace(
  /const result = await login\(identifier, pinCode, "employee"\);/,
  `const result = await login(identifier, pinCode, "employee", params.shopSlug);`
);

// Add fetching shop name logic
pageCode = pageCode.replace(
  /const router = useRouter\(\);\n  const \{ login, currentUser, isLoaded \} = useAuth\(\);/,
  `const router = useRouter();
  const { login, currentUser, isLoaded } = useAuth();
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    // Fetch shop name for display
    const fetchShopName = async () => {
      try {
        const res = await fetch(\`/api/shop/\${params.shopSlug}\`);
        if (res.ok) {
          const data = await res.json();
          setShopName(data.name);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchShopName();
  }, [params.shopSlug]);`
);

// Update title display
pageCode = pageCode.replace(
  /<h1 className="text-2xl font-bold text-slate-800">Espace Vendeur<\/h1>/,
  `<h1 className="text-2xl font-bold text-slate-800">Espace Vendeur</h1>
          {shopName && <div className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">{shopName}</div>}`
);

fs.writeFileSync(pagePath, pageCode);
console.log("page updated");
