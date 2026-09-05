"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { Store, FileText, Phone, ArrowRight, ArrowLeft, CheckCircle2, ShoppingBag, Utensils, Smartphone, Monitor, Wrench, Package } from "lucide-react";
import { createShopAction } from "@/app/actions/auth.actions";

const CATEGORIES = [
  { id: "vetements", label: "Vêtements & Mode", icon: <ShoppingBag className="w-6 h-6" /> },
  { id: "electronique", label: "Électronique & Tech", icon: <Smartphone className="w-6 h-6" /> },
  { id: "alimentation", label: "Alimentation & Restauration", icon: <Utensils className="w-6 h-6" /> },
  { id: "informatique", label: "Informatique", icon: <Monitor className="w-6 h-6" /> },
  { id: "services", label: "Services", icon: <Wrench className="w-6 h-6" /> },
  { id: "autre", label: "Autre / Général", icon: <Package className="w-6 h-6" /> },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, isLoaded } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState("");
  
  const [shopName, setShopName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isLoaded && currentUser && currentUser.onboardingCompleted) {
      // If user already finished onboarding, they shouldn't be here
      router.push("/dashboard");
    } else if (isLoaded && !currentUser) {
      router.push("/login");
    }
  }, [isLoaded, currentUser, router]);

  if (!isLoaded || !currentUser || currentUser.onboardingCompleted) {
    return null; // Or a loader
  }

  const handleNextStep = () => {
    if (!category) {
      setError("Veuillez choisir une catégorie pour continuer.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !whatsapp) {
      setError("Veuillez remplir les champs obligatoires (*)");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await createShopAction(currentUser.id, shopName, category, whatsapp, description);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la boutique.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 selection:bg-[#0d9488] selection:text-white">
      {/* Background shapes */}
      <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-[#161726] to-[#f8fafc] -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[150%] bg-[#25273b] rotate-12 opacity-30 blur-3xl"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[30%] h-[150%] bg-[#0d9488] rotate-[-15deg] opacity-20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-2xl overflow-hidden mt-8 transition-all relative z-10">
        
        {/* Header */}
        <div className="bg-[#161726] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0d9488] rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
          
          <h1 className="text-3xl font-extrabold tracking-tight relative z-10">
            {success ? "Boutique créée !" : "Bienvenue sur StockHub !"}
          </h1>
          <p className="text-slate-300 mt-2 font-medium relative z-10 text-sm">
            {success 
              ? "Préparation de votre tableau de bord..." 
              : "Paramétrons votre espace en deux petites étapes."}
          </p>
          
          {!success && (
            <div className="mt-8 flex items-center gap-3 relative z-10">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-[#0d9488] transition-all duration-500 rounded-full ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
              </div>
              <span className="text-xs font-bold text-slate-400">Étape {step} sur 2</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl flex items-start border border-red-100">
              <div className="mr-3 mt-0.5">⚠️</div>
              {error}
            </div>
          )}

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 text-[#0d9488]">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Félicitations {currentUser.name} !</h2>
              <p className="text-slate-500 text-center">Votre boutique est prête. Vous allez être redirigé vers votre tableau de bord.</p>
            </div>
          ) : step === 1 ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Quelle est votre activité principale ?
                </h2>
                <p className="text-slate-500 text-sm mt-1">Cela nous permet d'adapter l'expérience à vos besoins.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setError(""); }}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                      category === cat.id 
                        ? "border-[#0d9488] bg-teal-50/50 text-[#0d9488] shadow-sm scale-105" 
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className={`mb-3 ${category === cat.id ? 'text-[#0d9488]' : 'text-slate-400'}`}>
                      {cat.icon}
                    </div>
                    <span className="text-sm font-semibold text-center">{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-8 border-t border-slate-100 pt-6">
                <Button 
                  onClick={handleNextStep}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-xl font-semibold flex items-center gap-2"
                >
                  Continuer <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Détails de la boutique</h2>
                  <p className="text-slate-500 text-sm">Dernière étape avant d'accéder au tableau de bord.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Store size={16} className="text-[#0d9488]" />
                    Nom de votre boutique <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]/50 outline-none transition-all text-sm shadow-sm"
                    placeholder="Ex: L'Élégance Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-[#0d9488]" />
                    Numéro WhatsApp (pour les commandes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]/50 outline-none transition-all text-sm shadow-sm"
                    placeholder="+225 01 02 03 04 05"
                  />
                  <p className="text-xs text-slate-500 mt-1.5 ml-1">Ce numéro servira à recevoir les commandes de vos clients.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-[#0d9488]" />
                    Petite description (Optionnel)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]/50 outline-none transition-all text-sm shadow-sm resize-none"
                    placeholder="Vente de vêtements pour hommes et femmes..."
                  />
                </div>
              </div>

              <div className="flex mt-10 border-t border-slate-100 pt-6">
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white py-6 rounded-xl font-bold text-base shadow-lg shadow-teal-500/20"
                >
                  {isLoading ? "Création en cours..." : "Créer ma boutique et commencer"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
