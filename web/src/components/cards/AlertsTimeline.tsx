import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Bell, Clock, CheckCircle2, Zap, TrendingUp, Loader2, Info } from 'lucide-react';

interface AlertItem {
  id: number;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  time: string;
  severity?: 'low' | 'medium' | 'high';
}

interface AlertsTimelineProps {
  alerts: AlertItem[];
}

export const AlertsTimeline = ({ alerts }: AlertsTimelineProps) => {
  if (!alerts || alerts.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Bell className="h-4 w-4 text-industrial-accent" />
            <h2 className="text-lg font-semibold">Alert Timeline</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center text-muted-foreground">
          <p>No active alerts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Bell className="h-4 w-4 text-industrial-accent" />
          <h2 className="text-lg font-semibold">Alert Timeline</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start space-x-3 p-4 border-l-4 rounded-lg bg-card/50">
            {alert.type === 'warning' && (
              <div className="flex-shrink-0">
                <Zap className="h-5 w-5 text-industrial-warning" />
              </div>
            )}
            {alert.type === 'error' && (
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-industrial-danger" />
              </div>
            )}
            {alert.type === 'info' && (
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-industrial-info" />
              </div>
            )}
            {alert.type === 'success' && (
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-industrial-success" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-sm">{alert.message}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  alert.type === 'warning'
                    ? 'bg-industrial-warning/10 text-industrial-warning'
                    : alert.type === 'error'
                      ? 'bg-industrial-danger/10 text-industrial-danger'
                      : alert.type === 'info'
                        ? 'bg-industrial-info/10 text-industrial-info'
                        : 'bg-industrial-success/10 text-industrial-success'
                }`}>
                  {alert.type.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{alert.time}</p>
              <div className="flex items-center space-x-2 text-xs">
                <div
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    alert.type === 'warning'
                      ? 'bg-industrial-warning/10 text-industrial-warning'
                      : alert.type === 'error'
                        ? 'bg-industrial-danger/10 text-industrial-danger'
                        : alert.type === 'info'
                          ? 'bg-industrial-info/10 text-industrial-info'
                          : 'bg-industrial-success/10 text-industrial-success'
                  }`}
                >
                  {alert.type.toUpperCase()}
                </div>
                <div className="h-2 w-2 rounded-full"
                     style={{ backgroundColor:
                       alert.type === 'warning' ? '#f59e0b' :
                       alert.type === 'error' ? '#ef4444' :
                       alert.type === 'info' ? '3b82f6' :
                       '#10b981' }}></div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};