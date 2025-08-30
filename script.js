// Tema yönetimi
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Tema fonksiyonları
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

function initTheme() {
    // Önce localStorage'dan kontrol et
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Sistem temasını algıla
        const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
        setTheme(systemTheme);
    }
}

// Tema değiştirme butonu
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

// Sistem teması değiştiğinde otomatik güncelle (eğer kullanıcı manuel seçim yapmamışsa)
if (prefersDarkScheme && prefersDarkScheme.addEventListener) {
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
        }
    });
}

// Sepet yönetimi
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartModal = document.getElementById('cartModal');
let closeModal = document.querySelector('.close');
let cartButton = document.getElementById('cartButton');
let cartCount = document.getElementById('cartCount');

// Sayfa yüklendiğinde sepeti ve temayı güncelle
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateCartBadge();
});

// Hamburger menü
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Hamburger animasyonu
        const spans = hamburger.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
        }
    });
}

// Navigasyon linkleri tıklandığında menüyü kapat
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        if (hamburger) {
            const spans = hamburger.querySelectorAll('span');
            if (spans.length >= 3) {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        }
    });
});

// Smooth scroll navigasyon
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Sepete ürün ekleme
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const product = this.dataset.product;
        const price = parseFloat(this.dataset.price);
        const productNameElement = this.parentElement.querySelector('h3');
        const productName = productNameElement ? productNameElement.textContent : 'Ürün';
        const quantityInput = this.parentElement.querySelector('.quantity-input');
        const quantity = quantityInput ? parseFloat(quantityInput.value) : 1;
        
        // Miktar kontrolü ve yuvarlama
        if (isNaN(quantity) || quantity < 1) {
            showNotification('Minimum sipariş miktarı 1 kg olmalıdır!', 'warning');
            quantityInput.value = '1.0';
            return;
        }
        if (quantity > 5) {
            showNotification('Maksimum sipariş miktarı 5 kg olabilir!', 'warning');
            quantityInput.value = '5.0';
            return;
        }
        
        // 0.1 kg'ın katlarına yuvarla
        quantity = Math.round(quantity * 10) / 10;
        quantityInput.value = quantity.toFixed(1);
        
        const existingItem = cart.find(item => item.product === product);
        
        if (existingItem) {
            // Toplam miktar kontrolü
            const totalQuantity = existingItem.quantity + quantity;
            if (totalQuantity > 5) {
                showNotification(`Maksimum 5 kg ekleyebilirsiniz! Sepette zaten ${existingItem.quantity} kg var.`, 'warning');
                return;
            }
            existingItem.quantity = totalQuantity;
        } else {
            cart.push({
                product: product,
                name: productName,
                price: price,
                quantity: quantity
            });
        }
        
        // Sepeti localStorage'a kaydet
        localStorage.setItem('cart', JSON.stringify(cart));
        
        updateCartBadge();
        showNotification(`${quantity} kg ${productName} sepete eklendi!`);
        
        // Buton animasyonu
        this.innerHTML = '<span>✓ Eklendi</span>';
        this.style.background = '#28a745';
        setTimeout(() => {
            this.innerHTML = '<span>Sepete Ekle</span>';
            this.style.background = '';
            quantityInput.value = 1; // Miktarı sıfırla
        }, 1500);
    });
});

// Miktar değiştirme fonksiyonu
function changeQuantity(productId, change) {
    const input = document.getElementById(`qty-${productId}`);
    let currentValue = parseFloat(input.value);
    let newValue = Math.round((currentValue + change) * 10) / 10; // Yuvarlama için
    
    if (newValue < 1) {
        showNotification('Minimum sipariş miktarı 1 kg olmalıdır!', 'warning');
    } else if (newValue > 5) {
        showNotification('Maksimum sipariş miktarı 5 kg olabilir!', 'warning');
    } else {
        input.value = newValue.toFixed(1);
    }
}

// Input validasyonu
function validateInput(productId) {
    const input = document.getElementById(`qty-${productId}`);
    let value = parseFloat(input.value);
    
    if (isNaN(value) || value < 1) {
        input.value = '1.0';
        showNotification('Minimum sipariş miktarı 1 kg olmalıdır!', 'warning');
    } else if (value > 5) {
        input.value = '5.0';
        showNotification('Maksimum sipariş miktarı 5 kg olabilir!', 'warning');
    } else {
        // 0.1 kg'ın katlarına yuvarla
        const rounded = Math.round(value * 10) / 10;
        input.value = rounded.toFixed(1);
        if (Math.abs(value - rounded) > 0.01) {
            showNotification(`Miktar ${rounded} kg'a yuvarlandı (100 gram katları)`, 'warning');
        }
    }
}

