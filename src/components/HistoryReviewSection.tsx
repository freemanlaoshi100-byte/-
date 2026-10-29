import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  RotateCcw,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';
import { KnowledgeItem, MainCategory } from '../types/math';

interface HistoryReviewSectionProps {
  items: KnowledgeItem[];
  learnedIds: Set<string>;
  learnedDates: Record<string, string>;
  onResetSpecificItem: (id: string) => void;
  onStartLearningItem: (item: KnowledgeItem) => void;
  onSeedDemoData: () => void;
}

type PeriodFilter = 'LAST_WEEK' | 'THIS_WEEK' | 'EARLIER' | 'ALL_LEARNED';

export function HistoryReviewSection({
  items,
  learnedIds,
  learnedDates,
  onResetSpecificItem,
  onStartLearningItem,
  onSeedDemoData,
}: HistoryReviewSectionProps) {
  // 选中的时间周期（默认：上周已完成）
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('LAST_WEEK');

  // 最近一次重置的操作提示
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 计算周边界时间
  const { startOfThisWeek, startOfLastWeek, endOfLastWeek } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 周一为 0，周日为 6
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);

    return {
      startOfThisWeek: thisWeekStart,
      startOfLastWeek: lastWeekStart,
      endOfLastWeek: lastWeekEnd,
    };
  }, []);

  // 整理所有已完成的知识点列表，按打卡时间倒序排列
  const learnedItemList = useMemo(() => {
    const list: Array<{ item: KnowledgeItem; completedDate: Date; dateStr: string; period: 'THIS_WEEK' | 'LAST_WEEK' | 'EARLIER' }> = [];

    items.forEach((item) => {
      if (learnedIds.has(item.id)) {
        const rawDate = learnedDates[item.id];
        // 如果没有具体时间，默认为上周
        const dateObj = rawDate ? new Date(rawDate) : new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

        let period: 'THIS_WEEK' | 'LAST_WEEK' | 'EARLIER' = 'EARLIER';
        if (dateObj >= startOfThisWeek) {
          period = 'THIS_WEEK';
        } else if (dateObj >= startOfLastWeek && dateObj <= endOfLastWeek) {
          period = 'LAST_WEEK';
        } else {
          // 如果也在近7~14天内，也归属于上周周期
          const daysAgo = (Date.now() - dateObj.getTime()) / (24 * 60 * 60 * 1000);
          if (daysAgo >= 6.5 && daysAgo <= 14.5) {
            period = 'LAST_WEEK';
          }
        }

        const formatted = dateObj.toLocaleDateString('zh-CN', {
          month: 'numeric',
          day: 'numeric',
          weekday: 'short',
        });

        list.push({
          item,
          completedDate: dateObj,
          dateStr: formatted,
          period,
        });
      }
    });

    // 倒序排列：最新完成的在前面
    list.sort((a, b) => b.completedDate.getTime() - a.completedDate.getTime());
    return list;
  }, [items, learnedIds, learnedDates, startOfThisWeek, startOfLastWeek, endOfLastWeek]);

  // 根据当前标签筛选
  const filteredList = useMemo(() => {
    if (periodFilter === 'ALL_LEARNED') return learnedItemList;
    return learnedItemList.filter((row) => row.period === periodFilter);
  }, [learnedItemList, periodFilter]);

  // 统计各周期数量
  const countStats = useMemo(() => {
    let lastWeek = 0;
    let thisWeek = 0;
    let earlier = 0;

    learnedItemList.forEach((row) => {
      if (row.period === 'LAST_WEEK') lastWeek++;
      else if (row.period === 'THIS_WEEK') thisWeek++;
      else earlier++;
    });

    return {
      lastWeek,
      thisWeek,
      earlier,
      total: learnedItemList.length,
    };
  }, [learnedItemList]);

  // 执行单项重置
  const handleReset = (item: KnowledgeItem) => {
    onResetSpecificItem(item.id);
    setToastMessage(`已将【${item.name}】重置为未学状态，可在目录中重新进行自测学习！`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 批量重置当前筛选出的所有知识点
  const handleResetAllInCurrentView = () => {
    if (filteredList.length === 0) return;
    if (window.confirm(`确定要将当前列表中的 ${filteredList.length} 个知识点全部重置为未学状态吗？`)) {
      filteredList.forEach((row) => {
        onResetSpecificItem(row.item.id);
      });
      setToastMessage(`已批量重置当前 ${filteredList.length} 个知识点状态！`);
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-md shadow-slate-200/40 space-y-5">
      {/* 头部标题与统计 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              历史回顾 · 已掌握考点轨迹
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                艾宾浩斯复习
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              温故而知新！复习上周攻克的关键考点，支持随时一键重置状态以重新自测
            </p>
          </div>
        </div>

        {/* 顶部操作：批量重置 / 模拟添加 */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {filteredList.length > 0 && (
            <button
              onClick={handleResetAllInCurrentView}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
              title="将当前筛选列表内的知识点全部恢复为未学状态"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>重置本组全部</span>
            </button>
          )}

          <button
            onClick={onSeedDemoData}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
            title="生成几条上一周的模拟打卡记录方便测试"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">模拟填充</span>上周记录
          </button>
        </div>
      </div>

      {/* 周期切换选项卡 */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setPeriodFilter('LAST_WEEK')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            periodFilter === 'LAST_WEEK'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          <span>上周已完成</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-700 tabular-nums font-bold">
            {countStats.lastWeek}
          </span>
        </button>

        <button
          onClick={() => setPeriodFilter('THIS_WEEK')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            periodFilter === 'THIS_WEEK'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>本周新攻克</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 tabular-nums font-bold">
            {countStats.thisWeek}
          </span>
        </button>

        <button
          onClick={() => setPeriodFilter('EARLIER')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            periodFilter === 'EARLIER'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>更早完成</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 tabular-nums font-bold">
            {countStats.earlier}
          </span>
        </button>

        <button
          onClick={() => setPeriodFilter('ALL_LEARNED')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            periodFilter === 'ALL_LEARNED'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>全部已掌握</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 tabular-nums font-bold">
            {countStats.total}
          </span>
        </button>
      </div>

      {/* 提示反馈气泡 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between gap-2 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs text-emerald-600 hover:underline cursor-pointer"
            >
              知道了
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 知识点列表区 */}
      {filteredList.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <History className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600">
            {periodFilter === 'LAST_WEEK'
              ? '上周暂无已完成的考点打卡记录'
              : '当前分类下暂无已掌握的知识点'}
          </p>
          <p className="text-xs text-slate-400">
            随着你每日学习勾选知识点，系统会自动记录下你的成长足迹。
          </p>
          {periodFilter === 'LAST_WEEK' && (
            <button
              type="button"
              onClick={onSeedDemoData}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>立即体验：模拟生成上周学习记录</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredList.map((row) => {
            const { item, dateStr } = row;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.categoryDisplayName}
                      </span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-500 font-medium">{item.subCategory}</span>
                      <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                        {item.normalizedGrade || '通用'}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium tabular-nums flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      {dateStr}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight line-clamp-1 mb-1">
                    {item.name}
                  </h4>
                </div>

                {/* 底部操作区：一键重置状态 + 回看微课 */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* 一键重置特定知识点状态 */}
                  <button
                    type="button"
                    onClick={() => handleReset(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-700 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                    title="重置为未学状态，方便重新自测与练习"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重置状态</span>
                  </button>

                  {/* 回看微课 */}
                  <button
                    type="button"
                    onClick={() => onStartLearningItem(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <span>回看微课</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
