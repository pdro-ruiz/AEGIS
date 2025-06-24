
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Cpu,
  Network,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface SystemSettings {
  detection: {
    threshold: number;
    sensitivity: 'low' | 'medium' | 'high';
    autoBlock: boolean;
    whitelist: string[];
  };
  alerts: {
    emailNotifications: boolean;
    slackWebhook: string;
    criticalOnly: boolean;
    maxAlertsPerHour: number;
  };
  performance: {
    maxCpuUsage: number;
    maxMemoryUsage: number;
    logRetention: number;
    apiRateLimit: number;
  };
  network: {
    monitoredSubnets: string[];
    excludedIPs: string[];
    scanInterval: number;
    maxConnections: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    detection: {
      threshold: 75,
      sensitivity: 'medium',
      autoBlock: true,
      whitelist: ['192.168.1.1', '10.0.0.1']
    },
    alerts: {
      emailNotifications: true,
      slackWebhook: '',
      criticalOnly: false,
      maxAlertsPerHour: 50
    },
    performance: {
      maxCpuUsage: 80,
      maxMemoryUsage: 85,
      logRetention: 30,
      apiRateLimit: 1000
    },
    network: {
      monitoredSubnets: ['192.168.1.0/24', '10.0.0.0/16'],
      excludedIPs: ['192.168.1.255', '224.0.0.0'],
      scanInterval: 5,
      maxConnections: 1000
    }
  });

  const [activeTab, setActiveTab] = useState<'detection' | 'alerts' | 'performance' | 'network'>('detection');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  };

  const addToArray = (category: keyof SystemSettings, key: string, value: string) => {
    if (value.trim()) {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...(prev[category] as any),
          [key]: [...((prev[category] as any)[key] as string[]), value.trim()]
        }
      }));
      setHasUnsavedChanges(true);
    }
  };

  const removeFromArray = (category: keyof SystemSettings, key: string, index: number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [key]: ((prev[category] as any)[key] as string[]).filter((_, i) => i !== index)
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      detection: {
        threshold: 75,
        sensitivity: 'medium',
        autoBlock: true,
        whitelist: ['192.168.1.1', '10.0.0.1']
      },
      alerts: {
        emailNotifications: true,
        slackWebhook: '',
        criticalOnly: false,
        maxAlertsPerHour: 50
      },
      performance: {
        maxCpuUsage: 80,
        maxMemoryUsage: 85,
        logRetention: 30,
        apiRateLimit: 1000
      },
      network: {
        monitoredSubnets: ['192.168.1.0/24', '10.0.0.0/16'],
        excludedIPs: ['192.168.1.255', '224.0.0.0'],
        scanInterval: 5,
        maxConnections: 1000
      }
    });
    setHasUnsavedChanges(true);
  };

  const tabs = [
    { key: 'detection', label: 'Detection', icon: Shield },
    { key: 'alerts', label: 'Alerts', icon: Bell },
    { key: 'performance', label: 'Performance', icon: Cpu },
    { key: 'network', label: 'Network', icon: Network }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            System Configuration
          </h1>
          <p className="text-gray-400">
            Configure AEGIS AI detection parameters and system settings
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {hasUnsavedChanges && (
            <div className="flex items-center text-yellow-400 text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Unsaved changes
            </div>
          )}
          <button
            onClick={resetToDefaults}
            className="flex items-center px-4 py-2 bg-gray-600/20 text-gray-400 border border-gray-600/50 rounded-lg hover:bg-gray-600/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasUnsavedChanges || saveStatus === 'saving'}
            className={`
              flex items-center px-4 py-2 rounded-lg transition-colors
              ${hasUnsavedChanges
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
                : 'bg-gray-600/20 text-gray-400 border border-gray-600/50 cursor-not-allowed'
              }
            `}
          >
            {saveStatus === 'saving' ? (
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-cyan-400 border-t-transparent rounded-full" />
            ) : saveStatus === 'saved' ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      {/* Settings Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-4 backdrop-blur-sm h-fit"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-cyan-400" />
            Categories
          </h2>
          <nav className="space-y-2">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`
                  w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeTab === key
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-3" />
                {label}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm"
        >
          {/* Detection Settings */}
          {activeTab === 'detection' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-cyan-400" />
                  Detection Configuration
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Configure DDoS detection thresholds and sensitivity levels
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detection Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Detection Threshold
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.detection.threshold}
                      onChange={(e) => updateSetting('detection', 'threshold', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0%</span>
                      <span className="text-cyan-400 font-mono">{settings.detection.threshold}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum confidence score required to trigger an alert
                  </p>
                </div>

                {/* Sensitivity Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sensitivity Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => updateSetting('detection', 'sensitivity', level)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize
                          ${settings.detection.sensitivity === level
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                            : 'bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/50'
                          }
                        `}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Higher sensitivity may increase false positives
                  </p>
                </div>
              </div>

              {/* Auto Block */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.detection.autoBlock}
                    onChange={(e) => updateSetting('detection', 'autoBlock', e.target.checked)}
                    className="mr-3 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-300">Enable automatic blocking of detected threats</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Automatically block IPs identified as DDoS sources
                </p>
              </div>

              {/* Whitelist */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IP Whitelist
                </label>
                <div className="space-y-2">
                  {settings.detection.whitelist.map((ip, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white font-mono text-sm">
                        {ip}
                      </div>
                      <button
                        onClick={() => removeFromArray('detection', 'whitelist', index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Enter IP address (e.g., 192.168.1.100)"
                      className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('detection', 'whitelist', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addToArray('detection', 'whitelist', input.value);
                        input.value = '';
                      }}
                      className="px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Settings */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-cyan-400" />
                  Alert Configuration
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Configure notification settings and alert thresholds
                </p>
              </div>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.alerts.emailNotifications}
                      onChange={(e) => updateSetting('alerts', 'emailNotifications', e.target.checked)}
                      className="mr-3 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-300">Enable email notifications</span>
                  </label>
                </div>

                {/* Slack Webhook */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slack Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.alerts.slackWebhook}
                    onChange={(e) => updateSetting('alerts', 'slackWebhook', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                {/* Critical Only */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.alerts.criticalOnly}
                      onChange={(e) => updateSetting('alerts', 'criticalOnly', e.target.checked)}
                      className="mr-3 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-300">Only send critical alerts</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Filter out low and medium severity alerts
                  </p>
                </div>

                {/* Max Alerts Per Hour */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Alerts Per Hour
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={settings.alerts.maxAlertsPerHour}
                    onChange={(e) => updateSetting('alerts', 'maxAlertsPerHour', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Prevents alert flooding during major incidents
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Performance Settings */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
                  Performance Configuration
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Configure system resource limits and performance parameters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPU Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum CPU Usage (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="95"
                    value={settings.performance.maxCpuUsage}
                    onChange={(e) => updateSetting('performance', 'maxCpuUsage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                {/* Memory Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Memory Usage (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="95"
                    value={settings.performance.maxMemoryUsage}
                    onChange={(e) => updateSetting('performance', 'maxMemoryUsage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                {/* Log Retention */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Log Retention (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.performance.logRetention}
                    onChange={(e) => updateSetting('performance', 'logRetention', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                {/* API Rate Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Rate Limit (requests/min)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={settings.performance.apiRateLimit}
                    onChange={(e) => updateSetting('performance', 'apiRateLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Network Settings */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Network className="w-5 h-5 mr-2 text-cyan-400" />
                  Network Configuration
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Configure network monitoring scope and connection limits
                </p>
              </div>

              <div className="space-y-6">
                {/* Monitored Subnets */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monitored Subnets
                  </label>
                  <div className="space-y-2">
                    {settings.network.monitoredSubnets.map((subnet, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white font-mono text-sm">
                          {subnet}
                        </div>
                        <button
                          onClick={() => removeFromArray('network', 'monitoredSubnets', index)}
                          className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Enter subnet (e.g., 192.168.1.0/24)"
                        className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addToArray('network', 'monitoredSubnets', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addToArray('network', 'monitoredSubnets', input.value);
                          input.value = '';
                        }}
                        className="px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scan Interval */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scan Interval (seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={settings.network.scanInterval}
                      onChange={(e) => updateSetting('network', 'scanInterval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Connections
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="10000"
                      value={settings.network.maxConnections}
                      onChange={(e) => updateSetting('network', 'maxConnections', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Bar */}
      {saveStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            fixed bottom-6 right-6 flex items-center px-4 py-3 rounded-lg backdrop-blur-sm border
            ${saveStatus === 'saved' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
              saveStatus === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
              'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'}
          `}
        >
          {saveStatus === 'saving' ? (
            <>
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-cyan-400 border-t-transparent rounded-full" />
              Saving settings...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Settings saved successfully
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Failed to save settings
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
