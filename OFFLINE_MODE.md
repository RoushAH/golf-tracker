# Offline Mode & PWA Features

## Important: Production Mode Required

**PWA features (offline mode, install to home screen) only work properly in production builds.**

The development server (`start.bat`) is for development only and has limited PWA support.

## How to Enable Full Offline Mode

### Option 1: Use Production Mode (Recommended)

1. **Run the production build:**
   ```bash
   start-prod.bat
   ```

2. **What this does:**
   - Builds the client app for production
   - Starts the server
   - Serves the built client with proper service worker
   - Enables full PWA features

3. **Access the app:**
   - From your computer: `http://localhost:5173`
   - From your phone: Use the IP shown in the QR code

4. **Install to home screen:**
   - Open the app in your phone's browser
   - Tap "Install" when prompted (or use browser menu → "Add to Home Screen")
   - The installed app will work fully offline

### Option 2: Development Mode

For development, use the regular `start.bat`. Note:
- Service worker may not work reliably
- Offline features are limited
- Best for testing features, not for offline capability

## How Offline Mode Works

### When Online:
1. App loads from cache (instant)
2. Data syncs with server in background
3. New app versions auto-update

### When Offline:
1. App loads from cache (no internet needed)
2. All UI features work
3. New practice sessions saved to IndexedDB
4. When back online, data syncs automatically

### Data Storage:

**Cached by Service Worker:**
- HTML, CSS, JavaScript
- App icons and images
- Previously loaded data

**Stored in IndexedDB:**
- Practice sessions
- Drill definitions
- Results
- Pending sync queue

## Testing Offline Mode

### After Installation:

1. **Install the app** (from production mode)
2. **Use it online** at least once (loads data into cache)
3. **Turn on Airplane Mode** on your phone
4. **Launch the app** from home screen
5. **It should work!** All features available offline
6. **Create practice sessions** - they'll sync when back online

### Debugging:

**On Chrome/Edge (Desktop):**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Service Workers" - should show "activated and running"
4. Check "Cache Storage" - should show cached files
5. Check "IndexedDB" → "golf_tracker" - should show your data

**On Phone:**
1. Chrome: `chrome://inspect/#service-workers`
2. Safari (iOS): Doesn't support PWA service workers fully - use Chrome or Edge

## Common Issues

### "Cannot connect to server" when offline
- Make sure you accessed the app **while online first**
- Service worker needs to cache files on first visit
- Try: Visit app online, wait 5 seconds, then go offline

### App doesn't install to home screen
- Make sure you're using **production mode** (`start-prod.bat`)
- Development mode has limited PWA support
- Chrome/Edge required (Safari has limited PWA support)

### Service worker not registering
- Check browser console for errors
- Make sure you're on `http://` or `https://` (not `file://`)
- Try clearing browser cache and reloading

### Changes not reflecting after update
- Service worker auto-updates, but may take a few minutes
- Force refresh: Close all app tabs/windows, reopen
- Or: DevTools → Application → Service Workers → "Unregister"

## Architecture

**Service Worker:**
- Caches app shell (HTML, CSS, JS)
- Caches API responses (NetworkFirst strategy)
- Serves cached content when offline

**IndexedDB:**
- Stores all practice data locally
- Sync engine manages upload queue
- Works offline without service worker

**Sync Engine:**
- Detects online/offline state
- Automatically syncs when connection restored
- Shows sync status in header

## Best Practices

1. **Always access the app online first** after installation
2. **Let it load completely** before going offline
3. **Check the green "Online" indicator** in the header
4. **Create practice sessions freely offline** - they'll sync later
5. **Use production mode for real use**, dev mode for development only
