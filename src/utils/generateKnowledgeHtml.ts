import { KnowledgeItem } from '../types/math';

/**
 * 为每个知识点生成定制化的趣味知识精讲数据
 */
interface DetailedContent {
  summary: string;
  formulaOrRule?: string;
  mnemonic?: string; // 口诀或巧记
  exampleTitle: string;
  exampleQuestion: string;
  exampleSolution: string;
  practiceQuestion: string;
  practiceAnswer: string;
  practiceAnalysis: string;
  learningTip: string;
}

export function getKnowledgeDetail(item: KnowledgeItem): DetailedContent {
  const { name, categoryDisplayName, subCategory, normalizedGrade } = item;

  // 根据分类和名称智能生成生动且专业的知识点详解
  if (name.includes('认识10以内的数字') || name.includes('0的认识')) {
    return {
      summary: '10以内的数字是所有数学大厦的基石！通过数物体个数、比多少、分与合，建立起最初的“数感”。0既可以表示“一个也没有”，也可以表示起点（如刻度尺的0刻度）或温度的分界点。',
      formulaOrRule: '数数原则：一个对应一个，手口一致；顺序：0、1、2、3、4、5、6、7、8、9、10。',
      mnemonic: '1像铅笔细又长，2像小鸭水上漂，3像耳朵听声音，4像小旗迎风摇，5像秤钩挂青菜，0像鸡蛋圆溜溜。',
      exampleTitle: '基数与序数分辨',
      exampleQuestion: '小兔排队，从左数小兔排第4个，小兔右边还有3只小动物，一共有多少只小动物？',
      exampleSolution: '小兔排第4，说明包括小兔在内左边有4只；右边还有3只；4 + 3 = 7（只）。答：一共有7只小动物。',
      practiceQuestion: '盘子里有5个苹果，小猴吃了5个，盘子里还剩几个苹果？用哪个数字表示？',
      practiceAnswer: '剩 0 个苹果。',
      practiceAnalysis: '5 - 5 = 0，0在这里表示“一个也没有”。',
      learningTip: '在生活里多和孩子玩“数数周围物品”的游戏，利用积木进行实物拆分（如把5颗糖分成2颗和3颗）。',
    };
  }

  if (name.includes('鸡兔同笼')) {
    return {
      summary: '“鸡兔同笼”是中国古代著名的数学趣题，出自《孙子算经》。核心在于利用“假设法”找出头数与脚数之间的差额，从而算出鸡和兔的数量。',
      formulaOrRule: '假设全是鸡：兔数 = (总脚数 - 总头数×2) ÷ (4 - 2)；鸡数 = 总头数 - 兔数。',
      mnemonic: '假设全是鸡，脚少因无兔；多出脚两只，除以二得兔！',
      exampleTitle: '经典鸡兔同笼问题',
      exampleQuestion: '笼子里有若干只鸡和兔。从上面数有8个头，从下面数有26只脚。问笼中鸡和兔各有几只？',
      exampleSolution: '假设全是鸡，应有脚：8 × 2 = 16(只)；实际脚比假设多：26 - 16 = 10(只)；每把一只鸡换成兔，就多 4 - 2 = 2只脚；所以兔有：10 ÷ 2 = 5(只)；鸡有：8 - 5 = 3(只)。检验：3×2 + 5×4 = 6 + 20 = 26，符合题意。',
      practiceQuestion: '自行车和三轮车共10辆，一共有26个轮子。自行车和三轮车各有多少辆？',
      practiceAnswer: '三轮车6辆，自行车4辆。',
      practiceAnalysis: '假设全是自行车，共有轮子 10 × 2 = 20个。比实际少 26 - 20 = 6个。每辆三轮车比自行车多1个轮，故三轮车为 6 ÷ (3 - 2) = 6辆，自行车为 10 - 6 = 4辆。',
      learningTip: '除了假设法，还可以尝试“抬腿法”或“方程法”对比体会数学思维的多样性！',
    };
  }

  if (name.includes('周长') || name.includes('面积')) {
    return {
      summary: `${name}是几何测量的核心内容。周长是围成平面图形所有边长的总和（长度单位），而面积是指物体表面或封闭图形所占大小的量度（面积单位）。`,
      formulaOrRule: name.includes('长方形') 
        ? '长方形周长 = (长 + 宽) × 2；长方形面积 = 长 × 宽。'
        : name.includes('正方形')
        ? '正方形周长 = 边长 × 4；正方形面积 = 边长 × 边长。'
        : name.includes('圆')
        ? '圆周长 C = 2πr = πd；圆面积 S = πr²。'
        : '封闭图形边缘一周的长度即为周长；图形覆盖平面的大小即为面积。',
      mnemonic: '周长围一周，单位米与厘米；面积铺满面，单位平方要牢记！',
      exampleTitle: '典型计算与应用',
      exampleQuestion: `一个长方形花坛的长是8米，宽是5米。如果给花坛四周围上篱笆，篱笆长多少米？这个花坛的占地面积是多少平方米？`,
      exampleSolution: '篱笆长度即求周长：(8 + 5) × 2 = 13 × 2 = 26(米)；占地面积即求面积：8 × 5 = 40(平方米)。答：篱笆长26米，占地面积40平方米。',
      practiceQuestion: '一个正方形边长是6分米，它的周长和面积各是多少？',
      practiceAnswer: '周长是24分米，面积是36平方分米。',
      practiceAnalysis: '周长 = 6 × 4 = 24(分米)；面积 = 6 × 6 = 36(平方分米)。注意周长与面积单位不能混淆！',
      learningTip: '可以用手指顺着图形边缘描一圈体会“周长”，用小方格纸涂满颜色体会“面积”。',
    };
  }

  if (name.includes('加法') || name.includes('减法')) {
    return {
      summary: `${name}是小学数与代数的核心运算能力。加法表示把两个数合并成一个数的运算，减法是已知两个加数的和与其中一个加数，求另一个加数的运算。`,
      formulaOrRule: '加法：加数 + 加数 = 和；减法：被减数 - 减数 = 差。笔算时相同数位对齐，从个位算起。',
      mnemonic: '相同数位要对齐，从低算起心要细；个位满十向前进，不够减时借一当十！',
      exampleTitle: '算法与算理剖析',
      exampleQuestion: `口算或笔算：48 + 37 = ？与 72 - 38 = ？`,
      exampleSolution: '48 + 37：个位 8+7=15，向十位进1，个位写5；十位 4+3+1=8，结果为 85。\n72 - 38：个位 2-8不够减，从十位借1当十，12-8=4；十位 7借走1剩6，6-3=3，结果为 34。',
      practiceQuestion: '商场里一双运动鞋原价95元，现优惠促销减去28元，买这双鞋需要付多少元？',
      practiceAnswer: '需要付 67 元。',
      practiceAnalysis: '95 - 28 = 67(元)。十位借位后 15 - 8 = 7，8 - 2 = 6。',
      learningTip: '多做口算卡片训练速度，遇到退位减法一定要在草稿纸上点退位点避免粗心。',
    };
  }

  if (name.includes('乘法') || name.includes('除法')) {
    return {
      summary: `${name}是小学高频核心考点。乘法是求几个相同加数和的简便运算；除法是已知两个因数的积与其中一个因数，求另一个因数的运算。`,
      formulaOrRule: '乘法：因数 × 因数 = 积；除法：被除数 ÷ 除数 = 商……余数(余数必须小于除数)。',
      mnemonic: '因数乘因数，九九乘法熟记心；除数试商先看前，余数定要比除小！',
      exampleTitle: '乘除法综合应用',
      exampleQuestion: '学校买来48本课外图书，平均分给6个兴趣小组，每个小组分得几本？如果分给5个小组，每组分几本，还剩几本？',
      exampleSolution: '第一问：48 ÷ 6 = 8(本)；第二问：48 ÷ 5 = 9(本)……3(本)。答：每组分8本；分给5个组每组9本还剩3本。',
      practiceQuestion: '36名同学去公园划船，每条船最多坐4人，至少需要租几条船？',
      practiceAnswer: '至少需要租 9 条船。',
      practiceAnalysis: '36 ÷ 4 = 9(条)，正好坐满9条船。',
      learningTip: '熟背乘法口诀是学好乘除法的基础，理解“几倍”、“平均分”的实际意义是解决应用题的关键。',
    };
  }

  if (name.includes('分数') || name.includes('小数') || name.includes('百分数')) {
    return {
      summary: `${name}拓展了数的范围，让我们可以精准表示不足1或按比例分配的量。掌握分母、分子、约分、通分以及小数与分数的互化是小学高年级的关键跨越。`,
      formulaOrRule: '分数的基本性质：分数的分子和分母同时乘或除以相同的数(0除外)，分数的大小不变。',
      mnemonic: '把单位“1”平均分，分母在下分子上；约分化简找公因，通分相加母相同！',
      exampleTitle: '分数与实际意义',
      exampleQuestion: '一根绳子长5米，平均剪成8段，每段长多少米？每段占这根绳子的几分之几？',
      exampleSolution: '每段长度表示具体数量：5 ÷ 8 = 5/8(米)；每段占整根绳子的分率：1 ÷ 8 = 1/8。注意：带单位是具体长度，不带单位是分率！',
      practiceQuestion: '把 0.75 化成分数，把 3/5 化成小数和百分数。',
      practiceAnswer: '0.75 = 3/4；3/5 = 0.6 = 60%。',
      practiceAnalysis: '0.75 = 75/100 = 3/4；3/5 = 3 ÷ 5 = 0.6 = 60%。',
      learningTip: '特别区分“分率”与“具体量”，多结合数轴或圆形披萨分块图建立直观模型。',
    };
  }

  // 通用兜底但富有深度
  return {
    summary: `【${name}】是小学数学${categoryDisplayName}模块（${subCategory}）中的重要知识点，对应${normalizedGrade}的学习阶段。重点考察学生的逻辑推导、数感建立与综合解决实际问题的能力。`,
    formulaOrRule: `掌握【${name}】的基础概念，熟记基本计算法则与推理步骤，学会画线段图或图表分析数量关系。`,
    mnemonic: '审题要仔细，画图明关系；列式算准确，检验不漏题！',
    exampleTitle: '典型考题与解析',
    exampleQuestion: `请根据【${name}】的核心要求，结合题目中的已知条件，列式计算并写出解题思考过程。`,
    exampleSolution: `解题步骤：\n1. 仔细阅读题目，提取关键数字与单位；\n2. 运用“${subCategory}”的计算法则确定运算顺序或几何公式；\n3. 仔细运算并在草稿本上核对检验；\n4. 写出规范的“答语”。`,
    practiceQuestion: `针对【${name}】进行自测：在练习本上尝试写出一个与此知识点相关的实际生活案例并解答。`,
    practiceAnswer: '答案与思考：请对照例题解题步骤，检查单位换算与计算准确度。',
    practiceAnalysis: '数学来源于生活，将数学知识点还原到生活场景（如购物、排队、测量、统计）中，能更快加深理解！',
    learningTip: '建议结合教材相应课本例题进行跟练，配合课后习题巩固强化，不懂随时回看知识点！',
  };
}

