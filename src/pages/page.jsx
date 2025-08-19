import React from 'react';
import Header from '../components/LandingPage/Header';
import Sidebar from '../components/LandingPage/Sidebar';
import NewsFeed from '../components/LandingPage/NewsFeed';
import RightPanel from '../components/LandingPage/RightPanel';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <Header />

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 p-6 space-y-6">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <NewsFeed />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 space-y-6">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
