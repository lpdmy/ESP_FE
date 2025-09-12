import React from "react"
import { cn } from "@/lib/utils"

// DropdownMenuTrigger - Trigger component
const DropdownMenuTrigger = React.forwardRef(
  ({ className, children, asChild = false, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        className: cn(
          "focus:outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer",
          className,
          children.props.className
        ),
        ...props
      })
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "focus:outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

// DropdownMenuContent - Content component
const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 8, align = "end", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-50 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

// DropdownMenuItem - Item component
const DropdownMenuItem = React.forwardRef(
  ({ className, children, onClick, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none",
        "transition-colors duration-150",
        "hover:bg-gray-100 hover:text-gray-900",
        "focus:bg-gray-100 focus:text-gray-900",
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuItem.displayName = "DropdownMenuItem"

// DropdownMenuSeparator - Separator component
const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("my-1 h-px bg-gray-200", className)}
      {...props}
    />
  )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

// DropdownMenuGroup - Group component
const DropdownMenuGroup = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

// DropdownMenuPortal - Portal component
const DropdownMenuPortal = ({ children }) => {
  return <>{children}</>
}

// DropdownMenu - Root component
const DropdownMenu = ({ children, onOpenChange, ...props }) => {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef(null)
  
  const handleOpenChange = (newOpen) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
        onOpenChange?.(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onOpenChange])

  // Extract trigger and content from children
  const trigger = React.Children.toArray(children).find(child => 
    React.isValidElement(child) && child.type === DropdownMenuTrigger
  )
  const content = React.Children.toArray(children).find(child => 
    React.isValidElement(child) && child.type === DropdownMenuContent
  )

  return (
    <div ref={dropdownRef} className="relative inline-block" {...props}>
      {React.cloneElement(trigger, {
        onClick: (e) => {
          e.stopPropagation()
          handleOpenChange(!open)
        }
      })}
      {open && content && (
        <div className="absolute right-0 top-full mt-1 z-50">
          {content}
        </div>
      )}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
}