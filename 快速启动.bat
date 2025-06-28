@echo off
chcp 65001 >nul
title QuesBank 快速启动

echo.
echo ========================================
echo    QuesBank 智能题库 - 快速启动
echo ========================================
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请先安装Python
    echo 下载地址: https://www.python.org/downloads/
    echo.
    echo 或者运行 "QuesBank启动器.bat" 选择其他启动方式
    echo.
    pause
    exit /b 1
)

:: 检查项目文件
if not exist "index.html" (
    echo [错误] 未找到项目文件，请确保在正确的目录中运行此脚本
    echo.
    pause
    exit /b 1
)

echo [信息] 正在启动 QuesBank 智能题库...
echo [信息] 服务器地址: http://localhost:8000
echo [信息] 按 Ctrl+C 停止服务器
echo.
echo ========================================
echo    启动中，请稍候...
echo ========================================
echo.

:: 启动服务器并自动打开浏览器
start http://localhost:8000
python -m http.server 8000

echo.
echo [信息] 服务器已停止
echo.
pause 