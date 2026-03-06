import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { init } from 'yuan-monitor-sdk'

// 初始化监控SDK
const monitor = init({
  appKey: 'test-app-key',
  serverUrl: 'http://localhost:3001',
  debug: true,
  framework: {
    react: true
  },
  advanced: {
    enableSessionReplay: true,
    sessionReplaySampleRate: 1
  },
  reporter: {
    reportMethod: 'fetch',
    debug: true
  }
})

// 直接使用 ErrorBoundary（同步获取）
const ErrorBoundary = monitor.ErrorBoundary;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App monitor={monitor} />
    </ErrorBoundary>
  </StrictMode>,
)
