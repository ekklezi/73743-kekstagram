/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  var resizerX = document.querySelector('#resize-x');
  var resizerY = document.querySelector('#resize-y');
  var resizerSide = document.querySelector('#resize-size');
  var resizeFwd = document.querySelector('#resize-fwd');
  var setResizerMinMax = function() {
    resizerX.min = 0;
    resizerY.min = 0;
    resizerSide.min = 0;
    var originalWidth = currentResizer._image.naturalWidth;
    var originalHeight = currentResizer._image.naturalHeight;
    if (parseFloat(resizerSide.value || 0) < originalWidth && parseFloat(resizerSide.value || 0) < originalHeight) {
      resizerX.max = originalWidth - parseFloat(resizerSide.value || 0);
      resizerY.max = originalHeight - parseFloat(resizerSide.value || 0);
    } else {
      resizerX.max = 0;
      resizerY.max = 0;
    }
    if (originalWidth > resizerX.value && originalHeight > resizerY.value) {
      resizerSide.max = Math.min(originalWidth - parseFloat(resizerX.value || 0), originalHeight - parseFloat(resizerY.value || 0));
    } else {
      resizerSide.max = 0;
    }
  };
  var toggleResizeFwd = function(enable) {
    if (enable) {
      resizeFwd.classList.remove('disabled');
      resizeFwd.removeAttribute('disabled');
    } else {
      resizeFwd.classList.add('disabled');
      resizeFwd.setAttribute('disabled', 'disabled');
    }
  };

  function resizeFormIsValid() {
    var originalWidth = currentResizer._image.naturalWidth;
    var originalHeight = currentResizer._image.naturalHeight;
    if ((originalWidth - resizerSide.value - resizerX.value) >= 0 && (originalHeight - resizerSide.value - resizerY.value) >= 0 && resizerX.value >= 0 && resizerY.value >= 0) {
      return true;
    } else {
      return false;
    }
  }
  var onInputResizeForm = function() {
    setResizerMinMax();
    toggleResizeFwd(resizeFormIsValid());
  };
  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.onchange = function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();
          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');
          onInputResizeForm();
          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  };
  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.onreset = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.oninput = onInputResizeForm;
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();
    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;
      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };
  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.onreset = function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  var browserCookies = require('browser-cookies');
  filterForm.onsubmit = function(evt) {
    evt.preventDefault();
    var defaultFilter = document.querySelector('.filter-image-preview').classList[1];
    if (defaultFilter === 'filter-none' || defaultFilter === 'filter-chrome' || defaultFilter === 'filter-sepia') {
      browserCookies.set('defaultFilter', defaultFilter, {
        expires: getCookiesExpire()
      });
    } else {
      console.error('Data is not correct');
    }
    cleanupResizer();
    updateBackground();
    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };
  var setDefaultFilter = function() {
    var defaultFilter = browserCookies.get('defaultFilter');
    filterImage.classList.add(defaultFilter);
    var checkedFilter = document.getElementById('upload-' + defaultFilter);
    checkedFilter.setAttribute('checked', 'checked');
  };
  setDefaultFilter();
  var getCookiesExpire = function() {
    var today = new Date();
    var year = today.getFullYear();
    var nearestBirthday;
    var myBirthdayDate = '-11-02';
    nearestBirthday = new Date((year) + myBirthdayDate);
    if (isNaN(nearestBirthday)) {
      console.error('Date is not correct');
    }
    if ((Date.now() - nearestBirthday) > 0) {
      nearestBirthday = new Date(year + myBirthdayDate);
    } else {
      nearestBirthday = new Date((year - 1) + myBirthdayDate);
    }
    return Math.ceil((Date.now() - nearestBirthday) / 24 / 60 / 60 / 1000);
  };
  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.onchange = function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  };

  cleanupResizer();
  updateBackground();
})();
