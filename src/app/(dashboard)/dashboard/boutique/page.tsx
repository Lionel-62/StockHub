"use client";

import { useState, useEffect, useRef } from "react";
import { Store, Save, Eye, Info, HelpCircle, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/settings";
import { useFAQ } from "@/hooks/faq";
import { SuccessModal } from "@/components/ui/success-modal";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

export default function BoutiquePage() {
  const { settings, saveSettings, isLoaded: settingsLoaded } = useSettings();
  const { faqs, addFaq, deleteFaq, isLoaded } = useFAQ();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    slug: "",
    description: "",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  
  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        logo: settings.logo || "",
        slug: settings.slug || "",
        description: settings.description || "",
      });
    }
  }, [settings]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const newSlug = newName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name: newName, slug: newSlug });
  };

  const handleSave = async () => {
    setIsSaving(true);
    let finalFormData = { ...formData };
    
    if (finalFormData.logo && finalFormData.logo.startsWith("data:")) {
      try {
        const base64Data = finalFormData.logo.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });
        const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        
        const { error } = await supabase.storage.from('shop_logos').upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });
        
        if (!error) {
          const { data: publicData } = supabase.storage.from('shop_logos').getPublicUrl(fileName);
          finalFormData.logo = publicData.publicUrl;
        }
      } catch (err) {
        console.error("Erreur lors de l'upload du logo:", err);
      }
    }
    
    await saveSettings({ ...settings, ...finalFormData });
    setShowModal(true);
    setIsSaving(false);
  };

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

  const handleAddFaq = async () => {
    if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
      await addFaq({ question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() });
      setNewFaqQuestion("");
      setNewFaqAnswer("");
      setIsAddingFaq(false);
    }
  };

  if (!settingsLoaded || !isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Boutique en ligne</h1>
          <p className="text-sm text-slate-500">Gérez l'apparence et les informations de votre vitrine publique.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a href={`/b/${formData.slug || 'ma-boutique'}`} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full text-slate-700 bg-white shadow-sm border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors">
              <Eye size={16} className="mr-2" /> Voir la boutique
            </Button>
          </a>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex-1 sm:flex-none bg-[#0b213f] hover:bg-[#18355c] text-white shadow-md hover:shadow-lg transition-all"
          >
            <Save size={16} className={cn("mr-2", isSaving && "animate-spin")} /> 
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-800">Personnalisation</CardTitle>
            <CardDescription>Ces informations seront visibles par vos clients sur votre vitrine.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nom de la boutique</label>
              <input 
                type="text" 
                value={formData.name || ""} 
                onChange={handleNameChange}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors" 
                placeholder="Nom de ma super boutique"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Logo de la vitrine</label>
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Store className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-medium">Modifier</span>
                  </div>
                </div>
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#0b213f] border-slate-200"
                  >
                    Changer le logo
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">
                    Affiché sur votre vitrine publique. (Max 2MB)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Lien de la boutique (Slug)</label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-slate-200 border-r-0 text-slate-500 px-3 py-2.5 rounded-l-lg text-sm">
                  stockhub.com/b/
                </span>
                <input 
                  type="text" 
                  value={formData.slug || ""} 
                  readOnly
                  className="flex-1 min-w-0 p-2.5 border-y border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed outline-none" 
                  placeholder="nom-de-ma-boutique"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.slug) {
                      const baseUrl = window.location.origin;
                      navigator.clipboard.writeText(`${baseUrl}/b/${formData.slug}`);
                      alert("Lien copié dans le presse-papier !");
                    }
                  }}
                  className="bg-white border border-slate-200 border-l-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2.5 rounded-r-lg transition-colors flex items-center"
                  title="Copier le lien"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description (Slogan)</label>
              <textarea 
                value={formData.description || ""} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={2}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors resize-none" 
                placeholder="La meilleure boutique de la ville..."
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-slate-500" />
              Foire Aux Questions (FAQ)
            </CardTitle>
            <CardDescription>Répondez aux questions fréquentes de vos clients pour les rassurer.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {faqs.length === 0 && !isAddingFaq && (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Aucune question</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4">Ajoutez des questions pour aider vos clients.</p>
                </div>
              )}
              
              {faqs.map((faq, index) => (
                <div key={faq.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900">{faq.question}</h4>
                    <p className="text-sm text-slate-500">{faq.answer}</p>
                  </div>
                  <button 
                    onClick={() => deleteFaq(faq.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              {isAddingFaq ? (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text" 
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    placeholder="Ex: Quels sont vos délais de livraison ?"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                  <textarea 
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="Nous livrons en 24h à Cotonou..."
                    rows={2}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setIsAddingFaq(false);
                        setNewFaqQuestion("");
                        setNewFaqAnswer("");
                      }}
                      className="text-slate-500"
                    >
                      Annuler
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleAddFaq}
                      disabled={!newFaqQuestion.trim() || !newFaqAnswer.trim()}
                      className="bg-[#0b213f] text-white hover:bg-[#18355c]"
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingFaq(true)}
                  className="w-full text-slate-600 border-dashed border-2 bg-transparent hover:bg-slate-100"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <SuccessModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Boutique en ligne"
        description="Les modifications ont été enregistrées avec succès !"
      />
    </div>
  );
}
