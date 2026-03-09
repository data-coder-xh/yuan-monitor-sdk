const express = require('express');
const router = express.Router();
const {
  getErrors,
  getPerformance,
  getBehavior,
  getSessionReplays,
  getSessionReplayById,
  getOverview
} = require('../db');

router.get('/api/overview', (req, res) => {
  try {
    const data = getOverview();
    data.recentErrors = (data.recentErrors || []).map((row) => ({
      ...row,
      payload: safeParse(row.payload_json)
    }));
    res.json(data);
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/errors', (req, res) => {
  try {
    const appKey = req.query.appKey || undefined;
    const start = req.query.start != null ? parseInt(req.query.start, 10) : undefined;
    const end = req.query.end != null ? parseInt(req.query.end, 10) : undefined;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 100);
    const result = getErrors({ appKey, start, end, page, pageSize });
    result.list = result.list.map((row) => ({
      ...row,
      payload: safeParse(row.payload_json),
      env: safeParse(row.env_json),
      user_data: safeParse(row.user_data_json)
    }));
    res.json(result);
  } catch (err) {
    console.error('Errors list error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/performance', (req, res) => {
  try {
    const appKey = req.query.appKey || undefined;
    const subType = req.query.subType || undefined;
    const start = req.query.start != null ? parseInt(req.query.start, 10) : undefined;
    const end = req.query.end != null ? parseInt(req.query.end, 10) : undefined;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 100);
    const result = getPerformance({ appKey, subType, start, end, page, pageSize });
    result.list = result.list.map((row) => ({
      ...row,
      payload: safeParse(row.payload_json),
      env: safeParse(row.env_json)
    }));
    res.json(result);
  } catch (err) {
    console.error('Performance list error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/behavior', (req, res) => {
  try {
    const appKey = req.query.appKey || undefined;
    const sessionId = req.query.sessionId || undefined;
    const start = req.query.start != null ? parseInt(req.query.start, 10) : undefined;
    const end = req.query.end != null ? parseInt(req.query.end, 10) : undefined;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 50, 100);
    const result = getBehavior({ appKey, sessionId, start, end, page, pageSize });
    result.list = result.list.map((row) => ({
      ...row,
      payload: safeParse(row.payload_json)
    }));
    res.json(result);
  } catch (err) {
    console.error('Behavior list error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/session-replays', (req, res) => {
  try {
    const appKey = req.query.appKey || undefined;
    const sessionId = req.query.sessionId || undefined;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 100);
    const result = getSessionReplays({ appKey, sessionId, page, pageSize });
    res.json(result);
  } catch (err) {
    console.error('Session replays list error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/session-replays/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const row = getSessionReplayById(id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const events = safeParse(row.events_json);
    res.json({
      id: row.id,
      app_key: row.app_key,
      session_id: row.session_id,
      user_id: row.user_id,
      events: Array.isArray(events) ? events : [],
      duration_ms: row.duration_ms,
      last_error_time: row.last_error_time,
      created_at: row.created_at
    });
  } catch (err) {
    console.error('Session replay detail error:', err);
    res.status(500).json({ error: err.message });
  }
});

function safeParse(str) {
  if (str == null) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

module.exports = router;
