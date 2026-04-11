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

const COMMENTS_PER_PAGE = 5;
const AVATAR_SIZE = 35;

let elementsCache = null;
let currentComments = [];
let displayedCommentsCount = 0;
let escapeHandler = null;

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
 * @param {number} start - индекс начала порции
 * @param {number} end - индекс конца порции
 */
function renderComments(elements, comments, start, end) {
  const fragment = document.createDocumentFragment();
  const commentsToRender = comments.slice(start, end);

  commentsToRender.forEach((comment) => {
    const commentElement = document.createElement('li');
    commentElement.classList.add('social__comment');

    const avatarImg = document.createElement('img');
    avatarImg.classList.add('social__picture');
    avatarImg.src = comment.avatar;
    avatarImg.alt = comment.name;
    avatarImg.width = AVATAR_SIZE;
    avatarImg.height = AVATAR_SIZE;

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
 * Обновляет счётчик показанных комментариев
 * @param {Object} elements - элементы модального окна
 */
function updateCommentCount(elements) {
  elements.commentShownElement.textContent = displayedCommentsCount;
}

/**
 * Загружает следующую порцию комментариев
 * @param {Object} elements - элементы модального окна
 */
function loadMoreComments(elements) {
  const start = displayedCommentsCount;
  const end = Math.min(start + COMMENTS_PER_PAGE, currentComments.length);

  renderComments(elements, currentComments, start, end);
  displayedCommentsCount = end;
  updateCommentCount(elements);

  // Скрываем кнопку, если показаны все комментарии
  if (displayedCommentsCount >= currentComments.length) {
    elements.commentsLoaderElement.classList.add('hidden');
  }
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

  // Инициализируем состояние комментариев
  currentComments = photo.comments;
  displayedCommentsCount = 0;

  elements.commentTotalElement.textContent = photo.comments.length;

  elements.commentsElement.innerHTML = '';

  // Показываем блоки счётчика и загрузки
  elements.commentCountElement.classList.remove('hidden');
  elements.commentsLoaderElement.classList.remove('hidden');

  // Загружаем первую порцию комментариев
  loadMoreComments(elements);

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

  // Сбрасываем состояние комментариев
  currentComments = [];
  displayedCommentsCount = 0;

  // Удаляем обработчик Escape при закрытии окна
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }
}

/**
 * Закрывает полноразмерное изображение и вызывает callback
 * @param {Function} onClose - callback при закрытии
 */
const handleClose = (onClose) => {
  closePicture();
  onClose?.();
};

/**
 * Обрабатывает клик по кнопке закрытия
 * @param {Function} onClose - callback при закрытии
 */
const onCancelClick = (onClose) => handleClose(onClose);

/**
 * Обрабатывает клик по оверлею
 * @param {Event} evt - событие клика
 * @param {Function} onClose - callback при закрытии
 */
const onOverlayClick = (evt, onClose) => {
  const elements = getElements();

  if (!elements) {
    return;
  }

  if (evt.target === elements.bigPicture) {
    handleClose(onClose);
  }
};

/**
 * Инициализирует обработчики закрытия
 * @param {Function} onClose - callback при закрытии
 */
function initPictureModal(onClose) {
  const elements = getElements();

  if (!elements) {
    return;
  }

  /**
   * Обработчик нажатия клавиши Escape
   */
  function onEscapePress(evt) {
    const currentElements = getElements();

    if (!currentElements) {
      return;
    }

    if (evt.key === 'Escape' && !currentElements.bigPicture.classList.contains('hidden')) {
      evt.preventDefault();
      closePicture();
      onClose?.();
    }
  }

  // Сохраняем ссылку на обработчик для удаления
  escapeHandler = onEscapePress;

  // Удаляем старый обработчик перед добавлением нового (защита от дублирования)
  document.removeEventListener('keydown', onEscapePress);

  // Добавляем обработчик Escape
  document.addEventListener('keydown', onEscapePress);

  elements.cancelElement.addEventListener('click', () => onCancelClick(onClose));
  elements.bigPicture.addEventListener('click', (evt) => onOverlayClick(evt, onClose));

  // Обработчик кнопки «Загрузить ещё»
  elements.commentsLoaderElement.addEventListener('click', () => loadMoreComments(elements));
}

export { openPicture, initPictureModal };
