import { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Row,
  Col,
  Statistic,
  Typography,
  Modal,
  List,
} from 'antd';
import {
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
  RocketOutlined,
  GiftOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mockPages, getTotalCouponCount, getPlayNames, getAllCouponNames, getAllTaskNames } from '../../mock/pageManagement';
import type { ActivityPage, PlayMethod, MarketingTask } from '../../mock/pageManagement';

// 计算页面所有实体的确认进度
const getPageConfirmProgress = (page: ActivityPage) => {
  let total = 1; // 页面本身
  let confirmed = page.aiDraftStatus === 'confirmed' ? 1 : 0;

  // 玩法
  page.plays.forEach(play => {
    total++;
    if (play.aiDraftStatus === 'confirmed') confirmed++;
  });

  // 优惠券
  page.plays.forEach(play => {
    play.coupons.forEach(coupon => {
      total++;
      if (coupon.aiDraftStatus === 'confirmed') confirmed++;
    });
  });

  // 营销任务
  page.marketingTasks.forEach(task => {
    total++;
    if (task.aiDraftStatus === 'confirmed') confirmed++;
  });

  return { total, confirmed };
};

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

export default function PageManagement() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [draftStatusFilter, setDraftStatusFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPage, setSelectedPage] = useState<ActivityPage | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'plays' | 'tasks'>('plays');

  const totalCount = mockPages.length;
  const pendingConfirmCount = mockPages.filter(p => p.aiDraftStatus === 'pending').length;
  const confirmedCount = mockPages.filter(p => p.aiDraftStatus === 'confirmed').length;

  const filteredData = mockPages.filter((page) => {
    const matchStatus = statusFilter === 'all' || page.status === statusFilter;
    const matchDraftStatus = draftStatusFilter === 'all' ||
      (draftStatusFilter === 'pending' && page.aiDraftStatus === 'pending' && page.status === 'draft') ||
      (draftStatusFilter === 'confirmed' && page.aiDraftStatus === 'confirmed');
    const matchSearch = !searchText ||
      page.pageName.toLowerCase().includes(searchText.toLowerCase()) ||
      page.sourceTask.toLowerCase().includes(searchText.toLowerCase()) ||
      (page.pageId !== '待生成' && page.pageId.toLowerCase().includes(searchText.toLowerCase())) ||
      getPlayNames(page).some(name => name.toLowerCase().includes(searchText.toLowerCase())) ||
      getAllCouponNames(page).some(name => name.toLowerCase().includes(searchText.toLowerCase())) ||
      getAllTaskNames(page).some(name => name.toLowerCase().includes(searchText.toLowerCase()));
    return matchStatus && matchDraftStatus && matchSearch;
  });

  const handleViewDetail = (record: ActivityPage) => {
    navigate(`/pages/detail/${record.id}`);
  };

  const showPlayDetail = (record: ActivityPage, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPage(record);
    setActiveDetailTab('plays');
    setDetailModalVisible(true);
  };

  const showTaskDetail = (record: ActivityPage, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPage(record);
    setActiveDetailTab('tasks');
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: '页面ID',
      dataIndex: 'pageId',
      key: 'pageId',
      width: 130,
      render: (text: string, record: ActivityPage) => (
        <Space>
          {record.aiDraftStatus === 'confirmed' ? (
            <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{text}</span>
          ) : (
            <Tag color="default">待生成</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '页面名称',
      dataIndex: 'pageName',
      key: 'pageName',
      render: (text: string, record: ActivityPage) => (
        <Space vertical size={0}>
          <span style={{ fontWeight: 500 }}>{text}</span>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>来源: {record.sourceTask}</span>
        </Space>
      ),
    },
    {
      title: '关联玩法',
      dataIndex: 'plays',
      key: 'plays',
      width: 120,
      render: (plays: PlayMethod[], record: ActivityPage) => (
        <Button
          type="link"
          size="small"
          onClick={(e) => showPlayDetail(record, e)}
          style={{ padding: 0 }}
        >
          <Space>
            <RocketOutlined style={{ color: '#1890ff' }} />
            <span>{plays.length} 个玩法</span>
          </Space>
        </Button>
      ),
    },
    {
      title: '关联优惠券',
      dataIndex: 'plays',
      key: 'coupons',
      width: 120,
      render: (_: PlayMethod[], record: ActivityPage) => {
        const couponCount = getTotalCouponCount(record);
        return (
          <Space>
            <GiftOutlined style={{ color: '#faad14' }} />
            <span>{couponCount} 个券</span>
          </Space>
        );
      },
    },
    {
      title: '关联营销任务',
      dataIndex: 'marketingTasks',
      key: 'tasks',
      width: 130,
      render: (tasks: MarketingTask[], record: ActivityPage) => (
        <Button
          type="link"
          size="small"
          onClick={(e) => showTaskDetail(record, e)}
          style={{ padding: 0 }}
        >
          <Space>
            <CheckSquareOutlined style={{ color: '#52c41a' }} />
            <span>{tasks.length} 个任务</span>
          </Space>
        </Button>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 140,
      render: (_: unknown, record: ActivityPage) => {
        const { total, confirmed } = getPageConfirmProgress(record);
        const isAllConfirmed = confirmed === total;
        return (
          <Space vertical size={0}>
            <Tag color={isAllConfirmed ? 'success' : 'warning'}>
              {isAllConfirmed ? '已确认' : '待确认'}
            </Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>
              ({confirmed}/{total})
            </Text>
          </Space>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 140,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: ActivityPage) => {
        const { total, confirmed } = getPageConfirmProgress(record);
        const isAllConfirmed = confirmed === total;
        return (
          <Space size="small">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            >
              {isAllConfirmed ? '查看' : '去确认'}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总页面数"
              value={totalCount}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="待确认"
              value={pendingConfirmCount}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已确认"
              value={confirmedCount}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="页面管理">
        <Space wrap style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索页面/玩法/任务/券名称"
            allowClear
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 320 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="全部状态"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
          >
            <Option value="all">全部状态</Option>
            <Option value="draft">草稿</Option>
            <Option value="published">已发布</Option>
          </Select>
          <Select
            placeholder="草稿状态"
            value={draftStatusFilter}
            onChange={setDraftStatusFilter}
            style={{ width: 120 }}
          >
            <Option value="all">全部草稿</Option>
            <Option value="pending">待确认</Option>
            <Option value="confirmed">已确认</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title={selectedPage ? `${selectedPage.pageName} - 详情` : '详情'}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedPage && (
            <Button
              key="view"
              type="primary"
              onClick={() => {
                setDetailModalVisible(false);
                handleViewDetail(selectedPage);
              }}
            >
              查看完整详情
            </Button>
          ),
        ]}
        width={700}
      >
        {selectedPage && (
          <>
            <Space style={{ marginBottom: 16 }}>
              <Button
                type={activeDetailTab === 'plays' ? 'primary' : 'default'}
                onClick={() => setActiveDetailTab('plays')}
                icon={<RocketOutlined />}
              >
                玩法 ({selectedPage.plays.length})
              </Button>
              <Button
                type={activeDetailTab === 'tasks' ? 'primary' : 'default'}
                onClick={() => setActiveDetailTab('tasks')}
                icon={<CheckSquareOutlined />}
              >
                营销任务 ({selectedPage.marketingTasks.length})
              </Button>
            </Space>

            {activeDetailTab === 'plays' ? (
              <List
                dataSource={selectedPage.plays}
                renderItem={(play) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <RocketOutlined style={{ color: '#1890ff' }} />
                        <Text strong style={{ fontSize: 16 }}>{play.name}</Text>
                        <Tag color="blue">{play.type}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>{play.playId}</Text>
                      </div>
                      <div style={{ paddingLeft: 24 }}>
                        <Space size="large">
                          <Text type="secondary">
                            <GiftOutlined style={{ color: '#faad14', marginRight: 4 }} />
                            优惠券: {play.coupons.length} 个
                          </Text>
                          {play.relatedTaskIds.length > 0 && (
                            <Text type="secondary">
                              <CheckSquareOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                              关联任务: {play.relatedTaskIds.length} 个
                            </Text>
                          )}
                        </Space>
                        <div style={{ marginTop: 8 }}>
                          {play.coupons.map(coupon => (
                            <Tag
                              key={coupon.id}
                              color={coupon.type === 'cash' ? 'green' : coupon.type === 'discount' ? 'orange' : 'purple'}
                              style={{ margin: '2px' }}
                            >
                              {coupon.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <List
                dataSource={selectedPage.marketingTasks}
                renderItem={(task) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <CheckSquareOutlined style={{ color: '#52c41a' }} />
                        <Text strong style={{ fontSize: 16 }}>{task.name}</Text>
                        <Tag color="green">{task.type}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>{task.taskId}</Text>
                      </div>
                      <div style={{ paddingLeft: 24 }}>
                        <Text type="secondary">
                          关联玩法: {task.relatedPlayIds.length > 0
                            ? task.relatedPlayIds.map(id => {
                                const play = selectedPage.plays.find(p => p.id === id);
                                return play?.name || id;
                              }).join(', ')
                            : '无'}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </Modal>
    </>
  );
}