/**
 * 生成独立的完整 HTML 页面字符串
 */
export function generateKnowledgeHtml(item: KnowledgeItem): string {
  const detail = getKnowledgeDetail(item);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item.name} - 小学生数学知识点精讲</title>
  <style>
    :root {
      --primary: #4caf50;
      --primary-hover: #43a047;
      --primary-light: #e8f5e9;
      --sky: #0284c7;
      --sky-light: #e0f2fe;
      --amber: #d97706;
      --amber-light: #fef3c7;
      --slate-dark: #1e293b;
      --slate-body: #334155;
      --slate-muted: #64748b;
      --border: #e2e8f0;
      --bg: #f8fafc;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 160px);
      color: var(--slate-body);
      line-height: 1.6;
      padding: 24px 20px 48px;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
    }
    .header-card {
      background: #ffffff;
      border: 1px solid rgba(76, 175, 80, 0.2);
      border-radius: 20px;
      padding: 24px 28px;
      box-shadow: 0 4px 20px -2px rgba(76, 175, 80, 0.08);
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
    }
    .header-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #4caf50, #0284c7);
    }
    .badge-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--slate-muted);
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .badge-tag {
      background: var(--primary-light);
      color: #2e7d32;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 12px;
    }
    .badge-grade {
      background: var(--sky-light);
      color: var(--sky);
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 12px;
    }
    h1 {
      font-size: 26px;
      color: var(--slate-dark);
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .summary-text {
      font-size: 15px;
      color: #475569;
      line-height: 1.7;
    }
    .action-row {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn-primary {
      background: #4caf50;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: var(--primary-hover);
    }
    .btn-outline {
      background: #ffffff;
      border-color: var(--border);
      color: var(--slate-body);
    }
    .btn-outline:hover {
      background: #f1f5f9;
    }
    .card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 22px 24px;
      margin-bottom: 18px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    }
    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--slate-dark);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .rule-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border: 1px solid #bbf7d0;
      border-radius: 14px;
      padding: 16px 18px;
      font-size: 15px;
      color: #166534;
      font-weight: 600;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    .mnemonic-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 14px;
      padding: 14px 18px;
      font-size: 14px;
      color: #92400e;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .example-q {
      background: #f8fafc;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 12px;
      border-left: 4px solid var(--sky);
      font-size: 14.5px;
      color: #1e293b;
    }
    .example-a {
      font-size: 14px;
      color: #334155;
      white-space: pre-line;
      line-height: 1.8;
      background: #fcfcfc;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px dashed var(--border);
    }
    .quiz-container {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 16px;
      padding: 20px;
    }
    .quiz-q {
      font-size: 15px;
      font-weight: 600;
      color: #581c87;
      margin-bottom: 12px;
    }
    .answer-panel {
      display: none;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px dashed #d8b4fe;
      animation: fadeIn 0.3s ease;
    }
    .answer-panel.show {
      display: block;
    }
    .answer-text {
      color: #15803d;
      font-weight: 700;
      font-size: 14.5px;
      margin-bottom: 6px;
    }
    .analysis-text {
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.6;
    }
    .tip-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 13.5px;
      color: #0369a1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .footer-note {
      text-align: center;
      margin-top: 32px;
      font-size: 12.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <div class="badge-bar">
        <span class="badge-tag">${item.categoryDisplayName}</span>
        <span>/</span>
        <span>${item.subCategory}</span>
        <span class="badge-grade">${item.normalizedGrade}</span>
      </div>
      <h1>
        <span>${item.name}</span>
      </h1>
      <p class="summary-text">${detail.summary}</p>
      <div class="action-row">
        <button class="btn btn-primary" onclick="markLearned()">
          <span>✓</span> 标记为已学好
        </button>
        <button class="btn btn-outline" onclick="speakText()">
          <span>🔊</span> 听语音精讲
        </button>
      </div>
    </div>

    ${detail.formulaOrRule ? `
    <div class="card">
      <div class="card-title">
        <span>📐 核心公式与法则</span>
      </div>
      <div class="rule-box">
        ${detail.formulaOrRule}
      </div>
      ${detail.mnemonic ? `
      <div class="mnemonic-box">
        <span>💡 <b>学霸口诀：</b></span>
        <span>${detail.mnemonic}</span>
      </div>` : ''}
    </div>` : ''}

    <div class="card">
      <div class="card-title">
        <span>📖 ${detail.exampleTitle}</span>
      </div>
      <div class="example-q">
        <b>【例题】</b>${detail.exampleQuestion}
      </div>
      <div class="example-a">
        <b>【详细解析与答题】：</b>
        ${detail.exampleSolution}
      </div>
    </div>

    <div class="card quiz-container">
      <div class="card-title" style="color: #6b21a8;">
        <span>🎯 动动脑·随堂小测</span>
      </div>
      <div class="quiz-q">
        <b>【自测题】</b>${detail.practiceQuestion}
      </div>
      <button class="btn btn-outline" style="background:#ffffff; color:#6b21a8; border-color:#d8b4fe;" onclick="toggleAnswer()">
        <span id="btnText">👀 查看参考答案与思路</span>
      </button>
      <div class="answer-panel" id="answerPanel">
        <div class="answer-text">✅ 参考答案：${detail.practiceAnswer}</div>
        <div class="analysis-text"><b>思路剖析：</b>${detail.practiceAnalysis}</div>
      </div>
    </div>

    <div class="tip-box">
      <span>💡</span>
      <span><b>名师支招：</b>${detail.learningTip}</span>
    </div>

    <div class="footer-note">
      小学数学全景知识图谱 · 知识点文件：./knowledge/${encodeURIComponent(item.name)}.html
    </div>
  </div>

  <script>
    function toggleAnswer() {
      const panel = document.getElementById('answerPanel');
      const btnText = document.getElementById('btnText');
      if (panel.classList.contains('show')) {
        panel.classList.remove('show');
        btnText.innerText = '👀 查看参考答案与思路';
      } else {
        panel.classList.add('show');
        btnText.innerText = '🙈 隐藏答案与解析';
      }
    }

    function markLearned() {
      // 向父级 React 窗口发送同步消息
      try {
        window.parent.postMessage({
          type: 'TOGGLE_LEARNED_FROM_IFRAME',
          name: '${item.name}',
          id: '${item.id}'
        }, '*');
      } catch (e) {
        console.error(e);
      }
      alert('已成功向主程序同步：已掌握【${item.name}】！');
    }

    function speakText() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = "${item.name}。${detail.summary}。核心要点：${detail.formulaOrRule || ''}";
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'zh-CN';
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
      } else {
        alert('抱歉，当前浏览器不支持语音朗读功能。');
      }
    }
  </script>
</body>
</html>`;
}
