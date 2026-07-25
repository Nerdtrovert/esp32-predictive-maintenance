import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, TrendingUp, ShieldCheck, Clock, Wrench } from 'lucide-react';

export const RecommendedActions = () => {
  const recommendations = [
    {
      id: 1,
      title: 'Lubricate Conveyor Belt Bearings',
      description: 'Bearing temperature trending upward on Conveyor Belt Beta. Schedule lubrication to prevent premature wear.',
      priority: 'high',
      dueDate: '2024-01-20',
      category: 'Preventive Maintenance',
      icon: <Wrench className="h-4 w-4 text-industrial-danger" />
    },
    {
      id: 2,
      title: 'Calibrate Press Line Alpha Sensors',
      description: 'Pressure readings showing slight drift. Recalibration recommended for optimal product quality.',
      priority: 'medium',
      dueDate: '2024-01-22',
      category: 'Calibration',
      icon: <CheckCircle2 className="h-4 w-4 text-industrial-warning" />
    },
    {
      id: 3,
      title: 'Inspect Hydraulic Press Gamma Seals',
      description: 'Visual inspection shows minor wear on piston seals. Plan replacement during next maintenance window.',
      priority: 'low',
      dueDate: '2024-01-25',
      category: 'Inspection',
      icon: <ShieldCheck className="h-4 w-4 text-industrial-success" />
    },
    {
      id: 4,
      title: 'Update Robot Arm Epsilon Firmware',
      description: 'Latest firmware version includes performance improvements and bug fixes for motion control.',
      priority: 'medium',
      dueDate: '2024-01-18',
      category: 'Software Update',
      icon: <Clock className="h-4 w-4 text-industrial-accent" />
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Wrench className="h-4 w-4 text-industrial-accent" />
          <h2 className="text-lg font-semibold">Recommended Actions</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="border border-border/50 rounded-lg overflow-hidden">
            <div className="flex items-start space-x-3 p-4">
              <div className="flex-shrink-0">
                {rec.icon}
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
        ))}

        {recommendations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No recommended actions at this time
          </div>
        )}
      </CardContent>
    </Card>
  );
};