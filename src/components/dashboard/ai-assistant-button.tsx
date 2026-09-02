"use client";

import { useState } from "react";
import { Sparkles, X, Mic, Search } from "lucide-react";

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  const exampleQuestions = [
    "Combien j'ai vendu aujourd'hui ?",
    "Quels produits sont bientôt en rupture ?",
    "Qui me doit de l'argent ?",
    "Combien de devis ce mois-ci ?",
    "Comment ajouter un employé ?"
  ];

  return (
    <>
      {/* Bouton flottant */}
      <button 
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0b213f] to-blue-800 text-white font-semibold rounded-full shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-105 active:scale-95 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={20} className="animate-pulse" />
        <span className="hidden sm:inline">Assistant IA</span>
      </button>

      {/* Interface de Chat IA */}
      <div 
        className={`fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b213f] to-blue-800 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Sparkles size={22} className="text-blue-200" />
            Assistant IA
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corps - Exemples de questions */}
        <div className="p-6 bg-slate-50 min-h-[300px]">
          <h3 className="text-xs font-bold text-slate-400 mb-4 tracking-wider uppercase">
            Exemples de questions :
          </h3>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((q, i) => (
              <button 
                key={i}
                className="text-left px-4 py-2.5 bg-white border border-blue-100 text-slate-700 text-sm rounded-full shadow-sm hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                onClick={() => alert(`L'IA va répondre à : "${q}"`)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Footer - Input */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Posez votre question..." 
              className="w-full pl-4 pr-4 py-3 bg-white border-2 border-blue-100 rounded-full text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400"
            />
          </div>
          <button className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors">
            <Mic size={20} />
          </button>
          <button className="p-3 bg-[#0b213f] hover:bg-blue-800 text-white rounded-full transition-colors shadow-md">
            <Search size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
