#!/bin/bash

# QuesBank 宝塔面板快速部署脚本
# 适用于已安装宝塔面板的服务器

echo "========================================"
echo "    QuesBank 宝塔面板快速部署"
echo "========================================"
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}错误: 请使用root用户运行此脚本${NC}"
    exit 1
fi

# 获取域名
read -p "请输入您的域名 (例如: quesbank.yourdomain.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}错误: 域名不能为空${NC}"
    exit 1
fi

# 检查项目目录
PROJECT_DIR="/www/wwwroot/$DOMAIN"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}错误: 项目目录不存在: $PROJECT_DIR${NC}"
    echo "请先将项目文件上传到该目录"
    exit 1
fi

echo -e "${BLUE}项目目录: $PROJECT_DIR${NC}"
echo

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}正在安装Node.js依赖...${NC}"
    cd "$PROJECT_DIR/server"
    
    if [ ! -f "package.json" ]; then
        echo -e "${RED}错误: 未找到package.json文件${NC}"
        exit 1
    fi
    
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}依赖安装完成${NC}"
    else
        echo -e "${RED}依赖安装失败${NC}"
        exit 1
    fi
}

# 配置Nginx
config_nginx() {
    echo -e "${YELLOW}正在配置Nginx...${NC}"
    
    # 创建Nginx配置文件
    NGINX_CONF="/www/server/panel/vhost/nginx/$DOMAIN.conf"
    
    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $PROJECT_DIR;
    index index.html index.htm;
    
    # API反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # 部署向导
    location /deploy {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 静态文件
    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
    
    # 重启Nginx
    bt restart nginx
    
    echo -e "${GREEN}Nginx配置完成${NC}"
}

# 创建PM2配置
create_pm2_config() {
    echo -e "${YELLOW}正在创建PM2配置...${NC}"
    
    cat > "$PROJECT_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'quesbank',
    script: './server/app.js',
    cwd: '$PROJECT_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '$PROJECT_DIR/logs/err.log',
    out_file: '$PROJECT_DIR/logs/out.log',
    log_file: '$PROJECT_DIR/logs/combined.log',
    time: true,
    max_memory_restart: '512M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
    
    # 创建日志目录
    mkdir -p "$PROJECT_DIR/logs"
    
    echo -e "${GREEN}PM2配置创建完成${NC}"
}

# 创建启动脚本
create_scripts() {
    echo -e "${YELLOW}正在创建启动脚本...${NC}"
    
    # 启动脚本
    cat > "$PROJECT_DIR/start.sh" << EOF
#!/bin/bash

cd $PROJECT_DIR

# 检查Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "错误: Node.js未安装"
    exit 1
fi

# 检查依赖
if [ ! -d "server/node_modules" ]; then
    echo "安装依赖包..."
    cd server
    npm install
    cd ..
fi

# 启动应用
echo "启动QuesBank..."
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

echo "QuesBank启动完成"
echo "访问地址: http://$DOMAIN"
echo "部署向导: http://$DOMAIN/deploy"
EOF
    
    # 停止脚本
    cat > "$PROJECT_DIR/stop.sh" << EOF
#!/bin/bash

echo "停止QuesBank..."
pm2 stop quesbank
pm2 delete quesbank

echo "QuesBank已停止"
EOF
    
    # 重启脚本
    cat > "$PROJECT_DIR/restart.sh" << EOF
#!/bin/bash

echo "重启QuesBank..."
pm2 restart quesbank

echo "QuesBank重启完成"
EOF
    
    # 设置执行权限
    chmod +x "$PROJECT_DIR/start.sh"
    chmod +x "$PROJECT_DIR/stop.sh"
    chmod +x "$PROJECT_DIR/restart.sh"
    
    echo -e "${GREEN}启动脚本创建完成${NC}"
}

# 设置文件权限
set_permissions() {
    echo -e "${YELLOW}正在设置文件权限...${NC}"
    
    chown -R www:www "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"
    
    echo -e "${GREEN}文件权限设置完成${NC}"
}

# 显示部署信息
show_info() {
    echo
    echo -e "${GREEN}========================================"
    echo "    QuesBank 快速部署完成！"
    echo "========================================"
    echo
    echo "📁 项目目录: $PROJECT_DIR"
    echo "🚀 启动命令: $PROJECT_DIR/start.sh"
    echo "⏹️  停止命令: $PROJECT_DIR/stop.sh"
    echo "🔄 重启命令: $PROJECT_DIR/restart.sh"
    echo
    echo "🌐 访问地址: http://$DOMAIN"
    echo "🔧 部署向导: http://$DOMAIN/deploy"
    echo
    echo "📝 下一步操作:"
    echo "1. 运行启动脚本: $PROJECT_DIR/start.sh"
    echo "2. 访问部署向导完成配置"
    echo "3. 开始使用QuesBank系统"
    echo
    echo -e "如有问题，请联系: 562052228@qq.com${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}开始快速部署QuesBank...${NC}"
    echo
    
    # 安装依赖
    install_dependencies
    
    # 配置Nginx
    config_nginx
    
    # 创建PM2配置
    create_pm2_config
    
    # 创建启动脚本
    create_scripts
    
    # 设置文件权限
    set_permissions
    
    # 显示部署信息
    show_info
}

# 运行主函数
main "$@" 