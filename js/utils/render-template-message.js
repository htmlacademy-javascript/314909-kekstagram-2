/**
 * Клонирует содержимое HTML-шаблона и добавляет его в body
 * @param {string} templateSelector - CSS-селектор шаблона
 * @returns {HTMLElement|null} корневой элемент добавленного сообщения
 */
const renderTemplateMessage = (templateSelector) => {
  const templateElement = document.querySelector(templateSelector);

  if (!templateElement) {
    return null;
  }

  const messageElement = templateElement.content.cloneNode(true);
  document.body.appendChild(messageElement);

  return document.body.querySelector(templateSelector.replace('#', '.'));
};

export { renderTemplateMessage };
