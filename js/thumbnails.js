// Модуль отрисовки миниатюр фотографий

const PICTURE_SELECTOR = '.pictures';
const TEMPLATE_SELECTOR = '#picture';
const PICTURE_ELEMENT_SELECTOR = '.picture';
const PICTURE_IMG_SELECTOR = '.picture__img';
const PICTURE_COMMENTS_SELECTOR = '.picture__comments';
const PICTURE_LIKES_SELECTOR = '.picture__likes';

let picturesContainer = null;
let pictureTemplate = null;

/**
 * Инициализирует элементы для отрисовки
 */
function initElements() {
  if (!picturesContainer) {
    picturesContainer = document.querySelector(PICTURE_SELECTOR);
  }
  if (!pictureTemplate) {
    pictureTemplate = document.querySelector(TEMPLATE_SELECTOR);
  }
}

/**
 * Создаёт DOM-элемент миниатюры фотографии
 * @param {Object} photo - объект фотографии
 * @param {HTMLTemplateElement} template - шаблон миниатюры
 * @returns {HTMLElement}
 */
function createPictureElement(photo, template) {
  const pictureElement = template.cloneNode(true).querySelector(PICTURE_ELEMENT_SELECTOR);

  const img = pictureElement.querySelector(PICTURE_IMG_SELECTOR);
  img.src = photo.url;
  img.alt = photo.description;

  pictureElement.querySelector(PICTURE_COMMENTS_SELECTOR).textContent = photo.comments.length;
  pictureElement.querySelector(PICTURE_LIKES_SELECTOR).textContent = photo.likes;

  return pictureElement;
}

/**
 * Очищает контейнер с фотографиями
 */
function clearPictures() {
  initElements();

  if (!picturesContainer) {
    return;
  }

  const photoElements = picturesContainer.querySelectorAll(PICTURE_ELEMENT_SELECTOR);
  photoElements.forEach((element) => element.remove());
}

/**
 * Отрисовывает миниатюры фотографий на странице
 * @param {Array} photos - массив фотографий
 */
function renderPictures(photos) {
  clearPictures();
  initElements();

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
