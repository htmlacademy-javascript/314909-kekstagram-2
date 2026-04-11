// Модуль работы с формой загрузки изображения

import { uploadPhoto } from './api.js';
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
  overlay: '.img-upload__overlay',
  input: '#upload-file',
  cancel: '#upload-cancel',
  preview: '.img-upload__preview',
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

let pristine = null;
let slider = null;
let currentScale = 1;
let currentEffect = 'none';

/**
 * Получает элементы формы (кэширует результат)
 * @returns {Object|null}
 */
function getElements() {
  const form = document.querySelector(SELECTORS.form);

  if (!form) {
    return null;
  }

  return {
    form,
    overlay: form.querySelector(SELECTORS.overlay),
    input: form.querySelector(SELECTORS.input),
    cancel: form.querySelector(SELECTORS.cancel),
    preview: form.querySelector(SELECTORS.preview),
    effectsPreview: form.querySelectorAll(SELECTORS.effectsPreview),
    scaleSmaller: form.querySelector(SELECTORS.scaleSmaller),
    scaleBigger: form.querySelector(SELECTORS.scaleBigger),
    scaleValue: form.querySelector(SELECTORS.scaleValue),
    effectLevel: form.querySelector(SELECTORS.effectLevel),
    effectLevelValue: form.querySelector(SELECTORS.effectLevelValue),
    effectLevelSlider: form.querySelector(SELECTORS.effectLevelSlider),
    effectsRadio: form.querySelectorAll(SELECTORS.effectsRadio),
    hashtags: form.querySelector(SELECTORS.hashtags),
    description: form.querySelector(SELECTORS.description),
    submit: form.querySelector(SELECTORS.submit)
  };
}

/**
 * Применяет визуальный эффект к изображению
 * @param {Object} elements - элементы формы
 * @param {string} value - текущее значение слайдера
 */
function applyEffect(elements, value) {
  const effect = EFFECTS[currentEffect];
  const previewImg = elements.preview.querySelector('img');

  if (currentEffect === 'none') {
    previewImg.style.filter = '';
    elements.effectsPreview.forEach((preview) => {
      preview.style.filter = '';
    });
  } else {
    const filterValue = `${effect.filter}(${value}${effect.unit || ''})`;
    previewImg.style.filter = filterValue;
    elements.effectsPreview.forEach((preview) => {
      preview.style.filter = filterValue;
    });
  }
}

/**
 * Инициализирует слайдер noUiSlider
 * @param {Object} elements - элементы формы
 */
function initSlider(elements) {
  if (slider) {
    slider.destroy();
    slider = null;
  }

  const effect = EFFECTS[currentEffect];

  elements.effectLevelValue.value = String(effect.start);
  applyEffect(elements, String(effect.start));

  slider = noUiSlider.create(elements.effectLevelSlider, {
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
    // Преобразуем в число и обратно в строку, чтобы убрать лишние нули (0.50 → 0.5)
    const numericValue = parseFloat(value);
    elements.effectLevelValue.value = numericValue;
    applyEffect(elements, String(numericValue));
  });
}

/**
 * Показывает/скрывает слайдер в зависимости от эффекта
 * @param {Object} elements - элементы формы
 */
function updateEffectVisibility(elements) {
  if (currentEffect === 'none') {
    elements.effectLevel.classList.add('hidden');
  } else {
    elements.effectLevel.classList.remove('hidden');
  }
}

/**
 * Сбрасывает масштаб к значению по умолчанию
 * @param {Object} elements - элементы формы
 */
function resetScale(elements) {
  currentScale = 1;
  elements.scaleValue.value = '100%';
  const previewImg = elements.preview.querySelector('img');
  previewImg.style.transform = `scale(${currentScale})`;
}

/**
 * Обновляет масштаб изображения
 * @param {Object} elements - элементы формы
 * @param {number} step - шаг изменения масштаба
 */
function updateScale(elements, step) {
  const newScale = currentScale + step;

  if (newScale >= SCALE_MIN && newScale <= SCALE_MAX) {
    currentScale = newScale;
    elements.scaleValue.value = `${Math.round(currentScale * 100)}%`;
    const previewImg = elements.preview.querySelector('img');
    previewImg.style.transform = `scale(${currentScale})`;
  }
}

/**
 * Парсит строку хэштегов в массив
 * @param {string} value - значение поля хэштегов
 * @returns {string[]} массив хэштегов
 */
