import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from "@/lib/utils"

export const Tooltip = ({ children, content, className, ...props }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState(null)
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return null
    
    const rect = triggerRef.current.getBoundingClientRect()
    
    // Calculate center position of trigger element
    const centerX = rect.left + rect.width / 2
    
    // Calculate tooltip position (centered below trigger)
    let left = centerX
    let top = rect.bottom + 8
    
    // Get tooltip width if available, otherwise estimate
    const tooltipWidth = tooltipRef.current?.offsetWidth || 0
    const padding = 8
    const viewportWidth = window.innerWidth
    
    // Only adjust if we have tooltip width, otherwise use center position
    if (tooltipWidth > 0) {
      if (left - tooltipWidth / 2 < padding) {
        left = padding + tooltipWidth / 2
      } else if (left + tooltipWidth / 2 > viewportWidth - padding) {
        left = viewportWidth - padding - tooltipWidth / 2
      }
    }
    
    return { top, left }
  }, [])

  const updatePosition = useCallback(() => {
    const newPosition = calculatePosition()
    if (newPosition) {
      setPosition(newPosition)
    }
  }, [calculatePosition])

  useEffect(() => {
    if (isHovered && triggerRef.current) {
      // Calculate initial position immediately
      const initialPosition = calculatePosition()
      if (initialPosition) {
        setPosition(initialPosition)
      }
      
      // Update position after tooltip is rendered to get accurate width
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updatePosition()
        })
      })
      
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    } else {
      setPosition(null)
    }
  }, [isHovered, calculatePosition, updatePosition])

  // Update position when tooltip is rendered and has actual width
  useEffect(() => {
    if (isHovered && position && tooltipRef.current) {
      const tooltipWidth = tooltipRef.current.offsetWidth
      if (tooltipWidth > 0) {
        // Small delay to ensure tooltip is fully rendered
        const timeoutId = setTimeout(() => {
          updatePosition()
        }, 0)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [isHovered, position, updatePosition])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="relative group inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
      {content && isHovered && position && typeof document !== 'undefined' && (
        createPortal(
          <div
            ref={tooltipRef}
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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

