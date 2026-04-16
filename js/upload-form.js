// Модуль работы с формой загрузки изображения

import { uploadPhoto } from './api.js';
import { renderTemplateMessage } from './utils/render-template-message.js';
import {
  SCALE_STEP,
  SCALE_MIN,
  SCALE_MAX,
  MAX_HASHTAGS,
  MAX_HASHTAG_LENGTH,
  MAX_DESCRIPTION_LENGTH
} from './constants.js';

const SELECTORS = {
  form: '.img-upload__form',
  formOverlay: '.img-upload__overlay',
  formInput: '#upload-file',
  formCancel: '#upload-cancel',
  previewImg: '.img-upload__preview img',
  effectsPreview: '.effects__preview',
  scaleSmaller: '.scale__control--smaller',
  scaleBigger: '.scale__control--bigger',
  scaleValue: '.scale__control--value',
  effectLevel: '.img-upload__effect-level',
  effectLevelValue: '.effect-level__value',
  effectLevelSlider: '.effect-level__slider',
  effectsRadio: '.effects__radio',
  hashtags: '.text__hashtags',
  description: '.text__description',
  submit: '#upload-submit'
};

const EFFECTS = {
  none: {
    filter: '',
    unit: '',
    min: 0,
    max: 100,
    step: 1,
    start: 100
  },
  chrome: {
    filter: 'grayscale',
    unit: '',
    min: 0,
    max: 1,
    step: 0.1,
    start: 1
  },
  sepia: {
    filter: 'sepia',
    unit: '',
    min: 0,
    max: 1,
    step: 0.1,
    start: 1
  },
  marvin: {
    filter: 'invert',
    unit: '%',
    min: 0,
    max: 100,
    step: 1,
    start: 100
  },
  phobos: {
    filter: 'blur',
    unit: 'px',
    min: 0,
    max: 3,
    step: 0.1,
    start: 3
  },
  heat: {
    filter: 'brightness',
    unit: '',
    min: 1,
    max: 3,
    step: 0.1,
    start: 3
  }
};

const FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif'];
const HASHTAG_REGEX = /^#[a-zа-яё0-9]{1,19}$/i;
const HASHTAG_VALIDATOR_PRIORITY = 1;
const DESCRIPTION_VALIDATOR_PRIORITY = 2;

let pristine = null;
let slider = null;
let currentScale = 1;
let currentEffect = 'none';
let onDocumentEscapeKeyDown = null;
let isUploadFormInitialized = false;
let isSubmitting = false;
let currentPreviewUrl = '';
let elementsCache = null;

/**
 * Получает элементы формы
 * @returns {Object|null}
 */
const getElements = () => {
  if (elementsCache) {
    return elementsCache;
  }

  const formElement = document.querySelector(SELECTORS.form);

  if (!formElement) {
    return null;
  }

  elementsCache = {
    formElement,
    overlayElement: formElement.querySelector(SELECTORS.formOverlay),
    inputElement: formElement.querySelector(SELECTORS.formInput),
    cancelElement: formElement.querySelector(SELECTORS.formCancel),
    previewImgElement: formElement.querySelector(SELECTORS.previewImg),
    effectsPreviewElements: formElement.querySelectorAll(SELECTORS.effectsPreview),
    scaleSmallerElement: formElement.querySelector(SELECTORS.scaleSmaller),
    scaleBiggerElement: formElement.querySelector(SELECTORS.scaleBigger),
    scaleValueElement: formElement.querySelector(SELECTORS.scaleValue),
    effectLevelElement: formElement.querySelector(SELECTORS.effectLevel),
    effectLevelValueElement: formElement.querySelector(SELECTORS.effectLevelValue),
    effectLevelSliderElement: formElement.querySelector(SELECTORS.effectLevelSlider),
    effectsRadioElements: formElement.querySelectorAll(SELECTORS.effectsRadio),
    hashtagsElement: formElement.querySelector(SELECTORS.hashtags),
    descriptionElement: formElement.querySelector(SELECTORS.description),
    submitElement: formElement.querySelector(SELECTORS.submit)
  };

  return elementsCache;
};

