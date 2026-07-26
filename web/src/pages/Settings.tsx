import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { SettingsForm } from '../components/cards/SettingsForm';
import apiService from '../services/apiService';
import { Loader, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const Settings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (formData: any) => {
    try {
      await apiService.updateSettings(formData);
      setSuccessMessage('Settings saved successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex items-center justify-center py-12">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-industrial-accent"></div>
            </div>
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-8 w-8 text-industrial-danger mb-4" />
          <p className="text-center text-destructive">{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 border border-industrial-danger/50 rounded-lg hover:bg-industrial-danger/10 text-industrial-danger text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-8 w-8 text-industrial-secondary mb-4" />
          <p className="text-center text-muted-foreground">No settings available</p>
          <p className="text-center text-xs text-muted-foreground max-w-md">
            Please ensure the backend is running and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      {successMessage && (
        <div className="bg-industrial-success/10 border border-industrial-success/20 rounded-lg px-4 py-3 text-industrial-success text-sm mb-4 animate-fade-in">
          {successMessage}
        </div>
      )}
      <SettingsForm
        initialData={settings}
        onSubmit={handleSaveSettings}
        error={error}
      />
    </div>
  );
};