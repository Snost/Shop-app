const mysql = require('mysql2');
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3060;

// 📌 Підключення до MySQL
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

// 🟢 Додати товар у каталог (✅ повернуто!)
app.post('/add-product', (req, res) => {
  const { code, name, price } = req.body;
  if (!code || !name || !price) {
    return res.status(400).json({ error: 'Не всі дані заповнені' });
  }

  db.query(
    'INSERT INTO products (code, name, price) VALUES (?, ?, ?)',
    [code, name, price],
    (err) => {
      if (err) {
        console.error('❌ Помилка додавання товару:', err);
        return res.status(500).json({ error: 'Помилка сервера' });
      }
      console.log('✅ Товар додано:', name);
      res.json({ message: '✅ Товар успішно додано' });
    }
  );
});
// 📝 Редагувати товар
app.put('/edit-product', (req, res) => {
  const { oldCode, newCode, name, price } = req.body;

  if (!oldCode || !newCode || !name || !price) {
      return res.status(400).json({ error: 'Не всі дані заповнені' });
  }

  db.query(
      'UPDATE products SET code = ?, name = ?, price = ? WHERE code = ?',
      [newCode, name, price, oldCode],
      (err, result) => {
          if (err) {
              console.error('❌ Помилка редагування товару:', err);
              return res.status(500).json({ error: 'Помилка сервера' });
          }
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: '❌ Товар не знайдено' });
          }
          res.json({ message: '✅ Товар оновлено' });
      }
  );
});
// 🗑 Видалити товар
app.delete('/delete-product/:code', (req, res) => {
  const { code } = req.params;

  db.query('DELETE FROM products WHERE code = ?', [code], (err, result) => {
      if (err) {
          console.error('❌ Помилка видалення товару:', err);
          return res.status(500).json({ error: 'Помилка сервера' });
      }
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: '❌ Товар не знайдено' });
      }
      res.json({ message: '✅ Товар видалено' });
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
app.get('/products', (req, res) => {
  console.log('🔵 Запит на отримання товарів');
  db.query('SELECT * FROM products', (err, results) => {
      if (err) {
          console.error('❌ Помилка отримання товарів:', err);
          return res.status(500).json({ error: 'Помилка сервера' });
      }
      console.log('✅ Отримано товари:', results);
      res.json(results);
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер працює на http://localhost:${port}`);
});
