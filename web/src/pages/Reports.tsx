import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AlertTriangle, CheckCircle2, Loader } from 'lucide-react';
import { ReportsGrid } from '../components/cards/ReportsGrid';
import { ReportViewer } from '../components/cards/ReportViewer';
import apiService from '../services/apiService';

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      }
      const data = await apiService.getReports();
      setReports(data);
      // Select first report by default if available
      if (data.length > 0 && !selectedReportId) {
        setSelectedReportId(data[0].id);
      }
    } catch (err) {
      if (isInitial) {
        setError('Failed to load reports');
      }
      console.error('Error fetching reports:', err);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;
    fetchReports(true);

    const interval = setInterval(() => {
      if (active) {
        fetchReports(false);
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedReportId]);

  // Enhanced mock data for reports
  const mockReports = [
    {
      id: 1,
      title: 'Daily Production Report',
      date: '2024-01-15',
      type: 'Production',
      description: 'Daily production output, quality metrics, and efficiency data',
      icon: 'BarChart3'
    },
    {
      id: 2,
      title: 'Equipment Utilization Report',
      date: '2024-01-14',
      type: 'Efficiency',
      description: 'Machine utilization rates, OEE scores, and performance trends',
      icon: 'ClipboardList'
    },
    {
      id: 3,
      title: 'Quality Control Report',
      date: '2024-01-13',
      type: 'Quality',
      description: 'Defect rates, yield percentages, and quality control measurements',
      icon: 'PieChart'
    },
    {
      id: 4,
      title: 'Maintenance Summary Report',
      date: '2024-01-12',
      type: 'Maintenance',
      description: 'Completed maintenance tasks, upcoming schedules, and equipment health',
      icon: 'FileText'
    },
    {
      id: 5,
      title: 'Energy Consumption Report',
      date: '2024-01-11',
      type: 'Energy',
      description: 'Power usage analysis, energy efficiency metrics, and cost savings',
      icon: 'Zap'
    },
    {
      id: 6,
      title: 'Supply Chain Report',
      date: '2024-01-10',
      type: 'Logistics',
      description: 'Inventory levels, supplier performance, and material usage tracking',
      icon: 'Truck'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-8 w-8 text-industrial-danger mb-3" />
            <p className="text-center text-destructive">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchReports();
              }}
              className="mt-4 px-4 py-2 border border-industrial-danger/50 rounded-lg hover:bg-industrial-danger/10 text-industrial-danger text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  // Use mock data if no real data available
  const displayReports = reports.length > 0 ? reports : mockReports;

  if (displayReports.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="h-8 w-8 text-industrial-secondary mb-3" />
          <p className="text-center text-muted-foreground">No reports available</p>
          <p className="text-center text-xs text-muted-foreground max-w-md">
            Reports will appear here as they are generated by the system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-sm text-muted-foreground mb-4">
        View and analyze detailed reports on factory performance, quality, maintenance, and more.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <ReportsGrid
          reports={displayReports}
          onReportSelect={setSelectedReportId}
          selectedReportId={selectedReportId}
        />
        <ReportViewer
          reportId={selectedReportId}
          onReportNotFound={() => setSelectedReportId(null)}
        />
      </div>
    </div>
  );
};