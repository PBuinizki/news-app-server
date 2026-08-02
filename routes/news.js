/** 
 * @fileoverview Роуты для управления новостями
 * @requires express
 * @requires middleware/auth
 * @requires controllers/newsController
*/

const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    create,
    getAll,
    getOne,
    update,
    remove,
    publish
} = require('../controllers/newsController');

const router = express.Router();

router.use(authMiddleware);

/* @route POST /api/news - Создать новую статью */
router.post('/', create);

/* @route GET /api/news - Получить все статьи */
router.get('/', getAll);

/* @route GET /api/news/:id - Получить статью по ID */
router.get('/:id', getOne);

/* @router PUT /api/news/:id - Обновить статью */
router.put('/:id', update);

/* @router DELETE /api/news/:id - Удалить статью */
router.delete('/:id', remove);

/* @router PATCH /api/news/:id/publish - Опубликовать статью */
router.patch('/:id/publish', publish);

module.exports = router;