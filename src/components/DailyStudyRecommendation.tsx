import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  Calendar,
  Lightbulb,
  GraduationCap,
  Target,
} from 'lucide-react';
import { KnowledgeItem, MainCategory } from '../types/math';

interface DailyStudyRecommendationProps {
  items: KnowledgeItem[];
  learnedIds: Set<string>;
  onStartLearningItem: (item: KnowledgeItem) => void;
}

// 每日学习名师锦囊库
const DAILY_TIPS = [
  {
    title: '草稿纸规范四格法',
    content: '把草稿纸折成4格，计算从上到下工整书写，标清题号。不仅能减少粗心算错，检查时还能快速复盘！',
    tag: '提分习惯',
  },
  {
    title: '线段画图破题法',
    content: '遇到和差倍、植树或相遇行程应用题，先画出清晰的线段图，把文字转化为直观长度，数量关系一秒看懂。',
    tag: '解题技巧',
  },
  {
    title: '小老师复述学习法',
    content: '每学完一个新公式或法则，试着用自己的话讲给家长或玩具听。能够流畅讲明白，才算真正彻底掌握！',
    tag: '深度吸收',
  },
  {
    title: '单位火眼金睛法',
    content: '审题时先拿铅笔圈出所有单位（米、厘米、平方分米、小时）。90%的应用题陷阱都藏在单位换算中！',
    tag: '避坑指南',
  },
  {
    title: '反向逆运算验算法',
    content: '做完减法用加法验算，做完除法用乘法验算，做完方程把未知数带入原式。考卷满分的秘密就在于自我核验。',
    tag: '应试高分',
  },
];

export function DailyStudyRecommendation({
  items,
  learnedIds,
  onStartLearningItem,
}: DailyStudyRecommendationProps) {
  // 随机种子，点击“换一批”时更新
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // 随机选择一条每日名师锦囊
  const dailyTip = useMemo(() => {
    return DAILY_TIPS[shuffleSeed % DAILY_TIPS.length];
  }, [shuffleSeed]);

  // 从未学知识点中精选推荐3~4个
  const recommendedItems = useMemo(() => {
    const unlearned = items.filter((it) => !learnedIds.has(it.id));
    if (unlearned.length === 0) return [];

    // 尽量均衡挑选不同分类和年级的考点
    const categories: MainCategory[] = ['数与代数', '几何', '统计与概率', '解决问题'];
    const selected: KnowledgeItem[] = [];

    // 混淆取样
    const pool = [...unlearned];
    // 根据 shuffleSeed 简单伪随机打乱
    pool.sort((a, b) => {
      const hashA = (a.name.length * 37 + shuffleSeed * 17) % 100;
      const hashB = (b.name.length * 37 + shuffleSeed * 17) % 100;
      return hashA - hashB;
    });

    // 优先从四大分类各取1个
    for (const cat of categories) {
      const match = pool.find((it) => it.category === cat && !selected.some((s) => s.id === it.id));
      if (match) selected.push(match);
      if (selected.length >= 3) break;
    }

    // 若不足3个，用剩余未学补充
    for (const it of pool) {
      if (selected.length >= 3) break;
      if (!selected.some((s) => s.id === it.id)) {
        selected.push(it);
      }
    }

    return selected;
  }, [items, learnedIds, shuffleSeed]);

  // 计算今日打卡完成数（从推荐中已完成的数量）
  const completedTodayCount = useMemo(() => {
    return recommendedItems.filter((it) => learnedIds.has(it.id)).length;
  }, [recommendedItems, learnedIds]);

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-md shadow-emerald-950/5 space-y-5">
      {/* 头部标题与功能操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              今日学习建议 · 攻克任务
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                每日推荐
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              根据科学遗忘曲线与课程递进难度，为你精选今日最适合攻克的 3 个核心考点
            </p>
          </div>
        </div>

        {/* 换一批按钮与今日打卡小统计 */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>今日任务：{completedTodayCount} / {recommendedItems.length}</span>
          </div>

          <button
            onClick={() => setShuffleSeed((s) => s + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
            title="换一组今日推荐考点"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>换一批</span>
          </button>
        </div>
      </div>

      {/* 推荐考点卡片横排 */}
      {recommendedItems.length === 0 ? (
        <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
          <GraduationCap className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="text-base font-black text-emerald-900">恭喜！全书 241 个知识点已全部攻克通关！</h4>
          <p className="text-xs text-emerald-700">你可以进入目录复习做随堂测验，或随时重置进度开始新一轮复习。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {recommendedItems.map((item, index) => {
            const isLearned = learnedIds.has(item.id);

            // 依据分类配上推荐考点特征标
            const getReasonTag = () => {
              if (item.category === '数与代数') return { label: '核心算理基础', color: 'bg-emerald-50 text-emerald-700' };
              if (item.category === '几何') return { label: '空间几何构图', color: 'bg-sky-50 text-sky-700' };
              if (item.category === '统计与概率') return { label: '图表分析必考', color: 'bg-purple-50 text-purple-700' };
              return { label: '典型应用与思维', color: 'bg-amber-50 text-amber-700' };
            };

            const reason = getReasonTag();

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className={`
                  relative rounded-2xl p-4 border transition-all flex flex-col justify-between
                  ${
                    isLearned
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                      : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${reason.color}`}>
                      {reason.label}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {item.normalizedGrade || '通用'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-800 line-clamp-1 mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {item.categoryDisplayName} · {item.subCategory}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isLearned ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      今日已掌握
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      预计用时 10 分钟
                    </span>
                  )}

                  <button
                    onClick={() => onStartLearningItem(item)}
                    className={`
                      inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95
                      ${
                        isLearned
                          ? 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }
                    `}
                  >
                    <span>{isLearned ? '回看复习' : '立即去学'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 底部名师专属锦囊建议条 */}
      <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-yellow-50/80 rounded-2xl p-4 border border-amber-200/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black text-amber-900">
              💡 今日名师思维锦囊：【{dailyTip.title}】
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-amber-300 text-amber-800">
              {dailyTip.tag}
            </span>
          </div>
          <p className="text-xs text-amber-800/90 leading-relaxed font-normal">
            {dailyTip.content}
          </p>
        </div>
      </div>
    </section>
  );
}
