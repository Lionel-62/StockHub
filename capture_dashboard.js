const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');

(async () => {
  console.log('Finding Chrome path...');
  const chromePath = chromeLauncher.Launcher.getInstallations()[0];
  if (!chromePath) {
    console.error('No Chrome installation found');
    process.exit(1);
  }
  
  console.log('Launching browser with path:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 },
    args: ['--disable-web-security'] // Allow intercepting cross-origin
  });

  const page = await browser.newPage();
  
  console.log('Setting auth storage and fake data...');
  await page.goto('http://localhost:3000');
  
  const fakeSession = {
    id: "fake-id",
    name: "Patron StockHub",
    identifier: "patron",
    pinCode: "0000",
    role: "owner",
    shopId: "shop_123",
    shopSlug: "shop-demo",
    shopName: "Boutique Démo",
    permissions: { canViewDashboard: true },
    createdAt: new Date().toISOString()
  };

  const fakeProducts = [
    {
      id: "p1", sku: "ROBE-01", name: "Robe Wax Royale", category: "Vêtements",
      purchasePrice: 15000, salePrice: 22000, stock: 45, status: "En stock", shop_id: "shop_123"
    },
    {
      id: "p2", sku: "SAC-01", name: "Sac Artisanal Cuir", category: "Accessoires",
      purchasePrice: 10000, salePrice: 18500, stock: 12, status: "En stock", shop_id: "shop_123"
    },
    {
      id: "p3", sku: "CHAUSS-01", name: "Chaussures Cuir", category: "Chaussures",
      purchasePrice: 20000, salePrice: 35000, stock: 0, status: "Rupture", shop_id: "shop_123"
    }
  ];

  const fakeOrders = [
    {
      id: "ord1", order_number: "CMD-001", date: new Date().toISOString(), status: "Livrée",
      total_amount: 145000, payment_method: "Wave", shop_id: "shop_123", source: "En ligne",
      client_name: "Awa Diop"
    },
    {
      id: "ord2", order_number: "CMD-002", date: new Date().toISOString(), status: "Payée",
      total_amount: 250000, payment_method: "Espèces", shop_id: "shop_123", source: "Sur place",
      client_name: "Client Anonyme"
    },
    {
      id: "ord3", order_number: "CMD-003", date: new Date().toISOString(), status: "En attente",
      total_amount: 450000, payment_method: "Orange Money", shop_id: "shop_123", source: "En ligne",
      client_name: "Fatou Sall"
    }
  ];

  const fakeClients = [
    { id: "c1", name: "Awa Diop", phone: "01020304" }
  ];

  await page.evaluate((sessionStr) => {
    localStorage.setItem('stockhub_session', sessionStr);
  }, JSON.stringify(fakeSession));

  // Intercept Supabase requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('supabase.co/rest/v1/orders')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeOrders)
      });
    } else if (url.includes('supabase.co/rest/v1/products')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeProducts)
      });
    } else if (url.includes('supabase.co/rest/v1/clients')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeClients)
      });
    } else {
      request.continue();
    }
  });

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });

  // Add a small delay for animations and charts
  await new Promise(r => setTimeout(r, 2000));

  console.log('Taking screenshot...');
  await page.screenshot({ path: 'public/dashboard-preview.png' });

  console.log('Closing browser...');
  await browser.close();
  console.log('Done!');
})();
