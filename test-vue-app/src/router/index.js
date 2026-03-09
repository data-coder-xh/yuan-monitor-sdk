import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '../components/Layout.vue'
import Home from '../views/Home.vue'
import TodoList from '../views/TodoList.vue'
import TodoDetail from '../views/TodoDetail.vue'
import About from '../views/About.vue'
import MonitorTest from '../views/MonitorTest.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'todos', name: 'TodoList', component: TodoList },
      { path: 'todos/:id', name: 'TodoDetail', component: TodoDetail },
      { path: 'about', name: 'About', component: About },
      { path: 'monitor-test', name: 'MonitorTest', component: MonitorTest }
    ]
  },
  { path: '*', redirect: '/' }
]

export default new VueRouter({ mode: 'history', routes })
