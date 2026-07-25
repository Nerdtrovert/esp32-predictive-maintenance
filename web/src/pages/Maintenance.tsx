import { Card } from '../components/ui/Card';
import { MaintenanceHistory } from '../components/cards/MaintenanceHistory';
import { RecommendedActions } from '../components/cards/RecommendedActions';

export const Maintenance = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Maintenance</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <MaintenanceHistory />
        <RecommendedActions />
      </div>
    </div>
  );
};
