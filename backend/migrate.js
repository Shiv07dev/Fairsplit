const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  const schema = fs.readFileSync('./schema.sql', 'utf8');
  await connection.query(schema);

  console.log('✅ Database schema created successfully');
  process.exit();
}

migrate();