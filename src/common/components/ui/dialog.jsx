"use client"

import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

// Context để truyền onOpenChange xuống DialogContent
const DialogContext = React.createContext(null);

function Dialog({
  open,
  onOpenChange,
  children,
  ...props
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={onOpenChange}>
      <div data-slot="dialog" className="fixed inset-0 z-50 flex items-center justify-center" {...props}>
        {children}
      </div>
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  children,
  asChild,
  ...props
}) {
  if (asChild) {
    return React.cloneElement(children, props);
  }
  
  return (
    <div data-slot="dialog-trigger" {...props}>
      {children}
    </div>
  );
}

function DialogPortal({
  ...props
}) {
  return <div data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}) {
  return <div data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onClose,
  ...props
}) {
  const onOpenChange = React.useContext(DialogContext);
  const handleClose = onClose || (() => onOpenChange?.(false));
  
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay onClick={handleClose} />
      <div
        data-slot="dialog-content"
        className={cn(
          "bg-white !p-6 !rounded-lg !shadow-lg !border-0 !outline-none !ring-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 duration-200 w-full max-w-[calc(100%-2rem)] sm:max-w-lg",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        {showCloseButton && (
          <button
            data-slot="dialog-close"
            onClick={handleClose}
            className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

// Hook để quản lý dialog dễ dàng hơn
export const useDialog = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);
  const toggleDialog = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openDialog,
    closeDialog,
    toggleDialog,
    setIsOpen
  };
};