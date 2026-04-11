// Инициализация фильтров фотографий

import { applyFilter } from './filter.js';
import { debounce } from './utils/debounce-throttle.js';

const FILTERS_FORM_SELECTOR = '.img-filters__form';
const FILTER_BUTTON_SELECTOR = '.img-filters__button';
const ACTIVE_CLASS = 'img-filters__button--active';

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

  // Обёртка с debounce для устранения дребезга (500 мс)
  // Фильтрация и перерисовка выполняются вместе с задержкой
  const debouncedFiltersChange = debounce((filterType) => {
    const filteredPhotos = applyFilter(filterType, photos);
    onFiltersChange(filteredPhotos, filterType);
  }, 500);

  filtersForm.addEventListener('click', (evt) => {
    const target = evt.target.closest(FILTER_BUTTON_SELECTOR);

    if (!target) {
      return;
    }

    const filterButtons = evt.currentTarget.querySelectorAll(FILTER_BUTTON_SELECTOR);
    filterButtons.forEach((btn) => btn.classList.remove(ACTIVE_CLASS));
    target.classList.add(ACTIVE_CLASS);

    const filterType = target.id;
    if (filterType !== currentFilter) {
      currentFilter = filterType;
      debouncedFiltersChange(filterType);
    }
  });
}

export { initFilters };
