let selectedProducts = {
    eleys: [],
    grunhelm: []
};

let allProducts = {
    eleys: [],
    grunhelm: []
};

// 🔄 Відобразити каталог товарів для конкретного бренду
function renderProductTable(brand) {
    let list = document.getElementById(`products_${brand}`);

    list.innerHTML = '';

    if (allProducts[brand].length === 0) {
        list.innerHTML = '<tr><td colspan="7">❌ Товари відсутні</td></tr>';
        return;
    }

    allProducts[brand].sort((a, b) => a.name.localeCompare(b.name));

    allProducts[brand].forEach((product, index) => {
        let selectedProduct = selectedProducts[brand].find(p => p.code === product.code);
        let quantity = selectedProduct ? selectedProduct.quantity : 1;

        let row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button onclick='toggleSelection("${brand}", ${index})' 
                    style="background-color: ${selectedProduct ? 'green' : 'white'};">
                    ${selectedProduct ? '✔' : '➕'}
                </button>
            </td>
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>
                <input type="number" value="${quantity}" min="1" 
                    id="qty-${brand}-${index}" onchange="updateQuantity('${brand}', ${index})">
            </td>
            <td>${parseFloat(product.price).toFixed(2)}</td>
            <td>
                <button onclick='editProduct("${brand}", ${index})'>✏</button>
                <button onclick='deleteProduct("${brand}", ${index})'>🗑</button>
            </td>
        `;
        list.appendChild(row);
    });
}

// 🟢 Перемикання вкладок між брендами
function showTab(brand) {
    document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
    document.getElementById(brand).style.display = 'block';
}

// ➕ Додати або прибрати товар зі списку вибраних
function toggleSelection(brand, index) {
    let product = allProducts[brand][index];
    let quantityInput = document.getElementById(`qty-${brand}-${index}`);
    let quantity = parseInt(quantityInput.value);

    // Якщо кількість не задана або менше 1, встановлюємо значення 0
    if (isNaN(quantity) || quantity < 1) {
        quantity = 0;
    }

    let existingProductIndex = selectedProducts[brand].findIndex(p => p.code === product.code);

    if (existingProductIndex !== -1) {
        selectedProducts[brand].splice(existingProductIndex, 1);
    } else {
        selectedProducts[brand].push({
            code: product.code,
            name: product.name,
            quantity: quantity,
            price: product.price
        });
    }

    // Оновлюємо дані на сервері
    fetch(`/selected-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProducts)
    })
    .then(() => {
        renderProductTable(brand);
        renderOrderText(brand);
    })
    .catch(error => console.error('Помилка вибору товару:', error));
}


// 🔄 Оновити текст замовлення
function renderOrderText(brand) {
    let orderText = document.getElementById(`order-text-${brand}`);
    if (!orderText) {
        console.error(`❌ Поле для замовлення #order-text-${brand} не знайдено!`);
        return;
    }

    if (selectedProducts[brand].length === 0) {
        orderText.value = "❌ Немає вибраних товарів!";
        return;
    }

    let total = 0;
    let orderDetails = selectedProducts[brand].map(p => {
        let itemTotal = p.quantity * p.price;
        total += itemTotal;
        return `${p.code} - ${p.name} - ${p.quantity} шт`;
    }).join('\n');

    orderText.value = `${orderDetails}\n\n🟢 Загальна сума: ${total.toFixed(2)} грн`;
}

// 🔴 Очистити вибір для конкретного бренду
function clearSelection(brand) {
    selectedProducts[brand] = [];

    // Оновлюємо дані на сервері
    fetch(`/selected-products/${brand}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
    })
    .then(() => {
        renderProductTable(brand);  // Перемалювати таблицю товарів
        renderOrderText(brand);     // Оновити текст замовлення
    })
    .catch(error => console.error('Помилка очищення вибору:', error));
}


function loadProducts(brand) {
    fetch(`/products/${brand}`)
        .then(response => response.json())
        .then(data => {
            console.log(`📥 Отримані товари для ${brand}:`, data); // Додаємо лог
            allProducts[brand] = data;
            renderProductTable(brand);
        })
        .catch(error => console.error(`❌ Помилка завантаження товарів ${brand}:`, error));
}



function addNewProduct(brand) {
    let code = document.getElementById(`new-code-${brand}`).value;
    let name = document.getElementById(`new-name-${brand}`).value;
    let price = document.getElementById(`new-price-${brand}`).value;
    let category = document.getElementById(`new-category-${brand}`).value;

    if (!category) {
        category = prompt("Введіть нову категорію:");
        if (!category) return;
    }

    fetch(`/add-product/${brand}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, price, category })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadProducts(brand);
        loadCategories(brand); // Оновлення категорій
    })
    .catch(error => console.error("❌ Помилка додавання товару:", error));
}



