// API для работы с сервером

import { API_URL } from './constants.js';

/**
 * Обрабатывает ответ от сервера
 * @param {Response} response - ответ fetch
 * @returns {Promise}
 */
function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Загружает данные с сервера
 * @param {string} endpoint - эндпоинт API
 * @returns {Promise}
 */
function loadData(endpoint) {
  return fetch(`${API_URL}/${endpoint}`).then(handleResponse);
}

/**
 * Отправляет данные на сервер
 * @param {string} endpoint - эндпоинт API
 * @param {FormData} body - данные формы
 * @returns {Promise}
 */
function sendData(endpoint, body) {
  return fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    body
  }).then(handleResponse);
}

export { loadData, sendData };
