"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/mock/auth";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { login, addUser, currentUser, isLoaded } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPin, setLoginPin] = useState("");
  
  // Register State
  const [regName, setRegName] = useState("");
  const [regIdentifier, setRegIdentifier] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regConfirmPin, setRegConfirmPin] = useState("");

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

    if (!loginIdentifier || !loginPin) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    const result = await login(loginIdentifier, loginPin, "owner");
    if (!result.success) {
      setError(result.error || "Identifiant ou code PIN incorrect.");
      setIsLoading(false);
    }
    // Redirection happens in useEffect on success
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError("Veuillez activer et configurer le fournisseur Google dans votre tableau de bord Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!regName || !regIdentifier || !regPin || !regConfirmPin) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (regPin.length !== 4) {
      setError("Le code PIN doit comporter 4 chiffres.");
      return;
    }

    if (regPin !== regConfirmPin) {
      setError("Les codes PIN ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('identifier', regIdentifier)
        .single();

      if (existingUser) {
        setError("Cet identifiant est déjà utilisé.");
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: `user-owner-${Date.now()}`,
        name: regName,
        identifier: regIdentifier,
        pinCode: regPin,
        role: "owner" as const,
        permissions: { canViewDashboard: true },
        createdAt: new Date().toISOString()
      };

      await addUser(newUser);
      
      // Do not auto-login. Switch to login tab, prefill identifier, and show success message
      setActiveTab("login");
      setLoginIdentifier(regIdentifier);
      setLoginPin("");
      
      // Clear register fields
      setRegName("");
      setRegIdentifier("");
      setRegPin("");
      setRegConfirmPin("");
      
      setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
    } catch (err: any) {
      setError("Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100/50 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">StockHub</h1>
          <p className="text-slate-500 text-sm">Gérez votre boutique en toute simplicité.</p>
        </div>

        {/* Tabs */}
        <div className="bg-slate-100/80 p-1 rounded-xl flex items-center mb-8">
          <button 
            type="button"
            onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
              activeTab === "login" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Connexion
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab("register"); setError(""); setSuccess(""); }}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
              activeTab === "register" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start">
            <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start border border-green-200">
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Identifiant</label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all text-sm placeholder:text-slate-400"
                placeholder="vous@entreprise.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Code PIN</label>
                <button type="button" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                  Code PIN oublié ?
                </button>
              </div>
              <input
                type="password"
                maxLength={4}
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all tracking-widest text-lg"
                placeholder="••••"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#161726] hover:bg-[#25273b] text-white py-6 text-sm font-medium rounded-xl shadow-md transition-all mt-2"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
            
            <div className="relative mt-6 mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">ou continuer avec</span>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-6 text-sm font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            
            {/* Demo Helper */}
            <div className="pt-2 text-center">
              <button 
                type="button"
                onClick={() => { setLoginIdentifier("admin"); setLoginPin("0000"); }}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2"
              >
                Auto-remplir compte de démonstration
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom de la boutique</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all text-sm placeholder:text-slate-400"
                placeholder="Boutique Chez Ali"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Identifiant</label>
              <input
                type="text"
                value={regIdentifier}
                onChange={(e) => setRegIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all text-sm placeholder:text-slate-400"
                placeholder="vous@entreprise.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Code PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all tracking-widest text-center text-lg"
                  placeholder="••••"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmer PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={regConfirmPin}
                  onChange={(e) => setRegConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#161726]/10 focus:border-[#161726]/30 outline-none transition-all tracking-widest text-center text-lg"
                  placeholder="••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#161726] hover:bg-[#25273b] text-white py-6 text-sm font-medium rounded-xl shadow-md transition-all mt-2"
            >
              {isLoading ? "Inscription..." : "S'inscrire"}
            </Button>
            
            <div className="relative mt-6 mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">ou s'inscrire avec</span>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-6 text-sm font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
