<template>
  <div class="app">
    <h1>Vue 3 + Yuan Monitor SDK Demo</h1>
    <p>打开控制台和网络面板，点击按钮会故意报错，SDK 会捕获并上报。</p>
    <button @click="triggerError">触发错误（测试上报）</button>
    <button @click="triggerMethodError">触发方法内错误</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    triggerError() {
      throw new Error('这是一个 Vue 3 测试错误')
    },
    triggerMethodError() {
      const a = null
      a.foo()
    }
  }
}
</script>

<style scoped>
.app {
  font-family: sans-serif;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}
button {
  margin-right: 12px;
  margin-top: 8px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
