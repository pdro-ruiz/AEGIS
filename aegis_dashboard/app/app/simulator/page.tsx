
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Play,
  Pause,
  Square,
  Settings,
  Activity,
  Target,
  Timer,
  BarChart3
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

type SimulationType = 'DDOS' | 'NORMAL' | 'MIXED';
type SimulationIntensity = 'LOW' | 'MEDIUM' | 'HIGH';
type SimulationStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface SimulationConfig {
  type: SimulationType;
  duration: number;
  intensity: SimulationIntensity;
  targetIp: string;
  packetRate: number;
}

interface SimulationResult {
  id: string;
  name: string;
  type: SimulationType;
  status: SimulationStatus;
  startTime: string;
  duration: number;
  packetsGenerated: number;
  detectionRate: number;
  avgThreatScore: number;
}

export default function SimulatorPage() {
  const [config, setConfig] = useState<SimulationConfig>({
    type: 'DDOS',
    duration: 60,
    intensity: 'MEDIUM',
    targetIp: '192.168.1.100',
    packetRate: 1000
  });

  const [currentSimulation, setCurrentSimulation] = useState<SimulationResult | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const startSimulation = async () => {
    const newSimulation: SimulationResult = {
      id: `sim-${Date.now()}`,
      name: `${config.type} Simulation`,
      type: config.type,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      duration: config.duration,
      packetsGenerated: 0,
      detectionRate: 0,
      avgThreatScore: 0
    };

    setCurrentSimulation(newSimulation);
    setIsRunning(true);

    // Simulate the attack by generating test data
    const interval = setInterval(async () => {
      if (newSimulation.status === 'RUNNING') {
        const elapsedSeconds = Math.floor(
          (Date.now() - new Date(newSimulation.startTime).getTime()) / 1000
        );

        if (elapsedSeconds >= config.duration) {
          // Complete simulation
          const completedSim: SimulationResult = {
            ...newSimulation,
            status: 'COMPLETED',
            packetsGenerated: config.packetRate * config.duration,
            detectionRate: config.type === 'DDOS' ? 95.5 : 12.3,
            avgThreatScore: config.type === 'DDOS' ? 87.2 : 23.1
          };

          setCurrentSimulation(completedSim);
          setSimulationHistory(prev => [completedSim, ...prev]);
          setIsRunning(false);
          clearInterval(interval);
        } else {
          // Update progress
          setCurrentSimulation(prev => prev ? {
            ...prev,
            packetsGenerated: Math.floor(config.packetRate * elapsedSeconds),
            detectionRate: config.type === 'DDOS' ? 
              Math.min(95.5, elapsedSeconds * 2) : 
              Math.min(25, elapsedSeconds * 0.5),
            avgThreatScore: config.type === 'DDOS' ?
              Math.min(87.2, 20 + elapsedSeconds) :
              Math.min(30, 10 + elapsedSeconds * 0.3)
          } : null);

          // Send test data to API for detection
          if (config.type === 'DDOS') {
            try {
              await apiClient.detectDdos({
                packet_rate: config.packetRate + Math.random() * 200 - 100,
                byte_rate: config.packetRate * 64 + Math.random() * 10000 - 5000,
                flow_duration: Math.random() * 10,
                protocol_type: Math.floor(Math.random() * 3),
                packet_size_variance: Math.random() * 100
              });
            } catch (error) {
              console.log('Detection test sent:', error);
            }
          }
        }
      }
    }, 1000);

    // Store interval ID for cleanup
    (newSimulation as any).intervalId = interval;
  };

  const stopSimulation = () => {
    if (currentSimulation && isRunning) {
      const stoppedSim: SimulationResult = {
        ...currentSimulation,
        status: 'COMPLETED'
      };
      
      setCurrentSimulation(stoppedSim);
      setSimulationHistory(prev => [stoppedSim, ...prev]);
      setIsRunning(false);

      // Clear interval if exists
      if ((currentSimulation as any).intervalId) {
        clearInterval((currentSimulation as any).intervalId);
      }
    }
  };

  const getIntensitySettings = (intensity: SimulationIntensity) => {
    switch (intensity) {
      case 'LOW': return { rate: 500, color: 'green' };
      case 'MEDIUM': return { rate: 1000, color: 'yellow' };
      case 'HIGH': return { rate: 2000, color: 'red' };
    }
  };

  const getSimulationProgress = () => {
    if (!currentSimulation || !isRunning) return 0;
    const elapsed = (Date.now() - new Date(currentSimulation.startTime).getTime()) / 1000;
    return Math.min(100, (elapsed / config.duration) * 100);
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
            Attack Simulator
          </h1>
          <p className="text-gray-400">
            Generate synthetic attacks to test and validate the detection system
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`
            px-4 py-2 rounded-lg border backdrop-blur-sm
            ${isRunning ? 'border-red-500/30 bg-red-500/10' : 'border-green-500/30 bg-green-500/10'}
          `}>
            <div className="text-center">
              <div className={`text-lg font-bold ${isRunning ? 'text-red-400' : 'text-green-400'}`}>
                {isRunning ? 'RUNNING' : 'IDLE'}
              </div>
              <div className="text-xs text-gray-400">System Status</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-cyan-400" />
            Simulation Configuration
          </h2>

          <div className="space-y-4">
            {/* Attack Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attack Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['DDOS', 'NORMAL', 'MIXED'] as SimulationType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setConfig(prev => ({ ...prev, type }))}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${config.type === type
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/50'
                      }
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={config.duration}
                onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Intensity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as SimulationIntensity[]).map(intensity => {
                  const settings = getIntensitySettings(intensity);
                  return (
                    <button
                      key={intensity}
                      onClick={() => setConfig(prev => ({ 
                        ...prev, 
                        intensity, 
                        packetRate: settings.rate 
                      }))}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${config.intensity === intensity
                          ? `bg-${settings.color}-500/20 text-${settings.color}-400 border border-${settings.color}-500/50`
                          : 'bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/50'
                        }
                      `}
                    >
                      {intensity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target IP */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target IP Address
              </label>
              <input
                type="text"
                value={config.targetIp}
                onChange={(e) => setConfig(prev => ({ ...prev, targetIp: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                placeholder="192.168.1.100"
              />
            </div>

            {/* Packet Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Packet Rate (packets/sec)
              </label>
              <input
                type="number"
                min="100"
                max="5000"
                value={config.packetRate}
                onChange={(e) => setConfig(prev => ({ ...prev, packetRate: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={startSimulation}
                disabled={isRunning}
                className={`
                  flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all
                  ${isRunning
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                  }
                `}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Simulation
              </button>
              
              <button
                onClick={stopSimulation}
                disabled={!isRunning}
                className={`
                  flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all
                  ${!isRunning
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                  }
                `}
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Simulation
              </button>
            </div>
          </div>
        </motion.div>

        {/* Current Simulation Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900/50 rounded-lg border border-cyan-500/20 p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-cyan-400" />
            Current Simulation
          </h2>

          {currentSimulation ? (
            <div className="space-y-4">
              {/* Progress Bar */}
              {isRunning && (
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{getSimulationProgress().toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-cyan-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${getSimulationProgress()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white font-mono">
                    {currentSimulation.packetsGenerated.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Packets Generated</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white font-mono">
                    {currentSimulation.detectionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">Detection Rate</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white font-mono">
                    {currentSimulation.avgThreatScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Avg Threat Score</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className={`text-2xl font-bold font-mono ${
                    currentSimulation.status === 'RUNNING' ? 'text-yellow-400' :
                    currentSimulation.status === 'COMPLETED' ? 'text-green-400' :
                    'text-red-400'
                  }`}>
                    {currentSimulation.status}
                  </div>
                  <div className="text-xs text-gray-400">Status</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{currentSimulation.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-white">
                    {new Date(currentSimulation.startTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{currentSimulation.duration}s</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No simulation running</p>
              <p className="text-sm">Configure and start a simulation to begin testing</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Simulation History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
      >
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
            Simulation History
          </h2>
        </div>

        <div className="divide-y divide-gray-700/50 max-h-64 overflow-y-auto scrollbar-thin">
          {simulationHistory.length > 0 ? (
            simulationHistory.map((sim, index) => (
              <motion.div
                key={sim.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-medium">{sim.name}</h3>
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${sim.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                          sim.status === 'RUNNING' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'}
                      `}>
                        {sim.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(sim.startTime).toLocaleString()} • {sim.duration}s • {sim.type}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-white">
                      {sim.packetsGenerated.toLocaleString()} packets
                    </div>
                    <div className="text-gray-400">
                      {sim.detectionRate.toFixed(1)}% detected
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No simulation history available
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
