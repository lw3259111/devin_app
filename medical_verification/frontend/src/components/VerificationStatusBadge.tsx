import React from "react";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

type VerificationStatus = "pending" | "approved" | "rejected" | "needs_review";

interface VerificationStatusBadgeProps {
  status: VerificationStatus;
  size?: "sm" | "md" | "lg";
}

export default function VerificationStatusBadge({ 
  status, 
  size = "md" 
}: VerificationStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          icon: <CheckCircle className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          label: "已通过",
          variant: "outline",
          className: "bg-green-50 text-green-700 border-green-200"
        };
      case "rejected":
        return {
          icon: <XCircle className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          label: "已拒绝",
          variant: "outline",
          className: "bg-red-50 text-red-700 border-red-200"
        };
      case "needs_review":
        return {
          icon: <AlertTriangle className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          label: "需要审核",
          variant: "outline",
          className: "bg-yellow-50 text-yellow-700 border-yellow-200"
        };
      case "pending":
      default:
        return {
          icon: <Clock className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          label: "待审核",
          variant: "outline",
          className: "bg-blue-50 text-blue-700 border-blue-200"
        };
    }
  };

  const config = getStatusConfig();
  
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
