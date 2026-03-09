<template>
  <div class="performance">
    <h1>性能数据</h1>
    <div class="toolbar">
      <select v-model="subType" class="select">
        <option value="">全部类型</option>
        <option value="web-vital">Web Vital</option>
        <option value="resource">Resource</option>
        <option value="long-task">Long Task</option>
        <option value="memory">Memory</option>
      </select>
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
              <th>SubType</th>
              <th>摘要</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in result.list" :key="r.id">
              <td>{{ formatTime(r.created_at) }}</td>
              <td>{{ r.app_key }}</td>
              <td>{{ r.sub_type }}</td>
              <td class="summary">{{ summary(r) }}</td>
              <td><button @click="toggle(r.id)" class="btn-sm">{{ expanded[r.id] ? '收起' : '详情' }}</button></td>
            </tr>
            <tr v-for="r in result.list" :key="'exp-' + r.id" v-show="expanded[r.id]" class="expand-row">
              <td colspan="5"><pre class="pre">{{ JSON.stringify(r.payload, null, 2) }}</pre></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPerformance } from '../api'

const loading = ref(true)
const page = ref(1)
const subType = ref('')
const result = ref({ list: [], total: 0 })
const expanded = reactive({})

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('zh-CN')
}

function summary(r) {
  const p = r.payload
  if (!p) return '-'
  if (p.name && p.value != null) return `${p.name}: ${p.value}`
  if (p.duration != null) return `duration: ${p.duration}`
  if (p.url) return p.url.slice(0, 50) + (p.url.length > 50 ? '...' : '')
  return JSON.stringify(p).slice(0, 60) + '...'
}

function toggle(id) {
  expanded[id] = !expanded[id]
}

async function load() {
  loading.value = true
  try {
    result.value = await getPerformance({ page: page.value, pageSize: 20, subType: subType || undefined })
  } catch (e) {
    result.value = { list: [], total: 0 }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.performance { }
.toolbar { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
.select { padding: 6px 10px; }
.input { width: 80px; padding: 6px 10px; }
.table-wrap { overflow-x: auto; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
.table th { background: #f8f9fa; font-weight: 600; }
.summary { max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn-sm { padding: 4px 8px; font-size: 12px; cursor: pointer; }
.expand-row td { background: #f8f9fa; vertical-align: top; }
.pre { margin: 0; padding: 12px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
</style>
