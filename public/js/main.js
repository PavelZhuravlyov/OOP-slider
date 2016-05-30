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
	this.arrSlidesDef = this.arrSlides;
	this.countSlides = this.arrSlides.length - 1;
	this.settings = $.extend({
	  activeClass : 'slider-active',
	  ballsBlock : 'slider-navigation',
	  ballsClass : 'slider-navigation-circle',
	  activePos : 0,
	  timeStep : 7000,
	  slideWidth : this.arrSlides.outerWidth(),
	  arrows : true
	}, options);
	this.slideWidth = this.settings.slideWidth;
	this.indexActiveSlide = this.settings.activePos + 1;
	this.slideStartIndex = 1;
	this.slideEndIndex = this.countSlides;
	this.ballsBlock = $('.' + this.settings.ballsBlock);
	this.arrayNavigElements = this.ballsBlock.children('.' + this.settings.ballsClass);
	this.arrNavElLength = this.arrayNavigElements.length;
	this.ballActivePos = this.settings.activePos;
	this.interval,
	this.flag = false;
}

// Добавляем кнопки передвижения, если в опциях указано arrows: true (по умолч)
Slider.prototype.addArrows = function() {
	if(this.settings.arrows){
		this.slider.after('\
			<a href="#" data-slide="1" class="slider-arrow js-slider-arrow"></a>\
			<a href="#" data-slide="-1" class="slider-arrow js-slider-arrow"></a>'
			);
	}
};

// Установить астивный класс на слайд
// Слайд вычисляется по индексу, где индекс - это activePos в options
// И перемещается на активный слайд
Slider.prototype.setActiveSlide = function() {
	this.slider.children('*[data-item="' + (this.settings.activePos + 1) + '"]').addClass(this.settings.activeClass);
	this.move(this.indexActiveSlide);
};

// Узнать индекс текущего активного слайда
Slider.prototype.getIndexActiveSlide = function() {
	return this.slider.children('.' + this.settings.activeClass).index();
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
	var _this = this;

	this.move(indexPosition, function() {
		_this.slider.css({
			left: -(_this.slideWidth * movingPosition)
		});
		_this.changeActiveSlide(movingPosition);
	});
};

// Проверка индекса след слайда
Slider.prototype.checkSlide = function(dataSlide) {
	var 
		dataSlide = dataSlide || 1,
		nextSlide = this.getIndexActiveSlide() + dataSlide;

	if (nextSlide === this.slideEndIndex) {
		this.invisibleMoveSlider(nextSlide, this.slideStartIndex);
		this.ballActivePos = 0;
	} else if (nextSlide === (this.slideStartIndex - 1)) {
		this.invisibleMoveSlider(nextSlide, this.slideEndIndex - 1);	
		this.ballActivePos = this.arrNavElLength - 1;
	}	else {
		this.move(nextSlide);
		this.changeActiveSlide(nextSlide);
		this.ballActivePos = nextSlide - 1;
	}	

	this.ballsSetActive(this.ballActivePos, false);
};

// Плавное перемещение слайдера
// Параметры: indexPos - индекс активного слайда
Slider.prototype.move = function(indexPos, callback) {
	var _this = this;

	this.slider.transition({
		'left': -_this.slideWidth * indexPos
	}, 500, function() {
		_this.flag = false;

		if (callback && typeof callback === 'function') {
			callback();
		}
	});	
};

// Инициализация таймера для автономного перемещения слайдера
Slider.prototype.startTimer = function(timer, func) {
	var _this = this;

	return setInterval(function() {
				_this.checkSlide();
			}, _this.settings.timeStep);
};

