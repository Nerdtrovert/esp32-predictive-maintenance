import React from 'react';
import {
  Heart, Gauge, Shield, AlertTriangle, Wrench,
  Check, TrendingUp, TrendingDown
} from 'lucide-react';

interface KPIStatProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral' | string;
  change: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'accent' | 'destructive';
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

  const getIconColor = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'accent': return 'text-accent';
      case 'destructive': return 'text-destructive';
      default: return 'text-foreground';
    }
  };

  const getValueColorClass = (titleStr: string, valStr: string) => {
    const t = titleStr.toLowerCase();
    const v = valStr.toLowerCase();
    
    if (t.includes('health')) {
      const num = parseFloat(v.replace('%', ''));
      if (!isNaN(num)) {
        if (num >= 85) return 'text-industrial-success';
        if (num >= 70) return 'text-industrial-warning';
        return 'text-industrial-danger';
      }
      return 'text-industrial-success';
    }
    
    if (t.includes('risk')) {
      if (v.includes('low')) return 'text-industrial-success font-semibold';
      if (v.includes('med')) return 'text-industrial-warning font-semibold';
      if (v.includes('high')) return 'text-industrial-danger font-semibold';
    }
    
    if (t.includes('status')) {
      if (v.includes('online')) {
        const parts = v.split(' ')[0].split('/');
        if (parts.length === 2 && parts[0] === parts[1]) {
          return 'text-industrial-success';
        }
        if (parts.length === 2 && parts[0] === '0') {
          return 'text-industrial-danger';
        }
        return 'text-industrial-warning';
      }
    }
    
    if (t.includes('alert')) {
      const num = parseInt(v);
      if (!isNaN(num)) {
        if (num === 0) return 'text-industrial-success';
        if (num < 5) return 'text-industrial-warning';
        return 'text-industrial-danger';
      }
    }
    
    return 'text-foreground';
  };

  const Icon = IconMap[icon];
  const TrendIcon = getTrendIcon();

  return (
    <div className="p-5 border border-border rounded-xl text-center bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-center space-x-2 mb-3">
        <Icon className={`${getIconColor(color)} h-4 w-4 opacity-60`} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      <p className={`text-3xl font-extrabold ${getValueColorClass(title, value)}`}>{value}</p>
      {trend !== 'neutral' && change && (
        <div className="flex items-center justify-center mt-3 text-xs">
          {TrendIcon && (
            <TrendIcon className={`h-3.5 w-3.5 mr-1 ${
              color === 'success' ? 'text-success' :
              color === 'warning' ? 'text-warning' :
              color === 'destructive' ? 'text-destructive' :
              trend === 'up' ? 'text-success' : 'text-destructive'
            }`} />
          )}
          <span className={`font-medium ${
            color === 'success' ? 'text-success' :
            color === 'warning' ? 'text-warning' :
            color === 'destructive' ? 'text-destructive' :
            trend === 'up' ? 'text-success' : 'text-destructive'
          }`}>{change}</span>
        </div>
      )}
    </div>
  );
};