/**
 * Проверяет, нажата ли клавиша Escape
 * @param {KeyboardEvent} evt - событие клавиатуры
 * @returns {boolean}
 */
const isEscapeKey = (evt) => evt.key === 'Escape';

/**
 * Переключает состояние кнопки отправки
 * @param {Object} elements - элементы формы
 * @param {boolean} isDisabled - признак блокировки
 */
const toggleSubmitButton = (elements, isDisabled) => {
  elements.submitElement.disabled = isDisabled;
};

/**
 * Добавляет обработчик закрытия формы по Escape
 * @param {Function} handler - обработчик keydown
 */
const bindEscapeHandler = (handler) => {
  if (onDocumentEscapeKeyDown) {
    document.removeEventListener('keydown', onDocumentEscapeKeyDown);
  }

  onDocumentEscapeKeyDown = handler;
  document.addEventListener('keydown', onDocumentEscapeKeyDown);
};

/**
 * Удаляет обработчик закрытия формы по Escape
 */
const unbindEscapeHandler = () => {
  if (!onDocumentEscapeKeyDown) {
    return;
  }

  document.removeEventListener('keydown', onDocumentEscapeKeyDown);
  onDocumentEscapeKeyDown = null;
};

/**
 * Освобождает blob URL превью
 */
const revokePreviewUrl = () => {
  if (!currentPreviewUrl) {
    return;
  }

  URL.revokeObjectURL(currentPreviewUrl);
  currentPreviewUrl = '';
};

/**
 * Сбрасывает визуальный эффект с изображения
 * @param {Object} elements - элементы формы
 */
const clearEffect = (elements) => {
  elements.previewImgElement.style.filter = '';
  elements.effectsPreviewElements.forEach((previewElement) => {
    previewElement.style.filter = '';
  });
};

/**
 * Сбрасывает масштаб изображения
 * @param {Object} elements - элементы формы
 */
const resetScale = (elements) => {
  currentScale = 1;
  elements.scaleValueElement.value = '100%';
  elements.previewImgElement.style.transform = 'scale(1)';
};

/**
 * Сбрасывает состояние эффектов
 * @param {Object} elements - элементы формы
 */
const resetEffectState = (elements) => {
  currentEffect = 'none';
  clearEffect(elements);
  elements.effectLevelElement.classList.add('hidden');

  elements.effectsPreviewElements.forEach((previewElement) => {
    previewElement.style.backgroundImage = '';
  });
};

/**
 * Полностью сбрасывает состояние формы
 * @param {Object} elements - элементы формы
 */
const resetFormState = (elements) => {
  elements.inputElement.value = '';
  elements.formElement.reset();
  toggleSubmitButton(elements, false);
  pristine.reset();

  resetScale(elements);
  resetEffectState(elements);

  isSubmitting = false;
  revokePreviewUrl();
};

/**
 * Применяет визуальный эффект к изображению
 * @param {Object} elements - элементы формы
 * @param {string} value - текущее значение слайдера
 */
const applyEffect = (elements, value) => {
  const effect = EFFECTS[currentEffect];

  if (currentEffect === 'none') {
    clearEffect(elements);
    return;
  }

  const filterValue = `${effect.filter}(${value}${effect.unit})`;
  elements.previewImgElement.style.filter = filterValue;

  elements.effectsPreviewElements.forEach((previewElement) => {
    previewElement.style.filter = filterValue;
  });
};

/**
 * Инициализирует слайдер noUiSlider
 * @param {Object} elements - элементы формы
 */
const initSlider = (elements) => {
  if (slider) {
    slider.destroy();
  }

  const effect = EFFECTS[currentEffect];

  elements.effectLevelValueElement.value = String(effect.start);
  applyEffect(elements, String(effect.start));

  slider = noUiSlider.create(elements.effectLevelSliderElement, {
    range: {
      min: effect.min,
      max: effect.max
    },
    start: effect.start,
    step: effect.step,
    connect: 'lower'
  });

  slider.on('update', () => {
    const value = slider.get();
    const numericValue = parseFloat(value);

    elements.effectLevelValueElement.value = numericValue;
    applyEffect(elements, String(numericValue));
  });
};

