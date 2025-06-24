
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  Clock,
  Filter,
  Search,
  CheckCircle,
  X,
  Info
} from 'lucide-react';
import { ThreatLevelIndicator } from '@/components/threat-level-indicator';
import { useRealTimeDetections } from '@/hooks/use-real-time-data';

type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  sourceIp: string;
  score: number;
  timestamp: string;
}

export default function AlertsPage() {
  const { detections, isLoading } = useRealTimeDetections(3000);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Convert detections to alerts
  useEffect(() => {
    const alertsFromDetections: AlertItem[] = detections
      .filter(d => d.isDdos)
      .map((detection, index) => ({
        id: `alert-${index}`,
        title: `DDoS Attack Detected`,
        description: `Suspicious traffic pattern from ${detection.sourceIp} with confidence score ${detection.score.toFixed(1)}`,
        severity: detection.severity,
        status: 'OPEN' as AlertStatus,
        sourceIp: detection.sourceIp,
        score: detection.score,
        timestamp: detection.timestamp,
      }));
    
    setAlerts(alertsFromDetections);
  }, [detections]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'ALL' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || alert.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      alert.sourceIp.includes(searchTerm) || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const updateAlertStatus = (alertId: string, newStatus: AlertStatus) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: newStatus }
        : alert
    ));
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'yellow';
      case 'HIGH': return 'orange';
      case 'CRITICAL': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'OPEN': return AlertTriangle;
      case 'ACKNOWLEDGED': return Info;
      case 'RESOLVED': return CheckCircle;
      default: return AlertTriangle;
    }
  };

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
            Security Alerts
          </h1>
          <p className="text-gray-400">
            Monitor and manage cybersecurity threats in real-time
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Active Alerts</div>
            <div className="text-2xl font-bold text-red-400">
              {filteredAlerts.filter(a => a.status === 'OPEN').length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'CRITICAL'].map((type, index) => {
          const count = type === 'CRITICAL' 
            ? alerts.filter(a => a.severity === 'CRITICAL').length
            : alerts.filter(a => a.status === type).length;
          
          const colors = {
            OPEN: 'red',
            ACKNOWLEDGED: 'yellow',
            RESOLVED: 'green',
            CRITICAL: 'purple'
          };

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-lg border backdrop-blur-sm
                ${type === 'OPEN' ? 'border-red-500/30 bg-red-500/10' :
                  type === 'ACKNOWLEDGED' ? 'border-yellow-500/30 bg-yellow-500/10' :
                  type === 'RESOLVED' ? 'border-green-500/30 bg-green-500/10' :
                  'border-purple-500/30 bg-purple-500/10'}
              `}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400 capitalize">{type}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-4 backdrop-blur-sm"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts by IP, title, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | 'ALL')}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value="ALL">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AlertStatus | 'ALL')}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </motion.div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
      >
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-cyan-400" />
            Alert Management ({filteredAlerts.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-700/50 max-h-96 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-gray-400">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, index) => {
              const StatusIcon = getStatusIcon(alert.status);
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <ThreatLevelIndicator 
                        score={alert.score} 
                        size="sm" 
                        showLabel={false}
                        animate={false}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-medium">{alert.title}</h3>
                          <span className={`
                            px-2 py-1 text-xs rounded-full font-medium
                            ${alert.severity === 'LOW' ? 'bg-green-500/20 text-green-400' :
                              alert.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                              alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'}
                          `}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>IP: {alert.sourceIp}</span>
                          <span>Score: {alert.score.toFixed(1)}</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`
                        flex items-center space-x-1 px-2 py-1 rounded-full text-xs
                        ${alert.status === 'OPEN' ? 'bg-red-500/20 text-red-400' :
                          alert.status === 'ACKNOWLEDGED' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'}
                      `}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{alert.status}</span>
                      </div>

                      {/* Action Buttons */}
                      {alert.status === 'OPEN' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs hover:bg-yellow-500/30 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      
                      {alert.status === 'ACKNOWLEDGED' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              No alerts match your current filters
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
