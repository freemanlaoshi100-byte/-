import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Printer,
  FileText,
  Award,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CategoryStat, Achievement } from '../types/math';
import { downloadElementAsPdf } from '../utils/generatePdfReport';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  learnedCount: number;
  totalCount: number;
  totalPercentage: number;
  categoryStats: CategoryStat[];
  achievements: Achievement[];
}

export function PdfReportModal({
  isOpen,
  onClose,
  learnedCount,
  totalCount,
  totalPercentage,
  categoryStats,
  achievements,
}: PdfReportModalProps) {
  const [studentName, setStudentName] = useState('数学小探索家');
  const [studentGrade, setStudentGrade] = useState('小学数学');
  const [teacherNotes, setTeacherNotes] = useState('坚持每日攻克新考点，注重算理推导与错题反思，思维稳步提升！');
  const [isExporting, setIsExporting] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 获取荣誉称号
  const getHonorTitle = (pct: number) => {
    if (pct === 0) return '整装待发 · 初生新星';
    if (pct < 20) return '数学小萌新 ⭐';
    if (pct < 50) return '思维小能手 🚀';
    if (pct < 80) return '数学进阶学者 🏆';
    if (pct < 100) return '准满分学霸 🔥';
    return '全能数学小博士 👑';
  };

  const honorTitle = getHonorTitle(totalPercentage);

  // 智能学情诊断：找出薄弱与优势模块
  const sortedStats = [...categoryStats].sort((a, b) => b.percentage - a.percentage);
  const bestModule = sortedStats[0];
  const weakModule = sortedStats[sortedStats.length - 1];

  // 下载 PDF
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const now = new Date();
      const dateTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}`;
      const fileName = `小学数学学习进度诊断报告_${studentName}_${dateTag}.pdf`;
      await downloadElementAsPdf(reportRef.current, fileName);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('导出 PDF 时发生错误，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 直接打印
  const handlePrint = () => {
    window.print();
  };

  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* 弹窗主体 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-slate-800 flex flex-col my-auto max-h-[92vh]"
        >
          {/* 顶部控制栏 */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  学习进度诊断报告预览
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    PDF 可视化
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  可自定义学生姓名后，一键生成高清 A4 纸张格式 PDF 学习报告
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                title="调用系统打印机打印"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>打印</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在生成 PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>下载 PDF 报告</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 属性微调输入区 */}
          <div className="px-6 py-2.5 bg-emerald-50/50 border-b border-emerald-100/80 flex flex-wrap items-center gap-4 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold text-slate-600">学生姓名：</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="输入学生姓名"
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium w-28 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold text-slate-600">学段年级：</span>
              <input
                type="text"
                value={studentGrade}
                onChange={(e) => setStudentGrade(e.target.value)}
                placeholder="如三年级"
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium w-24 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold text-slate-600">评语寄语：</span>
              <input
                type="text"
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="输入教师/家长鼓励寄语"
                className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 报告渲染区域（用于生成高清 PDF 的真实 DOM） */}
          <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/80 flex justify-center flex-1">
            <div
              ref={reportRef}
              className="w-full max-w-[800px] bg-white p-7 sm:p-9 rounded-2xl shadow-sm border border-slate-200/90 text-slate-800 space-y-6"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              {/* 报告头部 Banner */}
              <div className="border-b-2 border-emerald-600 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1.5">
                      <span>教育部义务教育数学新课标</span>
                      <span>·</span>
                      <span>全书 241 核心知识点诊断</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      小学数学学习进度与学情诊断报告
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Mathematics Learning Progress & Competency Diagnostic Report
                    </p>
                  </div>

                  {/* 官方评定印章效果 */}
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600/70 p-1 flex items-center justify-center shrink-0 rotate-12 bg-emerald-50/40">
                    <div className="w-full h-full rounded-full border border-emerald-600 flex flex-col items-center justify-center text-[10px] text-emerald-800 font-black leading-tight text-center">
                      <span>新课标</span>
                      <span className="text-[11px] text-emerald-600 font-black">认证档案</span>
                      <span>已校验</span>
                    </div>
                  </div>
                </div>

                {/* 学生基础档案条 */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">学生姓名：</span>
                    <span className="font-bold text-slate-800">{studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">所在学段：</span>
                    <span className="font-bold text-slate-800">{studentGrade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">报告生成日期：</span>
                    <span className="font-bold text-slate-800">{todayStr}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">荣誉等级：</span>
                    <span className="font-bold text-emerald-700">{honorTitle}</span>
                  </div>
                </div>
              </div>

              {/* 核心指标统计区 */}
              <div>
                <h2 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>一、全景掌握率核心指标</span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-100 text-center">
                    <div className="text-[11px] font-semibold text-emerald-700">全书掌握率</div>
                    <div className="text-2xl font-black text-emerald-800 tabular-nums mt-0.5">
                      {totalPercentage}%
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-center">
                    <div className="text-[11px] font-semibold text-slate-500">已攻克考点</div>
                    <div className="text-2xl font-black text-slate-800 tabular-nums mt-0.5">
                      {learnedCount} <span className="text-xs font-normal text-slate-400">/ {totalCount}</span>
                    </div>
                  </div>

                  <div className="bg-sky-50/70 rounded-xl p-3 border border-sky-100 text-center">
                    <div className="text-[11px] font-semibold text-sky-700">尚待学习考点</div>
                    <div className="text-2xl font-black text-sky-800 tabular-nums mt-0.5">
                      {totalCount - learnedCount} <span className="text-xs font-normal text-slate-400">个</span>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-100 text-center">
                    <div className="text-[11px] font-semibold text-amber-700">已点亮荣誉勋章</div>
                    <div className="text-2xl font-black text-amber-800 tabular-nums mt-0.5">
                      {unlockedAchievementsCount} <span className="text-xs font-normal text-slate-400">/ 8 枚</span>
                    </div>
                  </div>
                </div>

                {/* 总进度条 */}
                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>全书 241 个考点总体学习完成进度</span>
                    <span className="font-bold text-slate-700 tabular-nums">{learnedCount} / 241 ({totalPercentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                      style={{ width: `${totalPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 四大核心知识模块剖析 */}
              <div>
                <h2 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>二、四大核心领域掌握情况</span>
                </h2>

                <div className="space-y-2.5">
                  {categoryStats.map((cat) => {
                    return (
                      <div
                        key={cat.key}
                        className="p-3 rounded-xl border border-slate-200/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-[140px]">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.themeColor }}
                          />
                          <div>
                            <span className="font-black text-slate-800">{cat.displayName}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5">
                              (共 {cat.total} 考点)
                            </span>
                          </div>
                        </div>

                        {/* 进度条与数量 */}
                        <div className="flex-1 max-w-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>已掌握 {cat.learned} 考点</span>
                            <span className="font-bold text-slate-700 tabular-nums">
                              {cat.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${cat.percentage}%`,
                                backgroundColor: cat.themeColor,
                              }}
                            />
                          </div>
                        </div>

                        {/* 评级标签 */}
                        <div className="shrink-0 text-right sm:w-24">
                          {cat.percentage >= 80 ? (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              优秀精通
                            </span>
                          ) : cat.percentage >= 40 ? (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[11px]">
                              稳步进阶
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                              建议加强
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 智能诊断与教学指导建议 */}
              <div>
                <h2 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>三、智能学情诊断与提分建议</span>
                </h2>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs leading-relaxed space-y-2 text-slate-700">
                  <p>
                    <b>优势领域分析：</b>在【{bestModule?.displayName || '数与代数'}】模块掌握率最高（
                    {bestModule?.percentage || 0}%），展现了良好的学习基础与吸收能力。
                  </p>
                  <p>
                    <b>重点突破建议：</b>针对【{weakModule?.displayName || '综合与实践'}】模块（当前掌握{' '}
                    {weakModule?.percentage || 0}%），建议优先攻克其核心考点，配合例题与草稿纸分步演练，加深理解。
                  </p>
                  <p>
                    <b>科学复习节奏：</b>建议每周规划学习 4~6 个新知识点，并在 3 天与 7 天后回顾已学考点微课自测，利用遗忘曲线固化记忆。
                  </p>
                </div>
              </div>

              {/* 家校共育与签章栏 */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-600">
                <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    指导教师 / 教研组评语：
                  </div>
                  <p className="text-[11px] text-slate-500 italic leading-normal">
                    “{teacherNotes}”
                  </p>
                  <div className="pt-2 text-right text-[11px] text-slate-400">
                    签名：________________
                  </div>
                </div>

                <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    家长打卡反馈与寄语：
                  </div>
                  <p className="text-[11px] text-slate-500 italic leading-normal">
                    孩子在学习中表现出极高的探索兴趣，继续保持专注与自律！
                  </p>
                  <div className="pt-2 text-right text-[11px] text-slate-400">
                    家长签名：________________
                  </div>
                </div>
              </div>

              {/* 底部版权与说明 */}
              <div className="text-center text-[10px] text-slate-400 pt-1">
                小学生数学知识点全景图谱 · 官方认证学情数据报告 · 存档编号：MATH-{Date.now().toString().slice(-6)}
              </div>
            </div>
          </div>

          {/* 底部按钮栏 */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">
              提示：点击“下载 PDF 报告”可直接保存为标准 A4 PDF 文件
            </span>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                关闭预览
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownloadPdf}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在生成...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>下载 PDF 学习进度报告</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
