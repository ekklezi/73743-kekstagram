'use strict';
var filtersForm = document.querySelector('.filters');
filtersForm.classList.add('hidden');
var picturesContainer = document.querySelector('.pictures');
var templateElement = document.querySelector('template');
var elementToClone;
if ('content' in templateElement) {
  elementToClone = templateElement.content.querySelector('.picture');
} else {
  elementToClone = templateElement.querySelector('.picture');
}
var getPicturesElement = function(data, container) {
  var element = elementToClone.cloneNode(true);
  var img = new Image();
  var elementImage = element.querySelector('img');
  img.onload = function() {
    elementImage.src = img.src;
    elementImage.width = 182;
    elementImage.height = 182;
  };
  img.onerror = function() {
    element.classList.add('picture-load-failure');
  };
  img.src = data.url;
  element.querySelector('.picture-likes').textContent = data.likes;
  element.querySelector('.picture-comments').textContent = data.comments;
  container.appendChild(element);
  return element;
};
window.pictures.forEach(function(picture) {
  getPicturesElement(picture, picturesContainer);
});
filtersForm.classList.remove('hidden');
