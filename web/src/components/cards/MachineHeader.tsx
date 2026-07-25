import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Gauge, Thermometer, Activity, Zap } from 'lucide-react';

export const MachineHeader = ({ machine }: { machine: any }) => {
  // Use default data if machine is not provided
  const data = machine || {
    name: 'Press Line Alpha',
    status: 'online',
    health: 94,
    temperature: 72.3,
    vibration: 2.1
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{data.name}</h2>
          <p className="text-sm text-muted-foreground">
            Machine ID: MAC-001 • Status:
            <span className={`${data.status === 'online'
              ? 'text-industrial-success'
              : data.status === 'warning'
                ? 'text-industrial-warning'
                : 'text-industrial-danger'}`}>
              {data.status.toUpperCase()}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 p-2 bg-industrial-blue/10 rounded-lg">
            <Gauge className="h-4 w-4 text-industrial-blue" />
            <span className="text-sm text-industrial-blue">OEE: {data.health}%</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-industrial-success/10 rounded-lg">
            <Activity className="h-4 w-4 text-industrial-success" />
            <span className="text-sm text-industrial-success">{data.status}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-card rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Thermometer className="h-5 w-5 text-industrial-warning" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Temperature</p>
            <p className="text-lg font-semibold">{data.temperature}°C</p>
          </div>
        </div>

        <div className="text-center p-3 bg-card rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Activity className="h-5 w-5 text-industrial-danger" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Vibration</p>
            <p className="text-lg font-semibold">{data.vibration} mm/s</p>
          </div>
        </div>

        <div className="text-center p-3 bg-card rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Zap className="h-5 w-5 text-industrial-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Power</p>
            <p className="text-lg font-semibold">45.2 kW</p>
          </div>
        </div>

        <div className="text-center p-3 bg-card rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Gauge className="h-5 w-5 text-industrial-success" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Pressure</p>
            <p className="text-lg font-semibold">120.5 psi</p>
          </div>
        </div>
      </div>
    </Card>
  );
};