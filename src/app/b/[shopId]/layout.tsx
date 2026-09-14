import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }: { params: { shopId: string } }): Promise<Metadata> {
  const supabase = createAdminClient();
  
  const { data: shop } = await supabase
    .from('shops')
    .select('name, theme')
    .eq('id', params.shopId)
    .single();

  const shopName = shop?.name || "Boutique";
  const title = `${shopName} | Boutique en ligne`;
  const description = `Découvrez le catalogue et commandez en ligne sur ${shopName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: shopName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
