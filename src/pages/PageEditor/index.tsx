import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  Select,
  Row,
  Col,
  message,
  Typography,
  Switch,
  Radio,
  Divider,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  MobileOutlined,
  PictureOutlined,
  FontSizeOutlined,
  AppstoreOutlined,
  TrophyOutlined,
  GiftOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  ShoppingOutlined,
  EyeOutlined,
  ShareAltOutlined,
  SettingOutlined,
  RocketFilled,
  CheckSquareFilled,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { getPageById, getTasksForPlay } from '../../mock/pageManagement';
import type { PlayMethod, MarketingTask } from '../../mock/pageManagement';

const { Title, Text } = Typography;
const { Option } = Select;

// 组件类型定义
type ComponentType = 'play' | 'task' | 'basic';

interface EditorComponent {
  id: string;
  type: ComponentType;
  name: string;
  icon: React.ReactNode;
  category: 'basic' | 'play' | 'task';
}

// 左侧组件库
const COMPONENT_LIBRARY: EditorComponent[] = [
  { id: 'banner', type: 'basic', name: '轮播图', icon: <PictureOutlined />, category: 'basic' },
  { id: 'image', type: 'basic', name: '图片', icon: <PictureOutlined />, category: 'basic' },
  { id: 'text', type: 'basic', name: '文本', icon: <FontSizeOutlined />, category: 'basic' },
  { id: 'tab', type: 'basic', name: 'Tab', icon: <AppstoreOutlined />, category: 'basic' },
  { id: 'play-lottery', type: 'play', name: '抽奖玩法', icon: <TrophyOutlined />, category: 'play' },
  { id: 'play-coupon', type: 'play', name: '领券玩法', icon: <GiftOutlined />, category: 'play' },
  { id: 'play-game', type: 'play', name: '互动游戏', icon: <RocketOutlined />, category: 'play' },
  { id: 'play-seckill', type: 'play', name: '限时秒杀', icon: <ClockCircleOutlined />, category: 'play' },
  { id: 'task-order', type: 'task', name: '下单任务', icon: <ShoppingOutlined />, category: 'task' },
  { id: 'task-browse', type: 'task', name: '浏览任务', icon: <EyeOutlined />, category: 'task' },
  { id: 'task-share', type: 'task', name: '分享任务', icon: <ShareAltOutlined />, category: 'task' },
  { id: 'task-signin', type: 'task', name: '签到任务', icon: <CheckSquareOutlined />, category: 'task' },
];

