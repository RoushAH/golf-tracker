import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Results.css';

export default function Results({ drill }) {
  const [stats, setStats] = useState(null);
  const [progression, setProgression] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [drill.id]);

  async function loadResults() {
    try {
      const [statsData, progressionData] = await Promise.all([
        api.getDrillStats(drill.id),
        api.getDrillProgression(drill.id)
      ]);
      setStats(statsData);
      setProgression(progressionData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load results:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (!stats || stats.total_sessions === 0) {
    return (
      <div className="results">
        <h2>{drill.name} - Results</h2>
        <div className="empty-state">No practice sessions yet. Start your first session!</div>
      </div>
    );
  }

  return (
    <div className="results">
      <div className="results-header">
        <h2>{drill.name}</h2>
        <p className="session-count">{stats.total_sessions} sessions completed</p>
      </div>

      <div className="stats-overview">
        <h3>Overall Statistics</h3>
        <div className="stats-grid">
          {drill.scoring_type === 'made_missed' && (
            <>
              <div className="stat-card">
                <div className="stat-value">{stats.total_attempts}</div>
                <div className="stat-label">Total Attempts</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.total_made}</div>
                <div className="stat-label">Made</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.success_rate.toFixed(1)}%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </>
          )}

          {drill.scoring_type === 'stroke_count' && (
            <>
              <div className="stat-card">
                <div className="stat-value">{stats.total_attempts}</div>
                <div className="stat-label">Total Balls</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.average_strokes.toFixed(2)}</div>
                <div className="stat-label">Avg Strokes</div>
              </div>
            </>
          )}
        </div>

        {drill.scoring_type === 'made_missed' && stats.by_category && (
          <div className="by-category">
            <h4>By Category</h4>
            {Object.entries(stats.by_category).map(([cat, data]) => (
              <div key={cat} className="category-stat">
                <div className="category-name">{cat}</div>
                <div className="category-bar">
                  <div
                    className="category-fill"
                    style={{ width: `${data.success_rate}%` }}
                  />
                </div>
                <div className="category-details">
                  {data.made}/{data.attempts} ({data.success_rate.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {progression.length > 0 && (
        <div className="progression">
          <h3>Session History</h3>
          <div className="progression-list">
            {progression.map((session, idx) => (
              <div key={session.session_id} className="session-item">
                <div className="session-number">Session {progression.length - idx}</div>
                <div className="session-date">
                  {new Date(session.started_at).toLocaleDateString()}
                </div>
                <div className="session-stats">
                  {drill.scoring_type === 'made_missed' && (
                    <>
                      <span>{session.total_made}/{session.total_attempts}</span>
                      <span className="success-rate">
                        {session.success_rate.toFixed(1)}%
                      </span>
                    </>
                  )}
                  {drill.scoring_type === 'stroke_count' && (
                    <>
                      <span>{session.total_strokes} strokes</span>
                      <span className="avg-strokes">
                        {session.average_strokes.toFixed(2)} avg
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
