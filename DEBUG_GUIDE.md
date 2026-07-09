# Debug Mode Guide

## What is Debug Mode?

Debug mode adds a floating "🐛 Debug" button at the bottom-right of the app that opens a panel showing:

- **Service Worker Status:** Is it registered and active?
- **Cache Status:** How many caches and cached items?
- **IndexedDB Status:** Is the database present?
- **Online Status:** Are you connected?
- **Console Logs:** Real-time console.log/error/warn output

## How to Enable

### Method 1: Via Special Page

1. Go to: `http://[your-ip]:3001/enable-debug.html`
2. Click "Enable Debug Mode"
3. Reload the app
4. You'll see a "🐛 Debug" button at bottom-right

### Method 2: Via Browser Console

1. Open app in browser
2. Press F12 (DevTools)
3. Go to Console tab
4. Type: `localStorage.setItem('debug_mode', 'true')`
5. Reload the app

## How to Use

### On Your Phone:

1. Enable debug mode (see above)
2. Reload the app
3. Tap the "🐛 Debug" button at bottom-right
4. Panel slides up from bottom showing status

### Debugging Offline Issues:

1. **While online**, enable debug mode and check:
   - Service Worker: Should show "✅ activated"
   - Cache: Should show multiple caches with items
   - IndexedDB: Should show "✅ v1" or similar

2. **Go offline** (Airplane Mode)

3. **Try to load the app**

4. **Check the debug panel:**
   - Online: Should show "❌"
   - Service Worker: Still "✅ activated" (good!)
   - Console Logs: Will show what failed

### Reading Console Logs:

The debug panel captures all console messages:

**Normal startup (online):**
```
🌐 Connection restored
Creating session: {id: "...", drill_type_id: "..."}
✓ Sync completed
```

**Offline startup (working):**
```
📵 Connection lost
Loading drills from IndexedDB
Loaded 3 drills
```

**Offline startup (broken):**
```
Failed to create session: 503 Service Unavailable
TypeError: Failed to fetch
```

## Common Error Messages

### "Failed to create session: 503"
**Cause:** App trying to reach server, but offline
**Fix:** Service worker not caching properly. Visit online first.

### "TypeError: Failed to fetch"
**Cause:** Network request failed, no cache fallback
**Fix:** Service worker not registered. Check Service Worker status.

### "Failed to add result: 404"
**Cause:** Session doesn't exist on server
**Fix:** Network issue during session creation. Check logs.

### "Service Worker: ❌ Not registered"
**Cause:** Production build issue or browser doesn't support SW
**Fix:** Make sure using production mode (start-prod.bat)

### "Cache: ❌ Error: ..."
**Cause:** Browser blocking cache access
**Fix:** Check private browsing mode, storage permissions

## Debugging Workflow

### Problem: "App won't load offline"

1. **Enable debug mode** (while online)
2. **Check Service Worker status**
   - If "Not registered" → rebuild app (npm run build)
   - If "activated" → Good, continue

3. **Check Cache status**
   - If "0 caches, 0 items" → Wait 10 seconds, refresh status
   - If has items → Good, continue

4. **Check IndexedDB**
   - If "Not found" → Use app online first to populate
   - If found → Good, continue

5. **Go offline and retry**
6. **Check console logs** for error messages
7. **Report findings** with screenshots

### Problem: "Failed to record" in production

1. **Enable debug mode**
2. **Try to record a result**
3. **Check console logs** immediately after failure
4. **Look for:**
   - "Creating session: ..." → Did session create?
   - "Adding result: ..." → Did result add?
   - Error messages with details
5. **Screenshot the error** and report

## Disabling Debug Mode

1. Go to: `http://[your-ip]:3001/enable-debug.html`
2. Click "Disable Debug Mode"
3. Reload the app

Or in console:
```javascript
localStorage.removeItem('debug_mode');
```

## Debug Mode vs Development Mode

**Debug Mode (Production):**
- Production build (start-prod.bat)
- Debug panel enabled via localStorage
- Shows real service worker behavior
- Best for diagnosing offline issues

**Development Mode:**
- Development server (start.bat)
- Debug panel always enabled
- Service worker may not work reliably
- Best for coding new features

## What to Report

When reporting issues, include:

1. **Service Worker status** from debug panel
2. **Cache status** from debug panel
3. **Console logs** showing the error
4. **Steps to reproduce:**
   - What you clicked
   - Were you online or offline?
   - What error appeared?

**Example good report:**
```
Problem: Failed to record result

Environment:
- Production mode (start-prod.bat)
- Phone: iPhone 12, iOS 15
- Network: Offline (Airplane Mode)

Debug Info:
- Service Worker: ✅ activated
- Cache: ✅ 3 caches, 57 items
- IndexedDB: ✅ v1
- Online: ❌

Console Logs:
[12:03:45] Creating session: {id: "abc-123", ...}
[12:03:45] Failed to create session: TypeError: Failed to fetch
[12:03:45] Error: Failed to record. Try again.

Steps:
1. Opened app (was working)
2. Turned on Airplane Mode
3. Selected "Putting by Distance"
4. Tapped "Made" button
5. Got error alert
```

This level of detail makes it much easier to fix!

## Privacy Note

Debug logs are stored **locally only** in your browser. They are not sent to any server. Clear logs with the "Clear" button in the debug panel.

## Performance

Debug mode has minimal performance impact. The console capturing is lightweight and only stores the last 50 log messages.
