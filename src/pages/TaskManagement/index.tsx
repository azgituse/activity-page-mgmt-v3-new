import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Modal,
  Row,
  Col,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  CheckSquareOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { mockMarketingTasks } from '../../mock/pageManagement';
import type { MarketingTask } from '../../mock/pageManagement';

const { Title, Text } = Typography;
const { Option } = Select;

export default function TaskManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MarketingTask | null>(null);

  // 自动打开从页面详情跳转来的配置
  useEffect(() => {
    const openTaskId = localStorage.getItem('openTaskModal');
    if (openTaskId) {
      const task = mockMarketingTasks.find(t => t.id === openTaskId);
      if (task) {
        setSelectedTask(task);
        setModalVisible(true);
      }
      localStorage.removeItem('openTaskModal');
    }
  }, []);

  // 筛选数据
  const filteredData = mockMarketingTasks.filter(task => {
    const matchSearch = task.name.includes(searchText) || task.taskId.includes(searchText);
    const matchType = typeFilter ? task.type === typeFilter : true;
    const matchStatus = statusFilter ? task.status === statusFilter : true;
    return matchSearch && matchType && matchStatus;
  });

  const handleBack = () => {
    const sourcePageId = localStorage.getItem('sourcePageId');
    if (sourcePageId) {
      navigate(`/pages/detail/${sourcePageId}`);
      localStorage.removeItem('sourcePageId');
    } else {
      navigate('/ai-create');
    }
  };

  const handleEdit = (task: MarketingTask) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '任务ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 120,
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <CheckSquareOutlined style={{ color: '#52c41a' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          order: { color: 'blue', text: '下单' },
          browse: { color: 'cyan', text: '浏览' },
          share: { color: 'purple', text: '分享' },
          signin: { color: 'green', text: '签到' },
          invite: { color: 'orange', text: '邀请' },
        };
        const { color, text } = typeMap[type] || { color: 'default', text: type };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '起止时间',
      key: 'timeRange',
      width: 200,
      render: (_: any, record: MarketingTask) => (
        <span style={{ fontSize: 12, color: '#666' }}>
          {record.aiDraftConfig?.startTime?.split(' ')[0]} ~ {record.aiDraftConfig?.endTime?.split(' ')[0]}
        </span>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          active: { color: 'success', text: '进行中' },
          pending: { color: 'warning', text: '待开始' },
          ended: { color: 'default', text: '已结束' },
          draft: { color: 'processing', text: '草稿' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '奖励类型',
      key: 'rewardType',
      width: 120,
      render: (_: any, record: MarketingTask) => {
        const rewardType = record.aiDraftConfig?.rewardConfig?.rewardType;
        return rewardType === 'play_chance' ? (
          <Tag color="blue">参与机会</Tag>
        ) : rewardType === 'coupon' ? (
          <Tag color="orange">优惠券</Tag>
        ) : (
          <Tag>无</Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: MarketingTask) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 顶部导航 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回详情
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              营销任务管理
            </Title>
          </Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新增任务
          </Button>
        </div>
      </Card>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <Space>
            <Text type="secondary">任务名称/ID:</Text>
            <Input
              placeholder="请输入"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
          </Space>
          <Space>
            <Text type="secondary">任务类型:</Text>
            <Select
              placeholder="全部"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="order">下单</Option>
              <Option value="browse">浏览</Option>
              <Option value="share">分享</Option>
              <Option value="signin">签到</Option>
              <Option value="invite">邀请</Option>
            </Select>
          </Space>
          <Space>
            <Text type="secondary">执行状态:</Text>
            <Select
              placeholder="全部"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="active">进行中</Option>
              <Option value="pending">待开始</Option>
              <Option value="ended">已结束</Option>
              <Option value="draft">草稿</Option>
            </Select>
          </Space>
          <Button type="primary">查询</Button>
          <Button>重置</Button>
        </Space>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 营销任务配置弹窗 */}
      <Modal
        title={selectedTask ? `营销任务 - ${selectedTask.name}` : '营销任务'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            message.success('营销任务配置已保存');
            setModalVisible(false);
          }}>
            保存
          </Button>,
        ]}
      >
        {selectedTask?.aiDraftConfig && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 基础信息 */}
            <Card size="small" title={<Text strong>基础信息</Text>}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text type="secondary">任务名称</Text>
                  <Input value={selectedTask.aiDraftConfig.taskName} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <Text type="secondary">任务类型</Text>
                  <Select value={selectedTask.aiDraftConfig.taskType} style={{ width: '100%', marginTop: 4 }}>
                    <Option value="order">下单任务</Option>
                    <Option value="browse">浏览任务</Option>
                    <Option value="share">分享任务</Option>
                    <Option value="signin">签到任务</Option>
                    <Option value="invite">邀请任务</Option>
                  </Select>
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">开始时间</Text>
                    <Input value={selectedTask.aiDraftConfig.startTime} style={{ marginTop: 4 }} />
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">结束时间</Text>
                    <Input value={selectedTask.aiDraftConfig.endTime} style={{ marginTop: 4 }} />
                  </Col>
                </Row>
                <div>
                  <Text type="secondary">会员范围</Text>
                  <Select value={selectedTask.aiDraftConfig.memberScope} style={{ width: '100%', marginTop: 4 }}>
                    <Option value="all">全部会员</Option>
                    <Option value="vip">VIP会员</Option>
                    <Option value="card">持卡会员</Option>
                    <Option value="level">等级会员</Option>
                  </Select>
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">每日次数限制</Text>
                    <Input value={selectedTask.aiDraftConfig.dailyLimit} style={{ marginTop: 4 }} />
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">总次数限制</Text>
                    <Input value={selectedTask.aiDraftConfig.totalLimit} style={{ marginTop: 4 }} />
                  </Col>
                </Row>
              </Space>
            </Card>

            {/* 任务规则 */}
            <Card size="small" title={<Text strong>任务规则</Text>}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text type="secondary">完成点击事件</Text>
                  <Select value={selectedTask.aiDraftConfig.taskRules.triggerType} style={{ width: '100%', marginTop: 4 }}>
                    <Option value="link">跳转链接</Option>
                    <Option value="share">分享</Option>
                    <Option value="page">访问页面</Option>
                    <Option value="subscribe">订阅消息</Option>
                  </Select>
                </div>
                {selectedTask.aiDraftConfig.taskRules.targetPage && (
                  <div>
                    <Text type="secondary">目标页面</Text>
                    <Input value={selectedTask.aiDraftConfig.taskRules.targetPage} style={{ marginTop: 4 }} />
                  </div>
                )}
              </Space>
            </Card>

            {/* 任务奖励 */}
            <Card size="small" title={<Text strong>任务奖励</Text>}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text type="secondary">奖励类型</Text>
                  <Select value={selectedTask.aiDraftConfig.rewardConfig.rewardType} style={{ width: '100%', marginTop: 4 }}>
                    <Option value="play_chance">参与机会</Option>
                    <Option value="coupon">优惠券</Option>
                  </Select>
                </div>
                {selectedTask.aiDraftConfig.rewardConfig.playChance && (
                  <div>
                    <Text type="secondary">获得玩法参与次数</Text>
                    <Input value={selectedTask.aiDraftConfig.rewardConfig.playChance.chanceCount} style={{ marginTop: 4 }} />
                  </div>
                )}
              </Space>
            </Card>
          </Space>
        )}
      </Modal>
    </div>
  );
}
