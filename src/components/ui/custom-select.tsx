"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  allowCreate?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  searchable = true,
  className,
  disabled = false,
  searchPlaceholder = "Rechercher...",
  allowCreate = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none",
          isOpen
            ? "border-blue-400 ring-2 ring-blue-100 shadow-sm"
            : "border-slate-200 hover:border-blue-300",
          disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "text-slate-800"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-slate-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180 text-blue-500"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {searchable && (
            <div className="p-2 border-b border-slate-50 relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border-none rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                autoFocus
              />
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
            {filteredOptions.length === 0 && (!allowCreate || !searchTerm.trim()) ? (
              <div className="p-3 text-center text-sm text-slate-500">Aucun résultat</div>
            ) : (
              <>
                {filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {opt.icon && <span className="text-slate-400">{opt.icon}</span>}
                        {opt.label}
                      </div>
                      {isSelected && <Check size={16} className="text-blue-600" />}
                    </button>
                  );
                })}
                {allowCreate && searchTerm.trim() && !options.some(opt => opt.label.toLowerCase() === searchTerm.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(searchTerm.trim());
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-blue-700 hover:bg-blue-50 transition-colors font-medium border border-dashed border-blue-200 mt-1"
                  >
                    Ajouter "{searchTerm.trim()}"
                    <Plus size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
