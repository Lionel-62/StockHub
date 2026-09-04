"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User as UserIcon, AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import { getShopBySlugAction } from "@/app/actions/shop.actions";

export default function EmployeLoginPage({ params }: { params: { shopSlug: string } }) {
  const router = useRouter();
  const { login, currentUser, isLoaded } = useAuth();
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    // Fetch shop name for display
    const fetchShopName = async () => {
      try {
        const res = await getShopBySlugAction(params.shopSlug);
        if (res.success && res.data) {
          setShopName(res.data.name);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchShopName();
  }, [params.shopSlug]);
  
  const [identifier, setIdentifier] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [error, setError] = useState("");

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isLoaded && currentUser) {
      if (currentUser.role === "employee") {
        router.push("/dashboard/ventes");
      }
    }
  }, [isLoaded, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !pinCode) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (pinCode.length !== 4) {
      setError("Le code PIN doit comporter 4 chiffres.");
      return;
    }

    const result = await login(identifier, pinCode, "employee", params.shopSlug);
    if (!result.success) {
      setError(result.error || "Identifiant ou code PIN incorrect.");
    } else {
      // The redirection will happen in the useEffect
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Chargement de l'espace vendeur...</p>
        </div>
      </div>
    );
  }

  if (currentUser) return null; // Avoid flicker before redirect

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-8 text-center flex flex-col items-center">
          <img src="/logo.png" alt="StockHub Logo" className="h-10 sm:h-12 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">Espace Vendeur</h1>
          {shopName && <div className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">{shopName}</div>}
          <p className="text-slate-500 mt-2 text-sm">Identifiez-vous pour accéder à votre espace</p>
        </div>

        <div className="px-8 pb-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start text-red-600 text-sm">
              <AlertCircle size={16} className="mr-2 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Identifiant"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all tracking-widest text-lg"
                  placeholder="Code PIN"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base rounded-xl shadow-md transition-all mt-6"
            >
              Accéder à l'espace
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
