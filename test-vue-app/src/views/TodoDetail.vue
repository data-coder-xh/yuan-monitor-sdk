<template>
  <div class="page-todo-detail">
    <router-link to="/todos" class="back">← 返回列表</router-link>
    <template v-if="todo">
      <h1>{{ todo.title }}</h1>
      <p>{{ todo.desc }}</p>
      <p class="meta">状态：{{ todo.done ? '已完成' : '未完成' }}</p>
    </template>
    <p v-else>未找到该待办。</p>
  </div>
</template>

<script>
const MOCK = {
  '1': { id: '1', title: '第一个待办', desc: '这是第一个待办的说明。', done: false },
  '2': { id: '2', title: '第二个待办', desc: '这是第二个待办的说明。', done: true },
  '3': { id: '3', title: '第三个待办', desc: '这是第三个待办的说明。', done: false }
}
export default {
  name: 'TodoDetail',
  data() {
    return { todo: null }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id) {
        this.todo = MOCK[id] || null
      }
    }
  }
}
</script>

<style scoped>
.back { display: inline-block; margin-bottom: 1rem; }
.meta { color: #666; font-size: 0.95rem; }
</style>
