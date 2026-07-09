import qrcode from 'qrcode-terminal';
import { networkInterfaces } from 'os';

function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
const url = `http://${ip}:5173`;

console.log('\n📱 Scan this QR code with your phone:\n');
qrcode.generate(url, { small: true });
console.log(`\n🌐 Or visit: ${url}\n`);
console.log('━'.repeat(50));
