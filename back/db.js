const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'monitor.db');
const db = new Database(dbPath);

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_key TEXT NOT NULL,
      session_id TEXT,
      user_id TEXT,
      user_data_json TEXT,
      report_type TEXT NOT NULL,
      sub_type TEXT,
      payload_json TEXT NOT NULL,
      env_json TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_replays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_key TEXT NOT NULL,
      session_id TEXT,
      user_id TEXT,
      events_json TEXT NOT NULL,
      duration_ms INTEGER,
      last_error_time INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
    CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
    CREATE INDEX IF NOT EXISTS idx_reports_app_key ON reports(app_key);
    CREATE INDEX IF NOT EXISTS idx_session_replays_created ON session_replays(created_at);
    CREATE INDEX IF NOT EXISTS idx_session_replays_app_key ON session_replays(app_key);
  `);
  return db;
}

function insertReport(row) {
  const stmt = db.prepare(`
    INSERT INTO reports (app_key, session_id, user_id, user_data_json, report_type, sub_type, payload_json, env_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    row.app_key,
    row.session_id || null,
    row.user_id || null,
    row.user_data_json || null,
    row.report_type,
    row.sub_type || null,
    row.payload_json,
    row.env_json || null,
    row.created_at
  );
}

function insertSessionReplay(row) {
  const stmt = db.prepare(`
    INSERT INTO session_replays (app_key, session_id, user_id, events_json, duration_ms, last_error_time, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    row.app_key,
    row.session_id || null,
    row.user_id || null,
    row.events_json,
    row.duration_ms != null ? row.duration_ms : null,
    row.last_error_time != null ? row.last_error_time : null,
    row.created_at
  );
}

function getErrors(query = {}) {
  const { appKey, start, end, page = 1, pageSize = 20 } = query;
  let sql = 'SELECT * FROM reports WHERE report_type = ?';
  const params = ['error'];

  if (appKey) {
    sql += ' AND app_key = ?';
    params.push(appKey);
  }
  if (start != null) {
    sql += ' AND created_at >= ?';
    params.push(start);
  }
  if (end != null) {
    sql += ' AND created_at <= ?';
    params.push(end);
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(pageSize, (page - 1) * pageSize);

  const rows = db.prepare(sql).all(...params);
  const countParams = ['error'];
  if (appKey) countParams.push(appKey);
  if (start != null) countParams.push(start);
  if (end != null) countParams.push(end);
  const countSql = 'SELECT COUNT(*) as total FROM reports WHERE report_type = ?' +
    (appKey ? ' AND app_key = ?' : '') +
    (start != null ? ' AND created_at >= ?' : '') +
    (end != null ? ' AND created_at <= ?' : '');
  const countRow = db.prepare(countSql).get(...countParams);
  return { list: rows, total: countRow.total };
}

function getPerformance(query = {}) {
  const { appKey, subType, start, end, page = 1, pageSize = 20 } = query;
  let sql = 'SELECT * FROM reports WHERE report_type = ?';
  const params = ['performance'];

  if (appKey) {
    sql += ' AND app_key = ?';
    params.push(appKey);
  }
  if (subType) {
    sql += ' AND sub_type = ?';
    params.push(subType);
  }
  if (start != null) {
    sql += ' AND created_at >= ?';
    params.push(start);
  }
  if (end != null) {
    sql += ' AND created_at <= ?';
    params.push(end);
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(pageSize, (page - 1) * pageSize);

  const rows = db.prepare(sql).all(...params);
  const countParams = ['performance'];
  if (appKey) countParams.push(appKey);
  if (subType) countParams.push(subType);
  if (start != null) countParams.push(start);
  if (end != null) countParams.push(end);
  const countSql = 'SELECT COUNT(*) as total FROM reports WHERE report_type = ?' +
    (appKey ? ' AND app_key = ?' : '') +
    (subType ? ' AND sub_type = ?' : '') +
    (start != null ? ' AND created_at >= ?' : '') +
    (end != null ? ' AND created_at <= ?' : '');
  const countRow = db.prepare(countSql).get(...countParams);
  return { list: rows, total: countRow.total };
}

function getBehavior(query = {}) {
  const { appKey, sessionId, start, end, page = 1, pageSize = 50 } = query;
  let sql = 'SELECT * FROM reports WHERE report_type = ?';
  const params = ['behavior'];

  if (appKey) {
    sql += ' AND app_key = ?';
    params.push(appKey);
  }
  if (sessionId) {
    sql += ' AND session_id = ?';
    params.push(sessionId);
  }
  if (start != null) {
    sql += ' AND created_at >= ?';
    params.push(start);
  }
  if (end != null) {
    sql += ' AND created_at <= ?';
    params.push(end);
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(pageSize, (page - 1) * pageSize);

  const rows = db.prepare(sql).all(...params);
  const countParams = ['behavior'];
  if (appKey) countParams.push(appKey);
  if (sessionId) countParams.push(sessionId);
  if (start != null) countParams.push(start);
  if (end != null) countParams.push(end);
  const countSql = 'SELECT COUNT(*) as total FROM reports WHERE report_type = ?' +
    (appKey ? ' AND app_key = ?' : '') +
    (sessionId ? ' AND session_id = ?' : '') +
    (start != null ? ' AND created_at >= ?' : '') +
    (end != null ? ' AND created_at <= ?' : '');
  const countRow = db.prepare(countSql).get(...countParams);
  return { list: rows, total: countRow.total };
}

function getSessionReplays(query = {}) {
  const { appKey, sessionId, page = 1, pageSize = 20 } = query;
  let sql = 'SELECT id, app_key, session_id, user_id, duration_ms, last_error_time, created_at FROM session_replays WHERE 1=1';
  const params = [];

  if (appKey) {
    sql += ' AND app_key = ?';
    params.push(appKey);
  }
  if (sessionId) {
    sql += ' AND session_id = ?';
    params.push(sessionId);
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(pageSize, (page - 1) * pageSize);

  const rows = db.prepare(sql).all(...params);
  const countParams = [];
  if (appKey) countParams.push(appKey);
  if (sessionId) countParams.push(sessionId);
  const countSql = 'SELECT COUNT(*) as total FROM session_replays WHERE 1=1' +
    (appKey ? ' AND app_key = ?' : '') +
    (sessionId ? ' AND session_id = ?' : '');
  const countRow = countParams.length ? db.prepare(countSql).get(...countParams) : db.prepare(countSql).get();
  return { list: rows, total: countRow.total };
}

function getSessionReplayById(id) {
  return db.prepare('SELECT * FROM session_replays WHERE id = ?').get(id);
}

function getOverview() {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const todayStart = now - (now % oneDay);
  const sevenDaysAgo = now - 7 * oneDay;

  const errorsToday = db.prepare('SELECT COUNT(*) as c FROM reports WHERE report_type = ? AND created_at >= ?').get('error', todayStart);
  const errorsWeek = db.prepare('SELECT COUNT(*) as c FROM reports WHERE report_type = ? AND created_at >= ?').get('error', sevenDaysAgo);
  const performanceCount = db.prepare('SELECT COUNT(*) as c FROM reports WHERE report_type = ? AND created_at >= ?').get('performance', sevenDaysAgo);
  const replaysCount = db.prepare('SELECT COUNT(*) as c FROM session_replays WHERE created_at >= ?').get(sevenDaysAgo);

  const recentErrors = db.prepare(`
    SELECT * FROM reports WHERE report_type = ? ORDER BY created_at DESC LIMIT 10
  `).all('error');

  return {
    errorsToday: errorsToday.c,
    errorsWeek: errorsWeek.c,
    performanceCount: performanceCount.c,
    replaysCount: replaysCount.c,
    recentErrors
  };
}

module.exports = {
  db,
  initDb,
  insertReport,
  insertSessionReplay,
  getErrors,
  getPerformance,
  getBehavior,
  getSessionReplays,
  getSessionReplayById,
  getOverview
};
