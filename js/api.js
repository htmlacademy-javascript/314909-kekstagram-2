// API для работы с сервером

import { API_URL } from './constants.js';

/**
 * Базовые эндпоинты API
 */
const ENDPOINTS = {
  PHOTOS: 'data',
  UPLOAD: '',
};

/**
 * Проверяет статус HTTP-ответа
 * @param {Response} response - ответ от fetch
 * @returns {Promise<Object>} - распарсенный JSON
 * @throws {Error} при ошибке HTTP
 */
function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Формирует полный URL для запроса
 * @param {string} endpoint - эндпоинт
 * @returns {string} полный URL
 */
function buildUrl(endpoint) {
  return `${API_URL}/${endpoint}`;
}

/**
 * Загружает фотографии с сервера
 * @returns {Promise<Array>} массив данных фотографий
 * @throws {Error} при ошибке загрузки
 */
async function getPhotos() {
  const response = await fetch(buildUrl(ENDPOINTS.PHOTOS));
  return checkStatus(response);
}

/**
 * Отправляет форму загрузки фотографии на сервер
 * @param {FormData} formData - данные формы с файлом и описанием
 * @returns {Promise<Object>} ответ сервера
 * @throws {Error} при ошибке отправки
 */
async function uploadPhoto(formData) {
  const response = await fetch(buildUrl(ENDPOINTS.UPLOAD), {
    method: 'POST',
    body: formData,
  });
  return checkStatus(response);
}

/**
 * Универсальная функция для GET-запросов
 * @param {string} endpoint - эндпоинт API
 * @returns {Promise<Object>} данные от сервера
 */
async function fetchData(endpoint) {
  const response = await fetch(buildUrl(endpoint));
  return checkStatus(response);
}

/**
 * Универсальная функция для POST-запросов
 * @param {string} endpoint - эндпоинт API
 * @param {Object|FormData} body - тело запроса
 * @param {Object} [options] - дополнительные опции
 * @param {Object} [options.headers] - заголовки запроса
 * @returns {Promise<Object>} ответ сервера
 */
async function sendData(endpoint, body, options = {}) {
  const config = {
    method: 'POST',
    ...options,
    body: body instanceof FormData ? body : JSON.stringify(body),
  };

  if (!(body instanceof FormData) && !config.headers) {
    config.headers = {
      'Content-Type': 'application/json',
    };
  }

  const response = await fetch(buildUrl(endpoint), config);
  return checkStatus(response);
}

export { getPhotos, uploadPhoto, fetchData, sendData };
