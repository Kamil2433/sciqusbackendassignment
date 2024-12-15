const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const logerror=require("../middleware/logger");




const authsrt = "bookstore";


const db = require("../db"); // Import the shared database instance



//route to create a new user
router.post('/reg', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
      console.log("its hitting");
    // Check if the user already exists by email
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
      if (err) return res.status(500).json({ error: `Database error.${err} `});

      if (row) {
        return res.status(400).json({ error: 'Email already registered, please use a different email.' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user into the database
      db.run(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, role || 'team_member'],
        function (err) {
          if (err) {
            console.log('Error occurred while saving user', err);
            return res.status(500).json({ error: 'An error occurred during registration.' });
          }

          res.status(201).json({
            message: 'User registered successfully!',
            user: {
              id: this.lastID,
              name,
              email,
              role: role || 'team_member',
            },
          });
        }
      );
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'An error occurred during registration.',error });
  }
});

//login a user
router.post('/', async (req, res) => {
  try {
    const { name, password } = req.body;

    // Find the user by name
    db.get(`SELECT * FROM users WHERE username = ?`, [name], async (err, user) => {
      if (err) return res.status(500).json({ error: `Database error.${err}` });

      if (!user) {
        return res.status(400).json({ error: "Invalid Credentials, user doesn't exist" });
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(400).json({ error: 'Invalid Credentials' });
      }

      // Generate JWT token
      const data = { user: { id: user.id , role:user.role} };
      const authToken = jwt.sign(data, authsrt);

      res.json({ authToken });
    });
  } catch (err) {
    console.log('Error occurred while logging in', err);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});





module.exports = router;
