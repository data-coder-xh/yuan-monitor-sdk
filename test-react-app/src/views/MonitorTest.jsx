import { monitor } from '../monitor'

export default function MonitorTest() {
  const testRuntimeError = () => {
    try {
      const undefinedVar = null
      undefinedVar.someMethod()
    } catch (error) {
      monitor.reportError(error, { test: 'runtime-error' })
    }
  }

  const testPromiseError = () => {
    const promise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Promise rejection error')), 100)
    })
    promise.catch(error => monitor.reportError(error, { test: 'promise-error' }))
  }

  const testNetworkRequest = () => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'https://jsonplaceholder.typicode.com/todos/1')
    xhr.send()
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then(r => r.json())
      .then(data => console.log('Fetch response:', data))
  }

  const testUserBehavior = () => {
    monitor.addBreadcrumb('custom', {
      message: '用户执行了自定义操作',
      data: { test: 'data' }
    })
  }

  const testConsoleOutput = () => {
    console.log('测试 - log')
    console.warn('测试 - warn')
    console.error('测试 - error')
  }

  const testComponentError = () => {
    try {
      throw new Error('Test component render error')
    } catch (error) {
      monitor.reportError(error, { test: 'component-error', componentName: 'ErrorComponent' })
    }
  }

  const testManualErrorReport = () => {
    monitor.reportError(new Error('手动上报的错误'), { context: 'test', customData: 'custom data' })
  }

  return (
    <div className="page-monitor-test">
      <h1>监控测试</h1>
      <p>点击下方按钮测试 SDK 功能，请打开控制台和网络面板查看上报。</p>
      <div className="test-buttons">
        <h3>错误监控</h3>
        <button onClick={testRuntimeError}>运行时错误</button>
        <button onClick={testPromiseError}>Promise 错误</button>
        <button onClick={testComponentError}>组件错误</button>
        <button onClick={testManualErrorReport}>手动上报错误</button>
        <h3>性能与网络</h3>
        <button onClick={testNetworkRequest}>网络请求</button>
        <h3>用户行为</h3>
        <button onClick={testUserBehavior}>行为追踪</button>
        <button onClick={testConsoleOutput}>控制台输出</button>
      </div>
    </div>
  )
}
