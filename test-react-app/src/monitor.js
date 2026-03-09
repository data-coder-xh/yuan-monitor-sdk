import { init } from 'yuan-monitor-sdk'

const serverUrl = import.meta.env.VITE_REPORT_SERVER_URL || 'http://localhost:3001'

export const monitor = init({
  appKey: 'test-app-key',
  serverUrl,
  debug: true,
  framework: { react: true },
  advanced: {
    enableSessionReplay: true,
    sessionReplaySampleRate: 1
  },
  reporter: { reportMethod: 'fetch', debug: true }
})
