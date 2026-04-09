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
 * Ошибка запроса к серверу
 */
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
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
 * Выполняет fetch-запрос с обработкой ошибок
 * @param {string} url - URL запроса
 * @param {Object} [options] - опции fetch
 * @returns {Promise<Object>} распарсенный ответ сервера
 * @throws {ApiError} при сетевой или HTTP-ошибке
 */
async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (networkError) {
    throw new ApiError('Ошибка сети. Проверьте подключение к интернету.', 0);
  }

  if (!response.ok) {
    throw new ApiError(
      `Сервер вернул ошибку: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

/**
 * Загружает фотографии с сервера
 * @returns {Promise<Array>} массив данных фотографий
 * @throws {ApiError} при ошибке загрузки
 */
function getPhotos() {
  return request(buildUrl(ENDPOINTS.PHOTOS));
}

/**
 * Отправляет форму загрузки фотографии на сервер
 * @param {FormData} formData - данные формы с файлом и описанием
 * @returns {Promise<Object>} ответ сервера
 * @throws {ApiError} при ошибке отправки
 */
function uploadPhoto(formData) {
  return request(buildUrl(ENDPOINTS.UPLOAD), {
    method: 'POST',
    body: formData,
  });
}

/**
 * Универсальная функция для GET-запросов
 * @param {string} endpoint - эндпоинт API
 * @returns {Promise<Object>} данные от сервера
 * @throws {ApiError} при ошибке запроса
 */
function fetchData(endpoint) {
  return request(buildUrl(endpoint));
}

/**
 * Универсальная функция для POST-запросов
 * @param {string} endpoint - эндпоинт API
 * @param {Object|FormData} body - тело запроса
 * @param {Object} [options] - дополнительные опции
 * @param {Object} [options.headers] - заголовки запроса
 * @returns {Promise<Object>} ответ сервера
 * @throws {ApiError} при ошибке запроса
 */
function sendData(endpoint, body, options = {}) {
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

  return request(buildUrl(endpoint), config);
}

export { getPhotos, uploadPhoto, fetchData, sendData, ApiError };
