// Точка входа в приложение

import { getPhotos } from './api.js';
import { renderTemplateMessage } from './utils/render-template-message.js';
import { renderPictures } from './thumbnails.js';
import { initGallery } from './gallery.js';
import { initFilters } from './filters.js';
import { initUploadForm } from './upload-form.js';

const DATA_ERROR_TEMPLATE_SELECTOR = '#data-error';

/**
 * Показывает сообщение об ошибке загрузки данных
 */
function showDataErrorMessage() {
  const errorElement = renderTemplateMessage(DATA_ERROR_TEMPLATE_SELECTOR);
  if (errorElement) {
    setTimeout(() => errorElement.remove(), 5000);
  }
}

/**
 * Показывает блок фильтров фотографий
 */
function showFilters() {
  const filtersElement = document.querySelector('.img-filters');
  if (filtersElement) {
    filtersElement.classList.remove('img-filters--inactive');
  }
}

/**
 * Инициализирует приложение с загруженными данными
 * @param {Array} photos - массив фотографий с сервера
 */
function initApp(photos) {
  // Показываем блок фильтров
  showFilters();

  // Отрисовка миниатюр
  renderPictures(photos);

  // Инициализация галереи
  initGallery(photos);

  // Инициализация фильтров
  initFilters(photos, (filteredPhotos) => {
    renderPictures(filteredPhotos);
  });
}

// Инициализация формы загрузки
initUploadForm();

// Загрузка данных с сервера
getPhotos()
  .then((photos) => {
    initApp(photos);
  })
  .catch(() => {
    showDataErrorMessage();
  });