// Работа с нижней навигацией(установка, перемещение к соответствующему шарику слайду)
Slider.prototype.ballsSetActive = function(dataSlide, moveSlider) {
	var 
		ballsClass = this.settings.ballsClass,
		ballsClassActive = ballsClass + '-active',
		arrayBalls = this.arrayNavigElements,
		arrBallsLength,
		i;

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

// Эффект появления слайдера во время инициализации
Slider.prototype.changeOpacity = function() {
	var _this = this;

	setTimeout(function() {
		_this.slider.css({opacity: 1});
	}, 500);
}

// Обработчик клика на кнопки переключения
Slider.prototype.clickHandler = function() {
	var _this = this;

	$(document).on('click', '.js-slider-arrow', function() {
		var dataSlide = $(this).data('slide');

		if (_this.flag) { 
			return false;
		}

		_this.flag = true;

		clearInterval(_this.interval);
		_this.checkSlide(dataSlide);
		_this.ballsSetActive(_this.ballActivePos - 1, false);
		_this.interval = _this.startTimer(_this.interval);

		return false;
	});

	$(document).on('click', '.js-nav-circle', function() {
		var 
			dataSlide = $(this).data('slide'),
			ballsClassActive = _this.settings.ballsClass + '-active';

		if ($(this).hasClass(ballsClassActive)) {
			return false;
		} 

		clearInterval(_this.interval);
		_this.ballsSetActive(dataSlide, true);
		_this.interval = _this.startTimer(_this.interval);

		return false;
	});
};

// Инициализация слайдера
Slider.prototype.initSlider = function(){
	if ((this.settings.activePos > this.arrSlidesDef.length) || (this.settings.activePos < 0)) {
		throw new Error('Active position undefined');
	}

	if (this.countSlides == 2) {
		this.ballsSetActive(this.settings.activePos);
		this.setActiveSlide();	
		this.changeOpacity();
		return false;
	}

	this.addArrows();
	this.setActiveSlide();	
	this.clickHandler();
	this.ballsSetActive(this.settings.activePos);
	this.changeOpacity();
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
		arrObjects = [],
		arrUrls = this.stringToArray(),
		arrUrlsLength,
		i;

	for (i = 0, arrUrlsLength = arrUrls.length; i < arrUrlsLength; i++) {
		arrObjects[i] = { 
			foto: arrUrls[i]
		};
	}
	
	arrObjects[0].active = 'checked';

	return arrObjects;
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
	var 
		lengthArr = arrObjects.length - 1,
		newArr = arrObjects.concat();

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
	  _errorHandler = new ErrorHandler('.error-popup', _templates.error),
		_activeIndex = 0,
		_slidesPreview,
		_objSlides;

	$('.js-wrapper').html(_templates.links());

	$(document).on('click', '.js-save_data', function() {
		var inputStr = $('.input-form_data-inp').val();
		
		_slidesPreview = new SlidesPreview(inputStr);
		_objSlides = _slidesPreview.arrayToArrObjs(); 

		if (!_objSlides.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Введите данные'
			}, 'Data is empty');
		}

		$('.js-wrapper').html(_templates.prewiews(_objSlides));
		
		return false;
	});

	$(document).on('change', '.js-active_btn', function() {	
		var numNewActive = parseInt($(this).val());

		_activeIndex = _slidesPreview.changeActiveIndex(_objSlides, _activeIndex, numNewActive);
	});

	$(document).on('click', '.js-delete_prewiev', function() {
		var 
			item = parseInt($(this).data('item')),
			winScrTop = $(window).scrollTop();

		_activeIndex = _slidesPreview.deleteObjectFromArray(_objSlides, item, _activeIndex);
		
		$('.js-wrapper').html(_templates.prewiews(_objSlides));
		$(window).scrollTop(winScrTop);

		return false;
	});

	$(document).on('change', '.js-comment, .js-link', function() {
		var
			$this = $(this),
			dataName = $this.attr('name'), 
			numberObj = $this.data(dataName);

		_objSlides[numberObj][dataName] = $this.val();
	});

	$(document).on('click', '.js-generate-slider', function() {
		var slider;

		_activeIndex = parseInt(_activeIndex) || 0;

		if (!_objSlides.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Нет ни одного слайда'
			}, 'Data is empty');
		}

		_objSlides = _slidesPreview.addObjsToEdges(_objSlides);

		$('.js-wrapper').html(_templates.slider(_objSlides));	

		_objSlides = _slidesPreview.deleteSlidesFromEdges(_objSlides);

		slider = new Slider($('.slider'), {
			activeClass: 'slider-active',
			activePos: _activeIndex
		});

		slider.initSlider();
	});

	$(document).on('click', '.js-step-down', function() {
		var toBlock = $(this).data('to');

		$('.js-wrapper').html(_returnBlock(toBlock, _templates, _objSlides));
	});

	// функция, которая рендерит шаблон при возвращении к предыдущему шагу
	function _returnBlock(nameTemp, myTemplates, data) {
		var data = data || {};

		if (myTemplates.hasOwnProperty(nameTemp)) {
			return myTemplates[nameTemp](data);
		}
	}
})();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwiU2xpZGVzUHJldmlldy5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g0J7QsdGA0LDQsdC+0YLRh9C40Log0L7RiNC40LHQvtC6XHJcbmZ1bmN0aW9uIEVycm9ySGFuZGxlcihjbGFzc0VycldpbmRvdywgdGVtcGxhdGVFcnJvcikge1xyXG5cdHRoaXMudGltZUhpZGUgPSAyMDAwO1xyXG5cdHRoaXMuY2xhc3NFcnJXaW5kb3cgPSBjbGFzc0VycldpbmRvdztcclxuXHR0aGlzLnRlbXBsYXRlRXJyb3IgPSB0ZW1wbGF0ZUVycm9yO1xyXG59XHJcblxyXG4vLyDQoNC10L3QtNC10YDQuNC90LMg0YjQsNCx0LvQvtC90LAg0L7RiNC40LHQvtC6XHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUubmV3RXJyb3IgPSBmdW5jdGlvbihlcnJvck9iamVjdCkge1xyXG5cdHJldHVybiB0aGlzLnRlbXBsYXRlRXJyb3IoZXJyb3JPYmplY3QpO1xyXG59O1xyXG5cclxuLy8g0KHQutGA0YvQstCw0LXQvCDQuCDRg9C00LDQu9GP0LXQvCDQv9C70LDRiNC60YMg0L7RiNC40LHQutC4INGH0LXRgNC10LcgdGltZUhpZGUgXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuaGlkZUVycm9yV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGVycldpbmRvdyA9ICQodGhpcy5jbGFzc0VycldpbmRvdyk7XHJcblxyXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRlcnJXaW5kb3cuZmFkZU91dCh0aGlzLnRpbWVIaWRlLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0ZXJyV2luZG93LnJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblx0fSwgdGhpcy50aW1lSGlkZSk7XHJcbn07XHJcblxyXG4vLyDQn9GA0Lgg0LLQvtC30L3QuNC60L3QvtCy0LXQvdC40Lgg0L7RiNC40LHQutC4INCy0YvQstC10YHRgtC4INC/0LvQsNGI0LrRgyDQuCDRg9C00LDQu9C40YLRjFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmNhdWdodEVyciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHQkKCdib2R5JykuYXBwZW5kKHRoaXMubmV3RXJyb3Iob3B0aW9ucykpO1xyXG5cdHRoaXMuaGlkZUVycm9yV2luZG93KCk7XHJcbn07XHJcblxyXG4vLyDQpNGD0L3QutGG0LjRjyDQstGL0LfQvtCy0LAg0L7RiNC40LHQutC4XHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuZ2VuZXJhdGVFcnJvciA9IGZ1bmN0aW9uKGVycm9yT3B0LCBjb25zb2xlTWVzc2FnZSkge1xyXG5cdHRoaXMuY2F1Z2h0RXJyKGVycm9yT3B0KTtcclxuXHR0aHJvdyBuZXcgRXJyb3IoY29uc29sZU1lc3NhZ2UgfHwgJ0Vycm9yJyk7XHJcbn07IiwiZnVuY3Rpb24gU2xpZGVyKCRzbGlkZXIsIG9wdGlvbnMpIHtcblx0dGhpcy5zbGlkZXIgPSAkc2xpZGVyO1xuXHR0aGlzLmFyclNsaWRlcyA9IHRoaXMuc2xpZGVyLmNoaWxkcmVuKCk7XG5cdHRoaXMuYXJyU2xpZGVzRGVmID0gdGhpcy5hcnJTbGlkZXM7XG5cdHRoaXMuY291bnRTbGlkZXMgPSB0aGlzLmFyclNsaWRlcy5sZW5ndGggLSAxO1xuXHR0aGlzLnNldHRpbmdzID0gJC5leHRlbmQoe1xuXHQgIGFjdGl2ZUNsYXNzIDogJ3NsaWRlci1hY3RpdmUnLFxuXHQgIGJhbGxzQmxvY2sgOiAnc2xpZGVyLW5hdmlnYXRpb24nLFxuXHQgIGJhbGxzQ2xhc3MgOiAnc2xpZGVyLW5hdmlnYXRpb24tY2lyY2xlJyxcblx0ICBhY3RpdmVQb3MgOiAwLFxuXHQgIHRpbWVTdGVwIDogNzAwMCxcblx0ICBzbGlkZVdpZHRoIDogdGhpcy5hcnJTbGlkZXMub3V0ZXJXaWR0aCgpLFxuXHQgIGFycm93cyA6IHRydWVcblx0fSwgb3B0aW9ucyk7XG5cdHRoaXMuc2xpZGVXaWR0aCA9IHRoaXMuc2V0dGluZ3Muc2xpZGVXaWR0aDtcblx0dGhpcy5pbmRleEFjdGl2ZVNsaWRlID0gdGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgKyAxO1xuXHR0aGlzLnNsaWRlU3RhcnRJbmRleCA9IDE7XG5cdHRoaXMuc2xpZGVFbmRJbmRleCA9IHRoaXMuY291bnRTbGlkZXM7XG5cdHRoaXMuYmFsbHNCbG9jayA9ICQoJy4nICsgdGhpcy5zZXR0aW5ncy5iYWxsc0Jsb2NrKTtcblx0dGhpcy5hcnJheU5hdmlnRWxlbWVudHMgPSB0aGlzLmJhbGxzQmxvY2suY2hpbGRyZW4oJy4nICsgdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzKTtcblx0dGhpcy5hcnJOYXZFbExlbmd0aCA9IHRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzLmxlbmd0aDtcblx0dGhpcy5iYWxsQWN0aXZlUG9zID0gdGhpcy5zZXR0aW5ncy5hY3RpdmVQb3M7XG5cdHRoaXMuaW50ZXJ2YWwsXG5cdHRoaXMuZmxhZyA9IGZhbHNlO1xufVxuXG4vLyDQlNC+0LHQsNCy0LvRj9C10Lwg0LrQvdC+0L/QutC4INC/0LXRgNC10LTQstC40LbQtdC90LjRjywg0LXRgdC70Lgg0LIg0L7Qv9GG0LjRj9GFINGD0LrQsNC30LDQvdC+IGFycm93czogdHJ1ZSAo0L/QviDRg9C80L7Qu9GHKVxuU2xpZGVyLnByb3RvdHlwZS5hZGRBcnJvd3MgPSBmdW5jdGlvbigpIHtcblx0aWYodGhpcy5zZXR0aW5ncy5hcnJvd3Mpe1xuXHRcdHRoaXMuc2xpZGVyLmFmdGVyKCdcXFxuXHRcdFx0PGEgaHJlZj1cIiNcIiBkYXRhLXNsaWRlPVwiMVwiIGNsYXNzPVwic2xpZGVyLWFycm93IGpzLXNsaWRlci1hcnJvd1wiPjwvYT5cXFxuXHRcdFx0PGEgaHJlZj1cIiNcIiBkYXRhLXNsaWRlPVwiLTFcIiBjbGFzcz1cInNsaWRlci1hcnJvdyBqcy1zbGlkZXItYXJyb3dcIj48L2E+J1xuXHRcdFx0KTtcblx0fVxufTtcblxuLy8g0KPRgdGC0LDQvdC+0LLQuNGC0Ywg0LDRgdGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9Cw0LnQtFxuLy8g0KHQu9Cw0LnQtCDQstGL0YfQuNGB0LvRj9C10YLRgdGPINC/0L4g0LjQvdC00LXQutGB0YMsINCz0LTQtSDQuNC90LTQtdC60YEgLSDRjdGC0L4gYWN0aXZlUG9zINCyIG9wdGlvbnNcbi8vINCYINC/0LXRgNC10LzQtdGJ0LDQtdGC0YHRjyDQvdCwINCw0LrRgtC40LLQvdGL0Lkg0YHQu9Cw0LnQtFxuU2xpZGVyLnByb3RvdHlwZS5zZXRBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLnNsaWRlci5jaGlsZHJlbignKltkYXRhLWl0ZW09XCInICsgKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zICsgMSkgKyAnXCJdJykuYWRkQ2xhc3ModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cdHRoaXMubW92ZSh0aGlzLmluZGV4QWN0aXZlU2xpZGUpO1xufTtcblxuLy8g0KPQt9C90LDRgtGMINC40L3QtNC10LrRgSDRgtC10LrRg9GJ0LXQs9C+INCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUuZ2V0SW5kZXhBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5zbGlkZXIuY2hpbGRyZW4oJy4nICsgdGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykuaW5kZXgoKTtcbn07XG5cbi8vINCh0LHRgNC+0YHQuNGC0Ywg0YHQviDQstGB0LXRhSDRgdC70LDQudC00L7QsiDQsNC60YLQuNCy0L3Ri9C5INC60LvQsNGB0YFcbi8vINCf0L7RgdGC0LDQstC40YLRjCDQsNC60YLQuNCy0L3Ri9C5INC60LvQsNGB0YEg0L3QsCDRgdC70LXQtCDRgdC70LDQudC0IChuZXh0U2xpZGUgLSDRgdC70LXQtC4g0LjQvdC00LXQutGBKVxuU2xpZGVyLnByb3RvdHlwZS5jaGFuZ2VBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKG5leHRTbGlkZSkge1xuXHR0aGlzLmFyclNsaWRlcy5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHR0aGlzLmFyclNsaWRlcy5lcShuZXh0U2xpZGUpLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xufTtcblxuLy8g0J3QtdC30LDQvNC10YLQvdC+0LUg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXG4vLyDQlNC10LvQsNC10YLRgdGPINC00LvRjyDRgtC+0LPQviwg0YfRgtC+0LHRiyDQv9C10YDQtdC80LXRgdGC0LjRgtGMINGB0LvQsNC50LTQtdGALCDQutC+0LPQtNCwIFxuLy8g0L7QvSDQtNC+0YHRgtC40LMg0LjQu9C4INC/0L7RgdC70LXQtNC90LXQs9C+LCDQuNC70Lgg0L/QtdGA0LLQvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmludmlzaWJsZU1vdmVTbGlkZXIgPSBmdW5jdGlvbihpbmRleFBvc2l0aW9uLCBtb3ZpbmdQb3NpdGlvbikge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdHRoaXMubW92ZShpbmRleFBvc2l0aW9uLCBmdW5jdGlvbigpIHtcblx0XHRfdGhpcy5zbGlkZXIuY3NzKHtcblx0XHRcdGxlZnQ6IC0oX3RoaXMuc2xpZGVXaWR0aCAqIG1vdmluZ1Bvc2l0aW9uKVxuXHRcdH0pO1xuXHRcdF90aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKG1vdmluZ1Bvc2l0aW9uKTtcblx0fSk7XG59O1xuXG4vLyDQn9GA0L7QstC10YDQutCwINC40L3QtNC10LrRgdCwINGB0LvQtdC0INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5jaGVja1NsaWRlID0gZnVuY3Rpb24oZGF0YVNsaWRlKSB7XG5cdHZhciBcblx0XHRkYXRhU2xpZGUgPSBkYXRhU2xpZGUgfHwgMSxcblx0XHRuZXh0U2xpZGUgPSB0aGlzLmdldEluZGV4QWN0aXZlU2xpZGUoKSArIGRhdGFTbGlkZTtcblxuXHRpZiAobmV4dFNsaWRlID09PSB0aGlzLnNsaWRlRW5kSW5kZXgpIHtcblx0XHR0aGlzLmludmlzaWJsZU1vdmVTbGlkZXIobmV4dFNsaWRlLCB0aGlzLnNsaWRlU3RhcnRJbmRleCk7XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gMDtcblx0fSBlbHNlIGlmIChuZXh0U2xpZGUgPT09ICh0aGlzLnNsaWRlU3RhcnRJbmRleCAtIDEpKSB7XG5cdFx0dGhpcy5pbnZpc2libGVNb3ZlU2xpZGVyKG5leHRTbGlkZSwgdGhpcy5zbGlkZUVuZEluZGV4IC0gMSk7XHRcblx0XHR0aGlzLmJhbGxBY3RpdmVQb3MgPSB0aGlzLmFyck5hdkVsTGVuZ3RoIC0gMTtcblx0fVx0ZWxzZSB7XG5cdFx0dGhpcy5tb3ZlKG5leHRTbGlkZSk7XG5cdFx0dGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShuZXh0U2xpZGUpO1xuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IG5leHRTbGlkZSAtIDE7XG5cdH1cdFxuXG5cdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5iYWxsQWN0aXZlUG9zLCBmYWxzZSk7XG59O1xuXG4vLyDQn9C70LDQstC90L7QtSDQv9C10YDQtdC80LXRidC10L3QuNC1INGB0LvQsNC50LTQtdGA0LBcbi8vINCf0LDRgNCw0LzQtdGC0YDRizogaW5kZXhQb3MgLSDQuNC90LTQtdC60YEg0LDQutGC0LjQstC90L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oaW5kZXhQb3MsIGNhbGxiYWNrKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0dGhpcy5zbGlkZXIudHJhbnNpdGlvbih7XG5cdFx0J2xlZnQnOiAtX3RoaXMuc2xpZGVXaWR0aCAqIGluZGV4UG9zXG5cdH0sIDUwMCwgZnVuY3Rpb24oKSB7XG5cdFx0X3RoaXMuZmxhZyA9IGZhbHNlO1xuXG5cdFx0aWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cdH0pO1x0XG59O1xuXG4vLyDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDRgtCw0LnQvNC10YDQsCDQtNC70Y8g0LDQstGC0L7QvdC+0LzQvdC+0LPQviDQv9C10YDQtdC80LXRidC10L3QuNGPINGB0LvQsNC50LTQtdGA0LBcblNsaWRlci5wcm90b3R5cGUuc3RhcnRUaW1lciA9IGZ1bmN0aW9uKHRpbWVyLCBmdW5jKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0cmV0dXJuIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRfdGhpcy5jaGVja1NsaWRlKCk7XG5cdFx0XHR9LCBfdGhpcy5zZXR0aW5ncy50aW1lU3RlcCk7XG59O1xuXG4vLyDQoNCw0LHQvtGC0LAg0YEg0L3QuNC20L3QtdC5INC90LDQstC40LPQsNGG0LjQtdC5KNGD0YHRgtCw0L3QvtCy0LrQsCwg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDQuiDRgdC+0L7RgtCy0LXRgtGB0YLQstGD0Y7RidC10LzRgyDRiNCw0YDQuNC60YMg0YHQu9Cw0LnQtNGDKVxuU2xpZGVyLnByb3RvdHlwZS5iYWxsc1NldEFjdGl2ZSA9IGZ1bmN0aW9uKGRhdGFTbGlkZSwgbW92ZVNsaWRlcikge1xuXHR2YXIgXG5cdFx0YmFsbHNDbGFzcyA9IHRoaXMuc2V0dGluZ3MuYmFsbHNDbGFzcyxcblx0XHRiYWxsc0NsYXNzQWN0aXZlID0gYmFsbHNDbGFzcyArICctYWN0aXZlJyxcblx0XHRhcnJheUJhbGxzID0gdGhpcy5hcnJheU5hdmlnRWxlbWVudHMsXG5cdFx0YXJyQmFsbHNMZW5ndGgsXG5cdFx0aTtcblxuXHRmb3IgKGkgPSAwLCBhcnJCYWxsc0xlbmd0aCA9IGFycmF5QmFsbHMubGVuZ3RoOyBpIDwgYXJyQmFsbHNMZW5ndGg7IGkrKykge1xuXHRcdGlmIChhcnJheUJhbGxzLmVxKGkpLmhhc0NsYXNzKGJhbGxzQ2xhc3MpKSB7XG5cdFx0XHRhcnJheUJhbGxzLmVxKGkpLnJlbW92ZUNsYXNzKGJhbGxzQ2xhc3NBY3RpdmUpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChtb3ZlU2xpZGVyKSB7XG5cdFx0dGhpcy5tb3ZlKGRhdGFTbGlkZSk7XG5cdFx0dGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShkYXRhU2xpZGUpO1xuXHRcdGFycmF5QmFsbHMuZXEoZGF0YVNsaWRlIC0gMSkuYWRkQ2xhc3MoYmFsbHNDbGFzc0FjdGl2ZSk7XG5cdH0gZWxzZSB7XG5cdFx0YXJyYXlCYWxscy5lcShkYXRhU2xpZGUpLmFkZENsYXNzKGJhbGxzQ2xhc3NBY3RpdmUpO1xuXHR9XG5cblx0dGhpcy5iYWxsQWN0aXZlUG9zID0gZGF0YVNsaWRlICsgMTtcbn07XG5cbi8vINCt0YTRhNC10LrRgiDQv9C+0Y/QstC70LXQvdC40Y8g0YHQu9Cw0LnQtNC10YDQsCDQstC+INCy0YDQtdC80Y8g0LjQvdC40YbQuNCw0LvQuNC30LDRhtC40LhcblNsaWRlci5wcm90b3R5cGUuY2hhbmdlT3BhY2l0eSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0X3RoaXMuc2xpZGVyLmNzcyh7b3BhY2l0eTogMX0pO1xuXHR9LCA1MDApO1xufVxuXG4vLyDQntCx0YDQsNCx0L7RgtGH0LjQuiDQutC70LjQutCwINC90LAg0LrQvdC+0L/QutC4INC/0LXRgNC10LrQu9GO0YfQtdC90LjRj1xuU2xpZGVyLnByb3RvdHlwZS5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLXNsaWRlci1hcnJvdycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRhU2xpZGUgPSAkKHRoaXMpLmRhdGEoJ3NsaWRlJyk7XG5cblx0XHRpZiAoX3RoaXMuZmxhZykgeyBcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRfdGhpcy5mbGFnID0gdHJ1ZTtcblxuXHRcdGNsZWFySW50ZXJ2YWwoX3RoaXMuaW50ZXJ2YWwpO1xuXHRcdF90aGlzLmNoZWNrU2xpZGUoZGF0YVNsaWRlKTtcblx0XHRfdGhpcy5iYWxsc1NldEFjdGl2ZShfdGhpcy5iYWxsQWN0aXZlUG9zIC0gMSwgZmFsc2UpO1xuXHRcdF90aGlzLmludGVydmFsID0gX3RoaXMuc3RhcnRUaW1lcihfdGhpcy5pbnRlcnZhbCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtbmF2LWNpcmNsZScsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBcblx0XHRcdGRhdGFTbGlkZSA9ICQodGhpcykuZGF0YSgnc2xpZGUnKSxcblx0XHRcdGJhbGxzQ2xhc3NBY3RpdmUgPSBfdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzICsgJy1hY3RpdmUnO1xuXG5cdFx0aWYgKCQodGhpcykuaGFzQ2xhc3MoYmFsbHNDbGFzc0FjdGl2ZSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IFxuXG5cdFx0Y2xlYXJJbnRlcnZhbChfdGhpcy5pbnRlcnZhbCk7XG5cdFx0X3RoaXMuYmFsbHNTZXRBY3RpdmUoZGF0YVNsaWRlLCB0cnVlKTtcblx0XHRfdGhpcy5pbnRlcnZhbCA9IF90aGlzLnN0YXJ0VGltZXIoX3RoaXMuaW50ZXJ2YWwpO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcbn07XG5cbi8vINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINGB0LvQsNC50LTQtdGA0LBcblNsaWRlci5wcm90b3R5cGUuaW5pdFNsaWRlciA9IGZ1bmN0aW9uKCl7XG5cdGlmICgodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgPiB0aGlzLmFyclNsaWRlc0RlZi5sZW5ndGgpIHx8ICh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA8IDApKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgcG9zaXRpb24gdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRpZiAodGhpcy5jb3VudFNsaWRlcyA9PSAyKSB7XG5cdFx0dGhpcy5iYWxsc1NldEFjdGl2ZSh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyk7XG5cdFx0dGhpcy5zZXRBY3RpdmVTbGlkZSgpO1x0XG5cdFx0dGhpcy5jaGFuZ2VPcGFjaXR5KCk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dGhpcy5hZGRBcnJvd3MoKTtcblx0dGhpcy5zZXRBY3RpdmVTbGlkZSgpO1x0XG5cdHRoaXMuY2xpY2tIYW5kbGVyKCk7XG5cdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MpO1xuXHR0aGlzLmNoYW5nZU9wYWNpdHkoKTtcblx0dGhpcy5pbnRlcnZhbCA9IHRoaXMuc3RhcnRUaW1lcih0aGlzLmludGVydmFsKTtcbn07IiwiZnVuY3Rpb24gU2xpZGVzUHJldmlldyhhcnJheVVybHMpIHtcclxuXHR0aGlzLmFycmF5VXJscyA9IGFycmF5VXJscztcclxuXHR0aGlzLmFyckxlbmd0aCA9IGFycmF5VXJscy5sZW5ndGg7XHJcbn1cclxuXHJcbi8vINCk0L7RgNC80LjRgNGD0LXQvCDQuNC3INGB0YLRgNC+0LrQuCDQvNCw0YHRgdC40LJcclxuU2xpZGVzUHJldmlldy5wcm90b3R5cGUuc3RyaW5nVG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBpbnB1dFN0cmluZztcclxuXHJcblx0aWYgKCF0aGlzLmFycmF5VXJscykge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0aW5wdXRTdHJpbmcgPSBKU09OLnBhcnNlKHRoaXMuYXJyYXlVcmxzKTtcclxuXHJcblx0cmV0dXJuIGlucHV0U3RyaW5nO1xyXG59O1xyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC80LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyIFxyXG4vLyDQndCwINCy0YXQvtC0INC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwKNGC0L7Rgiwg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDQv9C+0LrQsNC30YvQstCw0YLRjNGB0Y8g0L/QtdGA0LLRi9C8KVxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5hcnJheVRvQXJyT2JqcyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBcclxuXHRcdGFyck9iamVjdHMgPSBbXSxcclxuXHRcdGFyclVybHMgPSB0aGlzLnN0cmluZ1RvQXJyYXkoKSxcclxuXHRcdGFyclVybHNMZW5ndGgsXHJcblx0XHRpO1xyXG5cclxuXHRmb3IgKGkgPSAwLCBhcnJVcmxzTGVuZ3RoID0gYXJyVXJscy5sZW5ndGg7IGkgPCBhcnJVcmxzTGVuZ3RoOyBpKyspIHtcclxuXHRcdGFyck9iamVjdHNbaV0gPSB7IFxyXG5cdFx0XHRmb3RvOiBhcnJVcmxzW2ldXHJcblx0XHR9O1xyXG5cdH1cclxuXHRcclxuXHRhcnJPYmplY3RzWzBdLmFjdGl2ZSA9ICdjaGVja2VkJztcclxuXHJcblx0cmV0dXJuIGFyck9iamVjdHM7XHJcbn07XHJcblxyXG4vLyDQmtC70L7QvdC40YDQvtCy0LDQvdC40LUg0L7QsdGK0LXQutGC0LAg0L/QviDQt9C90LDRh9C10L3QuNGOXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmNsb25lT2JqID0gZnVuY3Rpb24ob2JqZWN0KSB7XHJcblx0dmFyIFxyXG5cdFx0bmV3T2JqID0ge30sXHJcblx0XHRwcm9wO1xyXG5cclxuXHRmb3IgKHByb3AgaW4gb2JqZWN0KSB7XHJcblx0XHRuZXdPYmpbcHJvcF0gPSBvYmplY3RbcHJvcF07XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbmV3T2JqO1xyXG59O1xyXG5cclxuLy8g0JTQvtCx0LDQstC70Y/QtdC8IDEg0L/QvtGB0LvQtdC00L3QtdCz0L4g0L7QsdGK0LXQutGC0LAg0LLQv9C10YDRkdC0INC4IDEg0L/QtdGA0LLQvtCz0L4g0L7QsdGK0LXQutGC0LAg0LLQutC+0L3QtdGGXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmFkZE9ianNUb0VkZ2VzID0gZnVuY3Rpb24oYXJyT2JqZWN0cykge1xyXG5cdHZhciBcclxuXHRcdGxlbmd0aEFyciA9IGFyck9iamVjdHMubGVuZ3RoIC0gMSxcclxuXHRcdG5ld0FyciA9IGFyck9iamVjdHMuY29uY2F0KCk7XHJcblxyXG5cdGFyck9iamVjdHMucHVzaCh0aGlzLmNsb25lT2JqKGFyck9iamVjdHNbMF0pKTtcclxuXHRhcnJPYmplY3RzLnVuc2hpZnQodGhpcy5jbG9uZU9iaihhcnJPYmplY3RzW2xlbmd0aEFycl0pKVxyXG5cclxuXHRsZW5ndGhBcnIgPSBhcnJPYmplY3RzLmxlbmd0aCAtIDE7XHJcblxyXG5cdGFyck9iamVjdHNbMF0ubm90UmVhbCA9IHRydWU7XHJcblx0YXJyT2JqZWN0c1tsZW5ndGhBcnJdLm5vdFJlYWwgPSB0cnVlO1xyXG5cclxuXHRyZXR1cm4gYXJyT2JqZWN0cztcclxufTtcclxuXHJcbi8vINCj0LTQsNC70Y/QtdC8INC00L7QsdCw0LLQu9C10L3QvdGL0LUg0LLQvdCw0YfQsNC70L4g0Lgg0LLQutC+0L3QtdGGINC+0LHRitC10LrRgtGLINC40Lcg0L7QsdGJ0LXQs9C+INC80LDRgdGB0LjQstCwINC+0LHRitC10LrRgtC+0LJcclxuU2xpZGVzUHJldmlldy5wcm90b3R5cGUuZGVsZXRlU2xpZGVzRnJvbUVkZ2VzID0gZnVuY3Rpb24oYXJyT2JqZWN0cykge1xyXG5cdHZhciBsZW5ndGhBcnIgPSBhcnJPYmplY3RzLmxlbmd0aCAtIDE7XHJcblxyXG5cdGFyck9iamVjdHMuc3BsaWNlKGxlbmd0aEFyciwgMSk7XHJcblx0YXJyT2JqZWN0cy5zcGxpY2UoMCwgMSk7XHJcblxyXG5cdHJldHVybiBhcnJPYmplY3RzO1xyXG59O1xyXG5cclxuLy8g0KPQtNCw0LvQuNGC0Ywg0YHQsi3QstC+IGFjdGl2ZSDRgyDRgdGC0LDRgNC+0LrQviDQvtCx0YrQtdC60YLQsCDQuCDQtNC+0LHQsNCy0LjRgtGMINGN0YLQviDRgdCyLdCy0L4g0Log0LLRi9Cx0YDQsNC90L3QvtC80YMg0L7QsdGK0LXQutGC0YNcclxuU2xpZGVzUHJldmlldy5wcm90b3R5cGUuY2hhbmdlQWN0aXZlSW5kZXggPSBmdW5jdGlvbihhcnJPYmplY3RzLCBjdXJyZW50SW5kZXgsIG5ld0FjdGl2ZUluZGV4KSB7XHJcblx0aWYgKG5ld0FjdGl2ZUluZGV4ICE9PSBjdXJyZW50SW5kZXgpIHtcclxuXHRcdGRlbGV0ZSBhcnJPYmplY3RzW2N1cnJlbnRJbmRleF0uYWN0aXZlO1xyXG5cdFx0Y3VycmVudEluZGV4ID0gbmV3QWN0aXZlSW5kZXg7XHRcdFx0XHJcblx0fVxyXG5cclxuXHRhcnJPYmplY3RzW2N1cnJlbnRJbmRleF0uYWN0aXZlID0gJ2NoZWNrZWQnO1xyXG5cclxuXHRyZXR1cm4gY3VycmVudEluZGV4O1xyXG59O1xyXG5cclxuLy8g0KPQtNCw0LvQtdC90LjQtSDQvtCx0YrQtdC60YLQsCDQuNC3INC80LDRgdGB0LjQstCwXHJcbi8vINCS0L7Qt9Cy0YDQsNGJ0LDQtdGCINC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0L7QsdGK0LXQutGC0LBcclxuU2xpZGVzUHJldmlldy5wcm90b3R5cGUuZGVsZXRlT2JqZWN0RnJvbUFycmF5ID0gZnVuY3Rpb24oYXJyT2JqZWN0cywgaW5kZXhEZWxldGVPYmosIGFjdGl2ZUluZGV4KSB7XHJcblx0aWYgKGluZGV4RGVsZXRlT2JqID09PSBhY3RpdmVJbmRleCkge1xyXG5cdFx0dGhpcy5jaGFuZ2VBY3RpdmVJbmRleChhcnJPYmplY3RzLCAwLCAwKTtcclxuXHRcdGFjdGl2ZUluZGV4ID0gMDtcclxuXHR9IGVsc2UgaWYgKGluZGV4RGVsZXRlT2JqIDwgYWN0aXZlSW5kZXgpIHtcclxuXHRcdGFjdGl2ZUluZGV4IC09IDE7XHJcblx0fVxyXG5cclxuXHRhcnJPYmplY3RzLnNwbGljZShpbmRleERlbGV0ZU9iaiwgMSk7XHJcblxyXG5cdHJldHVybiBhY3RpdmVJbmRleDtcclxufTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuKGZ1bmN0aW9uKCl7XG5cdHZhciBcblx0XHRfdGVtcGxhdGVzID0ge1xuXHRcdFx0bGlua3M6IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjbGlua3MnKS5odG1sKCkpLFxuXHRcdFx0ZXJyb3I6IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjZXJyb3Itd2luZG93JykuaHRtbCgpKSxcblx0XHRcdHByZXdpZXdzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3ByZXdpZXdzJykuaHRtbCgpKSxcblx0XHRcdHNsaWRlcjogSGFuZGxlYmFycy5jb21waWxlKCQoJyNzbGlkZXInKS5odG1sKCkpXG5cdCAgfSxcblx0ICBfZXJyb3JIYW5kbGVyID0gbmV3IEVycm9ySGFuZGxlcignLmVycm9yLXBvcHVwJywgX3RlbXBsYXRlcy5lcnJvciksXG5cdFx0X2FjdGl2ZUluZGV4ID0gMCxcblx0XHRfc2xpZGVzUHJldmlldyxcblx0XHRfb2JqU2xpZGVzO1xuXG5cdCQoJy5qcy13cmFwcGVyJykuaHRtbChfdGVtcGxhdGVzLmxpbmtzKCkpO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtc2F2ZV9kYXRhJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGlucHV0U3RyID0gJCgnLmlucHV0LWZvcm1fZGF0YS1pbnAnKS52YWwoKTtcblx0XHRcblx0XHRfc2xpZGVzUHJldmlldyA9IG5ldyBTbGlkZXNQcmV2aWV3KGlucHV0U3RyKTtcblx0XHRfb2JqU2xpZGVzID0gX3NsaWRlc1ByZXZpZXcuYXJyYXlUb0Fyck9ianMoKTsgXG5cblx0XHRpZiAoIV9vYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRfZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0LTQsNC90L3Ri9C1J1xuXHRcdFx0fSwgJ0RhdGEgaXMgZW1wdHknKTtcblx0XHR9XG5cblx0XHQkKCcuanMtd3JhcHBlcicpLmh0bWwoX3RlbXBsYXRlcy5wcmV3aWV3cyhfb2JqU2xpZGVzKSk7XG5cdFx0XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5qcy1hY3RpdmVfYnRuJywgZnVuY3Rpb24oKSB7XHRcblx0XHR2YXIgbnVtTmV3QWN0aXZlID0gcGFyc2VJbnQoJCh0aGlzKS52YWwoKSk7XG5cblx0XHRfYWN0aXZlSW5kZXggPSBfc2xpZGVzUHJldmlldy5jaGFuZ2VBY3RpdmVJbmRleChfb2JqU2xpZGVzLCBfYWN0aXZlSW5kZXgsIG51bU5ld0FjdGl2ZSk7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtZGVsZXRlX3ByZXdpZXYnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgXG5cdFx0XHRpdGVtID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdpdGVtJykpLFxuXHRcdFx0d2luU2NyVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG5cdFx0X2FjdGl2ZUluZGV4ID0gX3NsaWRlc1ByZXZpZXcuZGVsZXRlT2JqZWN0RnJvbUFycmF5KF9vYmpTbGlkZXMsIGl0ZW0sIF9hY3RpdmVJbmRleCk7XG5cdFx0XG5cdFx0JCgnLmpzLXdyYXBwZXInKS5odG1sKF90ZW1wbGF0ZXMucHJld2lld3MoX29ialNsaWRlcykpO1xuXHRcdCQod2luZG93KS5zY3JvbGxUb3Aod2luU2NyVG9wKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuanMtY29tbWVudCwgLmpzLWxpbmsnLCBmdW5jdGlvbigpIHtcblx0XHR2YXJcblx0XHRcdCR0aGlzID0gJCh0aGlzKSxcblx0XHRcdGRhdGFOYW1lID0gJHRoaXMuYXR0cignbmFtZScpLCBcblx0XHRcdG51bWJlck9iaiA9ICR0aGlzLmRhdGEoZGF0YU5hbWUpO1xuXG5cdFx0X29ialNsaWRlc1tudW1iZXJPYmpdW2RhdGFOYW1lXSA9ICR0aGlzLnZhbCgpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLWdlbmVyYXRlLXNsaWRlcicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzbGlkZXI7XG5cblx0XHRfYWN0aXZlSW5kZXggPSBwYXJzZUludChfYWN0aXZlSW5kZXgpIHx8IDA7XG5cblx0XHRpZiAoIV9vYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRfZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0J3QtdGCINC90Lgg0L7QtNC90L7Qs9C+INGB0LvQsNC50LTQsCdcblx0XHRcdH0sICdEYXRhIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0X29ialNsaWRlcyA9IF9zbGlkZXNQcmV2aWV3LmFkZE9ianNUb0VkZ2VzKF9vYmpTbGlkZXMpO1xuXG5cdFx0JCgnLmpzLXdyYXBwZXInKS5odG1sKF90ZW1wbGF0ZXMuc2xpZGVyKF9vYmpTbGlkZXMpKTtcdFxuXG5cdFx0X29ialNsaWRlcyA9IF9zbGlkZXNQcmV2aWV3LmRlbGV0ZVNsaWRlc0Zyb21FZGdlcyhfb2JqU2xpZGVzKTtcblxuXHRcdHNsaWRlciA9IG5ldyBTbGlkZXIoJCgnLnNsaWRlcicpLCB7XG5cdFx0XHRhY3RpdmVDbGFzczogJ3NsaWRlci1hY3RpdmUnLFxuXHRcdFx0YWN0aXZlUG9zOiBfYWN0aXZlSW5kZXhcblx0XHR9KTtcblxuXHRcdHNsaWRlci5pbml0U2xpZGVyKCk7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtc3RlcC1kb3duJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRvQmxvY2sgPSAkKHRoaXMpLmRhdGEoJ3RvJyk7XG5cblx0XHQkKCcuanMtd3JhcHBlcicpLmh0bWwoX3JldHVybkJsb2NrKHRvQmxvY2ssIF90ZW1wbGF0ZXMsIF9vYmpTbGlkZXMpKTtcblx0fSk7XG5cblx0Ly8g0YTRg9C90LrRhtC40Y8sINC60L7RgtC+0YDQsNGPINGA0LXQvdC00LXRgNC40YIg0YjQsNCx0LvQvtC9INC/0YDQuCDQstC+0LfQstGA0LDRidC10L3QuNC4INC6INC/0YDQtdC00YvQtNGD0YnQtdC80YMg0YjQsNCz0YNcblx0ZnVuY3Rpb24gX3JldHVybkJsb2NrKG5hbWVUZW1wLCBteVRlbXBsYXRlcywgZGF0YSkge1xuXHRcdHZhciBkYXRhID0gZGF0YSB8fCB7fTtcblxuXHRcdGlmIChteVRlbXBsYXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lVGVtcCkpIHtcblx0XHRcdHJldHVybiBteVRlbXBsYXRlc1tuYW1lVGVtcF0oZGF0YSk7XG5cdFx0fVxuXHR9XG59KSgpO1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
