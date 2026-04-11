/**
 * Клонирует содержимое HTML-шаблона и добавляет его в body
 * @param {string} templateSelector - CSS-селектор шаблона
 * @returns {HTMLElement|null} корневой элемент добавленного сообщения
 */
function renderTemplateMessage(templateSelector) {
  const template = document.querySelector(templateSelector);

  if (!template) {
    return null;
  }

  const message = template.content.cloneNode(true);
  document.body.appendChild(message);

  return document.body.querySelector(templateSelector.replace('#', '.'));
}

export { renderTemplateMessage };
