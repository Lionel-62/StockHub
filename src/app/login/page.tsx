"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Store, Phone, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoLoader } from "@/components/ui/logo-loader";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, isLoaded } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register State - Step 1
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  
  // Register State - Step 2 (Shop)
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoaded && currentUser) {
      if (currentUser.role === "owner") {
        router.push("/dashboard");
      }
    }
  }, [isLoaded, currentUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginEmail || !loginPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Erreur Google Login");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (registerStep === 1) {
      if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
        setError("Veuillez remplir tous les champs.");
        return;
      }
      if (regPassword.length < 6) {
        setError("Le mot de passe doit comporter au moins 6 caractères.");
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
      setRegisterStep(2);
      return;
    }

    if (registerStep === 2) {
      if (!shopName || !whatsapp) {
        setError("Le nom de la boutique et le numéro WhatsApp sont requis.");
        return;
      }

      setIsLoading(true);
      try {
        // 1. Create Auth User
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: regEmail,
          password: regPassword,
          options: {
            data: { full_name: regName }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) throw new Error("Cet email est déjà utilisé.");
          throw signUpError;
        }
        if (!authData.user) throw new Error("Erreur inattendue lors de la création.");

        // 2. Create Shop
        const shopSlug = shopName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
        const { data: shopData, error: shopError } = await supabase.from('shops').insert({
          name: shopName,
          description: shopDescription,
          whatsapp_number: whatsapp,
          slug: shopSlug,
        }).select().single();

        if (shopError || !shopData) throw new Error("Erreur lors de la création de la boutique.");

        // 3. Create Profile linked to the Shop
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          name: regName,
          identifier: regEmail,
          pin_code: '0000',
          role: 'owner',
          shop_id: shopData.id,
          permissions: { canViewDashboard: true },
          created_at: new Date().toISOString()
        });
        
        if (profileError) throw profileError;

        setSuccess("Boutique créée avec succès ! Redirection...");
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors de l'inscription.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LogoLoader message="Préparation de l'interface..." />
      </div>
    );
  }
  
  if (currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Animated Glassmorphism Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-white/80 p-8 z-10 transition-all">
        
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="StockHub Logo" className="h-14 sm:h-16 w-auto object-contain mx-auto mb-4 drop-shadow-sm" />
          <p className="text-slate-500 text-sm font-medium">Gérez votre boutique en toute simplicité.</p>
        </div>

        {/* Tabs - Only show on Step 1 */}
        {registerStep === 1 && (
          <div className="bg-slate-100/50 p-1.5 rounded-2xl flex items-center mb-8 border border-white/50 shadow-inner">
            <button 
              type="button"
              onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
              className={`flex-1 text-sm font-semibold py-2.5 rounded-xl transition-all ${
                activeTab === "login" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Connexion
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab("register"); setError(""); setSuccess(""); }}
              className={`flex-1 text-sm font-semibold py-2.5 rounded-xl transition-all ${
                activeTab === "register" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Inscription
            </button>
          </div>
        )}

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50/80 backdrop-blur-sm text-red-600 text-sm font-medium rounded-xl flex items-start border border-red-100">
            <AlertCircle size={18} className="mr-2 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-3.5 bg-green-50/80 backdrop-blur-sm text-green-700 text-sm font-medium rounded-xl flex items-start border border-green-200">
            <svg className="w-5 h-5 mr-2 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all text-sm placeholder:text-slate-400 shadow-sm"
                placeholder="vous@entreprise.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Mot de passe</label>
                <button type="button" className="text-xs font-medium text-slate-500 hover:text-[#161726] transition-colors">
                  Mot de passe oublié ?
                </button>
              </div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all tracking-wide text-sm shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#161726] to-[#25273b] hover:from-[#0b0c16] hover:to-[#161726] text-white py-6 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all mt-2 border border-slate-800"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
            
            <div className="relative mt-8 mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-slate-50/50 backdrop-blur-md text-slate-500 font-medium rounded-full text-xs">ou continuer avec</span>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full bg-white/80 hover:bg-white border border-slate-200/80 text-slate-700 py-6 text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </form>
        ) : (
          /* Register Flow */
          <form onSubmit={handleRegister} className="relative">
            {registerStep === 1 ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all text-sm placeholder:text-slate-400 shadow-sm"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all text-sm placeholder:text-slate-400 shadow-sm"
                    placeholder="vous@entreprise.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all tracking-wide text-sm shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmer</label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all tracking-wide text-sm shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#161726] to-[#25273b] hover:from-[#0b0c16] hover:to-[#161726] text-white py-6 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all mt-4 border border-slate-800"
                >
                  Continuer
                </Button>
                
                <div className="relative mt-8 mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/80"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-slate-50/50 backdrop-blur-md text-slate-500 font-medium rounded-full text-xs">ou s'inscrire avec</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full bg-white/80 hover:bg-white border border-slate-200/80 text-slate-700 py-6 text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <button 
                    type="button" 
                    onClick={() => setRegisterStep(1)} 
                    className="absolute left-0 top-1 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-xl font-bold text-[#161726]">Créez votre boutique</h2>
                  <p className="text-sm text-slate-500 mt-1">Dernière étape avant de commencer</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                      <Store size={16} className="text-[#0d9488]" />
                      Nom de la boutique
                    </label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]/40 outline-none transition-all text-sm placeholder:text-slate-400 shadow-sm"
                      placeholder="Ex: Boutique Chez Ali"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                      <FileText size={16} className="text-[#0d9488]" />
                      Description (Optionnel)
                    </label>
                    <textarea
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]/40 outline-none transition-all text-sm placeholder:text-slate-400 shadow-sm resize-none"
                      placeholder="Que vendez-vous ?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                      <Phone size={16} className="text-[#0d9488]" />
                      Numéro WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]/40 outline-none transition-all text-sm placeholder:text-slate-400 shadow-sm"
                      placeholder="+225 01 02 03 04 05"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#0d9488] to-[#0f766e] hover:from-[#0f766e] hover:to-[#115e59] text-white py-6 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all mt-4 border border-teal-800"
                >
                  {isLoading ? "Création en cours..." : "Lancer ma boutique"}
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
