import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Settings, User, CheckCircle2, AlertTriangle, TrendingUp, Zap, Bell, Wrench, Loader2, RefreshCw } from 'lucide-react';

interface SettingsFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void> | void;
  error?: string | null;
}

export const SettingsForm = ({ initialData, onSubmit, error }: SettingsFormProps) => {
  const [formState, setFormState] = useState(initialData || {
    general: {
      factoryName: 'Machine Hawk Factory',
      location: 'Detroit, MI',
      timezone: 'America/Detroit',
      language: 'English',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12-hour'
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      criticalAlerts: true,
      warningAlerts: true,
      infoAlerts: false
    },
    maintenance: {
      autoSchedule: true,
      preventiveMaintenance: true,
      notificationLeadTime: 24,
      maxWorkOrders: 5
    },
    integrations: {
      erpSystem: 'SAP',
      scadaSystem: 'Ignition',
      historians: ['OSIsoft PI', 'Wonderware Historian'],
      apiEnabled: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormState((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleToggleChange = (section: string, field: string, checked: boolean) => {
    setFormState((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await onSubmit(formState);
      setSubmitSuccess('Settings saved successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err) {
      setSubmitError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || submitError;

  return (
    <Card className="h-full">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-4 w-4 text-industrial-accent" />
          <h2 className="text-lg font-semibold">System Settings</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {displayError && (
          <div className="bg-industrial-danger/10 border border-industrial-danger/20 rounded-lg px-4 py-3 text-industrial-danger text-sm mb-4">
            {displayError}
          </div>
        )}
        {submitSuccess && (
          <div className="bg-industrial-success/10 border border-industrial-success/20 rounded-lg px-4 py-3 text-industrial-success text-sm mb-4">
            {submitSuccess}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <section>
            <h3 className="text-xl font-semibold mb-4">General Settings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Factory Name</label>
                <input
                  type="text"
                  value={formState.general.factoryName || ''}
                  onChange={(e) => handleInputChange('general', 'factoryName', e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 disabled:opacity-50"
                  placeholder="Enter factory name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                <input
                  type="text"
                  value={formState.general.location || ''}
                  onChange={(e) => handleInputChange('general', 'location', e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 disabled:opacity-50"
                  placeholder="Enter location"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Timezone</label>
                <select
                  value={formState.general.timezone || 'America/Detroit'}
                  onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="America/New_York">Eastern Time (New York)</option>
                  <option value="America/Chicago">Central Time (Chicago)</option>
                  <option value="America/Denver">Mountain Time (Denver)</option>
                  <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Language</label>
                <select
                  value={formState.general.language || 'English'}
                  onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-alerts"
                  checked={formState.notifications.emailAlerts || false}
                  onChange={(e) => handleToggleChange('notifications', 'emailAlerts', e.target.checked)}
                  className="h-4 w-4 text-industrial-accent disabled:opacity-50"
                  disabled={loading}
                />
                <label className="ml-2 text-sm font-medium" htmlFor="email-alerts">
                  Email Alerts
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sms-alerts"
                  checked={formState.notifications.smsAlerts || false}
                  onChange={(e) => handleToggleChange('notifications', 'smsAlerts', e.target.checked)}
                  className="h-4 w-4 text-industrial-accent disabled:opacity-50"
                  disabled={loading}
                />
                <label className="ml-2 text-sm font-medium" htmlFor="sms-alerts">
                  SMS Alerts
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-notifications"
                  checked={formState.notifications.pushNotifications || false}
                  onChange={(e) => handleToggleChange('notifications', 'pushNotifications', e.target.checked)}
                  className="h-4 w-4 text-industrial-accent disabled:opacity-50"
                  disabled={loading}
                />
                <label className="ml-2 text-sm font-medium" htmlFor="push-notifications">
                  Push Notifications
                </label>
              </div>
              <div className="border-t border-border/50 pt-4">
                <h4 className="text-sm font-medium mb-2">Alert Severity Levels</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Critical</span>
                    <input
                      type="checkbox"
                      checked={formState.notifications.criticalAlerts || false}
                      onChange={(e) => handleToggleChange('notifications', 'criticalAlerts', e.target.checked)}
                      className="h-4 w-4 text-industrial-danger disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Warning</span>
                    <input
                      type="checkbox"
                      checked={formState.notifications.warningAlerts || false}
                      onChange={(e) => handleToggleChange('notifications', 'warningAlerts', e.target.checked)}
                      className="h-4 w-4 text-industrial-warning disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Info</span>
                    <input
                      type="checkbox"
                      checked={formState.notifications.infoAlerts || false}
                      onChange={(e) => handleToggleChange('notifications', 'infoAlerts', e.target.checked)}
                      className="h-4 w-4 text-industrial-info disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Maintenance Settings */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Maintenance Settings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-schedule"
                    checked={formState.maintenance.autoSchedule || false}
                    onChange={(e) => handleToggleChange('maintenance', 'autoSchedule', e.target.checked)}
                    className="h-4 w-4 text-industrial-accent disabled:opacity-50"
                    disabled={loading}
                  />
                  <label className="ml-2 text-sm font-medium" htmlFor="auto-schedule">
                    Automatically Schedule Maintenance
                  </label>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  When enabled, the system will automatically generate maintenance work orders based on equipment health scores.
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="preventive-maintenance"
                    checked={formState.maintenance.preventiveMaintenance || false}
                    onChange={(e) => handleToggleChange('maintenance', 'preventiveMaintenance', e.target.checked)}
                    className="h-4 w-4 text-industrial-accent disabled:opacity-50"
                    disabled={loading}
                  />
                  <label className="ml-2 text-sm font-medium" htmlFor="preventive-maintenance">
                    Enable Preventive Maintenance Tracking
                  </label>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Track and schedule preventive maintenance tasks based on time or usage intervals.
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Notification Lead Time (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={formState.maintenance.notificationLeadTime || 24}
                  onChange={(e) => handleInputChange('maintenance', 'notificationLeadTime', parseInt(e.target.value) || 24)}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 disabled:opacity-50"
                  disabled={loading}
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  How far in advance to notify about upcoming maintenance
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Maximum Open Work Orders</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formState.maintenance.maxWorkOrders || 5}
                  onChange={(e) => handleInputChange('maintenance', 'maxWorkOrders', parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 disabled:opacity-50"
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {/* Integration Settings */}
          <section>
            <h3 className="text-xl font-semibold mb-4">System Integrations</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">ERP System</label>
                <select
                  value={formState.integrations.erpSystem || 'SAP'}
                  onChange={(e) => handleInputChange('integrations', 'erpSystem', e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="SAP">SAP</option>
                  <option value="Oracle">Oracle ERP</option>
                  <option value="Microsoft Dynamics">Microsoft Dynamics</option>
                  <option value="Custom">Custom/Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">SCADA System</label>
                <select
                  value={formState.integrations.scadaSystem || 'Ignition'}
                  onChange={(e) => handleInputChange('integrations', 'scadaSystem', e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-industrial-accent/50 focus:border-industrial-accent bg-background/50 disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="Ignition">Ignition SCADA</option>
                  <option value="Wonderware">Wonderware</option>
                  <option value="GE Digital">GE Digital iFIX</option>
                  <option value="Siemens">Siemens WinCC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Historians</label>
                <div className="space-y-2">
                  {['OSIsoft PI', 'Wonderware Historian', 'AspenTech InfoPlus.21'].map((historian: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`historian-${index}`}
                        checked={formState.integrations.historians?.includes(historian) || false}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const historians = [...(formState.integrations.historians || []), historian];
                          const updatedHistorians = isChecked
                            ? historians
                            : (formState.integrations.historians || []).filter((h: string) => h !== historian);

                          setFormState((prev: any) => ({
                            ...prev,
                            integrations: {
                              ...prev.integrations,
                              historians: updatedHistorians
                            }
                          }));
                        }}
                        className="h-4 w-4 text-industrial-accent disabled:opacity-50"
                        disabled={loading}
                      />
                      <label className="ml-2 text-sm font-medium" htmlFor={`historian-${index}`}>
                        {historian}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="api-enabled"
                  checked={formState.integrations.apiEnabled || false}
                  onChange={(e) => handleToggleChange('integrations', 'apiEnabled', e.target.checked)}
                  className="h-4 w-4 text-industrial-accent disabled:opacity-50"
                  disabled={loading}
                />
                <label className="ml-2 text-sm font-medium" htmlFor="api-enabled">
                  Enable REST API for External Integrations
                </label>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-border/50">
            <button
              type="button"
              onClick={() => {
                // Reset to initial values or defaults
                setFormState(initialData || {
                  general: {
                    factoryName: 'Machine Hawk Factory',
                    location: 'Detroit, MI',
                    timezone: 'America/Detroit',
                    language: 'English',
                    dateFormat: 'MM/DD/YYYY',
                    timeFormat: '12-hour'
                  },
                  notifications: {
                    emailAlerts: true,
                    smsAlerts: false,
                    pushNotifications: true,
                    criticalAlerts: true,
                    warningAlerts: true,
                    infoAlerts: false
                  },
                  maintenance: {
                    autoSchedule: true,
                    preventiveMaintenance: true,
                    notificationLeadTime: 24,
                    maxWorkOrders: 5
                  },
                  integrations: {
                    erpSystem: 'SAP',
                    scadaSystem: 'Ignition',
                    historians: ['OSIsoft PI', 'Wonderware Historian'],
                    apiEnabled: true
                  }
                });
              }}
              disabled={loading}
              className="px-4 py-2 border border-border/50 rounded-lg hover:bg-accent/5 transition-colors text-sm disabled:opacity-50"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              disabled={loading || !formState}
              className="px-6 py-2 bg-industrial-accent text-white rounded-lg hover:bg-industrial-accent/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};