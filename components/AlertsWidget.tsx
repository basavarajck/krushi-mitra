import React, { useState, useEffect } from 'react';
import { getSmartAlerts } from '../services/geminiService';
import { FarmerProfile, SmartAlert, ActivityLog } from '../types';
import { BellIcon } from './icons/Icons';

interface AlertsWidgetProps {
  profile: FarmerProfile;
}

const PriorityIndicator: React.FC<{ priority: SmartAlert['priority'] }> = ({ priority }) => {
  const priorityStyles = {
    High: 'bg-red-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-blue-500',
  };
  return <span className={`w-3 h-3 rounded-full ${priorityStyles[priority]}`}></span>;
};

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ profile }) => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const activityLogs: ActivityLog[] = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        const alertsString = await getSmartAlerts(profile, activityLogs);
        const alertsData = JSON.parse(alertsString);

        if (alertsData.error) {
          setError(alertsData.error);
        } else {
          // Sort by priority and take the top 3
          const sortedAlerts = alertsData.sort((a: SmartAlert, b: SmartAlert) => {
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });
          setAlerts(sortedAlerts.slice(0, 3));
        }
      } catch (e) {
        setError('Failed to parse alert data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [profile]);

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-4 text-green-700 dark:text-green-300 flex items-center gap-2">
        <BellIcon className="h-6 w-6 text-orange-500" />
        Smart Alerts
      </h3>
      
      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Generating latest alerts...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {!loading && !error && alerts.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No new alerts right now. All clear!</p>
      )}

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3">
              <div className="pt-1">
                <PriorityIndicator priority={alert.priority} />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{alert.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsWidget;
