import { Outlet, NavLink } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <nav className="layout-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>首页</NavLink>
        <NavLink to="/articles" className={({ isActive }) => (isActive ? 'active' : '')}>文章</NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>关于</NavLink>
        <NavLink to="/monitor-test" className={({ isActive }) => (isActive ? 'active' : '')}>监控测试</NavLink>
      </nav>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
