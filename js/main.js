// Точка входа в приложение
import { getPhotos } from './api.js';
import { renderTemplateMessage } from './utils/render-template-message.js';
import { renderPictures } from './thumbnails.js';
import { initGallery } from './gallery.js';
import { initFilters } from './filters.js';
import { initUploadForm } from './upload-form.js';

const DATA_ERROR_TEMPLATE_SELECTOR = '#data-error';
const ERROR_MESSAGE_TIMEOUT = 5000;

/**
 * Показывает сообщение об ошибке загрузки данных
 */
const showDataErrorMessage = () => {
  const errorElement = renderTemplateMessage(DATA_ERROR_TEMPLATE_SELECTOR);

  if (errorElement) {
    setTimeout(() => errorElement.remove(), ERROR_MESSAGE_TIMEOUT);
  }
};

/**
 * Показывает блок фильтров фотографий
 */
const showFilters = () => {
  const filtersElement = document.querySelector('.img-filters');

  if (filtersElement) {
    filtersElement.classList.remove('img-filters--inactive');
  }
};

/**
 * Инициализирует приложение с загруженными данными
 * @param {Array} photos - массив фотографий с сервера
 */
const initApp = (photos) => {
  showFilters();

  renderPictures(photos);
  initGallery(photos);

  initFilters(photos, (filteredPhotos) => {
    renderPictures(filteredPhotos);
  });
};

initUploadForm();
initFilters(); // Инициализируем обработчики сразу

getPhotos()
  .then(initApp)
  .catch(showDataErrorMessage);
