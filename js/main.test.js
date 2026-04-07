import { photos, generatePhotosData } from './models/photo.js';

describe('Генерация фотографий', () => {
  let generatedPhotos;

  beforeEach(() => {
    generatedPhotos = generatePhotosData();
  });

  test('генерируется ровно 25 фотографий', () => {
    expect(generatedPhotos).toHaveLength(25);
  });

  describe('Структура объекта фотографии', () => {
    let photo;

    beforeEach(() => {
      photo = generatedPhotos[0];
    });

    test('объект содержит поле id', () => {
      expect(photo).toHaveProperty('id');
    });

    test('объект содержит поле url', () => {
      expect(photo).toHaveProperty('url');
    });

    test('объект содержит поле description', () => {
      expect(photo).toHaveProperty('description');
    });

    test('объект содержит поле likes', () => {
      expect(photo).toHaveProperty('likes');
    });

    test('объект содержит поле comments', () => {
      expect(photo).toHaveProperty('comments');
    });
  });

  describe('Проверка id', () => {
    test('id находится в диапазоне от 1 до 25', () => {
      generatedPhotos.forEach((photo) => {
        expect(photo.id).toBeGreaterThanOrEqual(1);
        expect(photo.id).toBeLessThanOrEqual(25);
      });
    });

    test('все id уникальны', () => {
      const ids = generatedPhotos.map((photo) => photo.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });
  });

  describe('Проверка url', () => {
    test('url имеет правильный формат', () => {
      generatedPhotos.forEach((photo) => {
        expect(photo.url).toMatch(/^photos\/\d+\.jpg$/);
      });
    });

    test('все url уникальны', () => {
      const urls = generatedPhotos.map((photo) => photo.url);
      const uniqueUrls = [...new Set(urls)];
      expect(urls).toHaveLength(uniqueUrls.length);
    });

    test('url соответствует id фотографии', () => {
      generatedPhotos.forEach((photo) => {
        expect(photo.url).toBe(`photos/${photo.id}.jpg`);
      });
    });
  });

  describe('Проверка description', () => {
    test('description — непустая строка', () => {
      generatedPhotos.forEach((photo) => {
        expect(typeof photo.description).toBe('string');
        expect(photo.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Проверка likes', () => {
    test('likes находится в диапазоне от 15 до 200', () => {
      generatedPhotos.forEach((photo) => {
        expect(photo.likes).toBeGreaterThanOrEqual(15);
        expect(photo.likes).toBeLessThanOrEqual(200);
      });
    });

    test('likes — целое число', () => {
      generatedPhotos.forEach((photo) => {
        expect(Number.isInteger(photo.likes)).toBe(true);
      });
    });
  });

  describe('Проверка comments', () => {
    test('comments — массив', () => {
      generatedPhotos.forEach((photo) => {
        expect(Array.isArray(photo.comments)).toBe(true);
      });
    });

    test('количество комментариев от 0 до 30', () => {
      generatedPhotos.forEach((photo) => {
        expect(photo.comments.length).toBeGreaterThanOrEqual(0);
        expect(photo.comments.length).toBeLessThanOrEqual(30);
      });
    });

    describe('Структура комментария', () => {
      let comment;

      beforeEach(() => {
        const photoWithComments = generatedPhotos.find((p) => p.comments.length > 0);
        if (photoWithComments) {
          comment = photoWithComments.comments[0];
        }
      });

      test('комментарий содержит поле id', () => {
        if (comment) {
          expect(comment).toHaveProperty('id');
        }
      });

      test('комментарий содержит поле avatar', () => {
        if (comment) {
          expect(comment).toHaveProperty('avatar');
        }
      });

      test('комментарий содержит поле message', () => {
        if (comment) {
          expect(comment).toHaveProperty('message');
        }
      });

      test('комментарий содержит поле name', () => {
        if (comment) {
          expect(comment).toHaveProperty('name');
        }
      });

      test('avatar имеет правильный формат', () => {
        if (comment) {
          expect(comment.avatar).toMatch(/^img\/avatar-[1-6]\.svg$/);
        }
      });
    });
  });

  describe('Массив photos экспортирован', () => {
    test('photos существует и содержит 25 элементов', () => {
      expect(photos).toHaveLength(25);
    });
  });
});
