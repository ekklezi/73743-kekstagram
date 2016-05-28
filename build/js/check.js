'use strict';
var getMessage = function (a, b) {
  if (typeof a == "boolean") {
    if (a) {
      return ('Переданное GIF-изображение анимировано и содержит ' + b + ' кадров');
    } else {
      return ('Переданное GIF-изображение не анимировано');
    }
  } else if (typeof a == "number") {
      return ('Переданное SVG-изображение содержит ' + a + ' объектов и ' + b * 4 + ' атрибутов');
  } else if (Array.isArray(a) && !Array.isArray(b)) {
      var sum = 0;
      for (i = 0; i < a.length; i++) {
      sum += a[i];
    }
      return ('Количество красных точек во всех строчках изображения: ' + sum);
  } else if (Array.isArray(a) && Array.isArray(b)) {
      var square = 0;
    for (i = 0; i<a.length; i++) {
      square += a[i] * b[i];
    }
      return ('Общая площадь артефактов сжатия: ' + square + ' пикселей' );  
    }
    
  ;}