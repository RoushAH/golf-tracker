// Use the same origin for API calls (server serves both API and client)
const API_BASE = `${window.location.origin}/api`;

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const user = getUserFromStorage();
  if (user?.id) {
    headers['X-User-Id'] = user.id;
  }
  return headers;
}

function getUserFromStorage() {
  try {
    const stored = localStorage.getItem('golf_tracker_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export const api = {
  async signInWithGoogle(token) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (!res.ok) throw new Error('Failed to sign in with Google');
    return res.json();
  },
  async getDrills() {
    const res = await fetch(`${API_BASE}/drills`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch drills');
    return res.json();
  },

  async getDrill(id) {
    const res = await fetch(`${API_BASE}/drills/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch drill');
    return res.json();
  },

  async createDrill(drill) {
    const res = await fetch(`${API_BASE}/drills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(drill)
    });
    if (!res.ok) throw new Error('Failed to create drill');
    return res.json();
  },

  async updateDrill(id, drill) {
    const res = await fetch(`${API_BASE}/drills/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(drill)
    });
    if (!res.ok) throw new Error('Failed to update drill');
    return res.json();
  },

  async deleteDrill(id) {
    const res = await fetch(`${API_BASE}/drills/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete drill');
  },

  async getDrillStats(id) {
    const res = await fetch(`${API_BASE}/drills/${id}/stats`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch drill stats');
    return res.json();
  },

  async getDrillProgression(id, category = null) {
    const url = category
      ? `${API_BASE}/drills/${id}/progression?category=${encodeURIComponent(category)}`
      : `${API_BASE}/drills/${id}/progression`;
    const res = await fetch(url, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch drill progression');
    return res.json();
  },

  async getSessions(limit = 50, offset = 0) {
    const res = await fetch(`${API_BASE}/sessions?limit=${limit}&offset=${offset}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  async getSession(id) {
    const res = await fetch(`${API_BASE}/sessions/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  },

  async createSession(session) {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error('Failed to create session');
    return res.json();
  },

  async updateSession(id, session) {
    const res = await fetch(`${API_BASE}/sessions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error('Failed to update session');
    return res.json();
  },

  async deleteSession(id) {
    const res = await fetch(`${API_BASE}/sessions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete session');
  },

  async addResult(sessionId, result) {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/results`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(result)
    });
    if (!res.ok) throw new Error('Failed to add result');
    return res.json();
  },

  async updateResult(id, result) {
    const res = await fetch(`${API_BASE}/sessions/results/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(result)
    });
    if (!res.ok) throw new Error('Failed to update result');
    return res.json();
  },

  async deleteResult(id) {
    const res = await fetch(`${API_BASE}/sessions/results/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete result');
  },

  async sync(deviceId, lastSyncAt, changes) {
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ deviceId, lastSyncAt, changes })
    });
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
  }
};
