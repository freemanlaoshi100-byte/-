import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ALL_MATH_ITEMS } from '../data/rawMathData';
import { KnowledgeItem, MainCategory, CategoryStat, Achievement } from '../types/math';
import { computeAchievements } from '../data/achievements';

const STORAGE_KEY = 'primary_math_learned_set_v1';
const DATES_STORAGE_KEY = 'primary_math_learned_dates_v1';
const UNLOCK_STORAGE_KEY = 'primary_math_achievements_unlocks_v1';

// 生成上周的模拟打卡时间戳辅助函数
function getDefaultSeedDates(): { ids: string[]; dates: Record<string, string> } {
  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  
  // 选取几个极具代表性的基础考点预置为“上周完成”
  const candidates = [
    ALL_MATH_ITEMS[0]?.id, // 认识10以内的数字
    ALL_MATH_ITEMS[1]?.id, // 认识11-20
    ALL_MATH_ITEMS[7]?.id, // 加法的认识
    ALL_MATH_ITEMS[106]?.id, // 认识厘米
    ALL_MATH_ITEMS[175]?.id, // 找规律
  ].filter(Boolean) as string[];

  const dates: Record<string, string> = {};
  // 8~11天前，属于标准上一周
  candidates.forEach((id, idx) => {
    const d = new Date(now.getTime() - (8 + idx) * dayMs);
    dates[id] = d.toISOString();
  });

  return { ids: candidates, dates };
}

