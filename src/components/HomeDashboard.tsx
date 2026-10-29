import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  Shapes,
  BarChart3,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Compass,
  Trophy,
  Upload,
  Target,
  RefreshCw,
  Zap,
  FileText,
} from 'lucide-react';
import { CategoryStat, MainCategory, Achievement, KnowledgeItem } from '../types/math';
import { CircularProgress } from './CircularProgress';
import { exportUnlearnedScheduleCsv } from '../utils/exportCsv';
import { ALL_MATH_ITEMS } from '../data/rawMathData';
import { AchievementPanel } from './AchievementPanel';
import { AchievementDetailModal } from './AchievementDetailModal';
import { DailyStudyRecommendation } from './DailyStudyRecommendation';
import { UploadKnowledgeModal } from './UploadKnowledgeModal';
import { PdfReportModal } from './PdfReportModal';
import { HistoryReviewSection } from './HistoryReviewSection';

interface HomeDashboardProps {
  items: KnowledgeItem[];
  totalPercentage: number;
  learnedCount: number;
  totalCount: number;
  categoryStats: CategoryStat[];
  learnedIds: Set<string>;
  learnedDates: Record<string, string>;
  achievements: Achievement[];
  newlyUnlockedAchievement: Achievement | null;
  onEnterCatalog: (categoryFilter?: MainCategory) => void;
  onStartLearningItem: (item: KnowledgeItem) => void;
  onResetProgress: () => void;
  onResetSpecificItem: (id: string) => void;
  onSeedDemoData: () => void;
  onUnlockEntireCategory: (categoryKey: MainCategory) => void;
  onCloseCelebration: () => void;
}

