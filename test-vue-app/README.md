# Vue + Yuan Monitor SDK Demo

## 使用方式

1. 在项目根目录先安装依赖并启动测试服务端（接收上报）：
   ```bash
   cd ..
   npm run test:server
   ```

2. 在本目录安装依赖并启动：
   ```bash
   npm install
   npm run dev
   ```

3. 打开页面后点击「触发错误」按钮，可在控制台和网络里看到 SDK 上报到 `http://localhost:3001/api/report`。

## 接入要点

- **main.js**：先 `init(options)`，再 `monitor.useVue(Vue)`，最后 `new Vue(...).$mount('#app')`。
- **useVue(Vue)**：会挂载 `Vue.config.errorHandler` 和全局 mixin，自动捕获组件错误和方法内未捕获错误并上报。
