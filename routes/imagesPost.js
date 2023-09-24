const express = require("express");
const router = express.Router();
const db = require("../db"); // Import the database connection
const multer = require("multer");
const path = require("path");
const { isAuthenticated } = require('../authentication');

router.get('/image-upload',isAuthenticated,(req,res)=>{
  const isAdmin = req.session.user && req.session.user.role === 'admin';

  // If the user is not an admin, respond with an error
  if (!isAdmin) {
    return res.status(403).json({ error: "Only admin users can add images" });
  }
    return res.render("uploadImage")
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      return cb(null, `${Date.now()}-${file.originalname}`);
    }
  })


// Set up multer for handling file uploads
const upload = multer({ storage })


router.post('/upload-images', upload.array('images[]', 10), async (req, res) => {
    try {
        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files uploaded.');
        }

        // Extract the product_id from the form input
        const { product_id } = req.body;

        // Insert each image data into your MySQL database
        for (const file of req.files) {
            const image = `/uploads/${file.filename}`; // Assuming the images are stored in the /uploads folder

            // Insert the image data into your MySQL database
            await db.query('INSERT INTO Image (product_id, image) VALUES (?, ?)', [product_id, image]);
        }

        console.log('Images uploaded and inserted into the database.');
        return res.redirect(`/api/products/${product_id}/images`);
    } catch (error) {
        console.log(req.files);
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

  
  module.exports = router;