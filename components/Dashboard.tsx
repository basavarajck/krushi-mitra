
import React from 'react';
import { FarmerProfile } from '../types';
import ChatInterface from './ChatInterface';
import { Page } from '../App';
import { LeafIcon, LogoutIcon, CloudIcon, ChartBarIcon, MegaphoneIcon, ClipboardListIcon, BellIcon } from './icons/Icons';
import AlertsWidget from './AlertsWidget';

interface DashboardProps {
  profile: FarmerProfile;
  onProfileClear: () => void;
  onNavigate: (page: Page) => void;
  isApiKeyMissing: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, onProfileClear, onNavigate, isApiKeyMissing }) => {
  
  const NavButton = ({ page, icon, label }: { page: Page, icon: React.ReactNode, label: string }) => (
      <button 
        onClick={() => onNavigate(page)} 
        className="w-full flex items-center gap-4 p-3 text-left text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all hover:shadow-md"
      >
        {icon}
        <span className="font-semibold">{label}</span>
      </button>
  );

  return (
    <div className="flex flex-col h-screen max-h-screen font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <LeafIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Krishi Mitra AI
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
                <p className="font-semibold text-gray-700 dark:text-gray-200">{profile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.location}</p>
            </div>
            <button
                onClick={onProfileClear}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Logout"
            >
                <LogoutIcon className="h-6 w-6 text-gray-600 dark:text-gray-300"/>
            </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        <div className="lg:col-span-1 p-4 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 overflow-y-auto space-y-6">
          
           <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-300">Farm Profile</h3>
            <div className="space-y-2 text-sm grid grid-cols-2 gap-2">
                <p><strong className="text-gray-600 dark:text-gray-300">Crop:</strong> {profile.mainCrop}</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Land:</strong> {profile.landSize} acres</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Soil:</strong> {profile.soilType}</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Irrigation:</strong> {profile.irrigationMethod}</p>
            </div>
          </div>
          
          <div className="space-y-3">
             <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 px-1">Tools & Insights</h3>
             <NavButton page="activity-log" icon={<ClipboardListIcon className="h-6 w-6 text-purple-500"/>} label="Activity Log" />
             <NavButton page="alerts" icon={<BellIcon className="h-6 w-6 text-orange-500"/>} label="Smart Alerts" />
             <NavButton page="weather" icon={<CloudIcon className="h-6 w-6 text-blue-500"/>} label="Weather Forecast" />
             <NavButton page="price-trends" icon={<ChartBarIcon className="h-6 w-6 text-red-500"/>} label="Price Trends" />
             <NavButton page="schemes" icon={<MegaphoneIcon className="h-6 w-6 text-yellow-500"/>} label="Govt. Schemes" />
          </div>

          <AlertsWidget profile={profile} isApiKeyMissing={isApiKeyMissing} />

        </div>
        
        <div className="lg:col-span-2 flex flex-col h-full">
          <ChatInterface profile={profile} isApiKeyMissing={isApiKeyMissing} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