function editProduct(brand, index) {
    let product = allProducts[brand][index];
    let newCode = prompt("Новий код товару:", product.code);
    let newName = prompt("Нова назва товару:", product.name);
    let newPrice = prompt("Нова ціна товару:", product.price);
    let newCategory = prompt("Нова категорія товару:", product.category); // Додавання категорії

    fetch(`/edit-product/${brand}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            oldCode: product.code,
            newCode: newCode,
            name: newName,
            price: newPrice,
            category: newCategory
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadProducts(brand); // Після редагування завантажуємо всі товари знову
    })
    .catch(error => console.error("❌ Помилка редагування товару:", error));
}


function deleteProduct(brand, index) {
    let product = allProducts[brand][index];

    if (!confirm(`Ви впевнені, що хочете видалити ${product.name}?`)) return;

    fetch(`/delete-product/${brand}/${product.code}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadProducts(brand);
    })
    .catch(error => console.error("❌ Помилка видалення товару:", error));
}
function filterCategory(brand) {
    let category = document.getElementById(`category-select-${brand}`).value;

    if (category === "all") {
        // Якщо вибрано "Всі", відображаємо всі товари, не фільтруючи за категорією.
        loadProducts(brand);
    } else {
        // Інакше фільтруємо за вибраною категорією.
        fetch(`/products/${brand}?category=${category}`)
            .then(response => response.json())
            .then(data => {
                allProducts[brand] = data;
                renderProductTable(brand);
            })
            .catch(error => console.error(`❌ Помилка фільтрації товарів ${brand}:`, error));
    }
}

function loadCategories(brand) {
    fetch(`/categories/${brand}`)
        .then(response => response.json())
        .then(categories => {
            let categorySelect = document.getElementById(`category-select-${brand}`);
            let newCategorySelect = document.getElementById(`new-category-${brand}`);

            categorySelect.innerHTML = `<option value="all">Всі</option>`;
            newCategorySelect.innerHTML = `<option value="">-- Виберіть категорію --</option>`;

            categories.forEach(category => {
                let option = `<option value="${category}">${category}</option>`;
                categorySelect.innerHTML += option;
                newCategorySelect.innerHTML += option;
            });
        })
        .catch(error => console.error(`❌ Помилка завантаження категорій ${brand}:`, error));
}
function updateQuantity(brand, index) {
    let quantityInput = document.getElementById(`qty-${brand}-${index}`);
    let quantity = parseInt(quantityInput.value);

    // Якщо кількість не задана або менше 1, встановлюємо значення 0
    if (isNaN(quantity) || quantity < 1) {
        quantity = 0;
    }

    let product = allProducts[brand][index];
    let existingProductIndex = selectedProducts[brand].findIndex(p => p.code === product.code);

    if (existingProductIndex !== -1) {
        selectedProducts[brand][existingProductIndex].quantity = quantity;
    }

    fetch(`/selected-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProducts)
    })
    .then(() => {
        renderProductTable(brand);
        renderOrderText(brand);
    })
    .catch(error => console.error('Помилка оновлення кількості товару:', error));
}
function toggleOrderText(brand) {
    let orderText = document.getElementById(`order-text-${brand}`);
    let clearButton = document.querySelector(`#clear-selection-${brand}`);
    let orderButton = document.querySelector(`#order-button-${brand}`); // Кнопка для показу замовлення

    if (selectedProducts[brand].length > 0) {
        orderButton.style.display = 'inline-block'; // Показуємо кнопку "Показати замовлення"
    } else {
        orderButton.style.display = 'none'; // Ховаємо кнопку, якщо товарів немає
    }

    if (orderText.style.display === 'none') {
        orderText.style.display = 'block';  // Показати текст замовлення
        clearButton.classList.add('clear-visible');  // Показати кнопку очистки
    } else {
        orderText.style.display = 'none';  // Приховати текст замовлення
        clearButton.classList.remove('clear-visible');  // Сховати кнопку очистки
    }
}


// 📦 Завантажити дані при старті
window.onload = function () {
    showTab('eleys');
    loadProducts('eleys');
    loadProducts('grunhelm');
    loadCategories('eleys');
    loadCategories('grunhelm');
    // Оновлюємо кнопки при старті
    toggleOrderText('eleys');
    toggleOrderText('grunhelm');
};


