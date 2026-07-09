import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { drillQueries } from '../db/queries.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let drills = await drillQueries.getAll();
    drills = drills.map(d => ({
      ...d,
      categories: JSON.parse(d.categories),
      metadata: d.metadata ? JSON.parse(d.metadata) : null,
      is_default: Boolean(d.is_default)
    }));
    res.json(drills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const drill = await drillQueries.getById(req.params.id);
    if (!drill) {
      return res.status(404).json({ error: 'Drill not found' });
    }
    res.json({
      ...drill,
      categories: JSON.parse(drill.categories),
      metadata: drill.metadata ? JSON.parse(drill.metadata) : null,
      is_default: Boolean(drill.is_default)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const now = Date.now();
    const drill = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      scoring_type: req.body.scoring_type,
      categories: req.body.categories,
      metadata: req.body.metadata || null,
      created_at: now,
      updated_at: now,
      is_default: 0
    };

    const created = await drillQueries.create(drill);
    res.status(201).json({
      ...created,
      categories: JSON.parse(created.categories),
      metadata: created.metadata ? JSON.parse(created.metadata) : null,
      is_default: Boolean(created.is_default)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await drillQueries.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Drill not found' });
    }
    res.json({
      ...updated,
      categories: JSON.parse(updated.categories),
      metadata: updated.metadata ? JSON.parse(updated.metadata) : null,
      is_default: Boolean(updated.is_default)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await drillQueries.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await drillQueries.getStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/progression', async (req, res) => {
  try {
    const progression = await drillQueries.getProgression(req.params.id);
    res.json(progression);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
