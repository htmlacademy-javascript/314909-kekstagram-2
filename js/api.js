// API для работы с сервером
import { API_URL } from './constants.js';

/**
 * Базовые эндпоинты API
 */
const ENDPOINTS = {
  PHOTOS: 'data',
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
 * @returns {Promise} распарсенный ответ сервера
 * @throws {ApiError} при сетевой или HTTP-ошибке
 */
async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError('Ошибка сети. Проверьте подключение к интернету.', 0);
  }

  if (!response.ok) {
    throw new ApiError(`Сервер вернул ошибку: ${response.status}`, response.status);
  }

  return response.json();
}

/**
 * Универсальная функция для GET-запросов
 * @param {string} endpoint - эндпоинт API
 * @returns {Promise} данные от сервера
 * @throws {ApiError} при ошибке запроса
 */
function fetchData(endpoint) {
  return request(buildUrl(endpoint));
}

/**
 * Загружает фотографии с сервера
 * @returns {Promise} массив данных фотографий
 * @throws {ApiError} при ошибке загрузки
 */
function getPhotos() {
  return fetchData(ENDPOINTS.PHOTOS);
}

/**
 * Загружает фотографию на сервер
 * @param {FormData} formData - данные формы с файлом и описанием
 * @returns {Promise} ответ сервера
 * @throws {ApiError} при ошибке загрузки
 */
function uploadPhoto(formData) {
  return request(buildUrl(''), {
    method: 'POST',
    body: formData,
  });
}

export { getPhotos, uploadPhoto, fetchData, ApiError};
