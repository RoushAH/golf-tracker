import { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import './SyncStatus.css';

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    updateStatus();

    const handleOnline = () => {
      setIsOnline(true);
      updateStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateStatus();
    };

    const handleSyncStart = () => {
      setIsSyncing(true);
    };

    const handleSyncComplete = () => {
      setIsSyncing(false);
      updateStatus();
    };

    const handleSyncError = () => {
      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sync-complete', handleSyncComplete);
    window.addEventListener('sync-error', handleSyncError);

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync-complete', handleSyncComplete);
      window.removeEventListener('sync-error', handleSyncError);
      clearInterval(interval);
    };
  }, []);

  async function updateStatus() {
    const queue = await storage.getSyncQueue();
    setPendingChanges(queue.length);

    const lastSyncTime = await storage.getLastSyncTime();
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime));
    }
  }

  if (!isOnline) {
    return (
      <div className="sync-status offline">
        <span className="status-icon">📵</span>
        <span className="status-text">Offline</span>
        {pendingChanges > 0 && (
          <span className="pending-count">{pendingChanges} pending</span>
        )}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="sync-status syncing">
        <span className="status-icon rotating">🔄</span>
        <span className="status-text">Syncing...</span>
      </div>
    );
  }

  return (
    <div className="sync-status online">
      <span className="status-icon">🌐</span>
      <span className="status-text">Online</span>
      {lastSync && (
        <span className="last-sync">
          {formatLastSync(lastSync)}
        </span>
      )}
    </div>
  );
}

function formatLastSync(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}
