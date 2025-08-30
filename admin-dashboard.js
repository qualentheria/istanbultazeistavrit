// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Auth kontrolü
    checkAuth();
    
    // Initialize localStorage data
    initializeData();
    
    // Dashboard başlangıç
    setTimeout(() => {
        initDashboard();
        
        // Event listeners
        setupEventListeners();
        
        // Load initial data
        loadProducts();
        loadOrders();
        loadCustomers();
        loadInventory();
    }, 100);
});

// Varsayılan veri oluştur
function initializeData() {
    // Ürünler
    if (!localStorage.getItem('products')) {
        const defaultProducts = [
            {
                id: 1,
                name: 'Taze İstavrit',
                price: 89.90,
                stock: 150,
                category: 'Taze Balık',
                description: 'Günlük avlanan A kalite istavrit',
                sales: 45,
                image: '🐟'
            },
            {
                id: 2,
                name: 'Temizlenmiş İstavrit',
                price: 119.90,
                stock: 80,
                category: 'Temizlenmiş',
                description: 'Kılçığı ayıklanmış, pişirmeye hazır',
                sales: 32,
                image: '🐠'
            },
            {
                id: 3,
                name: 'Marine İstavrit',
                price: 139.90,
                stock: 60,
                category: 'Marine',
                description: 'Özel baharatlarla marine edilmiş',
                sales: 28,
                image: '🐡'
            }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
    
    // Siparişler
    if (!localStorage.getItem('orders')) {
        const defaultOrders = [
            {
                id: 'ORD-2024-001',
                customer: 'Mehmet Yılmaz',
                phone: '0532 111 22 33',
                product: 'Taze İstavrit (2kg)',
                amount: 179.80,
                status: 'delivered',
                date: new Date().toISOString(),
                address: 'Kadıköy, İstanbul'
            },
            {
                id: 'ORD-2024-002',
                customer: 'Ayşe Kaya',
                phone: '0533 444 55 66',
                product: 'Marine İstavrit (1kg)',
                amount: 139.90,
                status: 'preparing',
                date: new Date().toISOString(),
                address: 'Beşiktaş, İstanbul'
            },
            {
                id: 'ORD-2024-003',
                customer: 'Ali Demir',
                phone: '0534 777 88 99',
                product: 'Temizlenmiş İstavrit (3kg)',
                amount: 359.70,
                status: 'shipping',
                date: new Date().toISOString(),
                address: 'Üsküdar, İstanbul'
            }
        ];
        localStorage.setItem('orders', JSON.stringify(defaultOrders));
    }
    
    // Müşteriler
    if (!localStorage.getItem('customers')) {
        const defaultCustomers = [
            {
                id: 1,
                name: 'Mehmet Yılmaz',
                phone: '0532 111 22 33',
                email: 'mehmet@email.com',
                totalOrders: 12,
                totalSpent: 2150.50,
                joinDate: '2023-01-15'
            },
            {
                id: 2,
                name: 'Ayşe Kaya',
                phone: '0533 444 55 66',
                email: 'ayse@email.com',
                totalOrders: 8,
                totalSpent: 1420.30,
                joinDate: '2023-03-20'
            },
            {
                id: 3,
                name: 'Ali Demir',
                phone: '0534 777 88 99',
                email: 'ali@email.com',
                totalOrders: 15,
                totalSpent: 3200.00,
                joinDate: '2022-12-10'
            }
        ];
        localStorage.setItem('customers', JSON.stringify(defaultCustomers));
    }
}

// Dashboard başlat
function initDashboard() {
    // Stats önce güncellenir
    updateStats();
    
    // Charts varsa yükle
    if (document.getElementById('salesChart')) {
        initCharts();
    }
    
    // Recent activity
    loadRecentActivity();
}

// Event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // onclick attribute varsa işleme devam etme
            if (this.hasAttribute('onclick')) {
                const onclickValue = this.getAttribute('onclick');
                if (onclickValue && onclickValue.includes('logout')) {
                    return;
                }
            }
            
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = href.substring(1);
                showSection(target);
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        });
    }
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
}

