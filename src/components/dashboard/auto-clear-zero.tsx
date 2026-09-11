"use client";

import { useEffect } from "react";

export function AutoClearZero() {
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLInputElement;
      if (!target || target.tagName !== "INPUT") return;

      // Detect number inputs or numeric/decimal fields
      const isNumberField = 
        target.type === "number" || 
        target.inputMode === "numeric" || 
        target.inputMode === "decimal";

      if (isNumberField) {
        if (target.value === "0" || target.value === "0.00" || target.value === "0,00") {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
          )?.set;

          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(target, "");
          } else {
            target.value = "";
          }

          // Trigger React synthetic change/input events
          target.dispatchEvent(new Event("input", { bubbles: true }));
          target.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    };

    document.addEventListener("focusin", handleFocusIn, true);
    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, []);

  return null;
}
