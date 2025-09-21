import React from 'react';
import { cn } from "@/lib/utils";

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-gray-900", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardDescription = ({ className, children, ...props }) => {
  return (
    <div
      data-slot="card-description"
      className={cn("text-gray-500 text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardAction = ({ className, children, ...props }) => {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};