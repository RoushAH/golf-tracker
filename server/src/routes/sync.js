import express from 'express';
import { syncQueries } from '../db/queries.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { deviceId, lastSyncAt, changes } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const serverTime = Date.now();
    const conflicts = [];

    if (changes) {
      if (changes.drills) {
        for (const drill of changes.drills) {
          await syncQueries.upsertDrill(drill);
        }
      }

      if (changes.sessions) {
        for (const session of changes.sessions) {
          await syncQueries.upsertSession(session);
        }
      }

      if (changes.results) {
        for (const result of changes.results) {
          await syncQueries.upsertResult(result);
        }
      }

      if (changes.deleted) {
        if (changes.deleted.drills) {
          for (const id of changes.deleted.drills) {
            await syncQueries.upsertDrill({ id, deleted_at: serverTime, updated_at: serverTime });
          }
        }
        if (changes.deleted.sessions) {
          for (const id of changes.deleted.sessions) {
            await syncQueries.upsertSession({ id, deleted_at: serverTime, updated_at: serverTime });
          }
        }
        if (changes.deleted.results) {
          for (const id of changes.deleted.results) {
            await syncQueries.upsertResult({ id, deleted_at: serverTime, updated_at: serverTime });
          }
        }
      }
    }

    const serverChanges = await syncQueries.getChangesSince(lastSyncAt || 0);

    serverChanges.drills = serverChanges.drills.map(d => ({
      ...d,
      categories: JSON.parse(d.categories),
      metadata: d.metadata ? JSON.parse(d.metadata) : null,
      is_default: Boolean(d.is_default)
    }));

    await syncQueries.updateSyncState(deviceId);

    res.json({
      serverTime,
      changes: serverChanges,
      conflicts
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
