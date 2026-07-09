import { api } from './api.js';
import { storage } from './storage.js';

class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.isOnline = true;
      this.sync();
    });

    window.addEventListener('offline', () => {
      console.log('📵 Connection lost');
      this.isOnline = false;
    });
  }

  async init() {
    // Initial sync
    if (this.isOnline) {
      await this.sync();
    }

    // Set up periodic sync (every 30 seconds when online)
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, 30000);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync() {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    console.log('🔄 Starting sync...');

    try {
      const deviceId = await storage.getDeviceId();
      const lastSyncAt = await storage.getLastSyncTime();
      const queue = await storage.getSyncQueue();

      // Prepare changes to send to server
      const changes = {
        drills: [],
        sessions: [],
        results: [],
        deleted: {
          drills: [],
          sessions: [],
          results: []
        }
      };

      // Process sync queue
      for (const item of queue) {
        if (item.action === 'delete') {
          changes.deleted[`${item.type}s`].push(item.data.id);
        } else {
          changes[`${item.type}s`].push(item.data);
        }
      }

      // Call sync endpoint
      const response = await api.sync(deviceId, lastSyncAt, changes);

      // Apply server changes to local storage
      await this.applyServerChanges(response.changes);

      // Clear sync queue
      await storage.clearSyncQueue();

      // Update last sync time
      await storage.setLastSyncTime(response.serverTime);

      console.log('✓ Sync completed', {
        sent: queue.length,
        received: response.changes.drills.length + response.changes.sessions.length + response.changes.results.length
      });

      // Notify listeners
      window.dispatchEvent(new CustomEvent('sync-complete', { detail: response }));

    } catch (error) {
      console.error('Sync failed:', error);
      window.dispatchEvent(new CustomEvent('sync-error', { detail: error }));
    } finally {
      this.isSyncing = false;
    }
  }

  async applyServerChanges(changes) {
    // Apply drills
    for (const drill of changes.drills) {
      await storage.saveDrill(drill);
    }

    // Apply sessions
    for (const session of changes.sessions) {
      await storage.saveSession(session);
    }

    // Apply results
    for (const result of changes.results) {
      await storage.saveResult(result);
    }

    // Handle deletions
    for (const id of changes.deleted.drills) {
      await storage.deleteDrill(id);
    }

    for (const id of changes.deleted.sessions) {
      await storage.deleteSession(id);
    }

    for (const id of changes.deleted.results) {
      await storage.deleteResult(id);
    }
  }

  async queueChange(action, type, data) {
    await storage.addToSyncQueue({ action, type, data });

    // Try to sync immediately if online
    if (this.isOnline) {
      this.sync();
    }
  }
}

export const syncEngine = new SyncEngine();
