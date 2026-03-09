import { BrowserRouter } from 'react-router-dom'
import RouterConfig from './router/index.jsx'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <RouterConfig />
    </BrowserRouter>
  )
}
