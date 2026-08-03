/**
 * @fileoverview Входная точка серверной части приложения
 * @version 1.0.0
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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

app.use(
  cors({
    origin: [
      'https://news-app-frontend-three.vercel.app',
      'http://localhost:5173',
      process.env.CLIENT_URL,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'news-app', // Папка в Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
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

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Новый пользователь подключен к увидомлениям');

  /**
   * Подписка на уведомления по ID новости
   * @event subscribe-news
   * @param {string} newsId - ID новости
   */
  socket.on('subscribe-news', (newsId) => {
    socket.join(`news-${newsId}`);
    console.log(`Пользователь ${socket.id} подписан на новость ${newsId}`);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключен');
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запустился: http://localhost:${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
