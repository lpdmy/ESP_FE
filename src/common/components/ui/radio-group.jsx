import React from 'react';
import { cn } from "@/lib/utils";

export const RadioGroup = ({ 
  value, 
  onValueChange, 
  children, 
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={cn("space-y-2", className)} 
      role="radiogroup"
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            selectedValue: value,
            onValueChange,
            ...child.props
          });
        }
        return child;
      })}
    </div>
  );
};

export const RadioGroupItem = ({ 
  value, 
  onValueChange, 
  children, 
  className = "",
  selectedValue,
  id,
  ...props 
}) => {
  const handleChange = () => {
    onValueChange && onValueChange(value);
  };

  const isSelected = selectedValue === value;
  const radioId = id || `radio-${value}`;

  return (
    <div 
      className={cn(
        "flex items-center space-x-2 cursor-pointer",
        className
      )}
      onClick={handleChange}
      {...props}
    >
      <input
        type="radio"
        id={radioId}
        name="radio-group"
        value={value}
        checked={isSelected}
        onChange={handleChange}
        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      {children}
    </div>
  );
};
