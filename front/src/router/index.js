import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Overview', component: () => import('../views/Overview.vue'), meta: { title: '概览' } },
  { path: '/errors', name: 'Errors', component: () => import('../views/Errors.vue'), meta: { title: '错误' } },
  { path: '/performance', name: 'Performance', component: () => import('../views/Performance.vue'), meta: { title: '性能' } },
  { path: '/behavior', name: 'Behavior', component: () => import('../views/Behavior.vue'), meta: { title: '行为' } },
  { path: '/session-replays', name: 'SessionReplays', component: () => import('../views/SessionReplays.vue'), meta: { title: '会话回放' } },
  { path: '/session-replays/:id', name: 'SessionReplayDetail', component: () => import('../views/SessionReplayDetail.vue'), meta: { title: '回放详情' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - Yuan Monitor` : 'Yuan Monitor'
})

export default router
