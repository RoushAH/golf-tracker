import { useState, useEffect } from 'react';
import { api } from './services/api';
import DrillList from './components/DrillManager/DrillList';
import DrillForm from './components/DrillManager/DrillForm';
import DataEntry from './components/DataEntry/DataEntry';
import Results from './components/Results/Results';
import './App.css';

function App() {
  const [view, setView] = useState('drills');
  const [drills, setDrills] = useState([]);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDrillForm, setShowDrillForm] = useState(false);

  useEffect(() => {
    loadDrills();
  }, []);

  async function loadDrills() {
    try {
      const data = await api.getDrills();
      setDrills(data);
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
        <h1>⛳ Golf Tracker</h1>
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
    </div>
  );
}

export default App;
