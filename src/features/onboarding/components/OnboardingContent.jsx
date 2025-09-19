import { useState, useEffect } from "react"
import { Button } from "@common/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import OnboardingScreen0 from "./OnboardingScreen0"
import OnboardingScreen1 from "./OnboardingScreen1"
import OnboardingScreen2 from "./OnboardingScreen2"
import OnboardingScreen3 from "./OnboardingScreen3"

export default function OnboardingContent() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const totalScreens = 4

  const nextScreen = () => {
    if (currentScreen < totalScreens - 1) {
      setCurrentScreen(currentScreen + 1)
    }
  }

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  const goToScreen = (index) => {
    setCurrentScreen(index)
  }

  const skipToEnd = () => {
    setCurrentScreen(totalScreens - 1)
  }

  // Auto advance every 5 second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreen((prev) => {
        if (prev < totalScreens - 1) {
          return prev + 1
        }
        return prev
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        prevScreen()
      } else if (event.key === 'ArrowRight') {
        nextScreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentScreen])

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-6">
       <div className="w-[70px]"></div>

        <div className="flex space-x-2">
          {Array.from({ length: totalScreens }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToScreen(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentScreen
                  ? "bg-gradient-to-r from-orange-400 to-yellow-400 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={skipToEnd}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-2"
        >
          Bỏ qua
        </Button>
      </div>

      <div className="flex-1 flex justify-center items-center px-6 relative">
        {currentScreen > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={prevScreen}
            className="absolute left-4 top-1/3 z-10 text-gray-600 hover:text-gray-800 text-base px-4 py-3"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
          </Button>
        )}

        {currentScreen < totalScreens - 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={nextScreen}
            className="absolute right-4 top-1/3 z-10 text-gray-600 hover:text-gray-800 text-base px-4 py-3"
          >
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        <div className='w-full max-w-4xl'>
          {currentScreen === 0 && <OnboardingScreen0 />}
          {currentScreen === 1 && <OnboardingScreen1 />}
          {currentScreen === 2 && <OnboardingScreen2 />}
          {currentScreen === 3 && <OnboardingScreen3 />}
        </div>
      </div>

    </div>
  )
}
