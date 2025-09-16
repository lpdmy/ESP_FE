export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}