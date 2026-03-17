const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const myEmitter = require('./events');
require('dotenv').config();

const app = express();
// Render-де порт автоматты түрде беріледі, егер жоқ болса 3000 қолданылады
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Статикалық файлдарды (HTML, CSS, JS) сервер орналасқан жерден іздеу
app.use(express.static(__dirname));

// PostgreSQL дерекқорына қосылу баптауы
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Бұл Render дерекқоры үшін міндетті
    }
});

// --- API ROUTES ---

// Пайдаланушыны тіркеу
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
            [username, password, role]
        );
        const user = result.rows[0];
        myEmitter.emit('userCreated', user);
        res.json({ success: true });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Тіркелу кезінде қате кетті' });
    }
});

// Жүйеге кіру (Login)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username=$1 AND password=$2',
            [username, password]
        );
        if (result.rows.length > 0) {
            const user = result.rows[0];
            myEmitter.emit('loginAttempt', { username, success: true });
            res.json({ success: true, role: user.role });
        } else {
            myEmitter.emit('loginAttempt', { username, success: false });
            res.status(401).json({ success: false, message: 'Логин немесе құпия сөз қате' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Сервер қатесі' });
    }
});

// Жұмыс орындарын алу (Фильтрмен)
app.get('/api/jobs', async (req, res) => {
    const city = req.query.city;
    try {
        let result;
        if (city) {
            result = await pool.query('SELECT * FROM jobs WHERE city=$1', [city]);
        } else {
            result = await pool.query('SELECT * FROM jobs');
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Jobs fetch error:', err);
        res.status(500).json({ success: false, message: 'Дерекқор қатесі' });
    }
});

// Жаңа жұмыс орнын қосу
app.post('/api/jobs', async (req, res) => {
    const {
        username, title, company, city, salary, experience, 
        employment, schedule, responsibilities, requirements, 
        contactphone, contactemail
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO jobs 
            (title, company, city, salary, experience, employment, schedule, responsibilities, requirements, contactphone, contactemail) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) 
            RETURNING *`,
            [title, company, city, salary, experience, employment, schedule, responsibilities, requirements, contactphone, contactemail]
        );
        myEmitter.emit('jobCreated', { admin: username, job: result.rows[0] });
        res.json({ success: true });
    } catch (err) {
        console.error('Add job error:', err);
        res.status(500).json({ success: false, message: 'Вакансия қосу мүмкін болмады' });
    }
});

// Жұмысты жою (Delete)
app.delete('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM jobs WHERE id=$1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Жұмыс табылмады' });
        }
        myEmitter.emit('jobDeleted', { jobId: id });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete job error:', err);
        res.status(500).json({ success: false, message: 'Жою кезінде қате кетті' });
    }
});

// Резюме қосу
app.post('/api/resumes', async (req, res) => {
    const { username, fullName, position, experience, city, phone, email } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO resumes 
            (username, fullname, position, experience, city, phone, email) 
            VALUES ($1,$2,$3,$4,$5,$6,$7) 
            RETURNING *`,
            [username, fullName, position, experience, city, phone, email]
        );
        myEmitter.emit('resumeAdded', { username, resume: result.rows[0] });
        res.json({ success: true });
    } catch (err) {
        console.error('Add resume error:', err);
        res.status(500).json({ success: false, message: 'Резюме қосу мүмкін болмады' });
    }
});

// --- FRONTEND HANDLER ---
// Кез келген белгісіз сілтеме ашылса, index.html файлын жіберу
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер ${PORT} портында іске қосылды`);
});