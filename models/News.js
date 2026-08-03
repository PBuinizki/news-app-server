/**
 * @fileoverview Модель новости
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * Схема новости
 * @typedef {object} News
 * @property { string } title - Заголовок новости
 * @property { string } content - HTML-содеримое статьи
 * @property { string[] } images - Массив URL изображений
 * @property { string[] } files - Массив URL прикрепленных файлов
 * @property { string[] } quotes - Массив цитат
 * @property { string } status - Статус новости: "черновик" или "опубликован"
 * @property { ObjectId } authorId - Ссылка на пользователя-автора
 * @property { Date } createdAt - Дата создания
 * @property { Date } updatedAt - Дата обновления
 */

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Заголовок не может быть пустым!'],
      trim: true,
      maxlength: [200, 'Не больше 200 символов'],
    },
    content: {
      type: String,
      required: [true, 'Не может быть пустой новости'],
    },
    images: {
      type: [String],
      default: [],
    },
    files: {
      type: [String],
      default: [],
    },
    quotes: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

newsSchema.index({ status: 1, publishAt: 1 });

module.exports = mongoose.model('News', newsSchema);
