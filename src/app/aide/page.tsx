import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AidePage() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-[#06101e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#0a192f] p-8 rounded-xl shadow-sm">
        <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Centre d'Aide</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">Comment pouvons-nous vous aider aujourd'hui ?</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Support WhatsApp</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Une réponse rapide par message.</p>
              <Button variant="outline" className="mt-auto">Nous écrire</Button>
            </div>
            
            <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Support Email</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Pour les requêtes détaillées.</p>
              <Button variant="outline" className="mt-auto">Envoyer un email</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