/**
 * Показывает или скрывает блок уровня эффекта
 * @param {Object} elements - элементы формы
 */
const updateEffectVisibility = (elements) => {
  elements.effectLevelElement.classList.toggle('hidden', currentEffect === 'none');
};

/**
 * Обновляет масштаб изображения
 * @param {Object} elements - элементы формы
 * @param {number} step - шаг изменения масштаба
 */
const updateScale = (elements, step) => {
  const newScale = currentScale + step;

  if (newScale < SCALE_MIN || newScale > SCALE_MAX) {
    return;
  }

  currentScale = newScale;
  elements.previewImgElement.style.transform = `scale(${currentScale})`;
  elements.scaleValueElement.value = `${Math.round(currentScale * 100)}%`;
};

/**
 * Разбивает строку хэштегов в массив
 * @param {string} value - значение поля
 * @returns {string[]}
 */
const parseHashtags = (value) => value.trim().split(/\s+/).filter(Boolean);

/**
 * Проверяет, состоит ли хэштег только из символа #
 * @param {string} hashtag - хэштег
 * @returns {boolean}
 */
const isSingleHash = (hashtag) => hashtag === '#';

/**
 * Проверяет длину хэштега
 * @param {string} hashtag - хэштег
 * @returns {boolean}
 */
const isHashtagTooLong = (hashtag) => hashtag.length > MAX_HASHTAG_LENGTH;

/**
 * Проверяет формат хэштега
 * @param {string} hashtag - хэштег
 * @returns {boolean}
 */
const isHashtagFormatValid = (hashtag) => HASHTAG_REGEX.test(hashtag);

/**
 * Создаёт объект ошибки валидации
 * @param {string} error - текст ошибки
 * @returns {{isValid: boolean, error: string}}
 */
const createInvalidResult = (error) => ({ isValid: false, error });

/**
 * Создаёт успешный результат валидации
 * @returns {{isValid: boolean, error: null}}
 */
const createValidResult = () => ({ isValid: true, error: null });

/**
 * Возвращает сообщение об ошибке хэштега
 * @param {string} hashtag - хэштег
 * @returns {string|null}
 */
const getSingleHashtagError = (hashtag) => {
  if (isSingleHash(hashtag)) {
    return 'Хэш-тег не может состоять только из одной решётки';
  }

  if (isHashtagTooLong(hashtag)) {
    return `Максимальная длина хэштега ${MAX_HASHTAG_LENGTH} символов`;
  }

  if (!isHashtagFormatValid(hashtag)) {
    return 'Неправильный хэштег';
  }

  return null;
};

/**
 * Проверяет один хэштег
 * @param {string} hashtag - хэштег
 * @param {Set<string>} usedHashtags - использованные хэштеги
 * @returns {{isValid: boolean, error: string|null}}
 */
const validateSingleHashtag = (hashtag, usedHashtags) => {
  const hashtagError = getSingleHashtagError(hashtag);

  if (hashtagError) {
    return createInvalidResult(hashtagError);
  }

  const lowerHashtag = hashtag.toLowerCase();

  if (usedHashtags.has(lowerHashtag)) {
    return createInvalidResult('Хэштеги не должны повторяться');
  }

  usedHashtags.add(lowerHashtag);

  return createValidResult();
};

/**
 * Проверяет, пуст ли список хэштегов
 * @param {string[]} hashtags - массив хэштегов
 * @returns {boolean}
 */
const isEmptyHashtagsList = (hashtags) => hashtags.length === 0;

/**
 * Проверяет превышение количества хэштегов
 * @param {string[]} hashtags - массив хэштегов
 * @returns {boolean}
 */
const isHashtagsLimitExceeded = (hashtags) => hashtags.length > MAX_HASHTAGS;

/**
 * Возвращает сообщение об ошибке количества хэштегов
 * @returns {string}
 */
const getHashtagsCountErrorMessage = () => `Нельзя указать больше ${MAX_HASHTAGS} хэштегов`;

/**
 * Валидирует список хэштегов по одному
 * @param {string[]} hashtags - массив хэштегов
 * @returns {{isValid: boolean, error: string|null}}
 */
