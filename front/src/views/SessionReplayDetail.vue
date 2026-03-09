<template>
  <div class="detail">
    <router-link to="/session-replays" class="back">← 返回列表</router-link>
    <h1>会话回放 #{{ route.params.id }}</h1>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else>
      <p>Session: {{ detail.session_id }} | 时长: {{ detail.duration_ms != null ? detail.duration_ms + ' ms' : '-' }}</p>
      <div ref="replayEl" class="replay-container"></div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getSessionReplayById } from '../api'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const detail = ref({ events: [] })
const replayEl = ref(null)
let replayer = null

onMounted(load)
watch(() => route.params.id, load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await getSessionReplayById(route.params.id)
    if (!detail.value.events || !detail.value.events.length) {
      error.value = '无回放数据'
      return
    }
    await nextTick()
    initReplayer()
  } catch (e) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function initReplayer() {
  const container = replayEl.value
  if (!container) return
  try {
    const mod = await import('rrweb')
    const Replayer = mod.Replayer || (mod.default && mod.default.Replayer)
    if (!Replayer) throw new Error('Replayer not found')
    container.innerHTML = ''
    replayer = new Replayer(detail.value.events, { root: container, UNSAFE_replayCanvas: true })
    replayer.play()
  } catch (err) {
    error.value = 'Replayer 初始化失败: ' + (err.message || String(err))
  }
}
</script>

<style scoped>
.detail { }
.back { display: inline-block; margin-bottom: 16px; color: #0f3460; }
.error { color: #c00; padding: 16px; }
.replay-container { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 400px; padding: 16px; }
</style>
