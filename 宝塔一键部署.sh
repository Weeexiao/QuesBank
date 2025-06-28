#!/bin/bash

# QuesBank 智能题库 - 宝塔面板一键部署脚本
# 作者: 史智阳
# 邮箱: 562052228@qq.com

echo "========================================"
echo "    QuesBank 智能题库 - 宝塔部署脚本"
echo "========================================"
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}错误: 请使用root用户运行此脚本${NC}"
    exit 1
fi

# 检查操作系统
OS=$(cat /etc/os-release | grep -oP '(?<=^ID=).+' | tr -d '"')
VERSION=$(cat /etc/os-release | grep -oP '(?<=^VERSION_ID=).+' | tr -d '"')

echo -e "${BLUE}检测到操作系统: ${OS} ${VERSION}${NC}"
echo

# 安装宝塔面板
install_bt() {
    echo -e "${YELLOW}正在安装宝塔面板...${NC}"
    
    if [ "$OS" = "centos" ]; then
        yum install -y wget
        wget -O install.sh http://download.bt.cn/install/install_6.0.sh
        sh install.sh
    elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh
        bash install.sh
    else
        echo -e "${RED}不支持的操作系统: ${OS}${NC}"
        exit 1
    fi
}

# 检查宝塔面板是否已安装
check_bt() {
    if command -v bt >/dev/null 2>&1; then
        echo -e "${GREEN}宝塔面板已安装${NC}"
        return 0
    else
        echo -e "${YELLOW}宝塔面板未安装，正在安装...${NC}"
        install_bt
        return $?
    fi
}

# 安装必要软件
install_software() {
    echo -e "${YELLOW}正在安装必要软件...${NC}"
    
    # 安装Node.js
    echo "安装Node.js..."
    bt install nodejs 16
    
    # 安装MySQL
    echo "安装MySQL..."
    bt install mysql 8.0
    
    # 安装Nginx
    echo "安装Nginx..."
    bt install nginx
    
    echo -e "${GREEN}软件安装完成${NC}"
}

# 创建网站目录
create_site() {
    echo -e "${YELLOW}正在创建网站目录...${NC}"
    
    # 创建网站目录
    mkdir -p /www/wwwroot/quesbank
    
    # 设置权限
    chown -R www:www /www/wwwroot/quesbank
    chmod -R 755 /www/wwwroot/quesbank
    
    echo -e "${GREEN}网站目录创建完成${NC}"
}

