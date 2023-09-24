const express = require("express");
const db = require("../db"); // Import the database connection
const router = express.Router();
const { isAuthenticated } = require('../authentication');
// POST method to add a single product
router.post("/add", (req, res) => {
    // Assuming you have a JSON request body with the product data
    // Check if the user is an admin
  const isAdmin = req.session.user && req.session.user.role === 'admin';

  // If the user is not an admin, respond with an error
  if (!isAdmin) {
    return res.status(403).json({ error: "Only admin users can add products" });
  }
    const {
      product_name,
      brand,
      des,
      category_id,
      is_available,
      price,
    } = req.body;
  
    // Validate the request body (you can add more validation)
    if (!product_name || !brand || !price || !des || !category_id || is_available===null) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    // Create a new product in the database
    db.query(
      "INSERT INTO Product (product_name, brand, des, category_id, is_available, price) VALUES (?, ?, ?, ?, ?, ?)",
      [product_name, brand, des, category_id, is_available, price],
      (err, result) => {
        if (err) {
          console.error("Error inserting product:", err);
          return res.status(500).json({ error: "Error inserting product" });
        }
  
        // Return the newly inserted product's ID
        res.status(201).json({ productId: result.insertId });
      }
    );
  });


  
// POST method to add multiple products
router.post("/", (req, res) => {
   // Check if the user is an admin
   const isAdmin = req.session.user && req.session.user.role === 'admin';

   // If the user is not an admin, respond with an error
   if (!isAdmin) {
     return res.status(403).json({ error: "Only admin users can add products" });
   }
    // Assuming you have a JSON request body with an array of product objects
    const products = req.body;
  
    // Validate the request body
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty product array" });
    }
  
    // Create an array to store the inserted product IDs
    const insertedProductIds = [];
  
    // Use a loop to insert each product into the database
    for (const product of products) {
      const {
        product_name,
        brand,
        des,
        category_id,
        is_available,
        price,
      } = product;
  
      // Validate the product object
      if (!product_name || !brand || !price || !des || !category_id || is_available===null) {
        return res.status(400).json({ error: "Missing required fields zxzxz" });
      }
  
      // Insert the product into the database
      db.query(
        "INSERT INTO Product (product_name, brand, des, category_id, is_available, price) VALUES (?, ?, ?, ?, ?, ?)",
        [product_name, brand, des, category_id, is_available, price],
        (err, result) => {
          if (err) {
            console.error("Error inserting product:", err);
            return res.status(500).json({ error: "Error inserting product" });
          }
  
          // Store the inserted product's ID
          insertedProductIds.push(result.insertId);
  
          // Check if all products have been inserted
          if (insertedProductIds.length === products.length) {
            // Return the IDs of all inserted products
            res.status(201).json({ insertedProductIds });
          }
        }
      );
    }
  });

  // POST method to insert a review for a given product ID
router.post('/:product_id/reviews',isAuthenticated, (req, res) => {
   // Check if the user is an admin
   const isAdmin = req.session.user && req.session.user.role === 'admin';

   if (isAdmin) {
    return res.status(403).json({ error: " admin users cannot add reviews" });
  }
    const productId = req.params.product_id;
    const reviewText = req.body.review;
  
    // Check if the review text is provided in the request body
    if (!reviewText) {
      res.status(400).json({ error: 'Review text is missing' });
      return;
    }
  
    // Insert the review into the database
    const insertQuery = 'INSERT INTO Review (product_id, review) VALUES (?, ?)';
    db.query(insertQuery, [productId, reviewText], (err, result) => {
      if (err) {
        console.error('Error inserting review into the database: ' + err.stack);
        res.status(500).json({ error: 'Internal server error from review post method' });
        return;
      }
      res.json({ message: `for product :${productId}, Review inserted successfully at id :${result.insertId}` });
    });
  });

// Modify the route to capture the product_id as a route parameter
router.post('/:product_id/details', (req, res) => {
   // Check if the user is an admin
   const isAdmin = req.session.user && req.session.user.role === 'admin';

   // If the user is not an admin, respond with an error
   if (!isAdmin) {
     return res.status(403).json({ error: "Only admin users can add products" });
   }
    const productId = req.params.product_id; // Extract product_id from the URL parameter
    const { specifications, dimensions } = req.body;
  
    // Check if all required fields are provided
    if (!productId || !specifications || !dimensions) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
  
    // Insert the product detail into the database
    const insertQuery = 'INSERT INTO product_details (product_id, specifications, dimensions) VALUES (?, ?, ?)';
    db.query(insertQuery, [productId, specifications, dimensions], (err, result) => {
      if (err) {
        console.error('Error inserting product detail into the database: ' + err.stack);
        res.status(500).json({ error: 'Internal server error from product detail post method' });
        return;
      }
      res.json({ message: `Product detail added successfully at ID:${result.insertId} ` });
    });
  });
  




module.exports = router;
