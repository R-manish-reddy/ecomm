const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// Middleware
router.use(express.json());
// POST method to add multiple categories
router.post("/", (req, res) => {
    // Check if the user is an admin
    const isAdmin = req.session.user && req.session.user.role === 'admin';

    // If the user is not an admin, respond with an error
    if (!isAdmin) {
      return res.status(403).json({ error: "Only admin users can add products" });
    }
    // Assuming you have a JSON request body with an array of category objects
    const categories = req.body;
  
    // Validate the request body
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: "Invalid or empty category array" });
    }
  
    // Create an array to store the inserted category IDs
    const insertedCategoryIds = [];
  
    // Use a loop to insert each category into the database
    for (const category of categories) {
      const { category_name } = category;
  
      // Validate the category object
      if (!category_name) {
        return res.status(400).json({ error: "Missing category_name field" });
      }
  
      // Insert the category into the database
      db.query(
        "INSERT INTO Category (category) VALUES (?)",
        [category_name],
        (err, result) => {
          if (err) {
            console.error("Error inserting category:", err);
            return res.status(500).json({ error: "Error inserting category" });
          }
  
          // Store the inserted category's ID
          insertedCategoryIds.push(result.insertId);
  
          // Check if all categories have been inserted
          if (insertedCategoryIds.length === categories.length) {
            // Return the IDs of all inserted categories
            res.status(201).json({ insertedCategoryIds });
          }
        }
      );
    }
  });



// Add more routes as needed

module.exports = router;