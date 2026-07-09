# HTTPS Setup Guide

## Quick Start

The certificate is already generated! Just restart the server:

```bash
start-prod.bat
```

You should see: `🔒 HTTPS enabled`

## Accessing on Your Phone

### Step 1: Get the URL

The QR code now shows: `https://[your-ip]:3001`

### Step 2: Accept Certificate Warning

**On first visit, you'll see a security warning. This is normal for self-signed certificates.**

#### Chrome/Edge (Android):
1. Tap "Advanced"
2. Tap "Proceed to [your-ip] (unsafe)"
3. Done!

#### Safari (iOS):
1. Tap "Show Details"
2. Tap "visit this website"
3. Tap "Visit Website"
4. Done!

### Step 3: Trust the Certificate (Optional - for better experience)

To avoid the warning every time:

#### Android:
1. Download the certificate:
   - Visit `https://[your-ip]:3001` in Chrome
   - Tap the lock icon → "Certificate"
   - Look for "export" or "download" option
   
2. Install certificate:
   - Settings → Security → Encryption & credentials
   - Install from storage → CA certificate
   - Find downloaded cert.pem
   - Give it a name like "Golf Tracker"
   - Enter PIN/password if prompted

#### iOS:
1. Email yourself the certificate:
   - On computer, open `server/certs/cert.pem` in text editor
   - Copy all content (including BEGIN/END lines)
   - Email it to yourself as attachment

2. Install certificate:
   - Open email on iPhone
   - Tap the cert.pem attachment
   - Tap "Install" (top right)
   - Enter passcode
   - Tap "Install" again

3. Trust the certificate:
   - Settings → General → About
   - Certificate Trust Settings (at bottom)
   - Enable "Golf Tracker" certificate
   - Tap "Continue"

## Why HTTPS is Required

**Service Workers** (which enable offline mode) require HTTPS for security reasons.

Exception: `localhost` works over HTTP, which is why it works on your computer but not on your phone.

With HTTPS:
- ✅ Service worker caches app properly
- ✅ PWA works offline on phone
- ✅ Install to home screen works reliably
- ✅ Background sync works

Without HTTPS:
- ❌ Service worker unreliable on phone
- ❌ App won't work offline
- ❌ "Site can't be reached" error

## Troubleshooting

### ERR_SSL_KEY_USAGE_INCOMPATIBLE

**Fixed!** The certificate has been regenerated with proper extensions:
- `digitalSignature` and `keyEncipherment` key usage
- `serverAuth` extended key usage
- Subject Alternative Names for multiple IPs

Just restart the server and it should work.

### NET::ERR_CERT_AUTHORITY_INVALID

This is **normal** for self-signed certificates. You have two options:

1. **Accept the warning** (quick):
   - Tap "Advanced" → "Proceed"
   - Works immediately
   - Warning appears again if you clear browser data

2. **Trust the certificate** (better):
   - Follow iOS/Android steps above
   - No more warnings
   - Survives browser data clearing

### Certificate Expired

Certificates are valid for 365 days. To regenerate:

```bash
generate-cert.bat
```

Then restart the server.

### Wrong IP Address in Certificate

The certificate includes these IPs:
- 127.0.0.1 (localhost)
- 192.168.0.x
- 192.168.1.x
- 10.0.0.x
- 10.0.1.x

If your network uses a different range (e.g., 192.168.2.x):

1. Edit `server/certs/openssl.cnf`
2. Add your IP range:
   ```
   IP.9 = 192.168.2.1
   IP.10 = 192.168.2.100
   ```
3. Run `generate-cert.bat`
4. Restart server

## Testing Offline Mode

After accepting/trusting the certificate:

1. **Visit the app** (let it load completely)
2. **Wait 10 seconds** (let service worker cache everything)
3. **Turn on Airplane Mode**
4. **Reload the page or launch PWA**
5. **Should work perfectly!** ✅

Check the debug panel:
- Service Worker: ✅ activated
- Cache: ✅ 2+ caches, 50+ items
- IndexedDB: ✅ v1
- Online: ❌ (offline)

## Development Mode

Don't need HTTPS for development on your computer:

```bash
start.bat
```

This uses HTTP on localhost, which is fine for local development.

Only use `start-prod.bat` with HTTPS when testing on phone or deploying.

## Production Deployment (Future)

For real production (not local network), use Let's Encrypt:

```bash
# Install Certbot
# Get certificate for your domain
certbot certonly --standalone -d yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem server/certs/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem server/certs/key.pem

# Restart server
start-prod.bat
```

Let's Encrypt certificates are trusted by all browsers, no warning needed!
