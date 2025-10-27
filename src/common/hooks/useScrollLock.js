import { useEffect } from 'react'

export function useScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      // Lưu scroll position hiện tại
      const scrollY = window.scrollY
      
      // Khóa scroll
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      
      return () => {
        // Khôi phục scroll
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        
        // Khôi phục scroll position
        window.scrollTo(0, scrollY)
      }
    }
  }, [isLocked])
}
