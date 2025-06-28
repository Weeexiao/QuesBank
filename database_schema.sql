-- QuesBank 智能题库数据库设计
-- 数据库：MySQL 8.0+

-- 创建数据库
CREATE DATABASE IF NOT EXISTS quesbank_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quesbank_db;

-- 用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    role ENUM('admin', 'user', 'guest') DEFAULT 'user' COMMENT '用户角色',
    api_key VARCHAR(255) COMMENT 'API密钥',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login TIMESTAMP NULL COMMENT '最后登录时间',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) COMMENT '用户表';

-- 题库表
CREATE TABLE question_banks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '所属用户ID',
    name VARCHAR(100) NOT NULL COMMENT '题库名称',
    description TEXT COMMENT '题库描述',
    category VARCHAR(50) COMMENT '题库分类',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public)
) COMMENT '题库表';

-- 题目表
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bank_id INT NOT NULL COMMENT '所属题库ID',
    question_type ENUM('choice', 'fill', 'judge') NOT NULL COMMENT '题目类型：选择题、填空题、判断题',
    question_text TEXT NOT NULL COMMENT '题目内容',
    options JSON COMMENT '选项（选择题）',
    answer VARCHAR(500) NOT NULL COMMENT '答案',
    explanation TEXT COMMENT '解析',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium' COMMENT '难度',
    tags JSON COMMENT '标签',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE,
    INDEX idx_bank_id (bank_id),
    INDEX idx_question_type (question_type),
    INDEX idx_difficulty (difficulty)
) COMMENT '题目表';

-- 用户答题记录表
CREATE TABLE user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    question_id INT NOT NULL COMMENT '题目ID',
    user_answer TEXT COMMENT '用户答案',
    is_correct BOOLEAN COMMENT '是否正确',
    time_spent INT COMMENT '答题用时（秒）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '答题时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_question_id (question_id),
    INDEX idx_created_at (created_at)
) COMMENT '用户答题记录表';

-- 考试记录表
CREATE TABLE exam_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    bank_id INT NOT NULL COMMENT '题库ID',
    exam_name VARCHAR(100) COMMENT '考试名称',
    total_questions INT NOT NULL COMMENT '总题数',
    correct_answers INT NOT NULL COMMENT '正确题数',
    score DECIMAL(5,2) COMMENT '得分',
    time_limit INT COMMENT '时间限制（分钟）',
    time_used INT COMMENT '实际用时（分钟）',
    status ENUM('in_progress', 'completed', 'timeout') DEFAULT 'in_progress' COMMENT '考试状态',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_bank_id (bank_id),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
) COMMENT '考试记录表';

-- 用户设置表
CREATE TABLE user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE COMMENT '用户ID',
    theme VARCHAR(20) DEFAULT 'light' COMMENT '主题',
    language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言',
    auto_save BOOLEAN DEFAULT TRUE COMMENT '自动保存',
    show_explanation BOOLEAN DEFAULT TRUE COMMENT '显示解析',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '用户设置表';

-- 系统配置表
CREATE TABLE system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(200) COMMENT '配置描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '系统配置表';

-- 插入默认管理员账号
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@quesbank.com', 'admin');

-- 插入系统配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('default_question_count', '10', '默认题目数量'),
('max_question_count', '100', '最大题目数量'),
('default_time_limit', '30', '默认考试时间限制（分钟）'),
('max_time_limit', '180', '最大考试时间限制（分钟）'),
('allow_guest_mode', 'true', '是否允许游客模式'),
('require_email_verification', 'false', '是否需要邮箱验证');

-- 创建视图：用户统计信息
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.username,
    u.role,
    COUNT(DISTINCT qb.id) as bank_count,
    COUNT(DISTINCT q.id) as question_count,
    COUNT(DISTINCT er.id) as exam_count,
    AVG(er.score) as avg_score,
    MAX(er.completed_at) as last_exam_date
FROM users u
LEFT JOIN question_banks qb ON u.id = qb.user_id
LEFT JOIN questions q ON qb.id = q.bank_id
LEFT JOIN exam_records er ON u.id = er.user_id AND er.status = 'completed'
GROUP BY u.id, u.username, u.role;

-- 创建视图：题库统计信息
CREATE VIEW bank_statistics AS
SELECT 
    qb.id,
    qb.name,
    qb.user_id,
    u.username as owner_name,
    COUNT(q.id) as question_count,
    COUNT(CASE WHEN q.question_type = 'choice' THEN 1 END) as choice_count,
    COUNT(CASE WHEN q.question_type = 'fill' THEN 1 END) as fill_count,
    COUNT(CASE WHEN q.question_type = 'judge' THEN 1 END) as judge_count,
    qb.created_at,
    qb.updated_at
FROM question_banks qb
LEFT JOIN users u ON qb.user_id = u.id
LEFT JOIN questions q ON qb.id = q.bank_id
GROUP BY qb.id, qb.name, qb.user_id, u.username, qb.created_at, qb.updated_at; 