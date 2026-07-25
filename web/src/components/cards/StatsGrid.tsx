import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { KPIStat } from './KPIStat';
import apiService from '../../services/apiService';

export const StatsGrid = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiService.getFactoryStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
      <Card>
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
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
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
      </Card>
    );
  }

  return (
    <Card>
      <div className="gap-4 md:grid-cols-3 lg:grid-cols-5">
        {displayStats.map((stat, index) => (
          <KPIStat key={index} {...stat} />
        ))}
      </div>
    </Card>
  );
};