export function HomeDashboard({
  items,
  totalPercentage,
  learnedCount,
  totalCount,
  categoryStats,
  learnedIds,
  learnedDates,
  achievements,
  newlyUnlockedAchievement,
  onEnterCatalog,
  onStartLearningItem,
  onResetProgress,
  onResetSpecificItem,
  onSeedDemoData,
  onUnlockEntireCategory,
  onCloseCelebration,
}: HomeDashboardProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [recommendSeed, setRecommendSeed] = useState(0);

  // 提供 handleStartLearningItem 方法，供‘立即去学’按钮调用
  const handleStartLearningItem = (item: KnowledgeItem) => {
    onStartLearningItem(item);
  };

  // 算法：根据当前年级与进度自适应随机选取一个未完成的知识点
  const todayRecommendedData = React.useMemo(() => {
    const uncompleted = items.filter((it) => !learnedIds.has(it.id));
    if (uncompleted.length === 0) {
      return {
        item: items[0] || null,
        stageLabel: '全能大满贯',
        algorithmRationale: '已攻克全书全部 241 个知识点！建议温故知新进行自我测验复习',
        isAllCompleted: true,
      };
    }

    // 根据用户当前总体进度 (totalPercentage) 分级自适应匹配
    let filtered = uncompleted;
    let stageLabel = '';
    let algorithmRationale = '';

    if (totalPercentage < 25) {
      // 基础起步阶段（进度 < 25%）：优先推荐 1~2 年级核心考点
      const lowGrade = uncompleted.filter(
        (it) => it.grade.includes('1') || it.grade.includes('2')
      );
      if (lowGrade.length > 0) {
        filtered = lowGrade;
        stageLabel = '低年级基础筑基';
        algorithmRationale = `根据当前学习进度 ${totalPercentage}%，算法优先推荐一~二年级基础核心考点`;
      }
    } else if (totalPercentage < 55) {
      // 进阶跃迁阶段（进度 25% ~ 55%）：优先推荐 3~4 年级乘除笔算与平面几何
      const midGrade = uncompleted.filter(
        (it) => it.grade.includes('3') || it.grade.includes('4')
      );
      if (midGrade.length > 0) {
        filtered = midGrade;
        stageLabel = '中年级算理跃迁';
        algorithmRationale = `根据当前学习进度 ${totalPercentage}%，算法推荐三~四年级算理法则与几何考点`;
      }
    } else if (totalPercentage < 80) {
      // 综合应用阶段（进度 55% ~ 80%）：优先推荐 5~6 年级分数方程与立体几何
      const highGrade = uncompleted.filter(
        (it) => it.grade.includes('5') || it.grade.includes('6')
      );
      if (highGrade.length > 0) {
        filtered = highGrade;
        stageLabel = '高年级重难点攻坚';
        algorithmRationale = `根据当前学习进度 ${totalPercentage}%，算法推荐五~六年级抽象方程与立体几何考点`;
      }
    } else {
      // 冲刺与思维拓展阶段（进度 >= 80%）：优先推荐综合应用题与经典思维拓展奥数模型
      const expandItems = uncompleted.filter(
        (it) => !it.grade || it.category === '解决问题' || it.grade.includes('6')
      );
      if (expandItems.length > 0) {
        filtered = expandItems;
        stageLabel = '高维冲刺与思维拓展';
        algorithmRationale = `根据当前学习进度 ${totalPercentage}%，算法推荐思维拓展与综合应用高频模型`;
      }
    }

    if (!stageLabel) {
      stageLabel = '新课标智能精选';
      algorithmRationale = `结合当前学习掌握率，智能优选最适合攻克的未学考点`;
    }

    // 随机选取当前算法候选池中的一个未完成知识点
    const pickedIndex = Math.abs((recommendSeed * 17 + 5) % filtered.length);
    const picked = filtered[pickedIndex];

    return {
      item: picked,
      stageLabel,
      algorithmRationale,
      isAllCompleted: false,
    };
  }, [items, learnedIds, totalPercentage, recommendSeed]);

  // 映射图标组件
  const renderIcon = (name: string, className: string) => {
    switch (name) {
      case 'Calculator':
        return <Calculator className={className} />;
      case 'Shapes':
        return <Shapes className={className} />;
      case 'BarChart3':
        return <BarChart3 className={className} />;
      case 'Lightbulb':
        return <Lightbulb className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  const unlearnedCount = totalCount - learnedCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] via-[#f8fafc] to-[#f0f9ff] text-slate-800 pb-16 selection:bg-emerald-200">
      {/* 顶部极简品牌栏 */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              小学生数学知识点
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                新课标全景图
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              小学 1~6 年级必备核心大纲 · 提前学与自查自测宝典
            </p>
          </div>
        </div>

        {/* 顶部实用操作区 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 生成并下载可视化 PDF 学习进度报告 */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs active:scale-95 cursor-pointer"
            title="生成并下载全景可视化 PDF 学习进度诊断报告"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">下载</span>PDF 报告
          </button>

          {/* 上传知识点内容按钮 */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs active:scale-95 cursor-pointer"
            title="上传或替换知识点 HTML 讲义文件"
          >
            <Upload className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">上传</span>讲义
          </button>

          {/* 导出待学课表按钮 */}
          <button
            onClick={() => exportUnlearnedScheduleCsv(ALL_MATH_ITEMS, learnedIds)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs active:scale-95 cursor-pointer"
            title="一键导出包含未学知识点的学习规划 CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xs:inline">导出</span>待学课表
          </button>

          <button
            onClick={onResetProgress}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="清空进度"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 主体容器 */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-2 space-y-8">
        {/* 顶部仪表盘中心卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-100/80 shadow-xl shadow-emerald-950/5 overflow-hidden"
        >
          {/* 背景童趣装饰几何 */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-sky-100/50 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            {/* 左侧说明与标语 */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>每天学一点，思维大飞跃</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-snug">
                  全书学习总进度
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 max-w-md leading-relaxed">
                  涵盖小学六年共 <span className="font-semibold text-slate-700">241</span> 个核心知识点。
                  通过逐项自主攻克，实时点亮你的小学数学全景成长树。
                </p>
              </div>

              {/* 关键指标小排 */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 max-w-sm mx-auto md:mx-0">
                <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
                  <div className="text-xs text-slate-400 font-medium">总知识点</div>
                  <div className="text-base sm:text-lg font-black text-slate-700 tabular-nums">
                    {totalCount}
                  </div>
                </div>
                <div className="bg-emerald-50/70 rounded-2xl p-2.5 text-center border border-emerald-100">
                  <div className="text-xs text-emerald-600 font-medium">已学掌握</div>
                  <div className="text-base sm:text-lg font-black text-emerald-700 tabular-nums">
                    {learnedCount}
                  </div>
                </div>
                <div className="bg-sky-50/70 rounded-2xl p-2.5 text-center border border-sky-100">
                  <div className="text-xs text-sky-600 font-medium">尚待攻克</div>
                  <div className="text-base sm:text-lg font-black text-sky-700 tabular-nums">
                    {unlearnedCount}
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧环形进度条组件 */}
            <div className="shrink-0">
              <CircularProgress
                percentage={totalPercentage}
                learnedCount={learnedCount}
                totalCount={totalCount}
                size={200}
                strokeWidth={15}
              />
            </div>
          </div>
        </motion.div>

        {/* 核心‘今日推荐’卡片：利用年级与进度自适应算法随机选取一个未完成的知识点 */}
        {todayRecommendedData.item && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="relative bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-sky-500/10 rounded-3xl p-5 sm:p-7 border border-emerald-200/90 shadow-md shadow-emerald-950/5 overflow-hidden"
          >
            {/* 饰纹高光背景 */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-emerald-200/30 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* 卡片顶部标头 */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        今日推荐
                      </h3>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        {todayRecommendedData.stageLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {todayRecommendedData.algorithmRationale}
                    </p>
                  </div>
                </div>

                {/* 换一个按钮 */}
                <button
                  type="button"
                  onClick={() => setRecommendSeed((s) => s + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-xs hover:border-emerald-300 transition-all cursor-pointer active:scale-95"
                  title="根据算法随机换一个未完成知识点"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>换一个</span>
                </button>
              </div>

              {/* 推荐知识点详情卡片 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  {/* 分类与年级标签 */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {todayRecommendedData.item.categoryDisplayName}
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500 font-medium">
                      {todayRecommendedData.item.subCategory}
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700">
                      {todayRecommendedData.item.normalizedGrade || '通用培优'}
                    </span>
                  </div>

                  {/* 知识点主标题 */}
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {todayRecommendedData.item.name}
                  </h4>

                  <p className="text-xs text-slate-500 font-normal">
                    💡 预计学完仅需 10 分钟 · 包含核心法则定义、经典例题解析与随堂小测
                  </p>
                </div>

                {/* 核心操作：立即去学按钮（调用 handleStartLearningItem 方法） */}
                <div className="shrink-0 flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleStartLearningItem(todayRecommendedData.item)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>立即去学</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 今日学习建议与每日攻克任务 */}
        <DailyStudyRecommendation
          items={items}
          learnedIds={learnedIds}
          onStartLearningItem={handleStartLearningItem}
        />

        {/* 中间核心交互：超醒目的“进入提前学目录”大响应按钮 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onEnterCatalog()}
            className="group relative w-full sm:w-auto min-w-[320px] sm:min-w-[420px] py-4 sm:py-5 px-8 rounded-3xl bg-gradient-to-r from-[#4caf50] via-[#2e7d32] to-[#15803d] text-white shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:shadow-emerald-600/35 transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer overflow-hidden border border-emerald-400/30"
          >
            {/* 按钮光泽流光效果 */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/15 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-black tracking-wide">
                  进入提前学目录
                </span>
                <span className="block text-xs text-emerald-100 font-normal">
                  三级折叠大纲 · 知识精讲 · 课表自测
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:translate-x-1.5 transition-transform duration-200">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </motion.button>
        </motion.div>

        {/* 四个核心模块卡片：数与代数、图形与几何、统计与概率、综合与实践 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                四大核心知识模块
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                实时显示分类下的学习进度，点击卡片直接进入详情目录
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
              4 个大类 · 共 241 考点
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {categoryStats.map((cat, idx) => {
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 + idx * 0.05 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  onClick={() => onEnterCatalog(cat.key)}
                  className={`group relative rounded-3xl p-5 sm:p-6 bg-white border ${cat.borderClass} shadow-md shadow-slate-200/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between`}
                >
                  {/* 卡片头部 */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                          style={{ backgroundColor: cat.themeColor }}
                        >
                          {renderIcon(cat.iconName, 'w-5 h-5')}
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {cat.displayName}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-400">
                            共 {cat.total} 个考点
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg sm:text-xl font-black text-slate-800 tabular-nums">
                          {cat.percentage}%
                        </span>
                        <div className="text-[11px] text-slate-400 tabular-nums">
                          {cat.learned} / {cat.total}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 mb-4 font-normal">
                      {cat.subTitle}
                    </p>
                  </div>

                  {/* 进度条与跳转提示 */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    {/* 进度条轨道 */}
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                        className="h-full rounded-full transition-all"
                        style={{ backgroundColor: cat.themeColor }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-700 transition-colors pt-0.5">
                      <span className="flex items-center gap-1 text-[11px]">
                        {cat.learned === cat.total && cat.total > 0 ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 已全通关
                          </span>
                        ) : (
                          <span>还剩 {cat.total - cat.learned} 个知识点</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-emerald-600 font-bold">
                        点击进入学习
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 历史回顾区域：显示上周已完成的知识点列表，并提供一键重置特定知识点状态的功能 */}
        <HistoryReviewSection
          items={items}
          learnedIds={learnedIds}
          learnedDates={learnedDates}
          onResetSpecificItem={onResetSpecificItem}
          onStartLearningItem={handleStartLearningItem}
          onSeedDemoData={onSeedDemoData}
        />

        {/* 成就面板 */}
        <AchievementPanel
          achievements={achievements}
          onNavigateToCategory={onEnterCatalog}
          onUnlockCategoryDemo={onUnlockEntireCategory}
        />

        {/* 底部快速功能提示条 */}
        <div className="bg-white/80 rounded-2xl p-4 border border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>
              已掌握知识点与荣誉徽章自动同步保存在本地浏览器中，随时开启，永不丢失！
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-emerald-700">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" /> 下载 PDF 进度报告
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> 知识点内容上传管理
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => exportUnlearnedScheduleCsv(ALL_MATH_ITEMS, learnedIds)}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" /> 导出未勾选知识点清单 (CSV)
            </button>
          </div>
        </div>
      </main>

      {/* 荣誉庆祝弹窗 */}
      <AchievementDetailModal
        achievement={newlyUnlockedAchievement}
        onClose={onCloseCelebration}
        onNavigateToCategory={onEnterCatalog}
        onUnlockCategoryDemo={onUnlockEntireCategory}
      />

      {/* 知识点内容上传管理弹窗 */}
      <UploadKnowledgeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(item) => {
          onStartLearningItem(item);
        }}
      />

      {/* PDF 学习进度诊断报告预览与下载弹窗 */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        learnedCount={learnedCount}
        totalCount={totalCount}
        totalPercentage={totalPercentage}
        categoryStats={categoryStats}
        achievements={achievements}
      />
    </div>
  );
}
