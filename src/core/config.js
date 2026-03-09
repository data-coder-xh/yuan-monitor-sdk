const defaultConfig = {
  appKey: '',
  serverUrl: '',
  sampleRate: 1,
  error: {
    enable: true,
    captureGlobalErrors: true,
    capturePromiseRejections: true,
    captureResourceErrors: true,
    dedupeWindow: 5000,
    sourceMapResolver: null
  },
  performance: {
    enable: true,
    captureWebVitals: true,
    captureResourceTiming: true,
    captureLongTasks: true,
    captureMemory: true
  },
  behavior: {
    enable: true,
    captureClicks: true,
    captureRouteChanges: true,
    captureNetworkRequests: true,
    captureConsole: false,
    maxBreadcrumbs: 20
  },
  advanced: {
    enableSessionReplay: false,
    sessionReplaySampleRate: 0.1,
    enableWhiteScreenDetection: false,
    sessionReplayMaxEvents: 1200,
    sessionReplayAutoStopDelay: 10000,
    sessionReplayCheckoutEveryNms: 30000
  },
  reporter: {
    batchSize: 5,
    batchInterval: 5000,
    maxQueueSize: 20,
    reportMethod: 'fetch',
    retryCount: 3,
    retryDelay: 1000,
    endpoint: '/api/report'
  },
  framework: {
    vue: false,
    react: false
  },
  debug: false
};

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

const deepMerge = (target, source) => {
  const out = { ...target };
  Object.keys(source || {}).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target?.[key];
    out[key] = isObject(sourceValue) && isObject(targetValue)
      ? deepMerge(targetValue, sourceValue)
      : sourceValue;
  });
  return out;
};

export const createConfig = (options = {}) => deepMerge(defaultConfig, options);

export default defaultConfig;
