# React 文章小站 + Yuan Monitor SDK

React + Vite + React Router 示例项目，集成 Yuan Monitor SDK。

## 启动

1. 确保监控后端已启动（默认 `http://localhost:3001`）。
2. 本目录执行：`npm install` → `npm run dev`。
3. 上报地址由环境变量配置，见下方。

## 上报地址配置

在项目根目录创建或修改 `.env.development`：

```
VITE_REPORT_SERVER_URL=http://localhost:3001
```

不配置时默认使用 `http://localhost:3001`。

## 路由与页面

| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/articles` | 文章列表 |
| `/articles/:id` | 文章详情 |
| `/about` | 关于 |
| `/monitor-test` | 监控测试（触发错误、行为、网络等） |

## 目录结构

- `src/views/` 页面组件
- `src/components/` 公共组件（如 Layout）
- `src/router/` 路由配置
- `src/monitor.js` SDK 初始化（可在此调整 appKey、采样率等）
