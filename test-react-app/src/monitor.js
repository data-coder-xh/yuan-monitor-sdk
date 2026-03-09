import React from 'react'
import { init } from 'yuan-monitor-sdk'

const serverUrl = import.meta.env.VITE_REPORT_SERVER_URL || 'http://localhost:3001'

// framework.react 为 true 时 init() 返回 Promise<monitor>，在 React 集成就绪后 resolve
export const monitorReady = init({
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

export const MonitorContext = React.createContext(null)
