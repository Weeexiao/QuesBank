// QuesBank API 服务
class QuesBankAPI {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/v1';
    this.token = localStorage.getItem('authToken');
  }

  // 设置认证token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // 获取认证头
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getAuthHeaders(),
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || '请求失败');
      }

      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // ==================== 用户认证 ====================
  
  // 用户注册
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // 用户登录
  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  // 游客登录
  async guestLogin() {
    const data = await this.request('/auth/guest', {
      method: 'POST'
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  // 获取当前用户信息
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // 修改密码
  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  // 退出登录
  logout() {
    this.setToken(null);
    localStorage.removeItem('currentUser');
  }

  // ==================== 题库管理 ====================
  
  // 获取用户题库列表
  async getUserBanks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/banks?${queryString}`);
  }

  // 获取公开题库列表
  async getPublicBanks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/banks/public?${queryString}`);
  }

  // 创建题库
  async createBank(bankData) {
    return this.request('/banks', {
      method: 'POST',
      body: JSON.stringify(bankData)
    });
  }

  // 获取题库详情
  async getBank(bankId) {
    return this.request(`/banks/${bankId}`);
  }

  // 更新题库
  async updateBank(bankId, bankData) {
    return this.request(`/banks/${bankId}`, {
      method: 'PUT',
      body: JSON.stringify(bankData)
    });
  }

  // 删除题库
  async deleteBank(bankId) {
    return this.request(`/banks/${bankId}`, {
      method: 'DELETE'
    });
  }

  // 复制题库
  async copyBank(bankId, newName) {
    return this.request(`/banks/${bankId}/copy`, {
      method: 'POST',
      body: JSON.stringify({ name: newName })
    });
  }

  // 导出题库
  async exportBank(bankId) {
    return this.request(`/banks/${bankId}/export`);
  }

  // ==================== 题目管理 ====================
  
  // 获取题库中的题目
  async getQuestions(bankId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/questions?bankId=${bankId}&${queryString}`);
  }

  // 添加题目
  async addQuestion(bankId, questionData) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify({
        bank_id: bankId,
        ...questionData
      })
    });
  }

  // 批量添加题目
  async addQuestions(bankId, questions) {
    return this.request('/questions/batch', {
      method: 'POST',
      body: JSON.stringify({
        bank_id: bankId,
        questions
      })
    });
  }

  // 更新题目
  async updateQuestion(questionId, questionData) {
    return this.request(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    });
  }

  // 删除题目
  async deleteQuestion(questionId) {
    return this.request(`/questions/${questionId}`, {
      method: 'DELETE'
    });
  }

  // ==================== 考试管理 ====================
  
  // 开始考试
  async startExam(examData) {
    return this.request('/exams/start', {
      method: 'POST',
      body: JSON.stringify(examData)
    });
  }

  // 提交答案
  async submitAnswer(examId, questionId, answer) {
    return this.request('/exams/answer', {
      method: 'POST',
      body: JSON.stringify({
        exam_id: examId,
        question_id: questionId,
        answer
      })
    });
  }

  // 完成考试
  async finishExam(examId) {
    return this.request(`/exams/${examId}/finish`, {
      method: 'POST'
    });
  }

  // 获取考试记录
  async getExamRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/exams/records?${queryString}`);
  }

  // ==================== 统计信息 ====================
  
  // 获取用户统计
  async getUserStats() {
    return this.request('/stats/user');
  }

  // 获取题库统计
  async getBankStats(bankId) {
    return this.request(`/stats/bank/${bankId}`);
  }

  // ==================== 数据同步 ====================
  
  // 从localStorage同步到数据库
  async syncFromLocal() {
    try {
      const localBanks = JSON.parse(localStorage.getItem('questionBank') || '[]');
      
      for (const bank of localBanks) {
        // 创建题库
        const bankResult = await this.createBank({
          name: bank.name || `题库_${Date.now()}`,
          description: bank.description || '',
          category: bank.category || '默认分类'
        });
        
        const newBankId = bankResult.bank.id;
        
        // 添加题目
        if (bank.questions && Array.isArray(bank.questions)) {
          for (const category of bank.questions) {
            if (category.questions && Array.isArray(category.questions)) {
              for (const question of category.questions) {
                await this.addQuestion(newBankId, {
                  question_type: this.getQuestionType(category.name),
                  question_text: question.question,
                  options: question.options ? JSON.stringify(question.options) : null,
                  answer: question.answer,
                  explanation: question.explanation || ''
                });
              }
            }
          }
        }
      }
      
      // 同步成功后清除本地数据
      localStorage.removeItem('questionBank');
      
      return { success: true, message: '数据同步成功' };
    } catch (error) {
      console.error('数据同步失败:', error);
      throw error;
    }
  }

  // 从数据库同步到localStorage（兼容模式）
  async syncToLocal() {
    try {
      const banksData = await this.getUserBanks();
      const localBanks = [];
      
      for (const bank of banksData.banks) {
        const questions = await this.getQuestions(bank.id);
        const groupedQuestions = this.groupQuestionsByType(questions.questions);
        
        localBanks.push({
          id: bank.id,
          name: bank.name,
          description: bank.description,
          category: bank.category,
          questions: groupedQuestions
        });
      }
      
      localStorage.setItem('questionBank', JSON.stringify(localBanks));
      return { success: true, message: '数据同步到本地成功' };
    } catch (error) {
      console.error('同步到本地失败:', error);
      throw error;
    }
  }

  // 辅助方法：获取题目类型
  getQuestionType(categoryName) {
    const typeMap = {
      '选择题': 'choice',
      '填空题': 'fill',
      '判断题': 'judge'
    };
    return typeMap[categoryName] || 'choice';
  }

  // 辅助方法：按类型分组题目
  groupQuestionsByType(questions) {
    const grouped = {};
    
    questions.forEach(q => {
      const type = q.question_type;
      const categoryName = this.getCategoryName(type);
      
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      
      grouped[categoryName].push({
        question: q.question_text,
        options: q.options ? JSON.parse(q.options) : null,
        answer: q.answer,
        explanation: q.explanation
      });
    });
    
    return Object.keys(grouped).map(name => ({
      name,
      questions: grouped[name]
    }));
  }

  // 辅助方法：获取分类名称
  getCategoryName(type) {
    const nameMap = {
      'choice': '选择题',
      'fill': '填空题',
      'judge': '判断题'
    };
    return nameMap[type] || '选择题';
  }

  // ==================== 错误处理 ====================
  
  // 检查网络连接
  async checkConnection() {
    try {
      await this.request('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // 处理API错误
  handleError(error) {
    if (error.message.includes('401') || error.message.includes('未授权')) {
      this.logout();
      window.location.href = 'login.html';
      return '登录已过期，请重新登录';
    }
    
    if (error.message.includes('403') || error.message.includes('权限不足')) {
      return '权限不足，无法执行此操作';
    }
    
    if (error.message.includes('404')) {
      return '请求的资源不存在';
    }
    
    return error.message || '操作失败，请稍后重试';
  }
}

// 创建全局API实例
const api = new QuesBankAPI();

// 导出API实例
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else {
  window.QuesBankAPI = api;
} 