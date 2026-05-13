const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Database Connection Pool ─────────────────────────────────────────────────
// WHY a pool? Like a taxi stand — multiple cabs ready, no waiting for one to return.
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'taskdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ─── Wait for DB then create table ───────────────────────────────────────────
function initDB(retries = 10) {
  db.query(
    `CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        if (retries > 0) {
          console.log(`DB not ready yet, retrying in 5s... (${retries} left)`);
          setTimeout(() => initDB(retries - 1), 5000);
        } else {
          console.error('Could not connect to DB after retries:', err);
        }
      } else {
        console.log('✅ Database table ready');
      }
    }
  );
}

initDB();

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check — Kubernetes uses this to know if the app is alive
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'task-manager-backend' });
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
  db.query('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST create a task
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  db.query('INSERT INTO tasks (title) VALUES (?)', [title], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, title, completed: false });
  });
});

// PUT toggle complete
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'UPDATE tasks SET completed = NOT completed WHERE id = ?',
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Task updated' });
    }
  );
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task deleted' });
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});