import React from 'react';

export const Input = React.forwardRef(({ 
  className = "", 
  type = "text",
  ...props 
}, ref) => {
  const baseClasses = "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const classes = `${baseClasses} ${className}`;
  
  return (
    <input
      ref={ref}
      type={type}
      className={classes}
      {...props}
    />
  );
});

Input.displayName = "Input";
