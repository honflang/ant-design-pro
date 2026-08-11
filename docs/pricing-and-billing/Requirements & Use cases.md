# Pricing and Billing — Wholesale Banking Requirements & Use cases
## Requirements

### 定价管理  Pricing management

英文原文：

Pricing point setup across products, segments, geographies  
Pricing strategy, type (flat, tiered etc.), rebates, approval workflows  
Relationship based pricing for customized pricing approach  
Pricing Simulation Tool (for negotiations / proposals)  
Rule-based approval workflow (eg. With pre-defined thresholds and hurdle rates)

中文翻译：

跨产品、客群、地区的定价点设置  
定价策略与类型（固定费率、阶梯定价等）、返佣、审批工作流  
基于关系定价，实现定制化定价方案  
定价模拟工具（用于商务谈判/方案提案）  
基于规则的审批工作流（如预设门槛值和障碍利率）

### 计费管理  Billing Management

英文原文：

Billing consolidation across products, countries  
Configurable billing (e.g. billing cycle, charge account, etc.)  
Invoice / Billing reports delivery via e-channels in various formats (industry standards)

中文翻译：

跨产品、跨国家计费合并  
可配置计费（如计费周期、扣费账户等）  
通过电子渠道多格式（行业标准）交付发票/计费报告
### 绩效管理  Performance Management

英文原文：

Detect and stop revenue leakage  
Track pricing execution and alert management of under-performing deals/ revenue leakages  
Alerts to RM/Sales on customer performance

中文翻译：

检测并阻止收入流失  
追踪定价执行情况，就表现不佳的交易/收入流失向管理层预警  
向客户经理/销售团队发送客户绩效预警
### 客户管理  Customer Management

英文原文：

360 customer view  
Product recommendations using data analytics/Gen AI  
Optimize pricing for loyal and quality customers  
Deal performance monitoring and tracking

中文翻译：

360度客户全景视图  
利用数据分析/生成式AI进行产品推荐  
为优质和忠诚客户优化定价  
交易绩效监控与追踪

### 实时在线接口  Real-time online interfaces

英文原文：

System to have API integration capabilities to interface with product processing systems on real time basis.

中文翻译：

系统需具备API集成能力，与产品处理系统实现实时数据交互。
### 数据分析  Data Analytics

英文原文：

Reporting module for branch users to generate, view and download reports for data analytics, management reporting and capacity planning

中文翻译：

面向网点用户的报表模块，可生成、查看和下载报告，用于数据分析、管理报表和产能规划
### 集中化平台  Centralized Platform

英文原文：

Central system to support centralized pricing setups across all countries

中文翻译：

中央系统支持所有国家的集中化定价设置

## Objectives

| #   | 功能领域   | 目标（中文）                                                                                                                                |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 定价管理   | 支持所有国家集中化定价设置的中央系统  <br>灵活的定价与计费执行  <br>加快营销活动和产品捆绑的上市速度  <br>基于整体关系的产品与服务收费  <br>营销活动/交易/客户绩效追踪  <br>客户洞察与驾驶舱  <br>减少定价设置的延误，避免收费不准确 |
| 2   | 计费管理   | 为客户提供ISO标准的、合并的、明细的计费报告，覆盖所有已订阅银行产品                                                                                                   |
| 3   | 绩效管理   | 为客户经理/销售提供洞察，支持精准交叉销售/定价优化，最大化钱包份额  <br>就表现不佳的客户向客户经理/销售预警，以主动触达/复查交易定价                                                               |
| 4   | 客户管理   | 通过360度全景视图，在关系层面管理区域客户的定价与计费  <br>自动化设置与便捷维护  <br>集中查询功能，更好地服务客户                                                                      |
| 5   | 实时在线接口 | 确保定价系统与产品处理系统始终保持同步                                                                                                                   |
| 6   | 数据分析   | 通过实时资源管理和产能规划提升生产力                                                                                                                    |
| 7   | 集中化平台  | 作为统一的区域级系统运营                                                                                                                          |
## 业务用例 1：各市场的区域适配与合规 Regional Fit & Compliance for Markets

英文原文：

Demonstrate how the solution supports the diverse regions where operates. This should include:  
  
1. Localization capabilities (e.g., multi-language support)  
2. Handling of country-specific regulatory requirements such as Withholding Tax (WHT), VAT/GST, etc.  
3. Generation of compliant invoices (tax and non-tax) tailored to each jurisdiction  
  
Note: Focus on Asia-Pacific markets relevant to XXX; avoid examples from the US or Europe.

中文翻译：

展示解决方案如何支持 运营的多元化区域。应包括以下方面：
1. 本地化能力（如多语言支持）
2. 处理国家级监管要求，如预扣税（WHT）、增值税/商品服务税（VAT/GST）等
3. 生成合规发票（含税和非税），按各司法管辖区要求定制

