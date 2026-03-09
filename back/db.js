const mysql = require('mysql2/promise');

let pool = null;

const config = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'yuan_monitor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function initDb() {
  if (pool) return pool;
  pool = mysql.createPool(config);
  await pool.query('SELECT 1');
  return pool;
}

function getPool() {
  return pool;
}

async function insertReport(row) {
  const p = getPool();
  if (!p) throw new Error('DB not initialized');
  await p.execute(
    `INSERT INTO reports (app_key, session_id, user_id, user_data_json, report_type, sub_type, payload_json, env_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.app_key,
      row.session_id || null,
      row.user_id || null,
      row.user_data_json || null,
      row.report_type,
      row.sub_type || null,
      row.payload_json,
      row.env_json || null,
      row.created_at
    ]
  );
}

async function insertSessionReplay(row) {
  const p = getPool();
  if (!p) throw new Error('DB not initialized');
  await p.execute(
    `INSERT INTO session_replays (app_key, session_id, user_id, events_json, duration_ms, last_error_time, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      row.app_key,
      row.session_id || null,
      row.user_id || null,
      row.events_json,
      row.duration_ms != null ? row.duration_ms : null,
      row.last_error_time != null ? row.last_error_time : null,
      row.created_at
    ]
  );
}

async function getErrors(query = {}) {
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

  const p = getPool();
  if (!p) throw new Error('DB not initialized');
  const [rows] = await p.execute(sql, params);

  const countParams = ['error'];
  if (appKey) countParams.push(appKey);
  if (start != null) countParams.push(start);
  if (end != null) countParams.push(end);
  const countSql = 'SELECT COUNT(*) as total FROM reports WHERE report_type = ?' +
    (appKey ? ' AND app_key = ?' : '') +
    (start != null ? ' AND created_at >= ?' : '') +
    (end != null ? ' AND created_at <= ?' : '');
  const [countRows] = await p.execute(countSql, countParams);
  const total = countRows[0].total;

  return { list: rows, total };
}

async function getPerformance(query = {}) {
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

  const p = getPool();
  if (!p) throw new Error('DB not initialized');
  const [rows] = await p.execute(sql, params);

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
  const [countRows] = await p.execute(countSql, countParams);
  return { list: rows, total: countRows[0].total };
}

async function getBehavior(query = {}) {
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

  const p = getPool();
  if (!p) throw new Error('DB not initialized');
  const [rows] = await p.execute(sql, params);

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
  const [countRows] = await p.execute(countSql, countParams);
  return { list: rows, total: countRows[0].total };
}

async function getSessionReplays(query = {}) {
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

  const p = getPool();
  if (!p) throw new Error('DB not initialized');
  const [rows] = await p.execute(sql, params);

  const countParams = [];
  if (appKey) countParams.push(appKey);
  if (sessionId) countParams.push(sessionId);
  const countSql = 'SELECT COUNT(*) as total FROM session_replays WHERE 1=1' +
    (appKey ? ' AND app_key = ?' : '') +
    (sessionId ? ' AND session_id = ?' : '');
  const [countRows] = countParams.length ? await p.execute(countSql, countParams) : await p.execute(countSql);
  return { list: rows, total: countRows[0].total };
}

async function getSessionReplayById(id) {
  const p = getPool();
  if (!p) throw new Error('DB not initialized');
  const [rows] = await p.execute('SELECT * FROM session_replays WHERE id = ?', [id]);
  return rows[0] || null;
}

async function getOverview() {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const todayStart = now - (now % oneDay);
  const sevenDaysAgo = now - 7 * oneDay;

  const p = getPool();
  if (!p) throw new Error('DB not initialized');

  const [[errorsToday]] = await p.execute('SELECT COUNT(*) as c FROM reports WHERE report_type = ? AND created_at >= ?', ['error', todayStart]);
  const [[errorsWeek]] = await p.execute('SELECT COUNT(*) as c FROM reports WHERE report_type = ? AND created_at >= ?', ['error', sevenDaysAgo]);
  const [[performanceCount]] = await p.execute('SELECT COUNT(*) as c FROM reports WHERE report_type = ? AND created_at >= ?', ['performance', sevenDaysAgo]);
  const [[replaysCount]] = await p.execute('SELECT COUNT(*) as c FROM session_replays WHERE created_at >= ?', [sevenDaysAgo]);
  const [recentErrors] = await p.execute('SELECT * FROM reports WHERE report_type = ? ORDER BY created_at DESC LIMIT 10', ['error']);

  return {
    errorsToday: errorsToday.c,
    errorsWeek: errorsWeek.c,
    performanceCount: performanceCount.c,
    replaysCount: replaysCount.c,
    recentErrors
  };
}

module.exports = {
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
