import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FileText, BarChart3, ClipboardList, PieChart, Zap, Truck, Loader2, CheckCircle2, AlertTriangle, Gauge, Activity, Square, Clock } from 'lucide-react';
import apiService from '@/services/apiService';

interface ReportViewerProps {
  reportId: number | null;
  onReportNotFound: () => void;
}

export const ReportViewer = ({ reportId, onReportNotFound }: ReportViewerProps) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock reports data
  const mockReports: any[] = [
    {
      id: 1,
      title: 'Daily Production Report',
      date: '2024-01-15',
      type: 'Production',
      description: 'Overview of daily production output, quality metrics, and equipment utilization',
      generated_at: '2024-01-15T16:30:00Z',
      data: {
        summary: 'Today production exceeded targets by 8.5% with improved quality metrics across all lines.',
        metrics: [
          { label: 'Units Produced', value: '12,450', change: '+8.3%', trend: 'up' },
          { label: 'Defect Rate', value: '0.8%', change: '-0.2%', trend: 'down' },
          { label: 'Overall Equipment Effectiveness', value: '87.3%', change: '+2.1%', trend: 'up' },
          { label: 'Average Cycle Time', value: '45s', change: '-2s', trend: 'down' }
        ],
        production_by_line: [
          { line: 'Press Line Alpha', units: 4200, efficiency: 94 },
          { line: 'Conveyor Belt Beta', units: 3100, efficiency: 78 },
          { line: 'Hydraulic Press Gamma', units: 1800, efficiency: 45 },
          { line: 'Assembly Line Delta', units: 3350, efficiency: 91 }
        ],
        quality_metrics: [
          { metric: 'Surface Finish', value: '96%', target: '95%' },
          { metric: 'Dimensional Accuracy', value: '98%', target: '97%' },
          { metric: 'Material Consistency', value: '94%', target: '92%' }
        ]
      }
    },
    {
      id: 2,
      title: 'Equipment Utilization Report',
      date: '2024-01-14',
      type: 'Efficiency',
      description: 'Detailed analysis of machine utilization, availability, and performance metrics',
      generated_at: '2024-01-14T16:30:00Z',
      data: {
        summary: 'Equipment utilization shows improvement with preventive maintenance paying off.',
        overall_oee: 87.3,
        availability: 92.1,
        performance: 89.5,
        quality: 95.2,
        machine_details: [
          {
            machine: 'Press Line Alpha',
            availability: 96,
            performance: 92,
            quality: 98,
            oee: 86,
            status: 'Online',
            runtime_hours: 8.5
          },
          {
            machine: 'Conveyor Belt Beta',
            availability: 85,
            performance: 88,
            quality: 91,
            oee: 68,
            status: 'Warning',
            runtime_hours: 6.2
          },
          {
            machine: 'Hydraulic Press Gamma',
            availability: 60,
            performance: 75,
            quality: 85,
            oee: 38,
            status: 'Offline',
            runtime_hours: 3.1
          },
          {
            machine: 'Assembly Line Delta',
            availability: 94,
            performance: 91,
            quality: 97,
            oee: 79,
            status: 'Online',
            runtime_hours: 7.8
          }
        ],
        trends: {
          oee_trend: [82, 84, 86, 85, 87, 88, 87, 89, 91, 88, 90, 87, 89, 90, 88, 87, 89, 91, 90, 88, 87, 89, 90, 87.3],
          availability_trend: [89, 91, 90, 88, 92, 93, 91, 90, 94, 92, 94, 91, 93, 95, 93, 92, 94, 96, 95, 93, 92, 94, 95, 92.1]
        }
      }
    },
    {
      id: 3,
      title: 'Quality Control Report',
      date: '2024-01-13',
      type: 'Quality',
      description: 'Comprehensive quality analysis including defect trends and root cause analysis',
      generated_at: '2024-01-13T16:30:00Z',
      data: {
        summary: 'Quality performance remains strong with continuous improvement initiatives showing results.',
        overall_defect_rate: 0.8,
        defect_trend: [1.2, 1.1, 1.0, 0.9, 0.9, 0.8, 0.8, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.8],
        defect_categories: [
          { category: 'Surface Defects', count: 45, percentage: 56 },
          { category: 'Dimensional Issues', count: 25, percentage: 31 },
          { category: 'Material Flaws', count: 10, percentage: 13 }
        ],
        quality_by_line: [
          { line: 'Press Line Alpha', defects: 12, rate: 0.3 },
          { line: 'Conveyor Belt Beta', defects: 28, rate: 0.9 },
          { line: 'Hydraulic Press Gamma', defects: 18, rate: 1.0 },
          { line: 'Assembly Line Delta', defects: 22, rate: 0.7 }
        ]
      }
    },
    {
      id: 4,
      title: 'Maintenance Summary Report',
      date: '2024-01-12',
      type: 'Maintenance',
      description: 'Summary of maintenance activities, upcoming schedules, and equipment health',
      generated_at: '2024-01-12T16:30:00Z',
      data: {
        summary: 'Preventive maintenance program showing positive results with reduced emergency interventions.',
        completed_maintenance: 8,
        scheduled_maintenance: 3,
        pending_maintenance: 2,
        emergency_repairs: 1,
        maintenance_by_type: [
          { type: 'Preventive', count: 5 },
          { type: 'Predictive', count: 3 },
          { type: 'Corrective', count: 2 }
        ],
        upcoming_maintenance: [
          { equipment: 'Conveyor Belt Beta', type: 'Lubrication', date: '2024-01-20', priority: 'High' },
          { equipment: 'Press Line Alpha', type: 'Sensor Calibration', date: '2024-01-22', priority: 'Medium' },
          { equipment: 'Hydraulic Press Gamma', type: 'Seal Replacement', date: '2024-01-25', priority: 'Low' },
          { equipment: 'Robotic Arm Epsilon', type: 'Firmware Update', date: '2024-01-18', priority: 'Medium' }
        ],
        equipment_health: [
          { equipment: 'Press Line Alpha', health: 94, trend: 'up' },
          { equipment: 'Conveyor Belt Beta', health: 78, trend: 'down' },
          { equipment: 'Hydraulic Press Gamma', health: 45, trend: 'critical' },
          { equipment: 'Assembly Line Delta', health: 91, trend: 'stable' }
        ]
      }
    },
    {
      id: 5,
      title: 'Energy Consumption Report',
      date: '2024-01-11',
      type: 'Energy',
      description: 'Analysis of energy usage patterns, efficiency metrics, and cost-saving opportunities',
      generated_at: '2024-01-11T16:30:00Z',
      data: {
        summary: 'Energy optimization initiatives showing promising results with potential for further savings.',
        total_consumption_kwh: 12450,
        cost_savings: 2340,
        efficiency_percentage: 78,
        consumption_by_equipment: [
          { equipment: 'Press Line Alpha', kwh: 4200, cost: 50 },
          { equipment: 'Conveyor Belt Beta', kwh: 3100, cost: 372000 },
          { equipment: 'Hydraulic Press Gamma', kwh: 1800, cost: 216000 },
          { equipment: 'Assembly Line Delta', kwh: 3350, cost: 402000 }
        ],
        peak_vs_offpeak: {
          peak_usage: 68,
          offpeak_usage: 32,
          potential_savings: '15-20%'
        },
        energy_trends: {
          daily_consumption: [1180, 1210, 1190, 1220, 1250, 1240, 1230, 1260, 1270, 1290, 1300, 1280, 1270, 1260, 1250, 1240, 1230, 1220, 1210, 1200, 1190, 1180, 1170, 1245],
          cost_trend: [1120, 1150, 1130, 1160, 1190, 1180, 1170, 1200, 1210, 1230, 1240, 1220, 1210, 1200, 1190, 1180, 1170, 1150, 1140, 1130, 1120, 1110, 1100, 2340]
        }
      }
    }
  ];

  useEffect(() => {
    if (reportId === null) {
      setReportData(null);
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to get real data from API first
        const data = await apiService.getReportById(reportId);
        setReportData(data);
      } catch (err) {
        // Fall back to mock data
        console.log('Using mock data for report:', reportId);
        const mockReport = mockReports.find(r => r.id === reportId);
        if (mockReport) {
          setReportData(mockReport);
        } else {
          setError('Report not found');
          onReportNotFound();
        }
      } finally {
        setLoading(false);
      }
    };

    if (reportId !== null) {
      fetchReport();
    }
  }, [reportId, onReportNotFound]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-4 w-4 text-industrial-accent" />
            <h2 className="text-lg font-semibold">Report Viewer</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center">
          <div className="space-y-4">
            <div className="h-6 w-6">
              <Loader2 className="h-6 w-6 text-industrial-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Loading report...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-4 w-4 text-industrial-danger" />
            <h2 className="text-lg font-semibold">Report Viewer</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center">
          <div className="space-y-4 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-4 w-4 text-industrial-accent" />
            <h2 className="text-lg font-semibold">Report Viewer</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center text-muted-foreground">
          <p>Select a report from the list to view its details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-4 w-4 text-industrial-accent" />
          <h2 className="text-lg font-semibold">{reportData.title}</h2>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Generated: {new Date(reportData.generated_at).toLocaleString()}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Summary Section */}
        <div className="border-b border-border/50 pb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-industrial-accent" />
            Executive Summary
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {reportData.data.summary}
          </p>
        </div>

        {/* Metrics/Specific Sections based on report type */}
        {reportData.data.metrics && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-industrial-accent" />
              Key Metrics
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {reportData.data.metrics.map((metric: any, index: number) => (
                <div key={index} className="p-4 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 bg-industrial-accent/10 rounded-full flex items-center justify-center">
                      {/* Icons based on metric type */}
                      {metric.label.toLowerCase().includes('units') && (
                        <Square className="h-4 w-4 text-industrial-accent" />
                      )}
                      {metric.label.toLowerCase().includes('rate') && (
                        <AlertTriangle className="h-4 w-4 text-industrial-warning" />
                      )}
                      {metric.label.toLowerCase().includes('effectiveness') && (
                        <Gauge className="h-4 w-4 text-industrial-success" />
                      )}
                      {metric.label.toLowerCase().includes('time') && (
                        <Clock className="h-4 w-4 text-industrial-accent" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{metric.label}</p>
                      <p className="text-2xl font-bold">
                        {metric.value}
                        <span className={
                          `ml-1 text-xs ${
                            metric.trend === 'up'
                              ? 'text-industrial-success'
                              : metric.trend === 'down'
                                ? 'text-industrial-danger'
                                : 'text-industrial-secondary'
                          }`}
                        >
                          {metric.change}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production by Line Section */}
        {reportData.data.production_by_line && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-industrial-accent" />
              Production by Line
            </h3>
            <div className="space-y-3">
              {reportData.data.production_by_line.map((line: any, index: number) => (
                <div key={index} className="p-4 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{line.line}</p>
                      <p className="text-xs text-muted-foreground">Production Units</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-semibold">{line.units.toLocaleString()}</p>
                      <p className={
                        `text-xs ${
                          line.efficiency >= 90
                            ? 'text-industrial-success'
                            : line.efficiency >= 75
                              ? 'text-industrial-warning'
                              : 'text-industrial-danger'
                        }`}
                      >
                        {line.efficiency}% Efficiency
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Metrics Section */}
        {reportData.data.quality_metrics && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <PieChart className="h-4 w-4 text-industrial-warning" />
              Quality Metrics
            </h3>
            <div className="space-y-3">
              {reportData.data.quality_metrics.map((metric: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/5">
                  <div>
                    <p className="font-medium text-sm">{metric.metric}</p>
                    <p className="text-xs text-muted-foreground">Target: {metric.target}</p>
                  </div>
                  <div className="text-right">
                    <p className={
                      `text-lg font-semibold ${
                        parseFloat(metric.value.replace('%', '')) >= parseFloat(metric.target.replace('%', ''))
                          ? 'text-industrial-success'
                          : 'text-industrial-warning'
                      }`}
                    >
                      {metric.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Machine Details Section (for Equipment Utilization) */}
        {reportData.data.machine_details && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <ClipboardList className="h-4 w-4 text-industrial-success" />
              Machine Details
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border/50">
                <thead className="bg-industrial-blue/5">
                  <tr>
                    <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Machine</th>
                    <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Availability</th>
                    <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Performance</th>
                    <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Quality</th>
                    <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">OEE</th>
                    <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Runtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {reportData.data.machine_details.map((machine: any, index: number) => (
                    <tr key={index} className="hover:bg-accent/5">
                      <td className="text-sm px-4 py-3">{machine.machine}</td>
                      <td className="text-sm px-4 py-3">
                        <span className={
                          `px-2 py-0.5 rounded-full text-xs font-medium ${
                            machine.availability >= 90
                              ? 'bg-industrial-success/10 text-industrial-success'
                              : machine.availability >= 75
                                ? 'bg-industrial-warning/10 text-industrial-warning'
                                : 'bg-industrial-danger/10 text-industrial-danger'
                          }`}
                        >
                          {machine.availability}%
                        </span>
                      </td>
                      <td className="text-sm px-4 py-3">
                        <span className={
                          `px-2 py-0.5 rounded-full text-xs font-medium ${
                            machine.performance >= 90
                              ? 'bg-industrial-success/10 text-industrial-success'
                              : machine.performance >= 75
                                ? 'bg-industrial-warning/10 text-industrial-warning'
                                : 'bg-industrial-danger/10 text-industrial-danger'
                          }`}
                        >
                          {machine.performance}%
                        </span>
                      </td>
                      <td className="text-sm px-4 py-3">
                        <span className={
                          `px-2 py-0.5 rounded-full text-xs font-medium ${
                            machine.quality >= 90
                              ? 'bg-industrial-success/10 text-industrial-success'
                              : machine.quality >= 75
                                ? 'bg-industrial-warning/10 text-industrial-warning'
                                : 'bg-industrial-danger/10 text-industrial-danger'
                          }`}
                        >
                          {machine.quality}%
                        </span>
                      </td>
                      <td className="text-sm px-4 py-3 font-semibold">
                        {machine.oee}%
                      </td>
                      <td className="text-sm px-4 py-3">
                        <span className={
                          `px-2 py-0.5 rounded-full text-xs font-medium ${
                            machine.status === 'Online'
                              ? 'bg-industrial-success/10 text-industrial-success'
                              : machine.status === 'Warning'
                                ? 'bg-industrial-warning/10 text-industrial-warning'
                                : machine.status === 'Offline'
                                  ? 'bg-industrial-danger/10 text-industrial-danger'
                                  : 'bg-industrial-accent/10 text-industrial-accent'
                          }`}
                        >
                          {machine.status}
                        </span>
                      </td>
                      <td className="text-sm px-4 py-3 text-right">
                        {machine.runtime_hours} hrs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trends Section */}
        {reportData.data.trends && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Activity className="h-4 w-4 text-industrial-accent" />
              Performance Trends
            </h3>
            <div className="grid gap-4">
              {Object.entries(reportData.data.trends).map(([key, values]: [string, any], index: number) => (
                <div key={index} className="h-48 border border-border/50 rounded-lg">
                  <div className="p-4">
                    <h4 className="font-medium text-sm mb-2">
                      {key.replace('_', ' ').toUpperCase()}
                    </h4>
                    <div className="h-32">
                      {/* In a real app, this would render a chart */}
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        Trend chart would appear here<br />
                        <span className="text-xs">(Showing {values.length} data points)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Sections */}
        {Object.keys(reportData.data).filter(key =>
          !['summary', 'metrics', 'production_by_line', 'quality_metrics', 'machine_details', 'trends'].includes(key)
        ).map((key, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="h-4 w-4 text-industrial-accent" />
              {key.replace('_', ' ').toUpperCase()}
            </h3>
            <div className="prose prose-sm max-w-none">
              {/* Simplified display for other data types */}
              <pre className="bg-background/50 p-4 rounded-lg overflow-x-auto">{JSON.stringify(
                // @ts-ignore
                (reportData.data as any)[key],
                null,
                2
              )}</pre>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};