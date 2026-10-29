import { useId } from 'react';

interface CircularProgressProps {
  percentage: number;
  learnedCount: number;
  totalCount: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({
  percentage,
  learnedCount,
  totalCount,
  size = 210,
  strokeWidth = 16,
}: CircularProgressProps) {
  const gradientId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  // 根据进度生成小学生专属荣誉称号
  const getBadgeTitle = (pct: number) => {
    if (pct === 0) return { title: '未开始·准备出发', icon: '🌱', color: 'text-slate-500' };
    if (pct < 20) return { title: '数学小萌新', icon: '⭐', color: 'text-emerald-600' };
    if (pct < 50) return { title: '思维小能手', icon: '🚀', color: 'text-sky-600' };
    if (pct < 80) return { title: '数学进阶学者', icon: '🏆', color: 'text-amber-600' };
    if (pct < 100) return { title: '准满分学霸', icon: '🔥', color: 'text-purple-600' };
    return { title: '全能数学小博士', icon: '👑', color: 'text-emerald-700 font-bold' };
  };

  const badge = getBadgeTitle(clampedPercentage);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 transition-all duration-700 ease-out"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4caf50" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id={`shadow-${gradientId}`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* 背景底环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />

          {/* 实际动态进度环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            filter={`url(#shadow-${gradientId})`}
          />
        </svg>

        {/* 环心正中文本 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            全书总掌握率
          </span>
          <div className="flex items-baseline gap-0.5 my-0.5">
            <span className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 tabular-nums">
              {clampedPercentage}
            </span>
            <span className="text-xl md:text-2xl font-bold text-emerald-600">%</span>
          </div>
          <div className="text-xs text-slate-500 font-medium tabular-nums">
            已掌握 <span className="font-bold text-emerald-600">{learnedCount}</span> / {totalCount} 考点
          </div>
        </div>
      </div>

      {/* 荣誉徽章标签 */}
      <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-xs text-xs font-medium">
        <span>{badge.icon}</span>
        <span className={badge.color}>{badge.title}</span>
      </div>
    </div>
  );
}
