// Инициализация фильтров фотографий

import { applyFilter } from './filter.js';

const FILTERS_FORM_SELECTOR = '.img-filters__form';
const FILTER_BUTTON_SELECTOR = '.img-filters__button';
const ACTIVE_CLASS = 'img-filters__button--active';

/**
 * Обрабатывает клик по кнопке фильтра
 * @param {Event} evt - событие клика
 * @param {Array} photos - массив фотографий
 * @param {Function} onFiltersChange - callback при изменении фильтра
 * @param {string} currentFilter - текущий фильтр
 * @returns {string} новый текущий фильтр
 */
function onFilterButtonClick(evt, photos, onFiltersChange, currentFilter) {
  const target = evt.target.closest(FILTER_BUTTON_SELECTOR);

  if (!target) {
    return currentFilter;
  }

  const filterButtons = evt.currentTarget.querySelectorAll(FILTER_BUTTON_SELECTOR);
  filterButtons.forEach((btn) => btn.classList.remove(ACTIVE_CLASS));
  target.classList.add(ACTIVE_CLASS);

  const filterType = target.id;
  if (filterType !== currentFilter) {
    const filteredPhotos = applyFilter(filterType, photos);
    onFiltersChange(filteredPhotos, filterType);
    return filterType;
  }

  return currentFilter;
}

/**
 * Инициализирует фильтры фотографий
 * @param {Array} photos - массив фотографий
 * @param {Function} onFiltersChange - callback при изменении фильтра
 */
function initFilters(photos, onFiltersChange) {
  const filtersForm = document.querySelector(FILTERS_FORM_SELECTOR);

  if (!filtersForm) {
    return;
  }

  let currentFilter = 'filter-default';

  filtersForm.addEventListener('click', (evt) => {
    currentFilter = onFilterButtonClick(evt, photos, onFiltersChange, currentFilter);
  });
}

export { initFilters };
