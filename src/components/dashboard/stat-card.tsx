import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendText?: string;
  trendType?: "up" | "down" | "neutral" | "alert";
  icon: React.ElementType;
  iconColorClass: string;
  iconBgClass: string;
}

export function StatCard({ 
  title, 
  value, 
  subValue,
  trend, 
  trendText, 
  trendType,
  icon: Icon, 
  iconColorClass, 
  iconBgClass 
}: StatCardProps) {
  
  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", iconBgClass)}>
            <Icon size={16} className={iconColorClass} />
          </div>
        </div>
        
        <div className="flex items-baseline gap-1 mb-2">
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {subValue && <span className="text-sm font-medium text-slate-400">{subValue}</span>}
        </div>
        
        {trend && (
          <div className="flex items-center gap-1.5 mt-3">
            {trendType === "up" && <TrendingUp size={14} className="text-green-500" />}
            {trendType === "down" && <TrendingDown size={14} className="text-red-500" />}
            {trendType === "alert" && <AlertTriangle size={14} className="text-red-500" />}
            
            <span className={cn(
              "text-xs font-bold",
              trendType === "up" ? "text-green-600" : 
              trendType === "down" || trendType === "alert" ? "text-red-600" : 
              "text-slate-600"
            )}>
              {trend}
            </span>
            {trendText && (
              <span className={cn(
                "text-xs",
                trendType === "alert" ? "text-red-500 font-medium" : "text-slate-400"
              )}>
                {trendText}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        
        <div className="flex items-baseline gap-1 mb-2">
          <Skeleton className="h-8 w-32" />
        </div>
        
        <div className="flex items-center gap-1.5 mt-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
