import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(token?: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected manually');
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Device status updates
  onDeviceStatusUpdate(callback: (data: any) => void) {
    this.socket?.on('device:status', callback);
  }

  offDeviceStatusUpdate() {
    this.socket?.off('device:status');
  }

  // Bandwidth updates
  onBandwidthUpdate(callback: (data: any) => void) {
    this.socket?.on('bandwidth:update', callback);
  }

  offBandwidthUpdate() {
    this.socket?.off('bandwidth:update');
  }

  // Alert notifications
  onNewAlert(callback: (data: any) => void) {
    this.socket?.on('alert:new', callback);
  }

  offNewAlert() {
    this.socket?.off('alert:new');
  }

  // Customer updates
  onCustomerUpdate(callback: (data: any) => void) {
    this.socket?.on('customer:update', callback);
  }

  offCustomerUpdate() {
    this.socket?.off('customer:update');
  }

  // Payment notifications
  onPaymentUpdate(callback: (data: any) => void) {
    this.socket?.on('payment:update', callback);
  }

  offPaymentUpdate() {
    this.socket?.off('payment:update');
  }

  // Network log updates
  onNetworkLog(callback: (data: any) => void) {
    this.socket?.on('network:log', callback);
  }

  offNetworkLog() {
    this.socket?.off('network:log');
  }

  // System statistics updates
  onStatsUpdate(callback: (data: any) => void) {
    this.socket?.on('stats:update', callback);
  }

  offStatsUpdate() {
    this.socket?.off('stats:update');
  }

  // Subscribe to specific rooms/channels
  subscribe(room: string) {
    this.socket?.emit('subscribe', room);
  }

  unsubscribe(room: string) {
    this.socket?.emit('unsubscribe', room);
  }

  // Send custom events
  emit(event: string, data?: any) {
    if (this.isConnected) {
      this.socket?.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Listen to custom events
  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
