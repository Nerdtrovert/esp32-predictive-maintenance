import React from 'react';
import { 
  Circle, 
  AlertTriangle, 
  XCircle,
  Thermometer,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface MachineStatusCardProps {
  id: number;
  name: string;
  status: 'online' | 'warning' | 'offline';
  health: number;
  temperature: number;
  vibration: number;
}

export const MachineStatusCard = ({
  id,
  name,
  status,
  health,
  temperature,
  vibration
}: MachineStatusCardProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle2,
          color: 'text-success',
          bg: 'bg-success/5',
          label: 'Online'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-warning',
          bg: 'bg-warning/5',
          label: 'Warning'
        };
      case 'offline':
        return {
          icon: XCircle,
          color: 'text-destructive',
          bg: 'bg-destructive/5',
          label: 'Offline'
        };
      default:
        return {
          icon: Circle,
          color: 'text-muted-foreground',
          bg: 'bg-muted/5',
          label: 'Unknown'
        };
    }
  };

  const { icon: StatusIcon, color, bg, label } = getStatusConfig();

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{name}</h3>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-4 w-4 ${color}`} />
          <span className="text-xs">{label}</span>
        </div>
      </div>
      
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span>Health:</span>
          <span className="font-medium">{health}%</span>
        </div>
        <div className="flex justify-between">
          <span>Temp:</span>
          <span className="font-medium">{temperature}°C</span>
        </div>
        <div className="flex justify-between">
          <span>Vibration:</span>
          <span className="font-medium">{vibration} mm/s</span>
        </div>
      </div>
      
      <div className="h-2 bg-muted/5 rounded-full mt-3 overflow-hidden">
        <div 
          className={`${color.replace('text-', 'bg-')} h-full transition-all duration-500`} 
          style={{ width: `${health}%` }}
        ></div>
      </div>
    </div>
  );
};
