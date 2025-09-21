import { useState } from "react"

export default function AdminLayout({ children, header, sidebar }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {header && (
        <div className="fixed top-0 left-0 right-0 z-50">
          {typeof header === 'function' 
            ? header({ sidebarOpen, setSidebarOpen })
            : header
          }
        </div>
      )}

      <div className="flex pt-16">
        {/* Sidebar */}
        {sidebar && (
          <div className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300`}>
            {typeof sidebar === 'function' 
              ? sidebar({ isOpen: sidebarOpen, onClose: () => setSidebarOpen(!sidebarOpen) })
              : sidebar
            }
          </div>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-4" : "ml-4"
          } p-6`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
