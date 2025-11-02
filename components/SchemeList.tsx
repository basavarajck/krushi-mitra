
import React, { useState, useEffect } from 'react';
import { getSchemeReminders } from '../services/geminiService';
import { FarmerProfile, SchemeReminder } from '../types';
import { CalendarIcon } from './icons/Icons';

interface SchemeListProps {
  profile: FarmerProfile;
  isApiKeyMissing: boolean;
}

const SchemeList: React.FC<SchemeListProps> = ({ profile, isApiKeyMissing }) => {
  const [schemes, setSchemes] = useState<SchemeReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        setError(null);
        if (isApiKeyMissing) {
            setError("AI service not configured.");
            setLoading(false);
            return;
        }
        const schemesString = await getSchemeReminders(profile);
        const schemesData = JSON.parse(schemesString);
        if (schemesData.error) {
          setError(schemesData.error);
        } else {
          setSchemes(schemesData);
        }
      } catch (e) {
        setError('Failed to parse scheme data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [profile, isApiKeyMissing]);

  if (loading) {
    return <div className="text-center p-8 text-gray-600 dark:text-gray-300">Finding relevant schemes for you...</div>;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>;
  }

  if (schemes.length === 0) {
    return <div className="text-center p-8 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg">No relevant schemes found at the moment.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schemes.map((scheme, index) => (
        <div key={index} className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 flex flex-col space-y-4 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-300">{scheme.schemeName}</h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">{scheme.description}</p>
            
            <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Eligibility</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{scheme.eligibility}</p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                    <CalendarIcon className="h-5 w-5"/>
                    <span>Deadline: {new Date(scheme.deadline).toLocaleDateString()}</span>
                </div>
                <a 
                    href={scheme.applicationLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full inline-block text-center px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    Learn More & Apply
                </a>
            </div>
        </div>
      ))}
    </div>
  );
};

export default SchemeList;
