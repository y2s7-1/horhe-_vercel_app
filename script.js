// ============================================
// MOBILE NAVIGATION
// ============================================

const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-container') && !e.target.closest('.mobile-nav')) {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
    }
});

// ============================================
// CART FUNCTIONALITY
// ============================================

class Cart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCounter();
    }

    loadCart() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            this.items.push({ ...item, quantity: item.quantity || 1 });
        }
        this.saveCart();
        this.updateCartCounter();
        this.showNotification('Товар добавлен в корзину');
    }

    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
        this.saveCart();
        this.updateCartCounter();
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCounter();
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateCartCounter() {
        const counter = document.getElementById('cartCounter');
        const total = this.items.reduce((sum, item) => sum + item.quantity, 0);
        counter.textContent = total;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

const cart = new Cart();

// Cart icon click handler
document.getElementById('cartIcon').addEventListener('click', () => {
    if (cart.items.length === 0) {
        cart.showNotification('Корзина пуста');
    } else {
        showCartModal();
    }
});

function showCartModal() {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <button class="cart-modal-close" aria-label="Закрыть">&times;</button>
            <h2>Ваша корзина</h2>
            <div class="cart-items">
                ${cart.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>Количество: ${item.quantity}</p>
                            <p class="cart-item-price">${(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}">Удалить</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-total">
                <p>Итого: <strong>${cart.getTotal().toLocaleString('ru-RU')} ₽</strong></p>
            </div>
            <button class="cart-checkout-btn">ОФОРМИТЬ ЗАКАЗ</button>
            <button class="cart-clear-btn">ОЧИСТИТЬ КОРЗИНУ</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal
    const closeBtn = modal.querySelector('.cart-modal-close');
    closeBtn.addEventListener('click', () => modal.remove());

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Remove item
    modal.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.id;
            cart.removeItem(itemId);
            modal.remove();
            showCartModal();
        });
    });

    // Clear cart
    modal.querySelector('.cart-clear-btn').addEventListener('click', () => {
        cart.clearCart();
        modal.remove();
        cart.showNotification('Корзина очищена');
    });

    // Checkout
    modal.querySelector('.cart-checkout-btn').addEventListener('click', () => {
        showCheckoutForm();
        modal.remove();
    });
}

function showCheckoutForm() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="checkout-modal-content">
            <button class="checkout-modal-close" aria-label="Закрыть">&times;</button>
            <h2>ОФОРМЛЕНИЕ ЗАКАЗА</h2>
            <form class="checkout-form">
                <div class="form-group">
                    <label for="name">Имя *</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="phone">Телефон *</label>
                    <input type="tel" id="phone" name="phone" required>
                </div>
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="address">Адрес доставки *</label>
                    <textarea id="address" name="address" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="message">Комментарий</label>
                    <textarea id="message" name="message" rows="2"></textarea>
                </div>
                <div class="checkout-total">
                    <p>Итого: <strong>${cart.getTotal().toLocaleString('ru-RU')} ₽</strong></p>
                </div>
                <button type="submit" class="checkout-submit-btn">ОТПРАВИТЬ ЗАКАЗ</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.checkout-modal-close');
    closeBtn.addEventListener('click', () => modal.remove());

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    const form = modal.querySelector('.checkout-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCheckoutSubmit(form);
        modal.remove();
    });
}

function handleCheckoutSubmit(form) {
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        message: formData.get('message'),
        items: cart.items,
        total: cart.getTotal(),
        timestamp: new Date().toISOString()
    };

    // Here you would typically send the data to a server
    console.log('Order data:', data);

    // Save order locally
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(data);
    localStorage.setItem('orders', JSON.stringify(orders));

    cart.clearCart();
    cart.showNotification('Спасибо! Совсем скоро мы с вами свяжемся!');
}

// ============================================
// COOKIE BANNER
// ============================================

