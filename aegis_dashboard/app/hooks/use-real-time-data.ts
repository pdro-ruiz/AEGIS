
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { NetworkMetrics, DetectionResult } from '@/lib/types';

export function useRealTimeMetrics(intervalMs: number = 2000) {
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await apiClient.getNetworkMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    
    intervalRef.current = setInterval(fetchMetrics, intervalMs);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMetrics, intervalMs]);

  return { metrics, isLoading, error, refetch: fetchMetrics };
}

export function useRealTimeDetections(intervalMs: number = 3000) {
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchDetections = useCallback(async () => {
    try {
      const data = await apiClient.getRecentDetections(20);
      setDetections(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch detections');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetections();
    
    intervalRef.current = setInterval(fetchDetections, intervalMs);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchDetections, intervalMs]);

  return { detections, isLoading, error, refetch: fetchDetections };
}

export function useSystemHealth(intervalMs: number = 5000) {
  const [health, setHealth] = useState<{ status: string; uptime: number; version: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchHealth = useCallback(async () => {
    try {
      const data = await apiClient.getSystemHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    
    intervalRef.current = setInterval(fetchHealth, intervalMs);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchHealth, intervalMs]);

  return { health, isLoading, refetch: fetchHealth };
}
