// Модуль отрисовки миниатюр фотографий

const PICTURE_SELECTOR = '.pictures';
const TEMPLATE_SELECTOR = '#picture';
const PICTURE_ELEMENT_SELECTOR = '.picture';
const PICTURE_IMG_SELECTOR = '.picture__img';
const PICTURE_COMMENTS_SELECTOR = '.picture__comments';
const PICTURE_LIKES_SELECTOR = '.picture__likes';

let picturesElement = null;
let pictureTemplateElement = null;

/**
 * Инициализирует элементы для отрисовки
 */
const initElements = () => {
  if (!picturesElement) {
    picturesElement = document.querySelector(PICTURE_SELECTOR);
  }

  if (!pictureTemplateElement) {
    pictureTemplateElement = document.querySelector(TEMPLATE_SELECTOR);
  }
};

/**
 * Создаёт DOM-элемент миниатюры фотографии
 * @param {Object} photo - объект фотографии
 * @param {HTMLTemplateElement} template - шаблон миниатюры
 * @returns {HTMLElement}
 */
const createPictureElement = (photo, template) => {
  const pictureElement = template.cloneNode(true).querySelector(PICTURE_ELEMENT_SELECTOR);

  const imgElement = pictureElement.querySelector(PICTURE_IMG_SELECTOR);
  imgElement.src = photo.url;
  imgElement.alt = photo.description;

  pictureElement.querySelector(PICTURE_COMMENTS_SELECTOR).textContent = photo.comments.length;
  pictureElement.querySelector(PICTURE_LIKES_SELECTOR).textContent = photo.likes;

  return pictureElement;
};

/**
 * Очищает контейнер с фотографиями
 */
const clearPictures = () => {
  initElements();

  if (!picturesElement) {
    return;
  }

  const photoElements = picturesElement.querySelectorAll(PICTURE_ELEMENT_SELECTOR);
  photoElements.forEach((element) => element.remove());
};

/**
 * Отрисовывает миниатюры фотографий на странице
 * @param {Array} photos - массив фотографий
 */
const renderPictures = (photos) => {
  clearPictures();
  initElements();

  if (!picturesElement || !pictureTemplateElement) {
    return;
  }

  const fragmentElement = document.createDocumentFragment();

  photos.forEach((photo) => {
    const pictureElement = createPictureElement(photo, pictureTemplateElement.content);
    fragmentElement.appendChild(pictureElement);
  });

  picturesElement.appendChild(fragmentElement);
};

export { renderPictures };
