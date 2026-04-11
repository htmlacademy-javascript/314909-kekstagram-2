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
const buildUrl = (endpoint) => `${API_URL}/${endpoint}`;

/**
 * Выполняет fetch-запрос с обработкой ошибок
 * @param {string} url - URL запроса
 * @param {Object} [options] - опции fetch
 * @returns {Promise<*>} ответ сервера
 * @throws {ApiError} при сетевой или HTTP-ошибке
 */
const request = async (url, options = {}) => {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError('Ошибка сети. Проверьте подключение к интернету.', 0);
  }

  if (!response.ok) {
    throw new ApiError(`Сервер вернул ошибку: ${response.status}`, response.status);
  }

  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

/**
 * Универсальная функция для GET-запросов
 * @param {string} endpoint - эндпоинт API
 * @returns {Promise<*>} данные от сервера
 */
const fetchData = (endpoint) => request(buildUrl(endpoint));

/**
 * Загружает фотографии с сервера
 * @returns {Promise<Array>} массив фотографий
 */
const getPhotos = () => fetchData(ENDPOINTS.PHOTOS);

/**
 * Загружает фотографию на сервер
 * @param {FormData} formData - данные формы
 * @returns {Promise<*>} ответ сервера
 */
const uploadPhoto = (formData) => request(buildUrl(ENDPOINTS.UPLOAD), {
  method: 'POST',
  body: formData,
});

export { getPhotos, uploadPhoto };
