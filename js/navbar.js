// 通用导航栏功能
class NavbarManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.menuBtn = document.getElementById('menuBtn');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.currentPage = this.getCurrentPage();
        
        this.init();
    }
    
    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupUserStatus();
        this.setupActiveLinks();
        this.setupClickOutside();
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }
    
    setupScrollEffect() {
        if (!this.navbar) return;
        
        window.addEventListener('scroll', () => {
            const navbarContainer = this.navbar.querySelector('.navbar-container');
            if (!navbarContainer) return;
            
            if (window.scrollY > 50) {
                navbarContainer.classList.add('scrolled');
            } else {
                navbarContainer.classList.remove('scrolled');
            }
        });
    }
    
    setupMobileMenu() {
        if (!this.menuBtn || !this.mobileMenu) return;
        
        this.menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });
    }
    
    toggleMobileMenu() {
        this.mobileMenu.classList.toggle('open');
        this.menuBtn.classList.toggle('active');
        
        if (this.mobileMenu.classList.contains('open')) {
            this.menuBtn.innerHTML = '<i class="fa fa-times text-xl"></i>';
        } else {
            this.menuBtn.innerHTML = '<i class="fa fa-bars text-xl"></i>';
        }
    }
    
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            if (this.menuBtn && this.mobileMenu) {
                if (!this.menuBtn.contains(e.target) && !this.mobileMenu.contains(e.target)) {
                    this.mobileMenu.classList.remove('open');
                    this.menuBtn.classList.remove('active');
                    this.menuBtn.innerHTML = '<i class="fa fa-bars text-xl"></i>';
                }
            }
        });
    }
    
    setupUserStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        
        // 桌面端用户状态
        const userStatus = document.getElementById('userStatus');
        const adminLink = document.getElementById('adminLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const loginBtn = document.getElementById('loginBtn');
        
        // 移动端用户状态
        const mobileUserStatusText = document.getElementById('mobileUserStatusText');
        const mobileAdminLink = document.getElementById('mobileAdminLink');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        
        if (currentUser) {
            const statusText = `欢迎，${currentUser.username}`;
            
            if (userStatus) userStatus.textContent = statusText;
            if (mobileUserStatusText) mobileUserStatusText.textContent = statusText;
            
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');
            if (loginBtn) loginBtn.classList.add('hidden');
            if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
            
            if (currentUser.role === 'admin') {
                if (adminLink) adminLink.classList.remove('hidden');
                if (mobileAdminLink) mobileAdminLink.classList.remove('hidden');
            } else {
                if (adminLink) adminLink.classList.add('hidden');
                if (mobileAdminLink) mobileAdminLink.classList.add('hidden');
            }
        } else {
            const statusText = '游客模式';
            
            if (userStatus) userStatus.textContent = statusText;
            if (mobileUserStatusText) mobileUserStatusText.textContent = statusText;
            
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (mobileLogoutBtn) mobileLogoutBtn.classList.add('hidden');
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
            if (adminLink) adminLink.classList.add('hidden');
            if (mobileAdminLink) mobileAdminLink.classList.add('hidden');
        }
        
        // 绑定退出登录事件
        this.bindLogoutEvents();
    }
    
    bindLogoutEvents() {
        const logoutBtn = document.getElementById('logoutBtn');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        
        const logoutHandler = (e) => {
            e.preventDefault();
            this.logout();
        };
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logoutHandler);
        }
        
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', logoutHandler);
        }
    }
    
    logout() {
        localStorage.removeItem('currentUser');
        this.showNotification('退出成功', '已安全退出系统', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
    
    setupActiveLinks() {
        const navLinks = document.querySelectorAll('.nav-link');
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        
        // 根据当前页面设置激活状态
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === this.currentPage || 
                (this.currentPage === 'index.html' && href === '#') ||
                (href.includes(this.currentPage.replace('.html', '')))) {
                link.classList.add('active');
            }
        });
        
        mobileNavItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === this.currentPage || 
                (this.currentPage === 'index.html' && href === '#') ||
                (href.includes(this.currentPage.replace('.html', '')))) {
                item.classList.add('active');
            }
        });
    }
    
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 transform translate-x-full transition-transform duration-300 max-w-sm z-50 border-l-4 ${
            type === 'success' ? 'border-green-500' : 
            type === 'error' ? 'border-red-500' : 
            'border-blue-500'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="mr-3 text-lg ${type === 'success' ? 'text-green-500 fa fa-check-circle' : 
                                       type === 'error' ? 'text-red-500 fa fa-exclamation-circle' : 
                                       'text-blue-500 fa fa-info-circle'}"></i>
                <div>
                    <h4 class="font-medium">${title}</h4>
                    <p class="text-sm text-gray-600">${message}</p>
                </div>
                <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                    <i class="fa fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
            notification.classList.add('translate-x-0');
        }, 100);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            notification.classList.remove('translate-x-0');
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// 平滑滚动功能
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // 关闭移动菜单（如果打开）
                const mobileMenu = document.getElementById('mobileMenu');
                const menuBtn = document.getElementById('menuBtn');
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                    menuBtn.classList.remove('active');
                    menuBtn.innerHTML = '<i class="fa fa-bars text-xl"></i>';
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    new NavbarManager();
    
    // 设置平滑滚动
    setupSmoothScroll();
    
    // 添加页面加载动画
    document.body.classList.add('loaded');
});

// 导出供其他脚本使用
window.NavbarManager = NavbarManager;
window.setupSmoothScroll = setupSmoothScroll; 