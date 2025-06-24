
export interface NetworkMetrics {
  packetsPerSecond: number;
  bytesPerSecond: number;
  connections: number;
  avgLatency: number;
  cpuUsage: number;
  memoryUsage: number;
  timestamp: string;
}

export interface DetectionResult {
  sourceIp: string;
  score: number;
  isDdos: boolean;
  features: Record<string, number>;
  explanation?: {
    topFeatures: Array<{
      feature: string;
      importance: number;
      value: number;
    }>;
    confidence: number;
    reasoning: string;
  };
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  sourceIp?: string;
  score?: number;
  timestamp: string;
  resolvedAt?: string;
}

export interface DashboardStats {
  totalThreats: number;
  activeThreats: number;
  devicesMonitored: number;
  systemUptime: number;
  avgThreatScore: number;
  detectionAccuracy: number;
}

export interface SimulationConfig {
  type: 'DDOS' | 'NORMAL' | 'MIXED';
  duration: number;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  targetIp?: string;
  packetRate?: number;
}

export interface ThreatLevel {
  level: number;
  label: string;
  color: string;
  description: string;
}
