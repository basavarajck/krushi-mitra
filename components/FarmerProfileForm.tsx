
import React, { useState } from 'react';
import { FarmerProfile } from '../types';
import { LeafIcon } from './icons/Icons';

interface FarmerProfileFormProps {
  onSave: (profile: FarmerProfile) => void;
}

const FarmerProfileForm: React.FC<FarmerProfileFormProps> = ({ onSave }) => {
  const [profile, setProfile] = useState<FarmerProfile>({
    name: '',
    location: '',
    landSize: 0,
    mainCrop: '',
    soilType: 'Loamy',
    irrigationMethod: 'Rain-fed',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'landSize' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.location && profile.landSize > 0 && profile.mainCrop) {
      onSave(profile);
    } else {
      alert('Please fill in all required fields.');
    }
  };
  
  const soilTypes = ["Loamy", "Clay", "Sandy", "Silty", "Peaty", "Chalky"];
  const irrigationMethods = ["Rain-fed", "Canal", "Drip", "Sprinkler", "Well/Tube Well"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center space-y-2">
            <LeafIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Welcome to Krishi Mitra AI</h2>
            <p className="text-center text-gray-600 dark:text-gray-300">Let's create your farm profile to get started.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" name="name" id="name" value={profile.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (e.g., Village, District, State)</label>
                <input type="text" name="location" id="location" value={profile.location} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="landSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Land Size (in acres)</label>
                    <input type="number" name="landSize" id="landSize" value={profile.landSize} onChange={handleChange} required min="0.1" step="0.1" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
                </div>
                <div>
                    <label htmlFor="mainCrop" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Main Crop</label>
                    <input type="text" name="mainCrop" id="mainCrop" value={profile.mainCrop} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
                </div>
            </div>
            <div>
                <label htmlFor="soilType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Soil Type</label>
                <select name="soilType" id="soilType" value={profile.soilType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    {soilTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="irrigationMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Irrigation Method</label>
                <select name="irrigationMethod" id="irrigationMethod" value={profile.irrigationMethod} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    {irrigationMethods.map(method => <option key={method} value={method}>{method}</option>)}
                </select>
            </div>

            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                Save Profile and Continue
            </button>
        </form>
      </div>
    </div>
  );
};

export default FarmerProfileForm;