function parseHashtags(value) {
  return value.trim().split(/\s+/).filter((tag) => tag !== '');
}

/**
 * Проверяет валидность хэштегов
 * @param {string} value - значение поля хэштегов
 * @returns {boolean}
 */
function validateHashtags(value) {
  const hashtags = parseHashtags(value);
  if (hashtags.length === 0) {
    return true;
  }

  if (hashtags.length > MAX_HASHTAGS) {
    return false;
  }

  const usedHashtags = new Set();

  for (const hashtag of hashtags) {
    if (!HASHTAG_REGEX.test(hashtag)) {
      return false;
    }

    const lowerHashtag = hashtag.toLowerCase();
    if (usedHashtags.has(lowerHashtag)) {
      return false;
    }
    usedHashtags.add(lowerHashtag);
  }

  return true;
}

/**
 * Возвращает сообщение об ошибке для хэштегов
 * @param {string} value - значение поля хэштегов
 * @returns {string}
 */
function getHashtagErrorMessage(value) {
  const hashtags = parseHashtags(value);
  if (hashtags.length === 0) {
    return '';
  }

  if (hashtags.length > MAX_HASHTAGS) {
    return `Нельзя указать больше ${MAX_HASHTAGS} хэштегов`;
  }

  const usedHashtags = new Set();

  for (const hashtag of hashtags) {
    if (!HASHTAG_REGEX.test(hashtag)) {
      if (hashtag === '#') {
        return 'Хэш-тег не может состоять только из одной решётки';
      }

      if (hashtag.length > MAX_HASHTAG_LENGTH) {
        return `Максимальная длина хэштега ${MAX_HASHTAG_LENGTH} символов`;
      }

      return 'Неправильный хэштег';
    }

    const lowerHashtag = hashtag.toLowerCase();
    if (usedHashtags.has(lowerHashtag)) {
      return 'Хэштеги не должны повторяться';
    }
    usedHashtags.add(lowerHashtag);
  }

  return '';
}

/**
 * Проверяет валидность комментария
 * @param {string} value - значение поля комментария
 * @returns {boolean}
 */
function validateDescription(value) {
  return value.length <= MAX_DESCRIPTION_LENGTH;
}

/**
 * Возвращает сообщение об ошибке для комментария
 * @param {string} value - значение поля комментария
 * @returns {string}
 */
function getDescriptionErrorMessage(value) {
  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return `Длина комментария не может превышать ${MAX_DESCRIPTION_LENGTH} символов`;
  }
  return '';
}

/**
 * Инициализирует валидацию Pristine
 * @param {Object} elements - элементы формы
 */
function initValidation(elements) {
  pristine = new Pristine(elements.form, {
    classTo: 'img-upload__field-wrapper',
    errorClass: 'img-upload__field-wrapper--error',
    errorTextParent: 'img-upload__field-wrapper',
    errorTextTag: 'div',
    errorTextClass: 'pristine-error'
  });

  pristine.addValidator(
    elements.hashtags,
    validateHashtags,
    getHashtagErrorMessage,
    1,
    false
  );

  pristine.addValidator(
    elements.description,
    validateDescription,
    getDescriptionErrorMessage,
    2,
    false
  );
}

/**
 * Открывает форму редактирования изображения
 * @param {Object} elements - элементы формы
 * @param {File} file - выбранный файл
 */
function openForm(elements, file) {
  const url = URL.createObjectURL(file);
  const previewImg = elements.preview.querySelector('img');

  previewImg.src = url;
  elements.effectsPreview.forEach((preview) => {
    preview.style.backgroundImage = `url(${url})`;
  });

  elements.overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');

  resetScale(elements);
  currentEffect = 'none';
  elements.effectLevel.classList.add('hidden');
  initSlider(elements);
}

/**
 * Закрывает форму редактирования изображения
 * @param {Object} elements - элементы формы
 */
function closeForm(elements) {
  elements.overlay.classList.add('hidden');
  document.body.classList.remove('modal-open');

  elements.input.value = '';
  elements.form.reset();

  pristine.reset();

  resetScale(elements);
  currentEffect = 'none';
  const previewImg = elements.preview.querySelector('img');
  previewImg.style.filter = '';
  elements.effectsPreview.forEach((preview) => {
    preview.style.filter = '';
    preview.style.backgroundImage = '';
  });
  elements.effectLevel.classList.add('hidden');
}

