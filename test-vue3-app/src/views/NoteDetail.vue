<template>
  <div class="page-note-detail">
    <router-link to="/notes" class="back">← 返回列表</router-link>
    <template v-if="note">
      <h1>{{ note.title }}</h1>
      <p>{{ note.content }}</p>
    </template>
    <p v-else>未找到该笔记。</p>
  </div>
</template>

<script>
const MOCK = {
  '1': { id: '1', title: '第一篇笔记', content: '这里是第一篇笔记的正文。' },
  '2': { id: '2', title: '第二篇笔记', content: '这里是第二篇笔记的正文。' },
  '3': { id: '3', title: '第三篇笔记', content: '这里是第三篇笔记的正文。' }
}
export default {
  name: 'NoteDetail',
  data() {
    return { note: null }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id) {
        this.note = MOCK[id] || null
      }
    }
  }
}
</script>

<style scoped>
.back { display: inline-block; margin-bottom: 1rem; }
</style>
