import React from 'react';

export const Label = ({ children, className = "", htmlFor, ...props }) => {
  const baseClasses = "text-sm font-medium leading-none text-gray-700 select-none";
  const classes = `${baseClasses} ${className}`;
  
  return (
    <label 
      htmlFor={htmlFor}
      className={classes} 
      {...props}
    >
      {children}
    </label>
  );
};