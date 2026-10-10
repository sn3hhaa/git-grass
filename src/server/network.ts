import os from 'node:os';

/**
 * Returns the best local LAN IPv4 address (e.g. 192.168.x.x or 10.x.x.x)
 * so that a phone on the same Wi-Fi network or hotspot can load the session.
 * Strictly avoids Hyper-V, WSL, Docker, and VirtualBox virtual adapters.
 */
export function getLocalNetworkIp(): string {
  const interfaces = os.networkInterfaces();

  const isVirtualOrInternal = (name: string): boolean => {
    const lower = name.toLowerCase();
    return (
      lower.includes('vethernet') ||
      lower.includes('virtual') ||
      lower.includes('wsl') ||
      lower.includes('hyper-v') ||
      lower.includes('vmware') ||
      lower.includes('virtualbox') ||
      lower.includes('docker') ||
      lower.includes('tailscale') ||
      lower.includes('zerotier') ||
      lower.includes('loopback') ||
      lower.includes('pseudo') ||
      lower.includes('bridge') ||
      lower.includes('teredo')
    );
  };

  interface Candidate {
    name: string;
    address: string;
    priority: number;
  }

  const candidates: Candidate[] = [];

  for (const [name, netList] of Object.entries(interfaces)) {
    if (!netList) continue;

    for (const net of netList) {
      if (net.family !== 'IPv4' || net.internal || net.address.startsWith('127.') || net.address.startsWith('169.254.')) {
        continue;
      }

      const lowerName = name.toLowerCase();
      const isVirtual = isVirtualOrInternal(name);

      let priority = 0;
      if (!isVirtual) {
        if (lowerName.includes('wi-fi') || lowerName.includes('wifi') || lowerName.includes('wlan') || lowerName.includes('wireless')) {
          priority = 100;
        } else if (lowerName.includes('ethernet') || lowerName.startsWith('en') || lowerName.startsWith('eth')) {
          priority = 80;
        } else {
          priority = 60;
        }

        // Boost standard LAN address ranges (192.168.x.x or 10.x.x.x)
        if (net.address.startsWith('192.168.') || net.address.startsWith('10.')) {
          priority += 10;
        }
      } else {
        // Virtual adapter gets low priority
        priority = 10;
      }

      candidates.push({ name, address: net.address, priority });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0].address;
  }

  return '127.0.0.1';
}
