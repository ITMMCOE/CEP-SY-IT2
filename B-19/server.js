const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // your MySQL password
    database: 'stock_market_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// --- APIs ---

// Get user progress
app.get('/api/progress/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT t.title AS tutorial, up.time_spent_minutes, up.completed, c.title AS course
        FROM user_progress up
        JOIN tutorials t ON up.tutorial_id = t.id
        JOIN courses c ON t.course_id = c.id
        WHERE up.user_id = ?`;
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Update user progress
app.post('/api/progress', (req, res) => {
    const { user_id, tutorial_id, time_spent_minutes, completed } = req.body;

    const query = `
        INSERT INTO user_progress (user_id, tutorial_id, time_spent_minutes, completed)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        time_spent_minutes = VALUES(time_spent_minutes), 
        completed = VALUES(completed)`;

    db.query(query, [user_id, tutorial_id, time_spent_minutes, completed], (err, result) => {
        if (err) return res.status(500).json(err);

        // Emit real-time update
        io.emit('progressUpdate', { user_id, tutorial_id, time_spent_minutes, completed });
        res.json({ success: true });
    });
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

// Start server
server.listen(3000, () => console.log('Server running on port 3000'));
