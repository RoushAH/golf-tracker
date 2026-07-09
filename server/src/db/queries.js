import { getDatabase, saveDatabase } from './schema.js';

function rowsToObjects(result) {
  if (!result[0]) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

export const drillQueries = {
  async getAll() {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM drill_types WHERE deleted_at IS NULL ORDER BY is_default DESC, name');
    return rowsToObjects(result);
  },

  async getById(id) {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM drill_types WHERE id = ? AND deleted_at IS NULL', [id]);
    const rows = rowsToObjects(result);
    return rows[0] || null;
  },

  async create(drill) {
    const db = await getDatabase();
    db.run(
      `INSERT INTO drill_types (id, name, description, scoring_type, categories, metadata, created_at, updated_at, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [drill.id, drill.name, drill.description, drill.scoring_type, JSON.stringify(drill.categories), drill.metadata ? JSON.stringify(drill.metadata) : null, drill.created_at, drill.updated_at, drill.is_default || 0]
    );
    saveDatabase();
    return drill;
  },

  async update(id, drill) {
    const db = await getDatabase();
    db.run(
      `UPDATE drill_types
       SET name = ?, description = ?, scoring_type = ?, categories = ?, metadata = ?, updated_at = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [drill.name, drill.description, drill.scoring_type, JSON.stringify(drill.categories), drill.metadata ? JSON.stringify(drill.metadata) : null, Date.now(), id]
    );
    saveDatabase();
    return await this.getById(id);
  },

  async delete(id) {
    const db = await getDatabase();
    db.run('UPDATE drill_types SET deleted_at = ? WHERE id = ?', [Date.now(), id]);
    saveDatabase();
  },

  async getStats(drillId) {
    const db = await getDatabase();
    const sessionsResult = db.exec(
      `SELECT s.id, s.started_at
       FROM sessions s
       WHERE s.drill_type_id = ? AND s.deleted_at IS NULL
       ORDER BY s.started_at DESC`,
      [drillId]
    );
    const sessions = rowsToObjects(sessionsResult);

    if (sessions.length === 0) {
      return {
        drill_id: drillId,
        total_sessions: 0
      };
    }

    const drill = await this.getById(drillId);
    const resultsResult = db.exec(
      `SELECT r.*
       FROM results r
       JOIN sessions s ON r.session_id = s.id
       WHERE s.drill_type_id = ? AND r.deleted_at IS NULL AND s.deleted_at IS NULL`,
      [drillId]
    );
    const allResults = rowsToObjects(resultsResult);

    if (drill.scoring_type === 'made_missed') {
      const totalAttempts = allResults.length;
      const totalMade = allResults.filter(r => r.outcome === 'made').length;
      const successRate = totalAttempts > 0 ? (totalMade / totalAttempts) * 100 : 0;

      const byCategory = {};
      for (const result of allResults) {
        if (!byCategory[result.category]) {
          byCategory[result.category] = { attempts: 0, made: 0 };
        }
        byCategory[result.category].attempts++;
        if (result.outcome === 'made') {
          byCategory[result.category].made++;
        }
      }

      for (const cat in byCategory) {
        byCategory[cat].success_rate = (byCategory[cat].made / byCategory[cat].attempts) * 100;
      }

      return {
        drill_id: drillId,
        total_sessions: sessions.length,
        total_attempts: totalAttempts,
        total_made: totalMade,
        success_rate: successRate,
        by_category: byCategory
      };
    } else if (drill.scoring_type === 'stroke_count') {
      const strokes = allResults.map(r => parseInt(r.outcome));
      const totalStrokes = strokes.reduce((sum, s) => sum + s, 0);
      const averageStrokes = strokes.length > 0 ? totalStrokes / strokes.length : 0;

      return {
        drill_id: drillId,
        total_sessions: sessions.length,
        total_attempts: allResults.length,
        average_strokes: averageStrokes
      };
    }

    return {
      drill_id: drillId,
      total_sessions: sessions.length,
      total_attempts: allResults.length
    };
  },

  async getProgression(drillId, category = null) {
    const db = await getDatabase();
    const sessionsResult = db.exec(
      `SELECT s.id, s.started_at
       FROM sessions s
       WHERE s.drill_type_id = ? AND s.deleted_at IS NULL
       ORDER BY s.started_at ASC`,
      [drillId]
    );
    const sessions = rowsToObjects(sessionsResult);

    const drill = await this.getById(drillId);
    const progression = [];

    for (const session of sessions) {
      let resultsQuery = 'SELECT * FROM results WHERE session_id = ? AND deleted_at IS NULL';
      let params = [session.id];

      if (category) {
        resultsQuery += ' AND category = ?';
        params.push(category);
      }

      resultsQuery += ' ORDER BY sequence';

      const resultsResult = db.exec(resultsQuery, params);
      const results = rowsToObjects(resultsResult);

      // Skip sessions with no results for this category
      if (category && results.length === 0) {
        continue;
      }

      if (drill.scoring_type === 'made_missed') {
        const totalAttempts = results.length;
        const totalMade = results.filter(r => r.outcome === 'made').length;
        const successRate = totalAttempts > 0 ? (totalMade / totalAttempts) * 100 : 0;

        progression.push({
          session_id: session.id,
          started_at: session.started_at,
          total_attempts: totalAttempts,
          total_made: totalMade,
          success_rate: successRate
        });
      } else if (drill.scoring_type === 'stroke_count') {
        const strokes = results.map(r => parseInt(r.outcome));
        const totalStrokes = strokes.reduce((sum, s) => sum + s, 0);
        const averageStrokes = strokes.length > 0 ? totalStrokes / strokes.length : 0;

        progression.push({
          session_id: session.id,
          started_at: session.started_at,
          total_attempts: results.length,
          average_strokes: averageStrokes,
          total_strokes: totalStrokes
        });
      } else {
        progression.push({
          session_id: session.id,
          started_at: session.started_at,
          total_attempts: results.length
        });
      }
    }

    return progression;
  }
};

export const sessionQueries = {
  async getAll(limit = 50, offset = 0) {
    const db = await getDatabase();
    const result = db.exec(
      `SELECT * FROM sessions
       WHERE deleted_at IS NULL
       ORDER BY started_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rowsToObjects(result);
  },

  async getById(id) {
    const db = await getDatabase();
    const sessionResult = db.exec('SELECT * FROM sessions WHERE id = ? AND deleted_at IS NULL', [id]);
    const sessions = rowsToObjects(sessionResult);
    const session = sessions[0] || null;

    if (session) {
      const resultsResult = db.exec(
        'SELECT * FROM results WHERE session_id = ? AND deleted_at IS NULL ORDER BY sequence',
        [id]
      );
      session.results = rowsToObjects(resultsResult);
    }

    return session;
  },

  async create(session) {
    const db = await getDatabase();
    db.run(
      `INSERT INTO sessions (id, drill_type_id, started_at, completed_at, notes, created_at, updated_at, sync_version, device_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [session.id, session.drill_type_id, session.started_at, session.completed_at || null, session.notes || null, session.created_at, session.updated_at, session.sync_version || 0, session.device_id]
    );
    saveDatabase();
    return session;
  },

  async update(id, session) {
    const db = await getDatabase();

    // Get existing session to merge with updates
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      completed_at: session.completed_at !== undefined ? session.completed_at : existing.completed_at,
      notes: session.notes !== undefined ? session.notes : existing.notes
    };

    db.run(
      `UPDATE sessions
       SET completed_at = ?, notes = ?, updated_at = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [updatedSession.completed_at, updatedSession.notes, Date.now(), id]
    );
    saveDatabase();
    return await this.getById(id);
  },

  async delete(id) {
    const db = await getDatabase();
    db.run('UPDATE sessions SET deleted_at = ? WHERE id = ?', [Date.now(), id]);
    saveDatabase();
  }
};

export const resultQueries = {
  async create(result) {
    const db = await getDatabase();
    db.run(
      `INSERT INTO results (id, session_id, category, outcome, ball_number, sequence, recorded_at, created_at, updated_at, sync_version, device_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [result.id, result.session_id, result.category, result.outcome, result.ball_number || null, result.sequence, result.recorded_at, result.created_at, result.updated_at, result.sync_version || 0, result.device_id]
    );
    saveDatabase();
    return result;
  },

  async update(id, result) {
    const db = await getDatabase();
    db.run(
      `UPDATE results
       SET outcome = ?, updated_at = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [result.outcome, Date.now(), id]
    );
    saveDatabase();
    const resultQuery = db.exec('SELECT * FROM results WHERE id = ?', [id]);
    const rows = rowsToObjects(resultQuery);
    return rows[0] || null;
  },

  async delete(id) {
    const db = await getDatabase();
    db.run('UPDATE results SET deleted_at = ? WHERE id = ?', [Date.now(), id]);
    saveDatabase();
  }
};

export const syncQueries = {
  async getChangesSince(lastSyncAt) {
    const db = await getDatabase();

    const drillsResult = db.exec('SELECT * FROM drill_types WHERE updated_at > ?', [lastSyncAt]);
    const sessionsResult = db.exec('SELECT * FROM sessions WHERE updated_at > ?', [lastSyncAt]);
    const resultsResult = db.exec('SELECT * FROM results WHERE updated_at > ?', [lastSyncAt]);

    const drills = rowsToObjects(drillsResult);
    const sessions = rowsToObjects(sessionsResult);
    const results = rowsToObjects(resultsResult);

    return {
      drills: drills.filter(d => !d.deleted_at),
      sessions: sessions.filter(s => !s.deleted_at),
      results: results.filter(r => !r.deleted_at),
      deleted: {
        drills: drills.filter(d => d.deleted_at).map(d => d.id),
        sessions: sessions.filter(s => s.deleted_at).map(s => s.id),
        results: results.filter(r => r.deleted_at).map(r => r.id)
      }
    };
  },

  async upsertDrill(drill) {
    const db = await getDatabase();
    const existingResult = db.exec('SELECT * FROM drill_types WHERE id = ?', [drill.id]);
    const existing = rowsToObjects(existingResult)[0];

    if (!existing) {
      await drillQueries.create(drill);
    } else {
      if (drill.updated_at > existing.updated_at) {
        db.run(
          `UPDATE drill_types
           SET name = ?, description = ?, scoring_type = ?, categories = ?, metadata = ?, updated_at = ?, deleted_at = ?
           WHERE id = ?`,
          [drill.name, drill.description, drill.scoring_type, JSON.stringify(drill.categories), drill.metadata ? JSON.stringify(drill.metadata) : null, drill.updated_at, drill.deleted_at || null, drill.id]
        );
        saveDatabase();
      }
    }
    return drill;
  },

  async upsertSession(session) {
    const db = await getDatabase();
    const existingResult = db.exec('SELECT * FROM sessions WHERE id = ?', [session.id]);
    const existing = rowsToObjects(existingResult)[0];

    if (!existing) {
      await sessionQueries.create(session);
    } else {
      if (session.updated_at > existing.updated_at) {
        db.run(
          `UPDATE sessions
           SET drill_type_id = ?, started_at = ?, completed_at = ?, notes = ?, updated_at = ?, sync_version = ?, device_id = ?, deleted_at = ?
           WHERE id = ?`,
          [session.drill_type_id, session.started_at, session.completed_at || null, session.notes || null, session.updated_at, session.sync_version, session.device_id, session.deleted_at || null, session.id]
        );
        saveDatabase();
      }
    }
    return session;
  },

  async upsertResult(result) {
    const db = await getDatabase();
    const existingResult = db.exec('SELECT * FROM results WHERE id = ?', [result.id]);
    const existing = rowsToObjects(existingResult)[0];

    if (!existing) {
      await resultQueries.create(result);
    } else {
      if (result.updated_at > existing.updated_at) {
        db.run(
          `UPDATE results
           SET session_id = ?, category = ?, outcome = ?, ball_number = ?, sequence = ?, recorded_at = ?, updated_at = ?, sync_version = ?, device_id = ?, deleted_at = ?
           WHERE id = ?`,
          [result.session_id, result.category, result.outcome, result.ball_number || null, result.sequence, result.recorded_at, result.updated_at, result.sync_version, result.device_id, result.deleted_at || null, result.id]
        );
        saveDatabase();
      }
    }
    return result;
  },

  async updateSyncState(deviceId) {
    const db = await getDatabase();
    const existingResult = db.exec('SELECT * FROM sync_state WHERE device_id = ?', [deviceId]);
    const existing = rowsToObjects(existingResult)[0];
    const now = Date.now();

    if (!existing) {
      db.run('INSERT INTO sync_state (device_id, last_sync_at, last_pull_version) VALUES (?, ?, ?)', [deviceId, now, 0]);
    } else {
      db.run('UPDATE sync_state SET last_sync_at = ? WHERE device_id = ?', [now, deviceId]);
    }
    saveDatabase();
  }
};
