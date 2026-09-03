export default function PublicShopPage({ params }: { params: { shopId: string } }) {
  const [shopUuid, setShopUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShopId() {
      const { data, error } = await supabase
        .from('shops')
        .select('id')
        .eq('slug', params.shopId)
        .single();
        
      if (data && !error) {
        setShopUuid(data.id);
      }
      setLoading(false);
    }
    fetchShopId();
  }, [params.shopId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!shopUuid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
        <div>
          <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl">🏪</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Boutique introuvable</h1>
          <p className="text-slate-500 mt-2">L'adresse que vous avez saisie ne correspond à aucune boutique active.</p>
        </div>
      </div>
    );
  }

  return <ShopContent shopUuid={shopUuid} />;
}
