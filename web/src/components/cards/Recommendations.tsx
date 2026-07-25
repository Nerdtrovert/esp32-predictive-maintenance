import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CheckCircle, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

interface RecommendationItem {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: any; // React component type
  category: string;
}

interface RecommendationsProps {
  recommendations: RecommendationItem[];
}

export const Recommendations = ({ recommendations }: RecommendationsProps) => {
  if (recommendations.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Recommended Actions</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center text-muted-foreground">
          <p>No recommended actions at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Recommended Actions</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border border-border/50 rounded-lg overflow-hidden">
              <div className="flex items-start space-x-3 p-4">
                <div className="flex-shrink-0">
                  {rec.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm">{rec.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      rec.priority === 'high'
                        ? 'bg-industrial-danger/10 text-industrial-danger'
                        : rec.priority === 'medium'
                          ? 'bg-industrial-warning/10 text-industrial-warning'
                          : 'bg-industrial-success/10 text-industrial-success'
                    }`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Category: {rec.category}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};