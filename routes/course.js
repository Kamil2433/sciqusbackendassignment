const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const logerror=require("../middleware/logger");
const sqlite3 = require('sqlite3').verbose();


// Initialize Database
const db = require("../db"); // Import the shared database instance

// Middleware to check course existence
async function checkCourseExists(course_id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM courses WHERE course_id = ?', [course_id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Route: Add Student with Course Assignment
router.post('/add-student', fetchuser, async (req, res) => {
  const { student_name, email, phone_number, course_id } = req.body;
  
    console.log(req.user)
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized: Admin access required" });
  }


  try {
    // Validate course existence
    const course = await checkCourseExists(course_id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    db.run(
      `INSERT INTO students (student_name, email, phone_number, course_id) VALUES (?, ?, ?, ?)`,
      [student_name, email, phone_number, course_id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add student' });
        }
        res.json({ message: 'Student added successfully', student_id: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Route: Retrieve Student Details with Course Information
router.get('/students', fetchuser, (req, res) => {

  const query = `
    SELECT students.*, courses.course_name, courses.course_code, courses.course_duration
    FROM students
    LEFT JOIN courses ON students.course_id = courses.course_id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch students' });
    res.json(rows);
  });
});

// Route: Retrieve Students Enrolled in a Course
router.get('/students/course/:course_id', fetchuser, async (req, res) => {
  const { course_id } = req.params;

  try {
    // Validate course existence
    const course = await checkCourseExists(course_id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    db.all(
      `SELECT * FROM students WHERE course_id = ?`,
      [course_id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch students' });
        res.json(rows);
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Route: Update Student Details with Course Modification
router.put('/update-student/:student_id', fetchuser, async (req, res) => {
  const { student_id } = req.params;
  const { student_name, email, phone_number, course_id } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized: Admin access required" });
  }


  try {
    // Validate course existence if course_id is provided
    if (course_id) {
      const course = await checkCourseExists(course_id);
      if (!course) return res.status(404).json({ error: 'Course not found' });
    }

    db.run(
      `UPDATE students SET student_name = ?, email = ?, phone_number = ?, course_id = ? WHERE student_id = ?`,
      [student_name, email, phone_number, course_id, student_id],
      function (err) {
        if (err) return res.status(500).json({ error: 'Failed to update student' });
        res.json({ message: 'Student updated successfully' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Route: Delete Student and Handle Course Implications
router.delete('/delete-student/:student_id', fetchuser, (req, res) => {
  const { student_id } = req.params;

  db.run(`DELETE FROM students WHERE student_id = ?`, [student_id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete student' });

    if (this.changes === 0) {
      res.status(404).json({ error: 'Student not found' });
    } else {
      res.json({ message: 'Student deleted successfully' });
    }
  });
});

router.post('/add-course', async (req, res) => {
  const { course_name, course_code, course_duration } = req.body;



  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized: Admin access required" });
  }


  try {
    // Validate required fields
    if (!course_name || !course_code || !course_duration) {
      return res.status(400).json({ error: "All fields are required: course_name, course_code, course_duration." });
    }

    // Insert new course into the database
    db.run(
      `INSERT INTO courses (course_name, course_code, course_duration) VALUES (?, ?, ?)`,
      [course_name, course_code, course_duration],
      function (err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            return res.status(400).json({ error: "Course code must be unique." });
          }
          return res.status(500).json({ error: "Failed to add course." });
        }

        res.status(201).json({
          message: "Course added successfully!",
          course: {
            course_id: this.lastID,
            course_name,
            course_code,
            course_duration
          }
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});




module.exports = router;
