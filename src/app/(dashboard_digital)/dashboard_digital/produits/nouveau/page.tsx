"use client";

import { useAuth } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  FileText, GraduationCap, Key, Layers, Presentation, Briefcase, Users,
  Zap, FileBadge, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SelectProductTypePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  // You can still use the themeColor
  const themeColor = currentUser?.themeColor || '#0b213f'; 
  
  const [selectedType, setSelectedType] = useState<string>("Fichiers");

  const productTypes = [
    { id: "Fichiers", label: "Fichiers", icon: FileText, color: "#0d8f76", isNew: false, active: true },
    { id: "Formations", label: "Formations", icon: GraduationCap, color: "#3B82F6", isNew: false, active: false },
    { id: "Licences", label: "Licences", icon: Key, color: "#8B5CF6", isNew: true, active: false },
    { id: "Bundles", label: "Bundles", icon: Layers, color: "#10B981", isNew: true, active: false },
    { id: "Coaching", label: "Coaching", icon: Presentation, color: "#14B8A6", isNew: true, active: false },
    { id: "Services", label: "Services", icon: Briefcase, color: "#334155", isNew: false, active: false },
    { id: "Communaute", label: "Communauté", icon: Users, color: "#EF4444", isNew: true, active: false },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      
      <div className="flex flex-col items-center">
        <h1 className="text-xl md:text-2xl font-medium text-slate-800 mb-10 text-center">
          Quel type de produit désirez-vous créer ?
        </h1>

        <div className="w-full max-w-2xl">
          {/* Grid of types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {productTypes.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => type.active ? setSelectedType(type.id) : null}
                  className={`relative flex items-center p-3 rounded-xl bg-white border-2 text-left transition-all ${
                    isSelected 
                      ? "border-yellow-400 shadow-sm" 
                      : "border-slate-200 hover:border-slate-300"
                  } ${!type.active ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {type.isNew && (
                    <span className="absolute -top-2.5 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                      Nouveau
                    </span>
                  )}
                  
                  <div className="flex items-center gap-3 w-full">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: type.color }}
                    >
                      <type.icon size={20} className="text-white" />
                    </div>
                    
                    <span className="font-semibold text-sm text-slate-700 flex-1">{type.label}</span>

                    {/* Radio Circle */}
                    <div className="shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-transparent' : 'border-slate-300'
                      }`}
                      style={isSelected ? { backgroundColor: themeColor } : {}}
                      >
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-slate-100 rounded-2xl p-6 md:p-8 mb-6 border border-slate-200/60">
            {selectedType === "Fichiers" && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Fichiers</h2>
                <p className="text-sm text-slate-500 mb-6">
                  E-books, templates, fichiers audio : vos clients téléchargent instantanément après achat.
                </p>
                
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center shrink-0">
                      <Zap size={16} className="text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Livraison automatique</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center shrink-0">
                      <FileBadge size={16} className="text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Tous formats acceptés (PDF, ZIP, MP3, etc.)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} className="text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Protection anti-piratage intégrée</span>
                  </li>
                </ul>
              </div>
            )}
            {selectedType !== "Fichiers" && (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                Bientôt disponible...
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => router.push('/dashboard/produits?type=' + selectedType)}
            disabled={selectedType !== "Fichiers"}
            className="w-full h-12 bg-[#0b213f] hover:bg-[#18355c] text-white font-bold text-base rounded-xl transition-all shadow-sm"
          >
            Continuer
          </Button>

          {/* Help link */}
          <div className="mt-4 text-center">
            <span className="text-xs text-slate-500">
              Besoin d'aide pour choisir ? <Link href="/aide" className="text-blue-600 hover:underline">Consultez notre guide</Link>
            </span>
          </div>
          
        </div>
      </div>
    </div>
  );
}
