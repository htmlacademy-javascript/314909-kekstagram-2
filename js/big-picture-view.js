// Модуль отрисовки полноразмерного изображения

const SELECTORS = {
  bigPicture: '.big-picture',
  bigPictureImg: '.big-picture__img img',
  bigPictureCaption: '.social__caption',
  bigPictureLikes: '.likes-count',
  bigPictureCommentShown: '.social__comment-shown-count',
  bigPictureCommentTotal: '.social__comment-total-count',
  bigPictureComments: '.social__comments',
  bigPictureCancel: '.big-picture__cancel',
  socialCommentCount: '.social__comment-count',
  commentsLoader: '.comments-loader'
};

let elementsCache = null;

/**
 * Получает элементы модального окна (кэширует результат)
 * @returns {Object|null}
 */
function getElements() {
  if (elementsCache) {
    return elementsCache;
  }

  const bigPicture = document.querySelector(SELECTORS.bigPicture);
  if (!bigPicture) {
    return null;
  }

  elementsCache = {
    bigPicture,
    imgElement: bigPicture.querySelector(SELECTORS.bigPictureImg),
    captionElement: bigPicture.querySelector(SELECTORS.bigPictureCaption),
    likesElement: bigPicture.querySelector(SELECTORS.bigPictureLikes),
    commentShownElement: bigPicture.querySelector(SELECTORS.bigPictureCommentShown),
    commentTotalElement: bigPicture.querySelector(SELECTORS.bigPictureCommentTotal),
    commentsElement: bigPicture.querySelector(SELECTORS.bigPictureComments),
    cancelElement: bigPicture.querySelector(SELECTORS.bigPictureCancel),
    commentCountElement: bigPicture.querySelector(SELECTORS.socialCommentCount),
    commentsLoaderElement: bigPicture.querySelector(SELECTORS.commentsLoader)
  };

  return elementsCache;
}

/**
 * Отрисовывает комментарии к фотографии
 * @param {Object} elements - элементы модального окна
 * @param {Array} comments - массив комментариев
 */
function renderComments(elements, comments) {
  const fragment = document.createDocumentFragment();

  comments.forEach((comment) => {
    const commentElement = document.createElement('li');
    commentElement.classList.add('social__comment');

    const avatarImg = document.createElement('img');
    avatarImg.classList.add('social__picture');
    avatarImg.src = comment.avatar;
    avatarImg.alt = comment.name;
    avatarImg.width = 35;
    avatarImg.height = 35;

    const commentText = document.createElement('p');
    commentText.classList.add('social__text');
    commentText.textContent = comment.message;

    commentElement.appendChild(avatarImg);
    commentElement.appendChild(commentText);
    fragment.appendChild(commentElement);
  });

  elements.commentsElement.appendChild(fragment);
}

/**
 * Открывает полноразмерное изображение
 * @param {Object} photo - объект фотографии
 */
function openPicture(photo) {
  const elements = getElements();
  if (!elements) {
    return;
  }

  elements.imgElement.src = photo.url;
  elements.captionElement.textContent = photo.description;
  elements.likesElement.textContent = photo.likes;
  elements.commentShownElement.textContent = photo.comments.length;
  elements.commentTotalElement.textContent = photo.comments.length;

  elements.commentsElement.innerHTML = '';
  renderComments(elements, photo.comments);

  elements.commentCountElement.classList.add('hidden');
  elements.commentsLoaderElement.classList.add('hidden');

  elements.bigPicture.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

/**
 * Закрывает полноразмерное изображение
 */
function closePicture() {
  const elements = getElements();
  if (!elements) {
    return;
  }

  elements.bigPicture.classList.add('hidden');
  document.body.classList.remove('modal-open');
  elements.commentsElement.innerHTML = '';
}

/**
 * Обрабатывает клик по кнопке закрытия
 * @param {Function} onClose - callback при закрытии
 */
function onCancelClick(onClose) {
  closePicture();
  if (onClose) {
    onClose();
  }
}

/**
 * Обрабатывает клик по оверлею
 * @param {Event} evt - событие клика
 * @param {Function} onClose - callback при закрытии
 */
function onOverlayClick(evt, onClose) {
  const elements = getElements();
  if (!elements) {
    return;
  }

  if (evt.target === elements.bigPicture) {
    closePicture();
    if (onClose) {
      onClose();
    }
  }
}

/**
 * Обрабатывает нажатие клавиши Escape
 * @param {KeyboardEvent} evt - событие клавиатуры
 * @param {Function} onClose - callback при закрытии
 */
function onEscapePress(evt, onClose) {
  const elements = getElements();
  if (!elements) {
    return;
  }

  if (evt.key === 'Escape' && !elements.bigPicture.classList.contains('hidden')) {
    evt.preventDefault();
    closePicture();
    if (onClose) {
      onClose();
    }
  }
}

/**
 * Инициализирует обработчики закрытия
 * @param {Function} onClose - callback при закрытии
 */
function initPictureModal(onClose) {
  const elements = getElements();
  if (!elements) {
    return;
  }

  elements.cancelElement.addEventListener('click', () => onCancelClick(onClose));
  elements.bigPicture.addEventListener('click', (evt) => onOverlayClick(evt, onClose));
  document.addEventListener('keydown', (evt) => onEscapePress(evt, onClose));
}

export { openPicture, closePicture, initPictureModal };
