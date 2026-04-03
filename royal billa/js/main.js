// ==========================================
// STATE MANAGEMENT
// ==========================================
let cart = {};
let currentCategory = 'all';

// ==========================================
// DOM ELEMENTS (initialized in DOMContentLoaded)
// ==========================================
let menuGrid, cartSidebar, cartOverlay, cartItems, cartFooter, emptyCart, grandTotal, cartBadge, cartToggle, closeCart, placeOrderBtn, orderModal, closeModal, orderForm, orderSummaryItems, orderTotal, loadingOverlay, toastContainer, categoryBtns, successOverlay, confettiCanvas;

// ==========================================
// RENDER MENU
// ==========================================
function renderMenu(category = 'all') {
    if (!menuGrid) return;
    
    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);
    
    menuGrid.innerHTML = filteredItems.map(item => `
        <div class="menu-card bg-white rounded-2xl shadow-md overflow-hidden ${cart[item.id] > 0 ? 'selected' : ''}" data-id="${item.id}">
            <div class="image-container h-44 overflow-hidden relative">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
                <div class="absolute top-3 left-3">
                    <span class="${item.type === 'veg' ? 'veg-badge' : 'non-veg-badge'} text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span class="w-2 h-2 bg-white rounded-full"></span>
                        ${item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                    </span>
                </div>
                ${cart[item.id] > 0 ? `
                    <div class="absolute top-3 right-3 bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cart-badge">
                        ${cart[item.id]}
                    </div>
                ` : ''}
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-800 text-lg leading-tight">${item.name}</h3>
                    <span class="price-tag text-white font-bold px-3 py-1 rounded-full text-sm whitespace-nowrap">₹${item.price}</span>
                </div>
                <p class="text-gray-500 text-sm mb-4 line-clamp-2">${item.description}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-400">${getCategoryLabel(item.category)}</span>
                    <div class="flex items-center gap-2">
                        <button class="quantity-btn w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-lg text-gray-600" onclick="decreaseQuantity(${item.id})">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="w-8 text-center font-bold text-gray-800">${cart[item.id] || 0}</span>
                        <button class="quantity-btn w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-lg text-gray-600" onclick="increaseQuantity(${item.id})">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryLabel(category) {
    const labels = {
        starters: 'Starter',
        mains: 'Main Course',
        biryani: 'Biryani',
        breads: 'Bread',
        desserts: 'Dessert',
        drinks: 'Drink'
    };
    return labels[category] || category;
}

// ==========================================
// QUANTITY CONTROLS
// ==========================================
function increaseQuantity(id) {
    cart[id] = (cart[id] || 0) + 1;
    updateUI();
}

function decreaseQuantity(id) {
    if (cart[id] > 0) {
        cart[id]--;
        if (cart[id] === 0) {
            delete cart[id];
        }
        updateUI();
    }
}

function updateUI() {
    renderMenu(currentCategory);
    renderCart();
    updateCartBadge();
}

// ==========================================
// CART RENDERING
// ==========================================
function renderCart() {
    if (!cartItems || !cartFooter || !emptyCart || !grandTotal) return;
    
    const items = Object.keys(cart).map(id => {
        const item = menuItems.find(m => m.id === parseInt(id));
        return { ...item, quantity: cart[id] };
    }).filter(item => item.quantity > 0);

    if (items.length === 0) {
        emptyCart.classList.remove('hidden');
        cartFooter.classList.add('hidden');
        cartItems.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i class="fas fa-shopping-basket text-6xl mb-4"></i>
                <p class="text-lg">Your cart is empty</p>
                <p class="text-sm">Add some delicious items!</p>
            </div>
        `;
        return;
    }

    emptyCart.classList.add('hidden');
    cartFooter.classList.remove('hidden');

    cartItems.innerHTML = items.map(item => `
        <div class="cart-item bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'">
            <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-800 text-sm truncate">${item.name}</h4>
                <p class="text-xs text-gray-500">₹${item.price} each</p>
                <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center gap-2">
                        <button class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all" onclick="decreaseQuantity(${item.id})">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="font-bold text-sm w-6 text-center">${item.quantity}</span>
                        <button class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all" onclick="increaseQuantity(${item.id})">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                    <span class="font-bold text-primary-600">₹${item.price * item.quantity}</span>
                </div>
            </div>
        </div>
    `).join('');

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    grandTotal.textContent = `₹${total}`;
}

function updateCartBadge() {
    if (!cartBadge) return;
    
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    cartBadge.textContent = totalItems;
    if (totalItems > 0) {
        cartBadge.classList.remove('hidden');
        cartBadge.classList.add('flex');
    } else {
        cartBadge.classList.add('hidden');
        cartBadge.classList.remove('flex');
    }
}

