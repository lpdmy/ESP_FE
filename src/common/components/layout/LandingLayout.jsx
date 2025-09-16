import Header from "@/features/landing/components/Header"

export default function LandingLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
