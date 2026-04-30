import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tag,
  Button,
  Space,
  Alert,
  Typography,
  message,
  Divider,
  Statistic,
  List,
  Progress,
  Row,
  Col,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  GiftOutlined,
  RocketOutlined,
  CheckSquareOutlined,
  ExclamationCircleOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getPageById } from '../../mock/pageManagement';
import type { PlayMethod, CouponTemplate, MarketingTask } from '../../mock/pageManagement';

const { Title, Text } = Typography;

// 实体状态类型
type EntityStatus = 'confirmed' | 'pending' | 'draft';

interface EntityNode {
  id: string;
  name: string;
  type: 'page' | 'play' | 'coupon' | 'task';
  status: EntityStatus;
  itemId: string;
  entityId?: string;
  confirmedTime?: string;
  data?: PlayMethod | CouponTemplate | MarketingTask;
  children?: EntityNode[];
}

export default function PageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const page = id ? getPageById(id) : undefined;

  // 构建实体树和计算进度
  const { entityTree, progressStats, entityStats } = useMemo(() => {
    if (!page) return {
      entityTree: [],
      progressStats: { total: 0, confirmed: 0, pending: 0, draft: 0 },
      entityStats: { page: { total: 0, confirmed: 0 }, play: { total: 0, confirmed: 0 }, coupon: { total: 0, confirmed: 0 }, task: { total: 0, confirmed: 0 } }
    };

    const tree: EntityNode[] = [];
    let confirmed = 0, pending = 0, draft = 0;
    const stats = { page: { total: 0, confirmed: 0 }, play: { total: 0, confirmed: 0 }, coupon: { total: 0, confirmed: 0 }, task: { total: 0, confirmed: 0 } };

    // 页面本身
    const pageStatus: EntityStatus = page.aiDraftStatus === 'confirmed' ? 'confirmed' : 'pending';
    stats.page.total = 1;
    if (pageStatus === 'confirmed') {
      confirmed++;
      stats.page.confirmed = 1;
    } else {
      pending++;
    }

    const pageNode: EntityNode = {
      id: page.id,
      name: page.pageName,
      type: 'page',
      status: pageStatus,
      itemId: page.id,
      entityId: page.pageId === '待生成' ? undefined : page.pageId,
      confirmedTime: pageStatus === 'confirmed' ? page.createTime : undefined,
      children: [],
    };

    // 玩法和优惠券
    const playNodeMap = new Map<string, EntityNode>();
    page.plays.forEach((play) => {
      const playStatus: EntityStatus = play.aiDraftStatus || 'pending';
      if (playStatus === 'confirmed') {
        confirmed++;
        stats.play.confirmed++;
      } else {
        pending++;
      }
      stats.play.total++;

      const playNode: EntityNode = {
        id: play.id,
        name: play.name,
        type: 'play',
        status: playStatus,
        itemId: play.id,
        entityId: play.playId === '待生成' ? undefined : play.playId,
        confirmedTime: play.confirmedTime,
        data: play,
        children: [],
      };

      // 优惠券作为玩法的子节点
      play.coupons.forEach((coupon) => {
        const couponStatus: EntityStatus = coupon.aiDraftStatus || 'pending';
        if (couponStatus === 'confirmed') {
          confirmed++;
          stats.coupon.confirmed++;
        } else {
          pending++;
        }
        stats.coupon.total++;
        playNode.children!.push({
          id: coupon.id,
          name: coupon.name,
          type: 'coupon',
          status: couponStatus,
          itemId: coupon.id,
          entityId: coupon.couponId === '待生成' ? undefined : coupon.couponId,
          confirmedTime: coupon.confirmedTime,
          data: coupon,
        });
      });

      playNodeMap.set(play.id, playNode);
      pageNode.children!.push(playNode);
    });

    // 营销任务 - 根据 relatedPlayIds 挂到对应玩法下
    page.marketingTasks.forEach((task) => {
      const taskStatus: EntityStatus = task.aiDraftStatus || 'pending';
      if (taskStatus === 'confirmed') {
        confirmed++;
        stats.task.confirmed++;
      } else {
        pending++;
      }
      stats.task.total++;

      const taskNode: EntityNode = {
        id: task.id,
        name: task.name,
        type: 'task',
        status: taskStatus,
        itemId: task.id,
        entityId: task.taskId === '待生成' ? undefined : task.taskId,
        confirmedTime: task.confirmedTime,
        data: task,
      };

      // 如果任务有关联玩法，挂到玩法下；否则挂到页面下
      if (task.relatedPlayIds && task.relatedPlayIds.length > 0) {
        task.relatedPlayIds.forEach((playId) => {
          const playNode = playNodeMap.get(playId);
          if (playNode) {
            playNode.children!.push(taskNode);
          }
        });
      } else {
        pageNode.children!.push(taskNode);
      }
    });

    tree.push(pageNode);

    const total = confirmed + pending + draft;
    return {
      entityTree: tree,
      progressStats: { total, confirmed, pending, draft },
      entityStats: stats,
    };
  }, [page]);

  if (!page) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="页面不存在"
          description="找不到指定的活动页面"
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/ai-create')}>
              返回列表
            </Button>
          }
        />
      </div>
    );
  }

  const totalCoupons = entityStats.coupon.total;
  const totalPlays = entityStats.play.total;
  const totalTasks = entityStats.task.total;
  const totalPages = entityStats.page.total;
  const progressPercent = Math.round((progressStats.confirmed / progressStats.total) * 100) || 0;

  const handlePublish = () => {
    if (progressPercent < 100) {
      message.warning('请先确认所有实体草稿后再发布');
      return;
    }
    Modal.confirm({
      title: '确认发布页面',
      content: (
        <Space direction="vertical" style={{ marginTop: 16 }}>
          <Text>发布后，该页面将正式可用，用户可以通过页面ID访问参与。</Text>
          <Text type="secondary">页面名称: {page.pageName}</Text>
          <Text type="secondary">包含玩法: {totalPlays} 个</Text>
          <Text type="secondary">包含营销任务: {totalTasks} 个</Text>
          <Text type="secondary">包含优惠券模板: {totalCoupons} 个</Text>
        </Space>
      ),
      okText: '确认发布',
      cancelText: '取消',
      onOk: () => {
        message.success('页面发布成功！');
        navigate('/pages');
      },
    });
  };

  // 渲染操作按钮
  const renderActionButton = (status: EntityStatus, onClick: () => void) => {
    const isPending = status === 'pending' || status === 'draft';
    return (
      <Button
        type={isPending ? 'primary' : 'default'}
        size="small"
        style={{ minWidth: 70 }}
        onClick={onClick}
      >
        {isPending ? '去确认' : '查看'}
      </Button>
    );
  };

  // 渲染状态标识
  const renderStatusBadge = (status: EntityStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 4,
          }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />
            <Text style={{ color: '#52c41a', fontSize: 12 }}>已确认</Text>
          </div>
        );
      case 'pending':
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            background: '#fff7e6',
            border: '1px solid #ffd8bf',
            borderRadius: 4,
          }}>
            <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: 12 }} />
            <Text style={{ color: '#fa8c16', fontSize: 12 }}>待确认</Text>
          </div>
        );
      default:
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            background: '#f5f5f5',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
          }}>
            <Text style={{ color: '#8c8c8c', fontSize: 12 }}>草稿</Text>
          </div>
        );
    }
  };

  // 打开页面编辑器
  const openPageEditor = () => {
    localStorage.setItem('openPageEditor', page!.id);
    localStorage.setItem('sourcePageId', page!.id);
    navigate(`/editor/page/${page!.id}`);
  };

  // 处理玩法点击
  const handlePlayClick = (play: PlayMethod) => {
    localStorage.setItem('openPlayModal', play.id);
    localStorage.setItem('sourcePageId', page!.id);
    navigate('/plays');
  };

  // 处理任务点击
  const handleTaskClick = (task: MarketingTask) => {
    localStorage.setItem('openTaskModal', task.id);
    localStorage.setItem('sourcePageId', page!.id);
    navigate('/tasks');
  };

  // 处理优惠券点击
  const handleCouponClick = (coupon: CouponTemplate) => {
    localStorage.setItem('openCouponEdit', coupon.id);
    localStorage.setItem('sourcePageId', page!.id);
    navigate('/coupons');
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#f0f2f5' }}>
      {/* 顶部操作栏 */}
      <div style={{ padding: 24, paddingBottom: 0 }}>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/ai-create')}>
                返回列表
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                {page.pageName}
              </Title>
              <Tag color={page.status === 'published' ? 'success' : page.aiDraftStatus === 'confirmed' ? 'processing' : 'warning'}>
                {page.status === 'published' ? '已发布' : page.aiDraftStatus === 'confirmed' ? '草稿已就绪' : '草稿待确认'}
              </Tag>
            </Space>
          </div>
        </Card>
      </div>

      {/* 主内容区 - 可滚动 */}
      <div style={{ padding: 24, paddingTop: 0, height: 'calc(100vh - 120px)', overflow: 'auto' }}>
        <Row gutter={24}>
          {/* 左侧：草稿确认进度 + 实体概览整合 */}
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Card
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>草稿确认进度</span>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Progress
                    percent={progressPercent}
                    status={progressPercent === 100 ? 'success' : 'active'}
                    strokeColor={progressPercent === 100 ? '#52c41a' : '#1890ff'}
                  />
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="已确认"
                        value={progressStats.confirmed}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="待确认"
                        value={progressStats.pending}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="总计"
                        value={progressStats.total}
                      />
                    </Col>
                  </Row>
                  {progressPercent === 100 ? (
                    <Alert
                      message="所有实体已确认，可以发布"
                      type="success"
                      showIcon
                      icon={<CheckCircleOutlined />}
                    />
                  ) : (
                    <Alert
                      message={`还有 ${progressStats.pending} 个实体待确认`}
                      type="warning"
                      showIcon
                      icon={<ExclamationCircleOutlined />}
                    />
                  )}
                  <Divider />
                  <Text strong style={{ fontSize: 16 }}>草稿概览</Text>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card
                        size="small"
                        style={{ textAlign: 'center', background: '#e6f7ff', cursor: 'pointer' }}
                        onClick={openPageEditor}
                      >
                        <FileTextOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                        <div style={{ marginTop: 4 }}>
                          <Text strong style={{ fontSize: 18 }}>{totalPages}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>活动页面</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text style={{ fontSize: 11, color: '#52c41a' }}>
                            {entityStats.page.confirmed} 已确认
                          </Text>
                          <Text style={{ fontSize: 11, color: '#8c8c8c' }}> / </Text>
                          <Text style={{ fontSize: 11, color: '#fa8c16' }}>
                            {entityStats.page.total - entityStats.page.confirmed} 待确认
                          </Text>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        size="small"
                        style={{ textAlign: 'center', background: '#f0f5ff', cursor: 'pointer' }}
                        onClick={() => navigate('/plays')}
                      >
                        <RocketOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                        <div style={{ marginTop: 4 }}>
                          <Text strong style={{ fontSize: 18 }}>{totalPlays}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>玩法</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text style={{ fontSize: 11, color: '#52c41a' }}>
                            {entityStats.play.confirmed} 已确认
                          </Text>
                          <Text style={{ fontSize: 11, color: '#8c8c8c' }}> / </Text>
                          <Text style={{ fontSize: 11, color: '#fa8c16' }}>
                            {entityStats.play.total - entityStats.play.confirmed} 待确认
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 12 }}>
                    <Col span={12}>
                      <Card
                        size="small"
                        style={{ textAlign: 'center', background: '#f6ffed', cursor: 'pointer' }}
                        onClick={() => navigate('/tasks')}
                      >
                        <CheckSquareOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        <div style={{ marginTop: 4 }}>
                          <Text strong style={{ fontSize: 18 }}>{totalTasks}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>营销任务</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text style={{ fontSize: 11, color: '#52c41a' }}>
                            {entityStats.task.confirmed} 已确认
                          </Text>
                          <Text style={{ fontSize: 11, color: '#8c8c8c' }}> / </Text>
                          <Text style={{ fontSize: 11, color: '#fa8c16' }}>
                            {entityStats.task.total - entityStats.task.confirmed} 待确认
                          </Text>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        size="small"
                        style={{ textAlign: 'center', background: '#fff7e6', cursor: 'pointer' }}
                        onClick={() => navigate('/coupons')}
                      >
                        <GiftOutlined style={{ color: '#faad14', fontSize: 20 }} />
                        <div style={{ marginTop: 4 }}>
                          <Text strong style={{ fontSize: 18 }}>{totalCoupons}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>优惠券</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text style={{ fontSize: 11, color: '#52c41a' }}>
                            {entityStats.coupon.confirmed} 已确认
                          </Text>
                          <Text style={{ fontSize: 11, color: '#8c8c8c' }}> / </Text>
                          <Text style={{ fontSize: 11, color: '#fa8c16' }}>
                            {entityStats.coupon.total - entityStats.coupon.confirmed} 待确认
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </Space>
              </Card>
            </Space>
          </Col>

          {/* 右侧：关系树 */}
          <Col span={16}>
            <Card
              title={
                <Space>
                  <DatabaseOutlined />
                  <span>关系树</span>
                </Space>
              }
            >
              <List
                size="small"
                dataSource={entityTree}
                renderItem={(pageNode) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {/* 页面节点 */}
                      <div
                        style={{
                          padding: '16px',
                          background: '#e6f7ff',
                          borderRadius: 8,
                          border: '1px solid #1890ff',
                          cursor: 'pointer',
                        }}
                        onClick={openPageEditor}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <FileTextOutlined style={{ color: '#1890ff', fontSize: 24, marginTop: 4 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <Text strong style={{ fontSize: 16 }}>{pageNode.name}</Text>
                              <Tag color="blue">活动页面</Tag>
                            </div>
                            <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 4, marginBottom: 4 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>ITEM ID: </Text>
                              <Text copyable style={{ fontSize: 12 }}>{pageNode.itemId}</Text>
                            </div>
                            {pageNode.entityId && pageNode.entityId !== '待生成' && (
                              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 4, marginBottom: 4 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>活动页面ID: </Text>
                                <Text copyable style={{ fontSize: 12, color: '#1890ff' }}>{pageNode.entityId}</Text>
                                {pageNode.confirmedTime && (
                                  <Text style={{ fontSize: 11, color: '#52c41a', marginLeft: 8 }}>
                                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                                    确认时间: {pageNode.confirmedTime}
                                  </Text>
                                )}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {renderStatusBadge(pageNode.status)}
                            {renderActionButton(pageNode.status, openPageEditor)}
                          </div>
                        </div>
                      </div>

                      {/* 子节点 */}
                      {pageNode.children?.map((child) => (
                        <div key={child.id} style={{ paddingLeft: 32 }}>
                          {child.type === 'play' && (
                            <>
                              <div
                                style={{
                                  padding: '14px',
                                  background: '#fafafa',
                                  borderRadius: 8,
                                  marginBottom: 8,
                                  border: '1px solid #e8e8e8',
                                  cursor: 'pointer',
                                }}
                                onClick={() => child.data && handlePlayClick(child.data as PlayMethod)}
                              >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                  <RocketOutlined style={{ color: '#1890ff', fontSize: 20, marginTop: 4 }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                      <Text strong style={{ fontSize: 15 }}>{child.name}</Text>
                                      <Tag color="blue">玩法</Tag>
                                    </div>
                                    <div style={{ background: '#fff', padding: '6px 10px', borderRadius: 4, marginBottom: 4 }}>
                                      <Text type="secondary" style={{ fontSize: 11 }}>ITEM ID: </Text>
                                      <Text copyable style={{ fontSize: 11 }}>{child.itemId}</Text>
                                    </div>
                                    {child.entityId && (
                                      <div style={{ background: '#fff', padding: '6px 10px', borderRadius: 4 }}>
                                        <Text type="secondary" style={{ fontSize: 11 }}>玩法ID: </Text>
                                        <Text copyable style={{ fontSize: 11, color: '#1890ff' }}>{child.entityId}</Text>
                                        {child.confirmedTime && (
                                          <Text style={{ fontSize: 10, color: '#52c41a', marginLeft: 8 }}>
                                            <CheckCircleOutlined style={{ marginRight: 4 }} />
                                            确认时间: {child.confirmedTime}
                                          </Text>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {renderStatusBadge(child.status)}
                                    {renderActionButton(child.status, () => child.data && handlePlayClick(child.data as PlayMethod))}
                                  </div>
                                </div>
                              </div>
                              {/* 玩法下的优惠券 - 独立区域 */}
                              {child.children && child.children.filter(c => c.type === 'coupon').length > 0 && (
                                <div style={{ marginLeft: 24, marginBottom: 8, padding: '12px', background: '#fff7e6', borderRadius: 8, border: '1px solid #ffd8bf' }}>
                                  <div style={{ fontSize: 13, color: '#fa8c16', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <GiftOutlined />
                                    <Text strong>关联优惠券</Text>
                                  </div>
                                  {child.children?.filter(c => c.type === 'coupon').map((grandChild) => (
                                    <div
                                      key={grandChild.id}
                                      style={{
                                        padding: '10px',
                                        marginBottom: 8,
                                        background: '#fff',
                                        borderRadius: 6,
                                        border: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => grandChild.data && handleCouponClick(grandChild.data as CouponTemplate)}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                        <GiftOutlined style={{ color: '#faad14', fontSize: 16, marginTop: 2 }} />
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                            <Text strong style={{ fontSize: 14 }}>{grandChild.name}</Text>
                                            <Tag color="orange">券</Tag>
                                          </div>
                                          <div style={{ background: '#fafafa', padding: '4px 8px', borderRadius: 4, marginBottom: 4 }}>
                                            <Text type="secondary" style={{ fontSize: 10 }}>ITEM ID: </Text>
                                            <Text copyable style={{ fontSize: 10 }}>{grandChild.itemId}</Text>
                                          </div>
                                          {grandChild.entityId && (
                                            <div style={{ background: '#fafafa', padding: '4px 8px', borderRadius: 4 }}>
                                              <Text type="secondary" style={{ fontSize: 10 }}>优惠券模板ID: </Text>
                                              <Text copyable style={{ fontSize: 10, color: '#faad14' }}>{grandChild.entityId}</Text>
                                              {grandChild.confirmedTime && (
                                                <Text style={{ fontSize: 9, color: '#52c41a', marginLeft: 8 }}>
                                                  <CheckCircleOutlined style={{ marginRight: 4 }} />
                                                  确认时间: {grandChild.confirmedTime}
                                                </Text>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          {renderStatusBadge(grandChild.status)}
                                          {renderActionButton(grandChild.status, () => grandChild.data && handleCouponClick(grandChild.data as CouponTemplate))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* 玩法下的任务 - 独立区域 */}
                              {child.children && child.children.filter(c => c.type === 'task').length > 0 && (
                                <div style={{ marginLeft: 24, marginBottom: 8, padding: '12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                                  <div style={{ fontSize: 13, color: '#52c41a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CheckSquareOutlined />
                                    <Text strong>关联任务</Text>
                                  </div>
                                  {child.children?.filter(c => c.type === 'task').map((grandChild) => (
                                    <div
                                      key={grandChild.id}
                                      style={{
                                        padding: '10px',
                                        marginBottom: 8,
                                        background: '#fff',
                                        borderRadius: 6,
                                        border: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => grandChild.data && handleTaskClick(grandChild.data as MarketingTask)}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                        <CheckSquareOutlined style={{ color: '#52c41a', fontSize: 16, marginTop: 2 }} />
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                            <Text strong style={{ fontSize: 14 }}>{grandChild.name}</Text>
                                            <Tag color="green">任务</Tag>
                                          </div>
                                          <div style={{ background: '#fafafa', padding: '4px 8px', borderRadius: 4, marginBottom: 4 }}>
                                            <Text type="secondary" style={{ fontSize: 10 }}>ITEM ID: </Text>
                                            <Text copyable style={{ fontSize: 10 }}>{grandChild.itemId}</Text>
                                          </div>
                                          {grandChild.entityId && (
                                            <div style={{ background: '#fafafa', padding: '4px 8px', borderRadius: 4 }}>
                                              <Text type="secondary" style={{ fontSize: 10 }}>营销任务ID: </Text>
                                              <Text copyable style={{ fontSize: 10, color: '#52c41a' }}>{grandChild.entityId}</Text>
                                              {grandChild.confirmedTime && (
                                                <Text style={{ fontSize: 9, color: '#52c41a', marginLeft: 8 }}>
                                                  <CheckCircleOutlined style={{ marginRight: 4 }} />
                                                  确认时间: {grandChild.confirmedTime}
                                                </Text>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          {renderStatusBadge(grandChild.status)}
                                          {renderActionButton(grandChild.status, () => grandChild.data && handleTaskClick(grandChild.data as MarketingTask))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* 发布确认弹窗 */}
      <Modal
        title="发布确认"
        open={isPublishModalOpen}
        onOk={handlePublish}
        onCancel={() => setIsPublishModalOpen(false)}
        okText="确认发布"
        cancelText="取消"
        width={600}
      >
        <Alert
          message="即将发布活动页面"
          description="发布后页面将正式可用，用户可通过页面ID访问参与"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Card size="small" title="发布实体概览" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space><FileTextOutlined /> 活动页面</Space>
              <Tag color="blue">{totalPages} 个</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space><RocketOutlined /> 玩法</Space>
              <Tag color="blue">{totalPlays} 个</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space><CheckSquareOutlined /> 营销任务</Space>
              <Tag color="green">{totalTasks} 个</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space><GiftOutlined /> 优惠券模板</Space>
              <Tag color="orange">{totalCoupons} 个</Tag>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>总计</span>
              <span>{progressStats.total} 个实体</span>
            </div>
          </Space>
        </Card>
        <Alert
          message={`草稿确认进度: ${progressPercent}%`}
          description={progressPercent === 100 ? '所有实体已确认，可以发布' : `还有 ${progressStats.pending} 个实体待确认`}
          type={progressPercent === 100 ? 'success' : 'warning'}
          showIcon
        />
      </Modal>
    </div>
  );
}
