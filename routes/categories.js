const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// Middleware
router.use(express.json());


//task 4
// Endpoint for Product Categories
router.get('/', (req, res) => {
  // Fetch a list of product categories from the Category table
  db.query('SELECT * FROM Category', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const categories = results.map(category => category.category);
      res.status(200).json(categories);
    }
  });
});



// Add more routes as needed

module.exports = router;
