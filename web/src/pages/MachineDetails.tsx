import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { MachineHeader } from '../components/cards/MachineHeader';
import { SensorCharts } from '../components/charts/SensorCharts';
import { HealthTrend } from '../components/charts/HealthTrend';
import apiService from '../services/apiService';

export const MachineDetails = () => {
  const { id } = useParams<{ id: string }>();
  const machineId = id ? parseInt(id, 10) : 1;
  const [machineData, setMachineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchData = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const machine = await apiService.getMachineDetails(machineId);
        if (active) {
          setMachineData(machine);
        }
      } catch (err) {
        if (active && isInitial) {
          setError('Failed to load machine data');
        }
        console.error('Error fetching machine data:', err);
      } finally {
        if (active && isInitial) setLoading(false);
      }
    };

    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [machineId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Machine Details - Press Line Alpha
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Machine Details - Press Line Alpha
        </h1>
        <div className="text-center py-8 text-destructive">
          <p>{error}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex-1 flex items-center justify-center">
            <p>Unable to load machine data</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p>Unable to load machine data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Machine Details - {machineData?.name || 'Press Line Alpha'}
      </h1>

      <MachineHeader machine={machineData} />

      <div className="grid md:grid-cols-2 gap-6">
        <SensorCharts machineId={machineId} />
        <HealthTrend machineId={machineId} />
      </div>
    </div>
  );
};