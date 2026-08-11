# 04 — 定价模拟工具 Pricing Simulation

**路由**：`/pricing/simulation`  
**组件路径**：`src/pages/pricing/simulation/index.tsx`  
**菜单 i18n key**：`menu.pricing.simulation`  
**所属用例**：UC-2（第 4 点）、UC-3（第 2 点）

---

## 1. 页面目的

定价模拟工具供客户经理/销售在**商务谈判前**快速测算不同定价方案的预期收入，支持多产品组合（Cash + Trade + FX）的联合模拟，并可将模拟结果一键发起审批。

演示价值：
- 展示 "Pre-deal simulation" 能力（UC-3 第 2 点）
- 多产品联合模拟（Cash & Trade & GM 组合，UC-2 第 2 点）
- 展示不同折扣/返佣方案对银行收入的影响

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Pricing Simulation                                               │
│ Simulate pricing scenarios and assess expected revenue          │
├──────────────────────┬──────────────────────────────────────────┤
│  Simulation Setup    │  Results                                 │
│  ─────────────────   │  ─────────────────────────────────────── │
│  Client: [ACME Corp▼]│  ┌─── Revenue Summary ───────────────┐  │
│  Market: [SG ▼]      │  │ Base Revenue    SGD 12,500/month   │  │
│                      │  │ Adjusted Rev.   SGD 10,625/month   │  │
│  Products:           │  │ Discount Applied        -15%       │  │
│  ☑ Cash Management   │  │ Net Margin Est.         68%        │  │
│  ☑ Trade Finance     │  └────────────────────────────────────┘  │
│  ☑ FX Services       │                                          │
│                      │  ┌─── Per Product Breakdown ──────────┐  │
│  Scenario:           │  │ Cash Mgmt  SGD 6,000  → SGD 5,100  │  │
│  Discount:  [-15% ▼] │  │ Trade Fin  SGD 5,000  → SGD 4,250  │  │
│  Rebate:    [None ▼]  │  │ FX Svc     SGD 1,500  → SGD 1,275  │  │
│  Volume:              │  └────────────────────────────────────┘  │
│  Est. Tx/month: [500] │                                          │
│                      │  ┌─── Scenario Comparison ────────────┐  │
│  [Run Simulation]    │  │ Scenario A  -10%  SGD 11,250       │  │
│  [Save as Draft]     │  │ Scenario B  -15%  SGD 10,625 ◀     │  │
│  [Submit for Aprv]   │  │ Scenario C  -20%  SGD 10,000       │  │
│                      │  └────────────────────────────────────┘  │
└──────────────────────┴──────────────────────────────────────────┘
│  Simulation History                         [Load Previous]     │
│  #SIM-001 | ACME Corp | -15% | SGD 10,625 | 2026-07-15        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 左侧设置面板 | `ProForm` (layout=vertical, noinline) | 客户选择、产品多选、折扣/返佣参数 |
| 右侧结果面板 | `ProCard` + `Statistic` | 收入汇总、Product Breakdown 表格 |
| 方案对比 | `ProCard` + `Table` | 多方案横向比较 |
| 历史记录 | `ProTable` 简化版 | 近 10 条模拟记录，可 Load |
| 提交审批按钮 | `Button` primary | 触发 POST /api/pricing/approval-requests |

---

## 4. Mock 数据结构

```typescript
// mock/pricing.ts (续)

interface SimulationRequest {
  clientId: string;
  market: string;
  products: string[];             // ['Cash Management', 'Trade Finance', 'FX Services']
  estimatedVolumePerMonth: number;
  discountPercent?: number;       // -10, -15, -20 等
  rebateType?: 'NONE' | 'VOLUME_BASED' | 'ONE_OFF';
  rebateThreshold?: number;
  specialConditions?: string;
}

interface SimulationResult {
  id: string;                     // 'SIM-001'
  request: SimulationRequest;
  baseRevenue: number;            // 应用折扣前的月度收入
  adjustedRevenue: number;        // 应用折扣/返佣后
  discountAmount: number;
  effectiveDiscountPercent: number;
  estimatedMarginPercent: number;
  currency: string;
  productBreakdown: ProductRevenue[];
  scenarios: ScenarioComparison[];
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
}

interface ProductRevenue {
  product: string;
  baseRevenue: number;
  adjustedRevenue: number;
}

interface ScenarioComparison {
  scenarioName: string;          // 'Scenario A'
  discountPercent: number;       // 10
  adjustedRevenue: number;
  isSelected: boolean;
}
```

---

## 5. Mock API

```
# 运行模拟（纯前端计算为主，接口返回基于参数的 Mock 结果）
POST   /api/pricing/simulations              → SimulationResult

# 保存草稿
POST   /api/pricing/simulations/draft        → SimulationResult

# 提交审批（保存并跳转至 /pricing/approval）
POST   /api/pricing/simulations/:id/submit   → { approvalRequestId: string }

# 历史记录
GET    /api/pricing/simulations              → { data: SimulationResult[], total: number }
GET    /api/pricing/simulations/:id          → SimulationResult
```

---

## 6. 业务逻辑

### 模拟计算逻辑（前端 Mock 计算）

```
baseRevenue = sum(product.standardRate × estimatedVolumePerMonth)
adjustedRevenue = baseRevenue × (1 - discountPercent / 100)
if (rebateType === 'VOLUME_BASED' && volume > rebateThreshold):
    adjustedRevenue -= rebateAmount
estimatedMarginPercent = adjustedRevenue / baseRevenue × 假设毛利率 (80%)
```

实际 Demo 中，计算在前端完成，调用 Mock API 仅用于保存/读取记录。

### 方案对比自动生成
点击 "Run Simulation" 后，自动生成 3 个场景：
- Scenario A：输入折扣 + 5%（较宽松）
- Scenario B：输入折扣（当前选择）
- Scenario C：输入折扣 - 5%（较紧）

### 提交审批
提交后跳转到 `/pricing/approval`，并高亮新建的审批申请。

---

## 7. 国际化 Key 列表

```
menu.pricing.simulation

pages.pricing.simulation.title
pages.pricing.simulation.subTitle
pages.pricing.simulation.form.client
pages.pricing.simulation.form.market
pages.pricing.simulation.form.products
pages.pricing.simulation.form.volume
pages.pricing.simulation.form.discount
pages.pricing.simulation.form.rebate
pages.pricing.simulation.form.conditions
pages.pricing.simulation.btn.run
pages.pricing.simulation.btn.saveDraft
pages.pricing.simulation.btn.submitApproval
pages.pricing.simulation.result.baseRevenue
pages.pricing.simulation.result.adjustedRevenue
pages.pricing.simulation.result.discountAmount
pages.pricing.simulation.result.discountPercent
pages.pricing.simulation.result.margin
pages.pricing.simulation.result.breakdown.title
pages.pricing.simulation.result.breakdown.product
pages.pricing.simulation.result.breakdown.base
pages.pricing.simulation.result.breakdown.adjusted
pages.pricing.simulation.scenarios.title
pages.pricing.simulation.scenarios.name
pages.pricing.simulation.scenarios.discount
pages.pricing.simulation.scenarios.revenue
pages.pricing.simulation.history.title
pages.pricing.simulation.history.load
pages.pricing.simulation.msg.runSuccess
pages.pricing.simulation.msg.savedDraft
pages.pricing.simulation.msg.submitted
```

---

## 8. 文件结构

```
src/pages/pricing/simulation/
├── index.tsx
├── data.d.ts
└── service.ts

mock/pricing.ts
```
