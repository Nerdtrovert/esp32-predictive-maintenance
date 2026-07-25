import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { MachineStatusCard } from './MachineStatusCard';
import apiService from '../../services/apiService';

export const MachineStatusGrid = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoading(true);
        const data = await apiService.getFactoryMachines();
        setMachines(data);
      } catch (err) {
        setError('Failed to load machine data');
        console.error('Error fetching machines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
          <p className="mt-2 text-muted-foreground">Loading machine status...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 text-destructive">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        {machines.map(machine => (
          <MachineStatusCard key={machine.id} {...machine} />
        ))}
      </div>
    </Card>
  );
};