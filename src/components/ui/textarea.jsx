import React from 'react';

export const Textarea = ({ 
  className = "", 
  rows = 3,
  ...props 
}) => {
  const baseClasses = "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const classes = `${baseClasses} ${className}`;
  
  return (
    <textarea
      className={classes}
      rows={rows}
      {...props}
    />
  );
};
