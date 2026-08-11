# 03 — 定价规则 Pricing Rules

**路由**：`/pricing/rules`  
**组件路径**：`src/pages/pricing/rules/index.tsx`  
**菜单 i18n key**：`menu.pricing.rules`  
**所属用例**：UC-2 灵活定价配置

---

## 1. 页面目的

定价规则是定价体系的执行层，将价格手册中的标准价格点**与特定客户/客群/交易关联**，并叠加规则层级（优先级）、返佣、减免等调整因子，最终由计费引擎按规则优先级计算实际费用。

演示价值：
- 展示规则定义、规则层级（优先级）概念（UC-2 第 6 点）
- 展示返佣、减免、促销定价的配置方式（UC-2 第 3 点）
- 联动价格手册，体现"从标准到定制"的定价链路

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Pricing Rules                                                    │
│ Define and manage pricing rules with hierarchy and adjustments  │
├──────────────────────────────────────────────────────────────────┤
│ [Total Rules: 48]  [Enterprise Rules: 12]  [Client Rules: 28]   │
│ [Segment Rules: 8]                                               │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Product ▼] [Rule Type ▼] [Status ▼] [Search]       │
├──────────────────────────────────────────────────────────────────┤
│ Rule Hierarchy (优先级说明横幅)                                   │
│ Enterprise-wide (P1) → Segment (P2) → Client Group (P3)         │
│                       → Individual Account (P4) [最高优先]       │
├──────────────────────────────────────────────────────────────────┤
│ Pricing Rules                          [+ Add Rule]              │
│                                                                   │
│ Priority│ Rule Name │ Product │ Scope │ Adj. Type│Rate│Status│..│
│ P1      │ Corp Base │ Cash    │ All   │ Standard │-   │Active│..│
│ P4      │ ACME Deal │ Cash    │ ACME  │ Discount │-5% │Active│..│
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 统计卡 | `StatisticCard.Group` | 总规则数、Enterprise/Segment/Client 分类统计 |
| 规则层级说明 | `ProCard` + `Steps` 横向 | 静态展示优先级链路 P1→P4 |
| 规则列表 | `ProTable` | 支持 Priority 排序、多维度筛选 |
| 新增/编辑 | `Drawer` + `ProForm` | 分 5 个 Section |
| 规则详情 | `Drawer` + `ProDescriptions` + 计算说明 | 展示规则定义 + Step-by-step 计算示例 |

---

## 4. Mock 数据结构

```typescript
// mock/pricing.ts (续)

type RuleScope = 'ENTERPRISE' | 'SEGMENT' | 'CLIENT_GROUP' | 'INDIVIDUAL';
type AdjustmentType = 'STANDARD' | 'DISCOUNT' | 'SURCHARGE' | 'REBATE' | 'WAIVER' | 'PROMOTIONAL';

interface PricingRule {
  id: string;
  ruleName: string;
  ruleCode: string;
  product: string;
  market: string;
  scope: RuleScope;              // 规则适用范围
  priority: number;              // 1=最低(企业级), 4=最高(个人账户)
  // 关联的价格手册条目
  pricePointId: string;
  pricePointName: string;
  // 调整
  adjustmentType: AdjustmentType;
  adjustmentValue?: number;      // 正数=加收，负数=折扣
  adjustmentUnit?: 'PERCENT' | 'ABSOLUTE'; // -5 PERCENT = 95% of base
  // 适用对象
  targetClientId?: string;       // scope=INDIVIDUAL 时使用
  targetSegment?: string;        // scope=SEGMENT 时使用
  targetClientGroup?: string;    // scope=CLIENT_GROUP 时使用
  // 返佣/减免特定字段
  rebateThreshold?: number;      // 触发返佣的交易量门槛
  waiverCondition?: string;      // 减免条件描述
  promotionEndDate?: string;     // 促销结束日期
  // 周期
  effectiveFrom: string;
  effectiveTo?: string;
  // 批量上传标记
  uploadBatch?: string;          // 批次号，若通过批量上传创建
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'EXPIRED';
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  updatedBy: string;
  updatedAt: string;
}
```

**Mock 数据示例**：

