import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LineChart, Activity, Zap, Thermometer } from 'lucide-react';
import apiService from '../../services/apiService';

type ChartPoint = { x: number; y: number };

const normalizeSeries = (series: unknown): ChartPoint[] => {
  if (!Array.isArray(series)) {
    return [];
  }

  return series
    .map((point, index) => {
      if (typeof point === 'number') {
        return { x: index, y: point };
      }

      if (
        point &&
        typeof point === 'object' &&
        typeof (point as any).x === 'number' &&
        typeof (point as any).y === 'number'
      ) {
        return point as ChartPoint;
      }

      return null;
    })
    .filter((point): point is ChartPoint => point !== null);
};

export const SensorCharts = ({ machineId = 1 }: { machineId?: number }) => {
  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getMachineSensorData(machineId);
        setSensorData(data);
      } catch (err) {
        setError('Failed to load sensor data');
        console.error('Error fetching sensor data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, [machineId]);

  const temperatureSeries = normalizeSeries(sensorData?.temperature);
  const vibrationSeries = normalizeSeries(sensorData?.vibration);
  const powerSeries = normalizeSeries(sensorData?.power);
  const lastTemperature = temperatureSeries.at(-1)?.y;
  const lastVibration = vibrationSeries.at(-1)?.y;
  const lastPower = powerSeries.at(-1)?.y;

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-4 w-4 text-industrial-accent" />
            <h2 className="text-lg font-semibold">Sensor Trends (Last 20 Readings)</h2>
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
            <Activity className="h-4 w-4 text-industrial-accent" />
            <h2 className="text-lg font-semibold">Sensor Trends (Last 20 Readings)</h2>
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
          <Activity className="h-4 w-4 text-industrial-accent" />
          <h2 className="text-lg font-semibold">Sensor Trends (Last 20 Readings)</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/60">Temperature</h3>
            <div className="h-24">
              <div className="border border-border/50 rounded-lg p-4 bg-gradient-to-b from-industrial-blue/5 to-transparent">
                <div className="flex h-full items-center justify-center">
                  {temperatureSeries.length > 0 ? (
                    <>
                      <svg width="100%" height="100%" className="block">
                        <polyline
                          points={temperatureSeries
                            .map((point: any, index: number) => {
                              const x = (index / (temperatureSeries.length - 1)) * 100;
                              const y = 100 - ((point.y - 65) / 15) * 100; // Normalize 65-80 range
                              return `${x}%,${y}%`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="industrial-warning"
                          stroke-width="2"
                        />
                      </svg>
                      <div className="mt-2 text-center">
                        <div className="text-lg font-semibold text-industrial-warning">
                          {lastTemperature?.toFixed(1)}°C
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(lastTemperature ?? 0) > 75 ? 'High' : 'Normal'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-industrial-warning/50">
                      <Thermometer className="h-6 w-6 mx-auto mb-2" />
                      <div>72.3°C</div>
                      <div className="text-xs text-muted-foreground">Normal Range</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/60">Vibration</h3>
            <div className="h-24">
              <div className="border border-border/50 rounded-lg p-4 bg-gradient-to-b from-industrial-warning/5 to-transparent">
                <div className="flex h-full items-center justify-center">
                  {vibrationSeries.length > 0 ? (
                    <>
                      <svg width="100%" height="100%" className="block">
                        <polyline
                          points={vibrationSeries
                            .map((point: any, index: number) => {
                              const x = (index / (vibrationSeries.length - 1)) * 100;
                              const y = 100 - ((point.y - 1.5) / 3) * 100; // Normalize 1.5-4.5 range
                              return `${x}%,${y}%`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="industrial-danger"
                          stroke-width="2"
                        />
                      </svg>
                      <div className="mt-2 text-center">
                        <div className="text-lg font-semibold text-industrial-danger">
                          {lastVibration?.toFixed(1)} mm/s
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(lastVibration ?? 0) > 3 ? 'High' : 'Normal'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-industrial-warning/50">
                      <Activity className="h-6 w-6 mx-auto mb-2" />
                      <div>2.1 mm/s</div>
                      <div className="text-xs text-muted-foreground">Acceptable</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/60">Power Consumption</h3>
            <div className="h-24">
              <div className="border border-border/50 rounded-lg p-4 bg-gradient-to-b from-industrial-accent/5 to-transparent">
                <div className="flex h-full items-center justify-center">
                  {powerSeries.length > 0 ? (
                    <>
                      <svg width="100%" height="100%" className="block">
                        <polyline
                          points={powerSeries
                            .map((point: any, index: number) => {
                              const x = (index / (powerSeries.length - 1)) * 100;
                              const y = 100 - ((point.y - 35) / 20) * 100; // Normalize 35-55 range
                              return `${x}%,${y}%`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="industrial-accent"
                          stroke-width="2"
                        />
                      </svg>
                      <div className="mt-2 text-center">
                        <div className="text-lg font-semibold text-industrial-accent">
                          {lastPower?.toFixed(1)} kW
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(lastPower ?? 0) > 50 ? 'High' : 'Normal'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-industrial-accent/50">
                      <Zap className="h-6 w-6 mx-auto mb-2" />
                      <div>45.2 kW</div>
                      <div className="text-xs text-muted-foreground">Stable</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center space-x-3 mb-3">
            <LineChart className="h-4 w-4 text-industrial-primary" />
            <h3 className="text-sm font-medium text-foreground/60">Combined View</h3>
          </div>
          <div className="h-32 border border-border/50 rounded-lg p-4">
            <div className="flex h-full items-center justify-center">
              {temperatureSeries.length > 0 && vibrationSeries.length > 0 && powerSeries.length > 0 ? (
                <>
                  <svg width="100%" height="100%" className="block">
                    {/* Temperature line */}
                    <polyline
                      points={temperatureSeries
                        .map((point: any, index: number) => {
                          const x = (index / (temperatureSeries.length - 1)) * 100;
                          const y = 100 - ((point.y - 65) / 15) * 100;
                          return `${x}%,${y}%`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="industrial-warning"
                      stroke-width="2"
                    />
                    {/* Vibration line */}
                    <polyline
                      points={vibrationSeries
                        .map((point: any, index: number) => {
                          const x = (index / (vibrationSeries.length - 1)) * 100;
                          const y = 100 - ((point.y - 1.5) / 3) * 100;
                          return `${x}%,${y}%`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="industrial-danger"
                      stroke-width="2"
                    />
                    {/* Power line */}
                    <polyline
                      points={powerSeries
                        .map((point: any, index: number) => {
                          const x = (index / (powerSeries.length - 1)) * 100;
                          const y = 100 - ((point.y - 35) / 20) * 100;
                          return `${x}%,${y}%`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="industrial-accent"
                      stroke-width="2"
                    />
                  </svg>
                  <div className="mt-2 text-center text-xs text-muted-foreground">
                    Multi-sensor visualization
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  Chart visualization would appear here<br />
                  <span className="text-xs">(In production: Recharts/Victory/ApexCharts)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};