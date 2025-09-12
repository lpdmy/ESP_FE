import React from "react"
import { Select as AntSelect } from "antd"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
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
  // Extract SelectItem children and convert to Ant Design options
  const options = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === SelectItem) {
      return {
        value: child.props.value,
        label: child.props.children
      }
    }
    return null
  }).filter(Boolean)

  return (
    <AntSelect
      value={value}
      onChange={onValueChange}
      defaultValue={defaultValue}
      placeholder={placeholder}
      options={options}
      className={className}
      data-slot="select"
      {...props}
    />
  )
}

// SelectGroup - Group component
function SelectGroup({
  children,
  ...props
}) {
  return (
    <div data-slot="select-group" {...props}>
      {children}
    </div>
  )
}

// SelectValue - Value component
function SelectValue({
  placeholder,
  ...props
}) {
  return (
    <span data-slot="select-value" {...props}>
      {placeholder}
    </span>
  )
}

// SelectTrigger - Trigger component
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return (
    <div
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 opacity-50" />
    </div>
  )
}

// SelectContent - Content component
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}){
  return (
    <div
      data-slot="select-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <div
        className={cn(
          "p-1",
          position === "popper" &&
            "h-full w-full scroll-my-1"
        )}
      >
        {children}
      </div>
      <SelectScrollDownButton />
    </div>
  )
}

// SelectLabel - Label component
function SelectLabel({
  className,
  children,
  ...props
}) {
  return (
    <div
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// SelectItem - Item component
function SelectItem({
  className,
  children,
  value,
  ...props
}) {
  return (
    <div
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      data-value={value}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <CheckIcon className="size-4" />
      </span>
      <span>{children}</span>
    </div>
  )
}

// SelectSeparator - Separator component
function SelectSeparator({
  className,
  ...props
}) {
  return (
    <div
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

// SelectScrollUpButton - Scroll up button
function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </div>
  )
}

// SelectScrollDownButton - Scroll down button
function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </div>
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