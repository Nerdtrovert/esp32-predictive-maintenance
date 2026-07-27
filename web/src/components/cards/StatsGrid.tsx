import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { KPIStat } from './KPIStat';
import apiService from '../../services/apiService';

export const StatsGrid = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchStats = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const data = await apiService.getFactoryStats();
        if (active) {
          setStats(data);
        }
      } catch (err) {
        if (active && isInitial) {
          setError('Failed to load statistics');
        }
        console.error('Error fetching stats:', err);
      } finally {
        if (active && isInitial) setLoading(false);
      }
    };

    fetchStats(true);

    const interval = setInterval(() => {
      fetchStats(false);
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Default data in case of loading or error
  const defaultStats = [
    {
      title: 'Overall Health Score',
      value: '94.2%',
      trend: 'up',
      change: '+2.3%',
      icon: 'heart',
      color: 'success'
    },
    {
      title: 'Machine Status',
      value: '3/4 Online',
      trend: 'neutral',
      change: '',
      icon: 'gauge',
      color: 'primary'
    },
    {
      title: 'Failure Risk',
      value: 'Low',
      trend: 'down',
      change: '-15%',
      icon: 'shield',
      color: 'success'
    },
    {
      title: 'Active Alerts',
      value: '3',
      trend: 'up',
      change: '+1',
      icon: 'alert-triangle',
      color: 'warning'
    },
    {
      title: 'Next Maintenance',
      value: 'In 2 days',
      trend: 'neutral',
      change: '',
      icon: 'wrench',
      color: 'accent'
    }
  ];

  const displayStats = loading || error ? defaultStats : stats;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array(5).fill(null).map((_, index) => (
          <KPIStat
            key={index}
            title="Loading..."
            value="-"
            trend="neutral"
            change=""
            icon="heart"
            color="primary"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {displayStats.map((stat, index) => (
          <KPIStat
            key={index}
            title={stat.title}
            value="Error"
            trend="neutral"
            change=""
            icon={stat.icon}
            color="destructive"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {displayStats.map((stat, index) => (
        <KPIStat
          key={index}
          title={stat.title}
          value={stat.value}
          trend={stat.trend}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};