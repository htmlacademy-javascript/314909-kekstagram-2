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
  formPreview: '.img-upload__preview',
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

const HASHTAG_REGEX = /^#[a-zа-яё0-9]{1,19}$/i;
const HASHTAG_VALIDATOR_PRIORITY = 1;
const DESCRIPTION_VALIDATOR_PRIORITY = 2;

let pristine = null;
let slider = null;
let currentScale = 1;
let currentEffect = 'none';
let escapeHandler = null;

/**
 * Получает элементы формы (кэширует результат)
 * @returns {Object|null}
 */
let elementsCache = null;

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
    previewElement: formElement.querySelector(SELECTORS.formPreview),
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
 * Сбрасывает визуальный эффект с изображения
 * @param {Object} elements - элементы формы
 */
const clearEffect = (elements) => {
  elements.previewImgElement.style.filter = '';
  elements.effectsPreviewElements.forEach((preview) => {
    preview.style.filter = '';
  });
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

  const filterValue = `${effect.filter}(${value}${effect.unit || ''})`;
  elements.previewImgElement.style.filter = filterValue;
  elements.effectsPreviewElements.forEach((preview) => {
    preview.style.filter = filterValue;
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
 * Показывает/скрывает слайдер в зависимости от эффекта
 * @param {Object} elements - элементы формы
 */
const updateEffectVisibility = (elements) => {
  elements.effectLevelElement.classList.toggle('hidden', currentEffect === 'none');
};

/**
 * Сбрасывает масштаб к значению по умолчанию
 * @param {Object} elements - элементы формы
 */
const resetScale = (elements) => {
  currentScale = 1;
  elements.scaleValueElement.value = '100%';
  elements.previewImgElement.style.transform = `scale(${currentScale})`;
};

/**
 * Обновляет масштаб изображения
 * @param {Object} elements - элементы формы
 * @param {number} step - шаг изменения масштаба
 */
const updateScale = (elements, step) => {
  const newScale = currentScale + step;

  if (newScale >= SCALE_MIN && newScale <= SCALE_MAX) {
    currentScale = newScale;
    elements.previewImgElement.style.transform = `scale(${currentScale})`;
    elements.scaleValueElement.value = `${Math.round(currentScale * 100)}%`;
  }
};

/**
 * Парсит строку хэштегов в массив
 * @param {string} value - значение поля хэштегов
 * @returns {string[]} массив хэштегов
 */
const parseHashtags = (value) => value.trim().split(/\s+/).filter((tag) => tag !== '');

/**
 * Результат проверки одного хэштега
 * @param {string} hashtag - хэштег для проверки
 * @param {Set} usedHashtags - множество уже проверенных хэштегов
 * @returns {{isValid: boolean, error: string|null}} результат проверки
 */
const validateSingleHashtag = (hashtag, usedHashtags) => {
  const lowerHashtag = hashtag.toLowerCase();

  if (!HASHTAG_REGEX.test(hashtag)) {
    if (hashtag === '#') {
      return { isValid: false, error: 'Хэш-тег не может состоять только из одной решётки' };
    }

    if (hashtag.length > MAX_HASHTAG_LENGTH) {
      return { isValid: false, error: `Максимальная длина хэштега ${MAX_HASHTAG_LENGTH} символов` };
    }

    return { isValid: false, error: 'Неправильный хэштег' };
  }

  if (usedHashtags.has(lowerHashtag)) {
    return { isValid: false, error: 'Хэштеги не должны повторяться' };
  }

  usedHashtags.add(lowerHashtag);
  return { isValid: true, error: null };
};

/**
 * Проверяет валидность хэштегов
 * @param {string} value - значение поля хэштегов
 * @returns {boolean}
 */
const validateHashtags = (value) => {
  const usedHashtags = new Set();
  const hashtags = parseHashtags(value);

  if (hashtags.length === 0) {
    return true;
  }

  if (hashtags.length > MAX_HASHTAGS) {
    return false;
  }

  for (const hashtag of hashtags) {
    const result = validateSingleHashtag(hashtag, usedHashtags);
    if (!result.isValid) {
      return false;
    }
  }

  return true;
};

/**
 * Возвращает сообщение об ошибке для хэштегов
 * @param {string} value - значение поля хэштегов
 * @returns {string}
 */
const getHashtagErrorMessage = (value) => {
  const hashtags = parseHashtags(value);

  if (hashtags.length === 0) {
    return '';
  }

  if (hashtags.length > MAX_HASHTAGS) {
    return `Нельзя указать больше ${MAX_HASHTAGS} хэштегов`;
  }

  const usedHashtags = new Set();

  for (const hashtag of hashtags) {
    const result = validateSingleHashtag(hashtag, usedHashtags);
    if (!result.isValid) {
      return result.error;
    }
  }

  return '';
};

/**
 * Проверяет валидность комментария
 * @param {string} value - значение поля комментария
 * @returns {boolean}
 */
const validateDescription = (value) => value.length <= MAX_DESCRIPTION_LENGTH;

/**
 * Возвращает сообщение об ошибке для комментария
 * @param {string} value - значение поля комментария
 * @returns {string}
 */
const getDescriptionErrorMessage = (value) => {
  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return `Длина комментария не может превышать ${MAX_DESCRIPTION_LENGTH} символов`;
  }

  return '';
};

/**
 * Инициализирует валидацию Pristine
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
 * Открывает форму редактирования изображения
 * @param {Object} elements - элементы формы
 * @param {File} file - выбранный файл
 */
const openForm = (elements, file) => {
  const url = URL.createObjectURL(file);

  elements.previewImgElement.src = url;
  elements.effectsPreviewElements.forEach((preview) => {
    preview.style.backgroundImage = `url(${url})`;
  });

  elements.overlayElement.classList.remove('hidden');
  document.body.classList.add('modal-open');

  resetScale(elements);
  currentEffect = 'none';
  elements.effectLevelElement.classList.add('hidden');
  initSlider(elements);
};

/**
 * Закрывает форму редактирования изображения
 * @param {Object} elements - элементы формы
 */
const closeForm = (elements) => {
  elements.overlayElement.classList.add('hidden');
  document.body.classList.remove('modal-open');

  elements.inputElement.value = '';
  elements.formElement.reset();

  pristine.reset();

  resetScale(elements);
  currentEffect = 'none';
  clearEffect(elements);
  elements.effectsPreviewElements.forEach((preview) => {
    preview.style.backgroundImage = '';
  });
  elements.effectLevelElement.classList.add('hidden');

  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }
};

/**
 * Показывает сообщение на основе шаблона
 * @param {string} templateId - ID шаблона
 * @param {string} overlaySelector - CSS-селектор оверлея
 * @param {string} buttonSelector - CSS-селектор кнопки закрытия
 */
const showMessage = (templateId, overlaySelector, buttonSelector) => {
  const messageElement = renderTemplateMessage(templateId);
  if (!messageElement) {
    return;
  }

  const closeButtonElement = document.querySelector(buttonSelector);
  const overlayElement = document.querySelector(overlaySelector);

  let onEscapePress = null;
  let onOverlayClickFn = null;

  const removeMessage = () => {
    const existingMessageElement = document.querySelector(overlaySelector);
    existingMessageElement?.remove();
    if (onEscapePress) {
      document.removeEventListener('keydown', onEscapePress);
    }
    if (onOverlayClickFn) {
      overlayElement.removeEventListener('click', onOverlayClickFn);
    }
    closeButtonElement.removeEventListener('click', removeMessage);
  };

  onEscapePress = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      evt.stopPropagation();
      removeMessage();
    }
  };

  onOverlayClickFn = (evt) => {
    if (evt.target === overlayElement) {
      removeMessage();
    }
  };

  closeButtonElement.addEventListener('click', removeMessage);
  document.addEventListener('keydown', onEscapePress);
  overlayElement.addEventListener('click', onOverlayClickFn);
};

