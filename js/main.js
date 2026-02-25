// Точка входа в приложение

import { photos, generatePhotosData } from './models/photo.js';
import { renderPictures } from './thumbnails.js';
import { initGallery } from './gallery.js';
import { initFilters } from './filters.js';

// Отрисовка миниатюр
renderPictures(photos);

// Инициализация галереи
initGallery(photos);

// Инициализация фильтров
initFilters(photos, (filteredPhotos) => {
  renderPictures(filteredPhotos);
});

// Экспорт для использования в других модулях
export { photos, generatePhotosData };
