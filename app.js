/**
 * @fileoverview Входная точка серверной части приложения
 * @version 1.0.0
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/* mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Подключился к Atlas!"))
    .catch((err) => console.error('Не получилось подключиться к Atlas: ', err)); */

if(!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.use('/uploads', express.static('uploads'));

const stroge = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
})

const upload = multer({
    storage,
    limits: {fieldSize: 10 * 1024 * 1024}
});

server.listen(PORT, () => {
    console.log(`Сервер запустился: http://localhost:${PORT}`);
})