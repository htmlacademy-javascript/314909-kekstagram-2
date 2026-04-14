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
let isModalInitialized = false;

/**
 * Получает элементы модального окна (кэширует результат)
 * @returns {Object|null}
 */
const getElements = () => {
  if (elementsCache) {
    return elementsCache;
  }

  const bigPictureElement = document.querySelector(SELECTORS.bigPicture);

  if (!bigPictureElement) {
    return null;
  }

  elementsCache = {
    bigPictureElement,
    imgElement: bigPictureElement.querySelector(SELECTORS.bigPictureImg),
    captionElement: bigPictureElement.querySelector(SELECTORS.bigPictureCaption),
    likesElement: bigPictureElement.querySelector(SELECTORS.bigPictureLikes),
    commentShownElement: bigPictureElement.querySelector(SELECTORS.bigPictureCommentShown),
    commentTotalElement: bigPictureElement.querySelector(SELECTORS.bigPictureCommentTotal),
    commentsElement: bigPictureElement.querySelector(SELECTORS.bigPictureComments),
    cancelElement: bigPictureElement.querySelector(SELECTORS.bigPictureCancel),
    commentCountElement: bigPictureElement.querySelector(SELECTORS.socialCommentCount),
    commentsLoaderElement: bigPictureElement.querySelector(SELECTORS.commentsLoader)
  };

  return elementsCache;
};

/**
 * Отрисовывает комментарии к фотографии
 * @param {Object} elements - элементы модального окна
 * @param {Array} comments - массив комментариев
 * @param {number} start - индекс начала порции
 * @param {number} end - индекс конца порции
 */
const renderComments = (elements, comments, start, end) => {
  const fragmentElement = document.createDocumentFragment();
  const commentsToRender = comments.slice(start, end);

  commentsToRender.forEach((comment) => {
    const commentElement = document.createElement('li');
    commentElement.classList.add('social__comment');

    const avatarElement = document.createElement('img');
    avatarElement.classList.add('social__picture');
    avatarElement.src = comment.avatar;
    avatarElement.alt = comment.name;
    avatarElement.width = AVATAR_SIZE;
    avatarElement.height = AVATAR_SIZE;

    const commentTextElement = document.createElement('p');
    commentTextElement.classList.add('social__text');
    commentTextElement.textContent = comment.message;

    commentElement.append(avatarElement, commentTextElement);
    fragmentElement.append(commentElement);
  });

  elements.commentsElement.append(fragmentElement);
};

/**
 * Обновляет счётчик показанных комментариев
 * @param {Object} elements - элементы модального окна
 */
const updateCommentCount = (elements) => {
  elements.commentShownElement.textContent = displayedCommentsCount;
};

/**
 * Очищает контейнер комментариев
 * @param {Object} elements - элементы модального окна
 */
const clearComments = (elements) => {
  elements.commentsElement.innerHTML = '';
};

/**
 * Загружает следующую порцию комментариев
 * @param {Object} elements - элементы модального окна
 */
const loadMoreComments = (elements) => {
  const start = displayedCommentsCount;
  const end = Math.min(start + COMMENTS_PER_PAGE, currentComments.length);

  renderComments(elements, currentComments, start, end);
  displayedCommentsCount = end;
  updateCommentCount(elements);

  if (displayedCommentsCount >= currentComments.length) {
    elements.commentsLoaderElement.classList.add('hidden');
  }
};

/**
 * Закрывает полноразмерное изображение
 */
const closePicture = () => {
  const elements = getElements();

  if (!elements) {
    return;
  }

  elements.bigPictureElement.classList.add('hidden');
  document.body.classList.remove('modal-open');
  clearComments(elements);

  currentComments = [];
  displayedCommentsCount = 0;
};

/**
 * Закрывает полноразмерное изображение и вызывает callback
 * @param {Function} onClose - callback при закрытии
 */
const handleClose = (onClose) => {
  closePicture();
  onClose?.();
};

/**
 * Обрабатывает клик по оверлею
 * @param {Event} evt - событие клика
 * @param {Function} onClose - callback при закрытии
 */
const onBigPictureOverlayClick = (evt, onClose) => {
  const elements = getElements();

  if (!elements) {
    return;
  }

  if (evt.target === elements.bigPictureElement) {
    handleClose(onClose);
  }
};

/**
 * Открывает полноразмерное изображение
 * @param {Object} photo - объект фотографии
 */
const openPicture = (photo) => {
  const elements = getElements();

  if (!elements) {
    return;
  }

  elements.imgElement.src = photo.url;
  elements.captionElement.textContent = photo.description;
  elements.likesElement.textContent = photo.likes;

  currentComments = photo.comments;
  displayedCommentsCount = 0;

  elements.commentTotalElement.textContent = photo.comments.length;

  clearComments(elements);

  elements.commentCountElement.classList.remove('hidden');
  elements.commentsLoaderElement.classList.remove('hidden');

  loadMoreComments(elements);

  elements.bigPictureElement.classList.remove('hidden');
  document.body.classList.add('modal-open');
};

/**
 * Инициализирует обработчики закрытия
 * @param {Function} onClose - callback при закрытии
 */
const initPictureModal = (onClose) => {
  if (isModalInitialized) {
    return;
  }

  isModalInitialized = true;

  const elements = getElements();

  if (!elements) {
    return;
  }

  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
  }

  /**
   * Обработчик нажатия клавиши Escape
   * @param {KeyboardEvent} evt - событие клавиатуры
   */
  const onDocumentKeydown = (evt) => {
    const currentElements = getElements();

    if (!currentElements) {
      return;
    }

    if (evt.key === 'Escape' && !currentElements.bigPictureElement.classList.contains('hidden')) {
      evt.preventDefault();
      handleClose(onClose);
    }
  };

  /**
   * Обработчик клика по кнопке «Загрузить ещё»
   */
  const onCommentsLoaderClick = () => {
    loadMoreComments(elements);
  };

  /**
   * Обработчик клика по кнопке закрытия
   */
  const onBigPictureCancelClick = () => {
    handleClose(onClose);
  };

  /**
   * Обработчик клика по области модального окна
   * @param {MouseEvent} evt - событие мыши
   */
  const onBigPictureClick = (evt) => {
    onBigPictureOverlayClick(evt, onClose);
  };

  escapeHandler = onDocumentKeydown;

  document.addEventListener('keydown', onDocumentKeydown);
  elements.cancelElement.addEventListener('click', onBigPictureCancelClick);
  elements.bigPictureElement.addEventListener('click', onBigPictureClick);
  elements.commentsLoaderElement.addEventListener('click', onCommentsLoaderClick);
};

export { openPicture, initPictureModal };
