import React, { useState, createContext, useContext } from "react"

const TabsContext = createContext()

// Wrapper Tabs
export function Tabs({ defaultValue, children, className = "" }) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

// Tab list (chứa triggers)
export function TabsList({ children, className = "" }) {
  return (
    <div className={`flex rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

// Nút chuyển tab
export function TabsTrigger({ value, children, className = "" }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  const isActive = activeTab === value
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`
        flex-1 px-4 py-2 text-center font-medium transition-colors
        ${isActive ? "bg-orange-500 text-white" : "bg-white/50 text-gray-700 hover:bg-orange-100"}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

// Nội dung mỗi tab
export function TabsContent({ value, children, className = "" }) {
  const { activeTab } = useContext(TabsContext)
  if (activeTab !== value) return null
  return <div className={`mt-4 ${className}`}>{children}</div>
}