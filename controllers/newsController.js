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
                message: 'Заголовок и сожержание обязательны'
            });
        }

        const news = await News.create({
            title,
            content,
            images: images || [],
            files: files || [],
            quotes: quotes || [],
            publishAt: publishAt || null,
            authorId: req.userId
        });

        res.status(201).json(news);
    } catch (err) {
        console.error('Ошибка создания новости: ', err);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            message: err.message
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

        await News.updateMany(
            { status: 'draft', publishAt: { $lte: now } },
            { status: 'published' }
        );

        const news = await News.find({
            $or: [{ status: 'published' }, { status: 'draft', publishAt: { $gt: now } }]    
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
}