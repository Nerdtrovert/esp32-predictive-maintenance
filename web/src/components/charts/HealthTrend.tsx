import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, ShieldCheck, Activity, Zap } from 'lucide-react';
import apiService from '../../services/apiService';

export const HealthTrend = ({ machineId = 1 }: { machineId?: number }) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchHealthData = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const data = await apiService.getMachineHealth(machineId);
        if (active) {
          setHealthData(data);
        }
      } catch (err) {
        if (active && isInitial) {
          setError('Failed to load health data');
        }
        console.error('Error fetching health data:', err);
      } finally {
        if (active && isInitial) setLoading(false);
      }
    };

    fetchHealthData(true);

    const interval = setInterval(() => {
      fetchHealthData(false);
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [machineId]);

  // Mock data for fallback
  const mockHealthData = {
    current_health: 94,
    health_trend: Array.from({ length: 24 }, (_, i) => 85 + Math.sin(i * 0.3) * 10 + Math.random() * 5),
    hours: Array.from({ length: 24 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`),
    indicators: {
      temperature_stability: "Good",
      vibration_levels: "Moderate",
      power_efficiency: "Optimal",
      maintenance_status: "Good"
    }
  };

  const data = healthData || mockHealthData;

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-4 w-4 text-industrial-success" />
            <h2 className="text-lg font-semibold">Machine Health Trend</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-4 w-4 text-industrial-success" />
            <h2 className="text-lg font-semibold">Machine Health Trend</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center text-destructive">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="h-4 w-4 text-industrial-success" />
          <h2 className="text-lg font-semibold">Machine Health Trend</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-4 w-4 text-industrial-success" />
              <h3 className="text-sm font-medium text-foreground/60">Overall Health Score</h3>
            </div>
            <div className="text-right space-y-1">
              <p className="text-lg font-semibold text-industrial-success">
                {data.current_health}%
              </p>
              <p className="text-xs text-muted-foreground">
                {data.current_health >= 90 ? '+2.3% from yesterday' : '-1.2% from yesterday'}
              </p>
            </div>
          </div>

          <div className="w-full bg-border/50 rounded-lg h-4">
            <div
              className="bg-gradient-to-r from-industrial-success to-industrial-success/50 h-full rounded-lg"
              style={{ width: `${data.current_health}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-t border-border/50 pt-4">
            <h3 className="text-sm font-medium text-foreground/60">Health Indicators</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Temperature Stability</span>
                <span className={`text-sm font-medium ${
                  data.indicators.temperature_stability === 'Good'
                    ? 'text-industrial-success'
                    : 'text-industrial-warning'
                }`}>
                  {data.indicators.temperature_stability}
                </span>
              </div>
              <div className="w-full bg-border/50 rounded-lg h-2 mt-1">
                <div
                  className="bg-industrial-success h-full rounded-lg"
                  style={{
                    width:
                      data.indicators.temperature_stability === 'Good'
                        ? '88%'
                        : data.indicators.temperature_stability === 'Warning'
                          ? '65%'
                          : '40%',
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Vibration Levels</span>
                <span className={`text-sm font-medium ${
                  data.indicators.vibration_levels === 'Good'
                    ? 'text-industrial-success'
                    : data.indicators.vibration_levels === 'Moderate'
                      ? 'text-industrial-warning'
                      : 'text-industrial-danger'
                }`}>
                  {data.indicators.vibration_levels}
                </span>
              </div>
              <div className="w-full bg-border/50 rounded-lg h-2 mt-1">
                <div
                  className="bg-industrial-warning h-full rounded-lg"
                  style={{
                    width:
                      data.indicators.vibration_levels === 'Good'
                        ? '90%'
                        : data.indicators.vibration_levels === 'Moderate'
                          ? '65%'
                          : '40%',
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Power Efficiency</span>
                <span className={`text-sm font-medium ${
                  data.indicators.power_efficiency === 'Optimal'
                    ? 'text-industrial-success'
                    : 'text-industrial-warning'
                }`}>
                  {data.indicators.power_efficiency}
                </span>
              </div>
              <div className="w-full bg-border/50 rounded-lg h-2 mt-1">
                <div
                  className="bg-industrial-success h-full rounded-lg"
                  style={{
                    width:
                      data.indicators.power_efficiency === 'Optimal'
                        ? '92%'
                        : data.indicators.power_efficiency === 'Suboptimal'
                          ? '70%'
                          : '50%',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

          <div className="border-t border-border/50 pt-4">
            <h3 className="text-sm font-medium text-foreground/60">Maintenance Impact</h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Activity className="h-4 w-4 text-industrial-accent" />
                <div>
                  <div className="font-medium">
                    Last Maintenance: {data.maintenance_status === 'Good' ? '2 hours ago' : '6 hours ago'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Preventive maintenance completed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <Zap className="h-4 w-4 text-industrial-warning" />
                <div>
                  <div className="font-medium">
                    Next Scheduled: {data.indicators.maintenance_status === 'Good' ? 'In 8 hours' : 'In 2 hours'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lubrication check
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground/60">24-Hour Trend</h3>
            </div>
            <div className="h-40 border border-border/50 rounded-lg p-3">
              <div className="flex flex-col h-full justify-between w-full">
                {data.health_trend && data.health_trend.length > 0 ? (
                  <>
                    <div className="h-24 w-full relative">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block">
                        <polyline
                          points={data.health_trend
                            .map((point: number, index: number) => {
                              const x = (index / (data.health_trend.length - 1)) * 100;
                              const y = 100 - ((point - 70) / 30) * 100; // Normalize 70-100 range
                              return `${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                      Trend chart visualization
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground m-auto">
                    Trend chart visualization would appear here<br />
                    <span className="text-xs">Shows health score fluctuations over time</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };