import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      className={cn(
        "focus:outline-none focus:ring-0 focus:ring-offset-0",
        className
      )}
      {...props}
    />
  )
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 8, align = "start", ...props }, ref) => (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          // Enhanced Glass morphism effect
          "z-50 min-w-[10rem] overflow-hidden rounded-xl border border-white/30 bg-white/15 backdrop-blur-xl p-1.5 shadow-2xl",
          // Frosted glass texture
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/25 before:via-white/15 before:to-white/8",
          "before:border before:border-white/40 before:shadow-inner",
          // Additional glass layers for depth
          "after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-t after:from-transparent after:via-white/5 after:to-white/10",
          // Enhanced glass effect when open
          "data-[state=open]:bg-white/25 data-[state=open]:backdrop-blur-2xl data-[state=open]:shadow-3xl",
          "data-[state=open]:before:from-white/35 data-[state=open]:before:via-white/20 data-[state=open]:before:to-white/12",
          "data-[state=open]:before:border-white/50",
          // Radix UI animation classes (customized via CSS)
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          className
        )}
        {...props}
      />
    </DropdownMenuPortal>
  )
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "transition-colors duration-200",
        "focus:bg-gray-100 focus:text-gray-900",
        "hover:bg-blue-50 hover:text-gray-900",
        className
      )}
      {...props}
    />
  )
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("my-1 h-px bg-gray-200", className)}
      {...props}
    />
  )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
}
