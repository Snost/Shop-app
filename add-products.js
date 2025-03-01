const mysql = require('mysql2');
require('dotenv').config();

// Підключення до бази даних
const db = mysql.createConnection(process.env.MYSQL_URL);

db.connect(err => {
  if (err) {
    console.error('❌ Помилка підключення до MySQL:', err);
    process.exit(1);
  } else {
    console.log('✅ Підключено до MySQL');
  }
});

// Дані для завантаження
const products = [
    [6770, 'Двигун YJ84-28 CW-63 мм.', 464.00],
    [6781, 'Двигун YY 8030 D-5 ХХ СW', 1182.00],
    [1575, 'Двигун Еко2, Елегант2 зібраний', 424.00],
    [6774, 'Двигун 158 Н16 ІІ-шв. Іт, 20 Вт. YJ58-16', 252.00],
    [9380, 'Блок силовий СH I 236/237', 821.00],
    [10559, 'Блок силовий КОКА з пультами', 821.00],
    [11186, 'Сенсорна панель JP-2Y091 420 (Інтегра)', 533.00],
    [7151, 'Перем.кнопков. SC 706 -2 BS /кр.кн//', 101.00],
    [7152, 'Перем.кнопков. SC 706-2 BS-M /кр.кн/ з п/гр.', 111.00],
    [7153, 'Перем.кнопков. SMB 05-004-005', 272.00],
    [7120, 'Крильчатка 750 24P Е-15', 120.00],
    [7117, 'Крильчатка права', 83.00],
    [7119, 'Крильчатка Ел.', 53.00],
    [7123, 'Крильчатка 700 Е-14', 111.00],
    [7171, 'Турбовентилятор E15/1000 200', 1335.00],
    [7169, 'Турбовентилятор E15/750 780', 654.00],
    [7176, 'Турбовентилятор E14/700 390', 597.00],
    [7019, 'Скло світильн. Ел.', 41.00],
    [7020, 'Скло світильника', 45.00],
    [9246, 'Фільтр ФАЖ 185 х 300 х 9 (5 шар)', 192.00],
    [8161, 'Фільтр ФАЖ 196 х 465 х 9 (5-шар)', 294.00],
    [11478, 'Фільтр ФАЖ 448 х 272 х 9 (5-шар)', 390.00],
    [6957, 'Фільтр ФАЖ 274 х 272 х 9 (5 шар)', 234.00],
    [6956, 'Фільтр ФАЖ 267,5 х 342 х 9 (3-шар)', 324.00],
    [10539, 'Фільтр ФАЖ 536 х 342 х 9 (5-шар)', 426.00],
    [12360, 'Лампа світлодіодна LED 220V 1,5W 6000K (кругла)', 250.00]
];

  

// SQL-запит для додавання товарів
const query = 'INSERT INTO products (code, name, price) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price)';

db.query(query, [products], (err, result) => {
  if (err) {
    console.error('❌ Помилка додавання товарів:', err);
  } else {
    console.log(`✅ Успішно додано або оновлено ${result.affectedRows} товарів.`);
  }
  db.end();
});
