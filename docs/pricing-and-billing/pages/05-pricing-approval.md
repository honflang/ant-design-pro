# 05 — 审批工作流 Pricing Approval Workflow

**路由**：`/pricing-billing/pricing/approval`  
**组件路径**：`src/pages/pricing/approval/index.tsx`  
**菜单 i18n key**：`menu.pricing.approval`  
**所属用例**：UC-3（第 3 点）

---

## 1. 页面目的

展示基于规则的审批工作流，核心逻辑：
- **在预设风险门槛（Hurdle Rate / Threshold）内**的定价变更自动通过，无需人工审批
- 超出门槛的申请进入多级审批流程，支持产品级授权委托（Delegation）
- 审批人可在此页面查看待处理申请、审批通过/拒绝、查看申请详情

演示价值：
- 体现 Rule-based Approval Workflow（UC-2 第 5 点、UC-3 第 3 点）
- 展示 "auto-approve within threshold" 的智能化能力

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Pricing Approval                                                 │
│ Rule-based approval workflow with auto-approval thresholds      │
├──────────────────────────────────────────────────────────────────┤
│ [Pending: 3]  [Auto-Approved Today: 12]  [Approved: 45]         │
│ [Rejected: 4]                                                    │
├──────────────────────────────────────────────────────────────────┤
│ Threshold Rules (门槛规则说明横幅)                                 │
│ ≤ -10% → Auto Approve  |  -10% ~ -20% → L1 Approval            │
│ -20% ~ -30% → L2 Approval  |  > -30% → CFO Required            │
├──────────────────────────────────────────────────────────────────┤
│ [Status ▼] [Product ▼] [Requestor ▼] [Date Range] [Search]     │
├──────────────────────────────────────────────────────────────────┤
│ Approval Requests                        [Export]               │
│                                                                  │
│ ID     │ Subject    │ Discount│ Threshold│ Level │ Status  │... │
│ REQ-01 │ ACME -15%  │ -15%    │ Exceeded │ L1    │ Pending │... │
│ REQ-02 │ HSBC -8%   │ -8%     │ Within   │ Auto  │ Approved│... │
│ REQ-03 │ DBS  -25%  │ -25%    │ Exceeded │ L2    │ Pending │... │
└──────────────────────────────────────────────────────────────────┘
```

审批详情 Drawer：
```
┌──────────────────────────────────────────────────┐
│ Approval Request REQ-001           [Approve] [Reject] │
│                                                        │
│ Simulation Details   → ProDescriptions                │
│ Client / Product / Discount / Revenue Impact          │
│                                                        │
│ Threshold Check                                       │
│ Configured Threshold: -10%                            │
│ Requested Discount:   -15%  ← Exceeds threshold       │
│ Required Approval:    L1 Manager                      │
│                                                        │
│ Approval History                                      │
│ 2026-07-15  Submitted by john.doe                     │
│ 2026-07-15  Forwarded to L1 Approver                  │
│                                                        │
│ [Approve with Comment]  [Reject with Reason]          │
└──────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 统计卡 | `StatisticCard.Group` | Pending/Auto-Approved/Approved/Rejected 计数 |
| 门槛规则说明 | `ProCard` + `Steps` 或 `Tag` 组 | 静态展示阈值规则 |
| 申请列表 | `ProTable` | 支持状态筛选、快速操作 |
| 审批详情 | `Drawer` + `ProDescriptions` + `Steps`（审批历史） | 详情 + 历史时间线 |
| 审批操作 | `Modal.confirm` 含 `Input.TextArea`（备注） | 确认审批/拒绝 |

---

## 4. Mock 数据结构

