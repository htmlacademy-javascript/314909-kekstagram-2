// Модуль галереи - связывает миниатюры и полноразмерный просмотр

import { openPicture, initPictureModal } from './big-picture-view.js';

const PICTURES_SELECTOR = '.pictures';
const PICTURE_SELECTOR = '.picture';

let currentPhotos = [];

/**
 * Обновляет текущий список фотографий в галерее
 * @param {Array} photos - массив фотографий
 */
const updatePhotos = (photos) => {
  currentPhotos = photos;
};

/**
 * Инициализирует галерею фотографий
 */
const initGallery = () => {
  const picturesElement = document.querySelector(PICTURES_SELECTOR);

  if (!picturesElement) {
    return;
  }

  // Инициализация модального окна
  initPictureModal();

  /**
   * Обработчик клика на миниатюру (Д4)
   */
  const onPicturesElementClick = (evt) => {
    const pictureElement = evt.target.closest(PICTURE_SELECTOR);
    if (pictureElement) {
      evt.preventDefault();

      // Находим индекс фотографии по data-id
      const photoId = Number(pictureElement.dataset.photoId);
      const photo = currentPhotos.find((p) => p.id === photoId);

      if (photo) {
        openPicture(photo);
      }
    }
  };

  picturesElement.addEventListener('click', onPicturesElementClick);
};

export { initGallery, updatePhotos };
