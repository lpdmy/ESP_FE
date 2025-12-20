import React from 'react';
import { cn } from "@/lib/utils";

export const Alert = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="alert"
      role="alert"
      className={cn(
        "relative flex items-start gap-3 rounded-lg border p-4 [&>svg]:flex-shrink-0 [&>svg]:mt-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Alert.displayName = "Alert";

export const AlertDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="alert-description"
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  );
});

AlertDescription.displayName = "AlertDescription";

