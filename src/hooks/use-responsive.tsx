import * as React from "react"

export const BREAKPOINTS = {
  mobile: 640,    // sm
  tablet: 768,    // md
  desktop: 1024,  // lg
  wide: 1280      // xl
} as const

export function useResponsive() {
  const [windowWidth, setWindowWidth] = React.useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call once to set initial value

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    isMobile: windowWidth < BREAKPOINTS.mobile,
    isTablet: windowWidth >= BREAKPOINTS.mobile && windowWidth < BREAKPOINTS.desktop,
    isDesktop: windowWidth >= BREAKPOINTS.desktop,
    isCompact: windowWidth < BREAKPOINTS.desktop, // Mobile or tablet
    windowWidth
  }
}