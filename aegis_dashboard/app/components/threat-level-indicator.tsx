
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Zap } from 'lucide-react';

interface ThreatLevelIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

export function ThreatLevelIndicator({
  score,
  size = 'md',
  showLabel = true,
  animate = true
}: ThreatLevelIndicatorProps) {
  const getThreatLevel = (score: number) => {
    if (score < 25) return { level: 'LOW', color: 'green', bg: 'bg-green-500/20', border: 'border-green-500', icon: Shield };
    if (score < 50) return { level: 'MEDIUM', color: 'yellow', bg: 'bg-yellow-500/20', border: 'border-yellow-500', icon: AlertTriangle };
    if (score < 75) return { level: 'HIGH', color: 'orange', bg: 'bg-orange-500/20', border: 'border-orange-500', icon: AlertTriangle };
    return { level: 'CRITICAL', color: 'red', bg: 'bg-red-500/20', border: 'border-red-500', icon: Zap };
  };

  const threat = getThreatLevel(score);
  const Icon = threat.icon;

  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-24 h-24 text-base'
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <motion.div
        className={`
          ${sizeClasses[size]} ${threat.bg} ${threat.border}
          border-2 rounded-full flex items-center justify-center relative overflow-hidden
        `}
        initial={animate ? { scale: 0, rotate: -180 } : false}
        animate={animate ? { scale: 1, rotate: 0 } : false}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
      >
        {/* Background pulse effect */}
        <motion.div
          className={`absolute inset-0 ${threat.bg} rounded-full`}
          animate={animate ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          } : false}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Icon */}
        <Icon className={`w-1/2 h-1/2 text-${threat.color}-400 z-10`} />
        
        {/* Score display */}
        <div className="absolute bottom-1 right-1 text-xs font-mono font-bold text-white bg-black/50 px-1 rounded">
          {Math.round(score)}
        </div>
      </motion.div>

      {showLabel && (
        <motion.div
          initial={animate ? { opacity: 0, y: 10 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className={`text-${threat.color}-400 font-bold text-sm`}>
            {threat.level}
          </div>
          <div className="text-gray-400 text-xs font-mono">
            Score: {score.toFixed(1)}
          </div>
        </motion.div>
      )}
    </div>
  );
}
