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

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas подключена');

    const News = require('./models/News');

    const checkScheduledNews = async () => {
      try {
        const now = new Date();
        const result = await News.updateMany(
          { status: 'draft', publishAt: { $lte: now } },
          { status: 'published' }
        );

        if (result.modifiedCount > 0) {
          console.log(`Опубликовано ${result.modifiedCount} отложенных статей`);
          const io = app.get('io');
          if (io) {
            io.emit('news-auto-published', {
              count: result.modifiedCount,
              message: `Опубликовано ${result.modifiedCount} статей`,
              timestamp: now.toISOString(),
            });
          }
        }
      } catch (err) {
        console.error('Ошибка публикации:', err.message);
      }
    };

    setInterval(checkScheduledNews, 30 * 1000);
    console.log('Планировщик публикации запущен');
  })
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

app.use(
  cors({
    origin: [
      'https://news-app-frontend-three.vercel.app',
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
  res.json({ url: req.file.path });
});

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
