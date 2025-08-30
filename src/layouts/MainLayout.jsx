import Header from '../components/LandingPage/Header';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <Header />
      {/* Main Content */}
      <div className="flex">
        {/* Main Content Area */}
          {children}
        </div>
    </div>
  );
}