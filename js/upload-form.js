// Модуль работы с формой загрузки изображения

import { sendData } from './api.js';
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
  preview: '.img-upload__preview img',
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
 * Инициализирует слайдер noUiSlider
 * @param {Object} elements - элементы формы
 */
function initSlider(elements) {
  if (slider) {
    slider.destroy();
  }

  const effect = EFFECTS[currentEffect];

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
    elements.effectLevelValue.value = value;

    if (currentEffect === 'none') {
      elements.preview.style.filter = '';
    } else {
      const filterValue = `${effect.filter}(${value}${effect.unit || ''})`;
      elements.preview.style.filter = filterValue;
      elements.effectsPreview.forEach((preview) => {
        preview.style.filter = filterValue;
      });
    }
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
  elements.preview.style.transform = `scale(${currentScale})`;
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
    elements.preview.style.transform = `scale(${currentScale})`;
  }
}

/**
 * Проверяет валидность хэштегов
 * @param {string} value - значение поля хэштегов
 * @returns {boolean}
 */
function validateHashtags(value) {
  if (!value.trim()) {
    return true;
  }

  const hashtags = value.trim().split(/\s+/).filter((tag) => tag !== '');

  // Проверка на максимальное количество хэштегов
  if (hashtags.length > MAX_HASHTAGS) {
    return false;
  }

  // Проверка каждого хэштега
  const hashtagRegex = /^#[a-zа-яё0-9]{1,19}$/i;
  const usedHashtags = new Set();

  for (const hashtag of hashtags) {
    // Проверка формата хэштега
    if (!hashtagRegex.test(hashtag)) {
      return false;
    }

    // Проверка на повторение
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
  if (!value.trim()) {
    return '';
  }

  const hashtags = value.trim().split(/\s+/).filter((tag) => tag !== '');

  if (hashtags.length > MAX_HASHTAGS) {
    return `Нельзя указать больше ${MAX_HASHTAGS} хэштегов`;
  }

  const hashtagRegex = /^#[a-zа-яё0-9]{1,19}$/i;
  const usedHashtags = new Set();

  for (const hashtag of hashtags) {
    if (!hashtagRegex.test(hashtag)) {
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

  elements.preview.src = url;
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
  elements.preview.style.filter = '';
  elements.effectsPreview.forEach((preview) => {
    preview.style.filter = '';
    preview.style.backgroundImage = '';
  });
  elements.effectLevel.classList.add('hidden');
}

/**
 * Показывает сообщение об успехе
 */
function showSuccessMessage() {
  const template = document.querySelector('#success');
  const message = template.content.cloneNode(true);

  document.body.appendChild(message);

  const closeButton = document.querySelector('.success__button');
  const overlay = document.querySelector('.success');

  const removeMessage = () => {
    const existingMessage = document.querySelector('.success');
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
 * Показывает сообщение об ошибке
 */
function showErrorMessage() {
  const template = document.querySelector('#error');
  const message = template.content.cloneNode(true);

  document.body.appendChild(message);

  const closeButton = document.querySelector('.error__button');
  const overlay = document.querySelector('.error');

  const removeMessage = () => {
    const existingMessage = document.querySelector('.error');
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
 * Обрабатывает отправку формы
 * @param {Object} elements - элементы формы
 * @param {Event} evt - событие отправки
 */
function onFormSubmit(elements, evt) {
  evt.preventDefault();

  const isValid = pristine.validate();
  if (!isValid) {
    return;
  }

  elements.submit.disabled = true;

  sendData('', new FormData(elements.form))
    .then(() => {
      showSuccessMessage();
      closeForm(elements);
    })
    .catch(() => {
      showErrorMessage();
    })
    .finally(() => {
      elements.submit.disabled = false;
    });
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
  elements.cancel.addEventListener('click', () => closeForm(elements));
  elements.form.addEventListener('submit', (evt) => onFormSubmit(elements, evt));

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
