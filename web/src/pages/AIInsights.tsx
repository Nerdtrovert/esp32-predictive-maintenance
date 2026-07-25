import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { QuickSummary } from '@/components/cards/QuickSummary';
import { RecentAlerts } from '@/components/cards/RecentAlerts';
import { AIAnalysis } from '@/components/cards/AIAnalysis';
import { Recommendations } from '@/components/cards/Recommendations';
import apiService from '@/services/apiService';

export const AIInsights = () => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch AI analysis
        const analysis = await apiService.getAIAnalysis();
        setAiAnalysis(analysis);

        // Fetch AI recommendations
        const recommendations = await apiService.getAIRecommendations();
        setAiRecommendations(recommendations);
      } catch (err) {
        setError('Failed to load AI insights');
        console.error('Error fetching AI insights:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Default data for fallback
  const defaultAnalysis = {
    production_efficiency: "AI predicts a 12% increase in overall equipment efficiency if preventive maintenance is scheduled for Conveyor Belt Beta within the next 48 hours.",
    quality_prediction: "Current material batch shows potential for 3% increase in defect rate. Consider adjusting temperature settings on Press Line Alpha by -2°C.",
    energy_optimization: "Shift scheduling adjustments could reduce energy consumption by 8% during peak hours.",
    maintenance_forecast: "Bearing wear on Hydraulic Press Gamma suggests replacement needed in approximately 180 operating hours.",
    overall_trend: "Over the past week, overall equipment effectiveness has shown a steady upward trend, with particular improvements in vibration reduction on critical axes."
  };

  const defaultRecommendations = [
    {
      id: 1,
      title: "Schedule Preventive Maintenance",
      description: "Conveyor Belt Beta shows early signs of bearing wear. Schedule maintenance within 48 hours to avoid unplanned downtime.",
      priority: "high",
      icon: "check-circle",
      category: "Maintenance"
    },
    {
      id: 2,
      title: "Adjust Temperature Setpoint",
      description: "Press Line Alpha running 2°C above optimal temperature for current material grade. Adjust to reduce defect rate.",
      priority: "medium",
      icon: "trending-up",
      category: "Quality"
    },
    {
      id: 3,
      title: "Energy Optimization",
      description: "Shift heavy processing to off-peak hours (10PM-6AM) to reduce energy costs by approximately 15%.",
      priority: "medium",
      icon: "clock",
      category: "Efficiency"
    },
    {
      id: 4,
      title: "Safety Check",
      description: "Hydraulic pressure readings within normal limits. No immediate safety concerns detected.",
      priority: "low",
      icon: "shield-check",
      category: "Safety"
    }
  ];

  const analysisData = aiAnalysis || defaultAnalysis;
  const recommendationsData = aiRecommendations || defaultRecommendations;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">AI Insights</h1>

        <QuickSummary />

        <div className="grid lg:grid-cols-2 gap-6">
          <RecentAlerts />
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">AI Insights</h1>

        <div className="text-center py-8 text-destructive">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Insights</h1>

      <QuickSummary />

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentAlerts />
        <div className="space-y-6">
          <AIAnalysis analysis={analysisData} />
          <Recommendations recommendations={recommendationsData} />
        </div>
      </div>
    </div>
  );
};