export default function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'page' | 'component'>('page');

  // 弹窗状态
  const [playModalVisible, setPlayModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState<PlayMethod | null>(null);
  const [selectedTask, setSelectedTask] = useState<MarketingTask | null>(null);

  // 自动打开从页面详情跳转来的配置
  useEffect(() => {
    const openPageId = localStorage.getItem('openPageEditor');
    if (openPageId && openPageId === id) {
      // PageEditor already opened with the correct page
      // Could add additional logic here if needed
      localStorage.removeItem('openPageEditor');
    }
  }, [id]);

  const page = id ? getPageById(id) : undefined;

  if (!page) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="页面不存在"
          description="找不到指定的活动页面"
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/pages')}>
              返回列表
            </Button>
          }
        />
      </div>
    );
  }

  const totalCoupons = page.plays.reduce((sum, play) => sum + play.coupons.length, 0);
  const totalPlays = page.plays.length;
  const totalTasks = page.marketingTasks.length;

  const handleSave = () => {
    message.success('页面配置已保存');
  };

  // 打开玩法配置弹窗
  const openPlayModal = (play: PlayMethod) => {
    setSelectedPlay(play);
    setPlayModalVisible(true);
  };

  // 打开任务配置弹窗
  const openTaskModal = (task: MarketingTask) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  // 左栏：组件库
  const renderComponentLibrary = () => (
    <Card
      title="组件库"
      size="small"
      style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 12, color: '#999' }}>基础组件</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
            {COMPONENT_LIBRARY.filter(c => c.category === 'basic').map(comp => (
              <Card
                key={comp.id}
                size="small"
                hoverable
                style={{ cursor: 'pointer', marginBottom: 8, border: selectedComponent === comp.id ? '1px solid #1890ff' : '1px solid #d9d9d9' }}
                bodyStyle={{ padding: '8px 12px' }}
                onClick={() => setSelectedComponent(comp.id)}
              >
                <Space>
                  {comp.icon}
                  <span>{comp.name}</span>
                </Space>
              </Card>
            ))}
          </Space>
        </div>
        <Divider style={{ margin: '12px 0' }} />
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 12, color: '#999' }}>玩法组件</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
            {COMPONENT_LIBRARY.filter(c => c.category === 'play').map(comp => (
              <Card
                key={comp.id}
                size="small"
                hoverable
                style={{ cursor: 'pointer', marginBottom: 8, border: selectedComponent === comp.id ? '1px solid #1890ff' : '1px solid #d9d9d9' }}
                bodyStyle={{ padding: '8px 12px' }}
                onClick={() => setSelectedComponent(comp.id)}
              >
                <Space>
                  {comp.icon}
                  <span>{comp.name}</span>
                </Space>
              </Card>
            ))}
          </Space>
        </div>
        <Divider style={{ margin: '12px 0' }} />
        <div>
          <Text strong style={{ fontSize: 12, color: '#999' }}>任务组件</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
            {COMPONENT_LIBRARY.filter(c => c.category === 'task').map(comp => (
              <Card
                key={comp.id}
                size="small"
                hoverable
                style={{ cursor: 'pointer', marginBottom: 8, border: selectedComponent === comp.id ? '1px solid #1890ff' : '1px solid #d9d9d9' }}
                bodyStyle={{ padding: '8px 12px' }}
                onClick={() => setSelectedComponent(comp.id)}
              >
                <Space>
                  {comp.icon}
                  <span>{comp.name}</span>
                </Space>
              </Card>
            ))}
          </Space>
        </div>
      </Space>
    </Card>
  );

  // 中栏：预览区
  const renderPreviewPanel = () => (
    <Card
      title={
        <Space>
          <MobileOutlined />
          <span>页面预览</span>
          <Tag color="blue">{page.aiDraftConfig?.pageTitle || page.pageName}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Text type="secondary">iPhone 14 Pro</Text>
          <Switch size="small" checkedChildren="100%" unCheckedChildren="75%" defaultChecked />
        </Space>
      }
      style={{ height: 'calc(100vh - 140px)', overflow: 'hidden' }}
      bodyStyle={{ padding: 0, overflow: 'auto', background: '#f5f5f5', height: 'calc(100vh - 190px)' }}
    >
      {/* 手机预览框 */}
      <div
        style={{
          width: 375,
          minHeight: 700,
          margin: '20px auto',
          background: page.aiDraftConfig?.pageBg === 'color'
            ? page.aiDraftConfig.bgColor
            : '#fff',
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 状态栏 */}
        <div style={{ height: 44, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 14 }}>12:00</Text>
        </div>

        {/* 页面内容 */}
        <div style={{ padding: 16 }}>
          {/* Banner区域 */}
          {page.aiDraftConfig?.componentStack.includes('banner') && (
            <div
              style={{
                height: 150,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                cursor: 'pointer',
                border: selectedComponent === 'banner' ? '2px solid #1890ff' : '2px solid transparent',
              }}
              onClick={() => setSelectedComponent('banner')}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                {page.aiDraftConfig?.pageTitle}
              </Text>
            </div>
          )}

          {/* 玩法组件区域 */}
          {page.plays.map((play) => (
            <Card
              key={play.id}
              size="small"
              style={{
                marginBottom: 12,
                cursor: 'pointer',
                border: selectedComponent === play.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
              }}
              onClick={() => {
                setSelectedComponent(play.id);
                setActiveTab('component');
              }}
              title={
                <Space>
                  <RocketFilled style={{ color: '#1890ff' }} />
                  <span>{play.name}</span>
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{play.type}</Text>
                <Space wrap>
                  {play.coupons.slice(0, 2).map(coupon => (
                    <Tag
                      key={coupon.id}
                      color={coupon.type === 'cash' ? 'green' : coupon.type === 'discount' ? 'orange' : 'purple'}
                      style={{ cursor: 'pointer' }}
                    >
                      <Space>
                        <GiftOutlined />
                        {coupon.name}
                      </Space>
                    </Tag>
                  ))}
                  {play.coupons.length > 2 && (
                    <Tag>
                      +{play.coupons.length - 2}
                    </Tag>
                  )}
                </Space>
                {/* 关联的任务 */}
                {getTasksForPlay(page, play.id).length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 8,
                      background: '#f6ffed',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const tasks = getTasksForPlay(page, play.id);
                      if (tasks.length > 0) openTaskModal(tasks[0]);
                    }}
                  >
                    <Space>
                      <CheckSquareFilled style={{ color: '#52c41a' }} />
                      <Text style={{ fontSize: 12 }}>
                        做任务得参与机会: {getTasksForPlay(page, play.id).length} 个任务
                      </Text>
                    </Space>
                  </div>
                )}
              </Space>
            </Card>
          ))}

          {/* 任务列表区域 */}
          {page.marketingTasks.length > 0 && (
            <Card
              size="small"
              style={{
                marginBottom: 12,
                cursor: 'pointer',
                border: selectedComponent === 'tasks' ? '2px solid #1890ff' : '1px solid #d9d9d9',
              }}
              onClick={() => {
                setSelectedComponent('tasks');
                setActiveTab('component');
              }}
              title={
                <Space>
                  <CheckSquareFilled style={{ color: '#52c41a' }} />
                  <span>做任务得奖励</span>
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {page.marketingTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openTaskModal(task);
                    }}
                  >
                    <Space>
                      <img src={task.aiDraftConfig?.taskIcon} alt="" style={{ width: 24, height: 24 }} />
                      <div>
                        <div style={{ fontSize: 13 }}>{task.name}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{task.aiDraftConfig?.taskSubtitle}</div>
                      </div>
                    </Space>
                    <Tag color="orange">去完成</Tag>
                  </div>
                ))}
              </Space>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );

  // 右栏：配置面板
  const renderConfigPanel = () => {
    // 如果有选中的玩法组件
    const selectedPlayData = page.plays.find(p => p.id === selectedComponent);
    if (selectedPlayData && activeTab === 'component') {
      const relatedTasks = getTasksForPlay(page, selectedPlayData.id);
      return (
        <Card
          title={
            <Space>
              <SettingOutlined />
              <span>玩法配置</span>
            </Space>
          }
          size="small"
          style={{ height: 'calc(100vh - 140px)', overflow: 'hidden' }}
          bodyStyle={{ overflow: 'auto', height: 'calc(100vh - 190px)' }}
          extra={
            <Button type="link" size="small" onClick={() => setActiveTab('page')}>
              返回页面配置
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 玩法基础信息 */}
            <div>
              <Text strong style={{ fontSize: 16 }}>
                <RocketFilled style={{ color: '#1890ff', marginRight: 8 }} />
                {selectedPlayData.name}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{selectedPlayData.type}</Tag>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  ID: {selectedPlayData.playId}
                </Text>
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* 玩法配置项 */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>基础信息</Text>
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <Text>玩法名称: {selectedPlayData.aiDraftConfig?.playName || selectedPlayData.name}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text>玩法类型: {selectedPlayData.aiDraftConfig?.playType || selectedPlayData.type}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text>活动时间: {selectedPlayData.aiDraftConfig?.startTime?.split(' ')[0]} 至 {selectedPlayData.aiDraftConfig?.endTime?.split(' ')[0]}</Text>
                </div>
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* 玩法内容配置 */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>玩法内容</Text>
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <Text>初始参与次数: {selectedPlayData.aiDraftConfig?.playContent?.initialChance} 次/{selectedPlayData.aiDraftConfig?.playContent?.chanceType === 'daily' ? '每天' : '总计'}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text>会员范围: {selectedPlayData.aiDraftConfig?.playContent?.memberScope?.join(', ') || '全部会员'}</Text>
                </div>
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* 关联优惠券 */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>关联优惠券 ({selectedPlayData.coupons.length})</Text>
              <div style={{ marginTop: 8 }}>
                {selectedPlayData.coupons.map(coupon => (
                  <Card
                    key={coupon.id}
                    size="small"
                    style={{ marginBottom: 8, cursor: 'pointer' }}
                    bodyStyle={{ padding: 8 }}
                  >
                    <Space>
                      <GiftOutlined style={{ color: '#faad14' }} />
                      <span>{coupon.name}</span>
                      <Tag>{coupon.value}</Tag>
                    </Space>
                  </Card>
                ))}
              </div>
            </div>

            {/* 关联营销任务 */}
            {relatedTasks.length > 0 && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>关联营销任务 ({relatedTasks.length})</Text>
                  <div style={{ marginTop: 8 }}>
                    {relatedTasks.map(task => (
                      <Card
                        key={task.id}
                        size="small"
                        style={{ marginBottom: 8, cursor: 'pointer' }}
                        bodyStyle={{ padding: 8 }}
                        onClick={() => openTaskModal(task)}
                      >
                        <Space>
                          <CheckSquareOutlined style={{ color: '#52c41a' }} />
                          <span>{task.name}</span>
                          <Button type="link" size="small">配置任务</Button>
                        </Space>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 编辑按钮 */}
            <Button
              type="primary"
              block
              onClick={() => openPlayModal(selectedPlayData)}
            >
              编辑玩法配置
            </Button>
          </Space>
        </Card>
      );
    }

    // 如果选中的是任务列表
    if (selectedComponent === 'tasks' && activeTab === 'component') {
      return (
        <Card
          title={
            <Space>
              <SettingOutlined />
              <span>任务列表配置</span>
            </Space>
          }
          size="small"
          style={{ height: 'calc(100vh - 140px)', overflow: 'hidden' }}
          bodyStyle={{ overflow: 'auto', height: 'calc(100vh - 190px)' }}
          extra={
            <Button type="link" size="small" onClick={() => setActiveTab('page')}>
              返回页面配置
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Text strong>页面营销任务 ({page.marketingTasks.length})</Text>
            {page.marketingTasks.map(task => (
              <Card
                key={task.id}
                size="small"
                style={{ marginBottom: 8, cursor: 'pointer' }}
                bodyStyle={{ padding: 12 }}
                onClick={() => openTaskModal(task)}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <CheckSquareOutlined style={{ color: '#52c41a' }} />
                    <Text strong>{task.name}</Text>
                    <Tag color="green">{task.type}</Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {task.aiDraftConfig?.taskSubtitle}
                  </Text>
                  <Button type="link" size="small" style={{ padding: 0 }}>
                    配置任务 →
                  </Button>
                </Space>
              </Card>
            ))}
          </Space>
        </Card>
      );
    }

    // 默认页面配置
    return (
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>页面配置</span>
          </Space>
        }
        size="small"
        style={{ height: 'calc(100vh - 140px)', overflow: 'hidden' }}
        bodyStyle={{ overflow: 'auto', height: 'calc(100vh - 190px)' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>页面名称</Text>
            <div style={{ marginTop: 4 }}>
              <Input value={page.aiDraftConfig?.pageTitle || page.pageName} />
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>页面副标题</Text>
            <div style={{ marginTop: 4 }}>
              <Input value={page.aiDraftConfig?.pageSubtitle || ''} />
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>页面背景</Text>
            <div style={{ marginTop: 4 }}>
              <Radio.Group value={page.aiDraftConfig?.pageBg || 'none'}>
                <Radio value="none">无</Radio>
                <Radio value="color">纯色</Radio>
                <Radio value="image">图片</Radio>
              </Radio.Group>
            </div>
          </div>
          <Divider />
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>分享配置</Text>
            <div style={{ marginTop: 8 }}>
              <div style={{ marginBottom: 8 }}>
                <Text>是否支持分享</Text>
                <div style={{ marginTop: 4 }}>
                  <Switch checked={page.aiDraftConfig?.shareConfig?.enable} />
                </div>
              </div>
              {page.aiDraftConfig?.shareConfig?.enable && (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <Text>分享标题</Text>
                    <Input value={page.aiDraftConfig?.shareConfig?.shareTitle} />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text>分享图片</Text>
                    <Input value={page.aiDraftConfig?.shareConfig?.shareImage} />
                  </div>
                </>
              )}
            </div>
          </div>
          <Divider />
          <Card size="small" title="已配置实体">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space><RocketFilled /> 玩法</Space>
                <Text strong>{totalPlays} 个</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space><CheckSquareFilled /> 任务</Space>
                <Text strong>{totalTasks} 个</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space><GiftOutlined /> 优惠券</Space>
                <Text strong>{totalCoupons} 个</Text>
              </div>
            </Space>
          </Card>
        </Space>
      </Card>
    );
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#f0f2f5' }}>
      {/* 顶部状态栏 */}
      <div style={{ height: 60, background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e8e8' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/pages/detail/${id}`)}>
            返回详情
          </Button>
          <Title level={5} style={{ margin: 0 }}>
            {page.pageName} - 编辑器
          </Title>
          <Tag color={page.status === 'published' ? 'success' : 'warning'}>
            {page.status === 'published' ? '已发布' : '草稿'}
          </Tag>
        </Space>
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => message.info('预览功能开发中')}>
            预览
          </Button>
          <Button icon={<SaveOutlined />} type="primary" onClick={handleSave}>
            保存
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            type="primary"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => message.success('页面发布成功')}
          >
            发布
          </Button>
        </Space>
      </div>

      {/* 三栏布局 */}
      <Row gutter={16} style={{ padding: 16, height: 'calc(100vh - 60px)' }}>
        {/* 左侧：组件库 */}
        <Col span={4}>{renderComponentLibrary()}</Col>

        {/* 中间：预览区 */}
        <Col span={11}>{renderPreviewPanel()}</Col>

        {/* 右侧：配置面板 */}
        <Col span={9}>{renderConfigPanel()}</Col>
      </Row>

      {/* 玩法配置弹窗 */}
      <Modal
        title={selectedPlay ? `编辑玩法 - ${selectedPlay.name}` : '编辑玩法'}
        open={playModalVisible}
        onCancel={() => setPlayModalVisible(false)}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
        footer={[
          <Button key="cancel" onClick={() => setPlayModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            message.success('玩法配置已保存');
            setPlayModalVisible(false);
          }}>
            保存
          </Button>,
        ]}
      >
        {selectedPlay?.aiDraftConfig && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
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

      {/* 营销任务配置弹窗 */}
      <Modal
        title={selectedTask ? `营销任务 - ${selectedTask.name}` : '营销任务'}
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
        footer={[
          <Button key="cancel" onClick={() => setTaskModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            message.success('营销任务配置已保存');
            setTaskModalVisible(false);
          }}>
            保存
          </Button>,
        ]}
      >
        {selectedTask?.aiDraftConfig && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
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
