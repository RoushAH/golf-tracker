import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';
import './Results.css';

export default function Results({ drill }) {
  const [stats, setStats] = useState(null);
  const [progression, setProgression] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('overall');

  useEffect(() => {
    loadResults();
  }, [drill.id]);

  useEffect(() => {
    if (stats) {
      loadProgression();
    }
  }, [selectedCategory]);

  async function loadResults() {
    try {
      const statsData = await api.getDrillStats(drill.id);
      setStats(statsData);
      setSelectedCategory('overall');
      await loadProgression();
      setLoading(false);
    } catch (error) {
      console.error('Failed to load results:', error);
      setLoading(false);
    }
  }

  async function loadProgression() {
    try {
      const category = selectedCategory === 'overall' ? null : selectedCategory;
      const progressionData = await api.getDrillProgression(drill.id, category);
      setProgression(progressionData);
    } catch (error) {
      console.error('Failed to load progression:', error);
    }
  }

  async function handleDeleteSession(sessionId) {
    if (!confirm('Delete this practice session? This cannot be undone.')) return;

    try {
      await api.deleteSession(sessionId);
      await loadResults();
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session');
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

  // Get categories with data for made/missed drills
  const categoriesWithData = drill.scoring_type === 'made_missed' && stats.by_category
    ? Object.keys(stats.by_category)
    : [];

  const currentStats = selectedCategory === 'overall' ? stats : (stats.by_category?.[selectedCategory] || {});

  // Prepare chart data
  const chartData = progression.map((session, idx) => ({
    session: idx + 1,
    date: new Date(session.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: drill.scoring_type === 'made_missed'
      ? session.success_rate
      : session.average_strokes,
    label: drill.scoring_type === 'made_missed'
      ? `${session.success_rate.toFixed(1)}%`
      : `${session.average_strokes.toFixed(2)} avg`
  }));

  return (
    <div className="results">
      <div className="results-header">
        <h2>{drill.name}</h2>
        <p className="session-count">{stats.total_sessions} sessions completed</p>
      </div>

      {/* Category Selector for made/missed drills */}
      {drill.scoring_type === 'made_missed' && drill.categories.length > 1 && (
        <div className="category-filter">
          <button
            className={`filter-pill ${selectedCategory === 'overall' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('overall')}
          >
            Overall
          </button>
          {drill.categories.map(cat => {
            const hasData = categoriesWithData.includes(cat);
            return (
              <button
                key={cat}
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''} ${!hasData ? 'disabled' : ''}`}
                onClick={() => hasData && setSelectedCategory(cat)}
                disabled={!hasData}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      <div className="stats-overview">
        <h3>
          {selectedCategory === 'overall' ? 'Overall Statistics' : `${selectedCategory} Statistics`}
        </h3>
        <div className="stats-grid">
          {drill.scoring_type === 'made_missed' && (
            <>
              <div className="stat-card">
                <div className="stat-value">
                  {selectedCategory === 'overall' ? stats.total_attempts : currentStats.attempts || 0}
                </div>
                <div className="stat-label">Total Attempts</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {selectedCategory === 'overall' ? stats.total_made : currentStats.made || 0}
                </div>
                <div className="stat-label">Made</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {selectedCategory === 'overall'
                    ? stats.success_rate.toFixed(1)
                    : (currentStats.success_rate || 0).toFixed(1)}%
                </div>
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

        {selectedCategory === 'overall' && drill.scoring_type === 'made_missed' && stats.by_category && (
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
          <h3>Progress Over Time</h3>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              {drill.scoring_type === 'made_missed' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="session"
                    label={{ value: 'Session', position: 'insideBottom', offset: -5 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip">
                            <p className="tooltip-label">Session {payload[0].payload.session}</p>
                            <p className="tooltip-date">{payload[0].payload.date}</p>
                            <p className="tooltip-value">{payload[0].payload.label}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2e7d32"
                    strokeWidth={3}
                    dot={{ fill: '#2e7d32', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="session"
                    label={{ value: 'Session', position: 'insideBottom', offset: -5 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Avg Strokes', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip">
                            <p className="tooltip-label">Session {payload[0].payload.session}</p>
                            <p className="tooltip-date">{payload[0].payload.date}</p>
                            <p className="tooltip-value">{payload[0].payload.label}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" fill="#ff9800" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <h3>Session History</h3>
          <div className="progression-list">
            {progression.map((session, idx) => (
              <div key={session.session_id} className="session-item">
                <div className="session-info">
                  <div className="session-number">Session {idx + 1}</div>
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
                <button
                  className="delete-session-btn"
                  onClick={() => handleDeleteSession(session.session_id)}
                  title="Delete session"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