# 配置Nginx
config_nginx() {
    echo -e "${YELLOW}正在配置Nginx...${NC}"
    
    # 创建Nginx配置文件
    cat > /www/server/panel/vhost/nginx/quesbank.conf << 'EOF'
server {
    listen 80;
    server_name quesbank.yourdomain.com;
    root /www/wwwroot/quesbank;
    index index.html index.htm;
    
    # API反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # 部署向导
    location /deploy {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态文件
    location / {
        try_files $uri $uri/ /index.html;
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

# 创建PM2配置文件
create_pm2_config() {
    echo -e "${YELLOW}正在创建PM2配置...${NC}"
    
    cat > /www/wwwroot/quesbank/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'quesbank',
    script: './server/app.js',
    cwd: '/www/wwwroot/quesbank',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/www/wwwroot/quesbank/logs/err.log',
    out_file: '/www/wwwroot/quesbank/logs/out.log',
    log_file: '/www/wwwroot/quesbank/logs/combined.log',
    time: true,
    max_memory_restart: '512M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
    
    # 创建日志目录
    mkdir -p /www/wwwroot/quesbank/logs
    
    echo -e "${GREEN}PM2配置创建完成${NC}"
}

# 创建启动脚本
create_start_script() {
    echo -e "${YELLOW}正在创建启动脚本...${NC}"
    
    cat > /www/wwwroot/quesbank/start.sh << 'EOF'
#!/bin/bash

# QuesBank 启动脚本

cd /www/wwwroot/quesbank

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
echo "访问地址: http://quesbank.yourdomain.com"
echo "部署向导: http://quesbank.yourdomain.com/deploy"
EOF
    
    chmod +x /www/wwwroot/quesbank/start.sh
    
    echo -e "${GREEN}启动脚本创建完成${NC}"
}

# 创建停止脚本
create_stop_script() {
    echo -e "${YELLOW}正在创建停止脚本...${NC}"
    
    cat > /www/wwwroot/quesbank/stop.sh << 'EOF'
#!/bin/bash

# QuesBank 停止脚本

echo "停止QuesBank..."
pm2 stop quesbank
pm2 delete quesbank

echo "QuesBank已停止"
EOF
    
    chmod +x /www/wwwroot/quesbank/stop.sh
    
    echo -e "${GREEN}停止脚本创建完成${NC}"
}

# 创建备份脚本
create_backup_script() {
    echo -e "${YELLOW}正在创建备份脚本...${NC}"
    
    cat > /www/wwwroot/quesbank/backup.sh << 'EOF'
#!/bin/bash

# QuesBank 备份脚本

BACKUP_DIR="/www/backup/quesbank"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
echo "备份数据库..."
mysqldump -u root -p quesbank > $BACKUP_DIR/quesbank_db_$DATE.sql

# 备份配置文件
echo "备份配置文件..."
cp -r /www/wwwroot/quesbank/server/config.env $BACKUP_DIR/config_$DATE.env

# 压缩备份文件
cd $BACKUP_DIR
tar -czf quesbank_backup_$DATE.tar.gz quesbank_db_$DATE.sql config_$DATE.env

# 删除临时文件
rm quesbank_db_$DATE.sql config_$DATE.env

# 保留最近7天的备份
find $BACKUP_DIR -name "quesbank_backup_*.tar.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/quesbank_backup_$DATE.tar.gz"
EOF
    
    chmod +x /www/wwwroot/quesbank/backup.sh
    
    echo -e "${GREEN}备份脚本创建完成${NC}"
}

# 设置定时任务
setup_cron() {
    echo -e "${YELLOW}正在设置定时任务...${NC}"
    
    # 添加开机启动
    (crontab -l 2>/dev/null; echo "@reboot /www/wwwroot/quesbank/start.sh") | crontab -
    
    # 添加每日备份
    (crontab -l 2>/dev/null; echo "0 2 * * * /www/wwwroot/quesbank/backup.sh") | crontab -
    
    echo -e "${GREEN}定时任务设置完成${NC}"
}

# 显示部署信息
show_info() {
    echo
    echo -e "${GREEN}========================================"
    echo "    QuesBank 部署完成！"
    echo "========================================"
    echo
    echo "📁 项目目录: /www/wwwroot/quesbank"
    echo "🚀 启动命令: /www/wwwroot/quesbank/start.sh"
    echo "⏹️  停止命令: /www/wwwroot/quesbank/stop.sh"
    echo "💾 备份命令: /www/wwwroot/quesbank/backup.sh"
    echo
    echo "🌐 访问地址: http://quesbank.yourdomain.com"
    echo "🔧 部署向导: http://quesbank.yourdomain.com/deploy"
    echo "📊 宝塔面板: http://服务器IP:8888"
    echo
    echo "📝 下一步操作:"
    echo "1. 上传项目文件到 /www/wwwroot/quesbank"
    echo "2. 修改域名配置"
    echo "3. 运行启动脚本"
    echo "4. 访问部署向导完成配置"
    echo
    echo -e "如有问题，请联系: 562052228@qq.com${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}开始部署QuesBank智能题库系统...${NC}"
    echo
    
    # 检查宝塔面板
    check_bt
    if [ $? -ne 0 ]; then
        echo -e "${RED}宝塔面板安装失败${NC}"
        exit 1
    fi
    
    # 安装软件
    install_software
    
    # 创建网站目录
    create_site
    
    # 配置Nginx
    config_nginx
    
    # 创建PM2配置
    create_pm2_config
    
    # 创建启动脚本
    create_start_script
    
    # 创建停止脚本
    create_stop_script
    
    # 创建备份脚本
    create_backup_script
    
    # 设置定时任务
    setup_cron
    
    # 显示部署信息
    show_info
}

# 运行主函数
main "$@" 