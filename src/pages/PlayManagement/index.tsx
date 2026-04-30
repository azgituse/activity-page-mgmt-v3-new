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
  Switch,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  RocketOutlined,
  GiftOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { mockPlays } from '../../mock/pageManagement';
import type { PlayMethod } from '../../mock/pageManagement';

const { Title, Text } = Typography;
const { Option } = Select;

export default function PlayManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState<PlayMethod | null>(null);

  // 自动打开从页面详情跳转来的配置
  useEffect(() => {
    const openPlayId = localStorage.getItem('openPlayModal');
    if (openPlayId) {
      const play = mockPlays.find(p => p.id === openPlayId);
      if (play) {
        setSelectedPlay(play);
        setModalVisible(true);
      }
      localStorage.removeItem('openPlayModal');
    }
  }, []);

  // 筛选数据
  const filteredData = mockPlays.filter(play => {
    const matchSearch = play.name.includes(searchText) || play.playId.includes(searchText);
    const matchType = typeFilter ? play.type === typeFilter : true;
    const matchStatus = statusFilter ? play.status === statusFilter : true;
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

  const handleEdit = (play: PlayMethod) => {
    setSelectedPlay(play);
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
      title: '玩法ID',
      dataIndex: 'playId',
      key: 'playId',
      width: 120,
    },
    {
      title: '玩法名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, _record: PlayMethod) => (
        <Space>
          <RocketOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '玩法类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          lottery: { color: 'blue', text: '抽奖' },
          seckill: { color: 'red', text: '秒杀' },
          game: { color: 'purple', text: '游戏' },
          coupon: { color: 'orange', text: '领券' },
          signin: { color: 'green', text: '签到' },
          shake: { color: 'cyan', text: '摇一摇' },
        };
        const { color, text } = typeMap[type] || { color: 'default', text: type };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '起止时间',
      key: 'timeRange',
      width: 200,
      render: (_: any, record: PlayMethod) => (
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
      title: '关联优惠券',
      key: 'coupons',
      width: 150,
      render: (_: any, record: PlayMethod) => (
        <Space>
          <GiftOutlined style={{ color: '#faad14' }} />
          <span>{record.coupons.length} 张</span>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: PlayMethod) => (
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
              玩法管理
            </Title>
          </Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新增玩法
          </Button>
        </div>
      </Card>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <Space>
            <Text type="secondary">玩法名称/ID:</Text>
            <Input
              placeholder="请输入"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
          </Space>
          <Space>
            <Text type="secondary">玩法类型:</Text>
            <Select
              placeholder="全部"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="lottery">抽奖</Option>
              <Option value="seckill">秒杀</Option>
              <Option value="game">游戏</Option>
              <Option value="coupon">领券</Option>
              <Option value="signin">签到</Option>
              <Option value="shake">摇一摇</Option>
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

      {/* 玩法配置弹窗 */}
      <Modal
        title={selectedPlay ? `编辑玩法 - ${selectedPlay.name}` : '编辑玩法'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            message.success('玩法配置已保存');
            setModalVisible(false);
          }}>
            保存
          </Button>,
        ]}
      >
        {selectedPlay?.aiDraftConfig && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 基础信息 */}
            <Card size="small" title={<Text strong>基础信息</Text>}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text type="secondary">玩法类型</Text>
                  <Input value={selectedPlay.aiDraftConfig.playType} readOnly style={{ marginTop: 4 }} />
                </div>
                <div>
                  <Text type="secondary">玩法名称</Text>
                  <Input value={selectedPlay.aiDraftConfig.playName} style={{ marginTop: 4 }} />
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">开始时间</Text>
                    <Input value={selectedPlay.aiDraftConfig.startTime} style={{ marginTop: 4 }} />
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">结束时间</Text>
                    <Input value={selectedPlay.aiDraftConfig.endTime} style={{ marginTop: 4 }} />
                  </Col>
                </Row>
                <div>
                  <Text type="secondary">玩法说明</Text>
                  <Input.TextArea value={selectedPlay.aiDraftConfig.playDesc} rows={2} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <Text type="secondary">玩法归属</Text>
                  <Input value={selectedPlay.aiDraftConfig.playBelong} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <Text type="secondary">玩法主题</Text>
                  <Input value={selectedPlay.aiDraftConfig.playTheme} style={{ marginTop: 4 }} />
                </div>
              </Space>
            </Card>

            {/* 玩法内容 */}
            <Card size="small" title={<Text strong>玩法内容</Text>}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">初始参与次数</Text>
                    <Input value={selectedPlay.aiDraftConfig.playContent.initialChance} style={{ marginTop: 4 }} />
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">次数类型</Text>
                    <Select value={selectedPlay.aiDraftConfig.playContent.chanceType} style={{ width: '100%', marginTop: 4 }}>
                      <Option value="daily">每天</Option>
                      <Option value="total">总计</Option>
                    </Select>
                  </Col>
                </Row>
                <div>
                  <Text type="secondary">会员范围</Text>
                  <Select mode="multiple" value={selectedPlay.aiDraftConfig.playContent.memberScope} style={{ width: '100%', marginTop: 4 }}>
                    <Option value="all">全部会员</Option>
                    <Option value="vip">VIP会员</Option>
                    <Option value="card">持卡会员</Option>
                    <Option value="level">等级会员</Option>
                  </Select>
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">社群限制</Text>
                    <div style={{ marginTop: 4 }}><Switch checked={selectedPlay.aiDraftConfig.playContent.groupLimit} /></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">黑名单限制</Text>
                    <div style={{ marginTop: 4 }}><Switch checked={selectedPlay.aiDraftConfig.playContent.blacklistLimit} /></div>
                  </Col>
                </Row>
              </Space>
            </Card>

            {/* 发奖配置 */}
            <Card size="small" title={<Text strong>发奖配置</Text>}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary">关联优惠券</Text>
                {selectedPlay.coupons.map(coupon => (
                  <Card key={coupon.id} size="small" style={{ marginTop: 8 }}>
                    <Space>
                      <GiftOutlined style={{ color: '#faad14' }} />
                      <span>{coupon.name}</span>
                      <Tag>{coupon.value}</Tag>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Card>
          </Space>
        )}
      </Modal>
    </div>
  );
}
