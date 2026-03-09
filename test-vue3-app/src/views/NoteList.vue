<template>
  <div class="page-notes">
    <h1>笔记列表</h1>
    <ul class="note-list">
      <li v-for="n in notes" :key="n.id">
        <router-link :to="`/notes/${n.id}`">{{ n.title }}</router-link>
        <p class="preview">{{ n.preview }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'NoteList',
  data() {
    return {
      notes: [
        { id: '1', title: '第一篇笔记', preview: '这是笔记摘要…' },
        { id: '2', title: '第二篇笔记', preview: '另一段摘要…' },
        { id: '3', title: '第三篇笔记', preview: '更多示例内容…' }
      ]
    }
  }
}
</script>

<style scoped>
.note-list { list-style: none; padding: 0; }
.note-list li { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
.note-list .preview { margin: 0.25rem 0 0; color: #666; font-size: 0.95rem; }
</style>