const validateHashtagsList = (hashtags) => {
  const usedHashtags = new Set();

  for (const hashtag of hashtags) {
    const validationResult = validateSingleHashtag(hashtag, usedHashtags);

    if (!validationResult.isValid) {
      return validationResult;
    }
  }

  return createValidResult();
};

/**
 * Проверяет хэштеги и возвращает результат проверки
 * @param {string} value - значение поля
 * @returns {{isValid: boolean, error: string|null}}
 */
const validateHashtagsWithResult = (value) => {
  const hashtags = parseHashtags(value);

  if (isEmptyHashtagsList(hashtags)) {
    return createValidResult();
  }

  if (isHashtagsLimitExceeded(hashtags)) {
    return createInvalidResult(getHashtagsCountErrorMessage());
  }

  return validateHashtagsList(hashtags);
};

/**
 * Проверяет валидность хэштегов
 * @param {string} value - значение поля
 * @returns {boolean}
 */
const validateHashtags = (value) => validateHashtagsWithResult(value).isValid;

/**
 * Возвращает сообщение об ошибке для хэштегов
 * @param {string} value - значение поля
 * @returns {string}
 */
const getHashtagErrorMessage = (value) => validateHashtagsWithResult(value).error || '';

/**
 * Проверяет комментарий
 * @param {string} value - значение поля
 * @returns {boolean}
 */
const validateDescription = (value) => value.length <= MAX_DESCRIPTION_LENGTH;

/**
 * Возвращает сообщение об ошибке для комментария
 * @returns {string}
 */
const getDescriptionErrorMessage = () => `Длина комментария не может превышать ${MAX_DESCRIPTION_LENGTH} символов`;

/**
 * Проверяет формат загружаемого файла
 * @param {File} file - выбранный файл
 * @returns {boolean}
 */
const isValidFileType = (file) => {
  const fileName = file.name.toLowerCase();
  return FILE_TYPES.some((extension) => fileName.endsWith(`.${extension}`));
};

/**
 * Инициализирует Pristine
 * @param {Object} elements - элементы формы
 */
const initValidation = (elements) => {
  pristine = new Pristine(elements.formElement, {
    classTo: 'img-upload__field-wrapper',
    errorClass: 'img-upload__field-wrapper--error',
    errorTextParent: 'img-upload__field-wrapper',
    errorTextTag: 'div',
    errorTextClass: 'pristine-error'
  });

  pristine.addValidator(
    elements.hashtagsElement,
    validateHashtags,
    getHashtagErrorMessage,
    HASHTAG_VALIDATOR_PRIORITY,
    false
  );

  pristine.addValidator(
    elements.descriptionElement,
    validateDescription,
    getDescriptionErrorMessage,
    DESCRIPTION_VALIDATOR_PRIORITY,
    false
  );
};

/**
 * Проверяет, открыта ли форма
 * @param {Object} elements - элементы формы
 * @returns {boolean}
 */
const isFormOpened = (elements) => !elements.overlayElement.classList.contains('hidden');

/**
 * Проверяет, открыто ли сервисное сообщение
 * @returns {boolean}
 */
const isMessageOpened = () => Boolean(document.querySelector('.error') || document.querySelector('.success'));

/**
 * Проверяет, находится ли фокус в текстовых полях формы
 * @param {Object} elements - элементы формы
 * @returns {boolean}
 */
const isTextFieldFocused = (elements) => {
  const activeElement = document.activeElement;
  return activeElement === elements.hashtagsElement || activeElement === elements.descriptionElement;
};

/**
 * Открывает форму редактирования изображения
 * @param {Object} elements - элементы формы
 * @param {File} file - выбранный файл
 * @param {Function} onEscapePress - обработчик Escape
 */
