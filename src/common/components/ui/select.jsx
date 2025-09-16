import React from "react"
import { cn } from "@/lib/utils"

// Select - Root component (compatible with Radix API)
function Select({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
  placeholder,
  ...props
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        defaultValue={defaultValue}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return (
              <option key={child.props.value} value={child.props.value}>
                {child.props.children}
              </option>
            )
          }
          return null
        })}
      </select>
    </div>
  )
}

// SelectGroup - Group component (not needed for Ant Design)
function SelectGroup({
  children,
  ...props
}) {
  return (
    <div {...props}>
      {children}
    </div>
  )
}

// SelectValue - Value component (not needed for Ant Design)
function SelectValue({
  placeholder,
  ...props
}) {
  return (
    <span {...props}>
      {placeholder}
    </span>
  )
}

// SelectTrigger - Trigger component (not needed for Ant Design)
function SelectTrigger({
  className,
  children,
  ...props
}) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
}

// SelectContent - Content component (not needed for Ant Design)
function SelectContent({
  className,
  children,
  ...props
}){
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
}

// SelectLabel - Label component (not needed for Ant Design)
function SelectLabel({
  className,
  children,
  ...props
}) {
  return (
    <div className={cn("text-sm font-medium text-gray-700 mb-1", className)} {...props}>
      {children}
    </div>
  )
}

// SelectItem - Item component (not needed for Ant Design)
function SelectItem({
  className,
  children,
  value,
  ...props
}) {
  return (
    <div
      className={cn("w-full", className)}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  )
}

// SelectSeparator - Separator component (not needed for Ant Design)
function SelectSeparator({
  className,
  ...props
}) {
  return (
    <div
      className={cn("border-t border-gray-200 my-1", className)}
      {...props}
    />
  )
}

// SelectScrollUpButton - Scroll up button (not needed for Ant Design)
function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("hidden", className)}
      {...props}
    />
  )
}

// SelectScrollDownButton - Scroll down button (not needed for Ant Design)
function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("hidden", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}