import { useState } from 'react';
import './DrillManager.css';

export default function DrillForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scoringType, setScoringType] = useState('made_missed');
  const [categories, setCategories] = useState(['']);

  function handleSubmit(e) {
    e.preventDefault();

    const filteredCategories = categories.filter(c => c.trim() !== '');
    if (!name.trim() || filteredCategories.length === 0) {
      alert('Please provide a name and at least one category');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      scoring_type: scoringType,
      categories: filteredCategories
    });
  }

  function addCategory() {
    setCategories([...categories, '']);
  }

  function updateCategory(index, value) {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  }

  function removeCategory(index) {
    setCategories(categories.filter((_, i) => i !== index));
  }

  return (
    <form className="drill-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Drill Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Short Putts Practice"
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this drill..."
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Scoring Type *</label>
        <select value={scoringType} onChange={(e) => setScoringType(e.target.value)}>
          <option value="made_missed">Made/Missed</option>
          <option value="stroke_count">Stroke Count</option>
          <option value="custom">Custom</option>
        </select>
        <small className="help-text">
          {scoringType === 'made_missed' && 'Track successful and missed attempts'}
          {scoringType === 'stroke_count' && 'Count total strokes per attempt'}
          {scoringType === 'custom' && 'Enter any outcome value'}
        </small>
      </div>

      <div className="form-group">
        <label>Categories *</label>
        <div className="categories-list">
          {categories.map((cat, idx) => (
            <div key={idx} className="category-input">
              <input
                type="text"
                value={cat}
                onChange={(e) => updateCategory(idx, e.target.value)}
                placeholder={`Category ${idx + 1}`}
              />
              {categories.length > 1 && (
                <button type="button" onClick={() => removeCategory(idx)}>
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn-secondary" onClick={addCategory}>
          + Add Category
        </button>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Create Drill
        </button>
      </div>
    </form>
  );
}
