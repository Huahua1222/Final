var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

db.run('CREATE TABLE IF NOT EXISTS prices (\n' +
    '            id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
    '            year INTEGER NOT NULL,\n' +
    '            month INTEGER NOT NULL,\n' +
    '            day INTEGER NOT NULL,\n' +
    '            price REAL NOT NULL\n' +
    '        )');

app.get('/api/prices', (req, res) => {
    db.all('SELECT * FROM prices', (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        res.json(rows);
    });
});

app.get('/api/search', (req, res) => {
    const { year, month, day, minPrice, maxPrice } = req.query;
    let query = 'SELECT * FROM prices WHERE 1=1';
    const params = [];

    if (year) {
        query += ' AND year = ?';
        params.push(year);
    }
    if (month) {
        query += ' AND month = ?';
        params.push(month);
    }
    if (day) {
        query += ' AND day = ?';
        params.push(day);
    }
    if (minPrice && maxPrice) {
        query += ' AND price BETWEEN ? AND ?';
        params.push(minPrice);
        params.push(maxPrice);
    }

    // 添加 ORDER BY 子句
    query += ' ORDER BY year ASC, month ASC, day ASC';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});



module.exports = app;