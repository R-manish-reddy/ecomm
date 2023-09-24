
const express = require('express');
const bcrypt = require('bcrypt');

const db = require('../db');
const { sendWelcomeEmail } = require('../email');
const{ adminUsername }=require('../authentication');
const router = express.Router();
// Routes

router.post('/register', async (req, res) => {
    
    const { username, password, email } = req.body;
    // Check if username is available (not already registered)
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, results) => {
        if (err) {
          console.error('Error registering user:', err);
          return res.status(500).json({ message: 'Registration failed' });
        }
  
        if (results.length > 0) {
          return res.status(400).json({ message: 'Username already exists' });
        }
  
        // Hash the password
        const hashedPassword = await bcrypt.hash(String(password), 10);
  
        // Check if the registering user is the admin
        if (username === adminUsername) {
          // Insert the admin user into the database with 'admin' role
          db.query(
            'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, 'admin', email],
            (err) => {
              if (err) {
                console.error('Error registering admin:', err);
                return res.status(500).json({ message: 'Admin registration failed' });
              } else {
                sendWelcomeEmail(email,username);
                return res.status(201).json({ message: 'Admin registration successful' });
              }
            }
          );
        } else {
          // Insert regular users as buyers
          db.query(
            'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, 'buyer', email],
            (err) => {
              if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ message: 'Registration failed' });
              } else {
                sendWelcomeEmail(email,username);
                return res.status(201).json({ message: 'Registration successful' });
              }
            }
          );
        }
      }
    );
  });
  
    
  
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Retrieve the user's hashed password from the database
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, results) => {
        if (err) {
          console.error('Error logging in:', err);
          res.status(500).json({ message: 'Login failed' });
        } else if (results.length === 0) {
          res.status(401).json({ message: 'Invalid credentials' });
        } else {
          const user = results[0];
          try {
            // Compare the provided password with the stored hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
              // Store user information in the session
              req.session.user = user;
              res.status(200).json({ message: 'Login successful' });
            } else {
              res.status(401).json({ message: 'Invalid credentials' });
            }
          } catch (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).json({ message: 'Login failed' });
          }
        }
      }
    );
  });
  
  router.post('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logout successful' });
    });
  });


module.exports = router;