# 07 — 计费执行 Billing Run

**路由**：`/billing/run`  
**组件路径**：`src/pages/billing/run/index.tsx`  
**菜单 i18n key**：`menu.billing.run`  
**所属用例**：UC-2、UC-3（第 7、8 点：费用重算、追溯交易）

---

## 1. 页面目的

计费执行页面展示每次计费批次（Billing Run）的触发、执行状态和结果。支持：
- 手动触发计费批次（模拟月结）
- 查看每次 Run 的计费明细（按客户、产品）
- 费用重算（Recalculation）：使用更新定价规则重算历史周期
- 追溯交易补计

演示价值：
- 端到端计费执行流程可见化
- 展示 Recalculation 能力（UC-3 第 7 点）
- 展示 Backdated Transaction 处理（UC-3 第 8 点）

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Billing Run                                                      │
│ Execute and monitor billing runs across markets                 │
├──────────────────────────────────────────────────────────────────┤
│ [Total Runs: 24]  [Completed: 20]  [In Progress: 1]  [Failed:1] │
│ [Total Billed MTD: SGD 2.4M]                                    │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Cycle ▼] [Status ▼] [Date Range]                   │
├──────────────────────────────────────────────────────────────────┤
│ Billing Runs                  [▶ Trigger New Run] [Recalculate] │
│                                                                  │
│ Run ID  │ Market │ Period │ Clients │ Amount (SGD) │ Status │... │
│ RUN-024 │ SG     │ 2026-07│  24     │  892,450     │ Done   │...│
│ RUN-023 │ HK     │ 2026-07│  18     │  641,200     │ Done   │...│
│ RUN-022 │ CN     │ 2026-07│  31     │  534,800     │ Done   │...│
│ RUN-020 │ SG     │ 2026-06│  24     │  878,300     │ Done   │...│
└──────────────────────────────────────────────────────────────────┘
```

Run 详情 Drawer：
```
┌────────────────────────────────────────────────────────────────┐
│ Billing Run RUN-024  Singapore | 2026-07       [Generate Invoice] │
│                                                                   │
│ Summary                                                           │
│ Total Clients: 24  |  Total Amount: SGD 892,450                   │
│ Products: Cash (52%), Trade (31%), FX (17%)                       │
│                                                                   │
│ Billing Details (by client)                                       │
│ Client  │ Product      │ Volume  │ Rate    │ Amount    │ Tax     │
│ ACME    │ Cash Mgmt    │ 1,200tx │ SGD 42  │ SGD 4,200 │ SGD 378│
│ ACME    │ Trade Finance│ SGD 5M  │ 0.20%   │ SGD10,000 │SGD 900 │
│                                                                   │
│ Backdated Transactions (2 items)                                  │
│ 2026-06-25  ACME  FX  USD/SGD  USD 500K  |  Recalculated ✓      │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 统计卡 | `StatisticCard.Group` | Total/Completed/InProgress/Failed/MTD Amount |
| Run 列表 | `ProTable` | 状态标记 Badge，可展开查看摘要 |
| 触发新 Run | `Modal` + `ProForm` | 选择 Market、Period、类型（普通/重算） |
| Run 详情 | `Drawer` + ProDescriptions + 内嵌 ProTable | 明细按客户/产品展开 |
| 追溯交易列表 | 嵌于详情 Drawer 的子 ProTable | 展示 backdate 补计情况 |
| 生成发票按钮 | `Button` → 跳转 `/billing/invoice` | 从 Run 直接发起开票 |

---

## 4. Mock 数据结构

