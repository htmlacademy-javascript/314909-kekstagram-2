// Фильтрация фотографий

import { RANDOM_PHOTO_COUNT } from './constants.js';

/**
 * Фильтр по умолчанию
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
function filterDefault(photos) {
  return photos;
}

/**
 * Фильтр случайных фотографий
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
function filterRandom(photos) {
  const result = [];
  const usedIndices = new Set();
  const count = Math.min(RANDOM_PHOTO_COUNT, photos.length);

  while (result.length < count) {
    const index = Math.floor(Math.random() * photos.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      result.push(photos[index]);
    }
  }

  return result;
}

/**
 * Фильтр обсуждаемых фотографий
 * @param {Array} photos - массив фотографий
 * @returns {Array}
 */
function filterDiscussed(photos) {
  return [...photos].sort((a, b) => b.comments.length - a.comments.length);
}

const filters = {
  'filter-default': filterDefault,
  'filter-random': filterRandom,
  'filter-discussed': filterDiscussed
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

export { applyFilter, filters, filterDefault, filterRandom, filterDiscussed };
