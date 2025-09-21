import React, { useState, createContext, useContext } from 'react';
import { cn } from "@/lib/utils";

// Context để quản lý state của tabs
const TabsContext = createContext();

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within Tabs');
  }
  return context;
};

export const Tabs = ({ 
  className, 
  children, 
  defaultValue, 
  value: controlledValue, 
  onValueChange,
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange && onValueChange(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, children, ...props }) => {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "bg-gray-100 text-gray-500 inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({ 
  className, 
  children, 
  value: triggerValue, 
  disabled = false,
  ...props 
}) => {
  const { value, onValueChange } = useTabsContext();
  const isActive = value === triggerValue;

  const handleClick = () => {
    if (!disabled && triggerValue) {
      onValueChange(triggerValue);
    }
  };

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-700 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        isActive && "bg-white text-gray-900 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ 
  className, 
  children, 
  value: contentValue,
  ...props 
}) => {
  const { value } = useTabsContext();
  const isActive = value === contentValue;

  if (!isActive) return null;

  return (
    <div
      data-slot="tabs-content"
      data-state={isActive ? "active" : "inactive"}
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Hook để sử dụng tabs dễ dàng hơn
export const useTabs = (defaultValue = '') => {
  const [value, setValue] = useState(defaultValue);

  return {
    value,
    onValueChange: setValue,
  };
};