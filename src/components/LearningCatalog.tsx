import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  RotateCcw,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Filter,
  Upload,
} from 'lucide-react';
import { KnowledgeItem, MainCategory, CategoryDisplay } from '../types/math';
import { ALL_MATH_ITEMS, getCategoryDisplay } from '../data/rawMathData';
import { exportUnlearnedScheduleCsv } from '../utils/exportCsv';
import { UploadKnowledgeModal } from './UploadKnowledgeModal';

interface LearningCatalogProps {
  initialCategory?: MainCategory;
  initialItemId?: string;
  learnedIds: Set<string>;
  toggleLearned: (id: string) => void;
  batchSetLearned: (ids: string[], isLearned: boolean) => void;
  onBackToDashboard: () => void;
}

export function LearningCatalog({
  initialCategory,
  initialItemId,
  learnedIds,
  toggleLearned,
  batchSetLearned,
  onBackToDashboard,
}: LearningCatalogProps) {
  // 选中的知识点（优先采用外部传入的 initialItemId）
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    if (initialItemId) return initialItemId;
    if (initialCategory) {
      const firstInCat = ALL_MATH_ITEMS.find((it) => it.category === initialCategory);
      if (firstInCat) return firstInCat.id;
    }
    return ALL_MATH_ITEMS[0].id;
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 搜索关键字
  const [searchQuery, setSearchQuery] = useState('');

  // 大分类筛选（全部或具体某一个）
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<MainCategory | 'ALL'>(
    initialCategory || 'ALL'
  );

  // 年级筛选
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');

  // 状态筛选：全部 / 未学 / 已学
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLEARNED' | 'LEARNED'>('ALL');

  // 移动端侧边栏抽屉开关
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 折叠状态记录：分类与子分类的展开/收起
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [collapsedSubCategories, setCollapsedSubCategories] = useState<Record<string, boolean>>({});

  // iframe 刷新 key
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // 当前激活的知识点对象
  const activeItem = useMemo(() => {
    return ALL_MATH_ITEMS.find((it) => it.id === selectedItemId) || ALL_MATH_ITEMS[0];
  }, [selectedItemId]);

  // 如果初始分类发生变动，同步更新
  useEffect(() => {
    if (initialCategory) {
      setActiveCategoryFilter(initialCategory);
      const first = ALL_MATH_ITEMS.find((it) => it.category === initialCategory);
      if (first) setSelectedItemId(first.id);
    }
  }, [initialCategory]);

  // 过滤后的知识点列表
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_MATH_ITEMS.filter((item) => {
      // 分类筛选
      if (activeCategoryFilter !== 'ALL' && item.category !== activeCategoryFilter) {
        return false;
      }

      // 年级筛选
      if (gradeFilter !== 'ALL') {
        if (gradeFilter === '1' && !item.grade.includes('1')) return false;
        if (gradeFilter === '2' && !item.grade.includes('2')) return false;
        if (gradeFilter === '3' && !item.grade.includes('3')) return false;
        if (gradeFilter === '4' && !item.grade.includes('4')) return false;
        if (gradeFilter === '5' && !item.grade.includes('5')) return false;
        if (gradeFilter === '6' && !item.grade.includes('6')) return false;
        if (gradeFilter === 'EXP' && item.grade !== '') return false; // 拓展思维题 grade为空
      }

      // 学习状态筛选
      const isLearned = learnedIds.has(item.id);
      if (statusFilter === 'UNLEARNED' && isLearned) return false;
      if (statusFilter === 'LEARNED' && !isLearned) return false;

      // 关键字搜索
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchSub = item.subCategory.toLowerCase().includes(q);
        const matchGrade = item.grade.toLowerCase().includes(q) || item.normalizedGrade.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q) || item.categoryDisplayName.toLowerCase().includes(q);
        return matchName || matchSub || matchGrade || matchCat;
      }

      return true;
    });
  }, [searchQuery, activeCategoryFilter, gradeFilter, statusFilter, learnedIds]);

  // 构建三级层级结构：大分类 -> 子分类 -> 知识点
  const treeStructure = useMemo(() => {
    const categoriesOrder: MainCategory[] = ['数与代数', '几何', '统计与概率', '解决问题'];
    const map = new Map<MainCategory, Map<string, KnowledgeItem[]>>();

    for (const cat of categoriesOrder) {
      map.set(cat, new Map());
    }

    for (const item of filteredItems) {
      let subMap = map.get(item.category);
      if (!subMap) {
        subMap = new Map();
        map.set(item.category, subMap);
      }
      const list = subMap.get(item.subCategory) || [];
      list.push(item);
      subMap.set(item.subCategory, list);
    }

    // 格式化输出
    const result: Array<{
      categoryKey: MainCategory;
      categoryDisplayName: CategoryDisplay;
      subCategories: Array<{
        subName: string;
        items: KnowledgeItem[];
        learnedCount: number;
        totalCount: number;
      }>;
      totalItemsInCat: number;
      learnedItemsInCat: number;
    }> = [];

    map.forEach((subMap, categoryKey) => {
      if (subMap.size === 0) return;

      const subCategories: Array<{
        subName: string;
        items: KnowledgeItem[];
        learnedCount: number;
        totalCount: number;
      }> = [];

      let catTotal = 0;
      let catLearned = 0;

      subMap.forEach((items, subName) => {
        const learned = items.filter((it) => learnedIds.has(it.id)).length;
        catTotal += items.length;
        catLearned += learned;

        subCategories.push({
          subName,
          items,
          learnedCount: learned,
          totalCount: items.length,
        });
      });

      result.push({
        categoryKey,
        categoryDisplayName: getCategoryDisplay(categoryKey),
        subCategories,
        totalItemsInCat: catTotal,
        learnedItemsInCat: catLearned,
      });
    });

    return result;
  }, [filteredItems, learnedIds]);

  // 当搜索触发时，默认展开所有分类与子分类以便直观查看
  useEffect(() => {
    if (searchQuery.trim()) {
      setCollapsedCategories({});
      setCollapsedSubCategories({});
    }
  }, [searchQuery]);

  // 切换分类折叠
  const toggleCategoryCollapse = (catKey: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  // 切换子分类折叠
  const toggleSubCategoryCollapse = (key: string) => {
    setCollapsedSubCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 展开 / 折叠全部
  const handleToggleExpandAll = () => {
    const areAnyCollapsed =
      Object.values(collapsedCategories).some(Boolean) ||
      Object.values(collapsedSubCategories).some(Boolean);

    if (areAnyCollapsed) {
      setCollapsedCategories({});
      setCollapsedSubCategories({});
    } else {
      // 全部折叠
      const allCats: Record<string, boolean> = {};
      const allSubs: Record<string, boolean> = {};
      treeStructure.forEach((c) => {
        allCats[c.categoryKey] = true;
        c.subCategories.forEach((s) => {
          allSubs[`${c.categoryKey}_${s.subName}`] = true;
        });
      });
      setCollapsedCategories(allCats);
      setCollapsedSubCategories(allSubs);
    }
  };

  // iframe 路径
  const iframeSrc = `./knowledge/${encodeURIComponent(activeItem.name)}.html`;

  const isCurrentActiveLearned = learnedIds.has(activeItem.id);

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* 顶部统一操作栏 */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>返回主页</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* 标题 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              数
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              小学数学知识点提前学目录
            </h2>
          </div>
        </div>

        {/* 右侧全局操作区 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 总进度小胶囊 */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="tabular-nums">
              全书进度：{learnedIds.size} / {ALL_MATH_ITEMS.length} (
              {Math.round((learnedIds.size / ALL_MATH_ITEMS.length) * 100)}%)
            </span>
          </div>

          {/* 导出课程表（包含未勾选知识点的 CSV） */}
          <button
            onClick={() => exportUnlearnedScheduleCsv(ALL_MATH_ITEMS, learnedIds)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:brightness-105 transition-all cursor-pointer active:scale-95"
            title="一键导出所有尚未勾选知识点的课程计划表 (CSV)"
          >
            <Download className="w-4 h-4" />
            <span>导出课程表</span>
          </button>

          {/* 移动端侧边栏切换按钮 */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="目录大纲"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 核心工作区：侧边栏 + 内容区 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 侧边栏 */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-30
            w-80 sm:w-88 lg:w-96 bg-white border-r border-slate-200/80
            flex flex-col h-[calc(100vh-64px)]
            transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* 搜索与快捷筛选条 */}
          <div className="p-3.5 border-b border-slate-100 space-y-2.5 bg-slate-50/70 shrink-0">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索知识点、算理公式、年级..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 大分类横向滚动切换按钮 */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setActiveCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategoryFilter === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                全部
              </button>
              {(
                [
                  { key: '数与代数', label: '数与代数' },
                  { key: '几何', label: '图形与几何' },
                  { key: '统计与概率', label: '统计与概率' },
                  { key: '解决问题', label: '综合与实践' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategoryFilter(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategoryFilter === cat.key
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 状态与年级小筛选行 */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
              {/* 学习状态 */}
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: 'ALL', label: '全部' },
                    { key: 'UNLEARNED', label: '待学' },
                    { key: 'LEARNED', label: '已学' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setStatusFilter(st.key)}
                    className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                      statusFilter === st.key
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* 折叠/展开全部与匹配数量 */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 tabular-nums">
                  共 {filteredItems.length} 条
                </span>
                <button
                  onClick={handleToggleExpandAll}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  折叠/展开
                </button>
              </div>
            </div>
          </div>

          {/* 三级折叠大纲树内容区 */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 select-none">
            {treeStructure.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                没有找到符合条件的知识点
              </div>
            ) : (
              treeStructure.map((catGroup) => {
                const isCatCollapsed = collapsedCategories[catGroup.categoryKey];
                const catProgressPct =
                  catGroup.totalItemsInCat > 0
                    ? Math.round((catGroup.learnedItemsInCat / catGroup.totalItemsInCat) * 100)
                    : 0;

                return (
                  <div
                    key={catGroup.categoryKey}
                    className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs"
                  >
                    {/* 一级：大分类标题栏 */}
                    <div
                      onClick={() => toggleCategoryCollapse(catGroup.categoryKey)}
                      className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between cursor-pointer border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isCatCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {catGroup.categoryDisplayName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* 该分类完成度指示 */}
                        <div className="w-14 h-1.5 rounded-full bg-slate-200 overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${catProgressPct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                          {catGroup.learnedItemsInCat}/{catGroup.totalItemsInCat}
                        </span>
                      </div>
                    </div>

                    {/* 二级与三级内容区 */}
                    {!isCatCollapsed && (
                      <div className="p-1 space-y-1">
                        {catGroup.subCategories.map((subGroup) => {
                          const subCollapseKey = `${catGroup.categoryKey}_${subGroup.subName}`;
                          const isSubCollapsed = collapsedSubCategories[subCollapseKey];

                          return (
                            <div
                              key={subCollapseKey}
                              className="rounded-xl border border-slate-100/90 bg-slate-50/40 overflow-hidden"
                            >
                              {/* 二级：子分类栏 */}
                              <div
                                onClick={() => toggleSubCategoryCollapse(subCollapseKey)}
                                className="px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/60 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {isSubCollapsed ? (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate">{subGroup.subName}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-500 tabular-nums">
                                    {subGroup.learnedCount}/{subGroup.totalCount}
                                  </span>
                                </div>
                              </div>

                              {/* 三级：知识点列表 */}
                              {!isSubCollapsed && (
                                <div className="p-1 pt-0 space-y-0.5">
                                  {subGroup.items.map((item) => {
                                    const isSelected = item.id === selectedItemId;
                                    const isLearned = learnedIds.has(item.id);

                                    return (
                                      <div
                                        key={item.id}
                                        onClick={() => {
                                          setSelectedItemId(item.id);
                                          setIsIframeLoading(true);
                                          // 移动端选择后自动收起抽屉
                                          if (window.innerWidth < 768) {
                                            setIsMobileSidebarOpen(false);
                                          }
                                        }}
                                        className={`
                                          group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer
                                          ${
                                            isSelected
                                              ? 'bg-emerald-500 text-white font-bold shadow-xs'
                                              : isLearned
                                              ? 'bg-emerald-50/70 text-slate-700 hover:bg-emerald-100/60'
                                              : 'hover:bg-slate-100 text-slate-700'
                                          }
                                        `}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          {/* 复选框：独立点击切换已学状态 */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleLearned(item.id);
                                            }}
                                            className={`
                                              w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors border
                                              ${
                                                isSelected
                                                  ? isLearned
                                                    ? 'bg-white text-emerald-600 border-white'
                                                    : 'border-white/60 hover:bg-white/20'
                                                  : isLearned
                                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                                  : 'border-slate-300 hover:border-emerald-400 bg-white'
                                              }
                                            `}
                                            title={isLearned ? '已掌握（点击取消）' : '未掌握（点击标记为已学）'}
                                          >
                                            {isLearned && <Check className="w-3 h-3 stroke-[3]" />}
                                          </button>

                                          <span
                                            className={`truncate ${
                                              isLearned && !isSelected
                                                ? 'text-slate-600'
                                                : ''
                                            }`}
                                          >
                                            {item.name}
                                          </span>
                                        </div>

                                        {/* 年级微标签 */}
                                        <div className="shrink-0 flex items-center gap-1">
                                          {item.grade ? (
                                            <span
                                              className={`
                                                text-[10px] font-medium px-1.5 py-0.5 rounded-md tabular-nums
                                                ${
                                                  isSelected
                                                    ? 'bg-emerald-600 text-emerald-100'
                                                    : 'bg-slate-100 text-slate-500'
                                                }
                                              `}
                                            >
                                              {item.grade}
                                            </span>
                                          ) : (
                                            <span
                                              className={`
                                                text-[9px] font-medium px-1 py-0.5 rounded-md
                                                ${
                                                  isSelected
                                                    ? 'bg-emerald-600 text-emerald-100'
                                                    : 'bg-amber-100 text-amber-700'
                                                }
                                              `}
                                            >
                                              思维
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* 遮罩层（用于移动端打开侧边栏时点击背景收起） */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-20 md:hidden"
          />
        )}

        {/* 右侧主内容展示区 */}
        <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-100/70 p-2.5 sm:p-4">
          {/* 知识点内容卡片外框 */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/50 overflow-hidden">
            {/* 内容区顶部面包屑与工具条 */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold shrink-0">
                  {activeItem.categoryDisplayName}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-medium text-slate-500 truncate">
                  {activeItem.subCategory}
                </span>
                <span className="text-slate-300">/</span>
                <h3 className="text-sm sm:text-base font-black text-slate-800 truncate">
                  {activeItem.name}
                </h3>
                {activeItem.normalizedGrade && (
                  <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    {activeItem.normalizedGrade}
                  </span>
                )}
              </div>

              {/* 快捷操作组 */}
              <div className="flex items-center gap-2">
                {/* 标记已学快捷开关 */}
                <button
                  onClick={() => toggleLearned(activeItem.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 border
                    ${
                      isCurrentActiveLearned
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-500'
                    }
                  `}
                >
                  {isCurrentActiveLearned ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>已掌握</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-slate-400" />
                      <span>标记为已学</span>
                    </>
                  )}
                </button>

                {/* 上传/替换本讲义 */}
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  title="上传自定义 HTML 替换本知识点内容"
                >
                  <Upload className="w-3.5 h-3.5 text-sky-600" />
                  <span className="hidden sm:inline">上传/替换讲义</span>
                </button>

                {/* 刷新 iframe */}
                <button
                  onClick={() => {
                    setIsIframeLoading(true);
                    setIframeKey((k) => k + 1);
                  }}
                  className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  title="重新加载内容"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* 在新窗口中打开原始知识点 html */}
                <a
                  href={iframeSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  title="在新窗口中打开此知识点网页"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 提示条：显示当前 iframe 加载的文件路径 */}
            <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-mono text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-semibold">
                  iframe
                </span>
                <span className="text-slate-400">资源路径：</span>
                <code className="font-mono text-slate-600 truncate">{iframeSrc}</code>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                支持语音精讲与随堂自测
              </span>
            </div>

            {/* iframe 加载与显示核心区 */}
            <div className="flex-1 relative overflow-hidden bg-white">
              {isIframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
                  <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="mt-3 text-xs text-slate-500 font-medium">
                    正在加载知识点精讲微课...
                  </p>
                </div>
              )}

              <iframe
                key={`${activeItem.id}_${iframeKey}`}
                src={iframeSrc}
                title={activeItem.name}
                onLoad={() => setIsIframeLoading(false)}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        </main>
      </div>

      {/* 知识点讲义上传/替换弹窗 */}
      <UploadKnowledgeModal
        isOpen={isUploadModalOpen}
        initialItem={activeItem}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          setIsIframeLoading(true);
          setIframeKey((k) => k + 1);
        }}
      />
    </div>
  );
}
