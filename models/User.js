/**
 *  @fileoverview Модель пользователей
 *  @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * Схема пользователя
 * @typedef {object} User
 * @property { string } email - Уникальная электроная почта пользователя
 * @property { string } passwordHash - Хешированный пароль
 * @property { Date } createdAt - Дата создания
 * @property { Date } updatedAt - Дата обновления
 */

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: [true, 'Требуется email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Некорректный email'],
    },
    passwordHash: {
      type: String,
      require: [true, 'Требуется пароль'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
