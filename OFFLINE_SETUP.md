# Offline Mode Setup Guide

## The Fix: Single Origin Architecture

Previously, the app had issues working offline because the client (port 5173) and server (port 3001) were on different origins. Service workers work best when everything is served from the same origin.

**New Architecture:**
- Server (port 3001) serves both API **and** the built client app
- Single origin means service worker can properly cache everything
- True offline-first architecture

## Quick Start

1. **Run production mode:**
   ```bash
   start-prod.bat
   ```

2. **What this does:**
   - Builds the client app
   - Starts the server on port 3001
   - Server serves API at `/api/*` and client at `/`
   - Displays QR code for phone access

3. **Access the app:**
   - **Computer:** `http://localhost:3001`
   - **Phone:** Scan QR code or use the IP shown

4. **Install to home screen:**
   - Open in your phone's browser (Chrome/Edge)
   - Tap "Install" or browser menu → "Add to Home Screen"
   - Installed app icon appears on home screen

5. **Test offline:**
   - Use the app online first (loads everything into cache)
   - Turn on Airplane Mode
   - Launch app from home screen
   - **It works!** Fully functional offline

## How It Works

### Service Worker Caching:
```
First Visit (Online):
├─ Download HTML, CSS, JavaScript
├─ Cache all static assets
├─ Load drills from server → save to IndexedDB
└─ Register service worker

Subsequent Visits:
├─ Service worker intercepts requests
├─ Serve HTML/CSS/JS from cache (instant load)
├─ Try API calls (if online) → fallback to IndexedDB (if offline)
└─ Full app functionality offline
```

### Data Storage:

**Service Worker Cache:**
- HTML, CSS, JavaScript files
- Images, icons
- Previously successful API responses (24hr cache)

**IndexedDB:**
- All drills
- All practice sessions
- Results
- Pending changes (sync queue)

**When Offline:**
1. Service worker serves cached app files → app loads instantly
2. App detects offline state (`navigator.onLine === false`)
3. All data reads/writes use IndexedDB
4. Changes queue for sync
5. When back online → automatic sync

## Testing Checklist

### ✅ Online Mode:
- [ ] App loads at `http://localhost:3001`
- [ ] Can view drills
- [ ] Can start practice session
- [ ] Can view results with charts
- [ ] Green "Online" indicator in header

### ✅ Install PWA:
- [ ] Browser shows install prompt
- [ ] Can install to home screen
- [ ] App icon appears on phone
- [ ] Launches as standalone app (no browser UI)

### ✅ Offline Mode:
- [ ] Use app online first
- [ ] Enable Airplane Mode
- [ ] Launch app from home screen
- [ ] App loads (no "cannot connect" error)
- [ ] Can view existing drills
- [ ] Can start new practice session
- [ ] Can enter results
- [ ] Red "Offline" indicator shows
- [ ] Disable Airplane Mode
- [ ] Indicator turns green
- [ ] Changes sync automatically

## Development vs Production

### Development Mode (`start.bat`)
- **Port:** 5173 (client) + 3001 (server)
- **Hot reload:** Yes
- **Service worker:** Limited (dev mode)
- **Offline mode:** Unreliable
- **Use for:** Active development

### Production Mode (`start-prod.bat`)
- **Port:** 3001 only (serves both)
- **Hot reload:** No (need to rebuild)
- **Service worker:** Full production build
- **Offline mode:** Fully functional
- **Use for:** Testing offline, real usage

## Troubleshooting

### "Cannot connect to server" when offline
**Cause:** App wasn't cached yet
**Fix:** 
1. Visit app while online first
2. Wait 5 seconds for service worker to cache
3. Then try offline

### Changes not saving offline
**Cause:** IndexedDB not working
**Fix:**
1. Check browser console for errors
2. Ensure private browsing is off (blocks IndexedDB)
3. Clear site data and reinstall

### App not installing
**Cause:** Not using production mode
**Fix:**
1. Stop dev mode (`start.bat`)
2. Run `start-prod.bat`
3. Visit on phone and install

### Service worker not updating
**Cause:** Old service worker still active
**Fix:**
1. Close all app tabs/windows
2. Reopen → should auto-update
3. Or: DevTools → Application → Service Workers → Unregister

### Old version showing after update
**Cause:** Service worker cache
**Fix:**
1. The service worker auto-updates within ~24 hours
2. Force update: Uninstall app → Reinstall
3. Or: Unregister service worker in DevTools

## Advanced: Manual Testing

### Chrome DevTools:
```
F12 → Application tab:

Service Workers
├─ Should show: "activated and running"
└─ Can: Stop, Update, Unregister

Cache Storage
├─ api-cache (API responses)
├─ assets-cache (images, fonts)
└─ workbox-precache (app shell)

IndexedDB → golf_tracker
├─ drills
├─ sessions
├─ results
├─ sync_queue
└─ sync_metadata

Storage
└─ localStorage → golf_tracker_user (auth)
```

### Network Tab:
- Filter by: "sw.js" → see service worker requests
- Disable cache → test offline behavior
- Offline mode → simulate offline testing

## Architecture Details

**Request Flow (Online):**
```
Browser → Service Worker → Network → Server → Response
                        ↓
                    Cache (for offline)
```

**Request Flow (Offline):**
```
Browser → Service Worker → Cache → Response
                        ↓
                    (Network unavailable)
```

**API Strategy (NetworkFirst):**
1. Try network first (5 second timeout)
2. If network fails → serve from cache
3. Cache successful responses (24 hours)

**Asset Strategy (CacheFirst):**
1. Check cache first
2. If not in cache → fetch from network
3. Cache for 30 days

## Best Practices

1. **Always use production mode for offline testing**
2. **First visit must be online** (to populate cache)
3. **Don't clear browser data** (removes cached app)
4. **Test offline mode regularly** (catch regressions early)
5. **Rebuild after code changes** (service worker needs new files)

## Why This Matters

**Before (broken offline):**
- Client: `http://192.168.1.100:5173`
- Server: `http://192.168.1.100:3001`
- Service worker can't intercept cross-origin requests properly
- Offline → immediate failure

**After (working offline):**
- Everything: `http://192.168.1.100:3001`
- Service worker intercepts all requests
- Offline → cached app loads, IndexedDB data available
- True offline-first PWA