/**
 * Показывает сообщение об успехе
 */
const showSuccessMessage = () => showMessage('#success', '.success', '.success__button');

/**
 * Показывает сообщение об ошибке
 */
const showErrorMessage = () => showMessage('#error', '.error', '.error__button');

/**
 * Обрабатывает отправку формы
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие отправки
 */
const onFormSubmit = async (elements, evt) => {
  evt.preventDefault();

  const isValid = pristine.validate();
  if (!isValid) {
    return;
  }

  elements.submitElement.disabled = true;

  try {
    await uploadPhoto(new FormData(elements.formElement));
    showSuccessMessage();
    closeForm(elements);
  } catch {
    showErrorMessage();
  } finally {
    elements.submitElement.disabled = false;
  }
};

/**
 * Обрабатывает изменение поля загрузки файла
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие изменения
 */
const onInputChange = (elements, evt) => {
  const file = evt.target.files[0];

  if (file) {
    openForm(elements, file);
  }
};

/**
 * Обрабатывает нажатие на кнопку уменьшения масштаба
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие клика
 */
const onScaleSmallerClick = (elements, evt) => {
  evt.preventDefault();
  updateScale(elements, -SCALE_STEP);
};

/**
 * Обрабатывает нажатие на кнопку увеличения масштаба
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие клика
 */
const onScaleBiggerClick = (elements, evt) => {
  evt.preventDefault();
  updateScale(elements, SCALE_STEP);
};

/**
 * Обрабатывает изменение эффекта
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие изменения
 */
const onEffectChange = (elements, evt) => {
  if (evt.target.checked) {
    currentEffect = evt.target.value;
    updateEffectVisibility(elements);
    initSlider(elements);
  }
};

/**
 * Инициализирует обработчики формы
 */
const initUploadForm = () => {
  const elements = getElements();

  if (!elements) {
    return;
  }

  initValidation(elements);

  elements.inputElement.addEventListener('change', (evt) => onInputChange(elements, evt));
  elements.cancelElement.addEventListener('click', (evt) => {
    evt.preventDefault();
    closeForm(elements);
  });
  elements.formElement.addEventListener('submit', (evt) => onFormSubmit(elements, evt));
  elements.formElement.addEventListener('reset', () => closeForm(elements));

  elements.scaleSmallerElement.addEventListener('click', (evt) => onScaleSmallerClick(elements, evt));
  elements.scaleBiggerElement.addEventListener('click', (evt) => onScaleBiggerClick(elements, evt));

  elements.effectsRadioElements.forEach((radio) => {
    radio.addEventListener('change', (evt) => onEffectChange(elements, evt));
  });

  const onInputFieldEscape = (evt) => {
    if (evt.key === 'Escape') {
      evt.stopPropagation();
    }
  };

  elements.hashtagsElement.addEventListener('keydown', onInputFieldEscape);
  elements.descriptionElement.addEventListener('keydown', onInputFieldEscape);

  const onEscapePress = (evt) => {
    if (evt.key === 'Escape' && !elements.overlayElement.classList.contains('hidden')) {
      if (document.querySelector('.error') || document.querySelector('.success')) {
        return;
      }

      const activeElement = document.activeElement;

      if (activeElement !== elements.hashtagsElement && activeElement !== elements.descriptionElement) {
        closeForm(elements);
      }
    }
  };

  escapeHandler = onEscapePress;

  document.removeEventListener('keydown', onEscapePress);

  document.addEventListener('keydown', onEscapePress);
};

export { initUploadForm };
