<template>
  <div class="page-home">
    <h1>待办小站</h1>
    <p>欢迎来到 Vue 2 示例项目，集成 Yuan Monitor SDK。</p>
    <ul class="home-links">
      <li><router-link to="/todos">待办列表</router-link></li>
      <li><router-link to="/about">关于本站</router-link></li>
      <li><router-link to="/monitor-test">监控测试页</router-link></li>
    </ul>
  </div>
</template>

<script>
export default { name: 'Home' }
</script>

<style scoped>
.home-links { list-style: none; padding: 0; }
.home-links li { margin: 0.5rem 0; }
</style>
