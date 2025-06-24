
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Activity,
  Server,
  Zap,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { MetricCard } from '@/components/metric-card';
import { RealTimeChart } from '@/components/real-time-chart';
import { ThreatLevelIndicator } from '@/components/threat-level-indicator';
import { useRealTimeMetrics, useRealTimeDetections, useSystemHealth } from '@/hooks/use-real-time-data';

export default function DashboardPage() {
  const { metrics, isLoading: metricsLoading } = useRealTimeMetrics(2000);
  const { detections, isLoading: detectionsLoading } = useRealTimeDetections(3000);
  const { health } = useSystemHealth(5000);

  const [chartData, setChartData] = useState<Array<{ timestamp: string; value: number }>>([]);
  const [threatData, setThreatData] = useState<Array<{ timestamp: string; value: number }>>([]);

  // Update chart data with real-time metrics
  useEffect(() => {
    if (metrics) {
      const timestamp = new Date().toISOString();
      
      setChartData(prev => {
        const newData = [...prev, { timestamp, value: metrics.packetsPerSecond }];
        return newData.slice(-20); // Keep last 20 points
      });
      
      setThreatData(prev => {
        const avgThreatScore = detections.length > 0 
          ? detections.slice(0, 5).reduce((sum, d) => sum + d.score, 0) / Math.min(5, detections.length)
          : 0;
        const newData = [...prev, { timestamp, value: avgThreatScore }];
        return newData.slice(-20);
      });
    }
  }, [metrics, detections]);

  const stats = React.useMemo(() => {
    const activeThreats = detections.filter(d => d.isDdos && d.severity !== 'LOW').length;
    const totalThreats = detections.filter(d => d.isDdos).length;
    const avgThreatScore = detections.length > 0 
      ? detections.reduce((sum, d) => sum + d.score, 0) / detections.length 
      : 0;
    
    return {
      totalThreats,
      activeThreats,
      devicesMonitored: 156,
      systemUptime: health?.uptime || 99.9,
      avgThreatScore,
      detectionAccuracy: 99.7
    };
  }, [detections, health]);

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
            AEGIS Defense Dashboard
          </h1>
          <p className="text-gray-400">
            Real-time cybersecurity monitoring and threat detection
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">System Status</div>
            <div className={`text-lg font-bold ${health?.status === 'HEALTHY' ? 'text-green-400' : 'text-red-400'}`}>
              {health?.status || 'HEALTHY'}
            </div>
          </div>
          <ThreatLevelIndicator score={stats.avgThreatScore} size="md" />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Threats"
          value={stats.activeThreats}
          icon={AlertTriangle}
          color="red"
          description="High-priority security alerts"
          isLoading={detectionsLoading}
        />
        <MetricCard
          title="Total Detections"
          value={stats.totalThreats}
          icon={Shield}
          color="yellow"
          description="DDoS attacks identified"
          isLoading={detectionsLoading}
        />
        <MetricCard
          title="Devices Monitored"
          value={stats.devicesMonitored}
          icon={Server}
          color="cyan"
          description="Network endpoints secured"
        />
        <MetricCard
          title="System Uptime"
          value={`${stats.systemUptime.toFixed(1)}%`}
          icon={Activity}
          color="green"
          description="Service availability"
        />
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeChart
          data={chartData}
          title="Network Traffic (Packets/sec)"
          color="#00BFFF"
          type="area"
          unit=" pps"
          height={250}
        />
        <RealTimeChart
          data={threatData}
          title="Threat Score Trend"
          color="#FF073A"
          type="line"
          unit=""
          height={250}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="CPU Usage"
          value={metrics?.cpuUsage.toFixed(1) || '0.0'}
          unit="%"
          icon={Activity}
          color="purple"
          description="System processor load"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Memory Usage"
          value={metrics?.memoryUsage.toFixed(1) || '0.0'}
          unit="%"
          icon={Server}
          color="yellow"
          description="RAM utilization"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Avg Latency"
          value={metrics?.avgLatency.toFixed(1) || '0.0'}
          unit="ms"
          icon={Zap}
          color="cyan"
          description="Network response time"
          isLoading={metricsLoading}
        />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900/50 rounded-xl border border-cyan-500/20 backdrop-blur-sm p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-cyan-400" />
          Recent Threat Detections
        </h2>
        
        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
          {detectionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-gray-400">Loading detections...</p>
            </div>
          ) : detections.length > 0 ? (
            detections.slice(0, 8).map((detection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${detection.isDdos 
                    ? 'border-red-500/30 bg-red-500/10' 
                    : 'border-green-500/30 bg-green-500/10'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${detection.isDdos ? 'bg-red-400' : 'bg-green-400'} animate-pulse`} />
                  <div>
                    <div className="text-white font-medium">{detection.sourceIp}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(detection.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${detection.isDdos ? 'text-red-400' : 'text-green-400'}`}>
                    Score: {detection.score.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {detection.severity.toLowerCase()}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No recent detections
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
