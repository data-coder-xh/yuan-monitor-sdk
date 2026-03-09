# Vue 2 待办小站 + Yuan Monitor SDK

Vue 2 + Vite + Vue Router 示例项目，集成 Yuan Monitor SDK。

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
| `/todos` | 待办列表 |
| `/todos/:id` | 待办详情 |
| `/about` | 关于 |
| `/monitor-test` | 监控测试 |

## 接入要点

- **main.js**：从 `monitor.js` 初始化 SDK，`monitor.useVue(Vue)` 后挂载带 `router` 的根实例。
- **monitor.js**：统一配置 `serverUrl`（来自环境变量）、appKey、error/performance/behavior 等。
