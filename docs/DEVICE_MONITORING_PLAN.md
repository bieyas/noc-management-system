# Device Monitoring Development Plan

## Phase 1: MikroTik Integration (Week 1-2)

### Backend Implementation:

#### 1. Install Dependencies
```bash
npm install node-routeros --save
```

#### 2. Create MikroTik Service (`backend/src/services/mikrotikService.js`)
```javascript
Features:
- Connect to RouterOS API
- Authenticate with credentials
- Monitor interfaces (traffic, status)
- Get system resources (CPU, RAM, Uptime)
- Get DHCP leases
- Get wireless clients
- Get firewall rules
- Get logs
- Execute commands
- Error handling & reconnection
```

#### 3. Device Connection Schema (Update Device Model)
```javascript
Device {
  // Existing fields...
  connectionType: 'api' | 'snmp' | 'ssh' | 'telnet'
  apiConfig: {
    port: 8728,
    username: 'admin',
    password: 'encrypted_password',
    useSsl: false,
    timeout: 5000
  }
  snmpConfig: {
    version: '2c',
    community: 'public',
    port: 161
  }
  sshConfig: {
    port: 22,
    username: 'admin',
    privateKey: '...'
  }
}
```

#### 4. New API Endpoints
```
POST   /api/devices/:id/connect     - Test connection
POST   /api/devices/:id/disconnect  - Close connection
GET    /api/devices/:id/interfaces  - Get interface list
GET    /api/devices/:id/resources   - Get system resources
GET    /api/devices/:id/clients     - Get connected clients
POST   /api/devices/:id/command     - Execute RouterOS command
GET    /api/devices/:id/logs        - Get device logs
```

#### 5. Real-time Monitoring Service
```javascript
- Poll devices every 30 seconds
- Emit WebSocket events for:
  * Interface traffic changes
  * Client connect/disconnect
  * Resource threshold alerts
  * Link down/up events
- Store historical data in database
```

---

## Phase 2: SNMP Integration (Week 3)

### Features:
1. **SNMP v2c/v3 Support**
   - Generic SNMP walker
   - Standard MIBs (IF-MIB, HOST-RESOURCES-MIB)
   - Vendor-specific MIBs

2. **OLT Monitoring**
   - PON port status
   - ONU list & signal levels
   - Traffic statistics
   - Alarm monitoring

3. **Switch Monitoring**
   - Port status & utilization
   - VLAN information
   - MAC address table
   - Loop detection

---

## Phase 3: Frontend Enhancement (Week 4)

### New Pages & Components:

#### 1. Device Detail Page (`/devices/:id`)
```
- Live interface graph (traffic in/out)
- System resources (CPU, RAM, disk)
- Connected clients table
- Recent logs viewer
- Quick actions (reboot, backup, command)
```

#### 2. Interface Monitoring Dashboard
```
- Multi-device interface comparison
- Bandwidth utilization heatmap
- Top talkers
- Port errors/drops
```

#### 3. Network Topology View
```
- Visual network map
- Device connections
- Link status indicators
- Click to drill-down
```

#### 4. Advanced Device Form
```
- Connection type selector
- API/SNMP/SSH configuration tabs
- Test connection button
- Template presets (MikroTik RB series, etc.)
```

---

## Database Schema Updates

### New Tables:

#### 1. `device_interfaces`
```sql
CREATE TABLE device_interfaces (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deviceId INT,
  name VARCHAR(100),
  type VARCHAR(50),
  status ENUM('up', 'down', 'disabled'),
  macAddress VARCHAR(17),
  ipAddress VARCHAR(45),
  rxBytes BIGINT,
  txBytes BIGINT,
  rxPackets BIGINT,
  txPackets BIGINT,
  rxErrors INT,
  txErrors INT,
  lastUpdate TIMESTAMP,
  FOREIGN KEY (deviceId) REFERENCES devices(id)
);
```

#### 2. `device_metrics`
```sql
CREATE TABLE device_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deviceId INT,
  metricType VARCHAR(50), -- 'cpu', 'ram', 'disk', 'temperature'
  value DECIMAL(10,2),
  unit VARCHAR(20),
  timestamp TIMESTAMP,
  FOREIGN KEY (deviceId) REFERENCES devices(id),
  INDEX idx_device_time (deviceId, timestamp)
);
```

#### 3. `device_clients`
```sql
CREATE TABLE device_clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deviceId INT,
  macAddress VARCHAR(17),
  ipAddress VARCHAR(45),
  hostname VARCHAR(255),
  interface VARCHAR(100),
  connectionTime TIMESTAMP,
  lastSeen TIMESTAMP,
  txBytes BIGINT,
  rxBytes BIGINT,
  FOREIGN KEY (deviceId) REFERENCES devices(id)
);
```

