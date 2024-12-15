const express = require("express");
const app = express();
require('dotenv').config(); // Load environment variables from .env file
const cors = require("cors");
const bodyParser = require("body-parser");


app.use(cors());

app.use(express.json());
// Middleware
app.use(bodyParser.json());

app.use('/api/auth',require('./routes/auth'))
app.use('/api/course',require('./routes/course'))

// Database Initialization

  
  // Routes
  
  // Get all courses
 
  


//index

const port = process.env.PORT || 3200;





app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
