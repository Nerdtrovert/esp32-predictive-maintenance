import React, { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';
import { MachineStatusCard } from './MachineStatusCard';
import apiService from '../../services/apiService';

export const MachineStatusGrid = () => {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchMachines = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const data = await apiService.getFactoryMachines();
        if (active) {
          setMachines(data);
        }
      } catch (err) {
        if (active && isInitial) {
          setError('Failed to load machine data');
        }
        console.error('Error fetching machines:', err);
      } finally {
        if (active && isInitial) setLoading(false);
      }
    };

    fetchMachines(true);

    const interval = setInterval(() => {
      fetchMachines(false);
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="p-5 border border-border rounded-xl bg-card h-[152px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-xl text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {machines.map(machine => (
        <MachineStatusCard key={machine.id} {...machine} />
      ))}
    </div>
  );
};