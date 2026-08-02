# 📰 News API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com/)
[![ESLint](https://img.shields.io/badge/ESLint-8.x-purple)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-2.x-ff69b4)](https://prettier.io/)

## Описание

API для управления новостными статьями с поддержкой:
- JWT-авторизация
- Отложенная публикация
- Загрузка файлов (multer)
- Real-time уведомления (Socket.io)
- JSDoc-документация

## Технологии

- **Node.js** + **Express**
- **MongoDB** (Mongoose)
- **JWT** + **bcrypt**
- **Socket.io**
- **Multer** (загрузка файлов)

## Требования

- Node.js 16+
- MongoDB Atlas или локальный MongoDB
- npm или yarn

## Быстрый старт

### 1. Клонирование
```bash
git clone https://github.com/PBuinizki/news-app-server.git
cd news-app-server