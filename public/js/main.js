// Обработчик ошибок
function ErrorHandler(classErrWindow, templateError) {
	this.timeHide = 2000;
	this.classErrWindow = classErrWindow;
	this.templateError = templateError;
}

// Рендеринг шаблона ошибок
ErrorHandler.prototype.newError = function(errorObject) {
	return this.templateError(errorObject);
};

// Скрываем и удаляем плашку ошибки через timeHide 
ErrorHandler.prototype.hideErrorWindow = function() {
	var errWindow = $(this.classErrWindow);

	setTimeout(function() {
		errWindow.fadeOut(this.timeHide, function() {
			errWindow.remove();
		});
	}, this.timeHide);
};

// При возникновении ошибки вывести плашку и удалить
ErrorHandler.prototype.caughtErr = function(options) {
	$('body').append(this.newError(options));
	this.hideErrorWindow();
};

// Функция вызова ошибки
ErrorHandler.prototype.generateError = function(errorOpt, consoleMessage) {
	this.caughtErr(errorOpt);
	throw new Error(consoleMessage || 'Error');
};
function Slider($slider, options) {
	this.slider = $slider;
	this.arrSlides = this.slider.children();
	this.countSlides = this.arrSlides.length - 1;
	this.settings = $.extend({
	  activeClass : 'slider-active',
	  ballsBlock : 'slider-navigation',
	  ballsClass : 'slider-navigation-circle',
	  activePos : 0,
	  timeStep : 7000
	}, options);
	this.slideWidth = this.arrSlides.outerWidth();
	this.indexActiveSlide = this.settings.activePos + 1;
	this.ballsBlock = $('.' + this.settings.ballsBlock);
	this.arrayNavigElements = this.ballsBlock.children('.' + this.settings.ballsClass);
	this.arrNavElLength = this.arrayNavigElements.length;
	this.ballActivePos = this.settings.activePos;
	this.flag = false;
	this.startInit = true;
	this.currentSlideIndex = this.settings.activePos + 1;
	this.interval;
}

// Установить астивный класс на слайд
// Слайд вычисляется по индексу, где индекс - это activePos в options
// И перемещается на активный слайд
Slider.prototype.setActiveSlide = function() {
	this.arrSlides.eq(this.settings.activePos + 1).addClass(this.settings.activeClass);
	this.move(this.indexActiveSlide);
};

// Сбросить со всех слайдов активный класс
// Поставить активный класс на след слайд (nextSlide - след. индекс)
Slider.prototype.changeActiveSlide = function(nextSlide) {
	this.arrSlides.siblings().removeClass(this.settings.activeClass);
	this.arrSlides.eq(nextSlide).addClass(this.settings.activeClass);
};

// Незаметное перемещение слайдера
// Делается для того, чтобы переместить слайдер, когда 
// он достиг или последнего, или первого слайда
Slider.prototype.invisibleMoveSlider = function(indexPosition, movingPosition) {
	var self = this;

	this.move(indexPosition, function() {
		self.slider.css({
			left: -(self.slideWidth * movingPosition)
		});
		self.changeActiveSlide(movingPosition);
	});
};

// Проверка индекса след слайда
Slider.prototype.checkSlide = function(dataSlide) {
	var 
		dataSlide = dataSlide || 1,
		nextSlide = this.currentSlideIndex + dataSlide,
		slideStartIndex = 1,
		slideEndIndex = this.countSlides;

	if (nextSlide === slideEndIndex) {
		this.invisibleMoveSlider(nextSlide, slideStartIndex);
		this.currentSlideIndex = 1;
		this.ballActivePos = 0;
	} else if (nextSlide === 0) {
		this.currentSlideIndex = slideEndIndex-1;
		this.invisibleMoveSlider(nextSlide, slideEndIndex - 1);	
		this.ballActivePos = this.arrNavElLength - 1;
	}	else {
		this.currentSlideIndex = (dataSlide > 0) ? this.currentSlideIndex += 1 : this.currentSlideIndex -= 1;
		this.move(nextSlide);
		this.changeActiveSlide(nextSlide);
		this.ballActivePos = nextSlide - 1;
	}	

	this.ballsSetActive(this.ballActivePos, false);
};

// Плавное перемещение слайдера
// Параметры: indexPos - индекс активного слайда
Slider.prototype.move = function(indexPos, callback) {
	var self = this;

	// Не плавное перемещение слайдера при инициализации
	if (this.startInit) {
		this.slider.css({
			'left': -(self.slideWidth * indexPos)
		});
		this.startInit = false;
	}

	this.slider.transition({
		'left': -(self.slideWidth * indexPos)
	}, 500, function() {
		self.flag = false;

		if (callback && typeof callback === 'function') {
			callback();
		}
	});	
};

// Инициализация таймера для автономного перемещения слайдера
Slider.prototype.startTimer = function(timer, func) {
	var self = this;

	return setInterval(function() {
					self.checkSlide();
				 }, self.settings.timeStep);
};

// Работа с нижней навигацией(установка, перемещение к соответствующему шарику слайду)
Slider.prototype.ballsSetActive = function(dataSlide, moveSlider) {
	var 
		ballsClass = this.settings.ballsClass,
		ballsClassActive = ballsClass + '-active',
		arrayBalls = this.arrayNavigElements,
		arrBallsLength,
		i;

	if (!this.arrayNavigElements) {
		return false;
	}

	for (i = 0, arrBallsLength = arrayBalls.length; i < arrBallsLength; i++) {
		if (arrayBalls.eq(i).hasClass(ballsClass)) {
			arrayBalls.eq(i).removeClass(ballsClassActive);
		}
	}

	if (moveSlider) {
		this.move(dataSlide);
		this.changeActiveSlide(dataSlide);
		arrayBalls.eq(dataSlide - 1).addClass(ballsClassActive);
	} else {
		arrayBalls.eq(dataSlide).addClass(ballsClassActive);
	}

	this.ballActivePos = dataSlide + 1;
};

