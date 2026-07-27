import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FileText, BarChart3, ClipboardList, PieChart, Zap, Truck } from 'lucide-react';

interface ReportItem {
  id: number;
  title: string;
  date: string;
  type: string;
  description: string;
  icon: any; // React component type
}

interface ReportsGridProps {
  reports: ReportItem[];
  onReportSelect: (id: number) => void;
  selectedReportId: number | null;
}

export const ReportsGrid = ({ reports, onReportSelect, selectedReportId }: ReportsGridProps) => {
  if (reports.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-4 w-4 text-industrial-accent" />
            <h2 className="text-lg font-semibold">Available Reports</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center text-muted-foreground">
          <p>No reports available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-4 w-4 text-industrial-accent" />
          <h2 className="text-lg font-semibold">Available Reports</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => onReportSelect(report.id)}
              className={`cursor-pointer p-4 rounded-xl border border-border/50 hover:bg-accent/5 transition-all duration-200 ${
                selectedReportId === report.id
                  ? 'bg-primary/5 border-l-4 border-primary border-y-primary/20 border-r-primary/20'
                  : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {report.type === 'Production' ? (
                    <BarChart3 className="h-5 w-5 text-industrial-accent" />
                  ) : report.type === 'Efficiency' ? (
                    <ClipboardList className="h-5 w-5 text-industrial-success" />
                  ) : report.type === 'Quality' ? (
                    <PieChart className="h-5 w-5 text-industrial-warning" />
                  ) : report.type === 'Maintenance' ? (
                    <FileText className="h-5 w-5 text-industrial-danger" />
                  ) : report.type === 'Energy' ? (
                    <Zap className="h-5 w-5 text-industrial-accent" />
                  ) : report.type === 'Logistics' ? (
                    <Truck className="h-5 w-5 text-industrial-primary" />
                  ) : (
                    <BarChart3 className="h-5 w-5 text-industrial-accent" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-sm">{report.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      report.type === 'Production'
                        ? 'bg-industrial-accent/10 text-industrial-accent'
                        : report.type === 'Efficiency'
                          ? 'bg-industrial-success/10 text-industrial-success'
                          : report.type === 'Quality'
                            ? 'bg-industrial-warning/10 text-industrial-warning'
                            : report.type === 'Maintenance'
                              ? 'bg-industrial-danger/10 text-industrial-danger'
                              : report.type === 'Energy'
                                ? 'bg-industrial-accent/10 text-industrial-accent'
                                : 'bg-industrial-primary/10 text-industrial-primary'
                    }`}>
                      {report.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <p className="text-xs text-muted-foreground">{report.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};