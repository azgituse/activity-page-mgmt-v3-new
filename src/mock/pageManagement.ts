// 优惠券模板实体
export interface CouponTemplate {
  id: string;
  name: string;
  couponId: string;
  type: 'discount' | 'cash' | 'gift';
  value: string;
  status: 'active' | 'inactive';
  aiDraftStatus: 'pending' | 'confirmed'; // 草稿确认状态
  confirmedTime?: string; // 确认时间
  // 扩展字段：AI生成的完整草稿配置
  aiDraftConfig?: {
    couponName: string;
    couponType: 'discount' | 'cash' | 'gift';
    discountValue: string;
    minOrderAmount: number;
    validityDays: number;
    usageScope: string[];
    limitPerUser: number;
    totalQuantity: number;
    description: string;
  };
}

// 营销任务实体 - 与玩法同层级
export interface MarketingTask {
  id: string;
  name: string;
  taskId: string;
  type: 'order' | 'browse' | 'share' | 'signin' | 'invite';
  status: 'active' | 'inactive';
  aiDraftStatus: 'pending' | 'confirmed'; // 草稿确认状态
  confirmedTime?: string; // 确认时间
  // 关联的玩法ID列表（一个任务可关联多个玩法）
  relatedPlayIds: string[];
  // AI生成的完整草稿配置
  aiDraftConfig?: {
    taskName: string;
    taskType: 'order' | 'browse' | 'share' | 'signin' | 'invite';
    startTime: string;
    endTime: string;
    memberScope: 'all' | 'vip' | 'card' | 'level';
    dailyLimit: number;
    totalLimit: number;
    taskRules: {
      triggerType: 'link' | 'share' | 'page' | 'subscribe';
      targetPage?: string;
    };
    rewardConfig: {
      rewardType: 'play_chance' | 'coupon';
      playChance?: {
        playId: string;
        chanceCount: number;
      };
    };
    taskIcon: string;
    taskSubtitle: string;
    taskDesc: string;
  };
}

// 玩法实体
export interface PlayMethod {
  id: string;
  name: string;
  playId: string;
  type: string;
  status: 'active' | 'inactive';
  aiDraftStatus: 'pending' | 'confirmed'; // 草稿确认状态
  confirmedTime?: string; // 确认时间
  // 关联的优惠券模板列表
  coupons: CouponTemplate[];
  // 关联的营销任务ID列表
  relatedTaskIds: string[];
  // AI生成的完整草稿配置
  aiDraftConfig?: {
    playName: string;
    playType: string;
    startTime: string;
    endTime: string;
    playDesc: string;
    playBelong: string;
    playTheme: string;
    // 玩法内容配置
    playContent: {
      initialChance: number;
      chanceType: 'daily' | 'total';
      memberScope: ('all' | 'vip' | 'card' | 'level')[];
      groupLimit: boolean;
      blacklistLimit: boolean;
    };
    // 发奖配置
    awardConfig: {
      awardType: 'coupon' | 'points' | 'physical';
      coupons?: string[];
    };
  };
}

// 活动页面实体
export interface ActivityPage {
  id: string;
  pageId: string;
  pageName: string;
  sourceTask: string;
  sourceTaskName: string;
  status: 'draft' | 'published';
  aiDraftStatus: 'pending' | 'confirmed';
  // 业务系统状态：已启用、已停用、草稿
  bizStatus: 'enabled' | 'disabled' | 'draft';
  createTime: string;
  publisher?: string;
  publishTime?: string;
  // 关联的玩法列表
  plays: PlayMethod[];
  // 关联的营销任务列表（页面级别的任务）
  marketingTasks: MarketingTask[];
  // AI生成的页面草稿配置
  aiDraftConfig?: {
    pageTitle: string;
    pageSubtitle: string;
    pageBg: 'none' | 'color' | 'image';
    bgColor?: string;
    bgImage?: string;
    componentStack: string[];
    shareConfig: {
      enable: boolean;
      shareTitle?: string;
      shareImage?: string;
    };
  };
}

