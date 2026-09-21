"use client";

import { useAuth } from "@/hooks/auth";

export function ThemeInjector() {
  const { currentUser } = useAuth();
  if (!currentUser?.themeColor) return null;
  
  return (
    <style suppressHydrationWarning dangerouslySetInnerHTML={{
      __html: `
        :root {
          --theme-color: ${currentUser.themeColor};
        }
        .bg-primary { background-color: ${currentUser.themeColor} !important; color: #fff !important; }
        .text-primary { color: ${currentUser.themeColor} !important; }
        .border-primary { border-color: ${currentUser.themeColor} !important; }
        .hover\\:bg-primary\\/90:hover { opacity: 0.9 !important; }
      `
    }} />
  );
}
