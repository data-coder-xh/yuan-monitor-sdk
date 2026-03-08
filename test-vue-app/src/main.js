import Vue from 'vue'
import App from './App.vue'
import { init } from 'yuan-monitor-sdk'

// 1. 初始化 SDK（在创建 Vue 应用之前）
const monitor = init({
  appKey: 'vue-demo-app',
  serverUrl: 'http://localhost:3001',
  debug: true,
  error: { enable: true },
  performance: { enable: true },
  behavior: { enable: true }
})

// 2. 安装 Vue 插件，自动捕获组件错误和生命周期内的错误
monitor.useVue(Vue)

// 3. 可选：登录后设置用户信息
// monitor.setUserId('user-123')
// monitor.setUserData({ name: '张三', role: 'admin' })

// 4. 挂载 Vue 应用
new Vue({
  render: h => h(App)
}).$mount('#app')
