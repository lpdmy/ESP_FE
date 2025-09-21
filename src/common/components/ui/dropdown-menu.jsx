import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Check, Circle } from 'lucide-react';

export const DropdownMenu = ({ children, ...props }) => {
  return (
    <div className="relative inline-block text-left" {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuTrigger = ({ children, asChild, ...props }) => {
  if (asChild) {
    return React.cloneElement(children, props);
  }
  
  return (
    <div {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuContent = ({ 
  children, 
  align = "start", 
  className = "", 
  sideOffset = 4,
  isOpen,
  onClose,
  ...props 
}) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra xem click có phải từ trigger button không
      const triggerButton = document.querySelector('[data-dropdown-trigger]');
      
      if (ref.current && 
          !ref.current.contains(event.target) && 
          (!triggerButton || !triggerButton.contains(event.target))) {
        onClose && onClose();
      }
    };

    if (isOpen) {
      // Delay một chút để tránh conflict với click trigger
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2", 
    end: "right-0"
  };

  const baseClasses = `absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md ${alignmentClasses[align]}`;
  const classes = `${baseClasses} ${className}`;

  return (
    <div 
      ref={ref}
      className={classes} 
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuGroup = ({ children, className = "", ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ 
  children, 
  className = "", 
  inset = false,
  variant = "default",
  onClick,
  disabled = false,
  ...props 
}) => {
  const baseClasses = "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors";
  const variantClasses = {
    default: "hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900",
    destructive: "text-red-600 hover:bg-red-50 hover:text-red-900 focus:bg-red-50 focus:text-red-900"
  };
  const insetClass = inset ? "pl-8" : "";
  const disabledClass = disabled ? "opacity-50 pointer-events-none" : "";
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${insetClass} ${disabledClass} ${className}`;

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className={classes}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuCheckboxItem = ({ 
  children, 
  checked = false,
  onCheckedChange,
  className = "",
  ...props 
}) => {
  const baseClasses = "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900";
  const classes = `${baseClasses} ${className}`;

  const handleClick = () => {
    onCheckedChange && onCheckedChange(!checked);
  };

  return (
    <div className={classes} onClick={handleClick} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
};

export const DropdownMenuRadioGroup = ({ children, value, onValueChange, ...props }) => {
  return (
    <div {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          groupValue: value, 
          onGroupValueChange: onValueChange 
        })
      )}
    </div>
  );
};

export const DropdownMenuRadioItem = ({ 
  children, 
  value,
  groupValue,
  onGroupValueChange,
  className = "",
  ...props 
}) => {
  const baseClasses = "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900";
  const classes = `${baseClasses} ${className}`;
  
  const isChecked = value === groupValue;

  const handleClick = () => {
    onGroupValueChange && onGroupValueChange(value);
  };

  return (
    <div className={classes} onClick={handleClick} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isChecked && <Circle className="h-2 w-2 fill-current" />}
      </span>
      {children}
    </div>
  );
};

export const DropdownMenuLabel = ({ 
  children, 
  inset = false,
  className = "",
  ...props 
}) => {
  const baseClasses = "px-2 py-1.5 text-sm font-semibold";
  const insetClass = inset ? "pl-8" : "";
  const classes = `${baseClasses} ${insetClass} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuSeparator = ({ className = "", ...props }) => {
  const baseClasses = "-mx-1 my-1 h-px bg-gray-200";
  const classes = `${baseClasses} ${className}`;

  return (
    <div className={classes} {...props} />
  );
};

export const DropdownMenuShortcut = ({ children, className = "", ...props }) => {
  const baseClasses = "ml-auto text-xs tracking-widest opacity-60";
  const classes = `${baseClasses} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

// Hook để quản lý dropdown menu dễ dàng hơn
export const useDropdownMenu = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    setIsOpen
  };
};