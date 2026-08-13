你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Revenue Tracking（收入追踪）**

重点展示定价执行后的收入表现、偏差预警和 revenue leakage 检测能力。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Revenue Tracking（收入追踪）**

页面。

需要体现以下业务概念：

* MTD Revenue Monitoring（月度收入监控）
* Market / Product Breakdown（按市场与产品分解）
* Contracted vs Actual（合同收入 vs 实际收入）
* Revenue Leakage Detection（收入流失识别）
* Alerting & Acknowledgement（预警与确认）
* Trend Analysis（趋势分析）

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Performance Management
  └── Revenue Tracking
```

建议路由：

```text
/pricing-billing/performance/revenue
```

---

## 四、页面总体结构

页面采用：

> StatisticCard + ProCard + Chart + ProTable

布局。

整体示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Revenue Tracking                                                 │
│ Monitor pricing execution and detect revenue leakage            │
├──────────────────────────────────────────────────────────────────┤
│ [MTD Revenue] [vs Last Month] [Active Alerts] [Leakage Est.]   │
├────────────────────────────┬────────────────────────────────────┤
│ Revenue by Market          │ Revenue by Product                 │
├────────────────────────────┴────────────────────────────────────┤
│ Revenue Alerts                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Revenue Performance Table                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 五、Mock 数据

至少覆盖：

* 5 个市场收入分布（SG/HK/CN/JP/AU）
* 3 个产品收入分布（Cash/Trade/FX）
* 多条预警（HIGH/MEDIUM/LOW）
* 合同与实际偏差样例（正偏差/负偏差）

---

## 六、列表字段

Revenue Performance 表至少包含：

1. Client
2. Market
3. Product
4. Contracted Amount
5. Actual Amount
6. Variance Amount
7. Variance Percent
8. Currency
9. Performance Status
10. Deal ID
11. Actions

Revenue Alert 列表至少包含：

1. Alert ID
2. Client
3. Alert Type
4. Description
5. Contracted
6. Actual
7. Variance
8. Urgency
9. Status
10. Detected At
11. Actions

Actions：

```text
View
Acknowledge
```

---

## 七、新增 / 编辑（预警处理）

该页核心是监控与处理，不强调新增主数据。

需要支持：

### 1. Acknowledge Alert

```text
Acknowledge with Comment
```

### 2. Optional Resolve（可选）

```text
Mark as Resolved
```

用于展示预警处置流程。

---

## 八、Revenue Detail

建议支持详情 Drawer，使用：

> ProDescriptions + Trend Chart + Table

展示：

```text
Revenue Overview
Contracted vs Actual Breakdown
6-Month Trend
Applied Pricing Context
Related Alerts
```

并增加：

### Leakage Analysis Preview

```text
Expected Revenue
Actual Revenue
Estimated Leakage
Primary Drivers
```

---

## 九、页面顶部增加区域概览

建议统计卡：

```text
MTD Revenue
Month-over-month Change
Active Alerts
Estimated Leakage
Deal Achievement
```

---

## 十、与 Deal Performance / Pricing 的业务关系

页面需体现：

> Pricing 决定目标收入，Revenue Tracking 验证执行结果，并把异常反馈给 Deal 管理与规则优化。

流程建议：

```text
Pricing Setup
   ↓
Billing & Invoice Outcome
   ↓
Revenue Tracking
   ↓
Leakage Alert
   ↓
Deal / Rule Optimization
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface RevenueAlert {
  id: string;
  clientName: string;
  market: string;
  product: string;
  alertType: 'VOLUME_BELOW_TARGET' | 'RATE_BELOW_DEAL' | 'REVENUE_LEAKAGE' | 'DEAL_UNDERPERFORMANCE';
  contractedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  detectedAt: string;
}
```

Mock API：

```text
GET    /api/performance/revenue/overview
GET    /api/performance/revenue/by-market
GET    /api/performance/revenue/by-product
GET    /api/performance/revenue/trend
GET    /api/performance/revenue/alerts
PATCH  /api/performance/revenue/alerts/:id/acknowledge
GET    /api/performance/revenue/performance
```

---

## 十二、技术要求

必须遵循当前项目已有技术栈：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProTable
* ProCard
* 现有图表方案（项目已用方案优先）

不要引入新的 UI framework。不要升级依赖。

---

## 十三、交互要求

至少实现：

### 查询

```text
Period
Market
Product
Status
Keyword
```

### 预警确认

Acknowledge → 更新状态并刷新统计卡。

### 查看详情

View → Revenue Detail Drawer（含趋势与偏差分析）。

### 指标筛选联动

顶部筛选条件应联动图表、预警区和明细表。

---

## 十四、Demo 重点

这个页面不是为了展示“报表页面”，而是为了向银行客户展示：

> **可持续监控定价执行质量并及时识别收入流失。**

建议突出：

```text
Pricing Execution
        ↓
Revenue Visibility
        ↓
Leakage Detection
        ↓
Actionable Alerts
```

---

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有图表与表格的实现风格。
5. 检查现有 Mock 数据组织方式。
6. 尽可能复用已有组件和代码模式。

然后实现：

* 页面
* 路由
* 菜单
* Mock 数据
* 查询
* 图表展示
* 预警列表
* 预警确认
* 明细对比
* Leakage Analysis Preview

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实 BI 数据仓库、真实告警平台、真实后端 API。当前目标是可用于客户演示的高质量 Demo。**
