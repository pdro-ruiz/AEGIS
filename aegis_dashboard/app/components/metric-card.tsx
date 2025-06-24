
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: string;
  unit?: string;
  description?: string;
  isLoading?: boolean;
  animate?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'cyan',
  unit = '',
  description,
  isLoading = false,
  animate = true
}: MetricCardProps) {
  const colorClasses = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 shadow-cyan-500/20',
    green: 'text-green-400 border-green-500/30 bg-green-500/10 shadow-green-500/20',
    red: 'text-red-400 border-red-500/30 bg-red-500/10 shadow-red-500/20',
    yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 shadow-yellow-500/20',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10 shadow-purple-500/20',
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val > 1000000) return (val / 1000000).toFixed(1) + 'M';
      if (val > 1000) return (val / 1000).toFixed(1) + 'K';
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.9 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      whileHover={{ scale: 1.02 }}
      className={`
        relative p-6 rounded-xl border backdrop-blur-sm
        ${colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan}
        hover:shadow-lg transition-all duration-300 group
      `}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${color === 'cyan' ? 'bg-cyan-500/20' : `bg-${color}-500/20`}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-300">{title}</h3>
          </div>
          
          {change !== undefined && (
            <div className={`text-xs font-medium ${getChangeColor(change)}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-600/50 rounded" />
              </div>
            ) : (
              <>
                <span className="text-2xl font-bold text-white font-mono">
                  {formatValue(value)}
                </span>
                {unit && (
                  <span className="text-sm text-gray-400 font-mono">{unit}</span>
                )}
              </>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Animated pulse dot */}
        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${color === 'cyan' ? 'bg-cyan-400' : `bg-${color}-400`} animate-pulse`} />
      </div>
    </motion.div>
  );
}
