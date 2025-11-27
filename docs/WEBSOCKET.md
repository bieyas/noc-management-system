# WebSocket Implementation Guide

## Overview
WebSocket real-time communication telah diimplementasikan menggunakan Socket.io untuk memberikan update real-time pada NOC Management System.

## Architecture

### Backend (`backend/src/services/socketService.js`)
- **Socket.io Server**: WebSocket server terintegrasi dengan Express
- **Authentication**: JWT token validation untuk secure connections
- **Room Management**: Support untuk subscribe/unsubscribe rooms
- **Event Emitters**: Pre-built methods untuk emit common events

### Frontend (`frontend/lib/socket.ts`)
- **Socket.io Client**: Client connection dengan auto-reconnect
- **Connection Management**: Handle connect/disconnect/errors
- **Event Listeners**: React hooks untuk easy integration

### Custom Hooks (`frontend/lib/hooks/useSocket.ts`)
- `useSocket()` - Main connection hook
- `useDeviceStatus()` - Device status updates
- `useAlerts()` - Alert notifications
- `useBandwidth()` - Bandwidth monitoring
- `usePaymentUpdates()` - Payment updates
- `useNetworkLogs()` - Network log stream
- `useStatsUpdates()` - System statistics

## Events

### Device Events
```javascript
// Backend emit
socketService.emitDeviceStatus(deviceId, status, data);

// Frontend listen
useDeviceStatus((data) => {
  console.log('Device update:', data);
});
```

### Alert Events
```javascript
// Backend emit
socketService.emitNewAlert(alert);

// Frontend listen
useAlerts((alert) => {
  toast.error(`New alert: ${alert.title}`);
});
```

### Bandwidth Events
```javascript
// Backend emit
socketService.emitBandwidthUpdate(data);

// Frontend listen
useBandwidth((data) => {
  updateChart(data);
});
```

### Payment Events
```javascript
// Backend emit
socketService.emitPaymentUpdate(paymentId, status, data);

// Frontend listen
usePaymentUpdates((payment) => {
  refreshPaymentList();
});
```

### Statistics Events
```javascript
// Backend emit
socketService.emitStatsUpdate(stats);

// Frontend listen
useStatsUpdates((stats) => {
  setDashboardStats(stats);
});
```

## Usage Examples

### In React Components
```tsx
'use client';

import { useSocket, useDeviceStatus } from '@/lib/hooks/useSocket';

export default function Dashboard() {
  const { socket, isConnected } = useSocket();

  useDeviceStatus((data) => {
    console.log('Device update:', data);
    // Handle device status change
  });

  return (
    <div>
      <span>Socket: {isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}
```

### Testing WebSocket
Navigate to `/ws-test` to test WebSocket connection and events.

## Configuration

### Backend
```javascript
// src/index.js
const socketService = require('./services/socketService');
socketService.initialize(server);
```

### Frontend
```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

## Security
- JWT authentication for WebSocket connections
- Token validation on each connection
- Anonymous connections allowed but with limited access
- User-specific events via room management

## Monitoring
- Connected clients count: `socketService.getConnectedCount()`
- Check user connection: `socketService.isUserConnected(userId)`
- WebSocket status endpoint: `GET /api/test/ws-status`

## Troubleshooting

### Connection Failed
1. Check backend is running: `http://localhost:5000/health`
2. Verify CORS configuration in backend
3. Check browser console for errors
4. Verify token in localStorage

### Events Not Received
1. Check socket connection status
2. Verify event listeners are registered
3. Check backend is emitting events
4. Use `/ws-test` page to debug

### Multiple Connections
- Each tab/window creates separate connection
- Use tab/window ID for identification
- Implement connection pooling if needed

## Performance
- Auto-reconnect on disconnect
- Connection pooling for multiple tabs
- Event throttling for high-frequency updates
- Graceful degradation to polling if WebSocket fails

## Integration with Monitoring Service
The monitoring service automatically emits WebSocket events when:
- Device status changes (online/offline)
- New alerts are created
- High latency detected
- Network logs are generated

## Future Enhancements
- [ ] Room-based subscriptions per customer
- [ ] Binary data support for large payloads
- [ ] WebSocket compression
- [ ] Connection rate limiting
- [ ] Event replay for reconnection
- [ ] Persistent message queue
