// Инициализация фильтров фотографий

import { applyFilter } from './filter.js';
import { debounce } from './utils/debounce-throttle.js';

const FILTERS_FORM_SELECTOR = '.img-filters__form';
const FILTER_BUTTON_SELECTOR = '.img-filters__button';
const ACTIVE_CLASS = 'img-filters__button--active';
const FILTER_DEBOUNCE_DELAY = 500;
const HANDLER_ATTACHED_ATTR = 'data-handler-attached';

let photos = null;
let onFiltersChange = null;
let currentFilter = 'filter-default';
let debouncedFiltersChange = null;
let pendingFilter = null;
let filterButtonElements = [];

/**
 * Устанавливает активный фильтр
 * @param {string} filterType - тип фильтра
 */
const setActiveFilter = (filterType) => {
  if (filterType === currentFilter) {
    return;
  }

  // Переключаем активный класс НЕМЕДЛЕННО (синхронно)
  filterButtonElements.forEach((button) => button.classList.remove(ACTIVE_CLASS));
  const activeButtonElement = document.getElementById(filterType);
  if (activeButtonElement) {
    activeButtonElement.classList.add(ACTIVE_CLASS);
  }

  // Обновляем текущий фильтр
  currentFilter = filterType;

  // Если данные ещё не загружены, сохраняем pending фильтр
  if (!photos || !onFiltersChange) {
    pendingFilter = filterType;
    return;
  }

  // Применяем фильтр с задержкой (debounce)
  debouncedFiltersChange(filterType);
};

/**
 * Применяет pending фильтр, если он есть
 */
const applyPendingFilter = () => {
  if (pendingFilter && photos && onFiltersChange) {
    debouncedFiltersChange(pendingFilter);
    pendingFilter = null;
  }
};

/**
 * Инициализирует кнопки фильтров (навешивает обработчики)
 */
const initFilterButtons = () => {
  const filtersFormElement = document.querySelector(FILTERS_FORM_SELECTOR);

  if (!filtersFormElement) {
    return;
  }

  // Привязываем обработчики только один раз
  const existingButtonElements = filtersFormElement.querySelectorAll(`${FILTER_BUTTON_SELECTOR}[${HANDLER_ATTACHED_ATTR}]`);
  if (existingButtonElements.length > 0) {
    return; // Обработчики уже привязаны
  }

  // Кэшируем кнопки фильтров (Д21)
  filterButtonElements = [...filtersFormElement.querySelectorAll(FILTER_BUTTON_SELECTOR)];

  /**
   * Обработчик клика по кнопке фильтра (Д4)
   */
  const onFilterButtonClick = (evt) => {
    const filterType = evt.currentTarget.id;
    setActiveFilter(filterType);
  };

  filterButtonElements.forEach((button) => {
    button.addEventListener('click', onFilterButtonClick);

    // Помечаем кнопку как обработанную
    button.setAttribute(HANDLER_ATTACHED_ATTR, 'true');
  });
};

/**
 * Устанавливает данные и callback для фильтрации
 * @param {Array} photosData - массив фотографий
 * @param {Function} onFiltersChangeCallback - callback при изменении фильтра
 */
const setFilterData = (photosData, onFiltersChangeCallback) => {
  photos = photosData;
  onFiltersChange = onFiltersChangeCallback;

  // Инициализируем debounce
  debouncedFiltersChange = debounce((filterType) => {
    const filteredPhotos = applyFilter(filterType, photos);
    onFiltersChange(filteredPhotos);
  }, FILTER_DEBOUNCE_DELAY);

  // Применяем pending фильтр, если он был выбран до загрузки данных
  applyPendingFilter();
};

/**
 * Инициализирует фильтры фотографий
 * @param {Array} photosData - массив фотографий (опционально)
 * @param {Function} onFiltersChangeCallback - callback при изменении фильтра (опционально)
 */
const initFilters = (photosData, onFiltersChangeCallback) => {
  // Если переданы данные, сохраняем их
  if (photosData && onFiltersChangeCallback) {
    setFilterData(photosData, onFiltersChangeCallback);
  }

  // Инициализируем кнопки фильтров
  initFilterButtons();
};

export { initFilters, initFilterButtons };
