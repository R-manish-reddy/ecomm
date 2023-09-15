const express = require('express');
const mysql = require('mysql'); // or 'mysql2' for the promise-based version
const app = express();

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '+xredmash',
  database: 'ecommdb',
});

// Middleware
app.use(express.json());

//tasl 1
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM product;', (err, result) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(result);
    }
  });
});

//task 2
app.get('/api/product/:id', (req, res) => {
  const productId = req.params.id;
 
  db.query('SELECT * FROM product WHERE product_id = ?', [productId], (err, result) => {
    if (err) {
      res.status(400).json(err);
    } else if (result.length === 0) {
      res.status(404).json({ error: 'Product not found from single product err' });
    } else {
      res.status(200).json(result);
    }
  });
});


//task 3
app.get('/api/products/filter', (req, res) => {
  const categoryName = req.query.category; // Get the category name from the query parameter
  const brandName = req.query.brand; // Get the brand name from the query parameter
  const isAvailable = req.query.is_available; // Get the is_available value from the query parameter
  const minPrice = req.query.min_price; // Get the minimum price from the query parameter
  const maxPrice = req.query.max_price; // Get the maximum price from the query parameter

  // Check if the category, brand, is_available, min_price, or max_price query parameters are provided
  if (!categoryName && !brandName && !isAvailable && !minPrice && !maxPrice) {
    res.status(400).json({ error: 'category, brand, is_available, min_price, and/or max_price parameters are missing' });
    return;
  }

  // Build the SQL query dynamically based on the provided filters
  const filters = [];
  const queryParams = [];

  if (categoryName) {
    filters.push('category_id IN (SELECT category_id FROM category WHERE category = ?)');
    queryParams.push(categoryName);
  }

  if (brandName) {
    filters.push('brand = ?');
    queryParams.push(brandName);
  }

  if (isAvailable) {
    filters.push('is_available = ?');
    queryParams.push(parseInt(isAvailable)); // Assuming is_available is a boolean or integer
  }

  if (minPrice && maxPrice) {
    filters.push('price BETWEEN ? AND ?');
    queryParams.push(parseFloat(minPrice));
    queryParams.push(parseFloat(maxPrice));
  } else if (minPrice) {
    filters.push('price >= ?');
    queryParams.push(parseFloat(minPrice));
  } else if (maxPrice) {
    filters.push('price <= ?');
    queryParams.push(parseFloat(maxPrice));
  }

  let query = 'SELECT * FROM product';

  if (filters.length > 0) {
    query += ' WHERE ' + filters.join(' AND ');
  }
  console.log(query);
  // Query the database to retrieve products based on the specified filters
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error executing SQL query: ' + err.stack);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json(results);
    // console.log('query is : '+query)
  });
});

//task 5
app.get('/api/products/:product_id/reviews', (req, res) => {
  const productId = req.params.product_id; // Get the product_id from the URL parameter

  // Check if the product_id parameter is provided
  if (!productId) {
    res.status(400).json({ error: 'product_id parameter is missing' });
    return;
  }

  // Query the database to retrieve reviews and ratings for the specified product
  const query = 'SELECT review FROM review WHERE product_id = ?';
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error('Error executing SQL query: ' + err.stack);
      res.status(500).json({ error: 'Internal server error from review get method' });
      return;
    }
    res.json(results);
  });
});


//related products API
//task 6
app.get('/api/product/:id/related', (req, res) => {
  const productId = req.params.id;
  const query = 'SELECT * FROM product WHERE category_id IN (select category_id from product where product_id = ?)'
  db.query(query, [productId], (err, result) => {
    if (err) {
      res.status(400).json(err);
    } else if (result.length === 0) {
      res.status(404).json({ error: 'Product not found from related products API' });
    } else {
      res.status(200).json(result);
    }
  });
});

// Endpoint for retrieving product images
app.get('/api/products/:product_id/images', (req, res) => {
  const productId = req.params.product_id;

  // Query the database to retrieve images for the specified product
  const query = 'SELECT image FROM Image WHERE product_id = ?';

  db.query(query, [productId], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Database error' });
      } else if (results.length === 0) {
          res.status(404).json({ error: 'Product images not found' });
      } else {
          res.status(200).json(results);
      }
  });
});



app.get("/api/products/search", (req, res) => {
  const keywords = req.query.keyword;

  // Check if keywords are provided in the query parameters
  if (!keywords) {
    return res
      .status(400)
      .json({ error: "Keywords are required for the search from manish" });
  }

  const query = `SELECT * FROM product WHERE des LIKE '%${keywords}%' or product_name LIKE '%${keywords}%'  `;

  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found matching the keywords" });
    }

    // Return the matching products as JSON
    res.status(200).json(results);
  });
});




app.listen(3000, () => {
  console.log('Server running at 3000');
});
