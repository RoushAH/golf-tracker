import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../../services/api';
import './DataEntry.css';

export default function DataEntry({ drill, onComplete }) {
  const [sessionId] = useState(uuidv4());
  const [results, setResults] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(drill.categories[0]);
  const [isCompleting, setIsCompleting] = useState(false);

  async function handleRecord(outcome) {
    const now = Date.now();
    const result = {
      id: uuidv4(),
      session_id: sessionId,
      category: currentCategory,
      outcome: outcome,
      ball_number: drill.scoring_type === 'stroke_count' ? results.length + 1 : null,
      sequence: results.length,
      recorded_at: now,
      created_at: now,
      updated_at: now,
      sync_version: 0,
      device_id: getDeviceId()
    };

    try {
      if (results.length === 0) {
        await api.createSession({
          id: sessionId,
          drill_type_id: drill.id,
          started_at: now,
          device_id: getDeviceId()
        });
      }

      await api.addResult(sessionId, result);
      setResults([...results, result]);
    } catch (error) {
      console.error('Failed to record result:', error);
      alert('Failed to record. Try again.');
    }
  }

  async function handleComplete() {
    if (results.length === 0) {
      alert('Record at least one result before completing');
      return;
    }

    setIsCompleting(true);
    try {
      await api.updateSession(sessionId, {
        completed_at: Date.now()
      });
      onComplete();
    } catch (error) {
      console.error('Failed to complete session:', error);
      setIsCompleting(false);
    }
  }

  function getDeviceId() {
    let deviceId = localStorage.getItem('golf_tracker_device_id');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('golf_tracker_device_id', deviceId);
    }
    return deviceId;
  }

  const categoryResults = results.filter(r => r.category === currentCategory);

  if (drill.scoring_type === 'stroke_count') {
    const totalBalls = drill.metadata?.total_balls || 9;
    const ballsRemaining = totalBalls - results.length;

    return (
      <div className="data-entry">
        <div className="entry-header">
          <h2>{drill.name}</h2>
          <p>{drill.description}</p>
        </div>

        <div className="stroke-count-entry">
          <div className="ball-progress">
            <div className="progress-text">
              Ball {results.length + 1} of {totalBalls}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(results.length / totalBalls) * 100}%` }}
              />
            </div>
          </div>

          <div className="stroke-buttons">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(strokes => (
              <button
                key={strokes}
                className="stroke-btn"
                onClick={() => handleRecord(strokes.toString())}
                disabled={results.length >= totalBalls}
              >
                {strokes}
              </button>
            ))}
          </div>

          {results.length > 0 && (
            <div className="results-summary">
              <h3>Results</h3>
              <div className="results-grid">
                {results.map((r, idx) => (
                  <div key={r.id} className="result-item">
                    <span>Ball {idx + 1}:</span>
                    <strong>{r.outcome} strokes</strong>
                  </div>
                ))}
              </div>
              <div className="total-strokes">
                Total: {results.reduce((sum, r) => sum + parseInt(r.outcome), 0)} strokes
              </div>
            </div>
          )}

          {results.length >= totalBalls && (
            <button
              className="btn-primary btn-complete"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting ? 'Completing...' : 'Complete Session'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="data-entry">
      <div className="entry-header">
        <h2>{drill.name}</h2>
        <p>{drill.description}</p>
      </div>

      {drill.categories.length > 1 && (
        <div className="category-selector">
          {drill.categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${currentCategory === cat ? 'active' : ''}`}
              onClick={() => setCurrentCategory(cat)}
            >
              {cat}
              {categoryResults.length > 0 && (
                <span className="count-badge">{categoryResults.length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="made-missed-entry">
        <div className="outcome-buttons">
          <button
            className="outcome-btn made"
            onClick={() => handleRecord('made')}
          >
            ✓ Made
          </button>
          <button
            className="outcome-btn missed"
            onClick={() => handleRecord('missed')}
          >
            × Missed
          </button>
        </div>

        {categoryResults.length > 0 && (
          <div className="category-stats">
            <div className="stat-card">
              <div className="stat-value">
                {categoryResults.filter(r => r.outcome === 'made').length}
              </div>
              <div className="stat-label">Made</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {categoryResults.filter(r => r.outcome === 'missed').length}
              </div>
              <div className="stat-label">Missed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {((categoryResults.filter(r => r.outcome === 'made').length / categoryResults.length) * 100).toFixed(0)}%
              </div>
              <div className="stat-label">Success</div>
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <button
          className="btn-primary btn-complete"
          onClick={handleComplete}
          disabled={isCompleting}
        >
          {isCompleting ? 'Completing...' : 'Complete Session'}
        </button>
      )}
    </div>
  );
}
