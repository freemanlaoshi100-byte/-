import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMathLearningProgress } from './hooks/useMathLearningProgress';
import { HomeDashboard } from './components/HomeDashboard';
import { LearningCatalog } from './components/LearningCatalog';
import { KnowledgeItem, MainCategory } from './types/math';

export default function App() {
  // 视图模式：'dashboard'（主页仪表盘） | 'catalog'（学习详情页）
  const [viewMode, setViewMode] = useState<'dashboard' | 'catalog'>('dashboard');

  // 从主页点击特定卡片跳转到详情页时选中的分类与知识点
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

  const {
    items,
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
  } = useMathLearningProgress();

  // 进入目录页（可选指定分类）
  const handleEnterCatalog = (categoryFilter?: MainCategory) => {
    setSelectedCategory(categoryFilter);
    setSelectedItemId(undefined);
    setViewMode('catalog');
  };

  // 从“今日学习建议”中点击“立即去学”直接定位到该知识点
  const handleStartLearningItem = (item: KnowledgeItem) => {
    setSelectedCategory(item.category);
    setSelectedItemId(item.id);
    setViewMode('catalog');
  };

  // 返回主页仪表盘
  const handleBackToDashboard = () => {
    setViewMode('dashboard');
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 antialiased">
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <HomeDashboard
              items={items}
              totalPercentage={totalPercentage}
              learnedCount={learnedCount}
              totalCount={totalCount}
              categoryStats={categoryStats}
              learnedIds={learnedIds}
              learnedDates={learnedDates}
              achievements={achievements}
              newlyUnlockedAchievement={newlyUnlockedAchievement}
              onEnterCatalog={handleEnterCatalog}
              onStartLearningItem={handleStartLearningItem}
              onResetProgress={resetAllProgress}
              onResetSpecificItem={resetSpecificItem}
              onSeedDemoData={seedLastWeekDemoData}
              onUnlockEntireCategory={unlockEntireCategory}
              onCloseCelebration={closeCelebration}
            />
          </motion.div>
        ) : (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <LearningCatalog
              initialCategory={selectedCategory}
              initialItemId={selectedItemId}
              learnedIds={learnedIds}
              toggleLearned={toggleLearned}
              batchSetLearned={batchSetLearned}
              onBackToDashboard={handleBackToDashboard}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
