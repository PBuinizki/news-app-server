/** 
 * @fileoverview Контроллер для регистрации и входа пользователей
 * @requires models/User
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires utils/passwordValidator
*/

const User = require('../models/User');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { validatePassword } = require('../utils/passwordValidator');

/** 
 * Регистрация нового пользователя
 * 
 * @route POST /api/auth/register
 * @param { Object } req - Объект запроса
 * @param { string } req.body.email - Email пользователя
 * @param { string } req.body.password - Пароль пользователя
 * @param { Object } res - Объект ответа
 * @returns { Object } JSON c ID созданного пользователя
*/

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Не все поля заполнены',
                message: 'Email и пароль обязательны'
            });
        }

        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({
                error: 'Слабый пароль',
                message: passwordCheck.errors.join('; '),
                details: passwordCheck.errors
            });
        }

        const exisitingUser = await User.findOne({ email });
        if (exisitingUser) {
            return res.status(400).json({
                error: 'Пользователь уже существует',
                message: 'Пользователь с таким email уже зарегистрирован'
            });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({ email, passwordHash });

        res.status(201).json({
            message: 'Пользователь успешно создан',
            userId: user._id,
            email: user.email
        });
    } catch(err) {
        console.error('Ошибка регистрации: ', err);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            message: err.message
        });
    }
}