/**
 * @fileoverview Контроллер для управления новостными статьями
 * @requires models/News
 */

const News = require('../models/News');

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

    const news = await News.create({
      title,
      content,
      images: images || [],
      files: files || [],
      quotes: quotes || [],
      publishAt: publishAt || null,
      authorId: req.userId,
    });

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

    await News.updateMany({ status: 'draft', publishAt: { $lte: now } }, { status: 'published' });

    const news = await News.find({
      $or: [{ status: 'published' }, { status: 'draft', publishAt: { $gt: now } }],
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
 * @param {Object} req - Объект запроса
 * @param {string} req.params.id - ID новости
 * @param {Object} res - Объект ответа
 * @returns {Object} JSON с сообщением об удалении
 */
exports.delete = async (req, res) => {
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