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

const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const authMiddleware = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Подключился к Atlas!'))
  .catch((err) => console.error('Не получилось подключиться к Atlas: ', err));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fieldSize: 10 * 1024 * 1024 },
});

/**
 * Загрузка файлов
 * @route POST /api/upload
 * @param {object} req - Объект запроса
 * @param {object} res - Объект ответа
 * @returns {object} JSON с URL загруженного файла
 */
app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

server.listen(PORT, () => {
  console.log(`Сервер запустился: http://localhost:${PORT}`);
});
