"use client";

import { useState, useEffect } from "react";
import { Store, Save, Eye, Smartphone, Link as LinkIcon, Bell, ChevronDown, HelpCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useShopSettings } from "@/hooks/shop";
import { useFAQ } from "@/hooks/faq";
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

      <div className="p-3 md:p-0 max-w-[1000px] mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
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
            <Link href={`/b/${shopSettings.slug || formData.slug || 'ma-boutique'}`} target="_blank">
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
                    onChange={(e) => {
                      const newName = e.target.value;
                      const newSlug = newName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                      setFormData({...formData, name: newName, slug: newSlug || 'ma-boutique'});
                    }}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0b213f]/20 focus:border-[#0b213f] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Lien de votre boutique (Auto-généré)</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 sm:text-sm">
                      stockhub.com/b/
                    </span>
                    <input 
                      type="text" 
                      value={formData.slug}
                      readOnly
                      className="flex-1 border border-slate-200 rounded-r-xl p-3 bg-slate-100 text-slate-500 cursor-not-allowed outline-none transition-all"
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

            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-6">
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-[#3CBA0B]" />
                  <h3 className="text-lg font-bold text-[#3CBA0B]">Contact WhatsApp</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#002B5D]">Numéro WhatsApp</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#3CBA0B]/20 focus-within:border-[#3CBA0B] transition-all bg-white">
                    <select 
                      className="px-2 py-3 border-r border-slate-200 bg-slate-50 outline-none text-sm font-medium text-slate-700 cursor-pointer"
                      onChange={(e) => {
                        const currentNum = formData.whatsappNumber.replace(/^\+\d+\s*/, '');
                        setFormData({...formData, whatsappNumber: e.target.value + currentNum});
                      }}
                      value={formData.whatsappNumber.match(/^\+(\d+)/)?.[0] || "+229"}
                    >
                      <option value="+229">🇧🇯 +229 (Bénin)</option>
                      <option value="+225">🇨🇮 +225 (Côte d'Ivoire)</option>
                      <option value="+228">🇹🇬 +228 (Togo)</option>
                      <option value="+221">🇸🇳 +221 (Sénégal)</option>
                      <option value="+237">🇨🇲 +237 (Cameroun)</option>
                      <option value="+241">🇬🇦 +241 (Gabon)</option>
                      <option value="+242">🇨🇬 +242 (Congo)</option>
                      <option value="+243">🇨🇩 +243 (RDC)</option>
                    </select>
                    <input 
                      type="text" 
                      value={formData.whatsappNumber.replace(/^\+\d+\s*/, '')}
                      onChange={(e) => {
                        const prefix = formData.whatsappNumber.match(/^\+(\d+)/)?.[0] || "+229";
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({...formData, whatsappNumber: prefix + val});
                      }}
                      placeholder="47566406"
                      className="flex-1 p-3 outline-none text-slate-800 bg-transparent"
                    />
                  </div>
                  <p className="text-sm text-slate-500 pt-2">
                    Saisissez votre numéro (sans l'indicatif) pour recevoir directement les commandes de vos clients sur WhatsApp.
                  </p>
                </div>
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
