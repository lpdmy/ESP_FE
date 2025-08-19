import React from 'react';
import Header from '../components/LandingPage/Header';
import Sidebar from '../components/LandingPage/Sidebar';
import NewsFeed from '../components/LandingPage/NewsFeed';
import RightPanel from '../components/LandingPage/RightPanel';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Personal</span>
            <span>Free</span>
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">+ Project</span>
            <span className="text-gray-500">Fork of Code dự án đẹp</span>
            <span>Private</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h5l-5 5v-5z" />
              </svg>
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
              Share
            </button>
          </div>
        </div>
      </div>

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
