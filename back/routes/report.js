const express = require('express');
const router = express.Router();
const { insertReport, insertSessionReplay } = require('../db');

router.post('/api/report', (req, res) => {
  try {
    const body = req.body;
    const appKey = body.appKey || '';
    const sessionId = body.sessionId || null;
    const userId = body.userId || null;
    const userDataJson = body.userData ? JSON.stringify(body.userData) : null;
    const envJson = body.environment ? JSON.stringify(body.environment) : null;
    const ts = body.timestamp || Date.now();

    const data = body.data;
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if (!item || !item.type) continue;
      insertReport({
        app_key: appKey,
        session_id: sessionId,
        user_id: userId,
        user_data_json: userDataJson,
        report_type: item.type,
        sub_type: item.subType || null,
        payload_json: JSON.stringify(item),
        env_json: envJson,
        created_at: ts
      });
    }

    res.json({ success: true, message: '数据已接收' });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/session-replay', (req, res) => {
  try {
    const body = req.body;
    const appKey = body.appKey || '';
    const sessionId = body.sessionId || null;
    const userId = body.userId || null;
    const ts = body.timestamp || Date.now();
    const data = body.data || {};
    const events = data.events || [];
    const duration = data.duration != null ? data.duration : null;
    const lastErrorTime = data.lastErrorTime != null ? data.lastErrorTime : null;

    insertSessionReplay({
      app_key: appKey,
      session_id: sessionId,
      user_id: userId,
      events_json: JSON.stringify(events),
      duration_ms: duration,
      last_error_time: lastErrorTime,
      created_at: ts
    });

    res.json({ success: true, message: 'Session replay 数据已接收' });
  } catch (err) {
    console.error('Session replay error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
