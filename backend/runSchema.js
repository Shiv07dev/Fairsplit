const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME

  });

  const schema = fs.readFileSync('./database/schema.sql', 'utf8');
  await connection.query(schema);

  console.log('✅ Schema executed successfully!');
  process.exit();
}

run();