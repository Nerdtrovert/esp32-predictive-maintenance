import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CheckCircle2, ShieldCheck, Clock, Wrench } from 'lucide-react';
import apiService from '../../services/apiService';

export const RecommendedActions = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const IconMap: Record<string, any> = {
    wrench: Wrench,
    'check-circle': CheckCircle2,
    'shield-check': ShieldCheck,
    clock: Clock
  };

  useEffect(() => {
    let active = true;
    const fetchRecs = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const data = await apiService.getMaintenanceRecommendations();
        if (active) {
          setRecommendations(data);
        }
      } catch (err) {
        if (active && isInitial) {
          setError('Failed to load recommended actions');
        }
        console.error('Error fetching maintenance recommendations:', err);
      } finally {
        if (active && isInitial) setLoading(false);
      }
    };

    fetchRecs(true);

    const interval = setInterval(() => {
      fetchRecs(false);
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const defaultRecommendations = [
    {
      id: 1,
      title: 'Lubricate Conveyor Belt Bearings',
      description: 'Bearing temperature trending upward on Conveyor Belt Beta. Schedule lubrication to prevent premature wear.',
      priority: 'high',
      dueDate: '2026-07-28',
      category: 'Preventive Maintenance',
      icon: 'wrench'
    },
    {
      id: 2,
      title: 'Calibrate Press Line Alpha Sensors',
      description: 'Pressure readings showing slight drift. Recalibration recommended for optimal product quality.',
      priority: 'medium',
      dueDate: '2026-07-30',
      category: 'Calibration',
      icon: 'check-circle'
    },
    {
      id: 3,
      title: 'Inspect Hydraulic Press Gamma Seals',
      description: 'Visual inspection shows minor wear on piston seals. Plan replacement during next maintenance window.',
      priority: 'low',
      dueDate: '2026-08-05',
      category: 'Inspection',
      icon: 'shield-check'
    },
    {
      id: 4,
      title: 'Update Robot Arm Epsilon Firmware',
      description: 'Latest firmware version includes performance improvements and bug fixes for motion control.',
      priority: 'medium',
      dueDate: '2026-07-28',
      category: 'Software Update',
      icon: 'clock'
    }
  ];

  const displayData = loading || error || recommendations.length === 0 ? defaultRecommendations : recommendations;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-industrial-danger';
      case 'medium':
        return 'text-industrial-warning';
      default:
        return 'text-industrial-success';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Wrench className="h-4 w-4 text-industrial-accent" />
          <h2 className="text-lg font-semibold">Recommended Actions</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayData.map((rec) => {
          const IconComponent = IconMap[rec.icon] || Wrench;
          const priorityColor = getPriorityColor(rec.priority);
          return (
            <div key={rec.id} className="border border-border/50 rounded-lg overflow-hidden">
              <div className="flex items-start space-x-3 p-4">
                <div className="flex-shrink-0">
                  <IconComponent className={`h-4 w-4 ${priorityColor}`} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm">{rec.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      rec.priority === 'high'
                        ? 'bg-industrial-danger/10 text-industrial-danger'
                        : rec.priority === 'medium'
                        ? 'bg-industrial-warning/10 text-industrial-warning'
                        : 'bg-industrial-success/10 text-industrial-success'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Due: {rec.dueDate}</span>
                    <span>•</span>
                    <span>{rec.category}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {displayData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No recommended actions at this time
          </div>
        )}
      </CardContent>
    </Card>
  );
};