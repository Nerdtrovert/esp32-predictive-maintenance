import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Clock, CheckCircle2, AlertTriangle, Loader2, Menu, Filter, Search, ChevronDown } from 'lucide-react';
import apiService from '../../services/apiService';

export const MaintenanceHistory = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const fetchMaintenanceHistory = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      }
      const data = await apiService.getMaintenanceHistory();
      setMaintenanceRecords(data);
    } catch (err) {
      if (isInitial) {
        setError('Unable to connect to hardware. Showing last known data.');
      }
      console.error('Error fetching maintenance history:', err);
      // Try to load past data from localStorage
      try {
        const savedData = localStorage.getItem('maintenanceHistory');
        if (savedData) {
          setMaintenanceRecords(JSON.parse(savedData));
          if (isInitial) setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing saved data:', e);
      }
      setMaintenanceRecords([]); // Fallback to empty array
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceHistory(true);

    const interval = setInterval(() => {
      fetchMaintenanceHistory(false);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // No mock data - rely solely on API or cached data
  const records = maintenanceRecords;

  // Filter records based on selected filters
  const filteredRecords = records.filter(record => {
    const typeMatch = filters.type === 'all' || record.type.toLowerCase() === filters.type;
    const statusMatch = filters.status === 'all' || record.status.toLowerCase() === filters.status;
    const searchMatch = record.equipment.toLowerCase().includes(filters.search.toLowerCase()) ||
                       record.technician.toLowerCase().includes(filters.search.toLowerCase());
    return typeMatch && statusMatch && searchMatch;
  });

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-industrial-accent animate-pulse" />
            <h2 className="text-lg font-semibold">Maintenance History</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center">
          <div className="space-y-4">
            <div className="h-6 w-6">
              <Loader2 className="h-6 w-6 text-industrial-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Loading maintenance records...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && maintenanceRecords.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-4 w-4 text-industrial-warning" />
            <h2 className="text-lg font-semibold">Maintenance History</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center">
          <div className="space-y-3 text-center">
            <p className="text-industrial-warning">{error}</p>
            <button
              onClick={fetchMaintenanceHistory}
              className="px-4 py-2 border border-industrial-warning/50 rounded-lg hover:bg-industrial-warning/10 text-industrial-warning text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (maintenanceRecords.length === 0 && !error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-4 w-4 text-industrial-secondary" />
            <h2 className="text-lg font-semibold">Maintenance History</h2>
          </div>
        </CardHeader>
        <CardContent className="flex h-full flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 text-industrial-secondary">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <p className="text-center text-muted-foreground">No maintenance records available</p>
            <p className="text-center text-xs text-muted-foreground">
              Connect to hardware to see live data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Clock className="h-4 w-4 text-industrial-accent" />
          <h2 className="text-lg font-semibold">Maintenance History</h2>
        </div>
        <div className="ml-auto flex space-x-3">
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search equipment or technician..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
              className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus-ring-industrial-accent/50 focus:border-industrial-accent bg-background/50"
            />
          </div>

          {/* Type Filter */}
          <div className="relative dropdown">
            <button
              onClick={() => setShowDropdown('type')}
              className="flex items-center space-x-2 px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus-ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 hover:bg-accent/5 transition-colors"
            >
              <Filter className="h-4 w-4 text-industrial-accent" />
              <span className="text-sm font-medium">Type: {filters.type === 'all' ? 'All' : filters.type}</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </button>
            {showDropdown === 'type' && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-border/50 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setFilters(prev => ({...prev, type: 'all'}));
                      setShowDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm w-full text-left hover:bg-accent/5"
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => {
                      setFilters(prev => ({...prev, type: 'preventive'}));
                      setShowDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm w-full text-left hover:bg-accent/5"
                  >
                    Preventive
                  </button>
                  <button
                    onClick={() => {
                      setFilters(prev => ({...prev, type: 'corrective'}));
                      setShowDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm w-full text-left hover:bg-accent/5"
                  >
                    Corrective
                  </button>
                  <button
                    onClick={() => {
                      setFilters(prev => ({...prev, type: 'predictive'}));
                      setShowDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm w-full text-left hover:bg-accent/5"
                  >
                    Predictive
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative dropdown">
            <button
              onClick={() => setShowDropdown('status')}
              className="flex items-center space-x-2 px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus-ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 hover:bg-accent/5 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 text-industrial-accent" />
              <span className="text-sm font-medium">Status: {filters.status === 'all' ? 'All' : filters.status}</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </button>
            {showDropdown === 'status' && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-border/50 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setFilters(prev => ({...prev, status: 'all'}));
                      setShowDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm w-full text-left hover:bg-accent/5"
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => {
                      setFilters(prev => ({...prev, status: 'completed'}));
                      setShowDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm w-full text-left hover:bg-accent/5"
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => {
                      setFilters(prev => ({...prev, status: 'in progress'}));
                      setShowDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm w-full text-left hover:bg-accent/5"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => {
                      setFilters(prev => ({...prev, status: 'scheduled'}));
                      setShowDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm w-full text-left hover:bg-accent/5"
                  >
                    Scheduled
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="py-2">
            <table className="min-w-full divide-y divide-border/50">
              <thead className="bg-industrial-blue/5">
                <tr>
                  <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Equipment</th>
                  <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Hours</th>
                  <th className="text-left text-xs font-medium text-industrial-foreground px-4 py-3">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-accent/5 transition-colors">
                    <td className="text-sm px-4 py-3">{record.date}</td>
                    <td className="text-sm px-4 py-3">{record.equipment}</td>
                    <td className="text-sm px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        record.type === 'Preventive'
                          ? 'bg-industrial-success/10 text-industrial-success'
                          : record.type === 'Corrective'
                            ? 'bg-industrial-danger/10 text-industrial-danger'
                            : 'bg-industrial-warning/10 text-industrial-warning'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="text-sm px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Completed'
                          ? 'bg-industrial-success/10 text-industrial-success'
                          : record.status === 'In Progress'
                            ? 'bg-industrial-warning/10 text-industrial-warning'
                            : record.status === 'Scheduled'
                              ? 'bg-industrial-accent/10 text-industrial-accent'
                              : 'bg-muted/10 text-muted-foreground'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="text-sm px-4 py-3 text-right">
                      {record.hours?.toLocaleString()} hrs
                    </td>
                    <td className="text-sm px-4 py-3">{record.technician}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 text-xs text-muted-foreground text-center">
            Showing {filteredRecords.length} of {records.length} maintenance records
          </div>
        </div>
      </CardContent>
    </Card>
  );
};