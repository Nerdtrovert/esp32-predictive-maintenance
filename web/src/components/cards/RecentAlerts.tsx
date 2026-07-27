import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Bell, Loader2, Zap, TrendingUp, CheckCircle2, Info } from 'lucide-react';
import apiService from '../../services/apiService';

export const RecentAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Bell className="h-4 w-4 text-industrial-accent" />
            <h2 className="text-lg font-semibold">Recent Alerts</h2>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-industrial-accent"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Bell className="h-4 w-4 text-industrial-accent" />
            <h2 className="text-lg font-semibold">Recent Alerts</h2>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8 text-destructive">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Bell className="h-4 w-4 text-industrial-accent" />
          <h2 className="text-lg font-semibold">Recent Alerts</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start space-x-3 p-3 rounded-lg border border-border/50"
          >
            {alert.type === 'warning' && (
              <Zap className="h-4 w-4 text-industrial-warning flex-shrink-0" />
            )}
            {alert.type === 'error' && (
              <TrendingUp className="h-4 w-4 text-industrial-danger flex-shrink-0" />
            )}
            {alert.type === 'info' && (
              <Info className="h-4 w-4 text-industrial-info flex-shrink-0" />
            )}
            {alert.type === 'success' && (
              <CheckCircle2 className="h-4 w-4 text-industrial-success flex-shrink-0" />
            )}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground">{alert.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};