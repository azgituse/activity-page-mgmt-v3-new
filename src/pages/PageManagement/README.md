# 活动页面管理

## 导航结构
- 顶部导航：策略实验室 | 标签智库 | 事件管理 | 产品实验 | 营销策略 | 消息中心 | 成本中心 | OA流程审核 | AI任务后台 | AI建券 | 活动页面（当前）
- 左侧菜单：ACTIVITY PAGE | 页面管理

## 功能点
- 页面草稿接收：接收AI任务后台推送的活动页面草稿
- 草稿列表展示：展示所有页面（草稿+已发布），支持筛选
- 草稿检查：查看草稿详情、编辑草稿内容
- 草稿发布：检查通过后正式发布草稿

## 数据字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| pageId | string | 页面ID（草稿显示"待生成"） |
| pageName | string | 页面名称 |
| sourceTask | string | 来源任务编号 |
| sourceTaskName | string | 来源任务名称 |
| relatedPlay | string | 关联玩法 |
| relatedCoupon | string | 关联优惠券 |
| status | enum | 状态：草稿/已发布 |
| aiDraftStatus | enum | AI草稿状态：待确认/已确认 |
| createTime | datetime | 创建时间 |
| publisher | string | 发布人 |
| publishTime | datetime | 发布时间 |

## 交互说明
- 列表页展示所有页面，草稿状态的可编辑和发布
- 点击"查看详情"进入详情页
- 详情页展示页面配置信息，支持编辑
- 点击"发布"需要确认弹窗，发布后页面正式可用
