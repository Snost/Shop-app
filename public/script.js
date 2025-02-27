let products = JSON.parse(localStorage.getItem('products')) || [
    { code: '00000006770', name: 'Двигун YJ84-28 CW-63 мм.', price: 464.00 },
    { code: '00000006781', name: 'Двигун YY 8030 D-5 ХХ СW', price: 1182.00 },
    { code: '00000001575', name: 'Двигун Еко2, Елегант2 зібраний', price: 424.00 },
    { code: '00000006774', name: 'Двигун 158 Н16 ІІ-шв. Іт, 20 Вт. YJ58-16', price: 252.00 },
    { code: '00000009380', name: 'Блок силовий СH I 236/237', price: 821.00 },
    { code: '00000010559', name: 'Блок силовий КОКА з пультами', price: 821.00 },
    { code: '00000011186', name: 'Сенсорна панель JP-2Y091 420 (Інтегра)', price: 533.00 },
    { code: '00000007151', name: 'Перем.кнопков. SC 706 -2 BS /кр.кн//', price: 101.00 },
    { code: '00000007152', name: 'Перем.кнопков. SC 706-2 BS-M /кр.кн/ з п/гр.', price: 111.00 },
    { code: '00000007153', name: 'Перем.кнопков. SMB 05-004-005', price: 272.00 },
    { code: '00000007120', name: 'Крильчатка 750  24P  Е-15', price: 120.00 },
    { code: '00000007117', name: 'Крильчатка права', price: 83.00 },
    { code: '00000007119', name: 'Крильчатка Ел.', price: 53.00 },
    { code: '00000007123', name: 'Крильчатка 700  Е-14', price: 111.00 },
    { code: '00000007171', name: 'Турбовентилятор E15/1000 200', price: 1335.00 },
    { code: '00000007169', name: 'Турбовентилятор E15/750 780', price: 654.00 },
    { code: '00000007176', name: 'Турбовентилятор E14/700 390', price: 597.00 },
    { code: '00000007019', name: 'Скло світильн. Ел.', price: 41.00 },
    { code: '00000007020', name: 'Скло світильника', price: 45.00 },
    { code: '00000009246', name: 'Фільтр ФАЖ 185 х 300 х 9 (5 шар)', price: 192.00 },
    { code: '00000008161', name: 'Фільтр ФАЖ 196 х 465 х 9 (5-шар)', price: 294.00 },
    { code: '00000011478', name: 'Фільтр ФАЖ 448 х 272 х 9 (5-шар)', price: 390.00 },
    { code: '00000006957', name: 'Фільтр ФАЖ 274 х 272 х 9 (5 шар)', price: 234.00 },
    { code: '00000006956', name: 'Фільтр ФАЖ 267,5 х 342 х 9 (3-шар)', price: 324.00 },
    { code: '00000010539', name: 'Фільтр ФАЖ 536 х 342 х 9 (5-шар)', price: 426.00 },
    { code: '01-00012360', name: 'Лампа світлодіодна LED 220V 1,5W 6000K (кругла)', price: 250.00 }
];

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function loadProducts() {
    let list = document.getElementById('product-list');
    list.innerHTML = '';
    products.forEach((product, index) => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td><input type='checkbox' class='select-product' data-index='${index}'></td>
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td><input type='number' class='product-qty' value='1' min='1'></td>
            <td>${product.price.toFixed(2)}</td>
        `;
        list.appendChild(row);
    });
}

function addProduct() {
    let code = prompt('Введіть код товару:');
    let name = prompt('Введіть назву товару:');
    let price = parseFloat(prompt('Введіть ціну товару:'));
    if (code && name && !isNaN(price)) {
        products.push({ code, name, price });
        saveProducts();
        loadProducts();
    } else {
        alert('Некоректні дані!');
    }
}

function generateOrder() {
    let rows = document.querySelectorAll('#product-list tr');
    let orderText = '';
    let totalAmount = 0;
    
    rows.forEach(row => {
        let checkbox = row.querySelector('.select-product');
        if (checkbox.checked) {
            let index = checkbox.dataset.index;
            let qty = parseInt(row.querySelector('.product-qty').value);
            let product = products[index];
            let sum = qty * product.price;
            totalAmount += sum;
            orderText += `${product.code} - ${product.name} - ${qty} шт \n`;
        }
    });
    
    orderText += `\nЗагальна сума: ${totalAmount.toFixed(2)} грн`;
    document.getElementById('order-text').value = orderText;
}

function clearSelection() {
    document.querySelectorAll('.select-product').forEach(checkbox => checkbox.checked = false);
    document.getElementById('order-text').value = '';
}

window.onload = loadProducts;