// Обработчик клика на кнопки переключения
Slider.prototype.clickHandler = function() {
	var self = this;

	$(document).on('click', '.js-slider-arrow', function() {
		var dataSlide = $(this).data('slide');

		if (self.flag) { 
			return false;
		}

		self.flag = true;

		clearInterval(self.interval);
		self.checkSlide(dataSlide);
		self.ballsSetActive(self.ballActivePos - 1, false);
		self.interval = self.startTimer(self.interval);

		return false;
	});

	$(document).on('click', '.js-nav-circle', function() {
		var 
			dataSlide = $(this).data('slide'),
			ballsClassActive = self.settings.ballsClass + '-active';

		if ($(this).hasClass(ballsClassActive)) {
			return false;
		} 

		self.currentSlideIndex = parseInt(dataSlide);
		clearInterval(self.interval);
		self.ballsSetActive(dataSlide, true);
		self.interval = self.startTimer(self.interval);

		return false;
	});
};

// Инициализация слайдера
Slider.prototype.initSlider = function(){
	if ((this.settings.activePos > this.arrSlides.length) || (this.settings.activePos < 0)) {
		throw new Error('Active position undefined');
	}

	if (this.countSlides == 2) {
		this.ballsSetActive(this.settings.activePos);
		this.setActiveSlide();	

		return false;
	}

	this.setActiveSlide();	
	this.clickHandler();
	this.ballsSetActive(this.settings.activePos);
	this.interval = this.startTimer(this.interval);
};
function SlidesPreview(arrayUrls) {
	this.arrayUrls = arrayUrls;
	this.arrLength = arrayUrls.length;
}

// Формируем из строки массив
SlidesPreview.prototype.stringToArray = function() {
	var inputString;

	if (!this.arrayUrls) {
		return false;
	}

	inputString = JSON.parse(this.arrayUrls);

	return inputString;
};

// Формируем массив объектов 
// На вход индекс активного слайда(тот, который будет показываться первым)
SlidesPreview.prototype.arrayToArrObjs = function() {
	var 
		mainObj = {},
		arrObjects = [],
		arrUrls = this.stringToArray(),
		arrUrlsLength,
		i;

	if (!arrUrls) {
		return false;
	}

	for (i = 0, arrUrlsLength = arrUrls.length; i < arrUrlsLength; i++) {
		arrObjects[i] = { 
			foto: arrUrls[i]
		};
	}
	
	arrObjects[0].active = 'checked';

	mainObj.slides = arrObjects; 

	return mainObj;
};

// Клонирование объекта по значению
SlidesPreview.prototype.cloneObj = function(object) {
	var 
		newObj = {},
		prop;

	for (prop in object) {
		newObj[prop] = object[prop];
	}

	return newObj;
};

// Добавляем 1 последнего объекта вперёд и 1 первого объекта вконец
SlidesPreview.prototype.addObjsToEdges = function(arrObjects) {
	var lengthArr = arrObjects.length - 1;

	arrObjects.push(this.cloneObj(arrObjects[0]));
	arrObjects.unshift(this.cloneObj(arrObjects[lengthArr]))

	lengthArr = arrObjects.length - 1;

	arrObjects[0].notReal = true;
	arrObjects[lengthArr].notReal = true;

	return arrObjects;
};

// Удаляем добавленные вначало и вконец объекты из общего массива объектов
SlidesPreview.prototype.deleteSlidesFromEdges = function(arrObjects) {
	var lengthArr = arrObjects.length - 1;

	arrObjects.splice(lengthArr, 1);
	arrObjects.splice(0, 1);

	return arrObjects;
};

// Удалить св-во active у староко объекта и добавить это св-во к выбранному объекту
SlidesPreview.prototype.changeActiveIndex = function(arrObjects, currentIndex, newActiveIndex) {
	if (newActiveIndex !== currentIndex) {
		delete arrObjects[currentIndex].active;
		currentIndex = newActiveIndex;			
	}

	arrObjects[currentIndex].active = 'checked';

	return currentIndex;
};

