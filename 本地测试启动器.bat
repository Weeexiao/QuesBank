@echo off
chcp 65001 >nul
echo ========================================
echo    QuesBank 智能题库 - 本地测试启动器
echo ========================================
echo.

echo 📋 检查环境...
echo.

echo 1. 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js
    echo 请访问 https://nodejs.org 下载并安装Node.js
    pause
    exit /b 1
)
echo ✅ Node.js环境检查通过

echo.
echo 2. 检查MySQL环境...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告: 未找到MySQL命令行工具
    echo 请确保MySQL服务已安装并运行
    echo 或者使用MySQL Workbench等图形化工具
)

echo.
echo 3. 检查项目文件...
if not exist "server" (
    echo ❌ 错误: 未找到server目录
    pause
    exit /b 1
)

if not exist "server\config.env" (
    echo ❌ 错误: 未找到数据库配置文件
    echo 请参考 数据库部署说明.md 创建config.env文件
    pause
    exit /b 1
)

echo ✅ 项目文件检查通过
echo.

echo 🚀 启动后端服务器...
echo 服务器将在 http://localhost:3001 运行
echo 按 Ctrl+C 停止服务器
echo.

cd server
node app.js 