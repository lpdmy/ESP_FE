import React from "react"
import { cn } from "@/lib/utils"

// Avatar - Root component
const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
))
Avatar.displayName = "Avatar"

// AvatarImage - Image component
const AvatarImage = React.forwardRef(({ className, src, alt, ...props }, ref) => {
  const [imageError, setImageError] = React.useState(false)
  
  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false)
  }, [src])
  
  if (imageError || !src || src === "") {
    return null
  }
  
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      onError={() => {
        console.log('Image load error, src:', src)
        setImageError(true)
      }}
      {...props}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

// AvatarFallback - Fallback component
const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 text-white font-bold",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