// Sepet sayısını güncelle
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Sepet butonuna tıklayınca modalı aç
if (cartButton) {
    cartButton.addEventListener('click', (e) => {
        e.preventDefault();
        displayCart();
        cartModal.style.display = 'block';
    });
}

// Modal kapat
if (closeModal) {
    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
}

// Modal dışına tıklandığında kapat
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// Sepet içeriğini göster
function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Sepetiniz boş</p>';
        totalPrice.textContent = '₺0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₺${item.price.toFixed(2)} / kg</div>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${index}, -0.1)" class="cart-qty-btn">-</button>
                    <span class="cart-qty-display">${item.quantity} kg</span>
                    <button onclick="updateQuantity(${index}, 0.1)" class="cart-qty-btn">+</button>
                    <button onclick="removeFromCart(${index})" class="cart-remove-btn">Sil</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    totalPrice.textContent = `₺${total.toFixed(2)}`;
}

// Sepet miktarını güncelle
function updateQuantity(index, change) {
    const newQuantity = Math.round((cart[index].quantity + change) * 10) / 10; // Yuvarlama için
    
    // Minimum 1kg, maksimum 5kg kontrolü
    if (newQuantity < 1) {
        showNotification('Minimum sipariş miktarı 1 kg olmalıdır!', 'warning');
        return;
    } else if (newQuantity > 5) {
        showNotification('Maksimum sipariş miktarı 5 kg olabilir!', 'warning');
        return;
    }
    
    cart[index].quantity = newQuantity;
    
    // Sepeti localStorage'a kaydet
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartBadge();
    displayCart();
}

// Sepetten ürün sil
function removeFromCart(index) {
    cart.splice(index, 1);
    
    // Sepeti localStorage'a kaydet
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartBadge();
    displayCart();
}

// Bildirim göster
function showNotification(message, type = 'success') {
    // Aynı mesajla aktif bildirim var mı kontrol et
    const existingNotifications = document.querySelectorAll('.notification');
    for (let notif of existingNotifications) {
        if (notif.textContent === message) {
            return; // Aynı mesaj zaten gösteriliyor, yeni bildirim oluşturma
        }
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Uyarı tipine göre renk ayarla
    const bgColor = type === 'warning' ? '#f0ad4e' : '#28a745';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Animasyon stilleri ekle
const style = document.createElement('style');
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

// WhatsApp'a yönlendir
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert('Sepetiniz boş!');
        return;
    }
    
    // Rastgele sipariş numarası oluştur
    const orderNumber = 'SIP' + Date.now().toString().slice(-8);
    
    // Sepet içeriğini mesaj olarak hazırla
    let message = '--- İSTANBUL TAZE İSTAVRİT ---\n';
    message += `SİPARİŞ NO: ${orderNumber}\n`;
    message += '================================\n\n';
    message += 'SİPARİŞ DETAYLARI:\n';
    message += '--------------------------------\n';
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `\n${index + 1}. ${item.name}\n`;
        message += `   Miktar: ${item.quantity} kg\n`;
        message += `   Birim: ${item.price} TL/kg\n`;
        message += `   Ara Toplam: ${itemTotal.toFixed(2)} TL\n`;
    });
    
    message += '\n================================\n';
    message += `GENEL TOPLAM: ${total.toFixed(2)} TL\n`;
    message += '================================\n\n';
    message += 'TESLİMAT BİLGİLERİ:\n';
    message += '--------------------------------\n';
    message += 'Adres: \n';
    message += 'Telefon: \n';
    message += 'Teslimat Saati: \n';
    message += 'Not: \n\n';
    message += '(Lütfen teslimat bilgilerinizi yazınız)';
    
    // WhatsApp'a yönlendir
    const phoneNumber = '905399834953'; // İletişim bölümündeki numara
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Sepeti temizle
    cart = [];
    localStorage.removeItem('cart');
    updateCartBadge();
    displayCart();
    cartModal.style.display = 'none';
}

// İletişim formu
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Form verilerini al
        const formData = new FormData(e.target);
        
        // Bildirim göster
        showNotification('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
        
        // Formu temizle
        e.target.reset();
    });
}

// Hero CTA butonu
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const urunlerSection = document.querySelector('#urunler');
        if (urunlerSection) {
            urunlerSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
}

// Scroll animasyonları
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Animasyon eklenecek elementleri gözlemle
document.querySelectorAll('.feature-card, .product-card, .stat').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Navbar scroll efekti
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Loading animasyonu
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
});
