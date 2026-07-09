import qrcode from 'qrcode-terminal';
import { networkInterfaces } from 'os';

function getLocalIP() {
  const nets = networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(nets)) {
    // Skip virtual adapters and VPNs
    const lowerName = name.toLowerCase();
    if (lowerName.includes('virtual') ||
        lowerName.includes('vmware') ||
        lowerName.includes('vbox') ||
        lowerName.includes('tailscale') ||
        lowerName.includes('loopback')) {
      continue;
    }

    for (const net of nets[name]) {
      // Skip internal, non-IPv4, and link-local addresses
      if (net.family === 'IPv4' && !net.internal) {
        const ip = net.address;

        // Skip link-local addresses (169.254.x.x)
        if (ip.startsWith('169.254.')) {
          continue;
        }

        // Prioritize common private network ranges
        let priority = 0;
        if (ip.startsWith('192.168.')) priority = 3;
        else if (ip.startsWith('10.')) priority = 2;
        else if (ip.startsWith('172.')) {
          const second = parseInt(ip.split('.')[1]);
          if (second >= 16 && second <= 31) priority = 2;
        }

        // Boost priority for Wi-Fi and Ethernet
        if (lowerName.includes('wi-fi') || lowerName.includes('wifi')) priority += 10;
        else if (lowerName.includes('ethernet') || lowerName.includes('eth')) priority += 5;

        candidates.push({ ip, priority, name });
      }
    }
  }

  // Sort by priority (highest first) and return the best match
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0].ip;
  }

  return 'localhost';
}

const ip = getLocalIP();
const url = `http://${ip}:5173`;

console.log('\n📱 Scan this QR code with your phone:\n');
qrcode.generate(url, { small: true });
console.log(`\n🌐 Or visit: ${url}\n`);
console.log('━'.repeat(50));