const openForm = (elements, file, onEscapePress) => {
  revokePreviewUrl();
  currentPreviewUrl = URL.createObjectURL(file);

  elements.previewImgElement.src = currentPreviewUrl;
  elements.effectsPreviewElements.forEach((previewElement) => {
    previewElement.style.backgroundImage = `url(${currentPreviewUrl})`;
  });

  elements.overlayElement.classList.remove('hidden');
  document.body.classList.add('modal-open');

  toggleSubmitButton(elements, false);
  isSubmitting = false;
  resetScale(elements);
  currentEffect = 'none';
  elements.effectLevelElement.classList.add('hidden');
  initSlider(elements);
  bindEscapeHandler(onEscapePress);
};

/**
 * Закрывает форму редактирования изображения
 * @param {Object} elements - элементы формы
 */
const closeForm = (elements) => {
  elements.overlayElement.classList.add('hidden');
  document.body.classList.remove('modal-open');

  resetFormState(elements);
  unbindEscapeHandler();
};

/**
 * Удаляет сообщение со страницы
 * @param {string} overlaySelector - селектор оверлея сообщения
 */
const removeMessageElement = (overlaySelector) => {
  document.querySelector(overlaySelector)?.remove();
};

/**
 * Добавляет обработчики закрытия сервисного сообщения
 * @param {HTMLElement|null} overlayElement - элемент оверлея
 * @param {HTMLElement|null} closeButtonElement - кнопка закрытия
 * @param {Function} closeMessage - функция закрытия
 * @returns {{onMessageEscapeKeyDown: Function, onOverlayClick: Function}}
 */
