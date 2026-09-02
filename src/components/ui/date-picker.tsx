"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function DatePicker({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize current view date to selected date or today
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const days = [];
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    // Format to YYYY-MM-DD avoiding timezone issues
    const offset = newDate.getTimezoneOffset();
    const formatted = new Date(newDate.getTime() - (offset*60*1000)).toISOString().split('T')[0];
    onChange(formatted);
    setIsOpen(false);
  };

  const formattedDisplayDate = value 
    ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : "";

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none",
          isOpen
            ? "border-blue-400 ring-2 ring-blue-100 shadow-sm"
            : "border-slate-200 hover:border-blue-300",
          disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "text-slate-800"
        )}
      >
        <CalendarIcon size={16} className="text-slate-500 shrink-0" />
        <span className={cn("truncate flex-1 text-left", !value && "text-slate-400")}>
          {value ? formattedDisplayDate : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-[260px] p-3 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-100 right-0 sm:right-auto sm:left-0">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="font-semibold text-slate-800 text-sm">
              {MONTHS[currentMonth]} {currentYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-[11px] font-medium text-slate-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-7 w-7" />;
              }
              
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-lg text-xs transition-colors mx-auto",
                    isSelected
                      ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-200"
                      : isToday
                      ? "bg-slate-100 text-blue-600 font-semibold hover:bg-slate-200"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
