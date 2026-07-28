import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Bell, Zap } from 'lucide-react';
import apiService from '../../services/apiService';

export const RecentAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAlerts = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const data = await apiService.getAlerts();
        if (active) {
          // Limit to top 4 alerts to keep card heights visually balanced
          setAlerts(data.slice(0, 4));
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
    const interval = setInterval(() => fetchAlerts(false), 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <Card className="h-full flex flex-col justify-center min-h-[152px]">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col justify-center min-h-[152px]">
        <CardContent className="flex items-center justify-center p-6 text-destructive text-sm font-medium">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col justify-between min-h-[152px]">
      <CardContent className="flex-1 flex flex-col justify-between p-6">
        <div className="space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start space-x-3 p-3 border border-border/50 border-l-4 border-l-industrial-warning bg-card rounded-r-lg shadow-sm"
              >
                <Zap className="h-4 w-4 text-industrial-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-start justify-between space-x-2">
                    <p className="text-xs font-semibold text-foreground leading-relaxed">
                      {alert.message}
                    </p>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider flex-shrink-0 ${
                      alert.type === 'error'
                        ? 'bg-industrial-danger/10 text-industrial-danger'
                        : 'bg-industrial-warning/10 text-industrial-warning'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground font-medium">
                No recent alerts active
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border/50"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                No more alerts
              </span>
              <div className="flex-grow border-t border-border/50"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};