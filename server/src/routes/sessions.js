import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sessionQueries, resultQueries } from '../db/queries.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const sessions = await sessionQueries.getAll(limit, offset);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const session = await sessionQueries.getById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const now = Date.now();
    const session = {
      id: req.body.id || uuidv4(),
      drill_type_id: req.body.drill_type_id,
      started_at: req.body.started_at || now,
      completed_at: req.body.completed_at || null,
      notes: req.body.notes || null,
      created_at: now,
      updated_at: now,
      sync_version: 0,
      device_id: req.body.device_id || 'server'
    };

    const created = await sessionQueries.create(session);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await sessionQueries.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Session update error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await sessionQueries.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/results', async (req, res) => {
  try {
    const now = Date.now();
    const result = {
      id: req.body.id || uuidv4(),
      session_id: req.params.id,
      category: req.body.category,
      outcome: req.body.outcome,
      ball_number: req.body.ball_number || null,
      sequence: req.body.sequence,
      recorded_at: req.body.recorded_at || now,
      created_at: now,
      updated_at: now,
      sync_version: 0,
      device_id: req.body.device_id || 'server'
    };

    const created = await resultQueries.create(result);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/results/:id', async (req, res) => {
  try {
    const updated = await resultQueries.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/results/:id', async (req, res) => {
  try {
    await resultQueries.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