export function useMathLearningProgress() {
  // 初始预置数据
  const defaultSeeds = useMemo(() => getDefaultSeedDates(), []);

  // 记录每个知识点的完成时间戳 map (id -> ISO string)
  const [learnedDates, setLearnedDates] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(DATES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read learned dates from localStorage:', e);
    }
    return defaultSeeds.dates;
  });

  // 从 localStorage 恢复已学知识点 ID 集合
  const [learnedIds, setLearnedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) {
          return new Set(arr);
        }
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }
    // 首次载入时使用种子数据
    return new Set<string>(defaultSeeds.ids);
  });

  // 记录每个成就的解锁日期
  const [unlockDates, setUnlockDates] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(UNLOCK_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read unlock dates from localStorage:', e);
    }
    return {};
  });

  // 最新解锁的成就（用于弹出庆祝勋章弹窗）
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);

  // 持久化存储已学知识点到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(learnedIds)));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [learnedIds]);

  // 持久化存储打卡时间戳到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DATES_STORAGE_KEY, JSON.stringify(learnedDates));
    } catch (e) {
      console.error('Failed to save learned dates:', e);
    }
  }, [learnedDates]);

  // 持久化存储成就解锁记录
  useEffect(() => {
    try {
      localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(unlockDates));
    } catch (e) {
      console.error('Failed to save unlock dates:', e);
    }
  }, [unlockDates]);

  // 监听来自 iframe 内部 postMessage 发送的标记已学事件
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TOGGLE_LEARNED_FROM_IFRAME') {
        const { id, name } = event.data;
        const nowIso = new Date().toISOString();
        if (id) {
          setLearnedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
          setLearnedDates((prev) => ({ ...prev, [id]: prev[id] || nowIso }));
        } else if (name) {
          const matched = ALL_MATH_ITEMS.find((it) => it.name === name);
          if (matched) {
            setLearnedIds((prev) => {
              const next = new Set(prev);
              next.add(matched.id);
              return next;
            });
            setLearnedDates((prev) => ({ ...prev, [matched.id]: prev[matched.id] || nowIso }));
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 切换单个知识点已学状态
  const toggleLearned = useCallback((id: string) => {
    const nowIso = new Date().toISOString();
    setLearnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    setLearnedDates((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = nowIso;
      }
      return next;
    });
  }, []);

  // 一键重置特定知识点状态（标记为未学）
  const resetSpecificItem = useCallback((id: string) => {
    setLearnedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setLearnedDates((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // 批量标记已学或未学
  const batchSetLearned = useCallback((ids: string[], isLearned: boolean) => {
    const nowIso = new Date().toISOString();
    setLearnedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (isLearned) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });

    setLearnedDates((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        if (isLearned) {
          if (!next[id]) next[id] = nowIso;
        } else {
          delete next[id];
        }
      });
      return next;
    });
  }, []);

  // 一键点亮某个分类所有知识点（极度方便测试勋章解锁）
  const unlockEntireCategory = useCallback((catKey: MainCategory) => {
    const idsInCat = ALL_MATH_ITEMS.filter((it) => it.category === catKey).map((it) => it.id);
    batchSetLearned(idsInCat, true);
  }, [batchSetLearned]);

  // 模拟添加上周学习记录（供用户随时体验与测试）
  const seedLastWeekDemoData = useCallback(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const now = new Date();
    // 挑出前 6 个考点
    const sampleItems = ALL_MATH_ITEMS.slice(0, 6);
    const newDates: Record<string, string> = {};

    setLearnedIds((prev) => {
      const next = new Set(prev);
      sampleItems.forEach((it, idx) => {
        next.add(it.id);
        // 8~12 天前（上一周）
        const d = new Date(now.getTime() - (8 + (idx % 4)) * dayMs);
        newDates[it.id] = d.toISOString();
      });
      return next;
    });

    setLearnedDates((prev) => ({
      ...prev,
      ...newDates,
    }));
  }, []);

  // 清空重置
  const resetAllProgress = useCallback(() => {
    if (window.confirm('确定要重置所有知识点的学习进度吗？这会将所有知识点和勋章记录恢复为初始状态。')) {
      setLearnedIds(new Set());
      setLearnedDates({});
      setUnlockDates({});
      setNewlyUnlockedAchievement(null);
    }
  }, []);

  // 计算总统计
  const totalCount = ALL_MATH_ITEMS.length;
  const learnedCount = useMemo(() => {
    let count = 0;
    for (const item of ALL_MATH_ITEMS) {
      if (learnedIds.has(item.id)) {
        count++;
      }
    }
    return count;
  }, [learnedIds]);

  const totalPercentage = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  // 四大核心模块的详细统计
  const categoryStats: CategoryStat[] = useMemo(() => {
    const categoriesConfig: Array<{
      key: MainCategory;
      displayName: CategoryStat['displayName'];
      subTitle: string;
      iconName: string;
      themeColor: string;
      bgClass: string;
      borderClass: string;
      textClass: string;
      accentClass: string;
    }> = [
      {
        key: '数与代数',
        displayName: '数与代数',
        subTitle: '数的认识 · 加减乘除 · 分数小数 · 简易方程',
        iconName: 'Calculator',
        themeColor: '#4caf50',
        bgClass: 'bg-emerald-50/70 hover:bg-emerald-50',
        borderClass: 'border-emerald-200',
        textClass: 'text-emerald-800',
        accentClass: 'bg-emerald-500',
      },
      {
        key: '几何',
        displayName: '图形与几何',
        subTitle: '长度面积 · 平面图形 · 长正方体 · 空间方向',
        iconName: 'Shapes',
        themeColor: '#0284c7',
        bgClass: 'bg-sky-50/70 hover:bg-sky-50',
        borderClass: 'border-sky-200',
        textClass: 'text-sky-800',
        accentClass: 'bg-sky-500',
      },
      {
        key: '统计与概率',
        displayName: '统计与概率',
        subTitle: '条形折线 · 扇形图表 · 平均数 · 可能性',
        iconName: 'BarChart3',
        themeColor: '#8b5cf6',
        bgClass: 'bg-purple-50/70 hover:bg-purple-50',
        borderClass: 'border-purple-200',
        textClass: 'text-purple-800',
        accentClass: 'bg-purple-500',
      },
      {
        key: '解决问题',
        displayName: '综合与实践',
        subTitle: '数学广角 · 应用题精练 · 典型思维拓展',
        iconName: 'Lightbulb',
        themeColor: '#f59e0b',
        bgClass: 'bg-amber-50/70 hover:bg-amber-50',
        borderClass: 'border-amber-200',
        textClass: 'text-amber-800',
        accentClass: 'bg-amber-500',
      },
    ];

    return categoriesConfig.map((cfg) => {
      const itemsInCat = ALL_MATH_ITEMS.filter((it) => it.category === cfg.key);
      const total = itemsInCat.length;
      const learned = itemsInCat.filter((it) => learnedIds.has(it.id)).length;
      const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;

      return {
        ...cfg,
        total,
        learned,
        percentage,
      };
    });
  }, [learnedIds]);

  // 计算成就列表
  const achievements: Achievement[] = useMemo(() => {
    return computeAchievements(learnedCount, categoryStats, unlockDates);
  }, [learnedCount, categoryStats, unlockDates]);

  // 检测新解锁的成就
  const previousUnlockedIds = useRef<Set<string>>(new Set(Object.keys(unlockDates)));
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      achievements.forEach((ach) => {
        if (ach.isUnlocked && !unlockDates[ach.id]) {
          const nowStr = new Date().toISOString().slice(0, 10);
          setUnlockDates((prev) => ({ ...prev, [ach.id]: nowStr }));
        }
      });
      previousUnlockedIds.current = new Set(
        achievements.filter((a) => a.isUnlocked).map((a) => a.id)
      );
      return;
    }

    const newlyUnlocked: Achievement[] = [];
    achievements.forEach((ach) => {
      if (ach.isUnlocked && !previousUnlockedIds.current.has(ach.id)) {
        newlyUnlocked.push(ach);
      }
    });

    if (newlyUnlocked.length > 0) {
      const nowStr = new Date().toISOString().slice(0, 10);
      setUnlockDates((prev) => {
        const next = { ...prev };
        newlyUnlocked.forEach((ach) => {
          if (!next[ach.id]) next[ach.id] = nowStr;
        });
        return next;
      });

      // 触发最新成就弹窗
      setNewlyUnlockedAchievement(newlyUnlocked[0]);

      previousUnlockedIds.current = new Set(
        achievements.filter((a) => a.isUnlocked).map((a) => a.id)
      );
    }
  }, [achievements, unlockDates]);

  const closeCelebration = useCallback(() => {
    setNewlyUnlockedAchievement(null);
  }, []);

  return {
    items: ALL_MATH_ITEMS,
    learnedIds,
    learnedDates,
    toggleLearned,
    resetSpecificItem,
    batchSetLearned,
    unlockEntireCategory,
    seedLastWeekDemoData,
    resetAllProgress,
    totalCount,
    learnedCount,
    totalPercentage,
    categoryStats,
    achievements,
    newlyUnlockedAchievement,
    closeCelebration,
  };
}
