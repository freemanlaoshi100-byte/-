export type MainCategory = '数与代数' | '几何' | '统计与概率' | '解决问题';

export type CategoryDisplay = '数与代数' | '图形与几何' | '统计与概率' | '综合与实践';

export interface KnowledgeItem {
  id: string;
  category: MainCategory;
  categoryDisplayName: CategoryDisplay;
  subCategory: string;
  name: string;
  grade: string;
  normalizedGrade: string; // e.g. "一年级上"
}

export interface CategoryStat {
  key: MainCategory;
  displayName: CategoryDisplay;
  subTitle: string;
  iconName: string;
  themeColor: string; // e.g. '#4caf50'
  bgClass: string;
  borderClass: string;
  textClass: string;
  accentClass: string;
  total: number;
  learned: number;
  percentage: number;
}

export type AchievementRarity = 'BRONZE' | 'SILVER' | 'GOLD' | 'LEGEND';

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  rarity: AchievementRarity;
  badgeEmoji: string;
  themeColor: string;
  gradient: string;
  categoryKey?: MainCategory; // 若关联具体分类
  targetCount: number; // 达标数量
  currentCount: number; // 当前已学
  isUnlocked: boolean;
  unlockedAt?: string; // 解锁时间
  rewardPraise: string; // 解锁祝贺语
}

