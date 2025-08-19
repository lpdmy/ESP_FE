import React from 'react';

export const Badge = ({ 
  children, 
  variant = "default", 
  className = "", 
  icon,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    secondary: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    destructive: "bg-red-100 text-red-700 hover:bg-red-200",
    outline: "border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
};
