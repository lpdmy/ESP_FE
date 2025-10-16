import { Loader2, Sparkles } from "lucide-react"
import { Button } from "./button"
import "./loading.css"

export function Loading({ 
  size = "default", 
  text = "Đang tải...", 
  className = "",
  showText = true,
  variant = "default"
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }

  const textSizeClasses = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  }

  const variantClasses = {
    default: "text-gray-600",
    primary: "text-orange-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600"
  }

  if (variant === "sparkle") {
    return (
      <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 animate-pulse"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white animate-bounce" />
        </div>
        {showText && (
          <p className={`font-medium ${textSizeClasses[size]} ${variantClasses[variant]}`}>
            {text}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <Loader2 className={`animate-spin ${sizeClasses[size]} text-orange-500`} />
        <div className={`absolute inset-0 rounded-full border-2 border-orange-200 animate-ping ${sizeClasses[size]}`}></div>
      </div>
      {showText && (
        <p className={`font-medium ${textSizeClasses[size]} ${variantClasses[variant]}`}>
          {text}
        </p>
      )}
    </div>
  )
}

export function LoadingOverlay({ 
  isLoading, 
  text = "Đang xử lý...",
  className = "",
  variant = "default"
}) {
  if (!isLoading) return null

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 animate-in fade-in-0 zoom-in-95 duration-300">
        <Loading text={text} size="lg" variant={variant} />
      </div>
    </div>
  )
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = "Đang xử lý...",
  className = "",
  variant = "default",
  ...props 
}) {
  // Remove isLoading from props to prevent it from being passed to DOM
  const { isLoading: _, ...buttonProps } = { isLoading, ...props };
  
  return (
    <Button 
      className={`relative overflow-hidden transition-all duration-200 ${isLoading ? 'cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading}
      {...buttonProps}
    >
      {isLoading && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </>
      )}
      <span className={`transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}>
        {isLoading ? loadingText : children}
      </span>
    </Button>
  )
}
export function LoadingCollection({ 
  isLoading, 
  className = "",
  variant = "default"
}) {
  if (!isLoading) return null;

  return (
    <div className={`absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center z-10 ${className}`}>
     <div className="backdrop-blur-md  animate-in fade-in-0 zoom-in-95 duration-300">
        <Loading size="lg" variant={variant} />
      </div>
    </div>
  );
}

export function LoadingCard({ 
  isLoading, 
  children, 
  text = "Đang tải...",
  className = "",
  variant = "default"
}) {
  if (isLoading) {
    return (
      <div className={`p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 ${className}`}>
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <Loading text={text} size="lg" variant={variant} />
        </div>
      </div>
    )
  }

  return children
}
