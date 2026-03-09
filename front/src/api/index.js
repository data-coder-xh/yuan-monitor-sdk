const base = ''

async function get(url, params = {}) {
  const q = new URLSearchParams(params).toString()
  const res = await fetch(base + url + (q ? '?' + q : ''))
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function getOverview() {
  return get('/api/overview')
}

export function getErrors(params) {
  return get('/api/errors', params)
}

export function getPerformance(params) {
  return get('/api/performance', params)
}

export function getBehavior(params) {
  return get('/api/behavior', params)
}

export function getSessionReplays(params) {
  return get('/api/session-replays', params)
}

export function getSessionReplayById(id) {
  return get(`/api/session-replays/${id}`)
}
