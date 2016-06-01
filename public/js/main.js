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

// Проверка кол-ва слайдов
// Если слайд один, то нужно будет убрать опцию стрелок
SlidesPreview.prototype.onlyOneSlide = function(arrObjects) {
	if (arrObjects <= 1) {
		return true;
	}
};

// Удаление объекта из массива
// Возвращает индекс активного объекта
SlidesPreview.prototype.deleteObjectFromArray = function(arrObjects, indexDeleteObj, activeIndex) {
	arrObjects.splice(indexDeleteObj, 1);

	if (indexDeleteObj === activeIndex) {
		activeIndex = this.changeActiveIndex(arrObjects, 0, 0);
	} else if (indexDeleteObj < activeIndex) {
		activeIndex -= 1;
	}

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

		if (_objSlides.slides.length <= 1) {
			_objSlides.optionsSlider.arrows = false;
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

		if (toBlock === 'links') {
			_activeIndex = 0;
		}

		$('.js-wrapper').html(_templates[toBlock](_arrSlides));
	});
})();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwiU2xpZGVzUHJldmlldy5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g0J7QsdGA0LDQsdC+0YLRh9C40Log0L7RiNC40LHQvtC6XHJcbmZ1bmN0aW9uIEVycm9ySGFuZGxlcihjbGFzc0VycldpbmRvdywgdGVtcGxhdGVFcnJvcikge1xyXG5cdHRoaXMudGltZUhpZGUgPSAyMDAwO1xyXG5cdHRoaXMuY2xhc3NFcnJXaW5kb3cgPSBjbGFzc0VycldpbmRvdztcclxuXHR0aGlzLnRlbXBsYXRlRXJyb3IgPSB0ZW1wbGF0ZUVycm9yO1xyXG59XHJcblxyXG4vLyDQoNC10L3QtNC10YDQuNC90LMg0YjQsNCx0LvQvtC90LAg0L7RiNC40LHQvtC6XHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUubmV3RXJyb3IgPSBmdW5jdGlvbihlcnJvck9iamVjdCkge1xyXG5cdHJldHVybiB0aGlzLnRlbXBsYXRlRXJyb3IoZXJyb3JPYmplY3QpO1xyXG59O1xyXG5cclxuLy8g0KHQutGA0YvQstCw0LXQvCDQuCDRg9C00LDQu9GP0LXQvCDQv9C70LDRiNC60YMg0L7RiNC40LHQutC4INGH0LXRgNC10LcgdGltZUhpZGUgXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuaGlkZUVycm9yV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGVycldpbmRvdyA9ICQodGhpcy5jbGFzc0VycldpbmRvdyk7XHJcblxyXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRlcnJXaW5kb3cuZmFkZU91dCh0aGlzLnRpbWVIaWRlLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0ZXJyV2luZG93LnJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblx0fSwgdGhpcy50aW1lSGlkZSk7XHJcbn07XHJcblxyXG4vLyDQn9GA0Lgg0LLQvtC30L3QuNC60L3QvtCy0LXQvdC40Lgg0L7RiNC40LHQutC4INCy0YvQstC10YHRgtC4INC/0LvQsNGI0LrRgyDQuCDRg9C00LDQu9C40YLRjFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmNhdWdodEVyciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHQkKCdib2R5JykuYXBwZW5kKHRoaXMubmV3RXJyb3Iob3B0aW9ucykpO1xyXG5cdHRoaXMuaGlkZUVycm9yV2luZG93KCk7XHJcbn07XHJcblxyXG4vLyDQpNGD0L3QutGG0LjRjyDQstGL0LfQvtCy0LAg0L7RiNC40LHQutC4XHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuZ2VuZXJhdGVFcnJvciA9IGZ1bmN0aW9uKGVycm9yT3B0LCBjb25zb2xlTWVzc2FnZSkge1xyXG5cdHRoaXMuY2F1Z2h0RXJyKGVycm9yT3B0KTtcclxuXHR0aHJvdyBuZXcgRXJyb3IoY29uc29sZU1lc3NhZ2UgfHwgJ0Vycm9yJyk7XHJcbn07IiwiZnVuY3Rpb24gU2xpZGVyKCRzbGlkZXIsIG9wdGlvbnMpIHtcblx0dGhpcy5zbGlkZXIgPSAkc2xpZGVyO1xuXHR0aGlzLmFyclNsaWRlcyA9IHRoaXMuc2xpZGVyLmNoaWxkcmVuKCk7XG5cdHRoaXMuY291bnRTbGlkZXMgPSB0aGlzLmFyclNsaWRlcy5sZW5ndGggLSAxO1xuXHR0aGlzLnNldHRpbmdzID0gJC5leHRlbmQoe1xuXHQgIGFjdGl2ZUNsYXNzIDogJ3NsaWRlci1hY3RpdmUnLFxuXHQgIGJhbGxzQmxvY2sgOiAnc2xpZGVyLW5hdmlnYXRpb24nLFxuXHQgIGJhbGxzQ2xhc3MgOiAnc2xpZGVyLW5hdmlnYXRpb24tY2lyY2xlJyxcblx0ICBhY3RpdmVQb3MgOiAwLFxuXHQgIHRpbWVTdGVwIDogNzAwMFxuXHR9LCBvcHRpb25zKTtcblx0dGhpcy5zbGlkZVdpZHRoID0gdGhpcy5hcnJTbGlkZXMub3V0ZXJXaWR0aCgpO1xuXHR0aGlzLmluZGV4QWN0aXZlU2xpZGUgPSB0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyArIDE7XG5cdHRoaXMuYmFsbHNCbG9jayA9ICQoJy4nICsgdGhpcy5zZXR0aW5ncy5iYWxsc0Jsb2NrKTtcblx0dGhpcy5hcnJheU5hdmlnRWxlbWVudHMgPSB0aGlzLmJhbGxzQmxvY2suY2hpbGRyZW4oJy4nICsgdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzKTtcblx0dGhpcy5hcnJOYXZFbExlbmd0aCA9IHRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzLmxlbmd0aDtcblx0dGhpcy5iYWxsQWN0aXZlUG9zID0gdGhpcy5zZXR0aW5ncy5hY3RpdmVQb3M7XG5cdHRoaXMuZmxhZyA9IGZhbHNlO1xuXHR0aGlzLnN0YXJ0SW5pdCA9IHRydWU7XG5cdHRoaXMuY3VycmVudFNsaWRlSW5kZXggPSB0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyArIDE7XG5cdHRoaXMuaW50ZXJ2YWw7XG59XG5cbi8vINCj0YHRgtCw0L3QvtCy0LjRgtGMINCw0YHRgtC40LLQvdGL0Lkg0LrQu9Cw0YHRgSDQvdCwINGB0LvQsNC50LRcbi8vINCh0LvQsNC50LQg0LLRi9GH0LjRgdC70Y/QtdGC0YHRjyDQv9C+INC40L3QtNC10LrRgdGDLCDQs9C00LUg0LjQvdC00LXQutGBIC0g0Y3RgtC+IGFjdGl2ZVBvcyDQsiBvcHRpb25zXG4vLyDQmCDQv9C10YDQtdC80LXRidCw0LXRgtGB0Y8g0L3QsCDQsNC60YLQuNCy0L3Ri9C5INGB0LvQsNC50LRcblNsaWRlci5wcm90b3R5cGUuc2V0QWN0aXZlU2xpZGUgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5hcnJTbGlkZXMuZXEodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgKyAxKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy5tb3ZlKHRoaXMuaW5kZXhBY3RpdmVTbGlkZSk7XG59O1xuXG4vLyDQodCx0YDQvtGB0LjRgtGMINGB0L4g0LLRgdC10YUg0YHQu9Cw0LnQtNC+0LIg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBXG4vLyDQn9C+0YHRgtCw0LLQuNGC0Ywg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9C10LQg0YHQu9Cw0LnQtCAobmV4dFNsaWRlIC0g0YHQu9C10LQuINC40L3QtNC10LrRgSlcblNsaWRlci5wcm90b3R5cGUuY2hhbmdlQWN0aXZlU2xpZGUgPSBmdW5jdGlvbihuZXh0U2xpZGUpIHtcblx0dGhpcy5hcnJTbGlkZXMuc2libGluZ3MoKS5yZW1vdmVDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy5hcnJTbGlkZXMuZXEobmV4dFNsaWRlKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbn07XG5cbi8vINCd0LXQt9Cw0LzQtdGC0L3QvtC1INC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxuLy8g0JTQtdC70LDQtdGC0YHRjyDQtNC70Y8g0YLQvtCz0L4sINGH0YLQvtCx0Ysg0L/QtdGA0LXQvNC10YHRgtC40YLRjCDRgdC70LDQudC00LXRgCwg0LrQvtCz0LTQsCBcbi8vINC+0L0g0LTQvtGB0YLQuNCzINC40LvQuCDQv9C+0YHQu9C10LTQvdC10LPQviwg0LjQu9C4INC/0LXRgNCy0L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5pbnZpc2libGVNb3ZlU2xpZGVyID0gZnVuY3Rpb24oaW5kZXhQb3NpdGlvbiwgbW92aW5nUG9zaXRpb24pIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHRoaXMubW92ZShpbmRleFBvc2l0aW9uLCBmdW5jdGlvbigpIHtcblx0XHRzZWxmLnNsaWRlci5jc3Moe1xuXHRcdFx0bGVmdDogLShzZWxmLnNsaWRlV2lkdGggKiBtb3ZpbmdQb3NpdGlvbilcblx0XHR9KTtcblx0XHRzZWxmLmNoYW5nZUFjdGl2ZVNsaWRlKG1vdmluZ1Bvc2l0aW9uKTtcblx0fSk7XG59O1xuXG4vLyDQn9GA0L7QstC10YDQutCwINC40L3QtNC10LrRgdCwINGB0LvQtdC0INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5jaGVja1NsaWRlID0gZnVuY3Rpb24oZGF0YVNsaWRlKSB7XG5cdHZhciBcblx0XHRkYXRhU2xpZGUgPSBkYXRhU2xpZGUgfHwgMSxcblx0XHRuZXh0U2xpZGUgPSB0aGlzLmN1cnJlbnRTbGlkZUluZGV4ICsgZGF0YVNsaWRlLFxuXHRcdHNsaWRlU3RhcnRJbmRleCA9IDEsXG5cdFx0c2xpZGVFbmRJbmRleCA9IHRoaXMuY291bnRTbGlkZXM7XG5cblx0aWYgKG5leHRTbGlkZSA9PT0gc2xpZGVFbmRJbmRleCkge1xuXHRcdHRoaXMuaW52aXNpYmxlTW92ZVNsaWRlcihuZXh0U2xpZGUsIHNsaWRlU3RhcnRJbmRleCk7XG5cdFx0dGhpcy5jdXJyZW50U2xpZGVJbmRleCA9IDE7XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gMDtcblx0fSBlbHNlIGlmIChuZXh0U2xpZGUgPT09IDApIHtcblx0XHR0aGlzLmN1cnJlbnRTbGlkZUluZGV4ID0gc2xpZGVFbmRJbmRleC0xO1xuXHRcdHRoaXMuaW52aXNpYmxlTW92ZVNsaWRlcihuZXh0U2xpZGUsIHNsaWRlRW5kSW5kZXggLSAxKTtcdFxuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IHRoaXMuYXJyTmF2RWxMZW5ndGggLSAxO1xuXHR9XHRlbHNlIHtcblx0XHR0aGlzLmN1cnJlbnRTbGlkZUluZGV4ID0gKGRhdGFTbGlkZSA+IDApID8gdGhpcy5jdXJyZW50U2xpZGVJbmRleCArPSAxIDogdGhpcy5jdXJyZW50U2xpZGVJbmRleCAtPSAxO1xuXHRcdHRoaXMubW92ZShuZXh0U2xpZGUpO1xuXHRcdHRoaXMuY2hhbmdlQWN0aXZlU2xpZGUobmV4dFNsaWRlKTtcblx0XHR0aGlzLmJhbGxBY3RpdmVQb3MgPSBuZXh0U2xpZGUgLSAxO1xuXHR9XHRcblxuXHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuYmFsbEFjdGl2ZVBvcywgZmFsc2UpO1xufTtcblxuLy8g0J/Qu9Cw0LLQvdC+0LUg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXG4vLyDQn9Cw0YDQsNC80LXRgtGA0Ys6IGluZGV4UG9zIC0g0LjQvdC00LXQutGBINCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGluZGV4UG9zLCBjYWxsYmFjaykge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0Ly8g0J3QtSDQv9C70LDQstC90L7QtSDQv9C10YDQtdC80LXRidC10L3QuNC1INGB0LvQsNC50LTQtdGA0LAg0L/RgNC4INC40L3QuNGG0LjQsNC70LjQt9Cw0YbQuNC4XG5cdGlmICh0aGlzLnN0YXJ0SW5pdCkge1xuXHRcdHRoaXMuc2xpZGVyLmNzcyh7XG5cdFx0XHQnbGVmdCc6IC0oc2VsZi5zbGlkZVdpZHRoICogaW5kZXhQb3MpXG5cdFx0fSk7XG5cdFx0dGhpcy5zdGFydEluaXQgPSBmYWxzZTtcblx0fVxuXG5cdHRoaXMuc2xpZGVyLnRyYW5zaXRpb24oe1xuXHRcdCdsZWZ0JzogLShzZWxmLnNsaWRlV2lkdGggKiBpbmRleFBvcylcblx0fSwgNTAwLCBmdW5jdGlvbigpIHtcblx0XHRzZWxmLmZsYWcgPSBmYWxzZTtcblxuXHRcdGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXHR9KTtcdFxufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YLQsNC50LzQtdGA0LAg0LTQu9GPINCw0LLRgtC+0L3QvtC80L3QvtCz0L4g0L/QtdGA0LXQvNC10YnQtdC90LjRjyDRgdC70LDQudC00LXRgNCwXG5TbGlkZXIucHJvdG90eXBlLnN0YXJ0VGltZXIgPSBmdW5jdGlvbih0aW1lciwgZnVuYykge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0cmV0dXJuIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNlbGYuY2hlY2tTbGlkZSgpO1xuXHRcdFx0XHQgfSwgc2VsZi5zZXR0aW5ncy50aW1lU3RlcCk7XG59O1xuXG4vLyDQoNCw0LHQvtGC0LAg0YEg0L3QuNC20L3QtdC5INC90LDQstC40LPQsNGG0LjQtdC5KNGD0YHRgtCw0L3QvtCy0LrQsCwg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDQuiDRgdC+0L7RgtCy0LXRgtGB0YLQstGD0Y7RidC10LzRgyDRiNCw0YDQuNC60YMg0YHQu9Cw0LnQtNGDKVxuU2xpZGVyLnByb3RvdHlwZS5iYWxsc1NldEFjdGl2ZSA9IGZ1bmN0aW9uKGRhdGFTbGlkZSwgbW92ZVNsaWRlcikge1xuXHR2YXIgXG5cdFx0YmFsbHNDbGFzcyA9IHRoaXMuc2V0dGluZ3MuYmFsbHNDbGFzcyxcblx0XHRiYWxsc0NsYXNzQWN0aXZlID0gYmFsbHNDbGFzcyArICctYWN0aXZlJyxcblx0XHRhcnJheUJhbGxzID0gdGhpcy5hcnJheU5hdmlnRWxlbWVudHMsXG5cdFx0YXJyQmFsbHNMZW5ndGgsXG5cdFx0aTtcblxuXHRpZiAoIXRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Zm9yIChpID0gMCwgYXJyQmFsbHNMZW5ndGggPSBhcnJheUJhbGxzLmxlbmd0aDsgaSA8IGFyckJhbGxzTGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoYXJyYXlCYWxscy5lcShpKS5oYXNDbGFzcyhiYWxsc0NsYXNzKSkge1xuXHRcdFx0YXJyYXlCYWxscy5lcShpKS5yZW1vdmVDbGFzcyhiYWxsc0NsYXNzQWN0aXZlKTtcblx0XHR9XG5cdH1cblxuXHRpZiAobW92ZVNsaWRlcikge1xuXHRcdHRoaXMubW92ZShkYXRhU2xpZGUpO1xuXHRcdHRoaXMuY2hhbmdlQWN0aXZlU2xpZGUoZGF0YVNsaWRlKTtcblx0XHRhcnJheUJhbGxzLmVxKGRhdGFTbGlkZSAtIDEpLmFkZENsYXNzKGJhbGxzQ2xhc3NBY3RpdmUpO1xuXHR9IGVsc2Uge1xuXHRcdGFycmF5QmFsbHMuZXEoZGF0YVNsaWRlKS5hZGRDbGFzcyhiYWxsc0NsYXNzQWN0aXZlKTtcblx0fVxuXG5cdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IGRhdGFTbGlkZSArIDE7XG59O1xuXG4vLyDQntCx0YDQsNCx0L7RgtGH0LjQuiDQutC70LjQutCwINC90LAg0LrQvdC+0L/QutC4INC/0LXRgNC10LrQu9GO0YfQtdC90LjRj1xuU2xpZGVyLnByb3RvdHlwZS5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtc2xpZGVyLWFycm93JywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGFTbGlkZSA9ICQodGhpcykuZGF0YSgnc2xpZGUnKTtcblxuXHRcdGlmIChzZWxmLmZsYWcpIHsgXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0c2VsZi5mbGFnID0gdHJ1ZTtcblxuXHRcdGNsZWFySW50ZXJ2YWwoc2VsZi5pbnRlcnZhbCk7XG5cdFx0c2VsZi5jaGVja1NsaWRlKGRhdGFTbGlkZSk7XG5cdFx0c2VsZi5iYWxsc1NldEFjdGl2ZShzZWxmLmJhbGxBY3RpdmVQb3MgLSAxLCBmYWxzZSk7XG5cdFx0c2VsZi5pbnRlcnZhbCA9IHNlbGYuc3RhcnRUaW1lcihzZWxmLmludGVydmFsKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1uYXYtY2lyY2xlJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIFxuXHRcdFx0ZGF0YVNsaWRlID0gJCh0aGlzKS5kYXRhKCdzbGlkZScpLFxuXHRcdFx0YmFsbHNDbGFzc0FjdGl2ZSA9IHNlbGYuc2V0dGluZ3MuYmFsbHNDbGFzcyArICctYWN0aXZlJztcblxuXHRcdGlmICgkKHRoaXMpLmhhc0NsYXNzKGJhbGxzQ2xhc3NBY3RpdmUpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBcblxuXHRcdHNlbGYuY3VycmVudFNsaWRlSW5kZXggPSBwYXJzZUludChkYXRhU2xpZGUpO1xuXHRcdGNsZWFySW50ZXJ2YWwoc2VsZi5pbnRlcnZhbCk7XG5cdFx0c2VsZi5iYWxsc1NldEFjdGl2ZShkYXRhU2xpZGUsIHRydWUpO1xuXHRcdHNlbGYuaW50ZXJ2YWwgPSBzZWxmLnN0YXJ0VGltZXIoc2VsZi5pbnRlcnZhbCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YHQu9Cw0LnQtNC10YDQsFxuU2xpZGVyLnByb3RvdHlwZS5pbml0U2xpZGVyID0gZnVuY3Rpb24oKXtcblx0aWYgKCh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA+IHRoaXMuYXJyU2xpZGVzLmxlbmd0aCkgfHwgKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zIDwgMCkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBwb3NpdGlvbiB1bmRlZmluZWQnKTtcblx0fVxuXG5cdGlmICh0aGlzLmNvdW50U2xpZGVzID09IDIpIHtcblx0XHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zKTtcblx0XHR0aGlzLnNldEFjdGl2ZVNsaWRlKCk7XHRcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHRoaXMuc2V0QWN0aXZlU2xpZGUoKTtcdFxuXHR0aGlzLmNsaWNrSGFuZGxlcigpO1xuXHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zKTtcblx0dGhpcy5pbnRlcnZhbCA9IHRoaXMuc3RhcnRUaW1lcih0aGlzLmludGVydmFsKTtcbn07IiwiZnVuY3Rpb24gU2xpZGVzUHJldmlldyhhcnJheVVybHMpIHtcclxuXHR0aGlzLmFycmF5VXJscyA9IGFycmF5VXJscztcclxuXHR0aGlzLmFyckxlbmd0aCA9IGFycmF5VXJscy5sZW5ndGg7XHJcbn1cclxuXHJcbi8vINCk0L7RgNC80LjRgNGD0LXQvCDQuNC3INGB0YLRgNC+0LrQuCDQvNCw0YHRgdC40LJcclxuU2xpZGVzUHJldmlldy5wcm90b3R5cGUuc3RyaW5nVG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBpbnB1dFN0cmluZztcclxuXHJcblx0aWYgKCF0aGlzLmFycmF5VXJscykge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0aW5wdXRTdHJpbmcgPSBKU09OLnBhcnNlKHRoaXMuYXJyYXlVcmxzKTtcclxuXHJcblx0cmV0dXJuIGlucHV0U3RyaW5nO1xyXG59O1xyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC80LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyIFxyXG4vLyDQndCwINCy0YXQvtC0INC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwKNGC0L7Rgiwg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDQv9C+0LrQsNC30YvQstCw0YLRjNGB0Y8g0L/QtdGA0LLRi9C8KVxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5hcnJheVRvQXJyT2JqcyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBcclxuXHRcdG1haW5PYmogPSB7fSxcclxuXHRcdGFyck9iamVjdHMgPSBbXSxcclxuXHRcdGFyclVybHMgPSB0aGlzLnN0cmluZ1RvQXJyYXkoKSxcclxuXHRcdGFyclVybHNMZW5ndGgsXHJcblx0XHRpO1xyXG5cclxuXHRpZiAoIWFyclVybHMpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdGZvciAoaSA9IDAsIGFyclVybHNMZW5ndGggPSBhcnJVcmxzLmxlbmd0aDsgaSA8IGFyclVybHNMZW5ndGg7IGkrKykge1xyXG5cdFx0YXJyT2JqZWN0c1tpXSA9IHsgXHJcblx0XHRcdGZvdG86IGFyclVybHNbaV1cclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdGFyck9iamVjdHNbMF0uYWN0aXZlID0gJ2NoZWNrZWQnO1xyXG5cclxuXHRtYWluT2JqLnNsaWRlcyA9IGFyck9iamVjdHM7IFxyXG5cclxuXHRyZXR1cm4gbWFpbk9iajtcclxufTtcclxuXHJcbi8vINCa0LvQvtC90LjRgNC+0LLQsNC90LjQtSDQvtCx0YrQtdC60YLQsCDQv9C+INC30L3QsNGH0LXQvdC40Y5cclxuU2xpZGVzUHJldmlldy5wcm90b3R5cGUuY2xvbmVPYmogPSBmdW5jdGlvbihvYmplY3QpIHtcclxuXHR2YXIgXHJcblx0XHRuZXdPYmogPSB7fSxcclxuXHRcdHByb3A7XHJcblxyXG5cdGZvciAocHJvcCBpbiBvYmplY3QpIHtcclxuXHRcdG5ld09ialtwcm9wXSA9IG9iamVjdFtwcm9wXTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBuZXdPYmo7XHJcbn07XHJcblxyXG4vLyDQlNC+0LHQsNCy0LvRj9C10LwgMSDQv9C+0YHQu9C10LTQvdC10LPQviDQvtCx0YrQtdC60YLQsCDQstC/0LXRgNGR0LQg0LggMSDQv9C10YDQstC+0LPQviDQvtCx0YrQtdC60YLQsCDQstC60L7QvdC10YZcclxuU2xpZGVzUHJldmlldy5wcm90b3R5cGUuYWRkT2Jqc1RvRWRnZXMgPSBmdW5jdGlvbihhcnJPYmplY3RzKSB7XHJcblx0dmFyIGxlbmd0aEFyciA9IGFyck9iamVjdHMubGVuZ3RoIC0gMTtcclxuXHJcblx0YXJyT2JqZWN0cy5wdXNoKHRoaXMuY2xvbmVPYmooYXJyT2JqZWN0c1swXSkpO1xyXG5cdGFyck9iamVjdHMudW5zaGlmdCh0aGlzLmNsb25lT2JqKGFyck9iamVjdHNbbGVuZ3RoQXJyXSkpXHJcblxyXG5cdGxlbmd0aEFyciA9IGFyck9iamVjdHMubGVuZ3RoIC0gMTtcclxuXHJcblx0YXJyT2JqZWN0c1swXS5ub3RSZWFsID0gdHJ1ZTtcclxuXHRhcnJPYmplY3RzW2xlbmd0aEFycl0ubm90UmVhbCA9IHRydWU7XHJcblxyXG5cdHJldHVybiBhcnJPYmplY3RzO1xyXG59O1xyXG5cclxuLy8g0KPQtNCw0LvRj9C10Lwg0LTQvtCx0LDQstC70LXQvdC90YvQtSDQstC90LDRh9Cw0LvQviDQuCDQstC60L7QvdC10YYg0L7QsdGK0LXQutGC0Ysg0LjQtyDQvtCx0YnQtdCz0L4g0LzQsNGB0YHQuNCy0LAg0L7QsdGK0LXQutGC0L7QslxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5kZWxldGVTbGlkZXNGcm9tRWRnZXMgPSBmdW5jdGlvbihhcnJPYmplY3RzKSB7XHJcblx0dmFyIGxlbmd0aEFyciA9IGFyck9iamVjdHMubGVuZ3RoIC0gMTtcclxuXHJcblx0YXJyT2JqZWN0cy5zcGxpY2UobGVuZ3RoQXJyLCAxKTtcclxuXHRhcnJPYmplY3RzLnNwbGljZSgwLCAxKTtcclxuXHJcblx0cmV0dXJuIGFyck9iamVjdHM7XHJcbn07XHJcblxyXG4vLyDQo9C00LDQu9C40YLRjCDRgdCyLdCy0L4gYWN0aXZlINGDINGB0YLQsNGA0L7QutC+INC+0LHRitC10LrRgtCwINC4INC00L7QsdCw0LLQuNGC0Ywg0Y3RgtC+INGB0LIt0LLQviDQuiDQstGL0LHRgNCw0L3QvdC+0LzRgyDQvtCx0YrQtdC60YLRg1xyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5jaGFuZ2VBY3RpdmVJbmRleCA9IGZ1bmN0aW9uKGFyck9iamVjdHMsIGN1cnJlbnRJbmRleCwgbmV3QWN0aXZlSW5kZXgpIHtcclxuXHRpZiAobmV3QWN0aXZlSW5kZXggIT09IGN1cnJlbnRJbmRleCkge1xyXG5cdFx0ZGVsZXRlIGFyck9iamVjdHNbY3VycmVudEluZGV4XS5hY3RpdmU7XHJcblx0XHRjdXJyZW50SW5kZXggPSBuZXdBY3RpdmVJbmRleDtcdFx0XHRcclxuXHR9XHJcblxyXG5cdGFyck9iamVjdHNbY3VycmVudEluZGV4XS5hY3RpdmUgPSAnY2hlY2tlZCc7XHJcblxyXG5cdHJldHVybiBjdXJyZW50SW5kZXg7XHJcbn07XHJcblxyXG4vLyDQn9GA0L7QstC10YDQutCwINC60L7Quy3QstCwINGB0LvQsNC50LTQvtCyXHJcbi8vINCV0YHQu9C4INGB0LvQsNC50LQg0L7QtNC40L0sINGC0L4g0L3Rg9C20L3QviDQsdGD0LTQtdGCINGD0LHRgNCw0YLRjCDQvtC/0YbQuNGOINGB0YLRgNC10LvQvtC6XHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLm9ubHlPbmVTbGlkZSA9IGZ1bmN0aW9uKGFyck9iamVjdHMpIHtcclxuXHRpZiAoYXJyT2JqZWN0cyA8PSAxKSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn07XHJcblxyXG4vLyDQo9C00LDQu9C10L3QuNC1INC+0LHRitC10LrRgtCwINC40Lcg0LzQsNGB0YHQuNCy0LBcclxuLy8g0JLQvtC30LLRgNCw0YnQsNC10YIg0LjQvdC00LXQutGBINCw0LrRgtC40LLQvdC+0LPQviDQvtCx0YrQtdC60YLQsFxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5kZWxldGVPYmplY3RGcm9tQXJyYXkgPSBmdW5jdGlvbihhcnJPYmplY3RzLCBpbmRleERlbGV0ZU9iaiwgYWN0aXZlSW5kZXgpIHtcclxuXHRhcnJPYmplY3RzLnNwbGljZShpbmRleERlbGV0ZU9iaiwgMSk7XHJcblxyXG5cdGlmIChpbmRleERlbGV0ZU9iaiA9PT0gYWN0aXZlSW5kZXgpIHtcclxuXHRcdGFjdGl2ZUluZGV4ID0gdGhpcy5jaGFuZ2VBY3RpdmVJbmRleChhcnJPYmplY3RzLCAwLCAwKTtcclxuXHR9IGVsc2UgaWYgKGluZGV4RGVsZXRlT2JqIDwgYWN0aXZlSW5kZXgpIHtcclxuXHRcdGFjdGl2ZUluZGV4IC09IDE7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gYWN0aXZlSW5kZXg7XHJcbn07IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbihmdW5jdGlvbigpe1xuXHR2YXIgXG5cdFx0X3RlbXBsYXRlcyA9IHtcblx0XHRcdGxpbmtzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2xpbmtzJykuaHRtbCgpKSxcblx0XHRcdGVycm9yOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2Vycm9yLXdpbmRvdycpLmh0bWwoKSksXG5cdFx0XHRwcmV3aWV3czogSGFuZGxlYmFycy5jb21waWxlKCQoJyNwcmV3aWV3cycpLmh0bWwoKSksXG5cdFx0XHRzbGlkZXI6IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjc2xpZGVyJykuaHRtbCgpKVxuXHQgIH0sXG5cdFx0X29wdGlvbnNTbGlkZXIgPSB7XG5cdFx0XHRhcnJvd3M6IHRydWUsXG5cdFx0XHRiYWxsczogdHJ1ZVxuXHRcdH0sXG5cdCAgX2Vycm9ySGFuZGxlciA9IG5ldyBFcnJvckhhbmRsZXIoJy5lcnJvci1wb3B1cCcsIF90ZW1wbGF0ZXMuZXJyb3IpLFxuXHRcdF9hY3RpdmVJbmRleCA9IDAsXG5cdFx0X3NsaWRlc1ByZXZpZXcsXG5cdFx0X2FyclNsaWRlcyxcblx0XHRfb2JqU2xpZGVzLFxuXHRcdF9zbGlkZXI7XG5cblx0JCgnLmpzLXdyYXBwZXInKS5odG1sKF90ZW1wbGF0ZXMubGlua3MoKSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1zYXZlX2RhdGEnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgaW5wdXRTdHIgPSAkKCcuaW5wdXQtZm9ybV9kYXRhLWlucCcpLnZhbCgpO1xuXHRcdFxuXHRcdGlmICghaW5wdXRTdHIubGVuZ3RoKSB7XG5cdFx0XHRfZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0LTQsNC90L3Ri9C1J1xuXHRcdFx0fSwgJ0RhdGEgaXMgZW1wdHknKTtcblx0XHR9XG5cdFx0XG5cdFx0X3NsaWRlc1ByZXZpZXcgPSBuZXcgU2xpZGVzUHJldmlldyhpbnB1dFN0cik7XG5cdFx0X29ialNsaWRlcyA9IF9zbGlkZXNQcmV2aWV3LmFycmF5VG9BcnJPYmpzKCk7IFxuXHRcdF9vYmpTbGlkZXMub3B0aW9uc1NsaWRlciA9IF9vcHRpb25zU2xpZGVyO1xuXHRcdF9hcnJTbGlkZXMgPSBfb2JqU2xpZGVzLnNsaWRlcztcblxuXHRcdCQoJy5qcy13cmFwcGVyJykuaHRtbChfdGVtcGxhdGVzLnByZXdpZXdzKF9hcnJTbGlkZXMpKTtcblx0XHRcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmpzLWFjdGl2ZV9idG4nLCBmdW5jdGlvbigpIHtcdFxuXHRcdHZhciBudW1OZXdBY3RpdmUgPSBwYXJzZUludCgkKHRoaXMpLnZhbCgpKTtcblxuXHRcdF9hY3RpdmVJbmRleCA9IF9zbGlkZXNQcmV2aWV3LmNoYW5nZUFjdGl2ZUluZGV4KF9hcnJTbGlkZXMsIF9hY3RpdmVJbmRleCwgbnVtTmV3QWN0aXZlKTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1kZWxldGVfcHJldmlldycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBcblx0XHRcdGl0ZW0gPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2l0ZW0nKSksXG5cdFx0XHR3aW5TY3JUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cblx0XHRfYWN0aXZlSW5kZXggPSBfc2xpZGVzUHJldmlldy5kZWxldGVPYmplY3RGcm9tQXJyYXkoX2FyclNsaWRlcywgaXRlbSwgX2FjdGl2ZUluZGV4KTtcblx0XHRcblx0XHQkKCcuanMtd3JhcHBlcicpLmh0bWwoX3RlbXBsYXRlcy5wcmV3aWV3cyhfYXJyU2xpZGVzKSk7XG5cdFx0JCh3aW5kb3cpLnNjcm9sbFRvcCh3aW5TY3JUb3ApO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5qcy1jb21tZW50LCAuanMtbGluaycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhclxuXHRcdFx0JHRoaXMgPSAkKHRoaXMpLFxuXHRcdFx0ZGF0YU5hbWUgPSAkdGhpcy5hdHRyKCduYW1lJyksIFxuXHRcdFx0bnVtYmVyT2JqID0gJHRoaXMuZGF0YShkYXRhTmFtZSk7XG5cblx0XHRfYXJyU2xpZGVzW251bWJlck9ial1bZGF0YU5hbWVdID0gJHRoaXMudmFsKCk7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtZ2VuZXJhdGUtc2xpZGVyJywgZnVuY3Rpb24oKSB7XG5cdFx0X2FjdGl2ZUluZGV4ID0gX2FjdGl2ZUluZGV4IHx8IDA7XG5cblx0XHRpZiAoIV9hcnJTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRfZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0J3QtdGCINC90Lgg0L7QtNC90L7Qs9C+INGB0LvQsNC50LTQsCdcblx0XHRcdH0sICdEYXRhIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0aWYgKF9vYmpTbGlkZXMuc2xpZGVzLmxlbmd0aCA8PSAxKSB7XG5cdFx0XHRfb2JqU2xpZGVzLm9wdGlvbnNTbGlkZXIuYXJyb3dzID0gZmFsc2U7XG5cdFx0fVx0XG5cblx0XHRfYXJyU2xpZGVzID0gX3NsaWRlc1ByZXZpZXcuYWRkT2Jqc1RvRWRnZXMoX2FyclNsaWRlcyk7XG5cblx0XHQkKCcuanMtd3JhcHBlcicpLmh0bWwoX3RlbXBsYXRlcy5zbGlkZXIoX29ialNsaWRlcykpO1x0XG5cblx0XHRfYXJyU2xpZGVzID0gX3NsaWRlc1ByZXZpZXcuZGVsZXRlU2xpZGVzRnJvbUVkZ2VzKF9hcnJTbGlkZXMpO1xuXG5cdFx0X3NsaWRlciA9IG5ldyBTbGlkZXIoJCgnLnNsaWRlcicpLCB7XG5cdFx0XHRhY3RpdmVDbGFzczogJ3NsaWRlci1hY3RpdmUnLFxuXHRcdFx0YWN0aXZlUG9zOiBfYWN0aXZlSW5kZXhcblx0XHR9KTtcblxuXHRcdF9zbGlkZXIuaW5pdFNsaWRlcigpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLXN0ZXAtZG93bicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciB0b0Jsb2NrID0gJCh0aGlzKS5kYXRhKCd0bycpO1xuXG5cdFx0aWYgKHRvQmxvY2sgPT09ICdsaW5rcycpIHtcblx0XHRcdF9hY3RpdmVJbmRleCA9IDA7XG5cdFx0fVxuXG5cdFx0JCgnLmpzLXdyYXBwZXInKS5odG1sKF90ZW1wbGF0ZXNbdG9CbG9ja10oX2FyclNsaWRlcykpO1xuXHR9KTtcbn0pKCk7XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
