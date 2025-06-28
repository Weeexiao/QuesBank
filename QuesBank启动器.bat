@echo off
chcp 65001 >nul
title QuesBank 智能题库 - 高级启动器

:menu
cls
echo.
echo ========================================
echo    QuesBank 智能题库 - 高级启动器
echo ========================================
echo.
echo 请选择启动方式：
echo.
echo [1] 使用Python启动 (推荐)
echo [2] 使用Node.js启动
echo [3] 使用PHP启动
echo [4] 直接打开浏览器 (仅适用于现代浏览器)
echo [5] 检查环境
echo [6] 退出
echo.
set /p choice=请输入选择 (1-6): 

if "%choice%"=="1" goto python_start
if "%choice%"=="2" goto node_start
if "%choice%"=="3" goto php_start
if "%choice%"=="4" goto browser_start
if "%choice%"=="5" goto check_env
if "%choice%"=="6" goto exit
goto menu

:python_start
cls
echo.
echo ========================================
echo    使用Python启动服务器
echo ========================================
echo.
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请先安装Python
    echo 下载地址: https://www.python.org/downloads/
    echo.
    pause
    goto menu
)

if not exist "index.html" (
    echo [错误] 未找到index.html文件，请确保在正确的项目目录中运行此脚本
    echo.
    pause
    goto menu
)

echo [信息] 检测到Python环境
echo [信息] 项目文件检查完成
echo.
echo [信息] 正在启动本地HTTP服务器...
echo [信息] 服务器将在 http://localhost:8000 启动
echo [信息] 按 Ctrl+C 停止服务器
echo.
echo ========================================
echo    正在启动，请稍候...
echo ========================================
echo.

python -m http.server 8000
goto menu

:node_start
cls
echo.
echo ========================================
echo    使用Node.js启动服务器
echo ========================================
echo.
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    echo.
    pause
    goto menu
)

if not exist "index.html" (
    echo [错误] 未找到index.html文件，请确保在正确的项目目录中运行此脚本
    echo.
    pause
    goto menu
)

echo [信息] 检测到Node.js环境
echo [信息] 项目文件检查完成
echo.
echo [信息] 正在启动本地HTTP服务器...
echo [信息] 服务器将在 http://localhost:3000 启动
echo [信息] 按 Ctrl+C 停止服务器
echo.
echo ========================================
echo    正在启动，请稍候...
echo ========================================
echo.

npx http-server -p 3000 -o
goto menu

:php_start
cls
echo.
echo ========================================
echo    使用PHP启动服务器
echo ========================================
echo.
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到PHP，请先安装PHP
    echo 下载地址: https://windows.php.net/download/
    echo.
    pause
    goto menu
)

if not exist "index.html" (
    echo [错误] 未找到index.html文件，请确保在正确的项目目录中运行此脚本
    echo.
    pause
    goto menu
)

echo [信息] 检测到PHP环境
echo [信息] 项目文件检查完成
echo.
echo [信息] 正在启动本地HTTP服务器...
echo [信息] 服务器将在 http://localhost:8080 启动
echo [信息] 按 Ctrl+C 停止服务器
echo.
echo ========================================
echo    正在启动，请稍候...
echo ========================================
echo.

php -S localhost:8080
goto menu

:browser_start
cls
echo.
echo ========================================
echo    直接打开浏览器
echo ========================================
echo.
if not exist "index.html" (
    echo [错误] 未找到index.html文件，请确保在正确的项目目录中运行此脚本
    echo.
    pause
    goto menu
)

echo [信息] 正在打开浏览器...
echo [注意] 某些功能可能需要HTTP服务器才能正常工作
echo.

start index.html
echo [信息] 浏览器已打开
echo.
pause
goto menu

:check_env
cls
echo.
echo ========================================
echo    环境检查
echo ========================================
echo.

echo 检查Python环境...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    python --version
    echo [✓] Python 已安装
) else (
    echo [✗] Python 未安装
)
echo.

echo 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    node --version
    echo [✓] Node.js 已安装
) else (
    echo [✗] Node.js 未安装
)
echo.

echo 检查PHP环境...
php --version >nul 2>&1
if %errorlevel% equ 0 (
    php --version
    echo [✓] PHP 已安装
) else (
    echo [✗] PHP 未安装
)
echo.

echo 检查项目文件...
if exist "index.html" (
    echo [✓] index.html 存在
) else (
    echo [✗] index.html 不存在
)

if exist "exam.html" (
    echo [✓] exam.html 存在
) else (
    echo [✗] exam.html 不存在
)

if exist "bank.html" (
    echo [✓] bank.html 存在
) else (
    echo [✗] bank.html 不存在
)
echo.

pause
goto menu

:exit
echo.
echo 感谢使用 QuesBank 智能题库！
echo.
exit /b 0 