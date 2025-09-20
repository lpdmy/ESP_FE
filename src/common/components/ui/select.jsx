import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({ value, onValueChange, children, className = "", ...props }) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {children}
    </div>
  );
};

export const SelectTrigger = ({ children, className = "", ...props }) => {
  const baseClasses = "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50";
  const classes = `${baseClasses} ${className}`;
  
  return (
    <button type="button" className={classes} {...props}>
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ placeholder, className = "", ...props }) => {
  return (
    <span className={`block truncate ${className}`} {...props}>
      {placeholder}
    </span>
  );
};

export const SelectContent = ({ children, className = "", ...props }) => {
  const baseClasses = "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md mt-1 w-full";
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const SelectItem = ({ children, className = "", onSelect, ...props }) => {
  const baseClasses = "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-orange-50 hover:text-orange-900 focus:bg-orange-50 focus:text-orange-900";
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div 
      className={classes} 
      onClick={onSelect}
      {...props}
    >
      {children}
    </div>
  );
};

// Hook để tạo Select component hoạt động
export const useSelect = (initialValue = "") => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target) &&
          contentRef.current && !contentRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    isOpen,
    setIsOpen,
    value,
    setValue,
    triggerRef,
    contentRef
  };
};

// Component chính để sử dụng
export const SimpleSelect = ({ 
  value, 
  onValueChange, 
  placeholder = "Chọn...", 
  options = [], 
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const triggerRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue);
    onValueChange && onValueChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
      >
        <span className="block truncate text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 min-w-full overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg mt-1">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-blue-50 hover:text-blue-900 ${
                selectedValue === option.value ? 'bg-blue-100 text-blue-900' : ''
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};