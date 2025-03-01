const mysql = require('mysql2');
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3060;

// Підключення до MySQL
const db = mysql.createConnection(process.env.MYSQL_URL);

db.connect(err => {
  if (err) {
    console.error('❌ Помилка підключення до MySQL:', err);
  } else {
    console.log('✅ Підключено до MySQL');
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 📌 Каталог товарів
const products = [
  { code: '00000006770', name: 'Двигун YJ84-28 CW-63 мм.', price: 464.00 },
  { code: '00000006781', name: 'Двигун YY 8030 D-5 ХХ СW', price: 1182.00 },
  { code: '00000001575', name: 'Двигун Еко2, Елегант2 зібраний', price: 424.00 }
];

// 🟢 Створення таблиці products
db.query(`
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    price DECIMAL(10,2)
  )
`, (err) => {
  if (err) console.error('❌ Помилка створення таблиці products:', err);
  else console.log('✅ Таблиця products створена або вже існує');
});

// 🟢 Створення таблиці global_selection
db.query(`
  CREATE TABLE IF NOT EXISTS global_selection (
    id INT PRIMARY KEY,
    selection_data TEXT NOT NULL
  )
`, (err) => {
  if (err) console.error('❌ Помилка створення таблиці global_selection:', err);
  else console.log('✅ Таблиця global_selection створена або вже існує');
});

// 🟢 Ініціалізація global_selection
db.query(`
  INSERT INTO global_selection (id, selection_data) 
  VALUES (1, '[]') 
  ON DUPLICATE KEY UPDATE selection_data = selection_data
`, (err) => {
  if (err) console.error('❌ Помилка вставки у global_selection:', err);
  else console.log('✅ Ініціалізація global_selection успішна');
});

// 🟢 Додавання товарів у базу, якщо їх ще немає
products.forEach(product => {
  db.query(
    'INSERT IGNORE INTO products (code, name, price) VALUES (?, ?, ?)',
    [product.code, product.name, product.price],
    (err) => {
      if (err) console.error('❌ Помилка додавання товару:', err);
    }
  );
});

// 🟢 Отримати список усіх товарів
app.get('/products', (req, res) => {
  console.log('Запит до /products');
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Помилка:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }
    console.log('Товари:', results);
    res.json(results);
  });
});

// 🟢 Отримати вибір товарів
app.get('/selected-products', (req, res) => {
  db.query('SELECT selection_data FROM global_selection WHERE id = 1', (err, results) => {
    if (err) return res.status(500).json({ error: 'Помилка сервера' });
    res.json(results.length > 0 ? JSON.parse(results[0].selection_data) : []);
  });
});

// 🔴 Оновити вибір товарів
app.post('/selected-products', (req, res) => {
  const selectionData = JSON.stringify(req.body);
  db.query(
    'REPLACE INTO global_selection (id, selection_data) VALUES (1, ?)',
    [selectionData],
    (err) => {
      if (err) return res.status(500).json({ error: 'Помилка сервера' });
      res.json({ message: '✅ Вибір оновлено' });
    }
  );
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер працює на http://localhost:${port}`);
});
