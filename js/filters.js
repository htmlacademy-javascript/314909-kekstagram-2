// Инициализация фильтров фотографий

import { applyFilter } from './filter.js';
import { debounce } from './utils/debounce-throttle.js';

const FILTERS_FORM_SELECTOR = '.img-filters__form';
const FILTER_BUTTON_SELECTOR = '.img-filters__button';
const ACTIVE_CLASS = 'img-filters__button--active';

let photos = null;
let onFiltersChange = null;
let currentFilter = 'filter-default';
let debouncedFiltersChange = null;
let pendingFilter = null;

/**
 * Устанавливает активный фильтр
 * @param {string} filterType - тип фильтра
 */
function setActiveFilter(filterType) {
  const filterButtons = document.querySelectorAll(FILTER_BUTTON_SELECTOR);

  if (filterType === currentFilter) {
    return;
  }

  // Переключаем активный класс НЕМЕДЛЕННО (синхронно)
  filterButtons.forEach((btn) => btn.classList.remove(ACTIVE_CLASS));
  const activeButton = document.getElementById(filterType);
  if (activeButton) {
    activeButton.classList.add(ACTIVE_CLASS);
  }

  // Обновляем текущий фильтр
  currentFilter = filterType;

  // Если данные ещё не загружены, сохраняем pending фильтр
  if (!photos || !onFiltersChange) {
    pendingFilter = filterType;
    return;
  }

  // Применяем фильтр с задержкой 500 мс (debounce)
  debouncedFiltersChange(filterType);
}

/**
 * Применяет pending фильтр, если он есть
 */
function applyPendingFilter() {
  if (pendingFilter && photos && onFiltersChange) {
    debouncedFiltersChange(pendingFilter);
    pendingFilter = null;
  }
}

/**
 * Инициализирует фильтры фотографий
 * @param {Array} photosData - массив фотографий (опционально)
 * @param {Function} onFiltersChangeCallback - callback при изменении фильтра (опционально)
 */
function initFilters(photosData, onFiltersChangeCallback) {
  const filtersForm = document.querySelector(FILTERS_FORM_SELECTOR);

  if (!filtersForm) {
    return;
  }

  // Если переданы данные, сохраняем их
  if (photosData && onFiltersChangeCallback) {
    photos = photosData;
    onFiltersChange = onFiltersChangeCallback;

    // Инициализируем debounce
    debouncedFiltersChange = debounce((filterType) => {
      const filteredPhotos = applyFilter(filterType, photos);
      onFiltersChange(filteredPhotos);
    }, 500);

    // Применяем pending фильтр, если он был выбран до загрузки данных
    applyPendingFilter();
  }

  // Привязываем обработчики только один раз
  const existingButtons = filtersForm.querySelectorAll(`${FILTER_BUTTON_SELECTOR}[data-handler-attached]`);
  if (existingButtons.length > 0) {
    return; // Обработчики уже привязаны
  }

  const filterButtons = filtersForm.querySelectorAll(FILTER_BUTTON_SELECTOR);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filterType = button.id;
      setActiveFilter(filterType);
    });

    // Помечаем кнопку как обработанную
    button.setAttribute('data-handler-attached', 'true');
  });
}

export { initFilters };
