<template>
  <div class="layout">
    <nav class="layout-nav">
      <router-link to="/" exact-active-class="active" active-class="">首页</router-link>
      <router-link to="/notes" active-class="active">笔记</router-link>
      <router-link to="/about" active-class="active">关于</router-link>
      <router-link to="/monitor-test" active-class="active">监控测试</router-link>
    </nav>
    <main class="layout-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default { name: 'Layout' }
</script>

<style scoped>
.layout {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
}
.layout-nav {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}
.layout-nav a {
  color: #646cff;
  text-decoration: none;
  font-weight: 500;
}
.layout-nav a:hover { color: #535bf2; }
.layout-nav a.active { color: #4338ca; text-decoration: underline; }
.layout-main { padding: 0.5rem 0; }
</style>
