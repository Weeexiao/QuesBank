// exam.js
// 考试模式核心逻辑

document.addEventListener('DOMContentLoaded', () => {
  // 1. 渲染本地题库多选列表
  const bankList = document.getElementById('bankList');
  const examCountInput = document.getElementById('examCount');
  const examTimeInput = document.getElementById('examTime');
  const examBtnBarContainer = document.getElementById('examBtnBarContainer');
  const startExamBarBtn = document.getElementById('startExam');
  const examArea = document.getElementById('examArea');
  const examResult = document.getElementById('examResult');
  const examActionBtn = document.getElementById('examActionBtn');

  let allBanks = [];
  let selectedBankIds = [];
  let examQuestions = [];
  let userAnswers = {};
  let examStarted = false;
  let examTimer = null;
  let timeLeft = 0;
  let barProgress = null;
  let barSubmitBtn = null;
  let isExamStarted = false;

  // 读取本地题库
  function loadBanks() {
    const bankData = JSON.parse(localStorage.getItem('questionBank') || '[]');
    allBanks = bankData;
    renderBankList();
  }

  // 渲染题库多选列表
  function renderBankList() {
    bankList.innerHTML = '';
    if (allBanks.length === 0) {
      bankList.innerHTML = '<span class="text-gray-400">暂无本地题库</span>';
      return;
    }
    allBanks.forEach(bank => {
      const label = document.createElement('label');
      label.className = 'flex items-center gap-2 border border-gray-200 rounded px-3 py-1 cursor-pointer';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = bank.id;
      checkbox.className = 'form-checkbox text-primary';
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          selectedBankIds.push(bank.id);
        } else {
          selectedBankIds = selectedBankIds.filter(id => id !== bank.id);
        }
      });
      label.appendChild(checkbox);
      // 修复：正确显示题库名称，优先显示自定义名称
      const displayName = bank.name || `题库 #${bank.id.substring(8)}`;
      const questionCount = bank.totalQuestions || 0;
      label.appendChild(document.createTextNode(`${displayName}（${questionCount}题）`));
      bankList.appendChild(label);
    });
  }

  // 随机抽题
  function getRandomQuestions(banks, count) {
    let allQuestions = [];
    banks.forEach(bank => {
      bank.questions.forEach(cat => {
        cat.questions.forEach(q => {
          allQuestions.push({ ...q, type: cat.type });
        });
      });
    });
    // 打乱顺序
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    return allQuestions.slice(0, count);
  }

  // 动画展开按钮
  function expandExamBarBtn() {
    startExamBarBtn.classList.add('expanded');
    // 渐隐三角
    const icon = startExamBarBtn.querySelector('i');
    if (icon) {
      icon.style.transition = 'opacity 0.5s';
      icon.style.opacity = '0';
    }
    // 进度条（长条背景填充）
    barProgress = document.createElement('div');
    barProgress.className = 'exam-bar-progress';
    barProgress.style.width = '100%';
    examBtnBarContainer.insertBefore(barProgress, startExamBarBtn);
    // 提交按钮
    barSubmitBtn = document.createElement('button');
    barSubmitBtn.className = 'exam-bar-submit-btn';
    barSubmitBtn.innerHTML = '<i class="fa fa-check"></i>';
    barSubmitBtn.onclick = submitExam;
    setTimeout(() => {
      barSubmitBtn.classList.add('visible');
    }, 500);
    examBtnBarContainer.appendChild(barSubmitBtn);
  }
  function resetExamBarBtn() {
    startExamBarBtn.classList.remove('expanded');
    // 渐显三角
    const icon = startExamBarBtn.querySelector('i');
    if (icon) {
      icon.style.transition = 'opacity 0.5s';
      icon.style.opacity = '1';
    }
    if (barProgress) barProgress.remove();
    if (barSubmitBtn) barSubmitBtn.remove();
  }

  // 按钮点击逻辑
  examActionBtn.addEventListener('click', () => {
    if (!isExamStarted) {
      // 检查题库和参数
      if (selectedBankIds.length === 0) {
        alert('请至少选择一个题库！');
        return;
      }
      const count = parseInt(examCountInput.value) || 1;
      const time = parseInt(examTimeInput.value) || 1;
      const selectedBanks = allBanks.filter(b => selectedBankIds.includes(b.id));
      const totalQuestions = selectedBanks.reduce((sum, b) => sum + (b.totalQuestions || 0), 0);
      if (count > totalQuestions) {
        alert('题数超过所选题库总题数！');
        return;
      }
      examQuestions = getRandomQuestions(selectedBanks, count);
      userAnswers = {};
      examStarted = true;
      isExamStarted = true;
      timeLeft = time * 60;
      renderExamCards();
      examResult.classList.add('hidden');
      examActionBtn.classList.add('flipped');
      startTimer();
    } else {
      // 提交试卷
      submitExam();
    }
  });

  // 渲染考试题卡
  function renderExamCards() {
    examArea.innerHTML = '';
    if (examQuestions.length === 0) return;
    examQuestions.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow-card card-transition card-hover shadow-card-hover p-6 relative overflow-visible';
      // 题型徽章
      const typeBadge = document.createElement('div');
      typeBadge.className = 'exam-type-badge';
      typeBadge.setAttribute('data-type', q.type);
      typeBadge.textContent = q.type;
      card.appendChild(typeBadge);
      // 题号
      const header = document.createElement('div');
      header.className = 'mb-2 text-lg font-bold text-primary';
      header.textContent = `第${idx + 1}题`;
      card.appendChild(header);
      // 题干
      const qText = document.createElement('div');
      qText.className = 'mb-3 text-gray-800';
      qText.innerHTML = q.question;
      card.appendChild(qText);
      // 答案输入
      const answerDiv = document.createElement('div');
      if (q.type === '选择题') {
        q.options.forEach((opt, i) => {
          const optId = `q${idx}_opt${i}`;
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = `q${idx}`;
          radio.id = optId;
          radio.value = opt;
          radio.className = 'mr-2';
          radio.addEventListener('change', () => {
            userAnswers[idx] = opt;
          });
          const label = document.createElement('label');
          label.htmlFor = optId;
          label.textContent = opt;
          label.className = 'mr-4';
          answerDiv.appendChild(radio);
          answerDiv.appendChild(label);
        });
      } else if (q.type === '填空题') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'w-full p-2 border border-gray-300 rounded-lg';
        input.placeholder = '请输入答案...';
        input.addEventListener('input', () => {
          userAnswers[idx] = input.value.trim();
        });
        answerDiv.appendChild(input);
      } else if (q.type === '判断题') {
        ['正确', '错误'].forEach(opt => {
          const optId = `q${idx}_opt${opt}`;
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = `q${idx}`;
          radio.id = optId;
          radio.value = opt;
          radio.className = 'mr-2';
          radio.addEventListener('change', () => {
            userAnswers[idx] = opt;
          });
          const label = document.createElement('label');
          label.htmlFor = optId;
          label.textContent = opt;
          label.className = 'mr-4';
          answerDiv.appendChild(radio);
          answerDiv.appendChild(label);
        });
      }
      card.appendChild(answerDiv);
      examArea.appendChild(card);
    });
    // 倒计时
    const timerDiv = document.createElement('div');
    timerDiv.id = 'timerDiv';
    timerDiv.className = 'mt-4 text-right text-lg text-danger font-bold';
    timerDiv.textContent = formatTime(timeLeft);
    examArea.appendChild(timerDiv);
  }

  // 进度条动画
  function updateBarProgress() {
    if (!barProgress) return;
    const total = parseInt(examTimeInput.value) * 60;
    const percent = Math.max(0, timeLeft / total);
    barProgress.style.width = (percent * 100) + '%';
  }

  // 修改倒计时逻辑
  function startTimer() {
    updateTimer();
    updateBarProgress();
    examTimer = setInterval(() => {
      timeLeft--;
      updateTimer();
      updateBarProgress();
      if (timeLeft <= 0) {
        clearInterval(examTimer);
        alert('考试时间到，自动提交！');
        submitExam();
      }
    }, 1000);
  }
  function updateTimer() {
    const timerDiv = document.getElementById('timerDiv');
    if (timerDiv) timerDiv.textContent = formatTime(timeLeft);
  }
  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `剩余时间：${m}:${s}`;
  }

  // 覆盖提交试卷逻辑，按钮翻转回去
  function submitExam() {
    if (!examStarted) return;
    clearInterval(examTimer);
    examStarted = false;
    isExamStarted = false;
    examActionBtn.classList.remove('flipped');
    // 评分
    let correct = 0;
    let wrongList = [];
    examQuestions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      if (userAns === q.answer) {
        correct++;
      } else {
        wrongList.push({
          idx: idx + 1,
          question: q.question,
          userAns: userAns || '未作答',
          rightAns: q.answer,
          explanation: q.explanation
        });
      }
    });
    const total = examQuestions.length;
    const score = Math.round((correct / total) * 100);
    // 展示结果
    let html = `<div class="text-center mb-4">
      <h3 class="text-2xl font-bold text-gray-800 mb-2">考试完成！</h3>
      <p class="text-lg text-primary font-bold">得分：${score} 分</p>
      <p class="text-gray-600">正确率：${correct} / ${total}</p>
    </div>`;
    if (wrongList.length > 0) {
      html += `<div class="mt-6 grid gap-6 md:grid-cols-2">
        <h4 class="text-lg font-bold text-danger mb-2 md:col-span-2 flex items-center"><i class="fa fa-exclamation-circle mr-2"></i>错题解析</h4>`;
      wrongList.forEach(w => {
        html += `<div class="transition-transform duration-300 hover:scale-[1.025] hover:shadow-2xl bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg p-6 group relative overflow-hidden">
          <div class="flex items-center gap-3 mb-2">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-400 to-pink-400 text-white shadow">第${w.idx}题</span>
            <span class="text-sm text-gray-500">你的答案：</span>
            <span class="font-bold text-danger">${w.userAns}</span>
          </div>
          <div class="mb-2 text-base font-semibold text-gray-800">${w.question}</div>
          <div class="flex items-center gap-2 mb-1">
            <i class="fa fa-check-circle text-green-500"></i>
            <span class="text-green-700 font-bold">正确答案：</span>
            <span class="text-green-700">${w.rightAns}</span>
          </div>
          <button class="mt-2 px-3 py-1 bg-gray-100 hover:bg-primary/10 text-primary rounded-lg text-sm transition-colors duration-200 flex items-center explanation-toggle">
            <i class="fa fa-lightbulb-o mr-1"></i> 查看解析
          </button>
          <div class="explanation-content mt-3 p-3 bg-gray-50 rounded-lg text-gray-600 text-sm hidden">
            <i class="fa fa-info-circle text-primary mr-1"></i> ${w.explanation}
          </div>
        </div>`;
      });
      html += `</div>`;
    } else {
      html += `<div class="mt-6 text-success text-center font-bold text-xl flex flex-col items-center gap-2">
        <i class="fa fa-trophy text-4xl text-yellow-400 animate-bounce"></i>
        全部答对，太棒了！
      </div>`;
    }
    examResult.innerHTML = html;
    examResult.classList.remove('hidden');
    examArea.innerHTML = '';
    // 解析折叠动画
    examResult.querySelectorAll('.explanation-toggle').forEach(btn => {
      btn.addEventListener('click', function() {
        const content = this.parentElement.querySelector('.explanation-content');
        if (content) {
          content.classList.toggle('hidden');
          if (!content.classList.contains('hidden')) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.transition = 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)';
          } else {
            content.style.maxHeight = '0';
          }
        }
        this.innerHTML = content.classList.contains('hidden')
          ? '<i class="fa fa-lightbulb-o mr-1"></i> 查看解析'
          : '<i class="fa fa-eye-slash mr-1"></i> 隐藏解析';
      });
    });
  }

  // 初始化
  loadBanks();
}); 