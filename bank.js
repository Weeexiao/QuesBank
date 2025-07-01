document.addEventListener('DOMContentLoaded', () => {
  const bankList = document.getElementById('bankList');
  const importBtn = document.getElementById('importBankBtn');
  const exportBtn = document.getElementById('exportBankBtn');
  const addBtn = document.getElementById('addBankBtn');

  // 渲染题库列表
  function renderBankList() {
    const banks = JSON.parse(localStorage.getItem('questionBank') || '[]');
    bankList.innerHTML = '';
    if (banks.length === 0) {
      bankList.innerHTML = '<div class="text-gray-400 text-center py-4"><i class="fa fa-folder-open-o text-3xl mb-2 block"></i>暂无题库</div>';
      return;
    }
    banks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    banks.forEach(item => {
      const div = document.createElement('div');
      div.className = 'border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between';
      // 左侧信息
      const info = document.createElement('div');
      info.className = 'flex flex-col sm:flex-row sm:items-center gap-2';
      const title = document.createElement('span');
      title.className = 'font-bold text-gray-800';
      title.textContent = item.name ? item.name : `题库 #${item.id.substring(8)}`;
      const stats = document.createElement('span');
      stats.className = 'text-xs text-gray-500';
      stats.textContent = `共${item.totalQuestions || 0}题`;
      info.appendChild(title);
      info.appendChild(stats);
      // 右侧操作
      const ops = document.createElement('div');
      ops.className = 'flex gap-2 mt-2 sm:mt-0';
      // 详情
      const detailBtn = document.createElement('button');
      detailBtn.className = 'text-primary hover:text-primary/80 text-sm flex items-center';
      detailBtn.innerHTML = '<i class="fa fa-list mr-1"></i> 详情';
      detailBtn.onclick = () => {
        window.location.href = `bank_detail.html?id=${item.id}`;
      };
      // 重命名
      const renameBtn = document.createElement('button');
      renameBtn.className = 'text-blue-500 hover:text-blue-700 text-sm flex items-center';
      renameBtn.innerHTML = '<i class="fa fa-edit mr-1"></i> 重命名';
      renameBtn.onclick = () => {
        const newName = prompt('请输入新的题库名称：', item.name || '');
        if (newName && newName.trim() !== '') {
          item.name = newName.trim();
          const all = JSON.parse(localStorage.getItem('questionBank') || '[]');
          const idx = all.findIndex(b => b.id === item.id);
          if (idx !== -1) {
            all[idx].name = item.name;
            localStorage.setItem('questionBank', JSON.stringify(all));
          }
          renderBankList();
        }
      };
      // 删除
      const delBtn = document.createElement('button');
      delBtn.className = 'text-red-500 hover:text-red-700 text-sm flex items-center';
      delBtn.innerHTML = '<i class="fa fa-trash mr-1"></i> 删除';
      delBtn.onclick = () => {
        if (confirm('确定要删除该题库吗？')) {
          const all = JSON.parse(localStorage.getItem('questionBank') || '[]');
          const newAll = all.filter(b => b.id !== item.id);
          localStorage.setItem('questionBank', JSON.stringify(newAll));
          renderBankList();
        }
      };
      // 导出题库数据
      const exportOneBtn = document.createElement('button');
      exportOneBtn.className = 'text-info hover:text-info/80 text-sm flex items-center';
      exportOneBtn.innerHTML = '<i class="fa fa-download mr-1"></i> 导出数据';
      exportOneBtn.onclick = () => {
        const dataStr = JSON.stringify(item, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${item.name || '题库'}_${item.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };
      
      // 导出试卷
      const exportExamBtn = document.createElement('button');
      exportExamBtn.className = 'text-success hover:text-success/80 text-sm flex items-center';
      exportExamBtn.innerHTML = '<i class="fa fa-file-text mr-1"></i> 导出试卷';
      exportExamBtn.onclick = () => {
        showExportExamModal(item);
      };
      ops.appendChild(detailBtn);
      ops.appendChild(renameBtn);
      ops.appendChild(exportOneBtn);
      ops.appendChild(exportExamBtn);
      ops.appendChild(delBtn);
      div.appendChild(info);
      div.appendChild(ops);
      bankList.appendChild(div);
    });
  }

  // 导出全部题库
  exportBtn.onclick = () => {
    const banks = JSON.parse(localStorage.getItem('questionBank') || '[]');
    if (banks.length === 0) {
      alert('题库为空');
      return;
    }
    const dataStr = JSON.stringify(banks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `全部题库_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导入题库
  importBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const importData = JSON.parse(evt.target.result);
          let importBanks = Array.isArray(importData) ? importData : [importData];
          const all = JSON.parse(localStorage.getItem('questionBank') || '[]');
          // 合并，避免重复
          importBanks.forEach(b => {
            if (!all.some(x => x.id === b.id)) {
              all.push(b);
            }
          });
          localStorage.setItem('questionBank', JSON.stringify(all));
          renderBankList();
          alert('导入成功');
        } catch (err) {
          alert('导入失败：' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 新建题库
  addBtn.onclick = () => {
    const name = prompt('请输入新题库名称：');
    if (!name || name.trim() === '') return;
    const all = JSON.parse(localStorage.getItem('questionBank') || '[]');
    const id = Date.now().toString();
    const newBank = {
      id,
      name: name.trim(),
      timestamp: new Date().toISOString(),
      questions: [],
      totalQuestions: 0
    };
    all.push(newBank);
    localStorage.setItem('questionBank', JSON.stringify(all));
    renderBankList();
  };

  renderBankList();
  
  // 显示导出试卷模态框（去掉PDF选项，只保留Word/HTML导出，优化按钮颜色）
  function showExportExamModal(bank) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl" onclick="this.closest('.fixed').remove()">
          <i class="fa fa-times"></i>
        </button>
        <h3 class="text-lg font-bold mb-4">导出试卷</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">试卷名称</label>
          <input type="text" id="examTitle" class="w-full p-2 border border-gray-300 rounded-lg" value="${bank.name || '试卷'}" placeholder="请输入试卷名称">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">导出格式</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input type="radio" name="exportFormat" value="word" checked class="mr-2">
              <span>Word（.doc）格式</span>
            </label>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">包含内容</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input type="checkbox" id="includeAnswer" class="mr-2">
              <span>包含答案</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="includeExplanation" class="mr-2">
              <span>包含解析</span>
            </label>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="exportExam('${bank.id}')" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex-1 font-bold">生成</button>
          <button onclick="this.closest('.fixed').remove()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg flex-1">取消</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // 导出试卷功能（只导出Word/HTML，扩展名为.doc）
  window.exportExam = function(bankId) {
    const banks = JSON.parse(localStorage.getItem('questionBank') || '[]');
    const bank = banks.find(b => b.id === bankId);
    if (!bank) {
      alert('题库不存在');
      return;
    }
    const examTitle = document.getElementById('examTitle').value || bank.name || '试卷';
    const includeAnswer = document.getElementById('includeAnswer').checked;
    const includeExplanation = document.getElementById('includeExplanation').checked;
    // 生成试卷HTML用于Word导出
    const examHTML = generateExamHTML(bank, examTitle, includeAnswer, includeExplanation);
    exportToWord(examHTML, examTitle);
    // 关闭模态框
    document.querySelector('.fixed').remove();
  };
  
  // 生成试卷HTML
  function generateExamHTML(bank, title, includeAnswer, includeExplanation) {
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
      alert('该题库暂无题目');
      return '';
    }
    
    let html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: "Microsoft YaHei", "SimSun", "KaiTi", serif;
            font-size: 14px;
            line-height: 1.8;
            color: #000;
            margin: 0;
            padding: 0;
            background: white;
          }
          .exam-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            min-height: 297mm;
          }
          .exam-header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
          }
          .exam-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
            letter-spacing: 2px;
          }
          .exam-info {
            font-size: 16px;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .exam-info:last-child {
            margin-bottom: 0;
          }
          .student-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            font-size: 16px;
            font-weight: 500;
            padding: 15px;
            border: 2px solid #000;
            background: #f9f9f9;
          }
          .student-info span {
            display: flex;
            align-items: center;
          }
          .student-info span::after {
            content: "_________________";
            margin-left: 10px;
            font-weight: normal;
            color: #666;
          }
          .questions {
            counter-reset: question-counter;
          }
          .question {
            margin-bottom: 25px;
            page-break-inside: avoid;
            border-left: 3px solid #007bff;
            padding-left: 15px;
          }
          .question-header {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 12px;
            color: #000;
            display: flex;
            align-items: flex-start;
          }
          .question-header::before {
            counter-increment: question-counter;
            content: counter(question-counter) ". ";
            margin-right: 8px;
            color: #007bff;
            font-weight: bold;
          }
          .question-type {
            background: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
            font-weight: normal;
          }
          .question-content {
            margin-bottom: 12px;
            font-size: 15px;
            line-height: 1.6;
          }
          .options {
            margin-left: 25px;
            margin-top: 10px;
          }
          .option {
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
          }
          .option::before {
            content: attr(data-option) ". ";
            font-weight: bold;
            margin-right: 8px;
            color: #007bff;
            min-width: 20px;
          }
          .fill-blank {
            border-bottom: 2px solid #000;
            display: inline-block;
            min-width: 100px;
            height: 20px;
            margin: 0 5px;
          }
          .judge-options {
            display: flex;
            gap: 20px;
            margin-left: 25px;
            margin-top: 10px;
          }
          .judge-option {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .judge-option input[type="radio"] {
            width: 16px;
            height: 16px;
          }
          .answer {
            color: #28a745;
            font-weight: bold;
            margin-top: 10px;
            padding: 8px 12px;
            background: #f8f9fa;
            border-left: 4px solid #28a745;
            border-radius: 4px;
          }
          .explanation {
            color: #6c757d;
            font-style: italic;
            margin-top: 8px;
            padding: 8px 12px;
            background: #f8f9fa;
            border-left: 4px solid #6c757d;
            border-radius: 4px;
          }
          .page-footer {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 5px;
          }
          .page-number::after {
            content: counter(page);
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .exam-container {
              padding: 0;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="exam-container">
          <div class="exam-header">
            <div class="exam-title">${title}</div>
            <div class="exam-info">考试时间：120分钟</div>
            <div class="exam-info">总分：${questions.length * 10}分</div>
            <div class="exam-info">注意事项：请认真审题，独立完成，不得抄袭</div>
          </div>
          
          <div class="student-info">
            <span>考生姓名</span>
            <span>学号</span>
            <span>成绩</span>
          </div>
          
          <div class="questions">`;
    
    questions.forEach((question, index) => {
      html += `
        <div class="question">
          <div class="question-header">
            ${question.question}
            <span class="question-type">${question.type}</span>
          </div>
          <div class="question-content">`;
      
      if (question.type === '选择题' && question.options) {
        html += '<div class="options">';
        question.options.forEach((option, optIdx) => {
          // 去除选项内容前的A. B. C. D.等前缀
          const cleanOption = option.replace(/^[A-DＡ-Ｄ][.．、\s]+/, '').trim();
          html += `<div class="option">${String.fromCharCode(65+optIdx)}. ${cleanOption}</div>`;
        });
        html += '</div>';
      } else if (question.type === '填空题') {
        let questionText = question.question || '';
        // 替换题干中的"___"或"（   ）"等为下划线
        let replaced = false;
        questionText = questionText.replace(/(_{3,}|（\s*）|\(\s*\))/g, function(){ replaced=true; return '________'; });
        html += `<div class="options">${questionText}${replaced ? '' : ' ________'}</div>`;
      } else if (question.type === '判断题') {
        html += `<div class="judge-options">
          <div class="judge-option">
            <input type="radio" name="q${index}" value="正确">
            <label>正确</label>
          </div>
          <div class="judge-option">
            <input type="radio" name="q${index}" value="错误">
            <label>错误</label>
          </div>
        </div>`;
      }
      
      html += '</div>';
      
      if (includeAnswer) {
        html += `<div class="answer">答案：${question.answer}</div>`;
      }
      
      if (includeExplanation && question.explanation) {
        html += `<div class="explanation">解析：${question.explanation}</div>`;
      }
      
      html += '</div>';
    });
    
    html += `
          </div>
          <div class="page-footer">
            第 <span class="page-number"></span> 页
          </div>
        </div>
      </body>
      </html>`;
    
    return html;
  }
  
  // 导出为Word（标准A4黑白试卷模板，去掉▲，横线不换行且统一长度）
  function exportToWord(html, title) {
    // 生成标准试卷内容
    const wordHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: A4; margin-top:2.5cm; margin-bottom:2.5cm; margin-left:3cm; margin-right:2cm; }
    body {
      font-family: 'DengXian', 'Microsoft YaHei', 'SimSun', 'Arial', sans-serif;
      font-size: 14pt;
      color: #000;
      background: #fff;
      margin: 0;
    }
    .exam-title {
      text-align: center;
      font-family: 'DengXian', 'Microsoft YaHei', 'SimHei', 'SimSun', serif;
      font-size: 22pt;
      font-weight: bold;
      margin-bottom: 0.2cm;
      margin-top: 0.2cm;
    }
    .exam-subtitle {
      text-align: center;
      font-family: 'DengXian', 'KaiTi', 'SimSun', serif;
      font-size: 16pt;
      margin-bottom: 0.2cm;
    }
    .exam-info {
      text-align: center;
      font-size: 12pt;
      margin-bottom: 0.5cm;
    }
    .student-info {
      font-size: 12pt;
      margin-bottom: 0.8cm;
      text-align: left;
      border-bottom: none;
      padding-bottom: 0.2cm;
    }
    .info-label {
      display: inline-block;
      min-width: 3em;
      margin-right: 0.5em;
    }
    .info-line {
      display: inline-block;
      border-bottom: 1px solid #000;
      width: 7em;
      height: 1.1em;
      vertical-align: middle;
      margin-right: 1.5em;
      white-space: nowrap;
    }
    .block-title {
      font-family: 'DengXian', 'SimHei', 'SimSun', serif;
      font-size: 16pt;
      margin-top: 0.8cm;
      margin-bottom: 0.3cm;
      font-weight: bold;
    }
    .question {
      margin-bottom: 0.5cm;
      font-size: 13pt;
    }
    .question-header {
      font-weight: bold;
      margin-bottom: 0.2cm;
      text-indent: 2em;
    }
    .options {
      margin-left: 2.5em;
      margin-bottom: 0.2cm;
    }
    .option {
      display: block;
      min-width: 7em;
      margin-bottom: 0.2cm;
    }
    .fill-blank {
      border-bottom: 1px solid #000;
      display: inline-block;
      width: 6em;
      height: 1em;
      margin: 0 0.2cm;
      white-space: nowrap;
    }
    .answer-area {
      margin-left: 2.5em;
      margin-top: 0.2cm;
      margin-bottom: 0.2cm;
    }
    .answer-line {
      border-bottom: 1px solid #000;
      display: block;
      width: 100%;
      height: 1.2em;
      margin-bottom: 0.2cm;
      white-space: nowrap;
    }
    .answer, .explanation {
      font-size: 11pt;
      margin-left: 2.5em;
      margin-bottom: 0.2cm;
      color: #444;
    }
  </style>
</head>
<body>
${generateExamContentByTemplate(title)}
</body>
</html>`;
    const blob = new Blob([wordHTML], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('已导出为Word格式（.doc），可用WPS/Word直接打开编辑和打印');
  }

  // 生成标准试卷内容（分题型、题号、选项、横线、答题区、页脚）
  function generateExamContentByTemplate(title) {
    // 获取当前导出的题库数据
    const banks = JSON.parse(localStorage.getItem('questionBank') || '[]');
    const bank = banks.find(b => (b.name === title || b.id === title));
    let examTitle = title;
    let examSubtitle = '';
    let examInfo = '考试时间：120分钟  ▏满分：100分  ▏年级：_________';
    if (bank) {
      examTitle = bank.name || title;
      if (bank.examInfo) examInfo = bank.examInfo;
    }
    // 考生信息栏（直接下划线，纯文本，分隔用全角空格）
    const studentInfo = `姓名：__________　班级：__________　考号：__________`;
    let html = `<div class="exam-title">${examTitle}</div>\n`;
    if (examSubtitle) html += `<div class="exam-subtitle">${examSubtitle}</div>\n`;
    html += `<div class="exam-info">${examInfo}</div>\n`;
    html += `<div class="student-info">${studentInfo}</div>\n`;
    if (!bank || !bank.questions || bank.questions.length === 0) {
      html += '<div style="text-align:center;color:#888;">暂无题目</div>';
      return html;
    }
    // 题型编号（如一、二、三……）
    const typeIndexToChinese = idx => ['一','二','三','四','五','六','七','八','九','十'][idx] || (idx+1);
    bank.questions.forEach((category, catIdx) => {
      // 题型标题（无▲）
      let typeTitle = category.type || '';
      let blockTitle = `${typeIndexToChinese(catIdx)}、${typeTitle}`;
      html += `<div class="block-title">${blockTitle}</div>\n`;
      // 题目列表
      if (category.questions && category.questions.length > 0) {
        category.questions.forEach((question, qIdx) => {
          html += `<div class="question">`;
          // 题号+题干（题干空白用下划线，无空白则题干后加下划线）
          let questionText = question.question || '';
          // 替换题干中的"___"或"（   ）"等为下划线
          let replaced = false;
          questionText = questionText.replace(/(_{3,}|（\s*）|\(\s*\))/g, function(){ replaced=true; return '________'; });
          html += `<div class="question-header">${qIdx+1}. ${questionText}${replaced ? '' : ' ________'}</div>`;
          // 选项（选择题）
          if (category.type === '选择题' && question.options) {
            html += '<div class="options">';
            question.options.forEach((option, optIdx) => {
              // 去除选项内容前的A. B. C. D.等前缀
              const cleanOption = option.replace(/^[A-DＡ-Ｄ][.．、\s]+/, '').trim();
              html += `<div class="option">${String.fromCharCode(65+optIdx)}. ${cleanOption}</div>`;
            });
            html += '</div>';
          }
          // 判断题（A. 正确 B. 错误，纵向排列）
          if (category.type === '判断题') {
            html += '<div class="options">';
            html += '<div class="option">A. 正确</div>';
            html += '<div class="option">B. 错误</div>';
            html += '</div>';
          }
          // 解答题/主观题（答题区横线不换行）
          if (category.type === '解答题' || category.type === '主观题') {
            html += '<div class="answer-area">';
            for(let i=0;i<3;i++) html += '<span class="answer-line"></span>';
            html += '</div>';
          }
          // 答案/解析（可选）
          if (window.includeAnswerExport && question.answer) {
            html += `<div class="answer">答案：${question.answer}</div>`;
          }
          if (window.includeExplanationExport && question.explanation) {
            html += `<div class="explanation">解析：${question.explanation}</div>`;
          }
          html += `</div>`;
        });
      }
    });
    return html;
  }
}); 