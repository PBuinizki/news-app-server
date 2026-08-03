/**
 * @fileoverview Контроллер для управления новостными статьями
 * @requires models/News
 */

const News = require('../models/News');

/**
 * Отправляет уведомление всем подключенным клиентам через WebSocket.
 *
 * @param {object} io - Экземпляр Socket.io.
 * @param {string} event - Название события (news-created, news-updated, etc.).
 * @param {object} data - Данные уведомления.
 */
const emitNotification = (io, event, data) => {
  if (!io) {
    return;
  }
  io.emit(event, data);
  if (data.newsId) {
    io.to(`news-${data.newsId}`).emit(event, data);
  }
};

/**
 * Создание новой статьи.
 * Отправляет уведомление всем клиентам.
 *
 * @route POST /api/news
 * @param {object} req - Объект запроса
 * @param {object} req.body - Данные новости
 * @param { string } req.body.title - Заголовок
 * @param { string } req.body.content - HTML-содержимое
 * @param { string[] } req.body.images - Массив URL картинок
 * @param { string[] } req.body.files - Массив URL файлов
 * @param { string[] } req.body.quotes - Массив цитат
 * @param { string } req.body.publishAt - Дата публикации
 * @param {object} res - Объект ответа
 * @returns {object} JSON с созданной новостью
 */
exports.create = async (req, res) => {
  try {
    const { title, content, images, files, quotes, publishAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Не все поля заполнены',
        message: 'Заголовок и сожержание обязательны',
      });
    }

    let status = 'draft';
    let publishDate = publishAt || null;

    if (publishDate && new Date(publishDate) <= new Date()) {
      status = 'published';
      publishDate = new Date();
    }

    const news = await News.create({
      title,
      content,
      images: images || [],
      files: files || [],
      quotes: quotes || [],
      publishAt: publishDate,
      status,
      authorId: req.userId,
    });

    await news.populate('authorId', 'email');

    const io = req.app.get('io');
    if (io) {
      const event = status === 'published' ? 'news-published' : 'news-created';
      emitNotification(io, event, {
        newsId: news._id,
        title: news.title,
        message:
          status === 'published'
            ? `Опубликована статья: "${news.title}"`
            : `Создан черновик: "${news.title}"`,
        author: news.authorId.email,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json(news);
  } catch (err) {
    console.error('Ошибка создания новости: ', err);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: err.message,
    });
  }
};

/**
 * Получение всех статей с автоматической публикацией отложенных
 *
 * @route GET /api/news
 * @param {object} req - Объект запроса
 * @param {object} res - Объект ответа
 * @returns {object[]} Массив статей
 */
exports.getAll = async (req, res) => {
  try {
    const now = new Date();
    const userId = req.userId;

    const result = await News.updateMany(
      { status: 'draft', publishAt: { $lte: now } },
      { status: 'published' }
    );

    if (result.modifiedCount > 0) {
      const io = req.app.get('io');
      if (io) {
        emitNotification(io, 'news-auto-published', {
          count: result.modifiedCount,
          message: `Опубликовано ${result.modifiedCount} статей`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const news = await News.find({
      $or: [{ status: 'published' }, { status: 'draft', authorId: userId }],
    })
      .populate('authorId', 'email')
      .sort({ createdAt: -1 });

    res.json(news);
  } catch (err) {
    console.error('Ошибка получения новостей:', err);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: err.message,
    });
  }
};

/**
 * Получение одной статьи по ID
 *
 * @route GET /api/news/:id
 * @param {object} req - Объект запроса
 * @param {string} req.params.id - ID новости
 * @param {object} res - Объект ответа
 * @returns {object} JSON с найденной статьей
 */
exports.getOne = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('authorId', 'email');

    if (!news) {
      return res.status(404).json({
        error: 'Новость не найдена',
        message: `Статья с ID ${req.params.id} не существует`,
      });
    }

    if (news.status === 'draft' && news.publishAt && news.publishAt <= new Date()) {
      news.status = 'published';
      await news.save();

      const io = req.app.get('io');
      if (io) {
        emitNotification(io, 'news-published', {
          newsId: news._id,
          title: news.title,
          message: `Опубликована статья: "${news.title}"`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    res.json(news);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        error: 'Неверный ID',
        message: 'ID должен быть строкой в формате ObjectId',
      });
    }
    console.error('Ошибка получения новости:', err);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: err.message,
    });
  }
};