```typescript
// mock/pricing.ts (续)

type ApprovalLevel = 'AUTO' | 'L1' | 'L2' | 'CFO';
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED' | 'WITHDRAWN';

interface ApprovalRequest {
  id: string;                   // 'REQ-001'
  simulationId: string;         // 关联 SimulationResult.id
  subject: string;              // 'ACME Corp Cash Management -15%'
  clientId: string;
  clientName: string;
  product: string;
  market: string;
  requestedDiscountPercent: number;
  baseRevenue: number;
  adjustedRevenue: number;
  currency: string;
  thresholdPercent: number;     // 该产品配置的门槛，如 -10
  thresholdExceeded: boolean;   // requestedDiscountPercent > thresholdPercent
  requiredApprovalLevel: ApprovalLevel;
  status: ApprovalStatus;
  currentApprover?: string;
  requestedBy: string;
  requestedAt: string;
  approvalHistory: ApprovalHistoryEntry[];
  comments?: string;
}

interface ApprovalHistoryEntry {
  action: 'SUBMITTED' | 'FORWARDED' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';
  actorName: string;
  actorRole: string;
  timestamp: string;
  comment?: string;
}
```

---

## 5. Mock API

```
GET    /api/pricing/approval-requests          → { data: ApprovalRequest[], total: number }
  params: status, product, market, requestedBy, dateFrom, dateTo, current, pageSize

GET    /api/pricing/approval-requests/:id      → ApprovalRequest

POST   /api/pricing/approval-requests/:id/approve
  body: { comment: string }                    → ApprovalRequest (status=APPROVED)

POST   /api/pricing/approval-requests/:id/reject
  body: { reason: string }                     → ApprovalRequest (status=REJECTED)

# 门槛配置（静态 Mock）
GET    /api/pricing/approval-thresholds        → ApprovalThreshold[]
```

---

## 6. 业务逻辑

### 自动审批逻辑（Mock 演示）
创建审批请求时，Mock 服务自动判断：

```
if abs(requestedDiscountPercent) <= thresholdPercent:
    status = 'AUTO_APPROVED'
    requiredApprovalLevel = 'AUTO'
    approvalHistory += { action: 'AUTO_APPROVED', actorName: 'System', ... }
else:
    status = 'PENDING'
    requiredApprovalLevel = calcLevel(discountPercent)
```

门槛规则（Mock 固定配置）：

| 折扣范围 | 审批级别 |
|---------|---------|
| ≤ 10% | AUTO（自动通过） |
| 10% ~ 20% | L1（部门经理） |
| 20% ~ 30% | L2（产品负责人） |
| > 30% | CFO |

### 产品级授权
不同产品的门槛不同（Cash Management 更宽松，FX 更严格），体现 "product-specific delegation"（UC-3 第 3 点）。

---

## 7. 国际化 Key 列表

```
menu.pricing.approval

pages.pricing.approval.title
pages.pricing.approval.subTitle
pages.pricing.approval.stat.pending
pages.pricing.approval.stat.autoApproved
pages.pricing.approval.stat.approved
pages.pricing.approval.stat.rejected
pages.pricing.approval.threshold.title
pages.pricing.approval.col.id
pages.pricing.approval.col.subject
pages.pricing.approval.col.client
pages.pricing.approval.col.product
pages.pricing.approval.col.discount
pages.pricing.approval.col.thresholdCheck
pages.pricing.approval.col.level
pages.pricing.approval.col.status
pages.pricing.approval.col.requestedBy
pages.pricing.approval.col.requestedAt
pages.pricing.approval.col.actions
pages.pricing.approval.threshold.within
pages.pricing.approval.threshold.exceeded
pages.pricing.approval.level.auto
pages.pricing.approval.level.l1
pages.pricing.approval.level.l2
pages.pricing.approval.level.cfo
pages.pricing.approval.status.pending
pages.pricing.approval.status.approved
pages.pricing.approval.status.rejected
pages.pricing.approval.status.autoApproved
pages.pricing.approval.status.withdrawn
pages.pricing.approval.action.approve
pages.pricing.approval.action.reject
pages.pricing.approval.action.view
pages.pricing.approval.detail.title
pages.pricing.approval.detail.history
pages.pricing.approval.detail.thresholdCheck
pages.pricing.approval.confirm.approveTitle
pages.pricing.approval.confirm.rejectTitle
pages.pricing.approval.confirm.commentLabel
pages.pricing.approval.confirm.reasonLabel
pages.pricing.approval.msg.approved
pages.pricing.approval.msg.rejected
pages.pricing.approval.msg.opFailed
```

---

## 8. 文件结构

```
src/pages/pricing/approval/
├── index.tsx
├── data.d.ts
└── service.ts

mock/pricing.ts
```
