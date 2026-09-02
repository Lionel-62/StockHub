import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "Opération réussie !", 
  description = "Vos modifications ont été enregistrées avec succès.",
  buttonText = "Fermer"
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-200">
            <Check size={32} className="text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-500 mb-8">{description}</p>
          
          <Button 
            onClick={onClose}
            className="w-full bg-[#0b213f] hover:bg-[#18355c] text-white shadow-sm"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
