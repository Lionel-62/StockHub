"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, FolderOpen, Layout, Hourglass, Smile, Glasses, Palette, Store, ShieldCheck } from "lucide-react";
import { createShopAction } from "@/app/actions/auth.actions";

const COLORS = [
  { id: "yellow", hex: "#FACC15" },
  { id: "green", hex: "#10B981" },
  { id: "orange", hex: "#F97316" },
  { id: "blue", hex: "#3B82F6" },
  { id: "red", hex: "#EF4444" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, isLoaded } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [experience, setExperience] = useState<"debutant" | "experimente" | "">("");
  const [shopType, setShopType] = useState<"digital" | "physique" | "libre" | "">("");
  
  const [shopName, setShopName] = useState("");
  const [themeColor, setThemeColor] = useState("#FACC15");
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  
  // Nouveaux états pour la boutique digitale quand "Mixte" est choisi
  const [shopNameDigital, setShopNameDigital] = useState("");
  const [descriptionDigital, setDescriptionDigital] = useState("");
  
  const [country, setCountry] = useState("Bénin");
  const [countryCode, setCountryCode] = useState("+229");
  const [currency, setCurrency] = useState("FCFA");
  const [whatsapp, setWhatsapp] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [urlType, setUrlType] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isNewShop = searchParams.get("action") === "new-shop";
    const typeParam = searchParams.get("type");
    
    if (typeParam === 'physique' || typeParam === 'digital') {
      setUrlType(typeParam);
      setShopType(typeParam);
    }
    
    if (isLoaded && currentUser && currentUser.onboardingCompleted && !isNewShop) {
      router.push("/dashboard");
    } else if (isLoaded && !currentUser) {
      router.push("/login");
    }
  }, [isLoaded, currentUser, router]);

  if (!isLoaded || !currentUser || (currentUser.onboardingCompleted && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get("action") !== "new-shop")) {
    return null;
  }

  const handleNextStep = () => {
    if (step === 1 && !experience) {
      setError("Veuillez sélectionner votre niveau d'expérience.");
      return;
    }
    if (step === 2 && !shopType) {
      setError("Veuillez choisir un type de produit.");
      return;
    }
    if (step === 3) {
      if (shopType === 'libre') {
        if (!shopName || !description || !shopNameDigital || !descriptionDigital) {
          setError("Veuillez remplir tous les champs obligatoires (*).");
          return;
        }
      } else {
        if (!shopName || !description) {
          setError("Veuillez remplir tous les champs obligatoires (*).");
          return;
        }
      }
    }
    setError("");
    if (step === 1 && urlType) {
      setStep(3);
    } else {
      setStep((prev) => (prev + 1) as any);
    }
  };

  const handlePrevStep = () => {
    setError("");
    if (step === 3 && urlType) {
      setStep(1);
    } else {
      setStep((prev) => (prev - 1) as any);
    }
  };

  const handleSubmit = async () => {
    if (!country || !currency || !whatsapp) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const fullNumber = whatsapp.startsWith("+") ? whatsapp : `${countryCode}${whatsapp.startsWith("0") ? whatsapp.substring(1) : whatsapp}`;
      if (shopType === "libre") {
        // Créer les deux boutiques distinctes
        const resultPhysique = await createShopAction(
          currentUser.id, shopName, "Général", fullNumber, description, country, "", countryCode, themeColor, experience, "physique", currency
        );
        const resultDigital = await createShopAction(
          currentUser.id, shopNameDigital, "Produits Digitaux", fullNumber, descriptionDigital, country, "", countryCode, themeColor, experience, "digital", currency
        );
        
        if (resultPhysique.success && resultDigital.success && resultPhysique.user) {
          // Add the digital shop to myShops so they appear in the dropdown immediately
          const enhancedUser = {
            ...resultPhysique.user,
            myShops: [
              { id: resultPhysique.user.shopId, name: resultPhysique.user.shopName, slug: resultPhysique.user.shopSlug, shop_type: 'physique', theme_color: themeColor, currency: currency },
              { id: resultDigital.user?.shopId, name: resultDigital.user?.shopName, slug: resultDigital.user?.shopSlug, shop_type: 'digital', theme_color: themeColor, currency: currency }
            ]
          };
          localStorage.setItem("stockhub_session", JSON.stringify(enhancedUser));
          setSuccess(true);
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        } else {
          throw new Error("Erreur lors de la création d'une des boutiques.");
        }
      } else {
        const categoryStr = shopType === "digital" ? "Produits Digitaux" : shopType === "physique" ? "Produits Physiques" : "Général";
        const result = await createShopAction(
          currentUser.id, shopName, categoryStr, fullNumber, description, country, "", countryCode, themeColor, experience, shopType, currency
        );
        if (result.success && result.user) {
          localStorage.setItem("stockhub_session", JSON.stringify(result.user));
          setSuccess(true);
          setTimeout(() => {
            if (shopType === "digital") {
              window.location.href = "/dashboard_digital";
            } else {
              window.location.href = "/dashboard";
            }
          }, 1500);
        } else if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            if (shopType === "digital") {
              window.location.href = "/dashboard_digital";
            } else {
              window.location.href = "/dashboard";
            }
          }, 1500);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la boutique.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-slate-50 font-sans">
      
      {/* Left Sidebar (Dark Blue) */}
      <div className="lg:w-[35%] xl:w-[30%] bg-[#0b213f] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Decorative subtle background pattern/glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#0d8f76] rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-6 h-6 text-[#0b213f]" />
            </div>
            <span className="text-2xl font-black tracking-tight">StockHub</span>
          </div>

          {!success && (
            <div className="flex-1 flex flex-col justify-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight">
                Bienvenue,<br /> <span className="text-[#0d8f76]">{currentUser?.name?.split(' ')[0] || 'Partenaire'}</span> !
              </h2>
              <p className="text-slate-300 text-base mb-12 max-w-sm leading-relaxed">
                Configurez votre espace de vente en quelques étapes simples. Nous allons créer une boutique qui vous ressemble.
              </p>

              {/* Stepper */}
              <div className="space-y-6 hidden sm:block">
                {[
                  { num: 1, title: "Expérience", desc: "Votre niveau de vente" },
                  { num: 2, title: "Catalogue", desc: "Type de produits" },
                  { num: 3, title: "Identité", desc: "Nom & description" },
                  { num: 4, title: "Localisation", desc: "Pays & devise" },
                ].map((s) => (
                  <div key={s.num} className={`flex items-start gap-4 transition-all duration-300 ${step === s.num ? "opacity-100" : step > s.num ? "opacity-60" : "opacity-30"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 transition-colors ${
                      step >= s.num ? "bg-[#0d8f76] border-[#0d8f76] text-white" : "border-slate-500 text-slate-400"
                    }`}>
                      {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${step === s.num ? "text-white" : "text-slate-300"}`}>{s.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {success && (
            <div className="flex-1 flex flex-col justify-center mb-10">
              <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                C'est prêt !
              </h2>
              <p className="text-slate-300 text-lg">
                Votre boutique est désormais configurée. Propulsons votre entreprise vers de nouveaux sommets.
              </p>
            </div>
          )}
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium hidden sm:block">
          © {new Date().getFullYear()} StockHub. Tous droits réservés.
        </div>
      </div>

      {/* Right Content (White Form) */}
      <div className="flex-1 bg-white lg:rounded-l-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-10 flex flex-col items-center justify-center p-6 py-12 md:p-12 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col min-h-[60vh] lg:min-h-full justify-center">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl flex items-start border border-red-100 animate-in fade-in">
              <div className="mr-3 mt-0.5">⚠️</div>
              {error}
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center">
            {success ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-500 text-center">
                <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center mb-8 text-[#0d8f76] relative">
                  <div className="absolute inset-0 bg-[#0d8f76] rounded-full opacity-20 animate-ping"></div>
                  <CheckCircle2 className="w-14 h-14 relative z-10" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">Félicitations !</h2>
                <p className="text-gray-500 text-lg max-w-md mx-auto">Votre boutique <span className="font-bold text-gray-900">{shopName}</span> est prête. Vous allez être redirigé vers votre tableau de bord dans quelques secondes.</p>
              </div>
            ) : step === 1 ? (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Quelle est votre expérience ?</h2>
                  <p className="text-gray-500 text-lg">Parlez-nous de votre niveau d'expérience afin que nous puissions adapter l'interface de votre boutique.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
                  <button
                    onClick={() => setExperience("debutant")}
                    className={`group relative flex flex-col p-6 rounded-3xl border-2 transition-all text-left overflow-hidden ${
                      experience === "debutant" 
                        ? "border-[#0d8f76] bg-emerald-50/30 shadow-[0_8px_30px_rgb(13,143,118,0.1)]" 
                        : "border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6 w-full">
                      <div className={`p-3 rounded-2xl transition-colors ${experience === "debutant" ? "bg-[#0d8f76] text-white" : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"}`}>
                        <Smile className="w-6 h-6" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${experience === "debutant" ? 'border-[#0d8f76]' : 'border-gray-300'}`}>
                        {experience === "debutant" && <div className="w-2.5 h-2.5 rounded-full bg-[#0d8f76]"></div>}
                      </div>
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900 text-xl mb-1.5">Je suis débutant</span>
                      <span className="text-sm text-gray-500 font-medium">Je découvre la vente en ligne pour la première fois.</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setExperience("experimente")}
                    className={`group relative flex flex-col p-6 rounded-3xl border-2 transition-all text-left overflow-hidden ${
                      experience === "experimente" 
                        ? "border-[#0d8f76] bg-emerald-50/30 shadow-[0_8px_30px_rgb(13,143,118,0.1)]" 
                        : "border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6 w-full">
                      <div className={`p-3 rounded-2xl transition-colors ${experience === "experimente" ? "bg-[#0d8f76] text-white" : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"}`}>
                        <Glasses className="w-6 h-6" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${experience === "experimente" ? 'border-[#0d8f76]' : 'border-gray-300'}`}>
                        {experience === "experimente" && <div className="w-2.5 h-2.5 rounded-full bg-[#0d8f76]"></div>}
                      </div>
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900 text-xl mb-1.5">Je suis expérimenté</span>
                      <span className="text-sm text-gray-500 font-medium">J'ai déjà géré des boutiques ou vendu en ligne.</span>
                    </div>
                  </button>
                </div>

                <div className="flex justify-end mt-auto pt-8 border-t border-gray-100">
                  <Button onClick={handleNextStep} className="bg-[#0b213f] hover:bg-blue-950 text-white px-10 py-7 rounded-2xl font-bold text-base shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1">
                    Continuer <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            ) : step === 2 ? (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Que proposerez-vous ?</h2>
                  <p className="text-gray-500 text-lg">Choisissez la catégorie principale de vos produits pour optimiser votre catalogue.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
                  <button
                    onClick={() => setShopType("digital")}
                    className={`group relative flex flex-col p-6 rounded-3xl border-2 transition-all text-left overflow-hidden ${
                      shopType === "digital" ? "border-[#0d8f76] bg-emerald-50/30 shadow-[0_8px_30px_rgb(13,143,118,0.1)]" : "border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6 w-full">
                      <div className={`p-2.5 rounded-xl transition-colors ${shopType === "digital" ? "bg-[#0d8f76] text-white" : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"}`}>
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${shopType === "digital" ? 'border-[#0d8f76]' : 'border-gray-300'}`}>
                        {shopType === "digital" && <div className="w-2.5 h-2.5 rounded-full bg-[#0d8f76]"></div>}
                      </div>
                    </div>
                    <span className="block font-bold text-gray-900 text-lg mb-2">Produits digitaux</span>
                    <span className="text-xs text-gray-500 font-medium leading-relaxed">Vendez e-books, cours, logiciels et fichiers téléchargeables.</span>
                  </button>

                  <button
                    onClick={() => setShopType("physique")}
                    className={`group relative flex flex-col p-6 rounded-3xl border-2 transition-all text-left overflow-hidden ${
                      shopType === "physique" ? "border-[#0d8f76] bg-emerald-50/30 shadow-[0_8px_30px_rgb(13,143,118,0.1)]" : "border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6 w-full">
                      <div className={`p-2.5 rounded-xl transition-colors ${shopType === "physique" ? "bg-[#0d8f76] text-white" : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"}`}>
                        <Layout className="w-6 h-6" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${shopType === "physique" ? 'border-[#0d8f76]' : 'border-gray-300'}`}>
                        {shopType === "physique" && <div className="w-2.5 h-2.5 rounded-full bg-[#0d8f76]"></div>}
                      </div>
                    </div>
                    <span className="block font-bold text-gray-900 text-lg mb-2">Produits physiques</span>
                    <span className="text-xs text-gray-500 font-medium leading-relaxed">Vendez des articles matériels, mode, électronique, food...</span>
                  </button>

                  <button
                    onClick={() => setShopType("libre")}
                    className={`group relative flex flex-col p-6 rounded-3xl border-2 transition-all text-left overflow-hidden ${
                      shopType === "libre" ? "border-[#0d8f76] bg-emerald-50/30 shadow-[0_8px_30px_rgb(13,143,118,0.1)]" : "border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6 w-full">
                      <div className={`p-2.5 rounded-xl transition-colors ${shopType === "libre" ? "bg-[#0d8f76] text-white" : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"}`}>
                        <Hourglass className="w-6 h-6" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${shopType === "libre" ? 'border-[#0d8f76]' : 'border-gray-300'}`}>
                        {shopType === "libre" && <div className="w-2.5 h-2.5 rounded-full bg-[#0d8f76]"></div>}
                      </div>
                    </div>
                    <span className="block font-bold text-gray-900 text-lg mb-2">Mixte & Libre</span>
                    <span className="text-xs text-gray-500 font-medium leading-relaxed">Décidez plus tard et ajoutez différents types de produits.</span>
                  </button>
                </div>

                <div className="flex justify-between mt-auto pt-8 border-t border-gray-100">
                  <Button onClick={handlePrevStep} variant="ghost" className="px-6 py-7 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-semibold transition-all">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                  </Button>
                  <Button onClick={handleNextStep} className="bg-[#0b213f] hover:bg-blue-950 text-white px-10 py-7 rounded-2xl font-bold text-base shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1">
                    Continuer <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            ) : step === 3 ? (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Identité visuelle</h2>
                  <p className="text-gray-500 text-lg">Construisons la devanture de votre vitrine numérique.</p>
                </div>
                
                <div className="space-y-6 mb-12 flex-1 overflow-y-auto px-1 custom-scrollbar">
                  {shopType === 'libre' ? (
                    <>
                      <div className="p-5 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm mb-4">
                        <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-[#0d8f76]"/> Espace Physique</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Nom de la boutique <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={shopName}
                              placeholder="Ex: Dova Chop Physique"
                              onChange={(e) => setShopName(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0d8f76]/10 focus:border-[#0d8f76] outline-none transition-all font-medium text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Description <span className="text-red-500">*</span></label>
                            <textarea
                              value={description}
                              placeholder="Que vendez-vous en boutique ?"
                              onChange={(e) => setDescription(e.target.value.substring(0, 150))}
                              rows={2}
                              className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0d8f76]/10 focus:border-[#0d8f76] outline-none transition-all resize-none font-medium text-gray-900"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-white border-2 border-blue-100 rounded-2xl shadow-sm">
                        <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2"><FolderOpen className="w-5 h-5 text-blue-500"/> Espace Digital</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Nom de la vitrine <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={shopNameDigital}
                              placeholder="Ex: Dova Digital"
                              onChange={(e) => setShopNameDigital(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0d8f76]/10 focus:border-[#0d8f76] outline-none transition-all font-medium text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Description <span className="text-red-500">*</span></label>
                            <textarea
                              value={descriptionDigital}
                              placeholder="Que proposez-vous en ligne ?"
                              onChange={(e) => setDescriptionDigital(e.target.value.substring(0, 150))}
                              rows={2}
                              className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0d8f76]/10 focus:border-[#0d8f76] outline-none transition-all resize-none font-medium text-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1">
                          Nom de la boutique <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shopName}
                          placeholder="Ex: Dova Chop, MaBoutique..."
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full px-5 py-4.5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#0d8f76]/10 focus:border-[#0d8f76] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1">
                          Une petite bio ou description <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            value={description}
                            placeholder="Qu'allez-vous proposer à vos clients ?"
                            onChange={(e) => setDescription(e.target.value.substring(0, 150))}
                            rows={3}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#0d8f76]/10 focus:border-[#0d8f76] outline-none transition-all resize-none font-medium text-gray-900 placeholder:text-gray-400"
                          />
                          <div className={`absolute bottom-4 right-4 text-xs font-bold px-2 py-1 rounded-md transition-colors ${description.length >= 140 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                            {description.length}/150
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between mt-auto pt-8 border-t border-gray-100">
                  <Button onClick={handlePrevStep} variant="ghost" className="px-6 py-7 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-semibold transition-all">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                  </Button>
                  <Button onClick={handleNextStep} className="bg-[#0b213f] hover:bg-blue-950 text-white px-10 py-7 rounded-2xl font-bold text-base shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1">
                    Continuer <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Où êtes-vous basé ?</h2>
                  <p className="text-gray-500 text-lg">Dernière étape pour finaliser la configuration de votre espace.</p>
                </div>
                
                <div className="space-y-6 mb-12 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1">Pays d'opération</label>
                      <select
                        value={`${country}|${countryCode}`}
                        onChange={(e) => {
                          const [c, code] = e.target.value.split('|');
                          setCountry(c);
                          setCountryCode(code);
                        }}
                        className="w-full px-5 py-4.5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#0d8f76]/10 focus:border-[#0d8f76] outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                      >
                        <option value="Bénin|+229">🇧🇯 Bénin</option>
                        <option value="Côte d'Ivoire|+225">🇨🇮 Côte d'Ivoire</option>
                        <option value="Sénégal|+221">🇸🇳 Sénégal</option>
                        <option value="Cameroun|+237">🇨🇲 Cameroun</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1">Devise principale</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-5 py-4.5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#0d8f76]/10 focus:border-[#0d8f76] outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                      >
                        <option value="FCFA">FCFA (BCEAO)</option>
                        <option value="XAF">XAF (BEAC)</option>
                        <option value="USD">Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1">Numéro WhatsApp (Boutique)</label>
                    <div className="flex shadow-sm rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-[#0d8f76]/10 transition-all border-2 border-gray-100 focus-within:border-[#0d8f76]">
                      <span className="inline-flex items-center px-5 bg-gray-50 text-gray-600 font-bold border-r border-gray-100">
                        {countryCode}
                      </span>
                      <input
                        type="tel"
                        value={whatsapp}
                        placeholder="Numéro de contact"
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-5 py-4.5 bg-white outline-none font-medium text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2.5 ml-1 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-[#0d8f76]" />
                      Sera utilisé pour la prise de commande client.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-auto pt-8 border-t border-gray-100">
                  <Button onClick={handlePrevStep} disabled={isLoading} variant="ghost" className="px-6 py-7 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-semibold transition-all">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading} 
                    className="bg-[#0b213f] hover:bg-blue-950 text-white px-10 py-7 rounded-2xl font-bold text-base shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1 overflow-hidden relative"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Création...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Créer ma boutique <CheckCircle2 className="w-5 h-5 ml-2" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
