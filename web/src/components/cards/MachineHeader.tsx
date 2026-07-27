import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Gauge, Thermometer, Activity, Zap } from 'lucide-react';

export const MachineHeader = ({ machine }: { machine: any }) => {
  const data = machine || {
    name: 'Unknown Machine',
    status: 'offline',
    health: 0,
    temperature: 0,
    vibration: 0,
    predicted_temp: 0,
    anomaly_score: 0,
    anomaly: false
  };

  const getAnomalyStatus = (score: number, isAnomaly: boolean) => {
    if (isAnomaly || score >= 75) {
      return {
        label: 'Severe Anomaly',
        color: 'text-industrial-danger',
        iconColor: 'text-industrial-danger'
      };
    }
    if (score >= 60) {
      return {
        label: 'Anomaly',
        color: 'text-industrial-warning',
        iconColor: 'text-industrial-warning'
      };
    }
    return {
      label: 'Normal',
      color: 'text-industrial-success',
      iconColor: 'text-industrial-success'
    };
  };

  const anomalyStatus = getAnomalyStatus(data.anomaly_score, data.anomaly);

  return (
    <Card className="p-6 space-y-4">
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
            <p className="text-xs text-muted-foreground">Predicted Temp</p>
            <p className="text-lg font-semibold">{data.predicted_temp}°C</p>
          </div>
        </div>

        <div className="text-center p-3 bg-card rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Gauge className={`h-5 w-5 ${anomalyStatus.iconColor}`} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Anomaly Status</p>
            <p className={`text-lg font-semibold ${anomalyStatus.color}`}>{anomalyStatus.label}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};