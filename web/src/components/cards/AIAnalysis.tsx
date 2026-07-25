import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Sparkles, TrendingUp, BarChart3 } from 'lucide-react';

interface AIAnalysisProps {
  analysis: {
    production_efficiency: string;
    quality_prediction: string;
    energy_optimization: string;
    maintenance_forecast: string;
    overall_trend: string;
  };
}

export const AIAnalysis = ({ analysis }: AIAnalysisProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">AI Insights & Recommendations</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/60">Production Efficiency</h3>
            <p className="text-sm text-muted-foreground">
              {analysis.production_efficiency}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/60">Quality Prediction</h3>
            <p className="text-sm text-muted-foreground">
              {analysis.quality_prediction}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/60">Energy Optimization</h3>
            <p className="text-sm text-muted-foreground">
              {analysis.energy_optimization}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/60">Maintenance Forecast</h3>
            <p className="text-sm text-muted-foreground">
              {analysis.maintenance_forecast}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground/60">Overall Trend</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {analysis.overall_trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};