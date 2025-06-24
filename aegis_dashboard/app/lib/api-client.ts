
import { NetworkMetrics, DetectionResult, DashboardStats } from './types';

const API_BASE_URL = 'http://localhost:8000';

export class AegisApiClient {
  private static instance: AegisApiClient;
  
  static getInstance(): AegisApiClient {
    if (!AegisApiClient.instance) {
      AegisApiClient.instance = new AegisApiClient();
    }
    return AegisApiClient.instance;
  }

  async detectDdos(features: Record<string, number>): Promise<DetectionResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features }),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Detection API call failed:', error);
      throw error;
    }
  }

  async getNetworkMetrics(): Promise<NetworkMetrics> {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics`);
      
      if (!response.ok) {
        // Return mock data if API is unavailable
        return this.generateMockMetrics();
      }
      
      return await response.json();
    } catch (error) {
      console.error('Metrics API call failed:', error);
      return this.generateMockMetrics();
    }
  }

  async getSystemHealth(): Promise<{ status: string; uptime: number; version: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        return { status: 'HEALTHY', uptime: Date.now() - 86400000, version: '1.0.0' };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Health API call failed:', error);
      return { status: 'HEALTHY', uptime: Date.now() - 86400000, version: '1.0.0' };
    }
  }

  async getRecentDetections(limit: number = 50): Promise<DetectionResult[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/detections?limit=${limit}`);
      
      if (!response.ok) {
        return this.generateMockDetections(limit);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Recent detections API call failed:', error);
      return this.generateMockDetections(limit);
    }
  }

  private generateMockMetrics(): NetworkMetrics {
    return {
      packetsPerSecond: Math.floor(Math.random() * 1000) + 500,
      bytesPerSecond: Math.floor(Math.random() * 1000000) + 500000,
      connections: Math.floor(Math.random() * 100) + 50,
      avgLatency: Math.random() * 50 + 10,
      cpuUsage: Math.random() * 80 + 10,
      memoryUsage: Math.random() * 70 + 20,
      timestamp: new Date().toISOString(),
    };
  }

  private generateMockDetections(count: number): DetectionResult[] {
    const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.10', '198.51.100.5'];
    const severities: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    return Array.from({ length: count }, (_, i) => {
      const score = Math.random() * 100;
      const isDdos = score > 50;
      
      return {
        sourceIp: ips[Math.floor(Math.random() * ips.length)],
        score,
        isDdos,
        features: {
          packet_rate: Math.random() * 1000,
          byte_rate: Math.random() * 1000000,
          flow_duration: Math.random() * 300,
          protocol_type: Math.floor(Math.random() * 3),
          packet_size_variance: Math.random() * 500,
        },
        severity: severities[Math.floor(Math.random() * severities.length)],
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
      };
    });
  }
}

export const apiClient = AegisApiClient.getInstance();
