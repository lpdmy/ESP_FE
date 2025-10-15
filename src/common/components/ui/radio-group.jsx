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
  ...props 
}) => {
  const handleChange = () => {
    onValueChange && onValueChange(value);
  };

  const isSelected = selectedValue === value;
  const id = `radio-${value}`;

  return (
    <div 
      className={cn(
        "flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors",
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200",
        className
      )}
      onClick={handleChange}
    >
      <input
        type="radio"
        id={id}
        name="radio-group"
        value={value}
        checked={isSelected}
        onChange={handleChange}
        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
