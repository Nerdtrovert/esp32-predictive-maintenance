import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { AlertsTimeline } from '../components/cards/AlertsTimeline';
import apiService from '../services/apiService';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAlerts();
        setAlerts(data);
      } catch (err) {
        setError('Failed to load alerts');
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
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