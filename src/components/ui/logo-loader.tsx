import React from 'react';

export function LogoLoader({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
      <div className="relative flex flex-col items-center">
        {/* Logo avec effet de pulsation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-100/50 rounded-full animate-ping opacity-75 scale-150"></div>
          <img 
            src="/logo.png" 
            alt="StockHub Logo" 
            className="relative h-16 sm:h-20 w-auto object-contain z-10 drop-shadow-md" 
          />
        </div>
        
        {/* Petit spinner et texte */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}
