# 个人加密货币合约交易分析工具开发流程总览

## 1. 技术定位

前端单页应用，无后端。

技术栈：

- Vue 3
- Vite
- TypeScript
- Pinia
- Tailwind CSS
- Lightweight Charts
- Binance Public API

核心目标：

> 直接调用 Binance 公开接口，完成行情展示、技术分析、风控计算、交易计划生成。

## 2. 开发顺序

1. 项目初始化 + 页面布局
2. Binance API 请求封装
3. K线图展示
4. EMA / RSI / MACD / ATR 指标计算
5. 技术分析面板
6. 多空评分系统
7. 风控计算器
8. 交易计划生成器
9. 本地保存
10. UI 优化与测试

## 3. 系统流程


Binance Public API
        ↓
数据请求层
        ↓
数据清洗层
        ↓
指标计算层
        ↓
多空评分层
        ↓
风控计算层
        ↓
交易计划生成层
        ↓
Vue 页面展示

## 3. MVP 功能范围

### P0 必做

- 币种切换
- 周期切换
- K线图
- 成交量图
- 当前价格
- 涨跌幅
- EMA 指标
- RSI 指标
- MACD 指标
- ATR 指标
- 多空评分
- 风控计算器
- 交易计划生成

### P1 增强

- 资金费率
- 下次资金费率时间
- 24h 成交量
- 支撑压力识别
- 多周期共振
- 本地保存分析记录

### P2 高级

- 回测
- 复盘日志
- 爆仓价估算
- 策略模板
- 报告导出 Markdown / PDF

## 4. 页面结构
顶部栏
├─ 币种选择
├─ 周期选择
├─ 当前价格
├─ 24h涨跌幅
└─ 资金费率

主区域
├─ 左侧：K线图
│  ├─ Lightweight Charts
│  ├─ 蜡烛图
│  ├─ 成交量
│  └─ EMA线
│
└─ 右侧：分析面板
   ├─ 技术指标
   ├─ 多空评分
   ├─ 风险等级
   └─ 交易计划

底部区域
├─ 风控计算器
├─ 仓位建议
├─ 止损止盈
└─ 交易计划详情

## 5. 项目目录结构
crypto-contract-analyzer/
├─ src/
│  ├─ api/
│  │  └─ binance.ts
│  │
│  ├─ components/
│  │  ├─ chart/
│  │  │  ├─ KlineChart.vue
│  │  │  └─ VolumeChart.vue
│  │  │
│  │  ├─ analysis/
│  │  │  ├─ IndicatorPanel.vue
│  │  │  ├─ ScorePanel.vue
│  │  │  └─ TradePlanPanel.vue
│  │  │
│  │  ├─ risk/
│  │  │  └─ RiskCalculator.vue
│  │  │
│  │  └─ layout/
│  │     ├─ HeaderBar.vue
│  │     └─ MainLayout.vue
│  │
│  ├─ stores/
│  │  ├─ marketStore.ts
│  │  ├─ analysisStore.ts
│  │  └─ riskStore.ts
│  │
│  ├─ utils/
│  │  ├─ indicators.ts
│  │  ├─ scoring.ts
│  │  ├─ risk.ts
│  │  ├─ tradePlan.ts
│  │  └─ format.ts
│  │
│  ├─ types/
│  │  ├─ market.ts
│  │  ├─ analysis.ts
│  │  └─ risk.ts
│  │
│  ├─ App.vue
│  └─ main.ts
│
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tailwind.config.ts
└─ README.md

## 6. Binance公开接口

### K线数据
GET https://fapi.binance.com/fapi/v1/klines
参数: 
    symbol=BTCUSDT
    interval=15m
    limit=500
 
### 24小时行情    
GET https://fapi.binance.com/fapi/v1/ticker/24hr

### 最新价格   
GET https://fapi.binance.com/fapi/v1/ticker/price

### 资金费率  
GET https://fapi.binance.com/fapi/v1/premiumIndex

## 7. 状态管理设计

### marketStore
state:
- symbol
- interval
- klines
- ticker
- price
- fundingRate
- loading
- error

actions:
- fetchKlines()
- fetchTicker()
- fetchPrice()
- fetchFundingRate()
- refreshMarketData()

### analysisStore
state:
- ema20
- ema60
- ema120
- rsi
- macd
- atr
- trend
- momentum
- volatility
- longScore
- shortScore
- direction
- confidence
- reasons

actions:
- calculateIndicators()
- calculateScore()
- generateAnalysis()

### riskStore
state:
- balance
- riskPercent
- leverage
- direction
- entryPrice
- stopLoss
- takeProfit
- maxLoss
- positionValue
- marginRequired
- riskRewardRatio
- estimatedLiquidationPrice
- riskStatus

actions:
- calculateRisk()
- resetRisk()

## 8. 开发阶段

### Phase 1：项目初始化
创建 Vue 3 + Vite + TypeScript 项目
接入 Tailwind CSS
接入 Pinia
搭建基础布局

### Phase 2：接入 Binance 行情数据
获取 K线数据
获取当前价格
获取 24h 行情
获取资金费率
封装 API 请求

### Phase 3：K线图展示
使用 Lightweight Charts 绘制 K线
绘制成交量
绘制 EMA
支持币种/周期切换

### Phase 4：技术指标计算
EMA 计算
RSI 计算
MACD 计算
ATR 计算
成交量均线

### Phase 5：行情结构识别
趋势
动能
波动率
量价关系

### Phase 6：多空评分系统
基于指标计算评分
输出方向 + 置信度
输出原因

### Phase 7：风控计算器
仓位计算
风险收益比
杠杆风险提示
爆仓估算

### Phase 8：交易计划生成
输出：
    方向
    入场条件
    入场区间
    止损
    止盈
    仓位建议
    失效条件
    风险提示

### Phase 9：本地数据保存
localStorage / IndexedDB
保存用户配置
保存分析记录

### Phase 10：UI优化与测试
移动端适配
加载优化
错误处理
极端行情测试

## 9. 开发顺序

1. 项目初始化
2. API 封装
3. K线图
4. 技术指标
5. 分析面板
6. 多空评分
7. 风控计算
8. 交易计划
9. 本地存储
10. UI优化

## 10. 注意事项

不保存 API Key
只用公开接口
不做自动交易
不承诺盈利
必须包含止损
评分不明确 → 观望
接口异常 → 不生成计划