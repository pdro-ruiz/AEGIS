
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Shield,
  AlertTriangle,
  Target,
  Calendar,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { useRealTimeDetections } from '@/hooks/use-real-time-data';

interface AnalyticsData {
  hourlyDetections: Array<{ hour: string; detections: number; blocked: number }>;
  severityDistribution: Array<{ name: string; value: number; color: string }>;
  topAttackerIPs: Array<{ ip: string; attacks: number; lastSeen: string }>;
  detectionTrends: Array<{ date: string; detections: number; accuracy: number }>;
  protocolBreakdown: Array<{ protocol: string; count: number; percentage: number }>;
}

export default function AnalyticsPage() {
  const { detections } = useRealTimeDetections(3000);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    // Process detections into analytics data
    if (detections.length > 0) {
      const now = new Date();
      const last24Hours = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        return hour.getHours().toString().padStart(2, '0') + ':00';
      });

      const hourlyData = last24Hours.map(hour => {
        const hourDetections = detections.filter(d => {
          const detectionHour = new Date(d.timestamp).getHours().toString().padStart(2, '0') + ':00';
          return detectionHour === hour;
        });
        
        return {
          hour,
          detections: hourDetections.length,
          blocked: hourDetections.filter(d => d.isDdos).length
        };
      });

      const severityData = [
        { name: 'LOW', value: detections.filter(d => d.severity === 'LOW').length, color: '#22C55E' },
        { name: 'MEDIUM', value: detections.filter(d => d.severity === 'MEDIUM').length, color: '#EAB308' },
        { name: 'HIGH', value: detections.filter(d => d.severity === 'HIGH').length, color: '#F97316' },
        { name: 'CRITICAL', value: detections.filter(d => d.severity === 'CRITICAL').length, color: '#EF4444' },
      ];

      // Top attacker IPs
      const ipCounts = detections.reduce((acc, d) => {
        if (d.isDdos) {
          acc[d.sourceIp] = (acc[d.sourceIp] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topIPs = Object.entries(ipCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({
          ip,
          attacks: count,
          lastSeen: detections.find(d => d.sourceIp === ip)?.timestamp || new Date().toISOString()
        }));

      // Detection trends (mock data for demo)
      const trendData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          detections: Math.floor(Math.random() * 100) + 50,
          accuracy: 95 + Math.random() * 4
        };
      });

      // Protocol breakdown (mock data)
      const protocolData = [
        { protocol: 'TCP', count: 45, percentage: 45 },
        { protocol: 'UDP', count: 30, percentage: 30 },
        { protocol: 'ICMP', count: 15, percentage: 15 },
        { protocol: 'HTTP', count: 10, percentage: 10 }
      ];

      setAnalytics({
        hourlyDetections: hourlyData,
        severityDistribution: severityData,
        topAttackerIPs: topIPs,
        detectionTrends: trendData,
        protocolBreakdown: protocolData
      });
    }
  }, [detections]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-cyan-400/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-cyan-400 text-sm font-mono">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white text-sm">
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
      </div>
    );
  }

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
            Advanced Analytics
          </h1>
          <p className="text-gray-400">
            Deep insights into threat patterns and system performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Detections', value: detections.length, icon: Shield, color: 'cyan' },
          { title: 'Blocked Attacks', value: detections.filter(d => d.isDdos).length, icon: AlertTriangle, color: 'red' },
          { title: 'Detection Rate', value: '98.5%', icon: Target, color: 'green' },
          { title: 'Avg Response Time', value: '1.2ms', icon: Clock, color: 'yellow' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 rounded-lg border backdrop-blur-sm
              ${stat.color === 'cyan' ? 'border-cyan-500/30 bg-cyan-500/10' :
                stat.color === 'red' ? 'border-red-500/30 bg-red-500/10' :
                stat.color === 'green' ? 'border-green-500/30 bg-green-500/10' :
                'border-yellow-500/30 bg-yellow-500/10'}
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              <div className={`text-2xl font-bold text-white`}>
                {stat.value}
              </div>
            </div>
            <div className="text-sm text-gray-400">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Detections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
            Hourly Detection Activity
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.hourlyDetections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="hour" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="detections" fill="#00BFFF" opacity={0.8} />
              <Bar dataKey="blocked" fill="#FF073A" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-cyan-400" />
            Threat Severity Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.severityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {analytics.severityDistribution.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detection Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
            Detection Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analytics.detectionTrends}>
              <defs>
                <linearGradient id="detectionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00BFFF" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="detections"
                stroke="#00BFFF"
                strokeWidth={2}
                fill="url(#detectionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Protocol Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-cyan-400" />
            Protocol Analysis
          </h3>
          <div className="space-y-4">
            {analytics.protocolBreakdown.map((protocol, index) => (
              <div key={protocol.protocol} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{protocol.protocol}</span>
                  <span className="text-white">{protocol.count} ({protocol.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-cyan-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${protocol.percentage}%` }}
                    transition={{ delay: index * 0.2, duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Attacker IPs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
      >
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-cyan-400" />
            Top Threat Sources
          </h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-2 text-gray-400">IP Address</th>
                  <th className="text-left py-2 text-gray-400">Attack Count</th>
                  <th className="text-left py-2 text-gray-400">Last Seen</th>
                  <th className="text-left py-2 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topAttackerIPs.slice(0, 8).map((attacker, index) => (
                  <motion.tr
                    key={attacker.ip}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30"
                  >
                    <td className="py-3 font-mono text-white">{attacker.ip}</td>
                    <td className="py-3 text-red-400 font-bold">{attacker.attacks}</td>
                    <td className="py-3 text-gray-400">
                      {new Date(attacker.lastSeen).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                        BLOCKED
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
