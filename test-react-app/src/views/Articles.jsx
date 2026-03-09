import { Link } from 'react-router-dom'

const MOCK_ARTICLES = [
  { id: '1', title: '第一篇示例文章', summary: '这是摘要内容，用于列表展示。' },
  { id: '2', title: '第二篇示例文章', summary: '另一段摘要，说明文章大意。' },
  { id: '3', title: '第三篇示例文章', summary: '更多示例数据，便于测试列表与详情。' }
]

export default function Articles() {
  return (
    <div className="page-articles">
      <h1>文章列表</h1>
      <ul className="article-list">
        {MOCK_ARTICLES.map((a) => (
          <li key={a.id}>
            <Link to={`/articles/${a.id}`}>{a.title}</Link>
            <p className="summary">{a.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
