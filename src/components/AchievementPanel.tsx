import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Lock, CheckCircle2, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { Achievement, MainCategory } from '../types/math';
import { AchievementDetailModal } from './AchievementDetailModal';

interface AchievementPanelProps {
  achievements: Achievement[];
  onNavigateToCategory: (catKey: MainCategory) => void;
  onUnlockCategoryDemo: (catKey: MainCategory) => void;
}

export function AchievementPanel({
  achievements,
  onNavigateToCategory,
  onUnlockCategoryDemo,
}: AchievementPanelProps) {
  // 当前正在查看详情的勋章
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const unlockedPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <section className="space-y-4">
      {/* 头部标题与统计栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              数学荣誉成就殿堂
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                <Sparkles className="w-3 h-3 text-amber-600" />
                自动解锁
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              攻克特定分类（如数与代数）全部知识点，即刻点亮专属荣誉勋章
            </p>
          </div>
        </div>

        {/* 解锁进度统计 */}
        <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500">已点亮勋章</div>
            <div className="text-sm font-black text-amber-600 tabular-nums">
              {unlockedCount} / {totalCount} 枚 ({unlockedPercentage}%)
            </div>
          </div>
          {/* 小进度条 */}
          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${unlockedPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 勋章网格卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {achievements.map((ach, idx) => {
          const {
            id,
            title,
            subtitle,
            badgeEmoji,
            isUnlocked,
            currentCount,
            targetCount,
            themeColor,
            categoryKey,
            rarity,
          } = ach;

          const pct = Math.min(100, Math.round((currentCount / targetCount) * 100));

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              onClick={() => setSelectedAchievement(ach)}
              className={`
                group relative rounded-3xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden
                ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-white to-amber-50/40 border-amber-200/90 shadow-md shadow-amber-500/10 hover:shadow-xl hover:border-amber-300'
                    : 'bg-white/80 border-slate-200/80 shadow-xs hover:border-slate-300 hover:bg-white'
                }
              `}
            >
              {/* 解锁时的顶边高光饰条 */}
              {isUnlocked && (
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: themeColor }}
                />
              )}

              {/* 卡片头部：徽章 Emoji 与状态标 */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  {/* 徽章图标 */}
                  <div
                    className={`
                      w-13 h-13 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0 transition-transform group-hover:scale-105
                      ${
                        isUnlocked
                          ? 'bg-white border-2 border-amber-200 shadow-amber-500/15'
                          : 'bg-slate-100 border border-slate-200 grayscale opacity-80'
                      }
                    `}
                  >
                    <span>{badgeEmoji}</span>
                  </div>

                  {/* 状态徽章 */}
                  <div>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        已解锁
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        <Lock className="w-3 h-3 text-slate-400" />
                        待达成
                      </span>
                    )}
                  </div>
                </div>

                {/* 标题与描述 */}
                <h4
                  className={`text-sm sm:text-base font-black truncate ${
                    isUnlocked ? 'text-slate-900 group-hover:text-amber-700' : 'text-slate-700'
                  }`}
                >
                  {title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                  {subtitle}
                </p>
              </div>

              {/* 底部进度条 */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="tabular-nums">
                    {currentCount} / {targetCount} 考点
                  </span>
                  <span
                    className={`font-black tabular-nums ${
                      isUnlocked ? 'text-amber-600' : 'text-slate-500'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isUnlocked ? themeColor : '#94a3b8',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 group-hover:text-slate-600">
                  <span>查看认证详情</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 勋章荣誉详情弹窗 */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        onNavigateToCategory={onNavigateToCategory}
        onUnlockCategoryDemo={(catKey) => {
          onUnlockCategoryDemo(catKey);
          // 重新定位选中的勋章状态
          setTimeout(() => {
            const updated = achievements.find((a) => a.categoryKey === catKey);
            if (updated) setSelectedAchievement(updated);
          }, 50);
        }}
      />
    </section>
  );
}
