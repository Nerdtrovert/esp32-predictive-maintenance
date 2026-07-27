import React, { useEffect, useState } from 'react';
import { StatsGrid } from '../components/cards/StatsGrid';
import { MachineStatusGrid } from '../components/cards/MachineStatusGrid';
import { RecentAlerts } from '../components/cards/RecentAlerts';
import { QuickSummary } from '../components/cards/QuickSummary';
import { AIRecommendationCard } from '../components/cards/AIRecommendationCard';
import { Cpu, Bell, BrainCircuit } from 'lucide-react';
import apiService from '../services/apiService';

export const FactoryOverview = () => {
  const [statusText, setStatusText] = useState('All monitored equipment is operating normally.');
  const [statusColor, setStatusColor] = useState('text-industrial-success');
  const [statusDot, setStatusDot] = useState('🟢');
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const machines = await apiService.getFactoryMachines();
        if (!active) return;
        
        const offline = machines.filter((m: any) => m.status === 'offline');
        const warning = machines.filter((m: any) => m.status === 'warning' || m.status === 'danger' || m.anomaly);
        
        if (offline.length > 0) {
          setStatusDot('🔴');
          setStatusColor('text-industrial-danger');
          setStatusText(`Connection lost on ${offline.map((m: any) => m.name).join(', ')}. Active alert logged.`);
        } else if (warning.length > 0) {
          setStatusDot('🟡');
          setStatusColor('text-industrial-warning');
          setStatusText(`Anomaly signature detected on ${warning.map((m: any) => m.name).join(', ')}.`);
        } else {
          setStatusDot('🟢');
          setStatusColor('text-industrial-success');
          setStatusText('All monitored equipment is operating normally.');
        }
      } catch (err) {
        console.error('Error checking fleet status:', err);
      } finally {
        if (active) {
          setLastUpdate(new Date().toLocaleTimeString());
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Factory Overview</h1>
      </div>
      
      {/* Factory Status Banner */}
      <div className="p-4 border border-border bg-card rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Factory Status</span>
          <div className={`flex items-center space-x-1.5 text-sm font-semibold ${statusColor}`}>
            <span>{statusDot}</span>
            <span>{statusText}</span>
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Last update: {lastUpdate}
        </div>
      </div>
      
      <StatsGrid />
      
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Equipment Status (Dominant - 50% width) */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <div className="flex items-center space-x-2 h-7 px-1">
            <Cpu className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equipment Status</h2>
          </div>
          <div className="flex-1">
            <MachineStatusGrid />
          </div>
        </div>

        {/* Middle: Recent Alerts (25% width) */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          <div className="flex items-center space-x-2 h-7 px-1">
            <Bell className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Alerts</h2>
          </div>
          <div className="flex-1">
            <RecentAlerts />
          </div>
        </div>

        {/* Right: AI Recommendation (25% width) */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          <div className="flex items-center space-x-2 h-7 px-1">
            <BrainCircuit className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Recommendation</h2>
          </div>
          <div className="flex-1">
            <AIRecommendationCard />
          </div>
        </div>
      </div>
      
      <QuickSummary />
    </div>
  );
};
