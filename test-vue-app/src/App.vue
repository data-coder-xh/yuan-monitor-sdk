<template>
  <div id="app">
    <h1>Vue + Yuan Monitor SDK Demo</h1>
    <p>打开控制台和网络面板，点击下方按钮会故意报错，SDK 会捕获并上报。</p>
    <button @click="triggerError">触发错误（测试上报）</button>
    <button @click="triggerMethodError">触发方法内错误</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    triggerError() {
      // 故意抛错，会被 Vue.config.errorHandler 捕获并上报
      throw new Error('这是一个测试错误（Vue 组件）')
    },
    triggerMethodError() {
      // 方法内错误会被 useVue 的 mixin 包装捕获并上报
      const a = null
      a.foo()
    }
  }
}
</script>

<style scoped>
#app {
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
