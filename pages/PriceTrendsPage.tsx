
import React from 'react';
import { FarmerProfile } from '../types';
import { Page } from '../App';
import PriceTrendWidget from '../components/PriceTrendWidget';
import { LeafIcon, ArrowLeftIcon, ChartBarIcon } from '../components/icons/Icons';


interface PriceTrendsPageProps {
  profile: FarmerProfile;
  onNavigate: (page: Page) => void;
  isApiKeyMissing: boolean;
}

const PriceTrendsPage: React.FC<PriceTrendsPageProps> = ({ profile, onNavigate, isApiKeyMissing }) => {
  return (
    <div className="flex flex-col h-screen max-h-screen font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <LeafIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Krishi Mitra AI
          </h1>
        </div>
        <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
            <ArrowLeftIcon className="h-5 w-5"/>
            Back to Dashboard
        </button>
      </header>
      
      <main className="flex-1 flex flex-col p-6 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
        <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <ChartBarIcon className="h-8 w-8 text-red-500" />
                <span>Price Trend Analysis for {profile.mainCrop}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
                Market price trends for {profile.location}.
            </p>
        </div>
        <div className="flex-1">
             <PriceTrendWidget profile={profile} isApiKeyMissing={isApiKeyMissing} />
        </div>
      </main>
    </div>
  );
};

export default PriceTrendsPage;
