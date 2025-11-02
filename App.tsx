
import React, { useState, useEffect } from 'react';
import { FarmerProfile as FarmerProfileType } from './types';
import FarmerProfileForm from './components/FarmerProfileForm';
import Dashboard from './components/Dashboard';
import WeatherPage from './pages/WeatherPage';
import PriceTrendsPage from './pages/PriceTrendsPage';
import SchemesPage from './pages/SchemesPage';
import ActivityLogPage from './pages/ActivityLogPage';
import AlertsPage from './pages/AlertsPage';

export type Page = 'dashboard' | 'weather' | 'price-trends' | 'schemes' | 'activity-log' | 'alerts';

const App: React.FC = () => {
  const [profile, setProfile] = useState<FarmerProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('farmerProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error("Failed to parse farmer profile from localStorage", error);
      localStorage.removeItem('farmerProfile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleProfileSave = (newProfile: FarmerProfileType) => {
    localStorage.setItem('farmerProfile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setCurrentPage('dashboard');
  };
  
  const handleProfileClear = () => {
    localStorage.removeItem('farmerProfile');
    setProfile(null);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (!profile) {
      return <FarmerProfileForm onSave={handleProfileSave} />;
    }
    
    switch (currentPage) {
      case 'weather':
        return <WeatherPage profile={profile} onNavigate={handleNavigate} />;
      case 'price-trends':
        return <PriceTrendsPage profile={profile} onNavigate={handleNavigate} />;
      case 'schemes':
        return <SchemesPage profile={profile} onNavigate={handleNavigate} />;
      case 'activity-log':
        return <ActivityLogPage profile={profile} onNavigate={handleNavigate} />;
      case 'alerts':
        return <AlertsPage profile={profile} onNavigate={handleNavigate} />;
      case 'dashboard':
      default:
        return <Dashboard profile={profile} onProfileClear={handleProfileClear} onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50 dark:bg-gray-900">
        <div className="text-2xl font-semibold text-green-800 dark:text-green-300">Loading Krishi Mitra AI...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {renderPage()}
    </div>
  );
};

export default App;