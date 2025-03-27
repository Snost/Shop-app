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

    // Перейменування таблиці
   
      // Дані для завантаження
      //const products = [[133211, "Пилосос ручний акумуляторний - GAVC-825 HIR ECO (GRUNHELM)", 3827, "Пилосос"]];
    
    
    
    
    

      // SQL-запит для додавання товарів
      const query = "INSERT INTO products_grunhelm (code, name, price, category) VALUES ? ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), category=VALUES(category)";
      db.query(query, [products], (err, result) => {
        if (err) {
          console.error('❌ Помилка додавання товарів:', err);
        } else {
          console.log(`✅ Успішно додано або оновлено ${result.affectedRows} товарів.`);
        }
        db.end();
      });
    };
  
});
