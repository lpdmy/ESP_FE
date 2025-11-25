import React from 'react';
import { cn } from "@/lib/utils";

export const Table = ({ className, children, ...props }) => {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ className, children, ...props }) => {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:", className)}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ className, children, ...props }) => {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:", className)}
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableFooter = ({ className, children, ...props }) => {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-gray-50  font-medium [&>tr]:last:-0",
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
};

export const TableRow = ({ className, children, noHover = false, ...props }) => {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        noHover ? "" : "hover:bg-gray-50 data-[state=selected]:bg-gray-100 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ className, children, ...props }) => {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-gray-900 h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell = ({ className, children, ...props }) => {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
};

export const TableCaption = ({ className, children, ...props }) => {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-gray-500 mt-4 text-sm", className)}
      {...props}
    >
      {children}
    </caption>
  );
};