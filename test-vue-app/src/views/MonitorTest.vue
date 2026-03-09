<template>
  <div class="page-monitor-test">
    <h1>监控测试</h1>
    <p>点击下方按钮测试 SDK 功能，请打开控制台和网络面板查看上报。</p>
    <div class="test-buttons">
      <h3>错误监控</h3>
      <button @click="triggerError">触发错误（测试上报）</button>
      <button @click="triggerMethodError">触发方法内错误</button>
      <button @click="testManualError">手动上报错误</button>
      <h3>用户行为与网络</h3>
      <button @click="testUserBehavior">行为追踪</button>
      <button @click="testNetworkRequest">网络请求</button>
    </div>
  </div>
</template>

<script>
import { monitor } from '../monitor.js'

export default {
  name: 'MonitorTest',
  methods: {
    triggerError() {
      throw new Error('这是一个测试错误（Vue 组件）')
    },
    triggerMethodError() {
      const a = null
      a.foo()
    },
    testManualError() {
      monitor.reportError(new Error('手动上报的错误'), { context: 'test' })
    },
    testUserBehavior() {
      monitor.addBreadcrumb('custom', { message: '用户执行了自定义操作', data: { test: 'data' } })
    },
    testNetworkRequest() {
      fetch('https://jsonplaceholder.typicode.com/posts/1')
        .then(r => r.json())
        .then(data => console.log('Fetch response:', data))
    }
  }
}
</script>

<style scoped>
.test-buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin-top: 1rem; }
.test-buttons h3 { grid-column: 1 / -1; margin: 1rem 0 0.25rem; font-size: 1rem; }
.test-buttons h3:first-child { margin-top: 0; }
.test-buttons button { min-width: 140px; padding: 8px 16px; cursor: pointer; }
</style>
