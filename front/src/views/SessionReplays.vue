<template>
  <div class="replays">
    <h1>会话回放列表</h1>
    <div class="toolbar">
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
              <th>ID</th>
              <th>时间</th>
              <th>AppKey</th>
              <th>Session ID</th>
              <th>时长(ms)</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in result.list" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ formatTime(r.created_at) }}</td>
              <td>{{ r.app_key }}</td>
              <td class="mono">{{ (r.session_id || '').slice(0, 16) }}...</td>
              <td>{{ r.duration_ms != null ? r.duration_ms : '-' }}</td>
              <td><router-link :to="'/session-replays/' + r.id" class="link">回放</router-link></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSessionReplays } from '../api'

const loading = ref(true)
const page = ref(1)
const result = ref({ list: [], total: 0 })

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('zh-CN')
}

async function load() {
  loading.value = true
  try {
    result.value = await getSessionReplays({ page: page.value, pageSize: 20 })
  } catch (e) {
    result.value = { list: [], total: 0 }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.replays { }
.toolbar { display: flex; gap: 8px; margin-bottom: 16px; }
.input { width: 80px; padding: 6px 10px; }
.table-wrap { overflow-x: auto; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
.table th { background: #f8f9fa; font-weight: 600; }
.mono { font-family: monospace; }
.link { color: #0f3460; }
</style>
