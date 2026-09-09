"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, Loader2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [shopData, setShopData] = useState<Record<string, unknown>>({});
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les données de la boutique depuis le cache local
  useEffect(() => {
    if (!isOpen) return;
    try {
      const sessionStr = localStorage.getItem("stockhub_session");
      if (sessionStr) {
        const user = JSON.parse(sessionStr);
        const shopId = user.shopId;
        const products = JSON.parse(
          localStorage.getItem(`stockhub_cache_products_${shopId}`) ?? "[]"
        );
        const orders = JSON.parse(
          localStorage.getItem(`stockhub_cache_orders_${shopId}`) ?? "[]"
        );
        const clients = JSON.parse(
          localStorage.getItem(`stockhub_cache_clients_${shopId}`) ?? "[]"
        );
        setShopData({
          shopName: user.shopName,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalClients: clients.length,
          recentOrders: orders.slice(0, 5),
          lowStockProducts: products.filter(
            (p: { stock: number; alertThreshold?: number }) =>
              p.stock <= (p.alertThreshold ?? 5)
          ),
        });
      }
    } catch (e) {
      console.error("Erreur lors du chargement des données pour l'IA", e);
    }
  }, [isOpen]);

  const { messages, sendMessage, status } = useChat({
    api: "/api/chat",
    body: { data: shopData },
  } as Parameters<typeof useChat>[0]);

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue });
    setInputValue("");
  };

  const handleQuickQuestion = (q: string) => {
    sendMessage({ text: q });
  };

  const exampleQuestions = [
    "Combien de produits j'ai en stock ?",
    "Quels produits sont en rupture ?",
    "Fais-moi un résumé de mes ventes récentes.",
  ];

  return (
    <>
      {/* Bouton flottant */}
      <button
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0b213f] to-blue-800 text-white font-semibold rounded-full shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-105 active:scale-95 transition-all duration-300 ${
          isOpen
            ? "scale-0 opacity-0 pointer-events-none"
            : "scale-100 opacity-100"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={20} className="animate-pulse" />
        <span className="hidden sm:inline">Assistant IA</span>
      </button>

      {/* Interface de Chat IA */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col ${
          isOpen
            ? "scale-100 opacity-100 h-[600px] max-h-[80vh]"
            : "scale-0 opacity-0 pointer-events-none h-0"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b213f] to-blue-800 p-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Sparkles size={22} className="text-blue-200" />
            Assistant IA
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <Bot size={32} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Bonjour !</h3>
                <p className="text-sm text-slate-500 mt-2 px-4">
                  Je suis votre assistant intelligent. Je peux analyser vos
                  ventes, vérifier votre stock et répondre à vos questions.
                </p>
              </div>
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-400 mb-2 tracking-wider uppercase">
                  Essayez de me demander :
                </h4>
                <div className="flex flex-col gap-2">
                  {exampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      className="text-left px-4 py-2 bg-white border border-blue-100 text-slate-600 text-sm rounded-xl shadow-sm hover:border-blue-300 hover:text-blue-700 transition-colors"
                      onClick={() => handleQuickQuestion(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => {
                const textContent = m.parts
                  ?.filter((p: { type: string }) => p.type === "text")
                  .map((p: { type: string; text?: string }) => p.text ?? "")
                  .join("") ?? "";

                return (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        m.role === "user"
                          ? "bg-slate-200 text-slate-600"
                          : "bg-gradient-to-r from-[#0b213f] to-blue-800 text-white"
                      }`}
                    >
                      {m.role === "user" ? "V" : <Sparkles size={14} />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                        m.role === "user"
                          ? "bg-slate-100 text-slate-800 rounded-tr-sm"
                          : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{textContent}</div>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0b213f] to-blue-800 text-white flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center">
                    <Loader2 size={16} className="text-blue-600 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Posez votre question..."
            className="flex-1 px-4 py-2.5 bg-slate-100 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="p-2.5 bg-[#0b213f] hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full transition-colors shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
