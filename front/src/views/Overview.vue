<template>
  <div class="overview">
    <h1>概览</h1>
    <div v-if="loading">加载中...</div>
    <template v-else>
      <div class="cards">
        <div class="card">
          <div class="card-value">{{ overview.errorsToday }}</div>
          <div class="card-label">今日错误</div>
        </div>
        <div class="card">
          <div class="card-value">{{ overview.errorsWeek }}</div>
          <div class="card-label">近 7 日错误</div>
        </div>
        <div class="card">
          <div class="card-value">{{ overview.performanceCount }}</div>
          <div class="card-label">近 7 日性能上报</div>
        </div>
        <div class="card">
          <div class="card-value">{{ overview.replaysCount }}</div>
          <div class="card-label">近 7 日会话回放</div>
        </div>
      </div>
      <section class="section">
        <h2>最近错误</h2>
        <router-link to="/errors" class="link">查看全部</router-link>
        <div v-if="!overview.recentErrors || !overview.recentErrors.length">暂无</div>
        <ul v-else class="list">
          <li v-for="r in overview.recentErrors" :key="r.id" class="list-item">
            <span class="time">{{ formatTime(r.created_at) }}</span>
            <span class="app">{{ r.app_key }}</span>
            <span class="msg">{{ (r.payload && r.payload.message) || '-' }}</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOverview } from '../api'

const loading = ref(true)
const overview = ref({ errorsToday: 0, errorsWeek: 0, performanceCount: 0, replaysCount: 0, recentErrors: [] })

function formatTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toLocaleString('zh-CN')
}

onMounted(async () => {
  try {
    overview.value = await getOverview()
  } catch (e) {
    overview.value = { errorsToday: 0, errorsWeek: 0, performanceCount: 0, replaysCount: 0, recentErrors: [] }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.overview { }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
.card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.card-value { font-size: 28px; font-weight: 700; color: #1a1a2e; }
.card-label { font-size: 14px; color: #666; margin-top: 4px; }
.section { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-top: 24px; }
.section h2 { margin: 0 0 12px 0; font-size: 18px; }
.link { color: #0f3460; font-size: 14px; }
.list { list-style: none; padding: 0; margin: 12px 0 0 0; }
.list-item { padding: 10px 0; border-bottom: 1px solid #eee; display: grid; grid-template-columns: 160px 120px 1fr; gap: 12px; font-size: 14px; }
.list-item .msg { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
