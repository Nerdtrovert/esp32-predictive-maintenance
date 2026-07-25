import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Activity,
  Users,
  Package,
  Clock
} from 'lucide-react';
import apiService from '../../services/apiService';

export const QuickSummary = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await apiService.getQuickSummary();
        setSummary(data);
      } catch (err) {
        setError('Failed to load summary');
        console.error('Error fetching summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Default data in case of loading or error
  const defaultSummary = [
    {
      label: "Overall Equipment Effectiveness",
      value: "87%",
      icon: Activity
    },
    {
      label: "Active Operators",
      value: "12",
      icon: Users
    },
    {
      label: "Units Produced Today",
      value: "1,248",
      icon: Package
    },
    {
      label: "Average Cycle Time",
      value: "45s",
      icon: Clock
    }
  ];

  const displayData = loading || error ? defaultSummary : summary;

  if (loading) {
    return (
      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(null).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-4 bg-card">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
            <div>
              <h3 className="text-sm font-medium text-foreground/60">Loading...</h3>
              <p className="text-lg font-semibold text-foreground">-</p>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayData.map((item, index) => (
          <div key={index} className="flex items-center space-x-3 p-4 bg-card">
            <item.icon className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-medium text-foreground/60">{item.label}</h3>
              <p className="text-lg font-semibold text-destructive">Error loading data</p>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  return (
    <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {displayData.map((item, index) => (
        <div key={index} className="flex items-center space-x-3 p-4 bg-card">
          <item.icon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-medium text-foreground/60">{item.label}</h3>
            <p className="text-lg font-semibold text-foreground">{item.value}</p>
          </div>
        </div>
      ))}
    </Card>
  );
};