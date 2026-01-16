# Yuan Monitor SDK 面试介绍指南

本文档帮助你在面试中清晰、有条理地介绍 Yuan Monitor SDK 项目。

## 项目概述（一句话定位）

Yuan Monitor SDK 是一个面向 React/Vue 前端应用的全栈监控解决方案，提供错误捕获、性能分析、用户行为追踪和录屏回放功能。

## 介绍框架（STAR 法则）

### 1. 背景与动机（Context）

"在实际项目中，前端监控对于快速定位线上问题至关重要。开源方案如 Sentry 功能强大但配置复杂，商业方案成本较高。因此我决定自研一个轻量级、易集成的监控 SDK。"

### 2. 核心功能（Features）

**错误监控**
- 全局 JavaScript 错误捕获
- Promise 拒绝处理
- 资源加载失败检测
- Source Map 堆栈反解支持

**性能监控**
- Web Vitals 核心指标（LCP、FCP、FID、CLS、TTFB）
- 资源加载性能分析
- 长任务检测（超过 50ms 的任务）
- 内存使用监控

**用户行为分析**
- 点击事件追踪
- 路由变化监控
- XHR/Fetch 请求拦截
- 面包屑轨迹记录

**录屏回放**
- 基于 rrweb 的页面录制
- 用户操作回放
- 输入框隐私脱敏

### 3. 技术架构（Architecture）

```
┌─────────────────────────────────────────────────────────────┐
│                      业务应用层                              │
│         React/Vue 应用通过 init() 初始化 SDK                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        API 层                                │
│         init() / setUserId() / reportError() 等              │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Collector     │ │   Reporter      │ │   Advanced      │
│   数据采集器     │ │   数据上报器     │ │   高级功能       │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ errorCollector  │ │ dataReporter    │ │ sessionReplay   │
│ performanceCol. │ │                 │ │                 │
│ behaviorCol.    │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     EventBus                                │
│              事件总线（模块间通信）                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     服务端                                   │
│           Express 服务器接收并存储监控数据                    │
└─────────────────────────────────────────────────────────────┘
```

### 4. 核心模块详解

#### 4.1 EventBus（事件总线）

**为什么需要？**
- 解耦各模块，降低耦合度
- 支持插件化扩展
- 实现模块间通信

**实现要点：**
- 单例模式，确保全局唯一
- 支持 on/once/off/emit 操作
- 错误隔离，单个回调出错不影响其他回调

```javascript
// eventBus.js
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(cb => {
      try {
        cb(...args);
      } catch (error) {
        // 隔离错误，防止影响其他回调
      }
    });
  }
}

export default new EventBus();
```

#### 4.2 错误采集器（ErrorCollector）

**采集策略：**
```javascript
// window.onerror - 捕获同步错误
window.onerror = (message, source, lineno, colno, error) => {
  this.captureError(error || { message, source });
};

// window.onunhandledrejection - 捕获 Promise 拒绝
window.onunhandledrejection = (event) => {
  this.captureError(event.reason);
};

// performance observer - 捕获资源加载错误
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.transferSize === 0 || entry.decodedBodySize === 0) {
      this.captureResourceError(entry.name);
    }
  });
}).observe({ type: 'resource', buffered: true });
```

**关键技术点：**
- Source Map 解析：将压缩后的代码行号映射回源代码
- 错误分类：根据错误类型区分处理
- 去重处理：相同错误避免重复上报

#### 4.3 行为采集器（BehaviorCollector）

**功能模块：**

1. **点击追踪**
   ```javascript
   document.addEventListener('click', (event) => {
     const target = event.target.closest('button, a, input');
     if (target) {
       this.addBreadcrumb('click', {
         tagName: target.tagName,
         text: target.textContent,
         id: target.id,
         className: target.className
       });
     }
   });
   ```

