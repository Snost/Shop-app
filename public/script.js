let selectedProducts = [];
let allProducts = [];

// 🟢 Завантажити каталог товарів
function loadProducts() {
    fetch('/products')
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            renderProductTable();
        })
        .catch(error => console.error('Помилка завантаження товарів:', error));
}

// 🟢 Завантажити вибір товарів
function loadSelectedProducts() {
    fetch('/selected-products')
        .then(response => response.json())
        .then(data => {
            selectedProducts = data;
            renderSelectedProducts();
        })
        .catch(error => console.error('Помилка завантаження вибору:', error));
}

// 🔴 Зберегти вибір на сервері
function saveSelection() {
    fetch('/selected-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProducts)
    }).catch(error => console.error('Помилка збереження вибору:', error));
}

// 🔄 Відобразити каталог товарів
function renderProductTable() {
    let list = document.getElementById('product-list'); // Оновлено id
    list.innerHTML = '';
    allProducts.forEach((product, index) => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td><button onclick='addToSelection(${index})'>➕</button></td>
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>1</td>
            <td>${product.price.toFixed(2)}</td>
            <td><button onclick='deleteProduct(${index})'>🗑</button></td>
        `;
        list.appendChild(row);
    });
}

// ➕ Додати товар у вибір
function addToSelection(index) {
    let product = allProducts[index];
    let existing = selectedProducts.find(p => p.code === product.code);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        selectedProducts.push({ ...product, quantity: 1 });
    }

    saveSelection();
    renderSelectedProducts();
}

// 🔄 Відобразити вибрані товари
function renderSelectedProducts() {
    let list = document.getElementById('selected-list');
    list.innerHTML = '';
    selectedProducts.forEach((product, index) => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td><input type='number' value='${product.quantity}' min='1' onchange='updateProductQuantity(${index}, this.value)'></td>
            <td>${product.price.toFixed(2)}</td>
            <td>
                <button onclick='deleteProduct(${index})'>🗑 Видалити</button>
            </td>
        `;
        list.appendChild(row);
    });
}

// 🗑 Видалити товар
function deleteProduct(index) {
    selectedProducts.splice(index, 1);
    saveSelection();
    renderSelectedProducts();
}

// 📦 Завантажити дані при старті
window.onload = function () {
    console.log('🚀 Завантаження сторінки...');
    loadProducts();
    loadSelectedProducts();
    setInterval(loadSelectedProducts, 5000);
};
