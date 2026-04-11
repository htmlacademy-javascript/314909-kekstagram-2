/**
 * Возвращает функцию, которая вызывает callback не чаще,
 * чем один раз за timeoutDelay после последнего вызова
 * @param {Function} callback - функция для вызова
 * @param {number} timeoutDelay - задержка в мс
 * @returns {Function}
 */
function debounce(callback, timeoutDelay = 500) {
  let timeoutId;

  return function (...rest) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      callback.apply(this, rest);
    }, timeoutDelay);
  };
}

/**
 * Возвращает функцию, которая вызывает callback не чаще,
 * чем один раз за delayBetweenFrames
 * @param {Function} callback - функция для вызова
 * @param {number} delayBetweenFrames - задержка в мс
 * @returns {Function}
 */
function throttle(callback, delayBetweenFrames) {
  let lastTime = 0;

  return function (...rest) {
    const now = new Date();

    if (now - lastTime >= delayBetweenFrames) {
      callback.apply(this, rest);
      lastTime = now;
    }
  };
}

export { debounce, throttle };
