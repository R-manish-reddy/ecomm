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

//task 1
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


//task 4
// Endpoint for Product Categories
app.get('/api/categories', (req, res) => {
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

//task 7
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


//task 8
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



//task 9
app.get("/api/products/sort", (req, res) => {
  const { sortBy } = req.query;

  // Check if sortBy parameter is provided
  if (!sortBy) {
    return res
      .status(400)
      .json({ error: "Sort criteria (sortBy) is required" });
  }

  // Define a SQL query to sort products based on the specified criteria
  let query = "SELECT * FROM Product";

  // Add the ORDER BY clause based on the specified sortBy parameter
  switch (sortBy) {
    case "price":
      query += " ORDER BY price ASC";
      break;
    case "popularity":
      query = `SELECT p.*, IFNULL(pl.likes, 0) AS like_count
      FROM Product p
      LEFT JOIN ProductLikes pl ON p.product_id = pl.product_id
      ORDER BY like_count DESC;`;
      break;
    case "releaseDate":
      query += " ORDER BY release_date DESC";
      break;
    default:
      return res
        .status(400)
        .json({ error: "Invalid sort criteria specified" });
  }

  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error", q: query });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found" });
    }

    // Return the sorted products as JSON
    res.status(200).json(results);
  });
});


// task 10
// Endpoint for Product Details
app.get('/api/products/:product_id/details', (req, res) => {
  const productId = req.params.product_id;

  // Fetch product details for the specified product_id
  db.query(
    'SELECT pd.*, p.is_available FROM product_details pd JOIN product p ON pd.product_id = p.product_id WHERE pd.product_id = ?',
    [productId],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Product details not found' });
      } else {
        const productDetails = results[0];
        res.status(200).json(productDetails);
      }
    }
  );
});


app.listen(3000, () => {
  console.log('Server running at 3000');
});
