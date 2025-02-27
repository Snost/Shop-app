const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// Підключення до MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12022022Naz',
  database: 'shop'
});

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

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер працює на http://localhost:${port}`);
});
