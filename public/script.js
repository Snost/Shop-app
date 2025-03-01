let selectedProducts = [];
let allProducts = [];

// ➕ Додати новий товар
function addNewProduct() {
    let code = document.getElementById('new-code').value.trim();
    let name = document.getElementById('new-name').value.trim();
    let price = parseFloat(document.getElementById('new-price').value);

    if (!code || !name || isNaN(price) || price <= 0) {
        alert("Всі поля повинні бути заповнені правильно!");
        return;
    }

    fetch('/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, price })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadProducts(); 
    })
    .catch(error => console.error('Помилка додавання товару:', error));
}

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

// 🟢 Завантажити вибрані товари
function loadSelectedProducts() {
    fetch('/selected-products')
        .then(response => response.json())
        .then(data => {
            selectedProducts = data;
            renderProductTable(); 
            renderOrderText();
        })
        .catch(error => console.error('Помилка завантаження вибору:', error));
}

// 🔄 Відобразити каталог товарів
function renderProductTable() {
    let list = document.getElementById('product');
    if (!list) return console.error("❌ Елемент #product не знайдено!");

    list.innerHTML = '';  

    if (allProducts.length === 0) {
        list.innerHTML = '<tr><td colspan="7">❌ Товари відсутні</td></tr>';
        return;
    }
    allProducts.sort((a, b) => a.name.localeCompare(b.name));

    allProducts.forEach((product, index) => {
        let price = parseFloat(product.price);
        if (isNaN(price)) price = 0;

        let isSelected = selectedProducts.some(p => p.code === product.code);

        let row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button onclick='toggleSelection(${index})' 
                    style="background-color: ${isSelected ? 'green' : 'white'};">
                    ${isSelected ? '✔' : '➕'}
                </button>
            </td>
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td><input type="number" value="1" min="1" id="qty-${index}"></td>
            <td>${price.toFixed(2)}</td>
            <td>
                <button onclick='editProduct(${index})'>✏</button>
                <button onclick='deleteProduct(${index})'>🗑</button>
            </td>
        `;
        list.appendChild(row);
    });
}

// ➕ Додати або прибрати товар зі списку вибраних
function toggleSelection(index) {
    let product = allProducts[index];
    let quantityInput = document.getElementById(`qty-${index}`);
    let quantity = parseInt(quantityInput.value);

    if (isNaN(quantity) || quantity < 1) {
        alert("Кількість повинна бути більше 0");
        return;
    }

    let existingIndex = selectedProducts.findIndex(p => p.code === product.code);
    if (existingIndex !== -1) {
        selectedProducts.splice(existingIndex, 1); // Якщо товар вже вибраний – видаляємо
    } else {
        selectedProducts.push({ code: product.code, name: product.name, quantity, price: product.price });
    }

    console.log("✅ Поточний вибір товарів:", selectedProducts);

    saveSelection();
    renderProductTable();
    renderOrderText();
}


// 🔄 Оновити текст замовлення
function renderOrderText() {
    let orderText = document.getElementById('order-text');
    if (!orderText) {
        console.error("❌ Поле для замовлення не знайдено!");
        return;
    }

    if (selectedProducts.length === 0) {
        orderText.value = "❌ Немає вибраних товарів!";
        return;
    }

    let total = 0;
    let orderDetails = selectedProducts.map(p => {
        let itemTotal = p.quantity * p.price;
        total += itemTotal;
        return `${p.code} - ${p.name} -  ${p.quantity} шт`;
    }).join('\n');

    orderText.value = `${orderDetails}\n\n🟢 Загальна сума: ${total.toFixed(2)} грн`;
    console.log("📦 Замовлення оновлено:\n", orderText.value);
}



// ✏ Редагувати товар (змінюється код, назва, ціна)
function editProduct(index) {
    let product = allProducts[index];

    let newCode = prompt("🔢 Введіть новий код:", product.code).trim();
    let newName = prompt("✏ Введіть нову назву:", product.name).trim();
    let newPrice = parseFloat(prompt("💰 Введіть нову ціну:", product.price));

    if (!newCode || !newName || isNaN(newPrice) || newPrice <= 0) {
        alert("❌ Дані введено некоректно!");
        return;
    }

    fetch(`/edit-product`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldCode: product.code, newCode, name: newName, price: newPrice })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadProducts();
    })
    .catch(error => console.error('Помилка редагування товару:', error));
}

// 🗑 Видалити товар з бази
function deleteProduct(index) {
    let product = allProducts[index];

    if (!confirm(`❗ Ви впевнені, що хочете видалити "${product.name}"?`)) return;

    fetch(`/delete-product/${product.code}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadProducts();
        })
        .catch(error => console.error('Помилка видалення товару:', error));
}

// 🔴 Зберегти вибір на сервері
function saveSelection() {
    fetch('/selected-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProducts)
    })
    .then(() => console.log("✅ Вибір товарів збережено на сервері!"))
    .catch(error => console.error('❌ Помилка збереження вибору:', error));
}



// 🔴 Очистити вибір
function clearSelection() {
    selectedProducts = [];

    fetch('/selected-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
    })
    .then(() => {
        renderProductTable();
        renderOrderText();
        
    })
    .catch(error => console.error('Помилка очищення вибору:', error));
}

  
// 📦 Завантажити дані при старті
window.onload = function () {
    loadProducts();
    loadSelectedProducts();
    setInterval(loadSelectedProducts, 5000);
};
