import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Home from '../views/Home'
import Articles from '../views/Articles'
import ArticleDetail from '../views/ArticleDetail'
import About from '../views/About'
import MonitorTest from '../views/MonitorTest'

export default function RouterConfig() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticleDetail />} />
        <Route path="about" element={<About />} />
        <Route path="monitor-test" element={<MonitorTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
