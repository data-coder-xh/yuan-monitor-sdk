import Vue from 'vue'
import App from './App.vue'
import { monitor } from './monitor.js'
import router from './router/index.js'

monitor.useVue(Vue)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
