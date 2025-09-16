import React from "react"
import { Avatar as AntAvatar } from "antd"

import { cn } from "@/lib/utils"

// Avatar - Root component (compatible with Radix API)
const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
))
Avatar.displayName = "Avatar"

// AvatarImage - Image component
const AvatarImage = React.forwardRef(({ className, src, alt, ...props }, ref) => (
  <AntAvatar
    ref={ref}
    src={src}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

// AvatarFallback - Fallback component
const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => (
  <AntAvatar
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  >
    {children}
  </AntAvatar>
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