/**
 * Обновление статьи
 *
 * @route PUT /api/news/:id
 * @param {object} req - Объект запроса
 * @param {string} req.params.id - ID новости
 * @param {object} req.body - Обновленные данные
 * @param {object} res - Объект ответа
 * @returns {object} JSON с обновленной статьей
 */
exports.update = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        error: 'Новость не найдена',
        message: `Статья с ID ${req.params.id} не существует`,
      });
    }

    if (news.authorId.toString() !== req.userId) {
      return res.status(403).json({
        error: 'Недостаточно прав',
        message: 'Вы не являетесь автором этой статьи',
      });
    }

    const { title, content, images, files, quotes, publishAt, status } = req.body;

    if (status === 'published') {
      news.status = 'published';
      news.publishAt = new Date();
    }

    const oldTitle = news.title;

    if (title) {
      news.title = title;
    }
    if (content) {
      news.content = content;
    }
    if (images) {
      news.images = images;
    }
    if (files) {
      news.files = files;
    }
    if (quotes) {
      news.quotes = quotes;
    }
    if (publishAt !== undefined) {
      news.publishAt = publishAt;
    }
    if (status) {
      news.status = status;
    }

    await news.save();
    await news.populate('authorId', 'email');

    const io = req.app.get('io');
    emitNotification(io, 'news-updated', {
      newsId: news._id,
      title: news.title,
      oldTitle,
      message: `Обновлена статья: "${news.title}"`,
      author: news.authorId.email,
      timestamp: new Date().toISOString(),
    });

    res.json(news);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        error: 'Неверный ID',
        message: 'ID должен быть строкой в формате ObjectId',
      });
    }
    console.error('Ошибка обновления новости: ', err);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: err.message,
    });
  }
};

/**
 * Удаление статьи
 *
 * @route DELETE /api/news/:id
 * @param {object} req - Объект запроса
 * @param {string} req.params.id - ID новости
 * @param {object} res - Объект ответа
 * @returns {object} JSON с сообщением об удалении
 */
exports.remove = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        error: 'Новость не найдена',
        message: `Статья с ID ${req.params.id} не существует`,
      });
    }

    if (news.authorId.toString() !== req.userId) {
      return res.status(403).json({
        error: 'Недостаточно прав',
        message: 'Вы не являетесь автором этой статьи',
      });
    }

    const deletedTitle = news.title;
    const deletedId = news._id;

    await news.deleteOne();

    const io = req.app.get('io');
    emitNotification(io, 'news-deleted', {
      newsId: deletedId,
      title: deletedTitle,
      message: `Удалена статья: "${deletedTitle}"`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Новость успешно удалена',
      deletedId,
      deletedTitle,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        error: 'Неверный ID',
        message: 'ID должен быть строкой в формате ObjectId',
      });
    }
    console.error('Ошибка удаления новости: ', err);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: err.message,
    });
  }
};

/**
 * Публикация статьи
 *
 * @route PATCH /api/news/:id/publish
 * @param {object} req - Объект запроса
 * @param {string} req.params.id - ID новости
 * @param {object} res - Объект ответа
 * @returns {object} JSON с опубликованной статьей
 */
exports.publish = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        error: 'Новость не найдена',
        message: `Статья с ID ${req.params.id} не существует`,
      });
    }

    if (news.authorId.toString() !== req.userId) {
      return res.status(403).json({
        error: 'Недостаточно прав',
        message: 'Вы не являетесь автором этой статьи',
      });
    }

    if (news.status === 'published') {
      return res.status(400).json({
        error: 'Статья уже опубликована',
        message: 'Эта статья уже имеет статус "опубликована"',
      });
    }

    news.status = 'published';
    news.publishAt = new Date();
    await news.save();
    await news.populate('authorId', 'email');

    const io = req.app.get('io');
    emitNotification(io, 'news-published', {
      newsId: news._id,
      title: news.title,
      message: `Статья опубликована: "${news.title}"`,
      author: news.authorId.email,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Статья успешно опубликована',
      news,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        error: 'Неверный ID',
        message: 'ID должен быть строкой в формате ObjectId',
      });
    }
    console.error('Ошибка публикации новости: ', err);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: err.message,
    });
  }
};