// Удаление объекта из массива
// Возвращает индекс активного объекта
SlidesPreview.prototype.deleteObjectFromArray = function(arrObjects, indexDeleteObj, activeIndex) {
	if (indexDeleteObj === activeIndex) {
		this.changeActiveIndex(arrObjects, 0, 0);
		activeIndex = 0;
	} else if (indexDeleteObj < activeIndex) {
		activeIndex -= 1;
	}

	arrObjects.splice(indexDeleteObj, 1);

	return activeIndex;
};
$(document).ready(function() {

(function(){
	var 
		_templates = {
			links: Handlebars.compile($('#links').html()),
			error: Handlebars.compile($('#error-window').html()),
			prewiews: Handlebars.compile($('#prewiews').html()),
			slider: Handlebars.compile($('#slider').html())
	  },
		_optionsSlider = {
			arrows: true,
			balls: true
		},
	  _errorHandler = new ErrorHandler('.error-popup', _templates.error),
		_activeIndex = 0,
		_slidesPreview,
		_arrSlides,
		_objSlides,
		_slider;

	$('.js-wrapper').html(_templates.links());

	$(document).on('click', '.js-save_data', function() {
		var inputStr = $('.input-form_data-inp').val();
		
		if (!inputStr.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Введите данные'
			}, 'Data is empty');
		}
		
		_slidesPreview = new SlidesPreview(inputStr);
		_objSlides = _slidesPreview.arrayToArrObjs(); 
		_objSlides.optionsSlider = _optionsSlider;
		_arrSlides = _objSlides.slides;

		$('.js-wrapper').html(_templates.prewiews(_arrSlides));
		
		return false;
	});

	$(document).on('change', '.js-active_btn', function() {	
		var numNewActive = parseInt($(this).val());

		_activeIndex = _slidesPreview.changeActiveIndex(_arrSlides, _activeIndex, numNewActive);
	});

	$(document).on('click', '.js-delete_preview', function() {
		var 
			item = parseInt($(this).data('item')),
			winScrTop = $(window).scrollTop();

		_activeIndex = _slidesPreview.deleteObjectFromArray(_arrSlides, item, _activeIndex);
		
		$('.js-wrapper').html(_templates.prewiews(_arrSlides));
		$(window).scrollTop(winScrTop);

		return false;
	});

	$(document).on('change', '.js-comment, .js-link', function() {
		var
			$this = $(this),
			dataName = $this.attr('name'), 
			numberObj = $this.data(dataName);

		_arrSlides[numberObj][dataName] = $this.val();
	});

	$(document).on('click', '.js-generate-slider', function() {
		_activeIndex = _activeIndex || 0;

		if (!_arrSlides.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Нет ни одного слайда'
			}, 'Data is empty');
		}

		_arrSlides = _slidesPreview.addObjsToEdges(_arrSlides);

		$('.js-wrapper').html(_templates.slider(_objSlides));	

		_arrSlides = _slidesPreview.deleteSlidesFromEdges(_arrSlides);

		_slider = new Slider($('.slider'), {
			activeClass: 'slider-active',
			activePos: _activeIndex
		});

		_slider.initSlider();
	});

	$(document).on('click', '.js-step-down', function() {
		var toBlock = $(this).data('to');

		_activeIndex = 0;
		$('.js-wrapper').html(_templates[toBlock](_arrSlides));
	});
})();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwiU2xpZGVzUHJldmlldy5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyDQntCx0YDQsNCx0L7RgtGH0LjQuiDQvtGI0LjQsdC+0LpcclxuZnVuY3Rpb24gRXJyb3JIYW5kbGVyKGNsYXNzRXJyV2luZG93LCB0ZW1wbGF0ZUVycm9yKSB7XHJcblx0dGhpcy50aW1lSGlkZSA9IDIwMDA7XHJcblx0dGhpcy5jbGFzc0VycldpbmRvdyA9IGNsYXNzRXJyV2luZG93O1xyXG5cdHRoaXMudGVtcGxhdGVFcnJvciA9IHRlbXBsYXRlRXJyb3I7XHJcbn1cclxuXHJcbi8vINCg0LXQvdC00LXRgNC40L3QsyDRiNCw0LHQu9C+0L3QsCDQvtGI0LjQsdC+0LpcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5uZXdFcnJvciA9IGZ1bmN0aW9uKGVycm9yT2JqZWN0KSB7XHJcblx0cmV0dXJuIHRoaXMudGVtcGxhdGVFcnJvcihlcnJvck9iamVjdCk7XHJcbn07XHJcblxyXG4vLyDQodC60YDRi9Cy0LDQtdC8INC4INGD0LTQsNC70Y/QtdC8INC/0LvQsNGI0LrRgyDQvtGI0LjQsdC60Lgg0YfQtdGA0LXQtyB0aW1lSGlkZSBcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5oaWRlRXJyb3JXaW5kb3cgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgZXJyV2luZG93ID0gJCh0aGlzLmNsYXNzRXJyV2luZG93KTtcclxuXHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdGVycldpbmRvdy5mYWRlT3V0KHRoaXMudGltZUhpZGUsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRlcnJXaW5kb3cucmVtb3ZlKCk7XHJcblx0XHR9KTtcclxuXHR9LCB0aGlzLnRpbWVIaWRlKTtcclxufTtcclxuXHJcbi8vINCf0YDQuCDQstC+0LfQvdC40LrQvdC+0LLQtdC90LjQuCDQvtGI0LjQsdC60Lgg0LLRi9Cy0LXRgdGC0Lgg0L/Qu9Cw0YjQutGDINC4INGD0LTQsNC70LjRgtGMXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuY2F1Z2h0RXJyID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cdCQoJ2JvZHknKS5hcHBlbmQodGhpcy5uZXdFcnJvcihvcHRpb25zKSk7XHJcblx0dGhpcy5oaWRlRXJyb3JXaW5kb3coKTtcclxufTtcclxuXHJcbi8vINCk0YPQvdC60YbQuNGPINCy0YvQt9C+0LLQsCDQvtGI0LjQsdC60LhcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5nZW5lcmF0ZUVycm9yID0gZnVuY3Rpb24oZXJyb3JPcHQsIGNvbnNvbGVNZXNzYWdlKSB7XHJcblx0dGhpcy5jYXVnaHRFcnIoZXJyb3JPcHQpO1xyXG5cdHRocm93IG5ldyBFcnJvcihjb25zb2xlTWVzc2FnZSB8fCAnRXJyb3InKTtcclxufTsiLCJmdW5jdGlvbiBTbGlkZXIoJHNsaWRlciwgb3B0aW9ucykge1xuXHR0aGlzLnNsaWRlciA9ICRzbGlkZXI7XG5cdHRoaXMuYXJyU2xpZGVzID0gdGhpcy5zbGlkZXIuY2hpbGRyZW4oKTtcblx0dGhpcy5jb3VudFNsaWRlcyA9IHRoaXMuYXJyU2xpZGVzLmxlbmd0aCAtIDE7XG5cdHRoaXMuc2V0dGluZ3MgPSAkLmV4dGVuZCh7XG5cdCAgYWN0aXZlQ2xhc3MgOiAnc2xpZGVyLWFjdGl2ZScsXG5cdCAgYmFsbHNCbG9jayA6ICdzbGlkZXItbmF2aWdhdGlvbicsXG5cdCAgYmFsbHNDbGFzcyA6ICdzbGlkZXItbmF2aWdhdGlvbi1jaXJjbGUnLFxuXHQgIGFjdGl2ZVBvcyA6IDAsXG5cdCAgdGltZVN0ZXAgOiA3MDAwXG5cdH0sIG9wdGlvbnMpO1xuXHR0aGlzLnNsaWRlV2lkdGggPSB0aGlzLmFyclNsaWRlcy5vdXRlcldpZHRoKCk7XG5cdHRoaXMuaW5kZXhBY3RpdmVTbGlkZSA9IHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zICsgMTtcblx0dGhpcy5iYWxsc0Jsb2NrID0gJCgnLicgKyB0aGlzLnNldHRpbmdzLmJhbGxzQmxvY2spO1xuXHR0aGlzLmFycmF5TmF2aWdFbGVtZW50cyA9IHRoaXMuYmFsbHNCbG9jay5jaGlsZHJlbignLicgKyB0aGlzLnNldHRpbmdzLmJhbGxzQ2xhc3MpO1xuXHR0aGlzLmFyck5hdkVsTGVuZ3RoID0gdGhpcy5hcnJheU5hdmlnRWxlbWVudHMubGVuZ3RoO1xuXHR0aGlzLmJhbGxBY3RpdmVQb3MgPSB0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcztcblx0dGhpcy5mbGFnID0gZmFsc2U7XG5cdHRoaXMuc3RhcnRJbml0ID0gdHJ1ZTtcblx0dGhpcy5jdXJyZW50U2xpZGVJbmRleCA9IHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zICsgMTtcblx0dGhpcy5pbnRlcnZhbDtcbn1cblxuLy8g0KPRgdGC0LDQvdC+0LLQuNGC0Ywg0LDRgdGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9Cw0LnQtFxuLy8g0KHQu9Cw0LnQtCDQstGL0YfQuNGB0LvRj9C10YLRgdGPINC/0L4g0LjQvdC00LXQutGB0YMsINCz0LTQtSDQuNC90LTQtdC60YEgLSDRjdGC0L4gYWN0aXZlUG9zINCyIG9wdGlvbnNcbi8vINCYINC/0LXRgNC10LzQtdGJ0LDQtdGC0YHRjyDQvdCwINCw0LrRgtC40LLQvdGL0Lkg0YHQu9Cw0LnQtFxuU2xpZGVyLnByb3RvdHlwZS5zZXRBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmFyclNsaWRlcy5lcSh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyArIDEpLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHR0aGlzLm1vdmUodGhpcy5pbmRleEFjdGl2ZVNsaWRlKTtcbn07XG5cbi8vINCh0LHRgNC+0YHQuNGC0Ywg0YHQviDQstGB0LXRhSDRgdC70LDQudC00L7QsiDQsNC60YLQuNCy0L3Ri9C5INC60LvQsNGB0YFcbi8vINCf0L7RgdGC0LDQstC40YLRjCDQsNC60YLQuNCy0L3Ri9C5INC60LvQsNGB0YEg0L3QsCDRgdC70LXQtCDRgdC70LDQudC0IChuZXh0U2xpZGUgLSDRgdC70LXQtC4g0LjQvdC00LXQutGBKVxuU2xpZGVyLnByb3RvdHlwZS5jaGFuZ2VBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKG5leHRTbGlkZSkge1xuXHR0aGlzLmFyclNsaWRlcy5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHR0aGlzLmFyclNsaWRlcy5lcShuZXh0U2xpZGUpLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xufTtcblxuLy8g0J3QtdC30LDQvNC10YLQvdC+0LUg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXG4vLyDQlNC10LvQsNC10YLRgdGPINC00LvRjyDRgtC+0LPQviwg0YfRgtC+0LHRiyDQv9C10YDQtdC80LXRgdGC0LjRgtGMINGB0LvQsNC50LTQtdGALCDQutC+0LPQtNCwIFxuLy8g0L7QvSDQtNC+0YHRgtC40LMg0LjQu9C4INC/0L7RgdC70LXQtNC90LXQs9C+LCDQuNC70Lgg0L/QtdGA0LLQvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmludmlzaWJsZU1vdmVTbGlkZXIgPSBmdW5jdGlvbihpbmRleFBvc2l0aW9uLCBtb3ZpbmdQb3NpdGlvbikge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dGhpcy5tb3ZlKGluZGV4UG9zaXRpb24sIGZ1bmN0aW9uKCkge1xuXHRcdHNlbGYuc2xpZGVyLmNzcyh7XG5cdFx0XHRsZWZ0OiAtKHNlbGYuc2xpZGVXaWR0aCAqIG1vdmluZ1Bvc2l0aW9uKVxuXHRcdH0pO1xuXHRcdHNlbGYuY2hhbmdlQWN0aXZlU2xpZGUobW92aW5nUG9zaXRpb24pO1xuXHR9KTtcbn07XG5cbi8vINCf0YDQvtCy0LXRgNC60LAg0LjQvdC00LXQutGB0LAg0YHQu9C10LQg0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmNoZWNrU2xpZGUgPSBmdW5jdGlvbihkYXRhU2xpZGUpIHtcblx0dmFyIFxuXHRcdGRhdGFTbGlkZSA9IGRhdGFTbGlkZSB8fCAxLFxuXHRcdG5leHRTbGlkZSA9IHRoaXMuY3VycmVudFNsaWRlSW5kZXggKyBkYXRhU2xpZGUsXG5cdFx0c2xpZGVTdGFydEluZGV4ID0gMSxcblx0XHRzbGlkZUVuZEluZGV4ID0gdGhpcy5jb3VudFNsaWRlcztcblxuXHRpZiAobmV4dFNsaWRlID09PSBzbGlkZUVuZEluZGV4KSB7XG5cdFx0dGhpcy5pbnZpc2libGVNb3ZlU2xpZGVyKG5leHRTbGlkZSwgc2xpZGVTdGFydEluZGV4KTtcblx0XHR0aGlzLmN1cnJlbnRTbGlkZUluZGV4ID0gMTtcblx0XHR0aGlzLmJhbGxBY3RpdmVQb3MgPSAwO1xuXHR9IGVsc2UgaWYgKG5leHRTbGlkZSA9PT0gMCkge1xuXHRcdHRoaXMuY3VycmVudFNsaWRlSW5kZXggPSBzbGlkZUVuZEluZGV4LTE7XG5cdFx0dGhpcy5pbnZpc2libGVNb3ZlU2xpZGVyKG5leHRTbGlkZSwgc2xpZGVFbmRJbmRleCAtIDEpO1x0XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gdGhpcy5hcnJOYXZFbExlbmd0aCAtIDE7XG5cdH1cdGVsc2Uge1xuXHRcdHRoaXMuY3VycmVudFNsaWRlSW5kZXggPSAoZGF0YVNsaWRlID4gMCkgPyB0aGlzLmN1cnJlbnRTbGlkZUluZGV4ICs9IDEgOiB0aGlzLmN1cnJlbnRTbGlkZUluZGV4IC09IDE7XG5cdFx0dGhpcy5tb3ZlKG5leHRTbGlkZSk7XG5cdFx0dGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShuZXh0U2xpZGUpO1xuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IG5leHRTbGlkZSAtIDE7XG5cdH1cdFxuXG5cdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5iYWxsQWN0aXZlUG9zLCBmYWxzZSk7XG59O1xuXG4vLyDQn9C70LDQstC90L7QtSDQv9C10YDQtdC80LXRidC10L3QuNC1INGB0LvQsNC50LTQtdGA0LBcbi8vINCf0LDRgNCw0LzQtdGC0YDRizogaW5kZXhQb3MgLSDQuNC90LTQtdC60YEg0LDQutGC0LjQstC90L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oaW5kZXhQb3MsIGNhbGxiYWNrKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHQvLyDQndC1INC/0LvQsNCy0L3QvtC1INC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsCDQv9GA0Lgg0LjQvdC40YbQuNCw0LvQuNC30LDRhtC40Lhcblx0aWYgKHRoaXMuc3RhcnRJbml0KSB7XG5cdFx0dGhpcy5zbGlkZXIuY3NzKHtcblx0XHRcdCdsZWZ0JzogLShzZWxmLnNsaWRlV2lkdGggKiBpbmRleFBvcylcblx0XHR9KTtcblx0XHR0aGlzLnN0YXJ0SW5pdCA9IGZhbHNlO1xuXHR9XG5cblx0dGhpcy5zbGlkZXIudHJhbnNpdGlvbih7XG5cdFx0J2xlZnQnOiAtKHNlbGYuc2xpZGVXaWR0aCAqIGluZGV4UG9zKVxuXHR9LCA1MDAsIGZ1bmN0aW9uKCkge1xuXHRcdHNlbGYuZmxhZyA9IGZhbHNlO1xuXG5cdFx0aWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cdH0pO1x0XG59O1xuXG4vLyDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDRgtCw0LnQvNC10YDQsCDQtNC70Y8g0LDQstGC0L7QvdC+0LzQvdC+0LPQviDQv9C10YDQtdC80LXRidC10L3QuNGPINGB0LvQsNC50LTQtdGA0LBcblNsaWRlci5wcm90b3R5cGUuc3RhcnRUaW1lciA9IGZ1bmN0aW9uKHRpbWVyLCBmdW5jKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHRyZXR1cm4gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2VsZi5jaGVja1NsaWRlKCk7XG5cdFx0XHRcdCB9LCBzZWxmLnNldHRpbmdzLnRpbWVTdGVwKTtcbn07XG5cbi8vINCg0LDQsdC+0YLQsCDRgSDQvdC40LbQvdC10Lkg0L3QsNCy0LjQs9Cw0YbQuNC10Lko0YPRgdGC0LDQvdC+0LLQutCwLCDQv9C10YDQtdC80LXRidC10L3QuNC1INC6INGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0LXQvNGDINGI0LDRgNC40LrRgyDRgdC70LDQudC00YMpXG5TbGlkZXIucHJvdG90eXBlLmJhbGxzU2V0QWN0aXZlID0gZnVuY3Rpb24oZGF0YVNsaWRlLCBtb3ZlU2xpZGVyKSB7XG5cdHZhciBcblx0XHRiYWxsc0NsYXNzID0gdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzLFxuXHRcdGJhbGxzQ2xhc3NBY3RpdmUgPSBiYWxsc0NsYXNzICsgJy1hY3RpdmUnLFxuXHRcdGFycmF5QmFsbHMgPSB0aGlzLmFycmF5TmF2aWdFbGVtZW50cyxcblx0XHRhcnJCYWxsc0xlbmd0aCxcblx0XHRpO1xuXG5cdGlmICghdGhpcy5hcnJheU5hdmlnRWxlbWVudHMpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRmb3IgKGkgPSAwLCBhcnJCYWxsc0xlbmd0aCA9IGFycmF5QmFsbHMubGVuZ3RoOyBpIDwgYXJyQmFsbHNMZW5ndGg7IGkrKykge1xuXHRcdGlmIChhcnJheUJhbGxzLmVxKGkpLmhhc0NsYXNzKGJhbGxzQ2xhc3MpKSB7XG5cdFx0XHRhcnJheUJhbGxzLmVxKGkpLnJlbW92ZUNsYXNzKGJhbGxzQ2xhc3NBY3RpdmUpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChtb3ZlU2xpZGVyKSB7XG5cdFx0dGhpcy5tb3ZlKGRhdGFTbGlkZSk7XG5cdFx0dGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShkYXRhU2xpZGUpO1xuXHRcdGFycmF5QmFsbHMuZXEoZGF0YVNsaWRlIC0gMSkuYWRkQ2xhc3MoYmFsbHNDbGFzc0FjdGl2ZSk7XG5cdH0gZWxzZSB7XG5cdFx0YXJyYXlCYWxscy5lcShkYXRhU2xpZGUpLmFkZENsYXNzKGJhbGxzQ2xhc3NBY3RpdmUpO1xuXHR9XG5cblx0dGhpcy5iYWxsQWN0aXZlUG9zID0gZGF0YVNsaWRlICsgMTtcbn07XG5cbi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6INC60LvQuNC60LAg0L3QsCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQutC70Y7Rh9C10L3QuNGPXG5TbGlkZXIucHJvdG90eXBlLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1zbGlkZXItYXJyb3cnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGF0YVNsaWRlID0gJCh0aGlzKS5kYXRhKCdzbGlkZScpO1xuXG5cdFx0aWYgKHNlbGYuZmxhZykgeyBcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRzZWxmLmZsYWcgPSB0cnVlO1xuXG5cdFx0Y2xlYXJJbnRlcnZhbChzZWxmLmludGVydmFsKTtcblx0XHRzZWxmLmNoZWNrU2xpZGUoZGF0YVNsaWRlKTtcblx0XHRzZWxmLmJhbGxzU2V0QWN0aXZlKHNlbGYuYmFsbEFjdGl2ZVBvcyAtIDEsIGZhbHNlKTtcblx0XHRzZWxmLmludGVydmFsID0gc2VsZi5zdGFydFRpbWVyKHNlbGYuaW50ZXJ2YWwpO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLW5hdi1jaXJjbGUnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgXG5cdFx0XHRkYXRhU2xpZGUgPSAkKHRoaXMpLmRhdGEoJ3NsaWRlJyksXG5cdFx0XHRiYWxsc0NsYXNzQWN0aXZlID0gc2VsZi5zZXR0aW5ncy5iYWxsc0NsYXNzICsgJy1hY3RpdmUnO1xuXG5cdFx0aWYgKCQodGhpcykuaGFzQ2xhc3MoYmFsbHNDbGFzc0FjdGl2ZSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IFxuXG5cdFx0c2VsZi5jdXJyZW50U2xpZGVJbmRleCA9IHBhcnNlSW50KGRhdGFTbGlkZSk7XG5cdFx0Y2xlYXJJbnRlcnZhbChzZWxmLmludGVydmFsKTtcblx0XHRzZWxmLmJhbGxzU2V0QWN0aXZlKGRhdGFTbGlkZSwgdHJ1ZSk7XG5cdFx0c2VsZi5pbnRlcnZhbCA9IHNlbGYuc3RhcnRUaW1lcihzZWxmLmludGVydmFsKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG59O1xuXG4vLyDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDRgdC70LDQudC00LXRgNCwXG5TbGlkZXIucHJvdG90eXBlLmluaXRTbGlkZXIgPSBmdW5jdGlvbigpe1xuXHRpZiAoKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zID4gdGhpcy5hcnJTbGlkZXMubGVuZ3RoKSB8fCAodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgPCAwKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignQWN0aXZlIHBvc2l0aW9uIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0aWYgKHRoaXMuY291bnRTbGlkZXMgPT0gMikge1xuXHRcdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MpO1xuXHRcdHRoaXMuc2V0QWN0aXZlU2xpZGUoKTtcdFxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dGhpcy5zZXRBY3RpdmVTbGlkZSgpO1x0XG5cdHRoaXMuY2xpY2tIYW5kbGVyKCk7XG5cdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MpO1xuXHR0aGlzLmludGVydmFsID0gdGhpcy5zdGFydFRpbWVyKHRoaXMuaW50ZXJ2YWwpO1xufTsiLCJmdW5jdGlvbiBTbGlkZXNQcmV2aWV3KGFycmF5VXJscykge1xyXG5cdHRoaXMuYXJyYXlVcmxzID0gYXJyYXlVcmxzO1xyXG5cdHRoaXMuYXJyTGVuZ3RoID0gYXJyYXlVcmxzLmxlbmd0aDtcclxufVxyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC40Lcg0YHRgtGA0L7QutC4INC80LDRgdGB0LjQslxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5zdHJpbmdUb0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGlucHV0U3RyaW5nO1xyXG5cclxuXHRpZiAoIXRoaXMuYXJyYXlVcmxzKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRpbnB1dFN0cmluZyA9IEpTT04ucGFyc2UodGhpcy5hcnJheVVybHMpO1xyXG5cclxuXHRyZXR1cm4gaW5wdXRTdHJpbmc7XHJcbn07XHJcblxyXG4vLyDQpNC+0YDQvNC40YDRg9C10Lwg0LzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIgXHJcbi8vINCd0LAg0LLRhdC+0LQg0LjQvdC00LXQutGBINCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LAo0YLQvtGCLCDQutC+0YLQvtGA0YvQuSDQsdGD0LTQtdGCINC/0L7QutCw0LfRi9Cy0LDRgtGM0YHRjyDQv9C10YDQstGL0LwpXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmFycmF5VG9BcnJPYmpzID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIFxyXG5cdFx0bWFpbk9iaiA9IHt9LFxyXG5cdFx0YXJyT2JqZWN0cyA9IFtdLFxyXG5cdFx0YXJyVXJscyA9IHRoaXMuc3RyaW5nVG9BcnJheSgpLFxyXG5cdFx0YXJyVXJsc0xlbmd0aCxcclxuXHRcdGk7XHJcblxyXG5cdGlmICghYXJyVXJscykge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0Zm9yIChpID0gMCwgYXJyVXJsc0xlbmd0aCA9IGFyclVybHMubGVuZ3RoOyBpIDwgYXJyVXJsc0xlbmd0aDsgaSsrKSB7XHJcblx0XHRhcnJPYmplY3RzW2ldID0geyBcclxuXHRcdFx0Zm90bzogYXJyVXJsc1tpXVxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0YXJyT2JqZWN0c1swXS5hY3RpdmUgPSAnY2hlY2tlZCc7XHJcblxyXG5cdG1haW5PYmouc2xpZGVzID0gYXJyT2JqZWN0czsgXHJcblxyXG5cdHJldHVybiBtYWluT2JqO1xyXG59O1xyXG5cclxuLy8g0JrQu9C+0L3QuNGA0L7QstCw0L3QuNC1INC+0LHRitC10LrRgtCwINC/0L4g0LfQvdCw0YfQtdC90LjRjlxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5jbG9uZU9iaiA9IGZ1bmN0aW9uKG9iamVjdCkge1xyXG5cdHZhciBcclxuXHRcdG5ld09iaiA9IHt9LFxyXG5cdFx0cHJvcDtcclxuXHJcblx0Zm9yIChwcm9wIGluIG9iamVjdCkge1xyXG5cdFx0bmV3T2JqW3Byb3BdID0gb2JqZWN0W3Byb3BdO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIG5ld09iajtcclxufTtcclxuXHJcbi8vINCU0L7QsdCw0LLQu9GP0LXQvCAxINC/0L7RgdC70LXQtNC90LXQs9C+INC+0LHRitC10LrRgtCwINCy0L/QtdGA0ZHQtCDQuCAxINC/0LXRgNCy0L7Qs9C+INC+0LHRitC10LrRgtCwINCy0LrQvtC90LXRhlxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5hZGRPYmpzVG9FZGdlcyA9IGZ1bmN0aW9uKGFyck9iamVjdHMpIHtcclxuXHR2YXIgbGVuZ3RoQXJyID0gYXJyT2JqZWN0cy5sZW5ndGggLSAxO1xyXG5cclxuXHRhcnJPYmplY3RzLnB1c2godGhpcy5jbG9uZU9iaihhcnJPYmplY3RzWzBdKSk7XHJcblx0YXJyT2JqZWN0cy51bnNoaWZ0KHRoaXMuY2xvbmVPYmooYXJyT2JqZWN0c1tsZW5ndGhBcnJdKSlcclxuXHJcblx0bGVuZ3RoQXJyID0gYXJyT2JqZWN0cy5sZW5ndGggLSAxO1xyXG5cclxuXHRhcnJPYmplY3RzWzBdLm5vdFJlYWwgPSB0cnVlO1xyXG5cdGFyck9iamVjdHNbbGVuZ3RoQXJyXS5ub3RSZWFsID0gdHJ1ZTtcclxuXHJcblx0cmV0dXJuIGFyck9iamVjdHM7XHJcbn07XHJcblxyXG4vLyDQo9C00LDQu9GP0LXQvCDQtNC+0LHQsNCy0LvQtdC90L3Ri9C1INCy0L3QsNGH0LDQu9C+INC4INCy0LrQvtC90LXRhiDQvtCx0YrQtdC60YLRiyDQuNC3INC+0LHRidC10LPQviDQvNCw0YHRgdC40LLQsCDQvtCx0YrQtdC60YLQvtCyXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmRlbGV0ZVNsaWRlc0Zyb21FZGdlcyA9IGZ1bmN0aW9uKGFyck9iamVjdHMpIHtcclxuXHR2YXIgbGVuZ3RoQXJyID0gYXJyT2JqZWN0cy5sZW5ndGggLSAxO1xyXG5cclxuXHRhcnJPYmplY3RzLnNwbGljZShsZW5ndGhBcnIsIDEpO1xyXG5cdGFyck9iamVjdHMuc3BsaWNlKDAsIDEpO1xyXG5cclxuXHRyZXR1cm4gYXJyT2JqZWN0cztcclxufTtcclxuXHJcbi8vINCj0LTQsNC70LjRgtGMINGB0LIt0LLQviBhY3RpdmUg0YMg0YHRgtCw0YDQvtC60L4g0L7QsdGK0LXQutGC0LAg0Lgg0LTQvtCx0LDQstC40YLRjCDRjdGC0L4g0YHQsi3QstC+INC6INCy0YvQsdGA0LDQvdC90L7QvNGDINC+0LHRitC10LrRgtGDXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmNoYW5nZUFjdGl2ZUluZGV4ID0gZnVuY3Rpb24oYXJyT2JqZWN0cywgY3VycmVudEluZGV4LCBuZXdBY3RpdmVJbmRleCkge1xyXG5cdGlmIChuZXdBY3RpdmVJbmRleCAhPT0gY3VycmVudEluZGV4KSB7XHJcblx0XHRkZWxldGUgYXJyT2JqZWN0c1tjdXJyZW50SW5kZXhdLmFjdGl2ZTtcclxuXHRcdGN1cnJlbnRJbmRleCA9IG5ld0FjdGl2ZUluZGV4O1x0XHRcdFxyXG5cdH1cclxuXHJcblx0YXJyT2JqZWN0c1tjdXJyZW50SW5kZXhdLmFjdGl2ZSA9ICdjaGVja2VkJztcclxuXHJcblx0cmV0dXJuIGN1cnJlbnRJbmRleDtcclxufTtcclxuXHJcbi8vINCj0LTQsNC70LXQvdC40LUg0L7QsdGK0LXQutGC0LAg0LjQtyDQvNCw0YHRgdC40LLQsFxyXG4vLyDQktC+0LfQstGA0LDRidCw0LXRgiDQuNC90LTQtdC60YEg0LDQutGC0LjQstC90L7Qs9C+INC+0LHRitC10LrRgtCwXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmRlbGV0ZU9iamVjdEZyb21BcnJheSA9IGZ1bmN0aW9uKGFyck9iamVjdHMsIGluZGV4RGVsZXRlT2JqLCBhY3RpdmVJbmRleCkge1xyXG5cdGlmIChpbmRleERlbGV0ZU9iaiA9PT0gYWN0aXZlSW5kZXgpIHtcclxuXHRcdHRoaXMuY2hhbmdlQWN0aXZlSW5kZXgoYXJyT2JqZWN0cywgMCwgMCk7XHJcblx0XHRhY3RpdmVJbmRleCA9IDA7XHJcblx0fSBlbHNlIGlmIChpbmRleERlbGV0ZU9iaiA8IGFjdGl2ZUluZGV4KSB7XHJcblx0XHRhY3RpdmVJbmRleCAtPSAxO1xyXG5cdH1cclxuXHJcblx0YXJyT2JqZWN0cy5zcGxpY2UoaW5kZXhEZWxldGVPYmosIDEpO1xyXG5cclxuXHRyZXR1cm4gYWN0aXZlSW5kZXg7XHJcbn07IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbihmdW5jdGlvbigpe1xuXHR2YXIgXG5cdFx0X3RlbXBsYXRlcyA9IHtcblx0XHRcdGxpbmtzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2xpbmtzJykuaHRtbCgpKSxcblx0XHRcdGVycm9yOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2Vycm9yLXdpbmRvdycpLmh0bWwoKSksXG5cdFx0XHRwcmV3aWV3czogSGFuZGxlYmFycy5jb21waWxlKCQoJyNwcmV3aWV3cycpLmh0bWwoKSksXG5cdFx0XHRzbGlkZXI6IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjc2xpZGVyJykuaHRtbCgpKVxuXHQgIH0sXG5cdFx0X29wdGlvbnNTbGlkZXIgPSB7XG5cdFx0XHRhcnJvd3M6IHRydWUsXG5cdFx0XHRiYWxsczogdHJ1ZVxuXHRcdH0sXG5cdCAgX2Vycm9ySGFuZGxlciA9IG5ldyBFcnJvckhhbmRsZXIoJy5lcnJvci1wb3B1cCcsIF90ZW1wbGF0ZXMuZXJyb3IpLFxuXHRcdF9hY3RpdmVJbmRleCA9IDAsXG5cdFx0X3NsaWRlc1ByZXZpZXcsXG5cdFx0X2FyclNsaWRlcyxcblx0XHRfb2JqU2xpZGVzLFxuXHRcdF9zbGlkZXI7XG5cblx0JCgnLmpzLXdyYXBwZXInKS5odG1sKF90ZW1wbGF0ZXMubGlua3MoKSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1zYXZlX2RhdGEnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgaW5wdXRTdHIgPSAkKCcuaW5wdXQtZm9ybV9kYXRhLWlucCcpLnZhbCgpO1xuXHRcdFxuXHRcdGlmICghaW5wdXRTdHIubGVuZ3RoKSB7XG5cdFx0XHRfZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0LTQsNC90L3Ri9C1J1xuXHRcdFx0fSwgJ0RhdGEgaXMgZW1wdHknKTtcblx0XHR9XG5cdFx0XG5cdFx0X3NsaWRlc1ByZXZpZXcgPSBuZXcgU2xpZGVzUHJldmlldyhpbnB1dFN0cik7XG5cdFx0X29ialNsaWRlcyA9IF9zbGlkZXNQcmV2aWV3LmFycmF5VG9BcnJPYmpzKCk7IFxuXHRcdF9vYmpTbGlkZXMub3B0aW9uc1NsaWRlciA9IF9vcHRpb25zU2xpZGVyO1xuXHRcdF9hcnJTbGlkZXMgPSBfb2JqU2xpZGVzLnNsaWRlcztcblxuXHRcdCQoJy5qcy13cmFwcGVyJykuaHRtbChfdGVtcGxhdGVzLnByZXdpZXdzKF9hcnJTbGlkZXMpKTtcblx0XHRcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmpzLWFjdGl2ZV9idG4nLCBmdW5jdGlvbigpIHtcdFxuXHRcdHZhciBudW1OZXdBY3RpdmUgPSBwYXJzZUludCgkKHRoaXMpLnZhbCgpKTtcblxuXHRcdF9hY3RpdmVJbmRleCA9IF9zbGlkZXNQcmV2aWV3LmNoYW5nZUFjdGl2ZUluZGV4KF9hcnJTbGlkZXMsIF9hY3RpdmVJbmRleCwgbnVtTmV3QWN0aXZlKTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1kZWxldGVfcHJldmlldycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBcblx0XHRcdGl0ZW0gPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2l0ZW0nKSksXG5cdFx0XHR3aW5TY3JUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cblx0XHRfYWN0aXZlSW5kZXggPSBfc2xpZGVzUHJldmlldy5kZWxldGVPYmplY3RGcm9tQXJyYXkoX2FyclNsaWRlcywgaXRlbSwgX2FjdGl2ZUluZGV4KTtcblx0XHRcblx0XHQkKCcuanMtd3JhcHBlcicpLmh0bWwoX3RlbXBsYXRlcy5wcmV3aWV3cyhfYXJyU2xpZGVzKSk7XG5cdFx0JCh3aW5kb3cpLnNjcm9sbFRvcCh3aW5TY3JUb3ApO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5qcy1jb21tZW50LCAuanMtbGluaycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhclxuXHRcdFx0JHRoaXMgPSAkKHRoaXMpLFxuXHRcdFx0ZGF0YU5hbWUgPSAkdGhpcy5hdHRyKCduYW1lJyksIFxuXHRcdFx0bnVtYmVyT2JqID0gJHRoaXMuZGF0YShkYXRhTmFtZSk7XG5cblx0XHRfYXJyU2xpZGVzW251bWJlck9ial1bZGF0YU5hbWVdID0gJHRoaXMudmFsKCk7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtZ2VuZXJhdGUtc2xpZGVyJywgZnVuY3Rpb24oKSB7XG5cdFx0X2FjdGl2ZUluZGV4ID0gX2FjdGl2ZUluZGV4IHx8IDA7XG5cblx0XHRpZiAoIV9hcnJTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRfZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0J3QtdGCINC90Lgg0L7QtNC90L7Qs9C+INGB0LvQsNC50LTQsCdcblx0XHRcdH0sICdEYXRhIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0X2FyclNsaWRlcyA9IF9zbGlkZXNQcmV2aWV3LmFkZE9ianNUb0VkZ2VzKF9hcnJTbGlkZXMpO1xuXG5cdFx0JCgnLmpzLXdyYXBwZXInKS5odG1sKF90ZW1wbGF0ZXMuc2xpZGVyKF9vYmpTbGlkZXMpKTtcdFxuXG5cdFx0X2FyclNsaWRlcyA9IF9zbGlkZXNQcmV2aWV3LmRlbGV0ZVNsaWRlc0Zyb21FZGdlcyhfYXJyU2xpZGVzKTtcblxuXHRcdF9zbGlkZXIgPSBuZXcgU2xpZGVyKCQoJy5zbGlkZXInKSwge1xuXHRcdFx0YWN0aXZlQ2xhc3M6ICdzbGlkZXItYWN0aXZlJyxcblx0XHRcdGFjdGl2ZVBvczogX2FjdGl2ZUluZGV4XG5cdFx0fSk7XG5cblx0XHRfc2xpZGVyLmluaXRTbGlkZXIoKTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1zdGVwLWRvd24nLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9CbG9jayA9ICQodGhpcykuZGF0YSgndG8nKTtcblxuXHRcdF9hY3RpdmVJbmRleCA9IDA7XG5cdFx0JCgnLmpzLXdyYXBwZXInKS5odG1sKF90ZW1wbGF0ZXNbdG9CbG9ja10oX2FyclNsaWRlcykpO1xuXHR9KTtcbn0pKCk7XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
