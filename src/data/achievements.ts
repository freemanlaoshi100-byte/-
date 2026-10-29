import { Achievement, CategoryStat, MainCategory } from '../types/math';

export interface RawAchievementConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  rarity: Achievement['rarity'];
  badgeEmoji: string;
  themeColor: string;
  gradient: string;
  categoryKey?: MainCategory;
  targetCount: number;
  rewardPraise: string;
}

export const ACHIEVEMENTS_CONFIG: RawAchievementConfig[] = [
  {
    id: 'ach_number_algebra',
    title: '数与代数大宗师',
    subtitle: '核心运算与代数模型大圆满',
    description: '完成【数与代数】分类全部 106 个知识点',
    rarity: 'GOLD',
    badgeEmoji: '🧮',
    themeColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    categoryKey: '数与代数',
    targetCount: 106,
    rewardPraise: '恭喜你！精通万以内与亿以内大数、多位数乘除笔算、分数小数互化与简易方程，打下了坚实无匹的数感基石！',
  },
  {
    id: 'ach_geometry',
    title: '空间几何探索官',
    subtitle: '多维空间与测量全精通',
    description: '完成【图形与几何】分类全部 57 个知识点',
    rarity: 'GOLD',
    badgeEmoji: '📐',
    themeColor: '#0284c7',
    gradient: 'from-sky-500 to-blue-600',
    categoryKey: '几何',
    targetCount: 57,
    rewardPraise: '太棒了！从线段角平移、长方形正方形到立体长方体圆柱圆锥，你的空间几何想象力与计算力已臻化境！',
  },
  {
    id: 'ach_statistics',
    title: '数据概率领航员',
    subtitle: '数据洞察与科学预测',
    description: '完成【统计与概率】分类全部 6 个知识点',
    rarity: 'SILVER',
    badgeEmoji: '📊',
    themeColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600',
    categoryKey: '统计与概率',
    targetCount: 6,
    rewardPraise: '出色完成！熟练运用条形、折线与扇形统计图，掌握平均数与排列组合可能性，具备敏锐的科学数据思维！',
  },
  {
    id: 'ach_practical_problems',
    title: '实践应用解题圣手',
    subtitle: '生活数学与高维思维飞跃',
    description: '完成【综合与实践】分类全部 72 个知识点',
    rarity: 'GOLD',
    badgeEmoji: '💡',
    themeColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    categoryKey: '解决问题',
    targetCount: 72,
    rewardPraise: '令人赞叹！全面攻克鸡兔同笼、植树问题、工程相遇与40类经典奥数拓展题，你就是生活中的数学大侦探！',
  },
  {
    id: 'ach_first_spark',
    title: '启航新星',
    subtitle: '千里之行 · 始于足下',
    description: '成功攻克全书第 1 个知识点',
    rarity: 'BRONZE',
    badgeEmoji: '🌱',
    themeColor: '#06b6d4',
    gradient: 'from-cyan-400 to-teal-500',
    targetCount: 1,
    rewardPraise: '太棒了！迈出了小学数学提前学与自测的第一步，成长的种子正在悄悄发芽！',
  },
  {
    id: 'ach_quarter_milestone',
    title: '学海渐入佳境',
    subtitle: '攻克全书四分之一考点',
    description: '累计完成 60 个知识点（达成 25% 进度）',
    rarity: 'SILVER',
    badgeEmoji: '⭐',
    themeColor: '#3b82f6',
    gradient: 'from-blue-400 to-indigo-500',
    targetCount: 60,
    rewardPraise: '自律见真章！已不知不觉攻克全书1/4的核心考点，数学思考习惯已初具模型！',
  },
  {
    id: 'ach_half_milestone',
    title: '半壁江山 · 思维领跑',
    subtitle: '跨过半程分水岭',
    description: '累计完成 120 个知识点（达成 50% 进度）',
    rarity: 'GOLD',
    badgeEmoji: '🚀',
    themeColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    targetCount: 120,
    rewardPraise: '势不可挡！全书考点已通关过半，你的专注与毅力已超越大多数同龄人，向着全能小博士全速冲刺！',
  },
  {
    id: 'ach_grand_master',
    title: '全能大满贯 · 数学小博士',
    subtitle: '小学六年核心素养终极巅峰',
    description: '全部 241 个考点 100% 掌握',
    rarity: 'LEGEND',
    badgeEmoji: '👑',
    themeColor: '#eab308',
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    targetCount: 241,
    rewardPraise: '登峰造极！你已通关小学新课标全部 241 个考点与奥数思维专题，荣获至高无上的【小学全能数学小博士】荣誉勋章！',
  },
];

/**
 * 根据当前已学进度和分类统计，计算当前所有成就的状态
 */
export function computeAchievements(
  learnedCount: number,
  categoryStats: CategoryStat[],
  unlockDates: Record<string, string>
): Achievement[] {
  return ACHIEVEMENTS_CONFIG.map((cfg) => {
    let currentCount = 0;

    if (cfg.categoryKey) {
      const cat = categoryStats.find((c) => c.key === cfg.categoryKey);
      currentCount = cat ? cat.learned : 0;
    } else {
      currentCount = learnedCount;
    }

    const isUnlocked = currentCount >= cfg.targetCount;
    const unlockedAt = unlockDates[cfg.id];

    return {
      ...cfg,
      currentCount: Math.min(cfg.targetCount, currentCount),
      isUnlocked,
      unlockedAt,
    };
  });
}
