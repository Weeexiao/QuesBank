@echo off
chcp 65001 >nul
title QuesBank 智能题库 - 本地启动器

echo.
echo ========================================
echo    QuesBank 智能题库 - 本地启动器
echo ========================================
echo.
echo 正在启动本地服务器...
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请先安装Python
    echo 下载地址: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

:: 检查当前目录是否存在index.html
if not exist "index.html" (
    echo [错误] 未找到index.html文件，请确保在正确的项目目录中运行此脚本
    echo.
    pause
    exit /b 1
)

echo [信息] 检测到Python环境
echo [信息] 项目文件检查完成
echo.

:: 尝试启动HTTP服务器
echo [信息] 正在启动本地HTTP服务器...
echo [信息] 服务器将在 http://localhost:8000 启动
echo [信息] 按 Ctrl+C 停止服务器
echo.
echo ========================================
echo    正在启动，请稍候...
echo ========================================
echo.

:: 启动Python HTTP服务器
python -m http.server 8000

echo.
echo [信息] 服务器已停止
echo.
pause 