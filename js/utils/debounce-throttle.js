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

export { debounce };
