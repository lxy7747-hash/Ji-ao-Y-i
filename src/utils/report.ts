import type { AnalysisRecord, BacktestResult, StructureAnalysis, TimeframeConsensus } from '../types/analysis'
import type { TradePlan } from '../types/risk'
import { formatPrice } from './format'

export function buildMarkdownReport(params: {
  latest: AnalysisRecord
  structure: StructureAnalysis
  consensus: TimeframeConsensus
  backtest: BacktestResult
  plan: TradePlan
}) {
  const { latest, structure, consensus, backtest, plan } = params
  return [
    `# ${latest.symbol} 合约分析报告`,
    '',
    `- 周期：${latest.interval}`,
    `- 价格：${formatPrice(latest.price)}`,
    `- 方向：${latest.direction}`,
    `- 置信度：${latest.confidence}%`,
    `- 多头/空头评分：${latest.longScore}/${latest.shortScore}`,
    '',
    '## 支撑压力',
    `- 最近支撑：${structure.nearestSupport ? formatPrice(structure.nearestSupport.price) : '无'}`,
    `- 最近压力：${structure.nearestResistance ? formatPrice(structure.nearestResistance.price) : '无'}`,
    '',
    '## 多周期共振',
    `- 综合方向：${consensus.bias}`,
    `- 一致度：${consensus.agreement}%`,
    `- 结论：${consensus.summary}`,
    '',
    '## 简易回测',
    `- 交易次数：${backtest.trades}`,
    `- 胜率：${backtest.winRate}%`,
    `- 累计收益：${backtest.totalReturnPercent}%`,
    `- 最大回撤：${backtest.maxDrawdownPercent}%`,
    `- 盈亏因子：${backtest.profitFactor}`,
    '',
    '## 交易计划',
    `- 入场条件：${plan.entryCondition}`,
    `- 入场区间：${plan.entryRange}`,
    `- 止损：${formatPrice(plan.stopLoss)}`,
    `- 止盈：${formatPrice(plan.takeProfit)}`,
    `- 失效条件：${plan.invalidation}`,
    '',
    '> 本报告仅基于公开行情数据和本地规则生成，不构成投资建议。',
  ].join('\n')
}
