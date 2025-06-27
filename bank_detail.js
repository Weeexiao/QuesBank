document.addEventListener('DOMContentLoaded', () => {
  const bankTitle = document.getElementById('bankTitle');
  const bankInfo = document.getElementById('bankInfo');
  const questionList = document.getElementById('questionList');
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const closeModal = document.getElementById('closeModal');

  let currentBank = null;
  let editingQuestionIndex = -1;

  // 获取题库ID并加载题库
  function loadBank() {
    const urlParams = new URLSearchParams(window.location.search);
    const bankId = urlParams.get('id');
    if (!bankId) {
      alert('题库ID不存在');
      window.location.href = 'bank.html';
      return;
    }
    const banks = JSON.parse(localStorage.getItem('questionBank') || '[]');
    currentBank = banks.find(b => b.id === bankId);
    if (!currentBank) {
      alert('题库不存在');
      window.location.href = 'bank.html';
      return;
    }
    // 确保题库有正确的结构
    if (!currentBank.questions) {
      currentBank.questions = [];
    }
    renderBankInfo();
    renderQuestionList();
  }

  // 渲染题库信息
  function renderBankInfo() {
    bankTitle.textContent = currentBank.name || `题库 #${currentBank.id.substring(8)}`;
    const totalQuestions = currentBank.questions.reduce((sum, cat) => sum + cat.questions.length, 0);
    bankInfo.textContent = `共 ${totalQuestions} 题`;
  }

  // 渲染题目列表
  function renderQuestionList() {
    questionList.innerHTML = '';
    if (!currentBank.questions || currentBank.questions.length === 0) {
      questionList.innerHTML = '<div class="text-gray-400 text-center py-4">暂无题目</div>';
      return;
    }
    let questionIndex = 0;
    currentBank.questions.forEach((category, catIndex) => {
      category.questions.forEach((question, qIndex) => {
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200';
        // 题目头部
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-2';
        const typeBadge = document.createElement('span');
        typeBadge.className = 'px-2 py-1 text-xs font-medium rounded-full';
        if (category.type === '选择题') {
          typeBadge.className += ' bg-blue-100 text-blue-800';
        } else if (category.type === '填空题') {
          typeBadge.className += ' bg-green-100 text-green-800';
        } else if (category.type === '判断题') {
          typeBadge.className += ' bg-yellow-100 text-yellow-800';
        }
        typeBadge.textContent = category.type;
        const ops = document.createElement('div');
        ops.className = 'flex gap-2';
        // 编辑按钮
        const editBtn = document.createElement('button');
        editBtn.className = 'text-blue-500 hover:text-blue-700 text-sm flex items-center';
        editBtn.innerHTML = '<i class="fa fa-edit mr-1"></i> 编辑';
        editBtn.onclick = () => editQuestion(catIndex, qIndex, questionIndex);
        // 删除按钮
        const delBtn = document.createElement('button');
        delBtn.className = 'text-red-500 hover:text-red-700 text-sm flex items-center';
        delBtn.innerHTML = '<i class="fa fa-trash mr-1"></i> 删除';
        delBtn.onclick = () => deleteQuestion(catIndex, qIndex, questionIndex);
        ops.appendChild(editBtn);
        ops.appendChild(delBtn);
        header.appendChild(typeBadge);
        header.appendChild(ops);
        // 题目内容
        const content = document.createElement('div');
        content.className = 'mb-2';
        const questionText = document.createElement('p');
        questionText.className = 'text-gray-800 mb-2';
        questionText.textContent = question.question;
        content.appendChild(questionText);
        // 选项（选择题）
        if (category.type === '选择题' && question.options) {
          question.options.forEach(option => {
            const optionText = document.createElement('p');
            optionText.className = 'text-gray-600 text-sm ml-4';
            optionText.textContent = option;
            content.appendChild(optionText);
          });
        }
        // 答案
        const answer = document.createElement('p');
        answer.className = 'text-green-700 text-sm font-medium';
        answer.innerHTML = `<i class="fa fa-check mr-1"></i> 答案：${question.answer}`;
        content.appendChild(answer);
        // 解析
        if (question.explanation) {
          const explanation = document.createElement('p');
          explanation.className = 'text-gray-600 text-sm mt-1';
          explanation.innerHTML = `<i class="fa fa-info-circle mr-1"></i> 解析：${question.explanation}`;
          content.appendChild(explanation);
        }
        div.appendChild(header);
        div.appendChild(content);
        questionList.appendChild(div);
        questionIndex++;
      });
    });
  }

  // 新增题目
  addQuestionBtn.onclick = () => {
    editingQuestionIndex = -1;
    showQuestionModal();
  };

  // 编辑题目
  function editQuestion(catIndex, qIndex, questionIndex) {
    editingQuestionIndex = questionIndex;
    showQuestionModal(currentBank.questions[catIndex].questions[qIndex], currentBank.questions[catIndex].type);
  }

  // 删除题目
  function deleteQuestion(catIndex, qIndex, questionIndex) {
    if (confirm('确定要删除这道题目吗？')) {
      currentBank.questions[catIndex].questions.splice(qIndex, 1);
      if (currentBank.questions[catIndex].questions.length === 0) {
        currentBank.questions.splice(catIndex, 1);
      }
      saveBank();
      renderBankInfo();
      renderQuestionList();
    }
  }

  // 显示题目模态框
  function showQuestionModal(question = null, questionType = '选择题') {
    const isEdit = question !== null;
    const title = isEdit ? '编辑题目' : '新增题目';
    modalBody.innerHTML = `
      <h3 class="text-lg font-bold mb-4">${title}</h3>
      <form id="questionForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">题型</label>
          <select id="questionType" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary">
            <option value="选择题" ${questionType === '选择题' ? 'selected' : ''}>选择题</option>
            <option value="填空题" ${questionType === '填空题' ? 'selected' : ''}>填空题</option>
            <option value="判断题" ${questionType === '判断题' ? 'selected' : ''}>判断题</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">题目</label>
          <textarea id="questionText" class="w-full h-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="请输入题目内容...">${question ? question.question : ''}</textarea>
        </div>
        <div id="optionsContainer" class="mb-4 ${questionType === '选择题' ? '' : 'hidden'}">
          <label class="block text-sm font-medium text-gray-700 mb-2">选项</label>
          <div id="optionsList">
            ${question && question.options ? question.options.map((opt, i) => `
              <div class="flex gap-2 mb-2">
                <input type="text" class="flex-1 p-2 border border-gray-300 rounded-lg" value="${opt}" placeholder="选项 ${String.fromCharCode(65 + i)}">
                <button type="button" class="px-2 py-1 bg-red-500 text-white rounded" onclick="this.parentElement.remove()">删除</button>
              </div>
            `).join('') : `
              <div class="flex gap-2 mb-2">
                <input type="text" class="flex-1 p-2 border border-gray-300 rounded-lg" placeholder="选项 A">
                <button type="button" class="px-2 py-1 bg-red-500 text-white rounded" onclick="this.parentElement.remove()">删除</button>
              </div>
              <div class="flex gap-2 mb-2">
                <input type="text" class="flex-1 p-2 border border-gray-300 rounded-lg" placeholder="选项 B">
                <button type="button" class="px-2 py-1 bg-red-500 text-white rounded" onclick="this.parentElement.remove()">删除</button>
              </div>
            `}
          </div>
          <button type="button" class="text-primary text-sm" onclick="addOption()">+ 添加选项</button>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">答案</label>
          <input type="text" id="questionAnswer" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="请输入答案..." value="${question ? question.answer : ''}">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">解析</label>
          <textarea id="questionExplanation" class="w-full h-16 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="请输入解析...">${question ? question.explanation : ''}</textarea>
        </div>
        <div class="flex gap-2">
          <button type="submit" class="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg flex-1">保存</button>
          <button type="button" onclick="closeQuestionModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg flex-1">取消</button>
        </div>
      </form>
    `;
    modal.classList.remove('hidden');
    // 绑定事件
    document.getElementById('questionType').addEventListener('change', toggleOptions);
    document.getElementById('questionForm').addEventListener('submit', saveQuestion);
  }

  // 添加选项
  window.addOption = function() {
    const optionsList = document.getElementById('optionsList');
    const div = document.createElement('div');
    div.className = 'flex gap-2 mb-2';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'flex-1 p-2 border border-gray-300 rounded-lg';
    input.placeholder = `选项 ${String.fromCharCode(65 + optionsList.children.length)}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'px-2 py-1 bg-red-500 text-white rounded';
    btn.textContent = '删除';
    btn.onclick = () => div.remove();
    div.appendChild(input);
    div.appendChild(btn);
    optionsList.appendChild(div);
  };

  // 切换选项显示
  function toggleOptions() {
    const type = document.getElementById('questionType').value;
    const container = document.getElementById('optionsContainer');
    container.classList.toggle('hidden', type !== '选择题');
  }

  // 保存题目
  function saveQuestion(e) {
    e.preventDefault();
    const type = document.getElementById('questionType').value;
    const question = document.getElementById('questionText').value.trim();
    const answer = document.getElementById('questionAnswer').value.trim();
    const explanation = document.getElementById('questionExplanation').value.trim();
    
    if (!question || !answer) {
      alert('请填写题目和答案');
      return;
    }
    
    const questionData = { question, answer, explanation };
    
    if (type === '选择题') {
      const options = Array.from(document.getElementById('optionsList').children).map(div => div.querySelector('input').value.trim()).filter(opt => opt);
      if (options.length < 2) {
        alert('选择题至少需要2个选项');
        return;
      }
      questionData.options = options;
    }
    
    // 保存到题库
    if (editingQuestionIndex === -1) {
      // 新增
      let category = currentBank.questions.find(cat => cat.type === type);
      if (!category) {
        category = { type, questions: [] };
        currentBank.questions.push(category);
      }
      category.questions.push(questionData);
    } else {
      // 编辑
      let questionIndex = 0;
      for (let catIndex = 0; catIndex < currentBank.questions.length; catIndex++) {
        const category = currentBank.questions[catIndex];
        for (let qIndex = 0; qIndex < category.questions.length; qIndex++) {
          if (questionIndex === editingQuestionIndex) {
            // 如果题型改变，需要移动到对应分类
            if (category.type !== type) {
              category.questions.splice(qIndex, 1);
              if (category.questions.length === 0) {
                currentBank.questions.splice(catIndex, 1);
              }
              let newCategory = currentBank.questions.find(cat => cat.type === type);
              if (!newCategory) {
                newCategory = { type, questions: [] };
                currentBank.questions.push(newCategory);
              }
              newCategory.questions.push(questionData);
            } else {
              category.questions[qIndex] = questionData;
            }
            break;
          }
          questionIndex++;
        }
        if (questionIndex === editingQuestionIndex) break;
      }
    }
    
    saveBank();
    renderBankInfo();
    renderQuestionList();
    closeQuestionModal();
  }

  // 关闭模态框
  window.closeQuestionModal = function() {
    modal.classList.add('hidden');
  };

  // 保存题库
  function saveBank() {
    const banks = JSON.parse(localStorage.getItem('questionBank') || '[]');
    const index = banks.findIndex(b => b.id === currentBank.id);
    if (index !== -1) {
      banks[index] = currentBank;
      localStorage.setItem('questionBank', JSON.stringify(banks));
    }
  }

  // 关闭模态框事件
  closeModal.onclick = closeQuestionModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeQuestionModal();
  };

  // 初始化
  loadBank();
}); 