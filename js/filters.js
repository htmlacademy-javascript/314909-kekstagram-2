// Инициализация фильтров фотографий

import { applyFilter } from './filter.js';

const FILTERS_FORM_SELECTOR = '.img-filters__form';
const FILTER_BUTTON_SELECTOR = '.img-filters__button';
const ACTIVE_CLASS = 'img-filters__button--active';

/**
 * Инициализирует фильтры фотографий
 * @param {Array} photos - массив фотографий
 * @param {Function} onFilterChange - callback при изменении фильтра
 */
function initFilters(photos, onFilterChange) {
  const filtersForm = document.querySelector(FILTERS_FORM_SELECTOR);

  if (!filtersForm) {
    return;
  }

  const filterButtons = filtersForm.querySelectorAll(FILTER_BUTTON_SELECTOR);
  let currentFilter = 'filter-default';

  filterButtons.forEach((button) => {
    button.addEventListener('click', (evt) => {
      const target = evt.target;
      if (!target.classList.contains(FILTER_BUTTON_SELECTOR.replace('.', ''))) {
        return;
      }

      // Переключение активного класса
      filterButtons.forEach((btn) => btn.classList.remove(ACTIVE_CLASS));
      target.classList.add(ACTIVE_CLASS);

      const filterType = target.id;
      if (filterType !== currentFilter) {
        currentFilter = filterType;
        const filteredPhotos = applyFilter(filterType, photos);
        onFilterChange(filteredPhotos, filterType);
      }
    });
  });
}

export { initFilters };
