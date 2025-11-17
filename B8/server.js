// server.js (Correct and Complete)

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

// --- Middleware Setup ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session Configuration
app.use(session({
    secret: 'a_very_secret_key_for_campusfinds',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// --- Database Setup (SQLite) ---
const DB_PATH = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        initializeDb();
    }
});

function initializeDb() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student','admin','pending_admin')) DEFAULT 'student',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating users table:", err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            location TEXT,
            date_lost_found TEXT,
            is_lost INTEGER DEFAULT 1,
            image_path TEXT,
            contact TEXT,
            resolved INTEGER DEFAULT 0,
            found_by_user_id INTEGER NULL,
            collected_by_user_id INTEGER NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (found_by_user_id) REFERENCES users(id),
            FOREIGN KEY (collected_by_user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating items table:", err.message);
        });

        const adminEmail = 'admin@campus.local';
        const adminPass = 'adminpass';
        db.get('SELECT * FROM users WHERE email = ?', [adminEmail], (err, row) => {
            if (err) return console.error("DB Error:", err.message);
            if (!row) {
                bcrypt.hash(adminPass, SALT_ROUNDS, (err, hash) => {
                    if (err) return console.error("Hashing error:", err.message);
                    db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        ['Super Admin', adminEmail, hash, 'admin'],
                        (err) => {
                            if (err) console.error("Error seeding admin:", err.message);
                            else console.log("Super Admin user created successfully.");
                        }
                    );
                });
            }
        });
    });
}

// --- Multer Setup for File Uploads ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const fileFilter = (req, file, cb) => {
    if (/jpeg|jpg|png|gif/.test(file.mimetype)) return cb(null, true);
    cb('Error: Only image files are allowed!');
};
const upload = multer({ storage, limits: { fileSize: 4 * 1024 * 1024 }, fileFilter });


// --- Authentication Middleware ---
function requireAuth(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
}
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
}

// --- API Endpoints ---

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
        if (err) return res.status(500).json({ message: 'Error hashing password.' });
        db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hash, 'student'], function(err) {
            if (err) return res.status(err.message.includes('UNIQUE') ? 409 : 500).json({ message: err.message.includes('UNIQUE') ? 'Email already exists.' : 'Database error.' });
            res.status(201).json({ message: 'User registered successfully.', userId: this.lastID });
        });
    });
});

app.post('/api/admin/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
        if (err) return res.status(500).json({ message: 'Error hashing password.' });
        db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hash, 'pending_admin'], function(err) {
            if (err) return res.status(err.message.includes('UNIQUE') ? 409 : 500).json({ message: err.message.includes('UNIQUE') ? 'Email already exists.' : 'Database error.' });
            res.status(201).json({ message: 'Admin registration submitted for approval.', userId: this.lastID });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        if (!user || user.role === 'pending_admin') return res.status(401).json({ message: user ? 'Account pending approval.' : 'Invalid credentials.' });
        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) return res.status(401).json({ message: 'Invalid credentials.' });
            req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
            res.status(200).json({ message: 'Login successful.', user: req.session.user });
        });
    });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Could not log out.' });
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful.' });
    });
});

app.get('/api/user', requireAuth, (req, res) => res.status(200).json(req.session.user));

app.post('/api/items', requireAuth, upload.single('image'), (req, res) => {
    const { title, description, category, location, date_lost_found, contact, type } = req.body;
    const is_lost = type === 'lost' ? 1 : 0;
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;
    const user_id = req.session.user.id;
    if (!title || !location || !date_lost_found || !contact) return res.status(400).json({ message: 'Missing required fields.' });
    const sql = `INSERT INTO items (title, description, category, location, date_lost_found, is_lost, image_path, contact, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [title, description, category, location, date_lost_found, is_lost, image_path, contact, user_id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error.', error: err.message });
        res.status(201).json({ message: 'Item created successfully.', itemId: this.lastID });
    });
});

app.get('/api/items', (req, res) => {
    let sql = `SELECT i.*, u.name as userName FROM items i JOIN users u ON i.user_id = u.id WHERE 1=1`;
    const params = [];
    if (req.query.q) { sql += ' AND (i.title LIKE ? OR i.description LIKE ?)'; params.push(`%${req.query.q}%`, `%${req.query.q}%`); }
    if (req.query.category) { sql += ' AND i.category = ?'; params.push(req.query.category); }
    if (req.query.type === 'lost') { sql += ' AND i.is_lost = 1'; }
    else if (req.query.type === 'found') { sql += ' AND i.is_lost = 0'; }
    if (req.query.resolved) { sql += ' AND i.resolved = ?'; params.push(req.query.resolved); }
    sql += ' ORDER BY i.created_at DESC';
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error.', error: err.message });
        res.status(200).json(rows);
    });
});

app.get('/api/items/:id', (req, res) => {
    const sql = `SELECT i.*, u.name as userName, u.email as userEmail, f.name as foundByUserName
                 FROM items i 
                 JOIN users u ON i.user_id = u.id
                 LEFT JOIN users f ON i.found_by_user_id = f.id
                 WHERE i.id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        if (!row) return res.status(404).json({ message: 'Item not found.' });
        res.status(200).json(row);
    });
});

