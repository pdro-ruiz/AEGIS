
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Activity,
  BarChart3,
  Brain,
  Network,
  Settings,
  Zap,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'Security Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Attack Simulator', href: '/simulator', icon: Zap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Insights', href: '/ai-insights', icon: Brain },
  { name: 'Network Monitor', href: '/network', icon: Network },
  { name: 'System Config', href: '/settings', icon: Settings },
];

export function CyberSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-black/90 backdrop-blur-md border-r border-cyan-500/20">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-cyan-500/20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3"
          >
            <div className="relative">
              <Shield className="w-8 h-8 text-cyan-400" />
              <div className="absolute inset-0 animate-pulse bg-cyan-400/20 rounded-full blur-md" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AEGIS AI</h1>
              <p className="text-xs text-cyan-400/70">Cyber Defense System</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`
                    relative flex items-center px-4 py-3 text-sm font-medium rounded-lg
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/25'
                      : 'text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-cyan-300' : 'text-gray-400'}`} />
                  {item.name}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-cyan-500/5 to-blue-500/5" />
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="px-4 py-4 border-t border-cyan-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">System Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-mono">ONLINE</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-mono">
            v1.0.0 | Build 2024.06
          </div>
        </div>
      </div>
    </div>
  );
}
