import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from "@/lib/utils"

export const Tooltip = ({ children, content, className, ...props }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  useEffect(() => {
    if (isHovered && triggerRef.current) {
      const updatePosition = () => {
        if (!triggerRef.current) return
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
        })
      }
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isHovered])

  return (
    <>
      <div
        ref={triggerRef}
        className="relative group inline-block"
        onMouseEnter={() => {
          setIsHovered(true)
          // Force immediate position update
          requestAnimationFrame(() => {
            if (triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect()
              setPosition({
                top: rect.bottom + 8,
                left: rect.left + rect.width / 2,
              })
            }
          })
        }}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </div>
      {content && isHovered && typeof document !== 'undefined' && (
        createPortal(
          <div
            className={cn(
              "fixed z-[99999] px-3 py-1.5 text-xs text-white bg-gray-900 rounded-md shadow-lg pointer-events-none whitespace-nowrap",
              "transform -translate-x-1/2",
              "after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-gray-900",
              className
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {content}
          </div>,
          document.body
        )
      )}
    </>
  )
}

export const TooltipProvider = ({ children }) => {
  return <>{children}</>
}