/**
 * Показывает сообщение на основе шаблона
 * @param {string} templateId - ID шаблона
 * @param {string} overlaySelector - CSS-селектор оверлея
 * @param {string} buttonSelector - CSS-селектор кнопки закрытия
 */
function showMessage(templateId, overlaySelector, buttonSelector) {
  const template = document.querySelector(templateId);
  if (!template) {
    return;
  }

  const message = template.content.cloneNode(true);
  document.body.appendChild(message);

  const closeButton = document.querySelector(buttonSelector);
  const overlay = document.querySelector(overlaySelector);

  const removeMessage = () => {
    const existingMessage = document.querySelector(overlaySelector);
    if (existingMessage) {
      existingMessage.remove();
    }
    document.removeEventListener('keydown', onEscapePress);
    overlay.removeEventListener('click', onOverlayClick);
    closeButton.removeEventListener('click', removeMessage);
  };

  function onEscapePress(evt) {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      removeMessage();
    }
  }

  function onOverlayClick(evt) {
    if (evt.target === overlay) {
      removeMessage();
    }
  }

  closeButton.addEventListener('click', removeMessage);
  document.addEventListener('keydown', onEscapePress);
  overlay.addEventListener('click', onOverlayClick);
}

/**
 * Показывает сообщение об успехе
 */
function showSuccessMessage() {
  showMessage('#success', '.success', '.success__button');
}

/**
 * Показывает сообщение об ошибке
 */
function showErrorMessage() {
  showMessage('#error', '.error', '.error__button');
}

/**
 * Обрабатывает отправку формы
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие отправки
 */
async function onFormSubmit(elements, evt) {
  evt.preventDefault();

  const isValid = pristine.validate();
  if (!isValid) {
    return;
  }

  elements.submit.disabled = true;

  try {
    await uploadPhoto(new FormData(elements.form));
    showSuccessMessage();
    closeForm(elements);
  } catch {
    showErrorMessage();
  } finally {
    elements.submit.disabled = false;
  }
}

/**
 * Обрабатывает изменение поля загрузки файла
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие изменения
 */
function onInputChange(elements, evt) {
  const file = evt.target.files[0];

  if (file) {
    openForm(elements, file);
  }
}

/**
 * Обрабатывает нажатие на кнопку уменьшения масштаба
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие клика
 */
function onScaleSmallerClick(elements, evt) {
  evt.preventDefault();
  updateScale(elements, -SCALE_STEP);
}

/**
 * Обрабатывает нажатие на кнопку увеличения масштаба
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие клика
 */
function onScaleBiggerClick(elements, evt) {
  evt.preventDefault();
  updateScale(elements, SCALE_STEP);
}

/**
 * Обрабатывает изменение эффекта
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие изменения
 */
function onEffectChange(elements, evt) {
  if (evt.target.checked) {
    currentEffect = evt.target.value;
    updateEffectVisibility(elements);
    initSlider(elements);
  }
}

/**
 * Инициализирует обработчики формы
 */
function initUploadForm() {
  const elements = getElements();
  if (!elements) {
    return;
  }

  initValidation(elements);

  elements.input.addEventListener('change', (evt) => onInputChange(elements, evt));
  elements.cancel.addEventListener('click', (evt) => {
    evt.preventDefault();
    closeForm(elements);
  });
  elements.form.addEventListener('submit', (evt) => onFormSubmit(elements, evt));
  elements.form.addEventListener('reset', () => closeForm(elements));

  elements.scaleSmaller.addEventListener('click', (evt) => onScaleSmallerClick(elements, evt));
  elements.scaleBigger.addEventListener('click', (evt) => onScaleBiggerClick(elements, evt));

  elements.effectsRadio.forEach((radio) => {
    radio.addEventListener('change', (evt) => onEffectChange(elements, evt));
  });

  // Блокировка закрытия формы при фокусе на полях ввода
  elements.hashtags.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      evt.stopPropagation();
    }
  });

  elements.description.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      evt.stopPropagation();
    }
  });

  // Закрытие по Esc
  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape' && !elements.overlay.classList.contains('hidden')) {
      const activeElement = document.activeElement;
      if (activeElement !== elements.hashtags && activeElement !== elements.description) {
        closeForm(elements);
      }
    }
  });
}

export { initUploadForm };
