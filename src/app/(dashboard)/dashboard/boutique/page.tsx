"use client";

import { useState, useEffect } from "react";
import { Store, Save, Eye, Smartphone, Link as LinkIcon, Power, PowerOff, Bell, CheckCircle2, ChevronDown, HelpCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useShopSettings } from "@/lib/mock/shop";
import { useFAQ } from "@/lib/mock/faq";
import { SuccessModal } from "@/components/ui/success-modal";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ShopConfigPage() {
  const { shopSettings, saveShopSettings, isLoaded } = useShopSettings();
  const { faqs, addFaq, deleteFaq, isLoaded: faqLoaded } = useFAQ();
  
  const [formData, setFormData] = useState(shopSettings);
  const [showModal, setShowModal] = useState(false);
  
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  
  // WhatsApp Verification State
  const [verificationState, setVerificationState] = useState<"idle" | "sending" | "sent" | "verified">("idle");
  const [verificationCode, setVerificationCode] = useState("");

  const handleAddFaq = () => {
    if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
      addFaq({ question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() });
      setNewFaqQuestion("");
      setNewFaqAnswer("");
      setIsAddingFaq(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      setFormData(shopSettings);
    }
  }, [isLoaded, shopSettings]);

  const handleSave = () => {
    saveShopSettings(formData);
    setShowModal(true);
  };

  const handleSendCode = () => {
    if (!formData.whatsappNumber) {
      alert("Veuillez entrer un numéro WhatsApp.");
      return;
    }
    setVerificationState("sending");
    setTimeout(() => {
      setVerificationState("sent");
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (verificationCode.length < 4) {
      alert("Veuillez entrer un code valide à 4 chiffres.");
      return;
    }
    setVerificationState("verified");
  };

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shopUrl = origin ? `${origin}/b/${formData.slug}` : `https://stockhub.com/b/${formData.slug}`;

  return (
    <>
      <SuccessModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Boutique mise à jour !"
        description="Les paramètres de votre boutique en ligne ont été enregistrés avec succès."
      />

      <div className="p-4 md:p-8 max-w-[1000px] mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Store className="h-8 w-8 text-[#0b213f]" />
              Ma Boutique en Ligne
            </h1>
            <p className="text-slate-500 mt-1">Configurez votre vitrine publique pour recevoir des commandes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/b/${formData.slug}`} target="_blank">
              <Button variant="outline" className="text-[#0b213f] border-slate-200 hover:bg-slate-50">
                <Eye className="mr-2 h-4 w-4" />
                Voir ma boutique
              </Button>
            </Link>
            <Button 
              onClick={handleSave}
              className="bg-[#0b213f] hover:bg-[#18355c] text-white shadow-sm"
            >
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </div>

        {/* Configuration principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Informations de la boutique</CardTitle>
                <CardDescription>Ces informations seront visibles par vos clients.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nom de la boutique</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0b213f]/20 focus:border-[#0b213f] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Lien de votre boutique</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 sm:text-sm">
                      stockhub.com/b/
                    </span>
                    <input 
                      type="text" 
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                      className="flex-1 border border-slate-200 rounded-r-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0b213f]/20 focus:border-[#0b213f] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Description court (Slogan)</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0b213f]/20 focus:border-[#0b213f] transition-all"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-[#0f9d58]" />
                  <h3 className="text-lg font-bold text-[#0f9d58]">Contact WhatsApp</h3>
                  <CheckCircle2 className="h-5 w-5 text-[#0f9d58]" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0b213f]">Numéro WhatsApp</label>
                  
                  {verificationState === "verified" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-xl">
                         <span className="font-bold text-green-800 text-lg">{formData.whatsappNumber}</span>
                         <Button variant="ghost" onClick={() => {
                            setVerificationState("idle");
                            setVerificationCode("");
                         }} className="text-green-700 hover:text-green-800 hover:bg-green-100">
                           Modifier
                         </Button>
                      </div>
                      <div className="flex items-center gap-3 bg-green-100 text-green-800 px-4 py-3 rounded-xl border border-green-200 font-medium text-sm animate-in zoom-in-95">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-bold">Numéro vérifié avec succès !</p>
                          <p className="text-xs text-green-700 opacity-90">Vos notifications de commandes sont maintenant actives.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0f9d58]/20 focus-within:border-[#0f9d58] transition-all bg-white">
                        <div className="flex items-center gap-2 px-3 py-3 border-r border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                          <span className="text-lg leading-none">🇧🇯</span>
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={formData.whatsappNumber}
                          onChange={(e) => {
                            setFormData({...formData, whatsappNumber: e.target.value});
                            if (verificationState !== "idle") {
                              setVerificationState("idle");
                              setVerificationCode("");
                            }
                          }}
                          placeholder="+229 47566406"
                          className="flex-1 p-3 outline-none text-slate-800 bg-transparent"
                        />
                      </div>
                      <p className="text-sm text-slate-500 pt-2">
                        Entrez votre numéro WhatsApp pour recevoir les notifications de commandes et autres alertes importantes.
                      </p>

                      {verificationState === "idle" && (
                        <Button onClick={handleSendCode} className="bg-[#0f9d58] hover:bg-[#0d8a4d] text-white font-medium rounded-lg px-6 py-2.5 h-auto mt-2">
                          Recevoir le code de vérification
                        </Button>
                      )}
                      
                      {verificationState === "sending" && (
                        <Button disabled className="bg-slate-200 text-slate-500 font-medium rounded-lg px-6 py-2.5 h-auto flex items-center gap-2 mt-2">
                          <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                          Envoi en cours...
                        </Button>
                      )}
                      
                      {verificationState === "sent" && (
                        <div className="space-y-3 bg-green-50/80 p-4 rounded-xl border border-green-200 mt-2 animate-in fade-in slide-in-from-top-2">
                          <label className="text-sm font-semibold text-green-800">Code de sécurité</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Ex: 4852" 
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                              className="w-32 border border-green-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/40 focus:border-[#0f9d58] text-center text-lg tracking-widest font-bold text-green-900 bg-white"
                              maxLength={4}
                            />
                            <Button onClick={handleVerifyCode} className="bg-[#0f9d58] hover:bg-[#0d8a4d] text-white py-2.5 h-auto px-6 font-bold shadow-sm shadow-[#0f9d58]/20">
                              Vérifier
                            </Button>
                          </div>
                          <p className="text-xs text-green-600">Un code à 4 chiffres a été envoyé au {formData.whatsappNumber}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Advanced API Configuration */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-6">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <Power className="h-5 w-5 text-purple-600" />
                  API Meta WhatsApp (Avancé)
                </CardTitle>
                <CardDescription>
                  Connectez-vous directement à l'API Meta officielle pour automatiser les messages de confirmation de commande et le support.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Activer l'intégration API</h4>
                    <p className="text-xs text-slate-500">Les commandes utiliseront l'API officielle au lieu d'une redirection web.</p>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, metaApiEnabled: !formData.metaApiEnabled})}
                    className={cn("w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out shadow-inner", formData.metaApiEnabled ? "bg-purple-600" : "bg-slate-200")}
                  >
                    <span className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ease-in-out", formData.metaApiEnabled ? "translate-x-6" : "translate-x-0")} />
                  </button>
                </div>

                {formData.metaApiEnabled && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-xs text-purple-800 mb-4 leading-relaxed">
                      <strong>Attention :</strong> Ces informations se trouvent dans votre <a href="https://developers.facebook.com/" target="_blank" className="underline font-bold">Console Meta for Developers</a>. Assurez-vous d'avoir configuré le Webhook de StockHub (<code>/api/whatsapp/webhook</code>).
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Phone Number ID (ID du numéro de téléphone)</label>
                      <input 
                        type="text" 
                        value={formData.metaPhoneNumberId || ""}
                        onChange={(e) => setFormData({...formData, metaPhoneNumberId: e.target.value})}
                        placeholder="Ex: 104939284758392"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all bg-slate-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Permanent Access Token (Jeton d'accès)</label>
                      <input 
                        type="password" 
                        value={formData.metaAccessToken || ""}
                        onChange={(e) => setFormData({...formData, metaAccessToken: e.target.value})}
                        placeholder="EAAGm0s... (très long)"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all bg-slate-50"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-[#0b213f]" />
                    Foire Aux Questions (FAQ)
                  </CardTitle>
                  <CardDescription>Aidez vos clients en répondant à l'avance à leurs questions.</CardDescription>
                </div>
                <Button onClick={() => setIsAddingFaq(!isAddingFaq)} variant="outline" size="sm" className="h-8">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {isAddingFaq && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Question</label>
                      <input 
                        type="text" 
                        value={newFaqQuestion}
                        onChange={(e) => setNewFaqQuestion(e.target.value)}
                        placeholder="Ex: Quels sont les délais de livraison ?"
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b213f]/20 focus:border-[#0b213f] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Réponse</label>
                      <textarea 
                        value={newFaqAnswer}
                        onChange={(e) => setNewFaqAnswer(e.target.value)}
                        placeholder="Votre réponse ici..."
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b213f]/20 focus:border-[#0b213f] transition-all"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button onClick={() => setIsAddingFaq(false)} variant="ghost" size="sm">Annuler</Button>
                      <Button onClick={handleAddFaq} className="bg-[#0b213f] hover:bg-[#18355c] text-white" size="sm">Enregistrer</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {!faqLoaded ? (
                    <div className="text-center py-4 text-slate-500">Chargement...</div>
                  ) : faqs.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Aucune question n'a été ajoutée.
                    </div>
                  ) : (
                    faqs.map(faq => (
                      <div key={faq.id} className="group flex items-start justify-between gap-4 p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors bg-white">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{faq.question}</h4>
                          <p className="text-sm text-slate-600 mt-1">{faq.answer}</p>
                        </div>
                        <button 
                          onClick={() => deleteFaq(faq.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={cn("border-2 rounded-2xl overflow-hidden transition-all duration-300", formData.isActive ? "border-green-500 shadow-md shadow-green-500/10" : "border-slate-200")}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex justify-between items-center">
                  Statut
                  <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold", formData.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}>
                    {formData.isActive ? "En ligne" : "Hors ligne"}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <Button 
                  translate="no"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  variant="outline" 
                  className={cn("w-full py-6 flex items-center justify-center gap-2 font-semibold text-base transition-all", 
                    formData.isActive 
                      ? "border-red-200 text-red-600 hover:bg-red-50" 
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  )}
                >
                  {formData.isActive ? (
                    <><PowerOff className="h-5 w-5" /> <span>Désactiver la boutique</span></>
                  ) : (
                    <><Power className="h-5 w-5" /> <span>Activer la boutique</span></>
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  {formData.isActive 
                    ? "Votre boutique est visible par le public." 
                    : "Votre boutique est actuellement fermée au public."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Partage</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-slate-600">Partagez ce lien sur vos réseaux sociaux (Facebook, Instagram, WhatsApp) pour attirer des clients.</p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl overflow-hidden">
                  <LinkIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-600 truncate flex-1">{shopUrl}</span>
                </div>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(shopUrl);
                    alert("Lien copié !");
                  }}
                  variant="secondary" 
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Copier le lien
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