2. **路由监控**
   ```javascript
   const originalPushState = history.pushState;
   history.pushState = (...args) => {
     this.addBreadcrumb('route', {
       from: window.location.href,
       to: args[0]
     });
     originalPushState.apply(history, args);
   };
   ```

3. **网络请求拦截**
   ```javascript
   // Fetch 拦截
   const originalFetch = window.fetch;
   window.fetch = async (url, config) => {
     const startTime = Date.now();
     try {
       const response = await originalFetch(url, config);
       this.addBreadcrumb('fetch', {
         url, method: config.method, status: response.status
       });
       return response;
     } catch (error) {
       this.addBreadcrumb('fetch', { url, error: true });
       throw error;
     }
   };
   ```

**隐私保护：**
- SDK 内部请求标记 `X-SDK-Internal: true`，避免循环上报
- 输入框脱敏处理
- 可配置忽略规则

#### 4.4 性能采集器（PerformanceCollector）

**Web Vitals 采集：**
```javascript
// LCP - 最大内容绘制
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  this.reportWebVital('lcp', lastEntry.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });

// CLS - 累积布局偏移
new PerformanceObserver((list) => {
  let clsValue = 0;
  list.getEntries().forEach(entry => {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
    }
  });
  this.reportWebVital('cls', clsValue);
}).observe({ type: 'layout-shift', buffered: true });

// FID - 首次输入延迟
new PerformanceObserver((list) => {
  const firstInput = list.getEntries()[0];
  this.reportWebVital('fid', firstInput.processingStart - firstInput.startTime);
}).observe({ type: 'first-input', buffered: true });
```

#### 4.5 数据上报器（DataReporter）

**上报策略：**
- **批量上报**：收集多条数据后统一上报，减少请求次数
- **定时上报**：每 5 秒自动上报队列中的数据
- **指数退避**：上报失败后重试间隔递增
- **多方式传输**：优先使用 fetch，fallback 到 beacon/image

```javascript
class DataReporter {
  addToQueue(data) {
    this.queue.push(data);
    
    // 达到批量大小，立即上报
    if (this.queue.length >= this.config.batchSize) {
      this.flushQueue();
      return;
    }
    
    // 设置定时上报
    this.timer = setTimeout(() => this.flushQueue(), this.config.batchInterval);
  }
  
  reportFetch(data) {
    fetch(`${this.config.serverUrl}/api/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-SDK-Internal': 'true' },
      body: JSON.stringify(data)
    });
  }
}
```

#### 4.6 Session Replay

**基于 rrweb 实现：**
```javascript
import rrweb from 'rrweb';
import rrwebPlayer from 'rrweb-player';

class SessionReplay {
  startRecording() {
    this.events = [];
    this.stopFn = rrweb.record({
      emit: (event) => {
        this.events.push(event);
      },
      sampling: 10, // 采样率
      blockClass: 'monitor-block',
      ignoreClass: 'monitor-ignore'
    });
  }
  
