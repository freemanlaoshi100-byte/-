import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, CheckCircle2, Lock, Sparkles, Award, ArrowRight, Zap } from 'lucide-react';
import { Achievement, MainCategory } from '../types/math';

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  onClose: () => void;
  onNavigateToCategory?: (catKey: MainCategory) => void;
  onUnlockCategoryDemo?: (catKey: MainCategory) => void;
}

export function AchievementDetailModal({
  achievement,
  onClose,
  onNavigateToCategory,
  onUnlockCategoryDemo,
}: AchievementDetailModalProps) {
  if (!achievement) return null;

  const {
    title,
    subtitle,
    description,
    badgeEmoji,
    themeColor,
    isUnlocked,
    currentCount,
    targetCount,
    unlockedAt,
    rewardPraise,
    rarity,
    categoryKey,
  } = achievement;

  const pct = Math.min(100, Math.round((currentCount / targetCount) * 100));

  const getRarityTag = () => {
    switch (rarity) {
      case 'LEGEND':
        return { label: '传奇至尊勋章', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'GOLD':
        return { label: '黄金殿堂勋章', bg: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'SILVER':
        return { label: '闪耀进阶勋章', bg: 'bg-sky-100 text-sky-800 border-sky-300' };
      default:
        return { label: '新星启蒙勋章', bg: 'bg-teal-100 text-teal-800 border-teal-300' };
    }
  };

  const rarityInfo = getRarityTag();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* 弹窗实体卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 text-slate-800"
        >
          {/* 顶部荣誉流光背景 */}
          <div
            className="relative h-36 flex items-center justify-center overflow-hidden"
            style={{
              background: isUnlocked
                ? `linear-gradient(135deg, ${themeColor}dd, ${themeColor})`
                : 'linear-gradient(135deg, #64748b, #475569)',
            }}
          >
            {/* 装饰星光粒子 */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 勋章大徽章图标 */}
            <div className="relative z-10 -bottom-8">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                className={`
                  w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-xl border-4
                  ${
                    isUnlocked
                      ? 'bg-white border-amber-300 shadow-amber-500/30'
                      : 'bg-slate-200 border-slate-300 shadow-slate-900/20 grayscale'
                  }
                `}
              >
                <span>{badgeEmoji}</span>
              </motion.div>
            </div>
          </div>

          {/* 内容主体 */}
          <div className="pt-12 p-6 sm:p-8 text-center space-y-4">
            {/* 稀有度与状态标签 */}
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${rarityInfo.bg}`}
              >
                {rarityInfo.label}
              </span>
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  已解锁点亮
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  攻克中 · 尚待解锁
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
            </div>

            {/* 解锁进度指示卡 */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">解锁考核目标</span>
                <span className="font-black text-slate-800 tabular-nums">
                  {currentCount} / {targetCount} 考点 ({pct}%)
                </span>
              </div>

              {/* 进度条 */}
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: isUnlocked ? themeColor : '#94a3b8',
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-500">{description}</p>
            </div>

            {/* 祝贺语 / 激励寄语 */}
            <div
              className={`rounded-2xl p-4 text-xs sm:text-sm text-left leading-relaxed ${
                isUnlocked
                  ? 'bg-amber-50/70 border border-amber-200/80 text-amber-900'
                  : 'bg-sky-50/70 border border-sky-200/80 text-sky-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Award
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isUnlocked ? 'text-amber-600' : 'text-sky-600'
                  }`}
                />
                <div>
                  <div className="font-bold mb-1">
                    {isUnlocked ? '🎖️ 荣誉评语：' : '🎯 备考锦囊：'}
                  </div>
                  <p>{rewardPraise}</p>
                </div>
              </div>
            </div>

            {isUnlocked && unlockedAt && (
              <div className="text-[11px] text-slate-400 font-medium">
                点亮日期：{unlockedAt} · 永久收录于个人荣誉档案
              </div>
            )}

            {/* 底部功能按钮 */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 justify-center">
              {categoryKey && onNavigateToCategory && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToCategory(categoryKey);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>前往该分类学习</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* 针对未解锁的分类，提供一键点亮（模拟体验） */}
              {!isUnlocked && categoryKey && onUnlockCategoryDemo && (
                <button
                  onClick={() => {
                    onUnlockCategoryDemo(categoryKey);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-95"
                  title="一键标记该分类全学完，体验勋章点亮盛典！"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>一键点亮此勋章(模拟体验)</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                收起
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
