import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="page-home">
      <h1>文章小站</h1>
      <p>欢迎来到 React 示例项目，集成 Yuan Monitor SDK。</p>
      <ul className="home-links">
        <li><Link to="/articles">浏览文章列表</Link></li>
        <li><Link to="/about">关于本站</Link></li>
        <li><Link to="/monitor-test">监控测试页</Link></li>
      </ul>
    </div>
  )
}
