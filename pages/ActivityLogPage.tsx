import React, { useState, useEffect } from 'react';
import { FarmerProfile, ActivityLog } from '../types';
import { Page } from '../App';
import { LeafIcon, ArrowLeftIcon, ClipboardListIcon } from '../components/icons/Icons';

interface ActivityLogPageProps {
  profile: FarmerProfile;
  onNavigate: (page: Page) => void;
}

const ActivityLogForm: React.FC<{ onSave: (log: ActivityLog) => void }> = ({ onSave }) => {
    const today = new Date().toISOString().split('T')[0];
    const [activity, setActivity] = useState<Omit<ActivityLog, 'id'>>({
        date: today,
        activityType: 'Observation',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activity.notes.trim()) {
            onSave({ ...activity, id: new Date().toISOString() });
            setActivity({ date: today, activityType: 'Observation', notes: '' });
        } else {
            alert('Please enter some notes for the activity.');
        }
    };
    
    const activityTypes: ActivityLog['activityType'][] = ['Sowing', 'Irrigation', 'Fertilization', 'Pest Control', 'Harvesting', 'Observation'];

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Log a New Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input type="date" id="date" value={activity.date} onChange={e => setActivity(p => ({...p, date: e.target.value}))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" required />
                </div>
                <div>
                    <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Type</label>
                    <select id="activityType" value={activity.activityType} onChange={e => setActivity(p => ({...p, activityType: e.target.value as ActivityLog['activityType']}))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" required>
                        {activityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
            </div>
            <div>
                 <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes / Observations</label>
                 <textarea id="notes" value={activity.notes} onChange={e => setActivity(p => ({...p, notes: e.target.value}))} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="e.g., Applied 50kg of urea, noticed some yellowing on lower leaves..." required></textarea>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                Save Activity
            </button>
        </form>
    );
};


const ActivityLogPage: React.FC<ActivityLogPageProps> = ({ profile, onNavigate }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('activityLogs');
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
    } catch (error) {
      console.error("Failed to load activity logs from localStorage", error);
    }
  }, []);

  const handleSaveLog = (newLog: ActivityLog) => {
    const updatedLogs = [...logs, newLog].sort((a,b) => b.date.localeCompare(a.date));
    setLogs(updatedLogs);
    localStorage.setItem('activityLogs', JSON.stringify(updatedLogs));
  };


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
      
      <main className="flex-1 flex flex-col p-6 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto space-y-6">
        <div className="mb-2">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <ClipboardListIcon className="h-8 w-8 text-purple-500" />
                <span>Farm Activity Log</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
                Keep a record of your farming activities to get better insights.
            </p>
        </div>
        
        <ActivityLogForm onSave={handleSaveLog} />

        <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Activity History</h3>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {logs.length > 0 ? logs.map(log => (
                    <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border-l-4 border-green-500">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-green-700 dark:text-green-300">{log.activityType}</span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{new Date(log.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{log.notes}</p>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No activities logged yet. Add one above to get started!</p>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityLogPage;
