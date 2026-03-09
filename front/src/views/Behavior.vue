<template>
  <div class="behavior">
    <h1>行为 / 面包屑</h1>
    <div class="toolbar">
      <input v-model="sessionId" type="text" placeholder="Session ID" class="input" />
      <input v-model="page" type="number" min="1" placeholder="页码" class="input" />
      <button @click="load">查询</button>
    </div>
    <div v-if="loading">加载中...</div>
    <template v-else>
      <p>共 {{ result.total }} 条</p>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>时间</th>
              <th>AppKey</th>
              <th>Session</th>
              <th>类型</th>
              <th>数据</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in result.list" :key="r.id">
              <td>{{ formatTime(r.created_at) }}</td>
              <td>{{ r.app_key }}</td>
              <td class="mono">{{ (r.session_id || '').slice(0, 12) }}...</td>
              <td>{{ (r.payload && r.payload.type) || '-' }}</td>
              <td class="data">{{ breadcrumbData(r) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBehavior } from '../api'

const loading = ref(true)
const page = ref(1)
const sessionId = ref('')
const result = ref({ list: [], total: 0 })

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('zh-CN')
}

function breadcrumbData(r) {
  const p = r.payload
  if (!p) return '-'
  const keys = Object.keys(p).filter(k => !['type', 'timestamp'].includes(k))
  if (!keys.length) return '-'
  return keys.map(k => `${k}: ${JSON.stringify(p[k])}`).join(' | ').slice(0, 80) + (keys.length ? '...' : '')
}

async function load() {
  loading.value = true
  try {
    result.value = await getBehavior({
      page: page.value,
      pageSize: 50,
      sessionId: sessionId.value || undefined
    })
  } catch (e) {
    result.value = { list: [], total: 0 }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.behavior { }
.toolbar { display: flex; gap: 8px; margin-bottom: 16px; }
.input { padding: 6px 10px; min-width: 120px; }
.table-wrap { overflow-x: auto; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
.table th { background: #f8f9fa; font-weight: 600; }
.mono { font-family: monospace; }
.data { max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
