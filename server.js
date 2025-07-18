const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database initialization
const db = new sqlite3.Database('./business.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeTables();
    }
});

// Initialize database tables
function initializeTables() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Appointments table
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Business settings table
    db.run(`CREATE TABLE IF NOT EXISTS business_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Services table
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        duration INTEGER DEFAULT 60,
        price DECIMAL(10,2),
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Initialize default admin user
    createDefaultAdmin();
    initializeDefaultSettings();
    initializeDefaultServices();
}

// Create default admin user
function createDefaultAdmin() {
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.run(
        `INSERT OR IGNORE INTO users (username, email, password, role) 
         VALUES (?, ?, ?, ?)`,
        ['admin', 'admin@business.com', defaultPassword, 'admin']
    );
}

// Initialize default business settings
function initializeDefaultSettings() {
    const defaultSettings = [
        ['business_name', 'אורי כהן - מאמן כושר אישי'],
        ['business_description', 'אימון אישי מותאם אישית'],
        ['hero_title', 'הפוך את החלום שלך למציאות'],
        ['hero_subtitle', 'אימון אישי מותאם אישית שיעזור לך להגיע ליעדים שלך'],
        ['contact_phone', '050-1234567'],
        ['contact_email', 'uri.cohen@fitness.com'],
        ['contact_address', 'תל אביב, ישראל'],
        ['working_hours', 'ראשון-חמישי: 06:00-22:00, שישי: 06:00-16:00'],
        ['about_text', 'מאמן כושר מקצועי עם ניסיון של מעל 10 שנים בתחום']
    ];

    defaultSettings.forEach(([key, value]) => {
        db.run(
            `INSERT OR IGNORE INTO business_settings (key, value) VALUES (?, ?)`,
            [key, value]
        );
    });
}

// Initialize default services
function initializeDefaultServices() {
    const defaultServices = [
        ['אימון אישי', 'אימון אישי מותאם לרמה ויעדים', 60, 200],
        ['אימון זוגי', 'אימון לזוג או חברים', 60, 300],
        ['תכנית תזונה', 'תכנית תזונה מותאמת אישית', 0, 150],
        ['ייעוץ כושר', 'ייעוץ ובניית תכנית אימונים', 45, 100]
    ];

    defaultServices.forEach(([name, description, duration, price]) => {
        db.run(
            `INSERT OR IGNORE INTO services (name, description, duration, price) VALUES (?, ?, ?, ?)`,
            [name, description, duration, price]
        );
    });
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Admin middleware
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// API Routes

// Get business settings
app.get('/api/settings', (req, res) => {
    db.all('SELECT key, value FROM business_settings', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    });
});

// Update business settings (admin only)
app.put('/api/settings', authenticateToken, requireAdmin, (req, res) => {
    const { key, value } = req.body;
    
    db.run(
        'INSERT OR REPLACE INTO business_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Setting updated successfully' });
        }
    );
});

// Get services
app.get('/api/services', (req, res) => {
    db.all('SELECT * FROM services WHERE active = 1', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Create appointment
app.post('/api/appointments', (req, res) => {
    const { name, email, phone, service, appointment_date, appointment_time, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !service || !appointment_date || !appointment_time) {
        return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Check if appointment slot is available
    db.get(
        'SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != "cancelled"',
        [appointment_date, appointment_time],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (row) {
                return res.status(400).json({ error: 'This time slot is already booked' });
            }

            // Create appointment
            db.run(
                `INSERT INTO appointments (name, email, phone, service, appointment_date, appointment_time, message)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, email, phone, service, appointment_date, appointment_time, message],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ 
                        message: 'Appointment booked successfully!',
                        appointment_id: this.lastID 
                    });
                }
            );
        }
    );
});

// User login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    });
});

// Get appointments (admin only)
app.get('/api/admin/appointments', authenticateToken, requireAdmin, (req, res) => {
    const { status, date } = req.query;
    let query = 'SELECT * FROM appointments';
    let params = [];

    if (status || date) {
        query += ' WHERE ';
        const conditions = [];
        
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }
        
        if (date) {
            conditions.push('appointment_date = ?');
            params.push(date);
        }
        
        query += conditions.join(' AND ');
    }

    query += ' ORDER BY appointment_date DESC, appointment_time DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Update appointment status (admin only)
app.put('/api/admin/appointments/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.run(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Appointment status updated successfully' });
        }
    );
});

// Get available time slots
app.get('/api/available-slots', (req, res) => {
    const { date } = req.query;
    
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    // Get booked times for the date
    db.all(
        'SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status != "cancelled"',
        [date],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const bookedTimes = rows.map(row => row.appointment_time);
            
            // Generate available time slots (9:00 AM to 6:00 PM)
            const timeSlots = [];
            for (let hour = 9; hour <= 18; hour++) {
                for (let minute = 0; minute < 60; minute += 60) {
                    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    if (!bookedTimes.includes(time)) {
                        timeSlots.push(time);
                    }
                }
            }

            res.json(timeSlots);
        }
    );
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Main site: http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
    console.log('Default admin credentials: admin / admin123');
});

module.exports = app;