| Priority | Scope | Product | Adjustment |
|----------|-------|---------|------------|
| P1 | ENTERPRISE | Cash Management | Standard (Base Rate) |
| P2 | SEGMENT (Corporate) | Cash Management | -5% Discount |
| P3 | CLIENT_GROUP (Premium) | Trade Finance | -10% Discount |
| P4 | INDIVIDUAL (ACME Corp) | Cash Management | -15% Deal Rate |
| P2 | SEGMENT (SME) | FX Services | +0.05% Surcharge |
| P1 | ENTERPRISE | Trade Finance | Standard (Base Rate) |

---

## 5. Mock API

```
GET    /api/pricing/rules                     → { data: PricingRule[], total: number }
  params: market, product, scope, status, keyword, current, pageSize

POST   /api/pricing/rules                     → PricingRule
PUT    /api/pricing/rules/:id                 → PricingRule
PATCH  /api/pricing/rules/:id/status          → PricingRule
GET    /api/pricing/rules/:id                 → PricingRule

# 批量上传（演示用，不做真实文件解析，返回固定 Mock 结果）
POST   /api/pricing/rules/bulk-upload         → { imported: number, failed: number, batchId: string }
```

---

## 6. 业务逻辑

### 规则优先级（Rule Hierarchy）
规则优先级遵循"越具体越优先"原则：

```
优先级  范围              典型场景
P1      Enterprise-wide   所有客户的基础费率
P2      Segment           Corporate / SME 客群折扣
P3      Client Group      VIP 客户组专属费率
P4      Individual        单一客户的 Deal 定价（最高优先级）
```

计费时系统取**最高优先级（Priority 数值最大）**的有效规则。

### Step-by-step 计算展示
在规则详情中展示计算推导链（UC-2 第 6 点）：

```
Step 1: 查找适用的 Price Point   → Cash Management @ SGD 50/month
Step 2: 匹配规则层级             → P4 个人规则（-15% Discount）生效
Step 3: 应用调整                 → SGD 50 × (1 - 15%) = SGD 42.50
Step 4: 应用税务规则             → GST 9% → SGD 42.50 × 1.09 = SGD 46.33
Step 5: 最终计费金额             → SGD 46.33
```

### 批量上传
Demo 中不做真实 CSV 解析，点击"批量上传"后展示一个 Upload 组件，上传任意文件后返回固定的 Mock 导入结果（导入成功 N 条、失败 M 条）。

---

## 7. 国际化 Key 列表

```
menu.pricing.rules

pages.pricing.rules.title
pages.pricing.rules.subTitle
pages.pricing.rules.addRule
pages.pricing.rules.bulkUpload
pages.pricing.rules.stat.total
pages.pricing.rules.stat.enterprise
pages.pricing.rules.stat.segment
pages.pricing.rules.stat.client
pages.pricing.rules.hierarchy.title
pages.pricing.rules.col.priority
pages.pricing.rules.col.ruleName
pages.pricing.rules.col.ruleCode
pages.pricing.rules.col.product
pages.pricing.rules.col.market
pages.pricing.rules.col.scope
pages.pricing.rules.col.adjustmentType
pages.pricing.rules.col.adjustmentValue
pages.pricing.rules.col.effectiveFrom
pages.pricing.rules.col.status
pages.pricing.rules.col.approvalStatus
pages.pricing.rules.col.actions
pages.pricing.rules.scope.enterprise
pages.pricing.rules.scope.segment
pages.pricing.rules.scope.clientGroup
pages.pricing.rules.scope.individual
pages.pricing.rules.adjType.standard
pages.pricing.rules.adjType.discount
pages.pricing.rules.adjType.surcharge
pages.pricing.rules.adjType.rebate
pages.pricing.rules.adjType.waiver
pages.pricing.rules.adjType.promotional
pages.pricing.rules.calcSteps.title
pages.pricing.rules.form.section.scope
pages.pricing.rules.form.section.pricePoint
pages.pricing.rules.form.section.adjustment
pages.pricing.rules.form.section.period
pages.pricing.rules.msg.created
pages.pricing.rules.msg.updated
pages.pricing.rules.msg.bulkImported
```

---

## 8. 文件结构

```
src/pages/pricing/rules/
├── index.tsx
├── data.d.ts
└── service.ts

mock/pricing.ts        ← 与 price-book 共用同一文件
```
