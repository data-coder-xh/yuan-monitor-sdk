import { init } from 'yuan-monitor-sdk'

const serverUrl = import.meta.env.VITE_REPORT_SERVER_URL || 'http://localhost:3001'

export const monitor = init({
  appKey: 'vue-demo-app',
  serverUrl,
  debug: true,
  error: { enable: true },
  performance: { enable: true },
  behavior: { enable: true }
})
