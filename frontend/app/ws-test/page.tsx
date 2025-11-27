'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/hooks/useSocket';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wifi, WifiOff } from 'lucide-react';

export default function WebSocketTestPage() {
    const { socket, isConnected } = useSocket({ autoConnect: true });
    const [messages, setMessages] = useState<any[]>([]);
    const [stats, setStats] = useState({
        deviceUpdates: 0,
        alertsReceived: 0,
        bandwidthUpdates: 0,
    });

    useEffect(() => {
        if (!socket) return;

        // Listen to all events
        socket.on('device:status', (data: any) => {
            setMessages(prev => [...prev, { type: 'device:status', data, time: new Date().toISOString() }]);
            setStats(prev => ({ ...prev, deviceUpdates: prev.deviceUpdates + 1 }));
        });

        socket.on('alert:new', (data: any) => {
            setMessages(prev => [...prev, { type: 'alert:new', data, time: new Date().toISOString() }]);
            setStats(prev => ({ ...prev, alertsReceived: prev.alertsReceived + 1 }));
        });

        socket.on('bandwidth:update', (data: any) => {
            setMessages(prev => [...prev, { type: 'bandwidth:update', data, time: new Date().toISOString() }]);
            setStats(prev => ({ ...prev, bandwidthUpdates: prev.bandwidthUpdates + 1 }));
        });

        return () => {
            socket.off('device:status');
            socket.off('alert:new');
            socket.off('bandwidth:update');
        };
    }, [socket]);

    const testEmit = async (event: string) => {
        const testData = {
            'device-status': {
                deviceId: 1,
                status: 'online',
                deviceName: 'Test Router',
                ipAddress: '192.168.1.1'
            },
            'alert': {
                id: Date.now(),
                title: 'Test Alert',
                description: 'This is a test alert from WebSocket',
                severity: 'info',
                type: 'test'
            },
            'bandwidth': {
                deviceId: 1,
                upload: Math.random() * 1000,
                download: Math.random() * 1000
            }
        };

        try {
            const response = await fetch('http://localhost:5000/api/test/emit-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event,
                    data: testData[event as keyof typeof testData]
                })
            });
            const result = await response.json();
            console.log('Emit result:', result);
        } catch (error) {
            console.error('Emit error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">WebSocket Test</h1>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                        <span className="font-medium">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <p className="text-sm text-gray-600">Device Updates</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.deviceUpdates}</p>
                    </Card>
                    <Card className="p-6">
                        <p className="text-sm text-gray-600">Alerts Received</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.alertsReceived}</p>
                    </Card>
                    <Card className="p-6">
                        <p className="text-sm text-gray-600">Bandwidth Updates</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.bandwidthUpdates}</p>
                    </Card>
                </div>

                {/* Test Buttons */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Events</h2>
                    <div className="flex gap-4">
                        <Button onClick={() => testEmit('device-status')}>
                            Test Device Status
                        </Button>
                        <Button onClick={() => testEmit('alert')}>
                            Test Alert
                        </Button>
                        <Button onClick={() => testEmit('bandwidth')}>
                            Test Bandwidth
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setMessages([]);
                                setStats({ deviceUpdates: 0, alertsReceived: 0, bandwidthUpdates: 0 });
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </Card>

                {/* Message Log */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Real-time Messages ({messages.length})
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No messages yet. Click a test button above.
                            </p>
                        ) : (
                            messages.slice().reverse().map((msg, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-blue-600">
                                            {msg.type}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(msg.time).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <pre className="text-xs text-gray-700 overflow-x-auto">
                                        {JSON.stringify(msg.data, null, 2)}
                                    </pre>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