// ==========================================
// CART SIDEBAR TOGGLE
// ==========================================
function openCart() {
    cartSidebar.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
    cartSidebar.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// ==========================================
// ORDER MODAL
// ==========================================
function openOrderModal() {
    const items = Object.keys(cart).map(id => {
        const item = menuItems.find(m => m.id === parseInt(id));
        return { ...item, quantity: cart[id] };
    }).filter(item => item.quantity > 0);

    if (items.length === 0) {
        showToast('Please add items to your cart first!', 'error');
        return;
    }

    orderSummaryItems.innerHTML = items.map(item => `
        <div class="flex justify-between text-sm">
            <span class="text-gray-600">${item.name} x${item.quantity}</span>
            <span class="font-medium">₹${item.price * item.quantity}</span>
        </div>
    `).join('');

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = `₹${total}`;

    orderModal.classList.remove('hidden');
    orderModal.classList.add('flex');
    closeCartSidebar();
}

// ==========================================
// ORDER SUBMISSION
// ==========================================
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value.trim();
    const tableNumber = document.getElementById('tableNumber').value.trim();
    
    if (!customerName) {
        showToast('Please enter your name!', 'error');
        return;
    }
    
    if (!tableNumber) {
        showToast('Please enter your table number!', 'error');
        return;
    }

    const items = Object.keys(cart).map(id => {
        const item = menuItems.find(m => m.id === parseInt(id));
        return {
            name: item.name,
            quantity: cart[id],
            price: item.price,
            subtotal: item.price * cart[id]
        };
    });

    const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    const orderData = {
        customerName,
        tableNumber,
        items,
        totalPrice,
        timestamp: new Date().toISOString()
    };

    loadingOverlay.classList.remove('hidden');
    loadingOverlay.classList.add('flex');

    try {
        await submitOrder(orderData);
        
        cart = {};
        updateUI();
        orderForm.reset();
        orderModal.classList.add('hidden');
        orderModal.classList.remove('flex');
        
        loadingOverlay.classList.add('hidden');
        loadingOverlay.classList.remove('flex');
        
        showSuccessAnimation();
    } catch (error) {
        console.error('Order submission error:', error);
        loadingOverlay.classList.add('hidden');
        loadingOverlay.classList.remove('flex');
        showToast('Failed to place order. Please try again.', 'error');
    }
}

async function submitOrder(orderData) {
    const encodedTableName = encodeURIComponent(AIRTABLE_CONFIG.tableName);
    const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${encodedTableName}`;
    
    const itemsFormatted = orderData.items.map(item => 
        `${item.name} x${item.quantity}`
    ).join(', ');
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            records: [{
                fields: {
                    'Customer Name': orderData.customerName,
                    'Table Number': orderData.tableNumber,
                    'Items': itemsFormatted,
                    'Total Price': orderData.totalPrice,
                    'Order Time': new Date().toLocaleString()
                }
            }]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Airtable API error:', error);
        throw new Error(error.error?.message || `HTTP ${response.status}: Failed to submit order`);
    }

    const result = await response.json();
    return result;
}

// ==========================================
// SUCCESS ANIMATION
// ==========================================
// SUCCESS ANIMATION
// ==========================================
function showSuccessAnimation() {
    successOverlay.classList.remove('hidden');
    successOverlay.classList.add('flex');
    
    startConfetti();
    
    setTimeout(() => {
        successOverlay.classList.add('hidden');
        successOverlay.classList.remove('flex');
        stopConfetti();
    }, 3000);
}

let confettiAnimationId = null;
let confettiPieces = [];

function startConfetti() {
    if (!confettiCanvas) return;
    
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    confettiPieces = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ff9900', '#9900ff'];
    
    for (let i = 0; i < 150; i++) {
        confettiPieces.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: Math.random() * 0.2 - 0.1,
            drift: Math.random() * 2 - 1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        confettiPieces.forEach(p => {
            p.y += p.speed;
            p.x += p.drift;
            p.angle += p.spin;
            
            if (p.y > confettiCanvas.height) {
                p.y = -10;
                p.x = Math.random() * confettiCanvas.width;
            }
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        
        confettiAnimationId = requestAnimationFrame(animate);
    }
    
    animate();
}

function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    confettiPieces = [];
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${
        type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
    }`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span class="font-medium">${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==========================================
// INITIALIZE ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements after DOM is ready
    menuGrid = document.getElementById('menuGrid');
    cartSidebar = document.getElementById('cartSidebar');
    cartOverlay = document.getElementById('cartOverlay');
    cartItems = document.getElementById('cartItems');
    cartFooter = document.getElementById('cartFooter');
    emptyCart = document.getElementById('emptyCart');
    grandTotal = document.getElementById('grandTotal');
    cartBadge = document.getElementById('cartBadge');
    cartToggle = document.getElementById('cartToggle');
    closeCart = document.getElementById('closeCart');
    placeOrderBtn = document.getElementById('placeOrderBtn');
    orderModal = document.getElementById('orderModal');
    closeModal = document.getElementById('closeModal');
    orderForm = document.getElementById('orderForm');
    orderSummaryItems = document.getElementById('orderSummaryItems');
    orderTotal = document.getElementById('orderTotal');
    loadingOverlay = document.getElementById('loadingOverlay');
    toastContainer = document.getElementById('toastContainer');
    categoryBtns = document.querySelectorAll('.category-btn');
    successOverlay = document.getElementById('successOverlay');
    confettiCanvas = document.getElementById('confettiCanvas');

    // Setup event listeners
    cartToggle.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => {
                b.classList.remove('bg-primary-500', 'text-white');
                b.classList.add('bg-white', 'text-gray-600');
            });
            btn.classList.remove('bg-white', 'text-gray-600');
            btn.classList.add('bg-primary-500', 'text-white');
            currentCategory = btn.dataset.category;
            renderMenu(currentCategory);
        });
    });

    placeOrderBtn.addEventListener('click', openOrderModal);

    closeModal.addEventListener('click', () => {
        orderModal.classList.add('hidden');
        orderModal.classList.remove('flex');
    });

    orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.classList.add('hidden');
            orderModal.classList.remove('flex');
        }
    });

    orderForm.addEventListener('submit', handleOrderSubmit);

    // Initial render
    renderMenu();
    renderCart();
    updateCartBadge();
});

// Make functions available globally for onclick handlers
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
