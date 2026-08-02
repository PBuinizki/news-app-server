/** 
 * @fileoverview Роуты для аутенфикации
 * @requires express
 * @requires controllers/authController
*/

const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/** 
 * Регистрация нового пользователя
 * @route POST /api/auth/register
 * @param { string } email - Email пользователя
 * @param { string } password - Пароль пользователя
 * @returns { Object } 201 - Созданный пользователь
 * @returns { Object } 400 - Ошибка валидации
 * @returns { Object } 500 - Внутрення ошибка
*/
router.post('/register', register);

/** 
 * Вход пользователя
 * @route POST /api/auth/login
 * @param { string } email - Email пользователя
 * @param { string } password - Пароль пользователя
 * @returns { Object } 200 - JWT-токен
 * @returns { Object } 401 - Неверный email или пароль
 * @returns { Object } 500 - Внутренняя ошибка
*/
router.post('/login', login);

module.exports = router;