> [!NOTE]
> 注意：聚焦与 相关的亚太市场；避免使用美国或欧洲的示例。

## 业务用例 2：灵活的定价配置 Flexible Pricing Configuration

英文原文：

Showcase the platform's flexibility in defining and managing pricing structures across different dimensions, including:  
  
1. Enterprise-wide pricing vs. targeted pricing (by client segments, client groups, or individual accounts)  
2. Configuration of product and service bundles (across multiple product e.g. Cash & Trade or GM)  
3. Execution of operational scenarios such as rebates (one off or based on arrangement), waivers (including transactional / ad hoc), or promotional pricing across selected client cohorts  
4. Bulk setup and configuration through data upload mechanisms  
5. ECR Pricing - configuration based on multi-currency accounts and increase /decrease in balances.  
6. Demonstrate how charges are calculated including rule definitions, rule hierarchy (precedence), step-by-step calculation and final billing output with explanations

中文翻译：

展示平台在不同维度上定义和管理定价结构的灵活性，包括：
1. 企业级定价 vs. 定向定价（按客户分群、客户组或个别账户）
2. 产品和服务捆绑配（跨多种产品，如现金管理与贸易融资或全球市场）
3. 运营场景执行，如返佣（一次性或基于协议安排）、减免（含交易级/临时性）、或针对选定客户群的促销定价
4. 批量设置与配置，通过数据上传机制实现
5. ECR 定价（评估信贷比率定价）— 基于多币种账户及余额增减进行配置
6. 展示费用计算过程，包括规则定义、规则层级（优先级）、分步计算过程以及最终计费输出及说明

## 业务用例 3：交易定价、模拟与收入追踪 Deal Pricing, Simulation & Revenue Tracking

英文原文：

Illustrate how the system supports advanced commercial constructs, including:  
  
1. Creation and management of deal-based pricing rules  
2. Pre-deal simulation to assess pricing scenarios and expected revenue outcomes (across multiple product e.g. Cash, Trade & GM)  
3. Demonstration of approval workflow with product-specific delegation. Approvals are not required should the deal be within a defined risk threshold.  
4. Support for relationship-based pricing across client portfolios  
5. Ongoing revenue tracking and performance monitoring against deal structures  
6. Invoicing - On demand invoicing capability / Capability to correct the invoice generated and re-generate corrected invoice  
7. Recalculation of charges  
   Recalculate past charges using updated pricing rules  
   Apply discounts/waivers that were not applied at billing time  
   Apply new contractual terms to existing billing periods  
   Correct billing based on actual volumes vs estimated tiers  
   Adjust pricing based on final profitability metrics  
   Recalculate pricing across multiple client entities  
   Recalculate pricing when bundle conditions are met later.  
8. Backdated Transactions - for billing are in local currency (eg. Transactions in IDR,CNY,BHT. Billing currency is SGD) / backdated transactions not in local currency / Maximum back-date allowed for re-calculation.

中文翻译：

展示系统如何支持高级商业架构，包括：
1. 交易级定价规则的创建与管理
2. 交易前模拟，评估定价场景和预期收入结果（跨多种产品，如现金管理、贸易融资和全球市场）
3. 审批工作流演示，含产品级授权。若交易在预设风险门槛内则无需审批。
4. 支持跨客户组合的关系定价
5. 持续收入追踪与绩效监控，对照交易结构进行
6. 开票能力 — 按需开票功能 / 已生成发票的更正与重新生成功能
7. 费用重算（Recalculation of charges）
   使用更新后的定价规则重算历史费用补计在计费时未应用的折扣/减免将新的合同条款应用于已有计费周期基于实际交易量修正估算阶梯的计费基于最终盈利指标调整定价跨多个客户实体重算定价当捆绑条件后续满足时重算定价
8. 追溯交易 — 计费以本地货币计（如交易以印尼盾IDR、人民币CNY、泰铢BHT计，计费货币为新元SGD）/ 非本地货币的追溯交易 / 允许重算的最大追溯天数。

## 业务用例 4：实施方法与过渡策略 Implementation Approach & Transition Strategy

英文原文：

Outline a pragmatic implementation roadmap, including:  
  
1. Approach for data migration and transfer of existing pricing/billing configurations.  
2. Methods to ensure continuity, including parallel run strategies.  
3. Safeguards to minimize disruption and ensure no client impact during transition.

中文翻译：

概述务实的实施路线图，包括：
1. 数据迁移方法，以及现有定价/计费配置的转移方案。
2. 确保业务连续性的方法，包括新旧系统并行运行策略。
3. 保障措施，最大限度减少干扰，确保过渡期间对客户零影响。