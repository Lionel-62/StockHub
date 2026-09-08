import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: 'Mentions Légales - StockHub',
  description: 'Mentions légales de StockHub',
};

export default function MentionsLegales() {
  return (
    <div className="bg-[#fcfdfe] text-slate-800 font-sans min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">MENTIONS LÉGALES</h1>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Éditeur du site</h2>
            <p>Le site monstockhub.com est édité par StockHub.</p>
            <p>Responsable de la publication : Lionel Godjo.</p>
            <p>Contact : lgodjo62@gmail.com — WhatsApp : +229 01 62 57 93 94</p>
            <p>Localisation : Porto-Novo, Bénin.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Hébergement</h2>
            <p>Le site est hébergé par Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA).</p>
            <p>La base de données et l'authentification sont fournies par Supabase.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Propriété intellectuelle</h2>
            <p>L'ensemble des éléments du site (marque StockHub, logo, textes, visuels, code) est la propriété de StockHub, sauf mention contraire. Toute reproduction sans autorisation est interdite.</p>
          </section>

          <section>
            <p className="font-semibold">Contact : lgodjo62@gmail.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
