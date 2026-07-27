import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { AlertsTimeline } from '../components/cards/AlertsTimeline';
import apiService from '../services/apiService';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAlerts = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const data = await apiService.getAlerts();
        if (active) {
          setAlerts(data);
        }
      } catch (err) {
        if (active && isInitial) {
          setError('Failed to load alerts');
        }
        console.error('Error fetching alerts:', err);
      } finally {
        if (active && isInitial) setLoading(false);
      }
    };

    fetchAlerts(true);

    const interval = setInterval(() => {
      fetchAlerts(false);
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <div className="text-center py-8 text-destructive">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alerts</h1>
      <AlertsTimeline alerts={alerts} />
    </div>
  );
};