app.delete('/api/items/:id', requireAuth, (req, res) => {
    db.get('SELECT user_id, image_path FROM items WHERE id = ?', [req.params.id], (err, item) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        if (req.session.user.role !== 'admin' && req.session.user.id !== item.user_id) return res.status(403).json({ message: 'Forbidden.' });
        db.run('DELETE FROM items WHERE id = ?', [req.params.id], function(err) {
            if (err) return res.status(500).json({ message: 'Database error.' });
            if (item.image_path) fs.unlink(path.join(__dirname, item.image_path), (err) => { if (err) console.error(`Failed to delete image:`, err); });
            res.status(200).json({ message: 'Item deleted successfully.' });
        });
    });
});

app.put('/api/items/:id/resolve', requireAuth, (req, res) => {
    db.get('SELECT user_id FROM items WHERE id = ?', [req.params.id], (err, item) => {
        if (err || !item) return res.status(err ? 500 : 404).json({ message: err ? 'DB error' : 'Item not found.' });
        if (req.session.user.role !== 'admin' && req.session.user.id !== item.user_id) return res.status(403).json({ message: 'Forbidden.' });
        db.run('UPDATE items SET resolved = 1 WHERE id = ?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ message: 'Database error.' });
            res.status(200).json({ message: 'Item marked as resolved.' });
        });
    });
});

app.put('/api/items/:id/claim', requireAuth, (req, res) => {
    const itemId = req.params.id;
    const finderId = req.session.user.id;
    db.get('SELECT user_id, is_lost FROM items WHERE id = ?', [itemId], (err, item) => {
        if (err || !item) return res.status(err ? 500 : 404).json({ message: err ? 'DB error' : 'Item not found.' });
        if (item.user_id === finderId) return res.status(400).json({ message: 'You cannot claim your own item.' });
        if (!item.is_lost) return res.status(400).json({ message: 'This item has already been found.' });
        const sql = 'UPDATE items SET is_lost = 0, found_by_user_id = ? WHERE id = ?';
        db.run(sql, [finderId, itemId], function(err) {
            if (err) return res.status(500).json({ message: 'Database error.' });
            res.status(200).json({ message: 'Item successfully marked as found!' });
        });
    });
});

app.get('/api/myitems', requireAuth, (req, res) => {
    db.all('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC', [req.session.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        res.status(200).json(rows);
    });
});

// --- ADMIN-SPECIFIC ENDPOINTS ---

app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const queries = {
        totalStudents: `SELECT COUNT(*) as count FROM users WHERE role = 'student'`,
        totalItems: `SELECT COUNT(*) as count FROM items`,
        resolvedItems: `SELECT COUNT(*) as count FROM items WHERE resolved = 1`
    };
    const results = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;
    
    db.serialize(() => {
        for (const [key, sql] of Object.entries(queries)) {
            db.get(sql, (err, row) => {
                if (err) {
                    console.error("Stat query error:", err);
                    if (!res.headersSent) res.status(500).json({ message: 'DB error.' });
                    return;
                }
                results[key] = row.count;
                completed++;
                if (completed === totalQueries) {
                    res.status(200).json(results);
                }
            });
        }
    });
});


app.get('/api/admin/pending', requireAdmin, (req, res) => {
    db.all(`SELECT id, name, email, created_at FROM users WHERE role = 'pending_admin'`, (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error.' });
        res.status(200).json(rows);
    });
});

app.put('/api/admin/approve/:userId', requireAdmin, (req, res) => {
    db.run(`UPDATE users SET role = 'admin' WHERE id = ? AND role = 'pending_admin'`, [req.params.userId], function(err) {
        if (err) return res.status(500).json({ message: 'DB error.' });
        if (this.changes === 0) return res.status(404).json({ message: 'User not found or already approved.' });
        res.status(200).json({ message: 'Admin approved successfully.' });
    });
});

// --- Serving Frontend ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, 'public', req.path);
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) res.sendFile(filePath);
  else res.sendFile(path.join(__dirname, 'public', 'index.html')); // Fallback for client-side routing
});

// --- Start Server ---
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));