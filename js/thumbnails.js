// Модуль отрисовки миниатюр фотографий

const PICTURE_SELECTOR = '.pictures';
const TEMPLATE_SELECTOR = '#picture';

/**
 * Создаёт DOM-элемент миниатюры фотографии
 * @param {Object} photo - объект фотографии
 * @param {HTMLTemplateElement} template - шаблон миниатюры
 * @returns {HTMLElement}
 */
function createPictureElement(photo, template) {
  const pictureElement = template.cloneNode(true).querySelector('.picture');

  const img = pictureElement.querySelector('.picture__img');
  img.src = photo.url;
  img.alt = photo.description;

  pictureElement.querySelector('.picture__comments').textContent = photo.comments.length;
  pictureElement.querySelector('.picture__likes').textContent = photo.likes;

  return pictureElement;
}

/**
 * Очищает контейнер с фотографиями
 */
function clearPictures() {
  const picturesContainer = document.querySelector(PICTURE_SELECTOR);
  if (!picturesContainer) {
    return;
  }

  const photoElements = picturesContainer.querySelectorAll('.picture');
  photoElements.forEach((element) => element.remove());
}

/**
 * Отрисовывает миниатюры фотографий на странице
 * @param {Array} photos - массив фотографий
 */
function renderPictures(photos) {
  clearPictures();

  const picturesContainer = document.querySelector(PICTURE_SELECTOR);
  const pictureTemplate = document.querySelector(TEMPLATE_SELECTOR);

  if (!picturesContainer || !pictureTemplate) {
    return;
  }

  const fragment = document.createDocumentFragment();

  photos.forEach((photo) => {
    const pictureElement = createPictureElement(photo, pictureTemplate.content);
    fragment.appendChild(pictureElement);
  });

  picturesContainer.appendChild(fragment);
}

export { renderPictures, clearPictures };
