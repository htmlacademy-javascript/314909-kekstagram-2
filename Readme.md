# Личный проект «Кекстаграм»

* Студент: [Ирина Трубчик](https://up.htmlacademy.ru/javascript-individual/2/user/314909).
* Наставник: [Денис Лопатин](https://htmlacademy.ru/profile/denislopatin)

---

_Не удаляйте и не изменяйте самовольно файлы и папки:_
_`.editorconfig`, `.eslintrc`, `.gitattributes`, `.gitignore`, `package-lock.json`, `package.json`., `.github`_

---

[Как работать с Git на проекте](Contributing.md) | [Как работать над проектом](Workflow.md)

### задание 7.15. Отрисуй меня полностью

Модуль отрисовки миниатюр создан и подключён:

Структура thumbnails.js:

createPictureElement(photo) — создаёт DOM-элемент миниатюры
renderPictures() — отрисовывает все миниатюры в .pictures через DocumentFragment
Что делает:

Берёт данные из массива photos
Для каждой фотографии создаёт клон шаблона #picture
Заполняет:
src ← photo.url
alt ← photo.description
.picture__comments ← photo.comments.length
.picture__likes ← photo.likes
Вставляет все элементы через DocumentFragment

---

### 8.14. Открывается и закрывается

Реализован сценарий просмотра фотографий в полноразмерном режиме:

Созданные модули:

big-picture-view.js — отрисовка полноразмерного изображения:

openPicture(photo) — открывает окно с данными фотографии
closePicture() — закрывает окно
initPictureModal(onClose) — инициализирует обработчики закрытия (Esc, клик по иконке, клик по фону)
renderComments(comments) — отрисовывает список комментариев
gallery.js — связующий модуль:

initGallery(photos) — инициализирует галерею, обрабатывает клики на миниатюры
Функционал:

✅ Открытие по клику на миниатюру
✅ Заполнение данными: url, likes, comments, description
✅ Отрисовка комментариев с аватарами
✅ Скрытие .social__comment-count и .comments-loader
✅ Добавление modal-open к <body> при открытии
✅ Закрытие по Esc и клику на иконку закрытия

---

<a href="https://htmlacademy.ru/intensive/javascript"><img align="left" width="50" height="50" alt="HTML Academy" src="https://up.htmlacademy.ru/static/img/intensive/javascript/logo-for-github-2.png"></a>

Репозиторий создан для обучения на интенсивном онлайн‑курсе «[JavaScript. Профессиональная разработка веб-интерфейсов](https://htmlacademy.ru/intensive/javascript)» от [HTML Academy](https://htmlacademy.ru).
