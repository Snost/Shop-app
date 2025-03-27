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
  CREATE TABLE IF NOT EXISTS products_grunhelm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    price DECIMAL(10,2)
  )
`, (err) => {
  if (err) console.error('❌ Помилка створення таблиці products:', err);
  else console.log('✅ Таблиця products_grunhelm створена або вже існує');
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





// 🟢 Додати товар у каталог (✅ повернуто!)
app.post('/add-product/:brand', (req, res) => {
  const brand = req.params.brand;
  const { code, name, price, category } = req.body;
  const tableName = `products_${brand}`;

  if (!code || !name || !price || !category) {
    return res.status(400).json({ error: 'Не всі дані заповнені' });
  }

  db.query(
    `INSERT INTO ${tableName} (code, name, price, category) VALUES (?, ?, ?, ?)`,
    [code, name, price, category],
    (err) => {
      if (err) {
        console.error(`❌ Помилка додавання товару:`, err);
        return res.status(500).json({ error: 'Помилка сервера' });
      }

      // Додаємо категорію, якщо її ще немає
      db.query(
        `INSERT INTO categories (brand, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name`,
        [brand, category],
        (err) => {
          if (err) console.error('❌ Помилка додавання категорії:', err);
        }
      );

      res.json({ message: '✅ Товар успішно додано' });
    }
  );
});
app.get('/categories/:brand', (req, res) => {
  const brand = req.params.brand;

  db.query(
    `SELECT DISTINCT category FROM products_${brand}`,
    (err, results) => {
      if (err) {
        console.error('❌ Помилка отримання категорій:', err);
        return res.status(500).json({ error: 'Помилка сервера' });
      }
      const categories = results.map(row => row.category);
      res.json(categories);
    }
  );
});

// 📝 Редагувати товар
app.put('/edit-product/:brand', (req, res) => {
  const brand = req.params.brand;
  const { oldCode, newCode, name, price, category } = req.body;
  const tableName = `products_${brand}`;

  db.query(
    `UPDATE ${tableName} SET code = ?, name = ?, price = ?, category = ? WHERE code = ?`,
    [newCode, name, price, category, oldCode],
    (err, result) => {
      if (err) {
        console.error(`❌ Помилка редагування товару:`, err);
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
app.delete('/delete-product/:brand/:code', (req, res) => {
  const { brand, code } = req.params;
  const tableName = `products_${brand}`;

  db.query(`DELETE FROM ${tableName} WHERE code = ?`, [code], (err, result) => {
    if (err) {
      console.error(`❌ Помилка видалення товару з ${tableName}:`, err);
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
  const selectionData = req.body.map(item => {
    if (item.quantity <= 0) {
      item.quantity = 0;  // Автоматичне встановлення 0, якщо кількість менше або дорівнює 0
    }
    return item;
  });

  db.query(
    'REPLACE INTO global_selection (id, selection_data) VALUES (1, ?)',
    [JSON.stringify(selectionData)],
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


app.get('/products/:brand', (req, res) => {
  const brand = req.params.brand;
  const category = req.query.category;
  const tableName = `products_${brand}`;

  let query = `SELECT * FROM ${tableName}`;
  let params = [];

  if (category && category !== "all") {
    query += " WHERE category = ?";
    params.push(category);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('❌ Помилка отримання товарів:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }
    res.json(results);
  });
});





function showTab(tabId) {
  // Отримуємо всі вкладки
  const tabs = document.querySelectorAll('.tab');
  
  // Ховаємо всі вкладки
  tabs.forEach(tab => tab.style.display = 'none');

  // Показуємо вибрану вкладку
  document.getElementById(tabId).style.display = 'block';
}

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер працює на http://localhost:${port}`);
});
