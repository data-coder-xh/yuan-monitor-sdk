const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const reportRoutes = require('./routes/report');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));

app.use(reportRoutes);
app.use(apiRoutes);

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log('\n===========================================');
      console.log('  监控后端已启动 (MySQL)');
      console.log('  地址: http://localhost:' + PORT);
      console.log('===========================================');
      console.log('  接收: POST /api/report, POST /session-replay');
      console.log('  查询: GET /api/overview, /api/errors, /api/performance, /api/behavior, /api/session-replays');
      console.log('');
    });
  })
  .catch((err) => {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  });
