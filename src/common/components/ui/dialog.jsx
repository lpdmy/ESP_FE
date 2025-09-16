"use client"

import React from "react"
import { Modal } from "antd"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Dialog - Root component (compatible with Radix API)
const Dialog = ({ children, open, onOpenChange, ...props }) => {
  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange?.(false)}
      footer={null}
      {...props}
    >
      {children}
    </Modal>
  )
}

// DialogTrigger - Trigger component
const DialogTrigger = React.forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
))
DialogTrigger.displayName = "DialogTrigger"

// DialogPortal - Portal component (not needed with Ant Design)
const DialogPortal = ({ children }) => {
  return <>{children}</>
}

// DialogClose - Close component
const DialogClose = React.forwardRef(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
))
DialogClose.displayName = "DialogClose"

// DialogOverlay - Overlay component
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

// DialogContent - Content component
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white p-6 shadow-lg sm:rounded-2xl",
      "data-[state=open]:animate-content-in data-[state=closed]:animate-content-out",
      className
    )}
    {...props}
  >
    {children}
    <button className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
      <X className="h-5 w-5" />
    </button>
  </div>
))
DialogContent.displayName = "DialogContent"

// DialogHeader - Header component
const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

// DialogTitle - Title component
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

// DialogDescription - Description component
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

// DialogFooter - Footer component
const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
}
