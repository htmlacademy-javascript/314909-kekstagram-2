// Модуль галереи - связывает миниатюры и полноразмерный просмотр

import { openPicture, initPictureModal } from './big-picture-view.js';

/**
 * Инициализирует галерею фотографий
 * @param {Array} photos - массив фотографий
 */
const initGallery = (photos) => {
  const picturesElement = document.querySelector('.pictures');

  if (!picturesElement) {
    return;
  }

  // Инициализация модального окна
  initPictureModal();

  // Обработчик клика на миниатюру
  picturesElement.addEventListener('click', (evt) => {
    const pictureElement = evt.target.closest('.picture');
    if (pictureElement) {
      evt.preventDefault();

      // Находим индекс фотографии
      const pictureElements = Array.from(picturesElement.querySelectorAll('.picture'));
      const index = pictureElements.indexOf(pictureElement);

      if (index !== -1) {
        openPicture(photos[index]);
      }
    }
  });
};

export { initGallery };
