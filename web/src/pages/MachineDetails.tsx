import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { MachineHeader } from '../components/cards/MachineHeader';
import { SensorCharts } from '../components/charts/SensorCharts';
import { HealthTrend } from '../components/charts/HealthTrend';
import apiService from '../services/apiService';

export const MachineDetails = () => {
  const [machineId, setMachineId] = useState(1);
  const [machineData, setMachineData] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch machine details
        const machine = await apiService.getMachineDetails(machineId);
        setMachineData(machine);

        // Fetch sensor data
        const sensors = await apiService.getMachineSensorData(machineId);
        setSensorData(sensors);

        // Fetch health data
        const health = await apiService.getMachineHealth(machineId);
        setHealthData(health);
      } catch (err) {
        setError('Failed to load machine data');
        console.error('Error fetching machine data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [machineId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Machine Details - Press Line Alpha</h1>

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
        <h1 className="text-2xl font-bold">Machine Details - Press Line Alpha</h1>
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
      <h1 className="text-2xl font-bold">Machine Details - {machineData?.name || 'Press Line Alpha'}</h1>

      <MachineHeader
        machine={machineData}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <SensorCharts
          sensorData={sensorData}
        />
        <HealthTrend
          healthData={healthData}
        />
      </div>
    </div>
  );
};