import { createApp } from 'vue'
import App from './App.vue'
import { init } from 'yuan-monitor-sdk'

// 1. 初始化 SDK（在 createApp 之前）
const monitor = init({
  appKey: 'vue3-demo-app',
  serverUrl: 'http://localhost:3001',
  debug: true,
  error: { enable: true },
  performance: { enable: true },
  behavior: { enable: true }
})

// 2. 安装 Vue 插件：Vue 3 传入 app 实例（createApp 的返回值）
const app = createApp(App)
monitor.useVue(app)

// 3. 挂载
app.mount('#app')
