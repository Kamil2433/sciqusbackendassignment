const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("../database.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");

    // Create Tables
    db.serialize(() => {
      db.run(`
          CREATE TABLE IF NOT EXISTS courses (
            course_id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_name TEXT NOT NULL,
            course_code TEXT UNIQUE NOT NULL,
            course_duration INTEGER NOT NULL
          )
        `);

      db.run(`
          CREATE TABLE IF NOT EXISTS students (
            student_id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone_number TEXT,
            course_id INTEGER,
            FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL
          )
        `);

      db.run(`
          CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'student',
                        email TEXT UNIQUE NOT NULL

          )
        `);
    });
  }
});

module.exports = db; // Export the database instance
