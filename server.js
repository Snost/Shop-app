const mysql = require('mysql2');  // додайте цей рядок
const express = require('express');
const path = require('path');
require('dotenv').config();  // Завантажуємо змінні середовища з .env файлу

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

// Додаємо підтримку JSON
app.use(express.json());

// **Додаємо роздачу статичних файлів**
app.use(express.static(path.join(__dirname, 'public')));

// API для отримання товарів
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Помилка сервера' });
    }
    res.json(results);
  });
});

// API для додавання товарів
app.post('/products', (req, res) => {
  const { code, name, price } = req.body;
  if (!code || !name || !price) {
    return res.status(400).json({ error: 'Всі поля обов’язкові' });
  }

  db.query('INSERT INTO products (code, name, price) VALUES (?, ?, ?)',
    [code, name, price],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Помилка сервера' });
      }
      res.json({ id: result.insertId, code, name, price });
    });
});

// API для збереження вибору користувача
app.post('/user-selection', (req, res) => {
  const { userId, selectionData } = req.body;
  if (!userId || !selectionData) {
    return res.status(400).json({ error: 'Всі поля обов’язкові' });
  }

  db.query('INSERT INTO user_selections (user_id, selection_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE selection_data = ?',
    [userId, JSON.stringify(selectionData), JSON.stringify(selectionData)],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Помилка сервера' });
      }
      res.json({ message: 'Вибір збережено' });
    });
});

// API для завантаження вибору користувача
app.get('/user-selection/:userId', (req, res) => {
  const { userId } = req.params;

  db.query('SELECT selection_data FROM user_selections WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Помилка сервера' });
    }
    if (results.length > 0) {
      res.json(JSON.parse(results[0].selection_data));
    } else {
      res.status(404).json({ message: 'Вибір не знайдено' });
    }
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер працює на http://localhost:${port}`);
});