// 辅助函数：计算优惠券总数
export function getTotalCouponCount(page: ActivityPage): number {
  return page.plays.reduce((total, play) => total + play.coupons.length, 0);
}

// 辅助函数：获取所有玩法名称
export function getPlayNames(page: ActivityPage): string[] {
  return page.plays.map(play => play.name);
}

// 辅助函数：获取所有优惠券名称
export function getAllCouponNames(page: ActivityPage): string[] {
  const names: string[] = [];
  page.plays.forEach(play => {
    play.coupons.forEach(coupon => {
      names.push(coupon.name);
    });
  });
  return names;
}

// 辅助函数：获取所有营销任务名称
export function getAllTaskNames(page: ActivityPage): string[] {
  return page.marketingTasks.map(task => task.name);
}

// 辅助函数：获取玩法关联的任务
export function getTasksForPlay(page: ActivityPage, playId: string): MarketingTask[] {
  return page.marketingTasks.filter(task => task.relatedPlayIds.includes(playId));
}

// 辅助函数：获取页面中所有关联的任务（包括玩法级和页面级）
export function getAllTasks(page: ActivityPage): MarketingTask[] {
  const playTasks = page.plays.flatMap(play =>
    page.marketingTasks.filter(task => task.relatedPlayIds.includes(play.id))
  );
  const pageTasks = page.marketingTasks.filter(task => task.relatedPlayIds.length === 0);
  return [...playTasks, ...pageTasks];
}

// 辅助函数：计算营销任务总数
export function getTotalTaskCount(page: ActivityPage): number {
  // 去重计算（一个任务可能关联多个玩法）
  const uniqueTaskIds = new Set(page.marketingTasks.map(t => t.id));
  return uniqueTaskIds.size;
}

