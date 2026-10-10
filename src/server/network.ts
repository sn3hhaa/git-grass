import os from 'node:os';

/**
 * Returns the best local LAN IPv4 address (e.g. 192.168.x.x or 10.x.x.x)
 * so that a phone on the same Wi-Fi network or hotspot can load the session.
 */
export function getLocalNetworkIp(): string {
  const interfaces = os.networkInterfaces();

  // Priority: Wi-Fi or Ethernet IPv4 non-internal
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;

    for (const net of netList) {
      if (net.family === 'IPv4' && !net.internal) {
        // Skip virtual or loopback interfaces if possible
        if (!name.toLowerCase().includes('virtual') && !name.toLowerCase().includes('vEthernet')) {
          return net.address;
        }
      }
    }
  }

  // Fallback to any non-internal IPv4
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;

    for (const net of netList) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return '127.0.0.1';
}
