import * as React from "react"
import { cn } from "@/lib/utils"

function Table({
  className,
  title,
  description,
  actions,
  headerClassName,
  variant = "default",
  ...props
}) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full overflow-x-auto px-6",
        variant === "admin"
          ? "rounded-2xl border border-gray-200 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
          : "rounded-md border shadow-sm",
      )}
    >
      {(title || description || actions) && (
        <div className={cn("w-full py-4 flex items-start justify-between", headerClassName)}>
          <div className="flex flex-col gap-1.5">
            {title && (
              <div className="text-[20px] leading-7 font-semibold text-[#0A0A0A]">
                {title}
              </div>
            )}
            {description && (
              <div className="text-sm leading-5 font-normal text-[#737373]">
                {description}
              </div>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, sticky = false, variant = "default", ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b",
        variant === "admin" && "border-b border-gray-200",
        sticky && "[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-background",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, striped = false, variant = "default", ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        variant === "admin" && "",
        striped && "[&_tr:nth-child(even)]:bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

function TableFooter({ className, variant = "default", ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, variant = "default", ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        variant === "admin" && "border-gray-200",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, variant = "default", ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        variant === "admin"
          ? "h-10 px-2 py-2.5 text-sm"
          : "h-10 px-2",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, variant = "default", ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        variant === "admin" ? "px-2 py-3.5" : "p-2",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}