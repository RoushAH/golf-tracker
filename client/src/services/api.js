// Use the same host as the client is accessed from, but port 3001
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : `http://${window.location.hostname}:3001/api`;

export const api = {
  async getDrills() {
    const res = await fetch(`${API_BASE}/drills`);
    if (!res.ok) throw new Error('Failed to fetch drills');
    return res.json();
  },

  async getDrill(id) {
    const res = await fetch(`${API_BASE}/drills/${id}`);
    if (!res.ok) throw new Error('Failed to fetch drill');
    return res.json();
  },

  async createDrill(drill) {
    const res = await fetch(`${API_BASE}/drills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(drill)
    });
    if (!res.ok) throw new Error('Failed to create drill');
    return res.json();
  },

  async updateDrill(id, drill) {
    const res = await fetch(`${API_BASE}/drills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(drill)
    });
    if (!res.ok) throw new Error('Failed to update drill');
    return res.json();
  },

  async deleteDrill(id) {
    const res = await fetch(`${API_BASE}/drills/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete drill');
  },

  async getDrillStats(id) {
    const res = await fetch(`${API_BASE}/drills/${id}/stats`);
    if (!res.ok) throw new Error('Failed to fetch drill stats');
    return res.json();
  },

  async getDrillProgression(id) {
    const res = await fetch(`${API_BASE}/drills/${id}/progression`);
    if (!res.ok) throw new Error('Failed to fetch drill progression');
    return res.json();
  },

  async getSessions(limit = 50, offset = 0) {
    const res = await fetch(`${API_BASE}/sessions?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  async getSession(id) {
    const res = await fetch(`${API_BASE}/sessions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  },

  async createSession(session) {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error('Failed to create session');
    return res.json();
  },

  async updateSession(id, session) {
    const res = await fetch(`${API_BASE}/sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error('Failed to update session');
    return res.json();
  },

  async deleteSession(id) {
    const res = await fetch(`${API_BASE}/sessions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete session');
  },

  async addResult(sessionId, result) {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
    if (!res.ok) throw new Error('Failed to add result');
    return res.json();
  },

  async updateResult(id, result) {
    const res = await fetch(`${API_BASE}/sessions/results/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
    if (!res.ok) throw new Error('Failed to update result');
    return res.json();
  },

  async deleteResult(id) {
    const res = await fetch(`${API_BASE}/sessions/results/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete result');
  },

  async sync(deviceId, lastSyncAt, changes) {
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, lastSyncAt, changes })
    });
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
  }
};
