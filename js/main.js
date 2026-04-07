// Точка входа в приложение

import { photos } from './models/photo.js';
import { renderPictures } from './thumbnails.js';
import { initGallery } from './gallery.js';
import { initFilters } from './filters.js';
import { initUploadForm } from './upload-form.js';

// Инициализация формы загрузки
initUploadForm();

// Отрисовка миниатюр
renderPictures(photos);

// Инициализация галереи
initGallery(photos);

// Инициализация фильтров
initFilters(photos, (filteredPhotos) => {
  renderPictures(filteredPhotos);
});
