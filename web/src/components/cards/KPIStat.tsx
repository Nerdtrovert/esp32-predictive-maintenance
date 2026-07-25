import React from 'react';
import { 
  Heart, Gauge, Shield, AlertTriangle, Wrench, 
  Check, TrendingUp, TrendingDown 
} from 'lucide-react';

interface KPIStatProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'accent';
}

export const KPIStat = ({
  title,
  value,
  trend,
  change,
  icon,
  color
}: KPIStatProps) => {
  const IconMap: Record<string, any> = {
    heart: Heart,
    gauge: Gauge,
    shield: Shield,
    'alert-triangle': AlertTriangle,
    wrench: Wrench,
    check: Check
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return null;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'border-primary/20 bg-primary/5';
      case 'success': return 'border-success/20 bg-success/5';
      case 'warning': return 'border-warning/20 bg-warning/5';
      case 'accent': return 'border-accent/20 bg-accent/5';
      default: return 'border-border/20 bg-background/5';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'accent': return 'text-accent';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="p-4 border rounded-lg text-center">
      <div className={`${getColorClass(color)} w-10 h-10 flex items-center justify-center rounded-lg mb-3`}>
        <IconMap[icon] className={`${getIconColor(color)} h-4 w-4`} />
      </div>
      <h3 className="text-sm font-medium text-foreground/60 mb-2">{title}</h3>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {trend !== 'neutral' && change && (
        <div className="flex items-center justify-center mt-2 text-sm">
          <getTrendIcon() className={`h-3 w-3 mr-1 ${trend === 'up' ? 'text-success' : 'text-destructive'}`} />
          <span className={`${trend === 'up' ? 'text-success' : 'text-destructive'}`}>{change}</span>
        </div>
      )}
    </div>
  );
};
