# Vue 3 + Yuan Monitor SDK Demo

## 使用方式

1. 在项目根目录启动测试服务端：`npm run test:server`
2. 本目录：`npm install` → `npm run dev`
3. 点击「触发错误」可在控制台和 Network 看到上报到 `http://localhost:3001/api/report`

## Vue 3 接入要点

- **main.js**：先 `init(options)`，再 `createApp(App)` 得到 `app`，然后 **`monitor.useVue(app)`**（传 app 实例，不是 Vue 构造函数），最后 `app.mount('#app')`。
- Vue 2 项目则传 Vue 构造函数：`monitor.useVue(Vue)`。
