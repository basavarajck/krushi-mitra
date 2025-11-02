
import React, { useState, useEffect, useRef } from 'react';
import { getPriceTrends } from '../services/geminiService';
import { PriceTrendData, FarmerProfile } from '../types';

// Make sure Chart is available on the window object
declare const Chart: any;

interface PriceTrendWidgetProps {
  profile: FarmerProfile;
  isApiKeyMissing: boolean;
}

const PriceTrendWidget: React.FC<PriceTrendWidgetProps> = ({ profile, isApiKeyMissing }) => {
  const [trends, setTrends] = useState<PriceTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        if (isApiKeyMissing) {
          setError("Functionality unavailable: AI service not configured by the administrator.");
          setLoading(false);
          return;
        }
        const trendsString = await getPriceTrends(profile.mainCrop, profile.location);
        const trendsData = JSON.parse(trendsString);
        if (trendsData.error) {
          setError(trendsData.error);
        } else {
          setTrends(trendsData);
        }
      } catch (e) {
        setError('Failed to parse price data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.mainCrop, profile.location, isApiKeyMissing]);

  useEffect(() => {
    if (chartRef.current && trends) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      const allData = [...trends.historical, ...trends.predicted];
      const labels = allData.map(p => p.date.substring(5)); // M-D format
      
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `Historical Price (₹/quintal)`,
            data: trends.historical.map(p => p.price),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            borderWidth: 2,
            pointBackgroundColor: 'rgb(75, 192, 192)',
            pointRadius: 2,
          }, {
            label: 'Predicted Price (₹/quintal)',
            data: [
              ...Array(trends.historical.length -1).fill(null), // empty values for historical part
              trends.historical[trends.historical.length - 1].price, // connect the line
              ...trends.predicted.map(p => p.price)
            ],
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5],
            tension: 0.1,
             borderWidth: 2,
             pointBackgroundColor: 'rgb(255, 99, 132)',
             pointRadius: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                 font: {
                    size: 12
                 }
              }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
          },
          scales: {
             x: {
                ticks: {
                    font: { size: 10 }
                },
                grid: {
                    display: false
                }
             },
             y: {
                ticks: {
                    font: { size: 10 }
                }
             }
          }
        }
      });
    }

     return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trends]);


  if (loading) return <div className="text-center p-8">Loading price data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
      <>
        {trends && (
            <div className="flex flex-col md:flex-row gap-6 h-full">
                <div className="md:w-2/3 h-full min-h-[300px] md:min-h-0 bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                    <div className="h-full relative">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>
                <div className="md:w-1/3">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow space-y-3">
                        <h4 className="font-bold text-lg text-green-700 dark:text-green-300">Market Summary</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{trends.summary}</p>
                    </div>
                </div>
            </div>
        )}
      </>
  );
};

export default PriceTrendWidget;