
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

interface RealTimeChartProps {
  data: DataPoint[];
  title?: string;
  color?: string;
  type?: 'line' | 'area';
  height?: number;
  unit?: string;
  showGrid?: boolean;
  animate?: boolean;
}

export function RealTimeChart({
  data,
  title,
  color = '#00BFFF',
  type = 'line',
  height = 300,
  unit = '',
  showGrid = true,
  animate = true
}: RealTimeChartProps) {
  const processedData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      index,
      time: new Date(point.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit' 
      })
    }));
  }, [data]);

  const formatTooltip = (value: number, name: string) => {
    return [`${value.toFixed(2)}${unit}`, title || name];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/90 border border-cyan-400/30 rounded-lg p-3 backdrop-blur-sm"
        >
          <p className="text-cyan-400 text-sm font-mono">{label}</p>
          <p className="text-white text-sm">
            {`${payload[0].value.toFixed(2)}${unit}`}
          </p>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      className="w-full"
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      
      <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={height}>
          {type === 'area' ? (
            <AreaChart data={processedData}>
              <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#334155" 
                  opacity={0.3}
                />
              )}
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                label={{ 
                  value: unit, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: 11, fill: '#64748b' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${color.replace('#', '')})`}
                dot={false}
              />
            </AreaChart>
          ) : (
            <LineChart data={processedData}>
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#334155" 
                  opacity={0.3}
                />
              )}
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                label={{ 
                  value: unit, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: 11, fill: '#64748b' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
