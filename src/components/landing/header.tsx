"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Store, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/auth";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, isLoaded } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-4 inset-x-0 z-50 flex justify-center px-4 sm:px-6 transition-transform duration-300 ${isScrolled ? "translate-y-[-0.5rem]" : ""}`}>
        <nav className="w-full max-w-6xl glass-nav border border-slate-200/80 rounded-full py-2.5 px-4 sm:px-6 flex items-center justify-between shadow-sm transition-all duration-300 hover:border-slate-300">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group z-50">
            <img src="/logo.png" alt="StockHub Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link href="#fonctionnalites" className="hover:text-[#0b213f] transition-colors">Fonctionnalités</Link>
            <Link href="#comment-ca-marche" className="hover:text-[#0b213f] transition-colors">Comment ça marche</Link>
            <Link href="#demo" className="hover:text-[#0b213f] transition-colors">Démo</Link>
            <Link href="#tarifs" className="hover:text-[#0b213f] transition-colors">Tarifs</Link>
            <Link href="#temoignages" className="hover:text-[#0b213f] transition-colors">Témoignages</Link>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {isLoaded && currentUser ? (
              <Link href="/dashboard">
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-medium text-white bg-[#0b213f] hover:bg-slate-900 px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tableau de bord</span>
                </motion.button>
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors hidden sm:inline-block"
                >
                  Connexion
                </Link>
                <Link href="/login">
                  <motion.button 
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium text-white bg-[#0b213f] hover:bg-slate-900 px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
                  >
                    <span>Créer une vitrine</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl p-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Stock<span className="text-[#0b213f]">Hub</span>
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-lg font-medium text-slate-700">
                <Link href="#fonctionnalites" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">Fonctionnalités</Link>
                <Link href="#comment-ca-marche" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">Comment ça marche</Link>
                <Link href="#demo" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">Démo</Link>
                <Link href="#tarifs" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">Tarifs</Link>
                <Link href="#temoignages" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">Témoignages</Link>
                
                {/* Mobile Actions */}
                <div className="mt-6 flex flex-col gap-3">
                  {isLoaded && currentUser ? (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full text-center text-sm font-medium text-white bg-[#0b213f] hover:bg-slate-900 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Tableau de bord
                      </button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <button className="w-full text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 py-3 rounded-xl transition-colors border border-slate-200">
                          Connexion
                        </button>
                      </Link>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <button className="w-full text-center text-sm font-medium text-white bg-[#0b213f] hover:bg-slate-900 py-3 rounded-xl transition-colors">
                          Créer ma vitrine
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
