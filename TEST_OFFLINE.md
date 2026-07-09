# Offline Mode Test Protocol

## Problem
Service workers cache files **on first visit**. If you install the PWA but never open it while online, there's nothing cached yet.

## Correct Testing Steps

### Step 1: Clean Install (Online)
1. **Must be connected to WiFi**
2. Open browser on phone
3. Go to `http://[your-ip]:3001`
4. **Wait for app to fully load** (see drills list, green "Online" badge)
5. **Keep it open for 10 seconds** (let service worker cache everything)
6. Check that it works (tap a drill, go back, etc.)

### Step 2: Install PWA (Still Online)
7. Tap browser menu → "Add to Home Screen"
8. Icon appears on home screen
9. **Launch the icon** (while still online)
10. App opens as standalone
11. **Use it briefly** (tap around, let it cache everything)
12. Close the app

### Step 3: Test Offline
13. **Turn on Airplane Mode**
14. Launch the app **from home screen icon**
15. Should load and work!

## If It Still Doesn't Work

### Test 1: Check Service Worker Registration
**On Computer (easier to debug):**
1. Open `http://localhost:3001` in Chrome
2. Press F12 (DevTools)
3. Go to **Application** tab
4. Click **Service Workers**
5. Should show: "activated and running"
6. Click **Offline** checkbox
7. Refresh page - should still load

### Test 2: Check What's Cached
**DevTools → Application:**
- **Cache Storage** → Should see:
  - `workbox-precache-...` (has index.html, JS, CSS)
  - `api-cache` (optional, has API responses)
  - `assets-cache` (has images)
- **IndexedDB** → `golf_tracker` → Should have stores

### Test 3: Check Console Errors
When offline loading fails, check browser console:
- `Failed to fetch` → Service worker not registered yet
- `NetworkError` → Trying to hit server, not using cache
- `Timeout` → Network timeout before falling back to cache

## Common Mistakes

### ❌ Installing PWA Before Visiting Online
**Problem:** Install → Go Offline → Launch
- Service worker hasn't cached anything yet
- Nothing to load

**Fix:** Visit online first, **then** install

### ❌ Not Waiting for Cache
**Problem:** Visit online for 2 seconds → Go offline immediately
- Service worker is still caching files
- May not have everything yet

**Fix:** Wait 10 seconds on first online visit

### ❌ Using Browser Instead of PWA
**Problem:** Going offline, then opening browser and typing URL
- Browser won't load offline URL
- Must use installed PWA icon

**Fix:** Install to home screen, launch from icon

### ❌ Clearing Browser Data
**Problem:** Settings → Clear browsing data
- Deletes service worker cache
- Deletes IndexedDB
- Must visit online again

**Fix:** Don't clear site data

## Debugging Offline Issues

### Check 1: Is Service Worker Active?
```javascript
// Run in browser console:
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg?.active?.state);
});
// Should log: "activated"
```

### Check 2: What's in Cache?
```javascript
// Run in browser console:
caches.keys().then(keys => {
  console.log('Caches:', keys);
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(reqs => {
        console.log(key, ':', reqs.length, 'items');
      });
    });
  });
});
// Should show cache names and item counts
```

### Check 3: Is IndexedDB Populated?
```javascript
// Run in browser console:
indexedDB.databases().then(dbs => {
  console.log('Databases:', dbs);
});
// Should include "golf_tracker"
```

## Architecture Notes

### What Service Worker Caches (Automatically):
- `index.html`
- All JavaScript bundles
- All CSS files
- All images in `public/`
- Previously loaded API responses (24hr)

### What IndexedDB Stores (App Logic):
- Drills
- Sessions  
- Results
- Sync queue
- User auth (localStorage)

### Offline Load Sequence:
```
1. Browser requests http://your-ip:3001/
2. Service worker intercepts request
3. Returns cached index.html (instant)
4. HTML loads cached JavaScript
5. App initializes, checks navigator.onLine
6. If offline, loads data from IndexedDB
7. Shows red "Offline" badge
```

### If Service Worker Not Active:
```
1. Browser requests http://your-ip:3001/
2. No service worker to intercept
3. Browser tries to reach server
4. Offline → "Cannot connect" error
5. Nothing loads
```

## The Fix

If it's still not working after following Step 1-3 above:

1. **Uninstall the PWA** (long-press icon → Remove)
2. **Clear site data** (Browser → Settings → Site Settings → find your IP → Clear & Reset)
3. **Start fresh:**
   - Visit `http://[your-ip]:3001` **while online**
   - Wait 10 seconds
   - Open DevTools → Application → Service Workers → check "activated"
   - Close browser
   - Reopen → works offline!
4. **Then install PWA** (optional, but now works offline)

## Expected Behavior

### Online:
- Green "Online" badge in header
- Fast loading (service worker cache)
- Data syncs every 30 seconds
- New results save to server immediately

### Offline:
- Red "Offline" badge in header  
- Instant loading (all from cache)
- All features work
- Changes queue for sync
- When back online → auto-sync

## Still Broken?

If you followed all steps and it still doesn't work:
1. Take a screenshot of the error
2. Open browser console (if on computer)
3. Check DevTools → Application → Service Workers status
4. Report what you see

Most likely: Service worker hasn't cached anything yet because first visit was offline or too brief.
