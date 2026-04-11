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
function getRandomFiltered(photos) {
  const randomPhotos = [];
  const usedIndices = new Set();
  const count = Math.min(RANDOM_PHOTO_COUNT, photos.length);

  while (randomPhotos.length < count) {
    const index = Math.floor(Math.random() * photos.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      randomPhotos.push(photos[index]);
    }
  }

  return randomPhotos;
}

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
