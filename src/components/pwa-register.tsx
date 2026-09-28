"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log("Service Worker enregistré avec succès.", registration.scope);
          },
          function (err) {
            console.log("Échec de l'enregistrement du Service Worker : ", err);
          }
        );
      });
    }
  }, []);

  return null;
}
