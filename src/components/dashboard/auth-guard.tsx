"use client";
import { LogoLoader } from "@/components/ui/logo-loader";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!currentUser) {
      router.push("/login");
      return;
    }

    // If onboarding not completed AND user is owner, block dashboard access
    const needsOnboarding = currentUser.role === "owner" && (!currentUser.onboardingCompleted || !currentUser.shopId);
    if (needsOnboarding && pathname !== "/onboarding") {
      router.push("/onboarding");
      return;
    }
    
    // Monetization: Check subscription plan status
    let isExpired = false;
    if (currentUser.subscriptionStatus === "expired") {
      isExpired = true;
    } else if (currentUser.subscriptionEndDate) {
      const end = new Date(currentUser.subscriptionEndDate).getTime();
      const now = new Date().getTime();
      if (end < now) {
        isExpired = true;
      }
    }
    
    if (isExpired && pathname !== "/dashboard/abonnement") {
      router.push("/dashboard/abonnement");
      return;
    }

    // Check permissions
    if (currentUser.role === "employee") {
      // Employee shouldn't see dashboard root by default unless permitted
      if (pathname === "/dashboard" && !currentUser.permissions.canViewDashboard) {
        router.push("/dashboard/ventes");
      }
      
      // Prohibited routes for employees
      const prohibitedForEmployee = [
        "/dashboard/rapports", 
        "/dashboard/parametres", 
        "/dashboard/fournisseurs", 
        "/dashboard/boutique", 
        "/dashboard/equipe"
      ];
      
      if (prohibitedForEmployee.some(p => pathname.startsWith(p))) {
        router.push("/dashboard/ventes");
      }
    }
  }, [isLoaded, currentUser, router, pathname]);

  if (!isLoaded || !currentUser) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // Prevent rendering dashboard while redirecting to onboarding
  const needsOnboarding = currentUser.role === "owner" && (!currentUser.onboardingCompleted || !currentUser.shopId);
  if (needsOnboarding && pathname !== "/onboarding") {
    return null;
  }
  
  let isExpired = false;
  if (currentUser.subscriptionStatus === "expired") isExpired = true;
  else if (currentUser.subscriptionEndDate && new Date(currentUser.subscriptionEndDate).getTime() < new Date().getTime()) isExpired = true;
  
  if (isExpired && pathname !== "/dashboard/abonnement") {
    return null; // Don't render anything while redirecting
  }
  
  // Render block for prohibited routes to avoid flashing unauthorized content
  if (currentUser.role === "employee") {
    if (pathname === "/dashboard" && !currentUser.permissions.canViewDashboard) return null;
    const prohibitedForEmployee = ["/dashboard/rapports", "/dashboard/parametres", "/dashboard/fournisseurs", "/dashboard/boutique", "/dashboard/equipe"];
    if (prohibitedForEmployee.some(p => pathname.startsWith(p))) return null;
  }

  return <>{children}</>;
}
