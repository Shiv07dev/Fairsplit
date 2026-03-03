const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    const schema = fs.readFileSync('./database/schema.sql', 'utf8');

    // Split statements safely
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length);

    for (const statement of statements) {
      await connection.execute(statement);
    }

    console.log('✅ Database schema created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();