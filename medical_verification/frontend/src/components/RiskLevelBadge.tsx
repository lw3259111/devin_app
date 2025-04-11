import React from "react";
import { Badge } from "./ui/badge";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

type RiskLevel = "low" | "medium" | "high";

interface RiskLevelBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
}

export default function RiskLevelBadge({ 
  level, 
  size = "md" 
}: RiskLevelBadgeProps) {
  const getRiskConfig = () => {
    switch (level) {
      case "low":
        return {
          icon: <ShieldCheck className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          label: "低风险",
          variant: "outline",
          className: "bg-green-50 text-green-700 border-green-200"
        };
      case "medium":
        return {
          icon: <AlertTriangle className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          label: "中等风险",
          variant: "outline",
          className: "bg-yellow-50 text-yellow-700 border-yellow-200"
        };
      case "high":
        return {
          icon: <ShieldAlert className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          label: "高风险",
          variant: "outline",
          className: "bg-red-50 text-red-700 border-red-200"
        };
      default:
        return {
          icon: <ShieldCheck className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          label: "未知风险",
          variant: "outline",
          className: "bg-gray-50 text-gray-700 border-gray-200"
        };
    }
  };

  const config = getRiskConfig();
  
  return (
    <Badge 
      variant="outline" 
      className={`flex items-center ${config.className} ${size === "sm" ? "text-xs py-0 px-2" : "text-sm py-1 px-3"}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
