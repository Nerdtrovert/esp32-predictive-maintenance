import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { BrainCircuit, Play, Eye, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';

export const AIRecommendationCard = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  const navigate = useNavigate();

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
        machine_id_val: 1,
        machine_name: 'Factory Fleet',
        title: 'Maintain Current Operating Profile',
        bullets: [
          'Monitor telemetry parameters.',
          'Verify sensor calibrations.',
          'Compare baseline signatures.',
          'Schedule regular preventive checks.'
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
      machine_id_val: 1, // Fallback to 1 as it is the only active hardware node
      machine_name: machineName,
      title: rec.title,
      bullets: bullets
    };
  };

  const details = getRecDetails(recommendations[0]);

  const handleRunDiagnostic = async () => {
    if (isDiagnosing) return;
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    try {
      const data = await apiService.runMachineDiagnostic(details.machine_id_val);
      setDiagnosticResult(data.message || 'Diagnostic scan completed successfully.');
      // Auto-clear diagnostic notice box after 5 seconds
      setTimeout(() => {
        setDiagnosticResult(null);
      }, 5000);
    } catch (err) {
      console.error('Diagnostic error:', err);
      setDiagnosticResult('Failed to establish diagnostic handshake connection.');
    } finally {
      setIsDiagnosing(false);
    }
  };

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

        {/* Diagnostic Results Status Message */}
        {diagnosticResult && (
          <div className="p-2.5 rounded-lg border border-industrial-success/20 bg-industrial-success/5 text-[10px] text-industrial-success font-medium flex items-start space-x-2 animate-slide-in">
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>{diagnosticResult}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleRunDiagnostic}
            disabled={isDiagnosing}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDiagnosing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            <span>{isDiagnosing ? 'Running...' : 'Run Diagnostic'}</span>
          </button>
          
          <button
            onClick={() => navigate(`/machine/${details.machine_id_val}`)}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-border bg-card text-foreground text-xs font-semibold rounded-lg hover:bg-accent/5 transition-colors"
          >
            <Eye className="h-3 w-3" />
            <span>View Machine</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
