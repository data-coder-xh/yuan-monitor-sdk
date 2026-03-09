import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import Home from '../views/Home.vue'
import NoteList from '../views/NoteList.vue'
import NoteDetail from '../views/NoteDetail.vue'
import About from '../views/About.vue'
import MonitorTest from '../views/MonitorTest.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'notes', name: 'NoteList', component: NoteList },
      { path: 'notes/:id', name: 'NoteDetail', component: NoteDetail },
      { path: 'about', name: 'About', component: About },
      { path: 'monitor-test', name: 'MonitorTest', component: MonitorTest }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
