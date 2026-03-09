import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { monitorReady, MonitorContext } from './monitor.js'

monitorReady.then((monitor) => {
  const ErrorBoundary = monitor.ErrorBoundary
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MonitorContext.Provider value={monitor}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </MonitorContext.Provider>
    </StrictMode>,
  )
})
