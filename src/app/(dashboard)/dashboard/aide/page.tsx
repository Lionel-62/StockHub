"use client";

import { LifeBuoy, BookOpen, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HelpSupportPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LifeBuoy size={32} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Comment pouvons-nous vous aider ?</h1>
        <p className="text-slate-500 mt-2">Trouvez des réponses rapidement ou contactez notre équipe d'assistance.</p>
        
        <div className="mt-6">
          <input 
            type="text" 
            placeholder="Rechercher dans l'aide..." 
            className="w-full max-w-md mx-auto p-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <Card className="shadow-sm border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group">
          <CardContent className="p-6 text-center space-y-3">
            <div className="h-12 w-12 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors rounded-xl flex items-center justify-center mx-auto">
              <BookOpen size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Documentation</h3>
            <p className="text-sm text-slate-500">Guides complets sur l'utilisation de StockHub.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group">
          <CardContent className="p-6 text-center space-y-3">
            <div className="h-12 w-12 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors rounded-xl flex items-center justify-center mx-auto">
              <MessageCircle size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Chat en direct</h3>
            <p className="text-sm text-slate-500">Discutez avec notre équipe de support technique.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group">
          <CardContent className="p-6 text-center space-y-3">
            <div className="h-12 w-12 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors rounded-xl flex items-center justify-center mx-auto">
              <Mail size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Nous écrire</h3>
            <p className="text-sm text-slate-500">Envoyez-nous un email à support@stockhub.com.</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12 bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
        <h3 className="font-bold text-slate-900 mb-2">Besoin d'une formation personnalisée ?</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">Notre équipe peut organiser une session vidéo pour former votre personnel à l'outil.</p>
        <Button className="bg-[#0b213f] hover:bg-[#18355c] text-white">Prendre rendez-vous</Button>
      </div>
    </div>
  );
}