  stopAndReport() {
    this.stopFn();
    this.reporter.reportSessionReplay({
      sessionId: this.sessionId,
      data: {
        events: this.events,
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }
}
```

**隐私处理：**
- 自动忽略 `.monitor-block` 类元素
- 输入框内容脱敏
- 可配置黑名单

## 面试常见问题及回答

### Q1: 为什么要自研监控 SDK？开源方案（如 Sentry）不香吗？

**参考回答：**
"开源方案确实功能强大，但存在几个问题：
1. **配置复杂**：Sentry 需要配置大量选项，学习成本高
2. **体积较大**：完整功能包体积可观
3. **定制困难**：深度定制需要深入理解源码
4. **成本考量**：自建方案更灵活，成本可控

我的目标是做一个轻量级、易集成、可定制的方案，适合中小型项目使用。"

### Q2: 如何保证 SDK 本身的稳定性？不会因为 SDK 导致应用崩溃吧？

**参考回答：**
"这是一个很好的问题，我在设计中特别考虑了这点：

1. **错误隔离**：使用 try-catch 包裹所有可能出错的代码
2. **回调隔离**：EventBus 中单个回调出错不影响其他回调
3. **无侵入性**：SDK 错误不会传播到业务代码
4. **降级策略**：不支持的浏览器特性自动跳过
5. **资源限制**：面包屑数量、队列大小都有上限

SDK 本身不会导致应用崩溃，即使 SDK 出错，业务代码也能正常运行。"

### Q3: 如何避免 SDK 自身请求被拦截导致无限循环？

**参考回答：**
"这是面试官经常会问的问题，我通过两个设计来解决：

1. **请求标记**：在 SDK 发送的请求中添加 `X-SDK-Internal: true` 请求头
2. **拦截器白名单**：在 Fetch/XHR 拦截器中检测此标记，遇到直接跳过

```javascript
// 上报时添加标记
fetch(url, {
  headers: { 'X-SDK-Internal': 'true' }
});

// 拦截器检测标记
if (config.headers['X-SDK-Internal'] === 'true') {
  return originalFetch(url, config); // 直接跳过
}
```

这样 SDK 自己的请求不会被当作普通网络请求上报，避免了循环。"

### Q4: 录屏功能如何保证性能和隐私？

**参考回答：**
"性能和隐私是录屏功能的核心考量：

**性能优化：**
1. **采样控制**：通过 sampling 选项控制录制频率
2. **增量录制**：只记录变化的 DOM 部分
3. **大小限制**：单个录制包有大小限制，自动分片
4. **按需启动**：错误触发后才开始录制

**隐私保护：**
1. **输入脱敏**：自动对 password/input 类型输入框脱敏
2. **元素忽略**：配置 `.monitor-block` 类来忽略敏感区域
3. **黑名单机制**：支持自定义忽略规则"

### Q5: 如何处理跨域问题？

**参考回答：**
"监控数据上报涉及跨域，主要解决方案：

1. **CORS 配置**：服务端设置适当的 CORS 头
2. **JSONP 降级**：不支持 CORS 时使用图片上报
3. **Beacon API**：navigator.sendBeacon 不受跨域限制

```javascript
reportBeacon(data) {
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    navigator.sendBeacon(`${this.config.serverUrl}/api/report`, blob);
  }
}
```"

### Q6: 遇到 413 Payload Too Large 怎么办？

**参考回答：**
"这是一个实际遇到的问题。解决方案：

1. **服务端**：增大 Express 的 body 解析限制
   ```javascript
   app.use(express.json({ limit: '100mb' }));
   ```

2. **客户端**：减少上报数据量
   - 降低面包屑数量限制
   - 减少批量上报大小
   - 移除响应体内容捕获
   - 录屏采样率优化

3. **分片上报**：大文件分多次上报"

### Q7: 如何设计 SDK 的插件机制？

**参考回答：**
"插件机制是扩展性的关键：

```javascript
// 插件接口定义
class Plugin {
  init(monitor) {
    // 初始化
  }
  onError(error) {
    // 处理错误
  }
  onPerformance(data) {
    // 处理性能数据
  }
}

// SDK 集成插件
class MonitorSDK {
  use(plugin) {
    plugin.init(this);
    this.plugins.push(plugin);
  }
  
  captureError(error) {
    this.plugins.forEach(p => p.onError && p.onError(error));
  }
}

// 使用示例
monitor.use(new SentryPlugin({ dsn: '...' }));
monitor.use(new AnalyticsPlugin({ trackingId: '...' }));
```

## 项目亮点总结

1. **架构设计**：模块化架构，EventBus 解耦，易于维护和扩展
2. **性能优化**：拦截器白名单、批量上报、采样控制
3. **隐私保护**：输入脱敏、元素忽略、SDK 内部请求标记
4. **兼容性**：多传输方式降级、特性检测降级
5. **可测试性**：完整 Demo 测试环境

## 技术栈

- **构建工具**：Vite
- **打包工具**：Rollup
- **测试框架**：React Testing Library
- **录屏库**：rrweb
- **服务端**：Express + CORS

## 后续优化方向

1. **Source Map 解析**：服务端解析，减小 SDK 体积
2. **数据压缩**：使用 gzip 压缩上报数据
3. **采样策略**：根据用户、设备进行智能采样
4. **插件市场**：支持第三方插件扩展
5. **可视化面板**：开发配套的数据展示后台

## 自我介绍模板

"我叫[姓名]，有[X]年前端开发经验。我最近独立开发了一个前端监控 SDK——Yuan Monitor SDK。

这个项目解决的是线上问题定位困难的痛点。它提供了完整的错误捕获、性能监控、行为分析和录屏回放功能。

在技术实现上，我采用了模块化架构，通过 EventBus 实现各模块间的解耦。特别值得一提的是，我在网络请求拦截器中加入了白名单机制，通过 `X-SDK-Internal` 请求头标记，避免了 SDK 自身请求被循环上报的问题。

项目目前已经完成了核心功能的开发，包括 React/Vue 框架集成、多种数据上报方式、基础的录屏功能等。

"我在这个项目中负责了从 0 到 1 的完整设计和实现，遇到并解决了 SDK 稳定性、循环上报、跨域处理等多个技术难点。"

---

## 简历写法

### 名字

**示例：**
```
张三 | 前端开发工程师 | 3年经验
```

### 项目介绍（一句话）

**示例：**
```
Yuan Monitor SDK：基于 React/Vue 的前端监控解决方案，提供错误捕获、性能分析、行为追踪和录屏回放功能。
```

### 技术栈

**示例：**
```
JavaScript、TypeScript、EventBus 架构、rrweb 录屏、Rollup 打包、Express 服务端
```

### 项目工作（5条核心职责）

**示例：**
1. **架构设计与模块化开发**：设计基于 EventBus 的模块化架构，实现 ErrorCollector、BehaviorCollector、PerformanceCollector、DataReporter、SessionReplay 五大核心模块，降低模块间耦合度，提升代码可维护性
2. **错误监控体系**：实现全局 JavaScript 错误捕获、Promise rejection 处理、资源加载失败检测，配合 Source Map 实现堆栈反解，构建完整的错误上报链路
3. **性能数据采集**：基于 Web Vitals 标准采集 LCP/FCP/FID/CLS/TTFB 核心指标，实现 PerformanceObserver 监听长任务（>50ms）和资源加载性能，支持内存使用监控
4. **用户行为追踪**：实现 XHR/Fetch 请求拦截、点击/路由变化监控、面包屑轨迹记录，通过 `X-SDK-Internal` 请求头标记避免 SDK 自身请求循环上报
5. **录屏回放与隐私保护**：基于 rrweb 实现页面录制与操作回放，采用输入框内容脱敏、元素忽略机制保护用户隐私，支持采样率配置优化性能

### 完整简历项目描述示例

```
项目名称：Yuan Monitor SDK（前端监控解决方案）
项目职责：独立设计并开发
项目描述：面向 React/Vue 应用的前端监控 SDK，提供错误捕获、性能分析、用户行为追踪和录屏回放功能。
技术栈：JavaScript、TypeScript、rrweb、Rollup、Express

主要工作：
1. 设计并实现基于 EventBus 的模块化架构，解耦各采集模块与上报模块
2. 实现多维度错误捕获：全局 JS 错误、Promise rejection、资源加载失败，支持 Source Map 堆栈反解
3. 基于 Web Vitals 实现性能指标采集，监听长任务与资源加载性能
4. 开发行为追踪模块：XHR/Fetch 拦截、点击/路由监控、面包屑轨迹
5. 基于 rrweb 实现录屏回放功能，采用内容脱敏与忽略机制保护隐私
```
