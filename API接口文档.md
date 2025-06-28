# QuesBank API 接口文档

## 基础信息

- **基础URL**: `http://localhost:3001/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证接口

### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "邮箱",
  "password": "密码"
}
```

**响应示例**:
```json
{
  "message": "注册成功",
  "user": {
    "id": 1,
    "username": "用户名",
    "email": "邮箱",
    "role": "user"
  }
}
```

### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码"
}
```

**响应示例**:
```json
{
  "message": "登录成功",
  "token": "JWT令牌",
  "user": {
    "id": 1,
    "username": "用户名",
    "role": "user"
  }
}
```

### 获取用户信息
```http
GET /auth/profile
Authorization: Bearer <token>
```

## 题库接口

### 获取题库列表
```http
GET /banks?page=1&limit=20&search=关键词
Authorization: Bearer <token>
```

**查询参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）
- `search`: 搜索关键词

**响应示例**:
```json
{
  "banks": [
    {
      "id": 1,
      "name": "题库名称",
      "description": "描述",
      "category": "分类",
      "is_public": true,
      "question_count": 10
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### 创建题库
```http
POST /banks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "题库名称",
  "description": "描述",
  "category": "分类",
  "is_public": true
}
```

### 更新题库
```http
PUT /banks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新题库名称",
  "description": "新描述",
  "category": "新分类",
  "is_public": false
}
```

### 删除题库
```http
DELETE /banks/:id
Authorization: Bearer <token>
```

## 题目接口

### 获取题目列表
```http
GET /questions?bankId=1&type=choice&difficulty=easy
Authorization: Bearer <token>
```

**查询参数**:
- `bankId`: 题库ID（必需）
- `type`: 题目类型（choice/fill/judge）
- `difficulty`: 难度（easy/medium/hard）

### 添加题目
```http
POST /questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "bank_id": 1,
  "question_type": "choice",
  "question_text": "题目内容",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "answer": "正确答案",
  "explanation": "解析",
  "difficulty": "easy",
  "tags": ["标签1", "标签2"]
}
```

### 批量添加题目
```http
POST /questions/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "bank_id": 1,
  "questions": [
    {
      "question_type": "choice",
      "question_text": "题目1",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "解析1"
    },
    {
      "question_type": "fill",
      "question_text": "题目2",
      "answer": "答案",
      "explanation": "解析2"
    }
  ]
}
```

### 更新题目
```http
PUT /questions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "question_type": "choice",
  "question_text": "更新后的题目",
  "options": ["新选项A", "新选项B", "新选项C", "新选项D"],
  "answer": "新答案",
  "explanation": "新解析",
  "difficulty": "medium",
  "tags": ["新标签"]
}
```

### 删除题目
```http
DELETE /questions/:id
Authorization: Bearer <token>
```

## 考试接口

### 开始考试
```http
POST /exams/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "bank_id": 1,
  "exam_name": "考试名称",
  "question_count": 10,
  "time_limit": 30
}
```

**响应示例**:
```json
{
  "message": "考试开始",
  "exam": {
    "id": 1,
    "bank_id": 1,
    "exam_name": "考试名称",
    "total_questions": 10,
    "time_limit": 30,
    "questions": [
      {"id": 1},
      {"id": 2}
    ]
  }
}
```

### 提交答案
```http
POST /exams/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "exam_id": 1,
  "question_id": 1,
  "answer": "用户答案"
}
```

**响应示例**:
```json
{
  "message": "答案提交成功",
  "is_correct": true,
  "correct_answer": "正确答案"
}
```

### 完成考试
```http
POST /exams/:id/finish
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "message": "考试完成",
  "result": {
    "total_questions": 10,
    "correct_answers": 8,
    "score": "80.00",
    "accuracy": "80.00%"
  }
}
```

### 获取考试记录
```http
GET /exams/records?page=1&limit=20
Authorization: Bearer <token>
```

## 用户管理接口（管理员）

### 获取用户列表
```http
GET /users?page=1&limit=20&search=关键词&role=user
Authorization: Bearer <token>
```

### 获取用户详情
```http
GET /users/:id
Authorization: Bearer <token>
```

### 删除用户
```http
DELETE /users/:id
Authorization: Bearer <token>
```

## 统计接口

### 获取用户统计
```http
GET /stats/user
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "stats": {
    "user": {
      "username": "testuser",
      "role": "user",
      "bank_count": 5,
      "question_count": 100,
      "exam_count": 10
    },
    "exam_stats": {
      "total_exams": 10,
      "avg_score": 85.5,
      "best_score": 95.0,
      "excellent_count": 3,
      "pass_count": 8
    },
    "answer_stats": {
      "total_answers": 200,
      "correct_answers": 160,
      "wrong_answers": 40,
      "accuracy": "80.00%"
    }
  }
}
```

### 获取题库统计
```http
GET /stats/bank/1
Authorization: Bearer <token>
```

### 获取系统统计（管理员）
```http
GET /stats/system
Authorization: Bearer <token>
```

## 错误响应

### 标准错误格式
```json
{
  "error": "错误类型",
  "message": "错误描述"
}
```

### 常见错误码
- `400`: 请求参数错误
- `401`: 未授权（需要登录）
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 错误示例
```json
{
  "error": "权限不足",
  "message": "无法访问此题库"
}
```

## 数据模型

### 用户模型
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "admin|user|guest",
  "created_at": "2025-01-XX",
  "last_login": "2025-01-XX",
  "is_active": true
}
```

### 题库模型
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "category": "string",
  "is_public": true,
  "user_id": 1,
  "created_at": "2025-01-XX",
  "updated_at": "2025-01-XX"
}
```

### 题目模型
```json
{
  "id": 1,
  "bank_id": 1,
  "question_type": "choice|fill|judge",
  "question_text": "string",
  "options": ["string"],
  "answer": "string",
  "explanation": "string",
  "difficulty": "easy|medium|hard",
  "tags": ["string"],
  "created_at": "2025-01-XX",
  "updated_at": "2025-01-XX"
}
```

### 考试记录模型
```json
{
  "id": 1,
  "user_id": 1,
  "bank_id": 1,
  "exam_name": "string",
  "total_questions": 10,
  "correct_answers": 8,
  "score": 80.0,
  "time_limit": 30,
  "time_used": 25,
  "status": "in_progress|completed",
  "started_at": "2025-01-XX",
  "completed_at": "2025-01-XX"
}
```

## 使用示例

### JavaScript 示例
```javascript
// 用户登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// 获取题库列表
const banksResponse = await fetch('/api/banks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { banks } = await banksResponse.json();
```

### cURL 示例
```bash
# 用户登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 创建题库
curl -X POST http://localhost:3001/api/banks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"测试题库","description":"描述","category":"计算机","is_public":true}'
```

## 注意事项

1. **认证**: 除注册和登录接口外，所有接口都需要在请求头中携带JWT令牌
2. **权限**: 管理员接口需要管理员权限
3. **数据验证**: 所有输入数据都会进行验证
4. **错误处理**: 请妥善处理API返回的错误信息
5. **速率限制**: API有速率限制，请合理控制请求频率

---

更多详细信息请参考项目文档和代码注释。 