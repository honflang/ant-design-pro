# 14 — 分析报表 Analytics & Reporting

**路由**：`/reports/analytics`  
**组件路径**：`src/pages/reports/analytics/index.tsx`  
**菜单 i18n key**：`menu.reports.analytics`  
**所属用例**：数据分析需求、集中化平台需求

---

## 1. 页面目的

分析报表页面面向网点用户/产品经理，提供：
- 多维度收入与定价报表（按市场/产品/客群）
- 报表导出（Excel / PDF，Demo 中为 Mock 下载）
- 产能规划辅助数据（Capacity Planning）

演示价值：
- "Reporting module for branch users to generate, view and download reports"（数据分析需求）
- "Centralized system supporting pricing setups across all countries"（集中化平台）

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Analytics & Reporting                                            │
│ Generate and download reports for data analytics and planning   │
├──────────────────────────────────────────────────────────────────┤
│ Quick Reports                                                    │
│ [Revenue Summary] [Pricing Execution] [Invoice Summary]         │
│ [Deal Performance] [Tax Report] [Capacity Planning]             │
├──────────────────────────────────────────────────────────────────┤
│ Report Builder                                                   │
│ Report Type:  [Revenue Summary ▼]                               │
│ Period:       [2026-07 ▼]   Market: [All ▼]   Product: [All ▼] │
│ Group By:     [Market ▼]    Format: [Excel ▼]                   │
│                                          [Generate] [Download]  │
├──────────────────────────────────────────────────────────────────┤
│ Preview (Revenue Summary — 2026-07 — All Markets)               │
│                                                                  │
│ Market │ Product │ Clients │ Volume │ Revenue (SGD)│ YoY %     │
│ SG     │ Cash    │  42     │  8,400 │  892,450    │ +5.2%     │
│ HK     │ Cash    │  28     │  5,200 │  641,200    │ +2.1%     │
│ CN     │ Trade   │  31     │  4,100 │  534,800    │ +8.7%     │
│ ...                                                             │
├──────────────────────────────────────────────────────────────────┤
│ Recent Reports                                                   │
│ 2026-08-01 | Revenue Summary | 2026-07 | Excel | [Download]    │
│ 2026-07-15 | Tax Report      | 2026-Q2 | PDF   | [Download]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 快速报表入口 | `ProCard` + `Button.Group` 或卡片网格 | 6 个常用报表类型 |
| 报表构建器 | `ProForm` (inline layout) | 报表类型、时间、市场、产品、分组维度、导出格式 |
| 预览表格 | `ProTable` | 显示 Mock 数据，分页 |
| 近期报表 | `ProList` | 已生成的报表历史，含下载链接 |

---

## 4. Mock 数据结构

```typescript
// mock/reports.ts

type ReportType =
  | 'REVENUE_SUMMARY'
  | 'PRICING_EXECUTION'
  | 'INVOICE_SUMMARY'
  | 'DEAL_PERFORMANCE'
  | 'TAX_REPORT'
  | 'CAPACITY_PLANNING';

type ReportFormat = 'EXCEL' | 'PDF' | 'CSV';

interface ReportRequest {
  reportType: ReportType;
  period: string;           // '2026-07' 或 '2026-Q2'
  market?: string;          // 'All' 或具体市场
  product?: string;
  groupBy?: 'MARKET' | 'PRODUCT' | 'SEGMENT' | 'RM';
  format: ReportFormat;
}

interface ReportRecord {
  id: string;
  reportType: ReportType;
  period: string;
  market: string;
  generatedBy: string;
  generatedAt: string;
  format: ReportFormat;
  fileName: string;
  status: 'READY' | 'GENERATING' | 'FAILED';
}

// 报表预览行（以 Revenue Summary 为例）
interface RevenueSummaryRow {
  market: string;
  product: string;
  clients: number;
  volumeTransactions: number;
  revenue: number;
  currency: string;
  yoyChangePercent: number;
}
```

---

## 5. Mock API

```
# 生成报表（Demo：立即返回，status=READY）
POST   /api/reports/generate
  body: ReportRequest
  → ReportRecord

# 预览数据（返回 Mock 表格数据）
GET    /api/reports/preview
  params: reportType, period, market, product, groupBy, current, pageSize
  → { data: RevenueSummaryRow[] | ..., total: number }

# 下载（Mock：返回 200 + Content-Disposition，前端触发浏览器下载）
GET    /api/reports/:id/download → file (Mock 空文件 or 固定 Blob)

# 近期报表列表
GET    /api/reports/history
  params: current, pageSize
  → { data: ReportRecord[], total: number }
```

---

## 6. 业务逻辑

### 报表类型说明（展示在页面内 Tooltip 或 Description）

| 报表类型 | 说明 |
|---------|------|
| Revenue Summary | 按市场/产品汇总月度收入，含 YoY 对比 |
| Pricing Execution | 实际执行价格 vs 标准价格，展示折扣分布 |
| Invoice Summary | 发票统计：已开 / 未开 / 更正数量与金额 |
| Deal Performance | 各 Deal 的 Achievement Rate 汇总 |
| Tax Report | 按司法管辖区的税额汇总，用于税务申报参考 |
| Capacity Planning | 交易量、收入增长趋势，供产能规划用 |

### 下载（Demo 简化）
点击 "Download" 后，Mock 服务返回一个空 Excel 文件（或前端用 `Blob` 生成一个占位文件），触发浏览器下载。实际内容不需要真实数据。

---

## 7. 国际化 Key 列表

```
menu.reports.analytics

pages.reports.analytics.title
pages.reports.analytics.subTitle
pages.reports.analytics.quickReports.title
pages.reports.analytics.reportType.revenueSummary
pages.reports.analytics.reportType.pricingExecution
pages.reports.analytics.reportType.invoiceSummary
pages.reports.analytics.reportType.dealPerformance
pages.reports.analytics.reportType.taxReport
pages.reports.analytics.reportType.capacityPlanning
pages.reports.analytics.builder.title
pages.reports.analytics.builder.reportType
pages.reports.analytics.builder.period
pages.reports.analytics.builder.market
pages.reports.analytics.builder.product
pages.reports.analytics.builder.groupBy
pages.reports.analytics.builder.format
pages.reports.analytics.builder.generate
pages.reports.analytics.builder.download
pages.reports.analytics.preview.title
pages.reports.analytics.preview.col.market
pages.reports.analytics.preview.col.product
pages.reports.analytics.preview.col.clients
pages.reports.analytics.preview.col.volume
pages.reports.analytics.preview.col.revenue
pages.reports.analytics.preview.col.yoy
pages.reports.analytics.history.title
pages.reports.analytics.history.col.type
pages.reports.analytics.history.col.period
pages.reports.analytics.history.col.generatedAt
pages.reports.analytics.history.col.format
pages.reports.analytics.history.col.download
pages.reports.analytics.format.excel
pages.reports.analytics.format.pdf
pages.reports.analytics.format.csv
pages.reports.analytics.msg.generating
pages.reports.analytics.msg.ready
pages.reports.analytics.msg.failed
```

---

## 8. 文件结构

```
src/pages/reports/analytics/
├── index.tsx
├── data.d.ts
└── service.ts

mock/reports.ts
```
