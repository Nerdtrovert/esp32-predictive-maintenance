import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { BrainCircuit, Play, Eye } from 'lucide-react';
import apiService from '../../services/apiService';

export const AIRecommendationCard = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchRecs = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const data = await apiService.getAIRecommendations();
        if (active) {
          setRecommendations(data);
        }
      } catch (err) {
        console.error('Error fetching AI recommendations:', err);
      } finally {
        if (active && isInitial) setLoading(false);
      }
    };

    fetchRecs(true);
    const interval = setInterval(() => fetchRecs(false), 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const getRecDetails = (rec: any) => {
    if (!rec) {
      return {
        machine_name: 'Factory Fleet',
        title: 'Maintain Current Operating Profile',
        bullets: [
          'All machinery operating within baseline vibration.',
          'Thermal stability remains optimal across active nodes.',
          'No high-risk anomaly signals detected.',
          'Continue routine preventive inspections.'
        ]
      };
    }

    let machineName = rec.category || 'System';
    if (rec.description) {
      if (rec.description.includes(' on ')) {
        machineName = rec.description.split(' on ')[1].split('.')[0];
      } else if (rec.description.includes(' is ')) {
        machineName = rec.description.split(' is ')[0];
      }
    }

    // Generate structured bullets based on recommendation type
    let bullets = [
      'Monitor telemetry parameters.',
      'Verify sensor calibrations.',
      'Compare baseline signatures.',
      'Schedule regular preventive checks.'
    ];

    if (rec.title.includes('Temperature')) {
      bullets = [
        'Verify cooling system ventilation.',
        'Lower temperature setpoint.',
        'Inspect coolant levels and seals.',
        'Schedule inspection if thermal stress persists.'
      ];
    } else if (rec.title.includes('Bearing') || rec.title.includes('Vibration')) {
      bullets = [
        'Inspect machine manually.',
        'Compare with baseline vibration.',
        'Verify sensor calibration.',
        'Schedule maintenance if anomaly persists.'
      ];
    } else if (rec.title.includes('Diagnostic')) {
      bullets = [
        'Run manual inspection.',
        'Compare with baseline telemetry.',
        'Verify sensor calibration.',
        'Schedule inspection if anomaly persists.'
      ];
    }

    return {
      machine_name: machineName,
      title: rec.title,
      bullets: bullets
    };
  };

  const details = getRecDetails(recommendations[0]);

  if (loading) {
    return (
      <Card className="h-full flex flex-col justify-center min-h-[152px]">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col justify-between min-h-[152px]">
      <CardContent className="flex-1 flex flex-col justify-between space-y-4 p-6">
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">
              {details.machine_name}
            </span>
          </div>
          
          <h3 className="font-semibold text-sm text-foreground">{details.title}</h3>
          
          <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            {details.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 transition-colors">
            <Play className="h-3 w-3" />
            <span>Run Diagnostic</span>
          </button>
          <button className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-border bg-card text-foreground text-xs font-semibold rounded-lg hover:bg-accent/5 transition-colors">
            <Eye className="h-3 w-3" />
            <span>View Machine</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
