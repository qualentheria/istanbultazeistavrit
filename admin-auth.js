// Admin Authentication
document.addEventListener('DOMContentLoaded', function() {
    // Demo kullanıcı bilgileri
    const validCredentials = {
        username: 'admin',
        password: 'admin123'
    };

    // Login form submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Animasyon ekle
            const submitBtn = loginForm.querySelector('.login-btn');
            submitBtn.innerHTML = '<span>Giriş Yapılıyor...</span>';
            submitBtn.disabled = true;
            
            // Simüle edilmiş gecikme
            setTimeout(() => {
                if (username === validCredentials.username && password === validCredentials.password) {
                    // Başarılı giriş
                    if (remember) {
                        localStorage.setItem('adminLoggedIn', 'true');
                        localStorage.setItem('adminUsername', username);
                    } else {
                        sessionStorage.setItem('adminLoggedIn', 'true');
                        sessionStorage.setItem('adminUsername', username);
                    }
                    
                    // Başarı animasyonu
                    submitBtn.innerHTML = '<span>✓ Başarılı!</span>';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    
                    // Dashboard'a yönlendir
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                } else {
                    // Hatalı giriş
                    submitBtn.innerHTML = '<span>Hatalı Giriş!</span>';
                    submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    
                    // Form'u sıfırla
                    setTimeout(() => {
                        submitBtn.innerHTML = '<span>Giriş Yap</span><span class="btn-icon">→</span>';
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                        
                        // Hata mesajı göster
                        showNotification('Kullanıcı adı veya şifre hatalı!', 'error');
                    }, 2000);
                }
            }, 1000);
        });
    }
    
    // Bildirim göster
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;
        
        // Tip'e göre renk ayarla
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3 saniye sonra kaldır
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Animasyon stilleri ekle
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Enter tuşu ile form gönderimi
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && loginForm) {
            const submitBtn = loginForm.querySelector('.login-btn');
            if (!submitBtn.disabled) {
                loginForm.dispatchEvent(new Event('submit'));
            }
        }
    });
});

// Oturum kontrolü
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') || sessionStorage.getItem('adminLoggedIn');
    
    if (!isLoggedIn && window.location.pathname.includes('admin-dashboard.html')) {
        window.location.href = 'admin-login.html';
    }
}

// Sayfa yüklendiğinde kontrol et
checkAuth();
