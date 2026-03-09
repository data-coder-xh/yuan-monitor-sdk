# 监控后端

接收 SDK 上报数据并持久化到 SQLite，提供查询 API。

## 启动

```bash
npm install
npm run dev
```

默认端口 3001。

## 接口

- `POST /api/report` - 接收错误/性能/行为上报
- `POST /session-replay` - 接收会话回放
- `GET /api/overview` - 概览统计
- `GET /api/errors` - 错误列表（分页）
- `GET /api/performance` - 性能数据（分页）
- `GET /api/behavior` - 行为/面包屑（分页）
- `GET /api/session-replays` - 回放列表（分页）
- `GET /api/session-replays/:id` - 单条回放详情（含 events）
