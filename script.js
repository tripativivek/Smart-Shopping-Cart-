document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const budgetInput = document.getElementById('budget');
    const setBudgetBtn = document.getElementById('set-budget');
    const totalBudgetSpan = document.getElementById('total-budget');
    const spentAmountSpan = document.getElementById('spent-amount');
    const remainingAmountSpan = document.getElementById('remaining-amount');
    const meterFill = document.getElementById('meter-fill');
    const budgetPercentage = document.getElementById('budget-percentage');
    
    const itemCategorySelect = document.getElementById('item-category');
    const itemNameInput = document.getElementById('item-name');
    const itemPriceInput = document.getElementById('item-price');
    const itemQuantityInput = document.getElementById('item-quantity');
    const decreaseQtyBtn = document.getElementById('decrease-qty');
    const increaseQtyBtn = document.getElementById('increase-qty');
    const addItemBtn = document.getElementById('add-item');
    
    const cartList = document.getElementById('cart-list');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const budgetAlert = document.getElementById('budget-alert');
    
    const saveCartBtn = document.getElementById('save-cart');
    const loadCartBtn = document.getElementById('load-cart');
    const clearCartBtn = document.getElementById('clear-cart');
    
    const themeButton = document.getElementById('theme-button');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    // State variables
    let budget = 0;
    let cartItems = [];
    let isDarkTheme = false;
    
    // Initialize
    initApp();
    
    function initApp() {
        // Check for saved theme
        if (localStorage.getItem('darkTheme') === 'true') {
            toggleTheme();
        }
        
        // Check for saved cart
        if (localStorage.getItem('savedCart')) {
            loadCartBtn.disabled = false;
        } else {
            loadCartBtn.disabled = true;
        }
        
        // Check for saved budget
        const savedBudget = localStorage.getItem('budget');
        if (savedBudget) {
            budget = parseFloat(savedBudget);
            totalBudgetSpan.textContent = `$${budget.toFixed(2)}`;
            updateBudgetDisplay();
        }
    }
    
    // Set Budget
    setBudgetBtn.addEventListener('click', function() {
        const budgetValue = parseFloat(budgetInput.value);
        if (isNaN(budgetValue) || budgetValue <= 0) {
            showNotification('Please enter a valid budget amount', 'error');
            return;
        }
        
        budget = budgetValue;
        totalBudgetSpan.textContent = `$${budget.toFixed(2)}`;
        localStorage.setItem('budget', budget);
        updateBudgetDisplay();
        showNotification('Budget set successfully!', 'success');
    });
    
    // Quantity Controls
    decreaseQtyBtn.addEventListener('click', function() {
        let qty = parseInt(itemQuantityInput.value);
        if (qty > 1) {
            itemQuantityInput.value = qty - 1;
        }
    });
    
    increaseQtyBtn.addEventListener('click', function() {
        let qty = parseInt(itemQuantityInput.value);
        itemQuantityInput.value = qty + 1;
    });
    
    // Add Item to Cart
    addItemBtn.addEventListener('click', function() {
        const category = itemCategorySelect.value;
        const name = itemNameInput.value.trim();
        const price = parseFloat(itemPriceInput.value);
        const quantity = parseInt(itemQuantityInput.value);
        
        if (name === '' || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            showNotification('Please enter valid item details', 'error');
            return;
        }
        
        addItemToCart(category, name, price, quantity);
        
        // Clear inputs
        itemNameInput.value = '';
        itemPriceInput.value = '';
        itemQuantityInput.value = '1';
        itemNameInput.focus();
        
        showNotification('Item added to cart!', 'success');
    });
    
    // Add item to cart function
    function addItemToCart(category, name, price, quantity) {
        const item = {
            id: Date.now(),
            category,
            name,
            price,
            quantity,
            total: price * quantity
        };
        
        cartItems.push(item);
        renderCartItem(item);
        updateCartTotal();
        updateBudgetDisplay();
    }
    
    // Render cart item
    function renderCartItem(item) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.dataset.id = item.id;
        
        div.innerHTML = `
            <div class="item-category">
                <span class="category-${item.category}">${capitalizeFirstLetter(item.category)}</span>
            </div>
            <div class="item-name">${item.name}</div>
            <div class="item-price">$${item.price.toFixed(2)}</div>
            <div class="item-qty">${item.quantity}</div>
            <div class="item-total">$${item.total.toFixed(2)}</div>
            <div class="item-actions">
                <button class="action-btn edit-btn" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartList.appendChild(div);
        
        // Add event listeners to buttons
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            removeItemFromCart(item.id);
        });
        
        const editBtn = div.querySelector('.edit-btn');
        editBtn.addEventListener('click', function() {
            editCartItem(item.id);
        });
    }
    
    // Remove item from cart
    function removeItemFromCart(id) {
        cartItems = cartItems.filter(item => item.id !== id);
        const element = document.querySelector(`.cart-item[data-id="${id}"]`);
        
        if (element) {
            element.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                element.remove();
                updateCartTotal();
                updateBudgetDisplay();
                showNotification('Item removed from cart', 'info');
            }, 300);
        }
    }
    
    // Edit cart item
    function editCartItem(id) {
        const item = cartItems.find(item => item.id === id);
        
        if (item) {
            itemCategorySelect.value = item.category;
            itemNameInput.value = item.name;
            itemPriceInput.value = item.price;
            itemQuantityInput.value = item.quantity;
            
            // Remove the item from cart
            removeItemFromCart(id);
            
            // Focus on the name input for better UX
            itemNameInput.focus();
            
            showNotification('Edit item details and add again', 'info');
        }
    }
    
    // Update cart total
    function updateCartTotal() {
        const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTotal.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    // Update budget display
    function updateBudgetDisplay() {
        const spent = cartItems.reduce((sum, item) => sum + item.total, 0);
        const remaining = budget - spent;
        
        spentAmountSpan.textContent = `$${spent.toFixed(2)}`;
        remainingAmountSpan.textContent = `$${remaining.toFixed(2)}`;
        
        // Update meter
        if (budget > 0) {
            const percentage = (spent / budget) * 100;
            const clampedPercentage = Math.min(percentage, 100);
            
            meterFill.style.height = `${clampedPercentage}%`;
            budgetPercentage.textContent = `${Math.round(clampedPercentage)}%`;
            
            // Change color based on percentage
            if (percentage >= 100) {
                meterFill.style.backgroundColor = 'var(--danger-color)';
                budgetAlert.classList.remove('hidden');
                remainingAmountSpan.style.color = 'var(--danger-color)';
            } else if (percentage >= 75) {
                meterFill.style.backgroundColor = 'var(--warning-color)';
                budgetAlert.classList.add('hidden');
                remainingAmountSpan.style.color = 'var(--warning-color)';
            } else {
                meterFill.style.backgroundColor = 'var(--success-color)';
                budgetAlert.classList.add('hidden');
                remainingAmountSpan.style.color = 'var(--success-color)';
            }
        }
    }
    
    // Save cart
    saveCartBtn.addEventListener('click', function() {
        if (cartItems.length === 0) {
            showNotification('Cart is empty, nothing to save', 'error');
            return;
        }
        
        localStorage.setItem('savedCart', JSON.stringify(cartItems));
        loadCartBtn.disabled = false;
        showNotification('Cart saved successfully!', 'success');
    });
    
    // Load cart
    loadCartBtn.addEventListener('click', function() {
        const savedCart = localStorage.getItem('savedCart');
        
        if (savedCart) {
            // Clear current cart
            cartItems = [];
            cartList.innerHTML = '';
            
            // Load saved cart
            const loadedItems = JSON.parse(savedCart);
            loadedItems.forEach(item => {
                cartItems.push(item);
                renderCartItem(item);
            });
            
            updateCartTotal();
            updateBudgetDisplay();
            showNotification('Cart loaded successfully!', 'success');
        }
    });
    
    // Clear cart
    clearCartBtn.addEventListener('click', function() {
        if (cartItems.length === 0) {
            showNotification('Cart is already empty', 'info');
            return;
        }
        
        cartItems = [];
        cartList.innerHTML = '';
        updateCartTotal();
        updateBudgetDisplay();
        showNotification('Cart cleared successfully!', 'info');
    });
    
    // Toggle theme
    themeButton.addEventListener('click', toggleTheme);
    
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('dark-theme', isDarkTheme);
        themeButton.innerHTML = isDarkTheme ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkTheme', isDarkTheme);
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        notificationMessage.textContent = message;
        
        // Set color based on type
        if (type === 'success') {
            notification.style.backgroundColor = 'var(--success-color)';
        } else if (type === 'error') {
            notification.style.backgroundColor = 'var(--danger-color)';
        } else if (type === 'warning') {
            notification.style.backgroundColor = 'var(--warning-color)';
            notification.style.color = '#333';
        } else {
            notification.style.backgroundColor = 'var(--primary-color)';
        }
        
        notification.classList.remove('hidden');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Enter key functionality
    itemPriceInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            addItemBtn.click();
        }
    });
    
    budgetInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            setBudgetBtn.click();
        }
    });
    
    // Add CSS animation for removing items
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
});