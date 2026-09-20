"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  message = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
  confirmText = "Oui, supprimer",
  cancelText = "Non, annuler",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-4">
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-full shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1 mt-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#06101e] border-t border-slate-100 dark:border-[#152a4d] flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1c3a66] hover:bg-slate-50 dark:bg-[#06101e] hover:text-slate-900 dark:text-white transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
            >
              {confirmText}
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
}
