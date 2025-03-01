let selectedProducts = [];

// Отримання вибраних товарів з сервера при завантаженні сторінки
function loadSelectedProducts() {
    fetch('/selected-products')
        .then(response => response.json())
        .then(data => {
            selectedProducts = data;
            renderSelectedProducts();
        })
        .catch(error => console.error('Помилка завантаження вибраних товарів:', error));
}

// Відображення вибраних товарів
function renderSelectedProducts() {
    let list = document.getElementById('product-list');
    list.innerHTML = '';
    selectedProducts.forEach((product, index) => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td><input type='checkbox' class='select-product' data-index='${index}' checked></td>
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td><input type='number' class='product-qty' value='${product.quantity}' min='1' onchange='updateProductQuantity(${index}, this.value)'></td>
            <td>${product.price.toFixed(2)}</td>
            <td>
                <button onclick='editProduct(${index})'>Редагувати</button>
                <button onclick='deleteProduct(${index})'>Видалити</button>
            </td>
        `;
        list.appendChild(row);
    });
}

// Додавання товару до вибору
function addProduct() {
    let code = prompt('Введіть код товару:');
    let name = prompt('Введіть назву товару:');
    let price = parseFloat(prompt('Введіть ціну товару:'));
    let quantity = parseInt(prompt('Введіть кількість товару:'));

    if (code && name && !isNaN(price) && !isNaN(quantity)) {
        // Відправка на сервер для збереження
        fetch('/selected-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, name, price, quantity })
        })
        .then(response => response.json())
        .then(data => {
            selectedProducts.push(data);
            renderSelectedProducts();
        })
        .catch(error => console.error('Помилка додавання товару:', error));
    } else {
        alert('Некоректні дані!');
    }
}

// Оновлення кількості вибраного товару
function updateProductQuantity(index, quantity) {
    let product = selectedProducts[index];
    product.quantity = parseInt(quantity);
    
    // Оновлення на сервері
    fetch(`/selected-products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: product.quantity })
    })
    .catch(error => console.error('Помилка оновлення кількості товару:', error));
}

// Видалення вибраного товару
function deleteProduct(index) {
    let product = selectedProducts[index];
    fetch(`/selected-products/${product.id}`, {
        method: 'DELETE'
    })
    .then(() => {
        selectedProducts.splice(index, 1);
        renderSelectedProducts();
    })
    .catch(error => console.error('Помилка видалення товару:', error));
}

// Генерація замовлення
function generateOrder() {
    let orderText = '';
    let totalAmount = 0;

    selectedProducts.forEach(product => {
        let sum = product.quantity * product.price;
        totalAmount += sum;
        orderText += `${product.code} - ${product.name} - ${product.quantity} шт \n`;
    });

    orderText += `\nЗагальна сума: ${totalAmount.toFixed(2)} грн`;
    document.getElementById('order-text').value = orderText;
}

// Обробка події на завантаження сторінки
window.onload = loadSelectedProducts;
