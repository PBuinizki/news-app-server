/**
 * @fileoverview Утилита для проверки сложности пароля.
 * Содержит функцию валидации и список популярных паролей.
 */

/**
 * Список самых популярных (слабых) паролей.
 * Расширяй по мере необходимости.
 */
const COMMON_PASSWORDS = [
  '12345678',
  'password',
  'qwerty123',
  'admin123',
  '11111111',
  'abc12345',
  'password1',
  'qwertyui',
  '123456789',
  '1234567890',
  'qwerty12345',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  'sunshine',
  'password123',
  '123qwe',
  'qwe123',
];

/**
 * Проверяет пароль на соответствие современным требованиям безопасности.
 *
 * @param {string} password - Проверяемый пароль.
 * @returns {object} Результат проверки.
 * @property {boolean} isValid - Прошел ли пароль проверку.
 * @property {string[]} errors - Массив сообщений об ошибках (если есть).
 */
const validatePassword = (password) => {
  const errors = [];

  // 1. Проверка на пустой пароль
  if (!password) {
    errors.push('Пароль не может быть пустым');
    return { isValid: false, errors };
  }

  // 2. Проверка минимальной длины (8 символов)
  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }

  // 3. Проверка на заглавные буквы (A-Z)
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву (A-Z)');
  }

  // 4. Проверка на строчные буквы (a-z)
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву (a-z)');
  }

  // 5. Проверка на цифры (0-9)
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру (0-9)');
  }

  // 6. Проверка на спецсимволы
  const specialChars = /[!@#$%^&*()_+\-=[\]{};:'"\\|,.<>/?]/;
  if (!specialChars.test(password)) {
    errors.push('Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)');
  }

  // 7. Проверка на пробелы
  if (/\s/.test(password)) {
    errors.push('Пароль не должен содержать пробелы');
  }

  // 8. Проверка на популярные пароли
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Пароль слишком простой и легко подбирается');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validatePassword,
  COMMON_PASSWORDS,
};
