#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
导航栏统一更新脚本
用于批量更新所有页面的导航栏，确保结构一致
"""

import os
import re
from pathlib import Path

def update_navigation_in_file(file_path):
    """更新单个文件的导航栏"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经包含navbar.css引用
        if 'js/navbar.css' not in content:
            print(f"跳过 {file_path}: 未引用navbar.css")
            return False
        
        # 定义标准的桌面导航栏结构
        desktop_nav_template = '''        <!-- 桌面导航 -->
        <nav class="hidden lg:flex items-center space-x-1 desktop-nav">
          <a href="index.html" class="nav-link">
            <i class="fa fa-home mr-2"></i>首页
          </a>
          <a href="practice.html" class="nav-link">
            <i class="fa fa-list-alt mr-2"></i>刷题模式
          </a>
          <a href="test.html" class="nav-link">
            <i class="fa fa-pencil mr-2"></i>考试模式
          </a>
          <a href="exam.html" class="nav-link">
            <i class="fa fa-pencil mr-2"></i>考试模式
          </a>
          <a href="bank.html" class="nav-link">
            <i class="fa fa-book mr-2"></i>题库
          </a>
          <a href="help.html" class="nav-link">
            <i class="fa fa-question-circle mr-2"></i>帮助
          </a>
          <a href="readme.html" class="nav-link">
            <i class="fa fa-file-text mr-2"></i>官方文档
          </a>
          <a href="api.html" class="nav-link">
            <i class="fa fa-code mr-2"></i>API文档
          </a>
        </nav>'''
        
        # 定义标准的移动端导航栏结构
        mobile_nav_template = '''          <div class="mobile-nav-grid">
            <a href="index.html" class="mobile-nav-item">
              <i class="fa fa-home mr-3"></i>首页
            </a>
            <a href="practice.html" class="mobile-nav-item">
              <i class="fa fa-list-alt mr-3"></i>刷题模式
            </a>
            <a href="test.html" class="mobile-nav-item">
              <i class="fa fa-pencil mr-3"></i>考试模式
            </a>
            <a href="exam.html" class="mobile-nav-item">
              <i class="fa fa-pencil mr-3"></i>考试模式
            </a>
            <a href="bank.html" class="mobile-nav-item">
              <i class="fa fa-book mr-3"></i>题库
            </a>
            <a href="help.html" class="mobile-nav-item">
              <i class="fa fa-question-circle mr-3"></i>帮助
            </a>
            <a href="readme.html" class="mobile-nav-item">
              <i class="fa fa-file-text mr-3"></i>官方文档
            </a>
            <a href="api.html" class="mobile-nav-item">
              <i class="fa fa-code mr-3"></i>API文档
            </a>
          </div>'''
        
        # 定义标准的用户操作区域结构
        user_actions_template = '''        <!-- 用户操作区域 -->
        <div class="hidden lg:flex items-center space-x-3 user-actions">
          <span id="userStatus" class="user-status"></span>
          <a href="admin.html" id="adminLink" class="nav-link hidden">
            <i class="fa fa-cog mr-1"></i>管理
          </a>
          <a href="#" id="logoutBtn" class="nav-link logout-link hidden">
            <i class="fa fa-sign-out mr-1"></i>退出
          </a>
          <a href="login.html" id="loginBtn" class="nav-link">
            <i class="fa fa-sign-in mr-1"></i>登录
          </a>'''
        
        # 获取当前文件名（不含扩展名）
        current_page = Path(file_path).stem
        
        # 根据当前页面设置active状态
        desktop_nav = desktop_nav_template
        mobile_nav = mobile_nav_template
        
        # 设置当前页面的active状态
        if current_page == 'index':
            desktop_nav = desktop_nav.replace('href="index.html" class="nav-link"', 'href="index.html" class="nav-link active"')
            mobile_nav = mobile_nav.replace('href="index.html" class="mobile-nav-item"', 'href="index.html" class="mobile-nav-item active"')
        elif current_page == 'practice':
            desktop_nav = desktop_nav.replace('href="practice.html" class="nav-link"', 'href="practice.html" class="nav-link active"')
            mobile_nav = mobile_nav.replace('href="practice.html" class="mobile-nav-item"', 'href="practice.html" class="mobile-nav-item active"')
        elif current_page == 'test':
            desktop_nav = desktop_nav.replace('href="test.html" class="nav-link"', 'href="test.html" class="nav-link active"')
            mobile_nav = mobile_nav.replace('href="test.html" class="mobile-nav-item"', 'href="test.html" class="mobile-nav-item active"')
        elif current_page == 'exam':
            desktop_nav = desktop_nav.replace('href="exam.html" class="nav-link"', 'href="exam.html" class="nav-link active"')
            mobile_nav = mobile_nav.replace('href="exam.html" class="mobile-nav-item"', 'href="exam.html" class="mobile-nav-item active"')
        elif current_page == 'bank':
            desktop_nav = desktop_nav.replace('href="bank.html" class="nav-link"', 'href="bank.html" class="nav-link active"')
            mobile_nav = mobile_nav.replace('href="bank.html" class="mobile-nav-item"', 'href="bank.html" class="mobile-nav-item active"')
        elif current_page == 'help':
            desktop_nav = desktop_nav.replace('href="help.html" class="nav-link"', 'href="help.html" class="nav-link active"')
            mobile_nav = mobile_nav.replace('href="help.html" class="mobile-nav-item"', 'href="help.html" class="mobile-nav-item active"')
        elif current_page == 'readme':
            desktop_nav = desktop_nav.replace('href="readme.html" class="nav-link"', 'href="readme.html" class="nav-link active"')
            mobile_nav = mobile_nav.replace('href="readme.html" class="mobile-nav-item"', 'href="readme.html" class="mobile-nav-item active"')
        elif current_page == 'api':
            desktop_nav = desktop_nav.replace('href="api.html" class="nav-link"', 'href="api.html" class="nav-link active"')
            mobile_nav = mobile_nav.replace('href="api.html" class="mobile-nav-item"', 'href="api.html" class="mobile-nav-item active"')
        elif current_page == 'settings':
            # settings页面没有对应的导航项，保持默认状态
            pass
        
        # 替换桌面导航栏
        desktop_nav_pattern = r'<nav class="hidden lg:flex items-center space-x-1 desktop-nav">.*?</nav>'
        if re.search(desktop_nav_pattern, content, re.DOTALL):
            content = re.sub(desktop_nav_pattern, desktop_nav, content, flags=re.DOTALL)
        
        # 替换移动端导航栏
        mobile_nav_pattern = r'<div class="mobile-nav-grid">.*?</div>'
        if re.search(mobile_nav_pattern, content, re.DOTALL):
            content = re.sub(mobile_nav_pattern, mobile_nav, content, flags=re.DOTALL)
        
        # 替换用户操作区域
        user_actions_pattern = r'<div class="hidden lg:flex items-center space-x-[34]">.*?<span id="userStatus" class="user-status"></span>.*?<a href="login\.html" id="loginBtn" class="nav-link">.*?</a>'
        if re.search(user_actions_pattern, content, re.DOTALL):
            # 为index.html添加CTA按钮
            if current_page == 'index':
                user_actions_template_with_cta = user_actions_template + '''
          <a href="practice.html" class="cta-button">
            <i class="fa fa-rocket"></i>
            <span>体验</span>
          </a>'''
                content = re.sub(user_actions_pattern, user_actions_template_with_cta, content, flags=re.DOTALL)
            else:
                content = re.sub(user_actions_pattern, user_actions_template, content, flags=re.DOTALL)
        
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ 已更新 {file_path}")
        return True
        
    except Exception as e:
        print(f"✗ 更新 {file_path} 时出错: {e}")
        return False

def main():
    """主函数"""
    print("开始统一导航栏结构...")
    
    # 需要更新的HTML文件列表
    html_files = [
        'index.html',
        'practice.html', 
        'test.html',
        'exam.html',
        'bank.html',
        'help.html',
        'settings.html',
        'readme.html',
        'api.html'
    ]
    
    updated_count = 0
    total_count = len(html_files)
    
    for html_file in html_files:
        if os.path.exists(html_file):
            if update_navigation_in_file(html_file):
                updated_count += 1
        else:
            print(f"跳过 {html_file}: 文件不存在")
    
    print(f"\n更新完成！")
    print(f"总计: {total_count} 个文件")
    print(f"成功更新: {updated_count} 个文件")
    print(f"跳过: {total_count - updated_count} 个文件")

if __name__ == "__main__":
    main() 