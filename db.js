const mysql = require('mysql');

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '+xredmash',
  database: 'ecommdb',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the database');
  }
});

module.exports = db;