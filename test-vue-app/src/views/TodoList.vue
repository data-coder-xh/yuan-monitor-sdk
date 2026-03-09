<template>
  <div class="page-todos">
    <h1>待办列表</h1>
    <ul class="todo-list">
      <li v-for="t in todos" :key="t.id">
        <router-link :to="`/todos/${t.id}`">{{ t.title }}</router-link>
        <p class="meta">{{ t.done ? '已完成' : '未完成' }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TodoList',
  data() {
    return {
      todos: [
        { id: '1', title: '第一个待办', done: false },
        { id: '2', title: '第二个待办', done: true },
        { id: '3', title: '第三个待办', done: false }
      ]
    }
  }
}
</script>

<style scoped>
.todo-list { list-style: none; padding: 0; }
.todo-list li { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
.todo-list .meta { margin: 0.25rem 0 0; color: #666; font-size: 0.9rem; }
</style>
