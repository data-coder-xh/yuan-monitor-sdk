<template>
  <div class="app">
    <nav class="nav">
      <router-link to="/">概览</router-link>
      <router-link to="/errors">错误</router-link>
      <router-link to="/performance">性能</router-link>
      <router-link to="/behavior">行为</router-link>
      <router-link to="/session-replays">会话回放</router-link>
    </nav>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: #f5f5f5; }
.app { min-height: 100vh; display: flex; flex-direction: column; }
.nav {
  background: #1a1a2e;
  padding: 12px 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.nav a {
  color: #eee;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 6px;
}
.nav a:hover { background: #16213e; }
.nav a.router-link-active { background: #0f3460; color: #fff; }
.main { flex: 1; padding: 24px; max-width: 1400px; margin: 0 auto; width: 100%; }
</style>
