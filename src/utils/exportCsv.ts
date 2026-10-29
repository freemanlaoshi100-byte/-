import { KnowledgeItem } from '../types/math';

/**
 * 导出未学知识点或指定知识点为 CSV 格式学习计划表
 * 包含 UTF-8 BOM，解决 Excel 打开中文乱码问题
 */
export function exportUnlearnedScheduleCsv(
  items: KnowledgeItem[],
  learnedSet: Set<string>,
  fileName?: string
) {
  // 筛选未勾选的知识点
  const unlearnedItems = items.filter((item) => !learnedSet.has(item.id));

  // CSV 表头
  const headers = ['序号', '大模块', '子分类', '知识点名称', '对应年级', '规范学段', '学习状态', '计划学习日期/周次', '自测打卡与复习备注'];

  const rows = (unlearnedItems.length > 0 ? unlearnedItems : items).map((item, index) => {
    const isLearned = learnedSet.has(item.id);
    const statusText = isLearned ? '已掌握' : '待学习(未学)';
    const planWeek = `第 ${Math.floor(index / 5) + 1} 周`;
    const tips = '建议课前自主预习概念并完成随堂小测';

    // 转义逗号与双引号
    const safe = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

    return [
      index + 1,
      safe(item.categoryDisplayName),
      safe(item.subCategory),
      safe(item.name),
      safe(item.grade || '通用'),
      safe(item.normalizedGrade),
      safe(statusText),
      safe(planWeek),
      safe(tips),
    ].join(',');
  });

  // 添加 UTF-8 BOM: \uFEFF
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  
  const defaultTitle = unlearnedItems.length > 0
    ? `小学数学提前学课程表_待学知识点_${dateStr}.csv`
    : `小学数学全景课程总表_${dateStr}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName || defaultTitle);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
