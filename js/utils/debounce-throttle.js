/**
 * Возвращает функцию, которая вызывает callback не чаще,
 * чем один раз за timeoutDelay после последнего вызова
 * @param {Function} callback - функция для вызова
 * @param {number} timeoutDelay - задержка в мс
 * @returns {Function}
 */
const debounce = (callback, timeoutDelay = 500) => {
  let timeoutId;

  return (...rest) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...rest);
    }, timeoutDelay);
  };
};

export { debounce };
