import { Card } from '../components/ui/Card';
import { StatsGrid } from '../components/cards/StatsGrid';
import { MachineStatusGrid } from '../components/cards/MachineStatusGrid';
import { RecentAlerts } from '../components/cards/RecentAlerts';
import { QuickSummary } from '../components/cards/QuickSummary';

export const FactoryOverview = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Factory Overview</h1>
      
      <StatsGrid />
      
      <div className="grid md:grid-cols-2 gap-6">
        <MachineStatusGrid />
        <RecentAlerts />
      </div>
      
      <QuickSummary />
    </div>
  );
};
