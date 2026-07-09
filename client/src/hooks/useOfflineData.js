import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { syncEngine } from '../services/sync';

export function useOfflineData(fetchFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    // Listen for sync events to refresh data
    const handleSyncComplete = () => loadData();
    window.addEventListener('sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('sync-complete', handleSyncComplete);
    };
  }, dependencies);

  return { data, loading, error, reload: loadData };
}

// Hook for drills
export function useDrills() {
  const isOnline = navigator.onLine;

  return useOfflineData(async () => {
    // Try to get from server first
    if (isOnline) {
      try {
        const drills = await api.getDrills();
        // Cache in local storage
        for (const drill of drills) {
          await storage.saveDrill(drill);
        }
        return drills;
      } catch (error) {
        console.warn('Failed to fetch from server, using cached data');
      }
    }

    // Fallback to local storage
    return await storage.getDrills();
  });
}

// Wrapper for creating data with offline support
export async function createWithOffline(type, data, createFn) {
  const isOnline = navigator.onLine;

  // Save to local storage immediately
  if (type === 'drill') {
    await storage.saveDrill(data);
  } else if (type === 'session') {
    await storage.saveSession(data);
  } else if (type === 'result') {
    await storage.saveResult(data);
  }

  // Queue for sync
  await syncEngine.queueChange('create', type, data);

  // If online, try to sync immediately
  if (isOnline) {
    try {
      await createFn();
    } catch (error) {
      console.warn('Failed to create on server, queued for later sync');
    }
  }

  return data;
}

// Wrapper for updating data with offline support
export async function updateWithOffline(type, id, data, updateFn) {
  const isOnline = navigator.onLine;

  // Update in local storage immediately
  if (type === 'drill') {
    const existing = await storage.getDrill(id);
    await storage.saveDrill({ ...existing, ...data, updated_at: Date.now() });
  } else if (type === 'session') {
    const existing = await storage.getSession(id);
    await storage.saveSession({ ...existing, ...data, updated_at: Date.now() });
  } else if (type === 'result') {
    await storage.saveResult({ ...data, updated_at: Date.now() });
  }

  // Queue for sync
  await syncEngine.queueChange('update', type, { id, ...data });

  // If online, try to sync immediately
  if (isOnline) {
    try {
      await updateFn();
    } catch (error) {
      console.warn('Failed to update on server, queued for later sync');
    }
  }
}

// Wrapper for deleting data with offline support
export async function deleteWithOffline(type, id, deleteFn) {
  const isOnline = navigator.onLine;

  // Mark as deleted in local storage
  if (type === 'drill') {
    await storage.deleteDrill(id);
  } else if (type === 'session') {
    await storage.deleteSession(id);
  } else if (type === 'result') {
    await storage.deleteResult(id);
  }

  // Queue for sync
  await syncEngine.queueChange('delete', type, { id });

  // If online, try to sync immediately
  if (isOnline) {
    try {
      await deleteFn();
    } catch (error) {
      console.warn('Failed to delete on server, queued for later sync');
    }
  }
}
