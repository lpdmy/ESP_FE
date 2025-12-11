import React from 'react';
import { cn } from "@/lib/utils";

export const Progress = ({ 
  value = 0, 
  max = 100, 
  className = "",
  size = "default",
  variant = "default",
  showValue = false,
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1",
    default: "h-2", 
    lg: "h-3",
    xl: "h-4"
  };

  const variantClasses = {
    default: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-cyan-500"
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div 
        className={cn(
          "w-full bg-gray-200 rounded-full overflow-hidden",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-sm text-gray-600 text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};
