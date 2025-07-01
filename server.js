const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.')); // 服务静态文件

// PDF生成服务
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { bank, title, includeAnswer, includeExplanation } = req.body;
    
    if (!bank || !bank.questions) {
      return res.status(400).json({ error: '题库数据无效' });
    }

    // 创建PDF文档
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // 设置响应头（修复中文/特殊字符文件名问题）
    const safeTitle = encodeURIComponent((title || '试卷').replace(/"/g, ''));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${safeTitle}.pdf`);

    // 将PDF流式传输到响应
    doc.pipe(res);

    // 设置中文字体（优先使用SimHei.ttf）
    const fontPath = path.join(__dirname, 'fonts', 'SimHei.ttf');
    let fontName = 'SimHei';
    try {
      if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
        fontName = 'SimHei';
      } else {
        doc.font('Helvetica');
        fontName = 'Helvetica';
      }
    } catch (err) {
      console.log('使用默认字体');
      doc.font('Helvetica');
      fontName = 'Helvetica';
    }

    // 生成试卷内容
    generateExamPDF(doc, bank, title, includeAnswer, includeExplanation, fontName);

    // 完成PDF生成
    doc.end();

  } catch (error) {
    console.error('PDF生成错误:', error);
    res.status(500).json({ error: 'PDF生成失败' });
  }
});

// 生成试卷PDF内容
function generateExamPDF(doc, bank, title, includeAnswer, includeExplanation, fontName) {
  // 提取所有题目
  let questions = [];
  if (bank.questions && bank.questions.length > 0) {
    bank.questions.forEach(category => {
      if (category.questions && category.questions.length > 0) {
        questions = questions.concat(category.questions.map(q => ({
          ...q,
          type: category.type
        })));
      }
    });
  }

  if (questions.length === 0) {
    doc.fontSize(16).text('暂无题目', { align: 'center' });
    return;
  }

  // 试卷头部
  doc.fontSize(24).font(fontName).text(title || '试卷', { align: 'center' });
  doc.moveDown(0.5);
  
  doc.fontSize(14).text('考试时间：120分钟', { align: 'center' });
  doc.fontSize(14).text(`总分：${questions.length * 10}分`, { align: 'center' });
  doc.fontSize(14).text('注意事项：请认真审题，独立完成，不得抄袭', { align: 'center' });
  
  // 分隔线
  doc.moveDown(1);
  doc.strokeColor('#000000').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  // 考生信息区域
  doc.fontSize(14).text('考生信息', { underline: true });
  doc.moveDown(0.5);
  
  const studentInfoY = doc.y;
  doc.fontSize(12).text('考生姓名：_________________', 50, studentInfoY);
  doc.text('学号：_________________', 250, studentInfoY);
  doc.text('成绩：_________________', 400, studentInfoY);
  
  doc.moveDown(2);

  // 题目区域
  doc.fontSize(16).text('题目', { underline: true });
  doc.moveDown(1);

  let questionNumber = 1;
  questions.forEach((question, index) => {
    // 检查是否需要分页
    if (doc.y > 700) {
      doc.addPage();
    }

    // 题目编号和类型
    const questionText = `${questionNumber}. [${question.type}] ${question.question}`;
    doc.fontSize(12).font(fontName).text(questionText, { continued: false });
    doc.moveDown(0.5);

    // 选项或填空区域
    if (question.type === '选择题' && question.options) {
      question.options.forEach((option, optIndex) => {
        const optionText = `${String.fromCharCode(65 + optIndex)}. ${option}`;
        doc.fontSize(11).text(optionText, { indent: 20 });
        doc.moveDown(0.3);
      });
    } else if (question.type === '填空题') {
      doc.fontSize(11).text('答案：_________________', { indent: 20 });
      doc.moveDown(0.3);
    } else if (question.type === '判断题') {
      doc.fontSize(11).text('( ) 正确  ( ) 错误', { indent: 20 });
      doc.moveDown(0.3);
    }

    // 答案（如果包含）
    if (includeAnswer) {
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#28a745').text(`答案：${question.answer}`, { indent: 20 });
      doc.fillColor('#000000');
    }

    // 解析（如果包含）
    if (includeExplanation && question.explanation) {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#6c757d').text(`解析：${question.explanation}`, { indent: 20 });
      doc.fillColor('#000000');
    }

    doc.moveDown(1);
    questionNumber++;
  });

  // 添加页码（修复页码越界问题）
  try {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      doc.fontSize(10).text(
        `第 ${i + 1} 页`,
        pageWidth - 100,
        pageHeight - 50,
        { align: 'center' }
      );
    }
  } catch (e) {
    console.error('页码添加失败:', e);
  }
}

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PDF服务运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`PDF服务已启动，端口: ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
}); 