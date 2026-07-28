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

  const getHealthLabel = (h: number) => {
    if (h === 0 || status === 'offline') return { text: 'Disconnected', color: 'text-muted-foreground', dot: '⚪' };
    if (h >= 85) return { text: 'Excellent', color: 'text-industrial-success', dot: '🟢' };
    if (h >= 70) return { text: 'Healthy', color: 'text-industrial-success', dot: '🟢' };
    if (h >= 50) return { text: 'Needs Attention', color: 'text-industrial-warning', dot: '🟡' };
    return { text: 'Critical', color: 'text-industrial-danger', dot: '🔴' };
  };

  const { icon: StatusIcon, color, label } = getStatusConfig();
  const healthConfig = getHealthLabel(health);

  return (
    <div className="p-4 border border-border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full min-h-[152px]">
      <div>
        <div className="flex items-center justify-between mb-2.5 border-b border-border/50 pb-1.5">
          <h3 className="font-semibold text-sm text-foreground">{name}</h3>
          <div className="flex items-center space-x-1.5">
            <StatusIcon className={`h-3.5 w-3.5 ${color}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          {/* Health Row with custom label */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Health</span>
              <div className="flex flex-col items-end -mt-2">
                <span className={`text-sm font-bold ${healthConfig.color}`}>{health}%</span>
                <span className="text-[9px] text-muted-foreground font-semibold flex items-center space-x-1">
                  <span>{healthConfig.dot}</span>
                  <span>{healthConfig.text}</span>
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  health === 0 || status === 'offline' ? 'bg-muted-foreground/30' :
                  health >= 85 ? 'bg-industrial-success' :
                  health >= 70 ? 'bg-industrial-success/85' :
                  health >= 50 ? 'bg-industrial-warning' : 'bg-industrial-danger'
                }`} 
                style={{ width: `${health}%` }}
              ></div>
            </div>
          </div>

          {/* Temperature & Vibration Grid (Compact nested cards) */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            <div className="bg-accent/5 p-2 rounded-lg border border-border/50 flex items-center space-x-2 h-11">
              <Thermometer className="h-4 w-4 text-industrial-warning flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider leading-none mb-0.5">Temp</span>
                <span className="text-xs font-bold text-foreground leading-none truncate">{temperature.toFixed(1)}°C</span>
              </div>
            </div>

            <div className="bg-accent/5 p-2 rounded-lg border border-border/50 flex items-center space-x-2 h-11">
              <Activity className="h-4 w-4 text-industrial-danger flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider leading-none mb-0.5">Vibration</span>
                <span className="text-xs font-bold text-foreground leading-none truncate">{vibration.toFixed(2)} mm/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
