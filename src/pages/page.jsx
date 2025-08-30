import React from 'react';
import Header from '../components/LandingPage/Header';
import Sidebar from '../components/LandingPage/Sidebar';
import NewsFeed from '../components/LandingPage/NewsFeed';
import RightPanel from '../components/LandingPage/RightPanel';
import MainLayout from '../layouts/MainLayout';

export default function LandingPage() {
  return (
    <MainLayout>
      <div className="w-80 p-6 space-y-6">
        <Sidebar />
      </div>
      <div className="flex-1 p-6">
        <NewsFeed />
      </div>
      <div className="w-80 p-6 space-y-6">
        <RightPanel />
      </div>
    </MainLayout>
  );
}