#### 4. `device_commands`
```sql
CREATE TABLE device_commands (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deviceId INT,
  userId INT,
  command TEXT,
  output TEXT,
  status ENUM('pending', 'success', 'failed'),
  executedAt TIMESTAMP,
  FOREIGN KEY (deviceId) REFERENCES devices(id)
);
```

---

## Implementation Steps for MikroTik (Start Here!)

### Step 1: Backend Setup
1. ✅ Install `node-routeros` library
2. ✅ Create `services/mikrotikService.js`
3. ✅ Add connection methods
4. ✅ Implement data polling

### Step 2: Update Device Model
1. ✅ Add `connectionType` field
2. ✅ Add `apiConfig` JSON field
3. ✅ Add encryption for passwords

### Step 3: Create API Routes
1. ✅ `/api/devices/:id/connect`
2. ✅ `/api/devices/:id/mikrotik/*` (proxy commands)

### Step 4: Frontend Form
1. ✅ Update Add/Edit Device modal
2. ✅ Add MikroTik API fields
3. ✅ Test connection button
4. ✅ Show connection status

### Step 5: Real-time Dashboard
1. ✅ Create device detail page
2. ✅ Show live interface stats
3. ✅ Display system resources
4. ✅ WebSocket integration

### Step 6: Testing
1. ✅ Test with real MikroTik device
2. ✅ Load testing (multiple devices)
3. ✅ Error scenarios

---

## Security Considerations

1. **Password Encryption**
   - Use bcrypt or crypto for API passwords
   - Store in encrypted format
   - Decrypt only when connecting

2. **Command Whitelist**
   - Limit dangerous commands
   - Require admin role for sensitive operations
   - Log all command executions

3. **Rate Limiting**
   - Limit API calls per device
   - Prevent DOS attacks
   - Queue command execution

4. **SSL/TLS**
   - Use API-SSL (8729) when available
   - Verify certificates
   - Secure WebSocket (wss://)

---

## Performance Optimization

1. **Connection Pooling**
   - Reuse connections
   - Close idle connections
   - Max connections per device

2. **Caching**
   - Cache device info (5 minutes)
   - Cache interface list (1 minute)
   - Real-time data: no cache

3. **Batch Operations**
   - Poll multiple interfaces at once
   - Bulk insert to database
   - WebSocket batch updates

---

## Example Code Snippets

### MikroTik Connection:
```javascript
const RouterOSAPI = require('node-routeros').RouterOSAPI;

async function connectMikrotik(device) {
  const conn = new RouterOSAPI({
    host: device.ipAddress,
    port: device.apiConfig.port || 8728,
    user: device.apiConfig.username,
    password: decrypt(device.apiConfig.password),
    timeout: 5000
  });

  try {
    await conn.connect();
    console.log(`Connected to ${device.name}`);
    return conn;
  } catch (error) {
    console.error(`Failed to connect: ${error.message}`);
    throw error;
  }
}
```

### Get Interface Traffic:
```javascript
async function getInterfaceStats(conn) {
  const interfaces = await conn.write('/interface/print', [
    '=stats',
    '=.proplist=name,type,running,rx-byte,tx-byte'
  ]);
  
  return interfaces.map(iface => ({
    name: iface.name,
    type: iface.type,
    status: iface.running === 'true' ? 'up' : 'down',
    rxBytes: parseInt(iface['rx-byte']),
    txBytes: parseInt(iface['tx-byte'])
  }));
}
```

---

## Timeline

| Week | Tasks | Deliverables |
|------|-------|--------------|
| 1 | MikroTik service + API | Backend working |
| 2 | Device monitoring + WebSocket | Real-time updates |
| 3 | Frontend device detail page | UI complete |
| 4 | Testing + refinement | Production ready |

---

## Success Metrics

- ✅ Connect to MikroTik devices
- ✅ Monitor 10+ devices simultaneously
- ✅ Real-time interface stats (< 1s latency)
- ✅ Historical data storage
- ✅ Alert on threshold breach
- ✅ Remote command execution

---

## Future Enhancements (Phase 4+)

1. **Multi-vendor Support**
   - Cisco (SSH/SNMP)
   - Huawei (Telnet/SNMP)
   - Ubiquiti (UniFi API)

2. **Advanced Features**
   - Configuration backup/restore
   - Bulk configuration changes
   - Network topology discovery
   - Automated failover
   - Performance baseline

3. **AI/ML Integration**
   - Anomaly detection
   - Predictive maintenance
   - Traffic pattern analysis
   - Capacity planning

---

## Questions to Consider

1. **MikroTik Versions?** (RouterOS v6 vs v7)
2. **SSL Required?** (API-SSL port 8729)
3. **Command Restrictions?** (Read-only vs full access)
4. **Polling Interval?** (30s, 1m, 5m?)
5. **Data Retention?** (Keep metrics for how long?)
6. **Multi-tenant?** (Customer can add their own devices?)

---

**Next Step: Shall we start implementing Phase 1 - MikroTik Integration?**