// Mock数据
export const mockPages: ActivityPage[] = [
  {
    id: '1',
    pageId: '待生成',
    pageName: '38女神节-线上活动页',
    sourceTask: 'TSK-20260308-001',
    sourceTaskName: '38女神节-线上活动',
    status: 'draft',
    aiDraftStatus: 'pending',
    bizStatus: 'draft',
    createTime: '2026-03-08 14:20',
    aiDraftConfig: {
      pageTitle: '38女神节-线上活动页',
      pageSubtitle: '玩法集合页',
      pageBg: 'image',
      bgImage: 'https://example.com/bg/38.jpg',
      componentStack: ['banner', 'play-grid', 'task-list'],
      shareConfig: {
        enable: true,
        shareTitle: '38女神节抽大奖',
        shareImage: 'https://example.com/share/38.jpg',
      },
    },
    plays: [
      {
        id: 'p1-1',
        name: '每日签到抽奖',
        playId: 'PLY-20260308-001-A',
        type: '抽奖玩法',
        status: 'active',
        aiDraftStatus: 'confirmed',
        confirmedTime: '2026-03-08 14:30:25',
        relatedTaskIds: ['t1-1'], // 关联营销任务
        coupons: [
          {
            id: 'c1-1-1',
            name: '满30减5通用券',
            couponId: '待生成',
            type: 'cash',
            value: '5元',
            status: 'active',
            aiDraftStatus: 'pending',
            aiDraftConfig: {
              couponName: '满30减5通用券',
              couponType: 'cash',
              discountValue: '5',
              minOrderAmount: 30,
              validityDays: 7,
              usageScope: ['all'],
              limitPerUser: 1,
              totalQuantity: 10000,
              description: '满30元可用，全场通用',
            },
          },
          {
            id: 'c1-1-2',
            name: '8折小程序专享券',
            couponId: 'CPN-20260308-001-A2',
            type: 'discount',
            value: '8折',
            status: 'active',
            aiDraftStatus: 'confirmed',
            confirmedTime: '2026-03-08 14:35:18',
            aiDraftConfig: {
              couponName: '8折小程序专享券',
              couponType: 'discount',
              discountValue: '20',
              minOrderAmount: 0,
              validityDays: 14,
              usageScope: ['miniapp'],
              limitPerUser: 2,
              totalQuantity: 5000,
              description: '小程序专享，最高减20元',
            },
          },
        ],
        aiDraftConfig: {
          playName: '每日签到抽奖',
          playType: '抽奖玩法',
          startTime: '2026-03-08 00:00:00',
          endTime: '2026-03-15 23:59:59',
          playDesc: '每日签到即可获得抽奖机会',
          playBelong: '活动本地生活动',
          playTheme: '2026年3月xx活动项目',
          playContent: {
            initialChance: 1,
            chanceType: 'daily',
            memberScope: ['all'],
            groupLimit: false,
            blacklistLimit: false,
          },
          awardConfig: {
            awardType: 'coupon',
            coupons: ['c1-1-1', 'c1-1-2'],
          },
        },
      },
      {
        id: 'p1-2',
        name: '分享好友领券',
        playId: '待生成',
        type: '分享裂变',
        status: 'active',
        aiDraftStatus: 'pending',
        relatedTaskIds: ['t1-2'],
        coupons: [
          {
            id: 'c1-2-1',
            name: '新客立减10元券',
            couponId: 'CPN-20260308-001-B1',
            type: 'cash',
            value: '10元',
            status: 'active',
            aiDraftStatus: 'confirmed',
            confirmedTime: '2026-03-08 14:40:12',
            aiDraftConfig: {
              couponName: '新客立减10元券',
              couponType: 'cash',
              discountValue: '10',
              minOrderAmount: 20,
              validityDays: 30,
              usageScope: ['all'],
              limitPerUser: 1,
              totalQuantity: 2000,
              description: '新用户专享，满20元可用',
            },
          },
          {
            id: 'c1-2-2',
            name: '第二杯半价券',
            couponId: '待生成',
            type: 'discount',
            value: '5折',
            status: 'active',
            aiDraftStatus: 'pending',
            aiDraftConfig: {
              couponName: '第二杯半价券',
              couponType: 'discount',
              discountValue: '50',
              minOrderAmount: 0,
              validityDays: 7,
              usageScope: ['store'],
              limitPerUser: 3,
              totalQuantity: 3000,
              description: '第二杯半价，门店可用',
            },
          },
          {
            id: 'c1-2-3',
            name: '免配送费券',
            couponId: 'CPN-20260308-001-B3',
            type: 'gift',
            value: '免配送',
            status: 'active',
            aiDraftStatus: 'pending',
            aiDraftConfig: {
              couponName: '免配送费券',
              couponType: 'gift',
              discountValue: '免配送',
              minOrderAmount: 0,
              validityDays: 3,
              usageScope: ['delivery'],
              limitPerUser: 5,
              totalQuantity: 10000,
              description: '外卖订单免配送费',
            },
          },
        ],
        aiDraftConfig: {
          playName: '分享好友领券',
          playType: '分享裂变',
          startTime: '2026-03-08 00:00:00',
          endTime: '2026-03-15 23:59:59',
          playDesc: '分享活动给好友，双方均可获得优惠券',
          playBelong: '活动本地生活动',
          playTheme: '2026年3月xx活动项目',
          playContent: {
            initialChance: 0,
            chanceType: 'total',
            memberScope: ['all'],
            groupLimit: true,
            blacklistLimit: true,
          },
          awardConfig: {
            awardType: 'coupon',
            coupons: ['c1-2-1', 'c1-2-2', 'c1-2-3'],
          },
        },
      },
    ],
    marketingTasks: [
      {
        id: 't1-1',
        name: '每日签到任务',
        taskId: '待生成',
        type: 'signin',
        status: 'active',
        aiDraftStatus: 'pending',
        relatedPlayIds: ['p1-1'],
        aiDraftConfig: {
          taskName: '每日签到任务',
          taskType: 'signin',
          startTime: '2026-03-08 00:00:00',
          endTime: '2026-03-15 23:59:59',
          memberScope: 'all',
          dailyLimit: 1,
          totalLimit: 7,
          taskRules: {
            triggerType: 'page',
            targetPage: '/activity/signin',
          },
          rewardConfig: {
            rewardType: 'play_chance',
            playChance: {
              playId: 'p1-1',
              chanceCount: 1,
            },
          },
          taskIcon: 'https://example.com/icon/signin.png',
          taskSubtitle: '小程序自提/外卖订单下单',
          taskDesc: '每日签到即可获得抽奖机会',
        },
      },
      {
        id: 't1-2',
        name: '邀请好友任务',
        taskId: 'TSK-20260308-001-B1',
        type: 'invite',
        status: 'active',
        aiDraftStatus: 'confirmed',
        confirmedTime: '2026-03-08 14:45:33',
        relatedPlayIds: ['p1-2'],
        aiDraftConfig: {
          taskName: '邀请好友任务',
          taskType: 'invite',
          startTime: '2026-03-08 00:00:00',
          endTime: '2026-03-15 23:59:59',
          memberScope: 'all',
          dailyLimit: 5,
          totalLimit: 20,
          taskRules: {
            triggerType: 'share',
          },
          rewardConfig: {
            rewardType: 'play_chance',
            playChance: {
              playId: 'p1-2',
              chanceCount: 1,
            },
          },
          taskIcon: 'https://example.com/icon/invite.png',
          taskSubtitle: '添加企业微信',
          taskDesc: '邀请好友参与活动，获得抽奖机会',
        },
      },
    ],
  },
  {
    id: '2',
    pageId: 'PG-20260308-002',
    pageName: '38女神节-门店活动页',
    sourceTask: 'TSK-20260308-002',
    sourceTaskName: '38女神节-门店活动',
    status: 'published',
    aiDraftStatus: 'confirmed',
    bizStatus: 'enabled',
    createTime: '2026-03-08 14:25',
    publisher: '陈悦',
    publishTime: '2026-03-08 16:30',
    aiDraftConfig: {
      pageTitle: '38女神节-门店活动页',
      pageSubtitle: '门店专属活动',
      pageBg: 'color',
      bgColor: '#FFE4E1',
      componentStack: ['banner', 'play-grid', 'coupon-list'],
      shareConfig: {
        enable: true,
        shareTitle: '门店38女神节活动',
        shareImage: 'https://example.com/share/store-38.jpg',
      },
    },
    plays: [
      {
        id: 'p2-1',
        name: '到店扫码领券',
        playId: 'PLY-20260308-002-A',
        type: '领券玩法',
        status: 'active',
        aiDraftStatus: 'confirmed',
        relatedTaskIds: [],
        coupons: [
          {
            id: 'c2-1-1',
            name: '门店8折券',
            couponId: 'CPN-20260308-002-A1',
            type: 'discount',
            value: '8折',
            status: 'active',
            aiDraftStatus: 'confirmed',
            aiDraftConfig: {
              couponName: '门店8折券',
              couponType: 'discount',
              discountValue: '20',
              minOrderAmount: 0,
              validityDays: 7,
              usageScope: ['store'],
              limitPerUser: 1,
              totalQuantity: 500,
              description: '门店专属8折券',
            },
          },
        ],
        aiDraftConfig: {
          playName: '到店扫码领券',
          playType: '领券玩法',
          startTime: '2026-03-08 00:00:00',
          endTime: '2026-03-15 23:59:59',
          playDesc: '到店扫码即可领取优惠券',
          playBelong: '活动本地生活动',
          playTheme: '门店活动',
          playContent: {
            initialChance: 1,
            chanceType: 'total',
            memberScope: ['all'],
            groupLimit: false,
            blacklistLimit: false,
          },
          awardConfig: {
            awardType: 'coupon',
            coupons: ['c2-1-1'],
          },
        },
      },
      {
        id: 'p2-2',
        name: '消费满额抽奖',
        playId: 'PLY-20260308-002-B',
        type: '抽奖玩法',
        status: 'active',
        aiDraftStatus: 'confirmed',
        relatedTaskIds: ['t2-1'],
        coupons: [
          {
            id: 'c2-2-1',
            name: '满100减20券',
            couponId: 'CPN-20260308-002-B1',
            type: 'cash',
            value: '20元',
            status: 'active',
            aiDraftStatus: 'confirmed',
            aiDraftConfig: {
              couponName: '满100减20券',
              couponType: 'cash',
              discountValue: '20',
              minOrderAmount: 100,
              validityDays: 14,
              usageScope: ['all'],
              limitPerUser: 2,
              totalQuantity: 1000,
              description: '满100元减20元',
            },
          },
          {
            id: 'c2-2-2',
            name: '全场5折券',
            couponId: 'CPN-20260308-002-B2',
            type: 'discount',
            value: '5折',
            status: 'active',
            aiDraftStatus: 'confirmed',
            aiDraftConfig: {
              couponName: '全场5折券',
              couponType: 'discount',
              discountValue: '50',
              minOrderAmount: 0,
              validityDays: 3,
              usageScope: ['all'],
              limitPerUser: 1,
              totalQuantity: 500,
              description: '全场5折，最高减50元',
            },
          },
        ],
        aiDraftConfig: {
          playName: '消费满额抽奖',
          playType: '抽奖玩法',
          startTime: '2026-03-08 00:00:00',
          endTime: '2026-03-15 23:59:59',
          playDesc: '消费满100元即可获得抽奖机会',
          playBelong: '活动本地生活动',
          playTheme: '消费返券',
          playContent: {
            initialChance: 0,
            chanceType: 'total',
            memberScope: ['all'],
            groupLimit: true,
            blacklistLimit: true,
          },
          awardConfig: {
            awardType: 'coupon',
            coupons: ['c2-2-1', 'c2-2-2'],
          },
        },
      },
      {
        id: 'p2-3',
        name: '会员专属秒杀',
        playId: 'PLY-20260308-002-C',
        type: '限时秒杀',
        status: 'active',
        aiDraftStatus: 'confirmed',
        relatedTaskIds: [],
        coupons: [
          {
            id: 'c2-3-1',
            name: '9.9元特价券',
            couponId: 'CPN-20260308-002-C1',
            type: 'gift',
            value: '特价',
            status: 'active',
            aiDraftStatus: 'confirmed',
            aiDraftConfig: {
              couponName: '9.9元特价券',
              couponType: 'gift',
              discountValue: '特价',
              minOrderAmount: 0,
              validityDays: 1,
              usageScope: ['store'],
              limitPerUser: 1,
              totalQuantity: 100,
              description: '会员专享9.9元特价',
            },
          },
        ],
        aiDraftConfig: {
          playName: '会员专属秒杀',
          playType: '限时秒杀',
          startTime: '2026-03-08 12:00:00',
          endTime: '2026-03-08 14:00:00',
          playDesc: '会员专属限时秒杀活动',
          playBelong: '活动本地生活动',
          playTheme: '会员专享',
          playContent: {
            initialChance: 1,
            chanceType: 'total',
            memberScope: ['vip'],
            groupLimit: false,
            blacklistLimit: false,
          },
          awardConfig: {
            awardType: 'coupon',
            coupons: ['c2-3-1'],
          },
        },
      },
    ],
    marketingTasks: [
      {
        id: 't2-1',
        name: '消费任务',
        taskId: 'TSK-20260308-002-B1',
        type: 'order',
        status: 'active',
        aiDraftStatus: 'confirmed',
        relatedPlayIds: ['p2-2'],
        aiDraftConfig: {
          taskName: '消费任务',
          taskType: 'order',
          startTime: '2026-03-08 00:00:00',
          endTime: '2026-03-15 23:59:59',
          memberScope: 'all',
          dailyLimit: 3,
          totalLimit: 10,
          taskRules: {
            triggerType: 'link',
            targetPage: '/order/complete',
          },
          rewardConfig: {
            rewardType: 'play_chance',
            playChance: {
              playId: 'p2-2',
              chanceCount: 1,
            },
          },
          taskIcon: 'https://example.com/icon/order.png',
          taskSubtitle: '完成一笔订单',
          taskDesc: '活动期间内完成1次订单',
        },
      },
    ],
  },
  {
    id: '3',
    pageId: 'PG-20260310-003',
    pageName: '春季新品发布会活动页',
    sourceTask: 'TSK-20260310-003',
    sourceTaskName: '春季新品发布会',
    status: 'draft',
    aiDraftStatus: 'confirmed',
    bizStatus: 'disabled',
    createTime: '2026-03-10 09:15',
    aiDraftConfig: {
      pageTitle: '春季新品发布会活动页',
      pageSubtitle: '新品抢先体验',
      pageBg: 'image',
      bgImage: 'https://example.com/bg/spring.jpg',
      componentStack: ['banner', 'play-grid'],
      shareConfig: {
        enable: true,
        shareTitle: '春季新品发布会',
        shareImage: 'https://example.com/share/spring.jpg',
      },
    },
    plays: [
      {
        id: 'p3-1',
        name: '新品试饮游戏',
        playId: 'PLY-20260310-003-A',
        type: '互动游戏',
        status: 'active',
        aiDraftStatus: 'confirmed',
        relatedTaskIds: ['t3-1'],
        coupons: [
          {
            id: 'c3-1-1',
            name: '新品买一送一券',
            couponId: 'CPN-20260310-003-A1',
            type: 'gift',
            value: '买一送一',
            status: 'active',
            aiDraftStatus: 'confirmed',
            aiDraftConfig: {
              couponName: '新品买一送一券',
              couponType: 'gift',
              discountValue: '买一送一',
              minOrderAmount: 0,
              validityDays: 7,
              usageScope: ['all'],
              limitPerUser: 2,
              totalQuantity: 2000,
              description: '新品买一送一',
            },
          },
          {
            id: 'c3-1-2',
            name: '新品7折券',
            couponId: 'CPN-20260310-003-A2',
            type: 'discount',
            value: '7折',
            status: 'active',
            aiDraftStatus: 'confirmed',
            aiDraftConfig: {
              couponName: '新品7折券',
              couponType: 'discount',
              discountValue: '30',
              minOrderAmount: 0,
              validityDays: 14,
              usageScope: ['all'],
              limitPerUser: 3,
              totalQuantity: 3000,
              description: '新品7折优惠',
            },
          },
        ],
        aiDraftConfig: {
          playName: '新品试饮游戏',
          playType: '互动游戏',
          startTime: '2026-03-10 00:00:00',
          endTime: '2026-03-20 23:59:59',
          playDesc: '参与新品试饮游戏，赢取优惠券',
          playBelong: '新品发布会',
          playTheme: '春季新品',
          playContent: {
            initialChance: 3,
            chanceType: 'total',
            memberScope: ['all'],
            groupLimit: false,
            blacklistLimit: false,
          },
          awardConfig: {
            awardType: 'coupon',
            coupons: ['c3-1-1', 'c3-1-2'],
          },
        },
      },
    ],
    marketingTasks: [
      {
        id: 't3-1',
        name: '浏览新品任务',
        taskId: 'TSK-20260310-003-A1',
        type: 'browse',
        status: 'active',
        aiDraftStatus: 'confirmed',
        relatedPlayIds: ['p3-1'],
        aiDraftConfig: {
          taskName: '浏览新品任务',
          taskType: 'browse',
          startTime: '2026-03-10 00:00:00',
          endTime: '2026-03-20 23:59:59',
          memberScope: 'all',
          dailyLimit: 1,
          totalLimit: 5,
          taskRules: {
            triggerType: 'page',
            targetPage: '/product/new',
          },
          rewardConfig: {
            rewardType: 'play_chance',
            playChance: {
              playId: 'p3-1',
              chanceCount: 1,
            },
          },
          taskIcon: 'https://example.com/icon/browse.png',
          taskSubtitle: '浏览新品页面',
          taskDesc: '浏览指定新品页面10秒以上',
        },
      },
    ],
  },
];

export function getPageById(id: string): ActivityPage | undefined {
  return mockPages.find(page => page.id === id);
}

// 全局实体数据
export const mockPlays: PlayMethod[] = mockPages.flatMap(page => page.plays);
export const mockCouponTemplates: CouponTemplate[] = mockPages.flatMap(page => page.plays.flatMap(play => play.coupons));
export const mockMarketingTasks: MarketingTask[] = mockPages.flatMap(page => page.marketingTasks);
