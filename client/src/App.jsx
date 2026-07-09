import { useState, useEffect } from 'react';
import { api } from './services/api';
import { syncEngine } from './services/sync';
import { storage } from './services/storage';
import { authService } from './services/auth';
import DrillList from './components/DrillManager/DrillList';
import DrillForm from './components/DrillManager/DrillForm';
import DataEntry from './components/DataEntry/DataEntry';
import Results from './components/Results/Results';
import SyncStatus from './components/SyncStatus/SyncStatus';
import InstallPrompt from './components/InstallPrompt/InstallPrompt';
import UsernameSignIn from './components/Auth/UsernameSignIn';
import UserMenu from './components/Auth/UserMenu';
import DebugPanel from './components/Debug/DebugPanel';
import './App.css';

const DEBUG_MODE = import.meta.env.DEV || localStorage.getItem('debug_mode') === 'true';

function AppContent() {
  const [view, setView] = useState('drills');
  const [drills, setDrills] = useState([]);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDrillForm, setShowDrillForm] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    initializeApp();

    return () => {
      syncEngine.stop();
    };
  }, []);

  async function initializeApp() {
    // Check for existing user
    const existingUser = authService.getUser();
    setUser(existingUser);

    // Initialize sync engine
    await syncEngine.init();

    // Load drills
    await loadDrills();

    // Listen for sync events to reload data
    window.addEventListener('sync-complete', loadDrills);
  }

  function handleSignInSuccess(user) {
    setUser(user);
    setShowSignIn(false);
    loadDrills();
  }

  useEffect(() => {
    loadDrills();
  }, []);

  async function loadDrills() {
    try {
      const isOnline = navigator.onLine;

      if (isOnline) {
        try {
          // Try to get from server
          const data = await api.getDrills();
          // Cache in local storage
          for (const drill of data) {
            await storage.saveDrill(drill);
          }
          setDrills(data);
        } catch (error) {
          console.warn('Failed to fetch from server, using cached data');
          // Fallback to local storage
          const data = await storage.getDrills();
          setDrills(data);
        }
      } else {
        // Use local storage when offline
        const data = await storage.getDrills();
        setDrills(data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load drills:', error);
      setLoading(false);
    }
  }

  async function handleCreateDrill(drill) {
    try {
      await api.createDrill(drill);
      await loadDrills();
      setShowDrillForm(false);
    } catch (error) {
      console.error('Failed to create drill:', error);
      alert('Failed to create drill');
    }
  }

  async function handleDeleteDrill(id) {
    if (!confirm('Delete this drill?')) return;
    try {
      await api.deleteDrill(id);
      await loadDrills();
      if (selectedDrill?.id === id) {
        setSelectedDrill(null);
        setView('drills');
      }
    } catch (error) {
      console.error('Failed to delete drill:', error);
      alert('Failed to delete drill');
    }
  }

  function handleSelectDrill(drill) {
    setSelectedDrill(drill);
    setView('entry');
  }

  function handleViewResults(drill) {
    setSelectedDrill(drill);
    setView('results');
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>⛳ Golf Tracker</h1>
          <div className="header-right">
            <SyncStatus />
            {user ? (
              <UserMenu user={user} />
            ) : (
              <button className="btn-sign-in" onClick={() => setShowSignIn(true)}>
                Sign In
              </button>
            )}
          </div>
        </div>
        <nav className="app-nav">
          <button
            className={view === 'drills' ? 'active' : ''}
            onClick={() => setView('drills')}
          >
            Drills
          </button>
          {selectedDrill && (
            <>
              <button
                className={view === 'entry' ? 'active' : ''}
                onClick={() => setView('entry')}
              >
                Practice
              </button>
              <button
                className={view === 'results' ? 'active' : ''}
                onClick={() => setView('results')}
              >
                Results
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        {view === 'drills' && (
          <div className="drills-view">
            <div className="view-header">
              <h2>Your Drills</h2>
              <button className="btn-primary" onClick={() => setShowDrillForm(true)}>
                + New Drill
              </button>
            </div>

            {showDrillForm && (
              <div className="modal-overlay" onClick={() => setShowDrillForm(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Create New Drill</h3>
                    <button className="close-btn" onClick={() => setShowDrillForm(false)}>
                      ×
                    </button>
                  </div>
                  <DrillForm onSubmit={handleCreateDrill} onCancel={() => setShowDrillForm(false)} />
                </div>
              </div>
            )}

            <DrillList
              drills={drills}
              onSelectDrill={handleSelectDrill}
              onViewResults={handleViewResults}
              onDeleteDrill={handleDeleteDrill}
            />
          </div>
        )}

        {view === 'entry' && selectedDrill && (
          <DataEntry drill={selectedDrill} onComplete={() => setView('results')} />
        )}

        {view === 'results' && selectedDrill && (
          <Results drill={selectedDrill} />
        )}
      </main>

      <InstallPrompt />
      {DEBUG_MODE && <DebugPanel />}

      {showSignIn && (
        <div className="modal-overlay" onClick={() => setShowSignIn(false)}>
          <div className="modal-content sign-in-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sign In</h3>
              <button className="close-btn" onClick={() => setShowSignIn(false)}>
                ×
              </button>
            </div>
            <div className="sign-in-body">
              <p>Sign in to sync your practice data across devices</p>
              <UsernameSignIn onSuccess={handleSignInSuccess} />
              <p className="sign-in-note">
                You can continue using the app without signing in. Your data will be saved locally on this device.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppContent;