function initCookieBanner() {
    const cookieBanner = document.getElementById('cookieBanner');
    const cookieBtn = document.getElementById('cookieBtn');

    // Check if user has already accepted cookies
    if (!localStorage.getItem('cookieAccepted')) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1000);
    }

    cookieBtn.addEventListener('click', () => {
        localStorage.setItem('cookieAccepted', 'true');
        cookieBanner.classList.remove('show');
    });
}

// ============================================
// SMOOTH SCROLL AND ACTIVE LINK HIGHLIGHTING
// ============================================

function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-list a, .mobile-nav-list a');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.jewelry-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(item);
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initCookieBanner();
    initIntersectionObserver();
    updateActiveLink();
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format price
function formatPrice(price) {
    return price.toLocaleString('ru-RU');
}

// Get URL parameter
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Add CSS dynamically
function addStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// Add notification styles
addStyle(`
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #000000;
        color: #ffffff;
        padding: 15px 25px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease-in-out;
    }

    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }

    .cart-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 20px;
    }

    .cart-modal-content {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 30px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }

    .cart-modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #000000;
    }

    .cart-modal-content h2 {
        font-size: 24px;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .cart-items {
        margin-bottom: 20px;
    }

    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #e8e2d6;
    }

    .cart-item-info h4 {
        font-size: 16px;
        margin-bottom: 5px;
    }

    .cart-item-info p {
        font-size: 13px;
        color: #666666;
    }

    .cart-item-price {
        font-weight: 600;
        font-size: 14px;
        margin-top: 5px;
    }

    .cart-item-remove {
        background-color: #f5f1e8;
        border: 1px solid #e8e2d6;
        padding: 8px 15px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
    }

    .cart-item-remove:hover {
        background-color: #e8e2d6;
    }

    .cart-total {
        padding: 15px 0;
        border-top: 2px solid #e8e2d6;
        border-bottom: 2px solid #e8e2d6;
        margin-bottom: 20px;
        font-size: 16px;
    }

    .cart-total strong {
        font-size: 18px;
    }

    .cart-checkout-btn,
    .cart-clear-btn {
        width: 100%;
        padding: 12px;
        margin-bottom: 10px;
        border-radius: 8px;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 14px;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
    }

    .cart-checkout-btn {
        background-color: #000000;
        color: #ffffff;
        border: 2px solid #000000;
    }

    .cart-checkout-btn:hover {
        background-color: #ffffff;
        color: #000000;
    }

    .cart-clear-btn {
        background-color: transparent;
        color: #000000;
        border: 2px solid #000000;
    }

    .cart-clear-btn:hover {
        background-color: #f5f1e8;
    }

    .checkout-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 20px;
    }

    .checkout-modal-content {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 30px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }

    .checkout-modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #000000;
    }

    .checkout-modal-content h2 {
        font-size: 24px;
        margin-bottom: 25px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #e8e2d6;
        border-radius: 4px;
        font-family: inherit;
        font-size: 14px;
        transition: border-color 0.3s ease-in-out;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #000000;
    }

    .checkout-total {
        padding: 15px 0;
        border-top: 2px solid #e8e2d6;
        border-bottom: 2px solid #e8e2d6;
        margin: 20px 0;
        font-size: 16px;
    }

    .checkout-total strong {
        font-size: 18px;
    }

    .checkout-submit-btn {
        width: 100%;
        padding: 12px;
        background-color: #000000;
        color: #ffffff;
        border: 2px solid #000000;
        border-radius: 8px;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 14px;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
    }

    .checkout-submit-btn:hover {
        background-color: #ffffff;
        color: #000000;
    }

    .nav-list a.active {
        opacity: 0.7;
    }

    @media (max-width: 480px) {
        .cart-modal-content,
        .checkout-modal-content {
            padding: 20px;
        }

        .cart-modal-content h2,
        .checkout-modal-content h2 {
            font-size: 18px;
        }

        .cart-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }

        .cart-item-remove {
            align-self: flex-end;
        }

        .notification {
            right: 10px;
            left: 10px;
        }
    }
`);
