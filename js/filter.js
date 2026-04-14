// Фильтрация фотографий

import { RANDOM_PHOTO_COUNT } from './constants.js';

const SHUFFLE_RANDOM_FACTOR = 0.5;

/**
 * Применяет фильтр по умолчанию
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
const applyDefaultFilter = (photos) => photos;

/**
 * Получает случайные фотографии
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
const getRandomPhotos = (photos) => {
  const shuffledPhotos = [...photos].sort(() => Math.random() - SHUFFLE_RANDOM_FACTOR);
  return shuffledPhotos.slice(0, RANDOM_PHOTO_COUNT);
};

/**
 * Получает обсуждаемые фотографии
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
const getDiscussedPhotos = (photos) => [...photos].sort((a, b) => b.comments.length - a.comments.length);

const filters = {
  'filter-default': applyDefaultFilter,
  'filter-random': getRandomPhotos,
  'filter-discussed': getDiscussedPhotos
};

/**
 * Применяет фильтр к фотографиям
 * @param {string} filterType - тип фильтра
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
const applyFilter = (filterType, photos) => filters[filterType]?.(photos) ?? photos;

export { applyFilter };
