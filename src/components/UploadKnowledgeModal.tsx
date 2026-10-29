import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  FileCode,
  Download,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { KnowledgeItem } from '../types/math';
import { ALL_MATH_ITEMS } from '../data/rawMathData';

interface UploadKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: KnowledgeItem;
  onUploadSuccess: (item: KnowledgeItem) => void;
}

export function UploadKnowledgeModal({
  isOpen,
  onClose,
  initialItem,
  onUploadSuccess,
}: UploadKnowledgeModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialItem ? initialItem.id : ALL_MATH_ITEMS[0].id
  );

  const [inputMode, setInputMode] = useState<'FILE' | 'CODE'>('FILE');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const selectedItem = ALL_MATH_ITEMS.find((it) => it.id === selectedItemId) || ALL_MATH_ITEMS[0];

  // 处理文件读取
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('请上传以 .html 或 .htm 结尾的网页讲义文件！');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      setStatusMessage({
        type: 'success',
        text: `已读取文件 "${file.name}" (${Math.round(content.length / 1024)} KB)`,
      });
    };
    reader.onerror = () => {
      setStatusMessage({ type: 'error', text: '读取本地文件失败，请重试' });
    };
    reader.readAsText(file, 'utf-8');
  };

  // 提交上传保存
  const handleSaveUpload = async () => {
    if (!fileContent.trim()) {
      alert('请先选择 HTML 文件或输入内容！');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // 目标文件名：以选中的知识点名称命名
      const targetName = selectedItem.name;

      const res = await fetch('/api/upload-knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: targetName,
          content: fileContent,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setStatusMessage({
          type: 'success',
          text: `🎉 成功！已将微课讲义写入 /public/knowledge/${targetName}.html，系统将即时加载更新！`,
        });
        setTimeout(() => {
          onUploadSuccess(selectedItem);
          onClose();
        }, 1200);
      } else {
        throw new Error(result.error || '保存失败');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `保存失败：${err?.message || '网络或服务异常'}。你可以将文件手动拷贝到 /public/knowledge/ 目录`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 下载标准模板
  const handleDownloadTemplate = () => {
    window.open('/knowledge/templates/knowledge_template.html', '_blank');
  };

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

        {/* 弹窗实体 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-slate-800"
        >
          {/* 弹窗头部 */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  上传/替换知识点具体内容
                </h3>
                <p className="text-xs text-slate-500">
                  上传自定义 HTML 讲义文件至 <code className="text-emerald-700 font-mono">/public/knowledge/</code>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 弹窗主体内容 */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* 1. 选择目标知识点 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                1. 选择要上传讲义的目标知识点：
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                {ALL_MATH_ITEMS.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.categoryDisplayName}] {item.name} ({item.normalizedGrade || '通用'})
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>
                  生成路径：<code className="text-slate-600 font-mono">./knowledge/{selectedItem.name}.html</code>
                </span>
                <span className="text-emerald-600 font-medium">已预置默认讲义</span>
              </div>
            </div>

            {/* 2. 上传方式切换 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  2. 选择导入方式：
                </label>
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setInputMode('FILE')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      inputMode === 'FILE'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    本地文件上传
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('CODE')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      inputMode === 'CODE'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    在线输入代码
                  </button>
                </div>
              </div>

              {inputMode === 'FILE' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <FileCode className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    {fileName ? `已选文件：${fileName}` : '点击选择或拖拽本地 .html 讲义文件'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    支持标准 HTML、带内联样式的微课讲义或富文本网页
                  </p>
                </div>
              ) : (
                <textarea
                  rows={7}
                  placeholder="在此直接粘贴或编写 <html>...</html> 网页源代码..."
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              )}
            </div>

            {/* 状态提示反馈 */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* 3. 文件夹说明与模板下载卡片 */}
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 space-y-2 text-xs text-sky-900">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-sky-600" />
                  文件夹位置说明：
                </span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  下载标准讲义空白模板
                </button>
              </div>
              <p className="text-[11px] text-sky-800/90 leading-relaxed">
                所有知识点文件均保存在项目的 <code>/public/knowledge/</code> 根目录及四大模块子目录中。
                你也可以直接在代码编辑器中将 <code>.html</code> 文件拖入 <code>public/knowledge/</code> 即可永久生效！
              </p>
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={isSubmitting || !fileContent.trim()}
              onClick={handleSaveUpload}
              className={`
                px-5 py-2 rounded-xl text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm active:scale-95
                ${
                  isSubmitting || !fileContent.trim()
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }
              `}
            >
              {isSubmitting ? '正在写入保存...' : '确认保存并生效'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
