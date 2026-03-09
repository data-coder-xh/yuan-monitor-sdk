import { useParams, Link } from 'react-router-dom'

const MOCK_ARTICLES = {
  '1': { id: '1', title: '第一篇示例文章', content: '这里是第一篇文章的正文内容。' },
  '2': { id: '2', title: '第二篇示例文章', content: '这里是第二篇文章的正文内容。' },
  '3': { id: '3', title: '第三篇示例文章', content: '这里是第三篇文章的正文内容。' }
}

export default function ArticleDetail() {
  const { id } = useParams()
  const article = MOCK_ARTICLES[id]

  if (!article) {
    return (
      <div className="page-article-detail">
        <p>未找到该文章。</p>
        <Link to="/articles">返回列表</Link>
      </div>
    )
  }

  return (
    <div className="page-article-detail">
      <Link to="/articles" className="back">← 返回列表</Link>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  )
}
