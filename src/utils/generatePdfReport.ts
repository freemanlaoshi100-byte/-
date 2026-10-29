import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * 将指定的 DOM 节点渲染为高清 A4 PDF 文件并触发浏览器下载
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  fileName: string = '小学数学学习进度诊断报告.pdf'
): Promise<void> {
  // 配置 html2canvas 渲染参数，使用 2 倍缩放确保打印高清清晰度
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // A4 纸张尺寸（毫米）：210 x 297
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // 第一页
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // 如果内容超过一页，支持多页自动分页
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  // 保存并触发下载
  pdf.save(fileName);
}