```typescript
// mock/billing.ts (续)

type RunStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'RECALCULATED';
type RunType = 'REGULAR' | 'RECALCULATION' | 'BACKDATED';

interface BillingRun {
  id: string;                    // 'RUN-024'
  market: string;
  billingPeriod: string;         // '2026-07'
  runType: RunType;
  totalClients: number;
  totalAmountSGD: number;        // 折算后 SGD 金额（演示用）
  currency: string;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  // 重算关联
  originalRunId?: string;        // RECALCULATION 类型时指向原 Run
  recalcReason?: string;
  createdBy: string;
}

interface BillingLineItem {
  id: string;
  runId: string;
  clientId: string;
  clientName: string;
  product: string;
  volume: number;
  volumeUnit: string;           // 'TXN' | 'SGD' | 'USD'
  appliedRate: string;          // 可读字符串，如 'SGD 42/month' 或 '0.20%'
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  pricingRuleId: string;        // 关联的定价规则
  isBackdated: boolean;
  backdatedTxDate?: string;
}
```

---

## 5. Mock API

```
GET    /api/billing/runs                        → { data: BillingRun[], total: number }
GET    /api/billing/runs/:id                    → BillingRun
GET    /api/billing/runs/:id/line-items         → BillingLineItem[]

# 触发新计费 Run
POST   /api/billing/runs                        → BillingRun (status=IN_PROGRESS 后延迟切换为 COMPLETED)

# 重算
POST   /api/billing/runs/:id/recalculate
  body: { reason: string, applyBackdate: boolean }  → BillingRun (runType=RECALCULATION)
```

---

## 6. 业务逻辑

### 触发 Run（演示简化）
点击 "Trigger New Run" 后：
1. `POST /api/billing/runs` 返回 `status=IN_PROGRESS`
2. 前端 2 秒后自动轮询，Mock 返回 `status=COMPLETED`（模拟异步处理）
3. 刷新列表，新 Run 出现在顶部

### 费用重算（UC-3 第 7 点）
对已完成的 Run 点击 "Recalculate"，弹出 Modal 选择：
- 重算原因（下拉：Pricing Rule Updated / Discount Retroactively Applied / Volume Correction / ...）
- 是否包含追溯交易
生成新的 Run，`runType=RECALCULATION`，`originalRunId` 指向原 Run，对比展示金额差异。

### 追溯交易（UC-3 第 8 点）
Run 详情中展示 backdate 交易列表，说明换算逻辑：
```
Booking Date FX Rate: USD/SGD = 1.3456 (2026-06-25)
Backdated Amount: USD 500,000 → SGD 672,800
Max Backdate: 60 days (within policy)
```

---

## 7. 国际化 Key 列表

```
menu.billing.run

pages.billing.run.title
pages.billing.run.subTitle
pages.billing.run.triggerRun
pages.billing.run.recalculate
pages.billing.run.stat.total
pages.billing.run.stat.completed
pages.billing.run.stat.inProgress
pages.billing.run.stat.failed
pages.billing.run.stat.mtdAmount
pages.billing.run.col.runId
pages.billing.run.col.market
pages.billing.run.col.period
pages.billing.run.col.runType
pages.billing.run.col.clients
pages.billing.run.col.amount
pages.billing.run.col.status
pages.billing.run.col.completedAt
pages.billing.run.col.actions
pages.billing.run.runType.regular
pages.billing.run.runType.recalculation
pages.billing.run.runType.backdated
pages.billing.run.status.pending
pages.billing.run.status.inProgress
pages.billing.run.status.completed
pages.billing.run.status.failed
pages.billing.run.status.recalculated
pages.billing.run.detail.title
pages.billing.run.detail.lineItems
pages.billing.run.detail.backdated
pages.billing.run.detail.generateInvoice
pages.billing.run.detail.col.client
pages.billing.run.detail.col.product
pages.billing.run.detail.col.volume
pages.billing.run.detail.col.rate
pages.billing.run.detail.col.baseAmount
pages.billing.run.detail.col.taxAmount
pages.billing.run.detail.col.total
pages.billing.run.recalc.title
pages.billing.run.recalc.reason
pages.billing.run.recalc.includeBackdate
pages.billing.run.msg.triggered
pages.billing.run.msg.recalculated
```

---

## 8. 文件结构

```
src/pages/billing/run/
├── index.tsx
├── data.d.ts
└── service.ts

mock/billing.ts
```