const addMessageCloseHandlers = (overlayElement, closeButtonElement, closeMessage) => {
  const onMessageEscapeKeyDown = (evt) => {
    if (!isEscapeKey(evt)) {
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();
    closeMessage();
  };

  const onOverlayClick = (evt) => {
    if (evt.target === overlayElement) {
      closeMessage();
    }
  };

  closeButtonElement?.addEventListener('click', closeMessage);
  document.addEventListener('keydown', onMessageEscapeKeyDown);
  overlayElement?.addEventListener('click', onOverlayClick);

  return {
    onMessageEscapeKeyDown,
    onOverlayClick
  };
};

/**
 * Показывает сообщение на основе шаблона
 * @param {string} templateId - идентификатор шаблона
 * @param {string} overlaySelector - селектор оверлея
 * @param {string} buttonSelector - селектор кнопки закрытия
 */
const showMessage = (templateId, overlaySelector, buttonSelector) => {
  const messageElement = renderTemplateMessage(templateId);

  if (!messageElement) {
    return;
  }

  const overlayElement = document.querySelector(overlaySelector);
  const closeButtonElement = document.querySelector(buttonSelector);

  let handlers = null;

  const closeMessage = () => {
    removeMessageElement(overlaySelector);

    if (handlers) {
      document.removeEventListener('keydown', handlers.onMessageEscapeKeyDown);
      overlayElement?.removeEventListener('click', handlers.onOverlayClick);
    }

    closeButtonElement?.removeEventListener('click', closeMessage);
  };

  handlers = addMessageCloseHandlers(overlayElement, closeButtonElement, closeMessage);
};

/**
 * Показывает сообщение об успешной отправке
 */
const showSuccessMessage = () => showMessage('#success', '.success', '.success__button');

/**
 * Показывает сообщение об ошибке отправки
 */
const showErrorMessage = () => showMessage('#error', '.error', '.error__button');

/**
 * Обрабатывает отправку формы
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие отправки
 */
const onFormSubmit = async (elements, evt) => {
  evt.preventDefault();

  if (isSubmitting) {
    return;
  }

  const isValid = pristine.validate();

  if (!isValid) {
    return;
  }

  isSubmitting = true;
  toggleSubmitButton(elements, true);

  try {
    await uploadPhoto(new FormData(elements.formElement));
    closeForm(elements);
    showSuccessMessage();
  } catch {
    isSubmitting = false;
    toggleSubmitButton(elements, false);
    showErrorMessage();
  }
};

/**
 * Обрабатывает выбор файла
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие изменения
 * @param {Function} onEscapePress - обработчик Escape
 */
const onInputChange = (elements, evt, onEscapePress) => {
  const file = evt.target.files[0];

  if (!file) {
    return;
  }

  if (!isValidFileType(file)) {
    evt.target.value = '';
    return;
  }

  openForm(elements, file, onEscapePress);
};

/**
 * Обрабатывает уменьшение масштаба
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие клика
 */
const onScaleSmallerClick = (elements, evt) => {
  evt.preventDefault();
  updateScale(elements, -SCALE_STEP);
};

/**
 * Обрабатывает увеличение масштаба
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие клика
 */
const onScaleBiggerClick = (elements, evt) => {
  evt.preventDefault();
  updateScale(elements, SCALE_STEP);
};

/**
 * Обрабатывает смену эффекта
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие change
 */
const onEffectChange = (elements, evt) => {
  if (!evt.target.checked) {
    return;
  }

  currentEffect = evt.target.value;
  updateEffectVisibility(elements);
  initSlider(elements);
};

/**
 * Обрабатывает нажатие Escape в текстовых полях
 * @param {KeyboardEvent} evt - событие клавиатуры
 */
const onInputFieldEscape = (evt) => {
  if (!isEscapeKey(evt)) {
    return;
  }

  evt.stopPropagation();
};

/**
 * Проверяет, нужно ли пропустить закрытие формы по Escape
 * @param {Object} elements - элементы формы
 * @param {KeyboardEvent} evt - событие клавиатуры
 * @returns {boolean}
 */
const shouldSkipEscapeClose = (elements, evt) => (
  !isEscapeKey(evt) ||
  !isFormOpened(elements) ||
  isMessageOpened() ||
  isTextFieldFocused(elements)
);

/**
 * Создаёт обработчик закрытия формы по Escape
 * @param {Object} elements - элементы формы
 * @returns {Function}
 */
const createOnEscapePress = (elements) => (evt) => {
  if (shouldSkipEscapeClose(elements, evt)) {
    return;
  }

  evt.preventDefault();
  closeForm(elements);
};

/**
 * Создаёт обработчик клика по кнопке отмены
 * @param {Object} elements - элементы формы
 * @returns {Function}
 */
const createOnCancelElementClick = (elements) => (evt) => {
  evt.preventDefault();
  closeForm(elements);
};

/**
 * Создаёт обработчики формы
 * @param {Object} elements - элементы формы
 * @returns {Object}
 */
const createFormHandlers = (elements) => {
  const onEscapePress = createOnEscapePress(elements);

  return {
    onInputElementChange: (evt) => onInputChange(elements, evt, onEscapePress),
    onCancelElementClick: createOnCancelElementClick(elements),
    onFormElementSubmit: (evt) => onFormSubmit(elements, evt),
    onScaleSmallerElementClick: (evt) => onScaleSmallerClick(elements, evt),
    onScaleBiggerElementClick: (evt) => onScaleBiggerClick(elements, evt),
    onRadioElementChange: (evt) => onEffectChange(elements, evt),
    onInputFieldEscape
  };
};

/**
 * Привязывает обработчики к форме
 * @param {Object} elements - элементы формы
 * @param {Object} handlers - обработчики
 */
const bindFormEvents = (elements, handlers) => {
  elements.inputElement.addEventListener('change', handlers.onInputElementChange);
  elements.cancelElement.addEventListener('click', handlers.onCancelElementClick);
  elements.formElement.addEventListener('submit', handlers.onFormElementSubmit);
  elements.scaleSmallerElement.addEventListener('click', handlers.onScaleSmallerElementClick);
  elements.scaleBiggerElement.addEventListener('click', handlers.onScaleBiggerElementClick);

  elements.effectsRadioElements.forEach((radioElement) => {
    radioElement.addEventListener('change', handlers.onRadioElementChange);
  });

  elements.hashtagsElement.addEventListener('keydown', handlers.onInputFieldEscape);
  elements.descriptionElement.addEventListener('keydown', handlers.onInputFieldEscape);
};

/**
 * Инициализирует форму загрузки
 */
const initUploadForm = () => {
  if (isUploadFormInitialized) {
    return;
  }

  const elements = getElements();

  if (!elements) {
    return;
  }

  initValidation(elements);

  const handlers = createFormHandlers(elements);
  bindFormEvents(elements, handlers);

  isUploadFormInitialized = true;
};

export { initUploadForm };
