"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, Loader2, RefreshCw } from "lucide-react";
import { useChat } from "@ai-sdk/react";

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [shopData, setShopData] = useState<Record<string, unknown>>({});
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [shopId, setShopId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const sessionStr = localStorage.getItem("stockhub_session");
        if (sessionStr) return JSON.parse(sessionStr).shopId || "";
      } catch {}
    }
    return "";
  });

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem("stockhub_session");
      if (sessionStr) {
        const user = JSON.parse(sessionStr);
        if (user.shopId && user.shopId !== shopId) {
          setShopId(user.shopId);
        }
      }
    } catch (e) {
      console.error("Erreur lecture session", e);
    }
  }, [isOpen, shopId]);

  const { messages, sendMessage, status, error, regenerate } = useChat({
    api: "/api/chat",
    body: { shopId },
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
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0b213f] to-blue-800 text-white font-semibold rounded-full shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-105 active:scale-95 transition-all duration-300 ${
          isOpen
            ? "scale-0 opacity-0 pointer-events-none"
            : "scale-100 opacity-100"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={20} className="animate-pulse text-amber-300" />
        <span className="text-sm">Assistant IA</span>
      </button>

      {/* Interface de Chat IA */}
      <div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col border border-slate-200 ${
          isOpen
            ? "scale-100 opacity-100 h-[580px] max-h-[85vh]"
            : "scale-0 opacity-0 pointer-events-none h-0"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b213f] to-blue-900 p-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-300" />
            </div>
            <div>
              <div className="leading-tight">Assistant StockHub</div>
              <div className="text-[11px] text-blue-200 font-normal">Connecté à votre boutique</div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex flex-col h-full justify-between">
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-3 shadow-inner">
                  <Bot size={28} />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Bonjour ! Comment puis-je vous aider ?</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                  Je réponds à vos questions sur vos stocks, vos ventes et vos produits en temps réel.
                </p>
              </div>

              <div className="mt-auto pt-2">
                <h4 className="text-[11px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                  Questions fréquentes :
                </h4>
                <div className="flex flex-col gap-1.5">
                  {exampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      className="text-left px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl shadow-xs hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50 transition-all font-medium"
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
                const textContent =
                  m.parts
                    ?.filter((p: { type: string }) => p.type === "text")
                    .map((p: { type: string; text?: string }) => p.text ?? "")
                    .join("") ||
                  (typeof (m as any).content === "string" ? (m as any).content : "");

                return (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        m.role === "user"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-[#0b213f] text-white"
                      }`}
                    >
                      {m.role === "user" ? "Moi" : <Sparkles size={13} className="text-amber-300" />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-[#0b213f] text-white rounded-tr-xs"
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{textContent}</div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0b213f] text-white flex items-center justify-center flex-shrink-0">
                    <Sparkles size={13} className="text-amber-300 animate-spin" />
                  </div>
                  <div className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2">
                    <Loader2 size={14} className="text-blue-600 animate-spin" />
                    <span className="text-xs text-slate-500">L&apos;assistant réfléchit...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold">Une erreur est survenue</p>
                    <p className="text-[11px] mt-0.5 text-red-600">
                      {error.message || "Vérifiez que la clé API Gemini est configurée."}
                    </p>
                  </div>
                  {regenerate && (
                    <button
                      onClick={() => regenerate()}
                      className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <RefreshCw size={12} />
                      Réessayer
                    </button>
                  )}
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
            className="flex-1 px-4 py-2 bg-slate-100 border border-transparent rounded-full text-xs focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="p-2 bg-[#0b213f] hover:bg-blue-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-full transition-colors shadow-xs"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
