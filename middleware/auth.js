/**
 * @fileoverview Middleware для JWT-токена
 * @requires jsonwebtoken
 */

const JWT = require('jsonwebtoken');

/**
 * Проверяет наличие и валидность JWT
 * При успешной проверке добавляет userId в объект запроса
 *
 * @param {object} req - Объект запроса
 * @param {object} res - Объект ответа
 * @param {function} next - Переход на следюущий middleware
 * @returns {void | object} - Передает управление или возвращает ошибку 401
 */

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Требуется авторизация',
        message: 'Заголовок Authorization отсутствует',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Неверный формат токена',
        message: 'Ожидается Bearer <token>',
      });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({
        error: 'Невалидный токен',
        message: 'В токене отсутствует userId',
      });
    }

    req.userId = decoded.userId;

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Невалидный токен',
        message: 'Подпись токена недействительна',
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Токен просрочен',
        message: 'Истек срок действия токена',
      });
    }
    res.status(401).json({
      error: 'Ошибка авторизации',
      message: err.message,
    });
  }
};
