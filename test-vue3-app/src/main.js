import { createApp } from 'vue'
import App from './App.vue'
import { monitor } from './monitor.js'
import router from './router/index.js'

const app = createApp(App)
monitor.useVue(app)
app.use(router)
app.mount('#app')
