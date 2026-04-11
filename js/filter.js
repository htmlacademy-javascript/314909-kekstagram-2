// Фильтрация фотографий

import { RANDOM_PHOTO_COUNT } from './constants.js';

/**
 * Применяет фильтр по умолчанию
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
function applyDefaultFilter(photos) {
  return photos;
}

/**
 * Получает случайные фотографии
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
const getRandomFiltered = (photos) => {
  const shuffledPhotos = [...photos].sort(() => Math.random() - 0.5);
  return shuffledPhotos.slice(0, RANDOM_PHOTO_COUNT);
};

/**
 * Получает обсуждаемые фотографии
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
function getDiscussedSorted(photos) {
  return [...photos].sort((a, b) => b.comments.length - a.comments.length);
}

const filters = {
  'filter-default': applyDefaultFilter,
  'filter-random': getRandomFiltered,
  'filter-discussed': getDiscussedSorted
};

/**
 * Применяет фильтр к фотографиям
 * @param {string} filterType - тип фильтра
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
function applyFilter(filterType, photos) {
  return filters[filterType]?.(photos) ?? photos;
}

export { applyFilter };
