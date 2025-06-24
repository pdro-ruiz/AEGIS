
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Server,
  Wifi,
  Monitor,
  Router,
  Smartphone,
  Activity,
  Globe,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { RealTimeChart } from '@/components/real-time-chart';
import { useRealTimeMetrics } from '@/hooks/use-real-time-data';

interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: 'server' | 'workstation' | 'mobile' | 'router' | 'iot';
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
  riskLevel: 'low' | 'medium' | 'high';
  bytesIn: number;
  bytesOut: number;
  connections: number;
}

interface NetworkTopology {
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    status: string;
  }>;
  connections: Array<{
    source: string;
    target: string;
    strength: number;
  }>;
}

export default function NetworkPage() {
  const { metrics } = useRealTimeMetrics(2000);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [viewMode, setViewMode] = useState<'devices' | 'topology' | 'traffic'>('devices');

  // Mock network devices data
  const networkDevices: NetworkDevice[] = [
    {
      id: 'server-01',
      name: 'Main Server',
      ip: '192.168.1.10',
      mac: '00:1B:44:11:3A:B7',
      type: 'server',
      status: 'online',
      lastSeen: new Date().toISOString(),
      riskLevel: 'low',
      bytesIn: 15234567,
      bytesOut: 8934521,
      connections: 45
    },
    {
      id: 'workstation-01',
      name: 'Admin Workstation',
      ip: '192.168.1.100',
      mac: '00:1B:44:11:3A:C8',
      type: 'workstation',
      status: 'online',
      lastSeen: new Date(Date.now() - 300000).toISOString(),
      riskLevel: 'medium',
      bytesIn: 2345678,
      bytesOut: 1234567,
      connections: 12
    },
    {
      id: 'mobile-01',
      name: 'Security Phone',
      ip: '192.168.1.205',
      mac: '00:1B:44:11:3A:D9',
      type: 'mobile',
      status: 'online',
      lastSeen: new Date(Date.now() - 60000).toISOString(),
      riskLevel: 'low',
      bytesIn: 234567,
      bytesOut: 123456,
      connections: 3
    },
    {
      id: 'router-01',
      name: 'Core Router',
      ip: '192.168.1.1',
      mac: '00:1B:44:11:3A:EA',
      type: 'router',
      status: 'online',
      lastSeen: new Date().toISOString(),
      riskLevel: 'low',
      bytesIn: 45678901,
      bytesOut: 32145678,
      connections: 156
    },
    {
      id: 'iot-01',
      name: 'Security Camera #1',
      ip: '192.168.1.150',
      mac: '00:1B:44:11:3A:FB',
      type: 'iot',
      status: 'warning',
      lastSeen: new Date(Date.now() - 900000).toISOString(),
      riskLevel: 'high',
      bytesIn: 567890,
      bytesOut: 234567,
      connections: 2
    },
    {
      id: 'workstation-02',
      name: 'Dev Machine',
      ip: '192.168.1.101',
      mac: '00:1B:44:11:3A:GC',
      type: 'workstation',
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
      riskLevel: 'low',
      bytesIn: 1234567,
      bytesOut: 987654,
      connections: 0
    }
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'server': return Server;
      case 'workstation': return Monitor;
      case 'mobile': return Smartphone;
      case 'router': return Router;
      case 'iot': return Wifi;
      default: return Globe;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'green';
      case 'warning': return 'yellow';
      case 'offline': return 'red';
      default: return 'gray';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Generate sample traffic data
  const trafficData = Array.from({ length: 20 }, (_, i) => ({
    timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
    value: Math.floor(Math.random() * 1000) + 500
  }));

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
            Network Monitor
          </h1>
          <p className="text-gray-400">
            Real-time network topology and device monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            {[
              { key: 'devices', label: 'Devices', icon: Server },
              { key: 'topology', label: 'Topology', icon: Network },
              { key: 'traffic', label: 'Traffic', icon: Activity }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${viewMode === key
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Network Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Devices', 
            value: networkDevices.length, 
            icon: Server, 
            color: 'cyan',
            subtitle: `${networkDevices.filter(d => d.status === 'online').length} online`
          },
          { 
            title: 'Active Connections', 
            value: networkDevices.reduce((sum, d) => sum + d.connections, 0), 
            icon: Network, 
            color: 'green',
            subtitle: 'Total connections'
          },
          { 
            title: 'High Risk Devices', 
            value: networkDevices.filter(d => d.riskLevel === 'high').length, 
            icon: AlertTriangle, 
            color: 'red',
            subtitle: 'Require attention'
          },
          { 
            title: 'Network Uptime', 
            value: '99.8%', 
            icon: TrendingUp, 
            color: 'purple',
            subtitle: 'Last 30 days'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 rounded-lg border backdrop-blur-sm
              ${stat.color === 'cyan' ? 'border-cyan-500/30 bg-cyan-500/10' :
                stat.color === 'green' ? 'border-green-500/30 bg-green-500/10' :
                stat.color === 'red' ? 'border-red-500/30 bg-red-500/10' :
                'border-purple-500/30 bg-purple-500/10'}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.subtitle}</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Based on View Mode */}
      {viewMode === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
          >
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-cyan-400" />
                Network Devices ({networkDevices.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-700/50 max-h-96 overflow-y-auto scrollbar-thin">
              {networkDevices.map((device, index) => {
                const DeviceIcon = getDeviceIcon(device.type);
                const statusColor = getStatusColor(device.status);
                const riskColor = getRiskColor(device.riskLevel);
                
                return (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      p-4 cursor-pointer transition-all hover:bg-gray-800/30
                      ${selectedDevice?.id === device.id ? 'bg-cyan-500/10 border-l-4 border-cyan-400' : ''}
                    `}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${statusColor}-500/20`}>
                          <DeviceIcon className={`w-4 h-4 text-${statusColor}-400`} />
                        </div>
                        <div>
                          <div className="text-white font-medium">{device.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{device.ip}</div>
                          <div className="text-xs text-gray-500">{device.mac}</div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${device.status === 'online' ? 'bg-green-500/20 text-green-400' :
                            device.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'}
                        `}>
                          {device.status.toUpperCase()}
                        </div>
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${device.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                            device.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'}
                        `}>
                          {device.riskLevel.toUpperCase()} RISK
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Device Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
          >
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                Device Details
              </h2>
            </div>

            {selectedDevice ? (
              <div className="p-4 space-y-4">
                {/* Device Header */}
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-${getStatusColor(selectedDevice.status)}-500/20`}>
                    {React.createElement(getDeviceIcon(selectedDevice.type), {
                      className: `w-6 h-6 text-${getStatusColor(selectedDevice.status)}-400`
                    })}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedDevice.name}</h3>
                    <p className="text-gray-400 capitalize">{selectedDevice.type} Device</p>
                  </div>
                </div>

                {/* Device Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">IP Address</label>
                    <div className="text-white font-mono">{selectedDevice.ip}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">MAC Address</label>
                    <div className="text-white font-mono text-sm">{selectedDevice.mac}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className={`font-medium text-${getStatusColor(selectedDevice.status)}-400 capitalize`}>
                      {selectedDevice.status}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Risk Level</label>
                    <div className={`font-medium text-${getRiskColor(selectedDevice.riskLevel)}-400 capitalize`}>
                      {selectedDevice.riskLevel}
                    </div>
                  </div>
                </div>

                {/* Traffic Stats */}
                <div>
                  <h4 className="text-white font-medium mb-3">Traffic Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-green-400 text-lg font-mono">
                        {formatBytes(selectedDevice.bytesIn)}
                      </div>
                      <div className="text-xs text-gray-400">Bytes In</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-blue-400 text-lg font-mono">
                        {formatBytes(selectedDevice.bytesOut)}
                      </div>
                      <div className="text-xs text-gray-400">Bytes Out</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-purple-400 text-lg font-mono">
                        {selectedDevice.connections}
                      </div>
                      <div className="text-xs text-gray-400">Connections</div>
                    </div>
                  </div>
                </div>

                {/* Last Activity */}
                <div>
                  <h4 className="text-white font-medium mb-2">Last Activity</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(selectedDevice.lastSeen).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center py-12">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">
                  Select a device from the list to view details
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {viewMode === 'traffic' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <RealTimeChart
            data={trafficData}
            title="Network Traffic Overview"
            color="#00BFFF"
            type="area"
            unit=" pps"
            height={300}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Top Bandwidth Consumers</h3>
              <div className="space-y-3">
                {networkDevices
                  .sort((a, b) => (b.bytesIn + b.bytesOut) - (a.bytesIn + a.bytesOut))
                  .slice(0, 5)
                  .map((device, index) => (
                    <div key={device.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-cyan-400 font-mono text-sm">{index + 1}</div>
                        <div>
                          <div className="text-white text-sm">{device.name}</div>
                          <div className="text-gray-400 text-xs">{device.ip}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono text-sm">
                          {formatBytes(device.bytesIn + device.bytesOut)}
                        </div>
                        <div className="text-gray-400 text-xs">Total</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Connection Distribution</h3>
              <div className="space-y-3">
                {networkDevices
                  .sort((a, b) => b.connections - a.connections)
                  .slice(0, 5)
                  .map((device, index) => (
                    <div key={device.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{device.name}</span>
                        <span className="text-white">{device.connections}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-cyan-400 h-1.5 rounded-full"
                          style={{ 
                            width: `${(device.connections / Math.max(...networkDevices.map(d => d.connections)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {viewMode === 'topology' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Network className="w-5 h-5 mr-2 text-cyan-400" />
            Network Topology
          </h2>
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Interactive network topology visualization</p>
              <p className="text-sm mt-2">Feature coming soon - Advanced network mapping</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
