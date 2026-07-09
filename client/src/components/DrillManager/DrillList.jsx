import './DrillManager.css';

export default function DrillList({ drills, onSelectDrill, onViewResults, onDeleteDrill }) {
  if (drills.length === 0) {
    return <div className="empty-state">No drills yet. Create your first drill!</div>;
  }

  return (
    <div className="drill-list">
      {drills.map(drill => (
        <div key={drill.id} className="drill-card">
          <div className="drill-header">
            <div>
              <h3>{drill.name}</h3>
              <p className="drill-description">{drill.description}</p>
              <div className="drill-meta">
                <span className="badge">{drill.scoring_type.replace('_', ' ')}</span>
                <span className="category-count">{drill.categories.length} categories</span>
              </div>
            </div>
            {!drill.is_default && (
              <button
                className="delete-btn"
                onClick={() => onDeleteDrill(drill.id)}
                title="Delete drill"
              >
                🗑️
              </button>
            )}
          </div>
          <div className="drill-actions">
            <button className="btn-secondary" onClick={() => onSelectDrill(drill)}>
              Start Practice
            </button>
            <button className="btn-secondary" onClick={() => onViewResults(drill)}>
              View Results
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
