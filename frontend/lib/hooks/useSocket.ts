'use client';

import { useEffect, useRef } from 'react';
import socketService from '@/lib/socket';

interface UseSocketOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, reconnect = true } = options;
  const isInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (autoConnect && !isInitialized.current) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
        isInitialized.current = true;
      }
    }

    return () => {
      if (!reconnect) {
        socketService.disconnect();
        isInitialized.current = false;
      }
    };
  }, [autoConnect, reconnect]);

  return {
    socket: socketService,
    isConnected: socketService.isSocketConnected(),
  };
}

// Hook for device status updates
export function useDeviceStatus(callback: (data: any) => void, deps: any[] = []) {
  const { socket } = useSocket();

  useEffect(() => {
    socket.onDeviceStatusUpdate(callback);
    return () => socket.offDeviceStatusUpdate();
  }, [socket, ...deps]);
}

// Hook for bandwidth updates
export function useBandwidth(callback: (data: any) => void, deps: any[] = []) {
  const { socket } = useSocket();

  useEffect(() => {
    socket.onBandwidthUpdate(callback);
    return () => socket.offBandwidthUpdate();
  }, [socket, ...deps]);
}

// Hook for alert notifications
export function useAlerts(callback: (data: any) => void, deps: any[] = []) {
  const { socket } = useSocket();

  useEffect(() => {
    socket.onNewAlert(callback);
    return () => socket.offNewAlert();
  }, [socket, ...deps]);
}

// Hook for customer updates
export function useCustomerUpdates(callback: (data: any) => void, deps: any[] = []) {
  const { socket } = useSocket();

  useEffect(() => {
    socket.onCustomerUpdate(callback);
    return () => socket.offCustomerUpdate();
  }, [socket, ...deps]);
}

// Hook for payment updates
export function usePaymentUpdates(callback: (data: any) => void, deps: any[] = []) {
  const { socket } = useSocket();

  useEffect(() => {
    socket.onPaymentUpdate(callback);
    return () => socket.offPaymentUpdate();
  }, [socket, ...deps]);
}

// Hook for network logs
export function useNetworkLogs(callback: (data: any) => void, deps: any[] = []) {
  const { socket } = useSocket();

  useEffect(() => {
    socket.onNetworkLog(callback);
    return () => socket.offNetworkLog();
  }, [socket, ...deps]);
}

// Hook for statistics updates
export function useStatsUpdates(callback: (data: any) => void, deps: any[] = []) {
  const { socket } = useSocket();

  useEffect(() => {
    socket.onStatsUpdate(callback);
    return () => socket.offStatsUpdate();
  }, [socket, ...deps]);
}
