"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Save, Building2, Bell, Shield, Wallet, 
  Upload, Check, CreditCard, Lock, Mail, 
  Smartphone, Globe, Paintbrush, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/mock/settings";
import { SuccessModal } from "@/components/ui/success-modal";

const TABS = [
  { id: "general", label: "Général", icon: Building2 },
  { id: "facturation", label: "Facturation", icon: FileText },
  { id: "preferences", label: "Préférences", icon: Paintbrush },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [currency, setCurrency] = useState("XOF");
  const [language, setLanguage] = useState("FR");
  const [timezone, setTimezone] = useState("GMT+1");
  const [isSaved, setIsSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const { settings, saveSettings, isLoaded } = useSettings();
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    if (isLoaded) {
      setFormData(settings);
    }
  }, [isLoaded, settings]);

  const handleSave = () => {
    saveSettings(formData);
    setIsSaved(true);
    setShowModal(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <SuccessModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Paramètres enregistrés !"
        description="Les informations de votre entreprise ont été mises à jour avec succès. Elles apparaîtront désormais sur vos factures."
      />
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Paramètres</h1>
          <p className="text-slate-500 mt-1">Gérez la configuration et les préférences de votre espace StockHub.</p>
        </div>
        <Button 
          onClick={handleSave}
          className={cn(
            "bg-[#0b213f] hover:bg-[#18355c] text-white transition-all shadow-sm w-full md:w-auto",
            isSaved && "bg-green-600 hover:bg-green-700"
          )}
        >
          {isSaved ? <Check size={16} className="mr-2" /> : <Save size={16} className="mr-2" />}
          {isSaved ? "Enregistré" : "Enregistrer les modifications"}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Barre de navigation latérale */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 custom-scrollbar sticky top-24">
            {TABS.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-white text-[#0b213f] shadow-sm border border-slate-200" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                )}
              >
                <tab.icon size={18} className={cn(
                  "transition-colors",
                  activeTab === tab.id ? "text-blue-600" : "text-slate-400"
                )} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des Paramètres */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* TONGLET: GÉNÉRAL */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Card className="shadow-sm border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Profil de l'Entreprise</CardTitle>
                  <CardDescription>Informations de base affichées sur vos documents.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-24 w-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors group overflow-hidden relative"
                    >
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <>
                          <Upload size={24} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Logo</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5 w-full">
                      <label className="text-sm font-semibold text-slate-700">Nom de l'entreprise *</label>
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Email de contact</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-9 pr-3 p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Téléphone</label>
                      <div className="relative">
                        <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="tel" 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full pl-9 pr-3 p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Adresse complète</label>
                    <textarea 
                      rows={3} 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Réseaux Sociaux & Site Web</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Site Web</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="url" 
                        value={formData.website} 
                        onChange={e => setFormData({...formData, website: e.target.value})}
                        placeholder="https://" 
                        className="w-full pl-9 pr-3 p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ONGLET: FACTURATION */}
          {activeTab === "facturation" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Paramètres de Facturation</CardTitle>
                  <CardDescription>Configurez la TVA et les informations légales.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 relative z-20">
                      <label className="text-sm font-semibold text-slate-700">Devise principale</label>
                      <CustomSelect
                        options={[
                          { value: "XOF", label: "Franc CFA (XOF)" },
                          { value: "EUR", label: "Euro (€)" },
                          { value: "USD", label: "Dollar ($)" }
                        ]}
                        value={currency}
                        onChange={setCurrency}
                        searchable={false}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Taux de TVA par défaut (%)</label>
                      <input type="number" defaultValue="18" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Préfixe des factures</label>
                      <input type="text" defaultValue="FAC-" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Numéro IFU / SIRET</label>
                      <input type="text" placeholder="Entrez votre numéro d'identification" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-4 border-t border-slate-100">
                    <label className="text-sm font-semibold text-slate-700">Pied de page des factures (Mention légale)</label>
                    <textarea rows={2} defaultValue="Merci pour votre confiance. Le paiement est dû sous 30 jours." className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ONGLET: PRÉFÉRENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Préférences Régionales</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 relative z-20">
                      <label className="text-sm font-semibold text-slate-700">Langue de l'interface</label>
                      <CustomSelect
                        options={[
                          { value: "FR", label: "Français" },
                          { value: "EN", label: "Anglais" },
                        ]}
                        value={language}
                        onChange={setLanguage}
                        searchable={false}
                      />
                    </div>
                    <div className="space-y-1.5 relative z-10">
                      <label className="text-sm font-semibold text-slate-700">Fuseau Horaire</label>
                      <CustomSelect
                        options={[
                          { value: "GMT+1", label: "Afrique de l'Ouest (GMT+1)" },
                          { value: "GMT+2", label: "Europe Centrale (GMT+2)" },
                          { value: "GMT+0", label: "Temps Universel (GMT)" },
                        ]}
                        value={timezone}
                        onChange={setTimezone}
                        searchable={false}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Apparence</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-1 p-4 rounded-xl border-2 border-blue-600 bg-blue-50/50 cursor-pointer relative overflow-hidden">
                      <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <Check size={10} />
                      </div>
                      <div className="font-semibold text-blue-900 mb-1">Thème Clair</div>
                      <div className="text-xs text-blue-700/70">Idéal pour les environnements de travail lumineux.</div>
                    </div>
                    <div className="flex-1 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300 transition-colors opacity-70">
                      <div className="font-semibold text-slate-700 mb-1">Thème Sombre</div>
                      <div className="text-xs text-slate-500">Bientôt disponible dans une prochaine mise à jour.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ONGLET: SÉCURITÉ */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Mot de passe</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Mot de passe actuel</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" placeholder="••••••••" className="w-full pl-9 pr-3 p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Nouveau mot de passe</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" placeholder="••••••••" className="w-full pl-9 pr-3 p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                      Mettre à jour le mot de passe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* ONGLET: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Préférences de Notification</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100">
                  <div className="flex items-center justify-between p-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">Rappels de stock faible</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Recevoir un email quand un produit passe sous le seuil d'alerte.</p>
                    </div>
                    <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">Rapport de ventes quotidien</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Un résumé de vos encaissements envoyé chaque soir.</p>
                    </div>
                    <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">Nouvelle connexion</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Alerte de sécurité lors d'une connexion depuis un nouvel appareil.</p>
                    </div>
                    <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
    </>
  );
}