// Section göster/gizle
function showSection(sectionId) {
    // Tüm section'ları gizle
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Dashboard section'ı için özel kontrol
    const dashboardSection = document.querySelector('.dashboard-content');
    if (dashboardSection) {
        dashboardSection.style.display = sectionId === 'dashboard' ? 'block' : 'none';
    }
    
    // Seçili section'ı göster
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        
        // Analytics section ise chartları yeniden başlat
        if (sectionId === 'analytics') {
            setTimeout(() => initAnalyticsCharts(), 100);
        }
    }
    
    // Active state güncelle
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '#' + sectionId) {
            item.classList.add('active');
        }
    });
}

// Charts
function initCharts() {
    // Chart.js yüklü mü kontrol et
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js henüz yüklenmedi');
        return;
    }
    
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx && salesCtx.getContext) {
        new Chart(salesCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
                datasets: [{
                    label: 'Satışlar (₺)',
                    data: [3200, 4100, 3800, 5200, 6100, 7500, 5900],
                    borderColor: '#0077be',
                    backgroundColor: 'rgba(0, 119, 190, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₺' + value.toLocaleString('tr-TR');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Product Distribution Chart
    const productCtx = document.getElementById('productChart');
    if (productCtx && productCtx.getContext) {
        new Chart(productCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Taze İstavrit', 'Temizlenmiş', 'Marine'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: [
                        '#0077be',
                        '#00a8cc',
                        '#ffa500'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Analytics Charts
    initAnalyticsCharts();
}

function initAnalyticsCharts() {
    if (typeof Chart === 'undefined') return;
    
    // Top Products Chart
    const topProductsCtx = document.getElementById('topProductsChart');
    if (topProductsCtx && topProductsCtx.getContext) {
        new Chart(topProductsCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Taze İstavrit', 'Temizlenmiş', 'Marine'],
                datasets: [{
                    label: 'Satış Adedi',
                    data: [120, 85, 65],
                    backgroundColor: ['#0077be', '#00a8cc', '#ffa500']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Customer Segment Chart
    const customerSegmentCtx = document.getElementById('customerSegmentChart');
    if (customerSegmentCtx && customerSegmentCtx.getContext) {
        new Chart(customerSegmentCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Yeni', 'Düzenli', 'VIP'],
                datasets: [{
                    data: [35, 45, 20],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Revenue Trend Chart
    const revenueTrendCtx = document.getElementById('revenueTrendChart');
    if (revenueTrendCtx && revenueTrendCtx.getContext) {
        new Chart(revenueTrendCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
                datasets: [{
                    label: 'Gelir (₺)',
                    data: [42000, 48000, 51000, 55000, 62000, 68000],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Order Status Chart
    const orderStatusCtx = document.getElementById('orderStatusChart');
    if (orderStatusCtx && orderStatusCtx.getContext) {
        new Chart(orderStatusCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Teslim Edildi', 'Yolda', 'Hazırlanıyor', 'Beklemede'],
                datasets: [{
                    data: [65, 20, 10, 5],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Stats güncelle
function updateStats() {
    try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        
        const statNumbers = document.querySelectorAll('.stat-number');
        
        if (statNumbers[0]) {
            // Toplam satış
            const totalSales = orders.reduce((sum, order) => sum + order.amount, 0);
            statNumbers[0].textContent = '₺' + totalSales.toLocaleString('tr-TR', {minimumFractionDigits: 2});
        }
        
        if (statNumbers[1]) {
            // Toplam kg
            const totalKg = products.reduce((sum, product) => sum + (product.sales || 0), 0);
            statNumbers[1].textContent = totalKg + ' kg';
        }
        
        if (statNumbers[2]) {
            // Müşteri sayısı
            statNumbers[2].textContent = customers.length;
        }
        
        if (statNumbers[3]) {
            // Teslimat sayısı
            const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
            statNumbers[3].textContent = deliveredOrders;
        }
    } catch (error) {
        console.error('Stats güncelleme hatası:', error);
    }
}

// Ürünleri yükle
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const grid = document.getElementById('productsGrid');
    
    if (!grid) return;
    
    grid.innerHTML = products.map(product => `
        <div class="product-admin-card">
            <div class="product-admin-image">
                ${product.image || '🐟'}
            </div>
            <div class="product-admin-info">
                <h3>${product.name}</h3>
                <p style="color: #64748b; margin: 10px 0;">${product.description}</p>
                <div class="product-meta">
                    <span style="font-size: 1.5rem; font-weight: 700; color: #0077be;">₺${product.price}</span>
                    <span style="background: ${product.stock < 50 ? '#fee2e2' : '#d1fae5'}; color: ${product.stock < 50 ? '#ef4444' : '#10b981'}; padding: 5px 10px; border-radius: 5px;">
                        Stok: ${product.stock} kg
                    </span>
                </div>
                <div class="product-actions">
                    <button class="edit-btn" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Düzenle
                    </button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Siparişleri yükle
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const ordersList = document.getElementById('ordersList');
    
    if (!ordersList) return;
    
    const statusColors = {
        'delivered': { bg: '#d1fae5', color: '#065f46', text: 'Teslim Edildi' },
        'shipping': { bg: '#dbeafe', color: '#1e40af', text: 'Yolda' },
        'preparing': { bg: '#fed7aa', color: '#92400e', text: 'Hazırlanıyor' },
        'pending': { bg: '#fee2e2', color: '#991b1b', text: 'Beklemede' }
    };
    
    ordersList.innerHTML = orders.map(order => `
        <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="color: #1e293b; margin-bottom: 10px;">${order.id}</h4>
                    <p style="color: #64748b;"><i class="fas fa-user"></i> ${order.customer}</p>
                    <p style="color: #64748b;"><i class="fas fa-phone"></i> ${order.phone}</p>
                    <p style="color: #64748b;"><i class="fas fa-map-marker-alt"></i> ${order.address}</p>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: 1.5rem; font-weight: 700; color: #0077be;">₺${order.amount}</p>
                    <p style="color: #64748b; margin: 10px 0;">${order.product}</p>
                    <span style="background: ${statusColors[order.status]?.bg}; color: ${statusColors[order.status]?.color}; padding: 5px 15px; border-radius: 20px; font-size: 0.85rem;">
                        ${statusColors[order.status]?.text}
                    </span>
                </div>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0; display: flex; gap: 10px;">
                <button class="btn-primary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="updateOrderStatus('${order.id}')">
                    <i class="fas fa-truck"></i> Durumu Güncelle
                </button>
                <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;">
                    <i class="fas fa-print"></i> Yazdır
                </button>
            </div>
        </div>
    `).join('');
}

// Müşterileri yükle
function loadCustomers() {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customersList = document.getElementById('customersList');
    
    if (!customersList) return;
    
    customersList.innerHTML = customers.map(customer => `
        <tr>
            <td>#${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.email}</td>
            <td>${customer.totalOrders}</td>
            <td>₺${customer.totalSpent.toLocaleString('tr-TR')}</td>
            <td>
                <button class="action-btn"><i class="fas fa-eye"></i></button>
                <button class="action-btn"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteCustomer(${customer.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Stok yükle
function loadInventory() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const inventoryGrid = document.getElementById('inventoryGrid');
    
    if (!inventoryGrid) return;
    
    inventoryGrid.innerHTML = products.map(product => {
        const stockLevel = product.stock < 50 ? 'critical' : product.stock < 100 ? 'warning' : 'good';
        const stockColors = {
            critical: { bg: '#fee2e2', color: '#ef4444', icon: '⚠️' },
            warning: { bg: '#fed7aa', color: '#f59e0b', icon: '⚡' },
            good: { bg: '#d1fae5', color: '#10b981', icon: '✓' }
        };
        
        return `
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>${product.name}</h3>
                    <span style="font-size: 1.5rem;">${stockColors[stockLevel].icon}</span>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Stok Durumu</span>
                        <span style="font-weight: 600;">${product.stock} kg</span>
                    </div>
                    <div style="height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(product.stock / 200 * 100, 100)}%; background: ${stockColors[stockLevel].color}; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div style="padding: 10px; background: ${stockColors[stockLevel].bg}; border-radius: 8px; text-align: center;">
                    <p style="color: ${stockColors[stockLevel].color}; font-weight: 500;">
                        ${stockLevel === 'critical' ? 'Kritik Seviye!' : stockLevel === 'warning' ? 'Dikkat!' : 'Stok Yeterli'}
                    </p>
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: 15px; padding: 10px;" onclick="addStock(${product.id})">
                    <i class="fas fa-plus"></i> Stok Ekle
                </button>
            </div>
        `;
    }).join('');
}

// Recent activity
function loadRecentActivity() {
    const activity = [
        { type: 'order', text: 'Yeni sipariş #1234', time: '5 dk önce', icon: 'fa-shopping-cart' },
        { type: 'customer', text: 'Yeni müşteri kaydı', time: '15 dk önce', icon: 'fa-user-plus' },
        { type: 'product', text: 'Stok güncellendi', time: '1 saat önce', icon: 'fa-box' },
        { type: 'payment', text: 'Ödeme alındı', time: '2 saat önce', icon: 'fa-credit-card' }
    ];
    
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    activityList.innerHTML = activity.map(item => `
        <div class="activity-item">
            <div class="activity-icon ${item.type}">
                <i class="fas ${item.icon}"></i>
            </div>
            <div class="activity-details">
                <span class="activity-text">${item.text}</span>
                <span class="activity-time">${item.time}</span>
            </div>
        </div>
    `).join('');
}

// Product Modal
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'block';
        
        if (productId) {
            // Edit mode
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const product = products.find(p => p.id === productId);
            if (product) {
                document.getElementById('productName').value = product.name;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productCategory').value = product.category;
                document.getElementById('productDescription').value = product.description;
            }
        } else {
            // Add mode - clear form
            document.getElementById('productForm').reset();
        }
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        sales: 0,
        image: '🐟'
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    closeProductModal();
    loadProducts();
    showNotification('Ürün başarıyla eklendi!', 'success');
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        let products = JSON.parse(localStorage.getItem('products') || '[]');
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
        showNotification('Ürün başarıyla silindi!', 'success');
    }
}

function deleteCustomer(customerId) {
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
        let customers = JSON.parse(localStorage.getItem('customers') || '[]');
        customers = customers.filter(c => c.id !== customerId);
        localStorage.setItem('customers', JSON.stringify(customers));
        loadCustomers();
        showNotification('Müşteri başarıyla silindi!', 'success');
    }
}

function updateOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        // Status progression
        const statusFlow = ['pending', 'preparing', 'shipping', 'delivered'];
        const currentIndex = statusFlow.indexOf(order.status);
        
        if (currentIndex < statusFlow.length - 1) {
            order.status = statusFlow[currentIndex + 1];
            localStorage.setItem('orders', JSON.stringify(orders));
            loadOrders();
            showNotification('Sipariş durumu güncellendi!', 'success');
        } else {
            showNotification('Sipariş zaten teslim edildi!', 'info');
        }
    }
}

function addStock(productId) {
    const amount = prompt('Eklenecek stok miktarını girin (kg):');
    if (amount && !isNaN(amount)) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const product = products.find(p => p.id === productId);
        
        if (product) {
            product.stock += parseInt(amount);
            localStorage.setItem('products', JSON.stringify(products));
            loadInventory();
            loadProducts();
            showNotification(`${amount} kg stok eklendi!`, 'success');
        }
    }
}

function showNotification(message, type = 'success') {
    // Mevcut notification'ları temizle
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Auth kontrolü
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') || sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// Logout fonksiyonu
function logout() {
    localStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}
