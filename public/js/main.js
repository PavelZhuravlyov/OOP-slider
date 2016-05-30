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

	if (!arrUrls) {
		return false;
	}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwiU2xpZGVzUHJldmlldy5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyDQntCx0YDQsNCx0L7RgtGH0LjQuiDQvtGI0LjQsdC+0LpcclxuZnVuY3Rpb24gRXJyb3JIYW5kbGVyKGNsYXNzRXJyV2luZG93LCB0ZW1wbGF0ZUVycm9yKSB7XHJcblx0dGhpcy50aW1lSGlkZSA9IDIwMDA7XHJcblx0dGhpcy5jbGFzc0VycldpbmRvdyA9IGNsYXNzRXJyV2luZG93O1xyXG5cdHRoaXMudGVtcGxhdGVFcnJvciA9IHRlbXBsYXRlRXJyb3I7XHJcbn1cclxuXHJcbi8vINCg0LXQvdC00LXRgNC40L3QsyDRiNCw0LHQu9C+0L3QsCDQvtGI0LjQsdC+0LpcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5uZXdFcnJvciA9IGZ1bmN0aW9uKGVycm9yT2JqZWN0KSB7XHJcblx0cmV0dXJuIHRoaXMudGVtcGxhdGVFcnJvcihlcnJvck9iamVjdCk7XHJcbn07XHJcblxyXG4vLyDQodC60YDRi9Cy0LDQtdC8INC4INGD0LTQsNC70Y/QtdC8INC/0LvQsNGI0LrRgyDQvtGI0LjQsdC60Lgg0YfQtdGA0LXQtyB0aW1lSGlkZSBcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5oaWRlRXJyb3JXaW5kb3cgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgZXJyV2luZG93ID0gJCh0aGlzLmNsYXNzRXJyV2luZG93KTtcclxuXHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdGVycldpbmRvdy5mYWRlT3V0KHRoaXMudGltZUhpZGUsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRlcnJXaW5kb3cucmVtb3ZlKCk7XHJcblx0XHR9KTtcclxuXHR9LCB0aGlzLnRpbWVIaWRlKTtcclxufTtcclxuXHJcbi8vINCf0YDQuCDQstC+0LfQvdC40LrQvdC+0LLQtdC90LjQuCDQvtGI0LjQsdC60Lgg0LLRi9Cy0LXRgdGC0Lgg0L/Qu9Cw0YjQutGDINC4INGD0LTQsNC70LjRgtGMXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuY2F1Z2h0RXJyID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cdCQoJ2JvZHknKS5hcHBlbmQodGhpcy5uZXdFcnJvcihvcHRpb25zKSk7XHJcblx0dGhpcy5oaWRlRXJyb3JXaW5kb3coKTtcclxufTtcclxuXHJcbi8vINCk0YPQvdC60YbQuNGPINCy0YvQt9C+0LLQsCDQvtGI0LjQsdC60LhcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5nZW5lcmF0ZUVycm9yID0gZnVuY3Rpb24oZXJyb3JPcHQsIGNvbnNvbGVNZXNzYWdlKSB7XHJcblx0dGhpcy5jYXVnaHRFcnIoZXJyb3JPcHQpO1xyXG5cdHRocm93IG5ldyBFcnJvcihjb25zb2xlTWVzc2FnZSB8fCAnRXJyb3InKTtcclxufTsiLCJmdW5jdGlvbiBTbGlkZXIoJHNsaWRlciwgb3B0aW9ucykge1xuXHR0aGlzLnNsaWRlciA9ICRzbGlkZXI7XG5cdHRoaXMuYXJyU2xpZGVzID0gdGhpcy5zbGlkZXIuY2hpbGRyZW4oKTtcblx0dGhpcy5hcnJTbGlkZXNEZWYgPSB0aGlzLmFyclNsaWRlcztcblx0dGhpcy5jb3VudFNsaWRlcyA9IHRoaXMuYXJyU2xpZGVzLmxlbmd0aCAtIDE7XG5cdHRoaXMuc2V0dGluZ3MgPSAkLmV4dGVuZCh7XG5cdCAgYWN0aXZlQ2xhc3MgOiAnc2xpZGVyLWFjdGl2ZScsXG5cdCAgYmFsbHNCbG9jayA6ICdzbGlkZXItbmF2aWdhdGlvbicsXG5cdCAgYmFsbHNDbGFzcyA6ICdzbGlkZXItbmF2aWdhdGlvbi1jaXJjbGUnLFxuXHQgIGFjdGl2ZVBvcyA6IDAsXG5cdCAgdGltZVN0ZXAgOiA3MDAwLFxuXHQgIHNsaWRlV2lkdGggOiB0aGlzLmFyclNsaWRlcy5vdXRlcldpZHRoKCksXG5cdCAgYXJyb3dzIDogdHJ1ZVxuXHR9LCBvcHRpb25zKTtcblx0dGhpcy5zbGlkZVdpZHRoID0gdGhpcy5zZXR0aW5ncy5zbGlkZVdpZHRoO1xuXHR0aGlzLmluZGV4QWN0aXZlU2xpZGUgPSB0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyArIDE7XG5cdHRoaXMuc2xpZGVTdGFydEluZGV4ID0gMTtcblx0dGhpcy5zbGlkZUVuZEluZGV4ID0gdGhpcy5jb3VudFNsaWRlcztcblx0dGhpcy5iYWxsc0Jsb2NrID0gJCgnLicgKyB0aGlzLnNldHRpbmdzLmJhbGxzQmxvY2spO1xuXHR0aGlzLmFycmF5TmF2aWdFbGVtZW50cyA9IHRoaXMuYmFsbHNCbG9jay5jaGlsZHJlbignLicgKyB0aGlzLnNldHRpbmdzLmJhbGxzQ2xhc3MpO1xuXHR0aGlzLmFyck5hdkVsTGVuZ3RoID0gdGhpcy5hcnJheU5hdmlnRWxlbWVudHMubGVuZ3RoO1xuXHR0aGlzLmJhbGxBY3RpdmVQb3MgPSB0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcztcblx0dGhpcy5pbnRlcnZhbCxcblx0dGhpcy5mbGFnID0gZmFsc2U7XG59XG5cbi8vINCU0L7QsdCw0LLQu9GP0LXQvCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQtNCy0LjQttC10L3QuNGPLCDQtdGB0LvQuCDQsiDQvtC/0YbQuNGP0YUg0YPQutCw0LfQsNC90L4gYXJyb3dzOiB0cnVlICjQv9C+INGD0LzQvtC70YcpXG5TbGlkZXIucHJvdG90eXBlLmFkZEFycm93cyA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLnNldHRpbmdzLmFycm93cyl7XG5cdFx0dGhpcy5zbGlkZXIuYWZ0ZXIoJ1xcXG5cdFx0XHQ8YSBocmVmPVwiI1wiIGRhdGEtc2xpZGU9XCIxXCIgY2xhc3M9XCJzbGlkZXItYXJyb3cganMtc2xpZGVyLWFycm93XCI+PC9hPlxcXG5cdFx0XHQ8YSBocmVmPVwiI1wiIGRhdGEtc2xpZGU9XCItMVwiIGNsYXNzPVwic2xpZGVyLWFycm93IGpzLXNsaWRlci1hcnJvd1wiPjwvYT4nXG5cdFx0XHQpO1xuXHR9XG59O1xuXG4vLyDQo9GB0YLQsNC90L7QstC40YLRjCDQsNGB0YLQuNCy0L3Ri9C5INC60LvQsNGB0YEg0L3QsCDRgdC70LDQudC0XG4vLyDQodC70LDQudC0INCy0YvRh9C40YHQu9GP0LXRgtGB0Y8g0L/QviDQuNC90LTQtdC60YHRgywg0LPQtNC1INC40L3QtNC10LrRgSAtINGN0YLQviBhY3RpdmVQb3Mg0LIgb3B0aW9uc1xuLy8g0Jgg0L/QtdGA0LXQvNC10YnQsNC10YLRgdGPINC90LAg0LDQutGC0LjQstC90YvQuSDRgdC70LDQudC0XG5TbGlkZXIucHJvdG90eXBlLnNldEFjdGl2ZVNsaWRlID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuc2xpZGVyLmNoaWxkcmVuKCcqW2RhdGEtaXRlbT1cIicgKyAodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgKyAxKSArICdcIl0nKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy5tb3ZlKHRoaXMuaW5kZXhBY3RpdmVTbGlkZSk7XG59O1xuXG4vLyDQo9C30L3QsNGC0Ywg0LjQvdC00LXQutGBINGC0LXQutGD0YnQtdCz0L4g0LDQutGC0LjQstC90L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5nZXRJbmRleEFjdGl2ZVNsaWRlID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLnNsaWRlci5jaGlsZHJlbignLicgKyB0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKS5pbmRleCgpO1xufTtcblxuLy8g0KHQsdGA0L7RgdC40YLRjCDRgdC+INCy0YHQtdGFINGB0LvQsNC50LTQvtCyINCw0LrRgtC40LLQvdGL0Lkg0LrQu9Cw0YHRgVxuLy8g0J/QvtGB0YLQsNCy0LjRgtGMINCw0LrRgtC40LLQvdGL0Lkg0LrQu9Cw0YHRgSDQvdCwINGB0LvQtdC0INGB0LvQsNC50LQgKG5leHRTbGlkZSAtINGB0LvQtdC0LiDQuNC90LTQtdC60YEpXG5TbGlkZXIucHJvdG90eXBlLmNoYW5nZUFjdGl2ZVNsaWRlID0gZnVuY3Rpb24obmV4dFNsaWRlKSB7XG5cdHRoaXMuYXJyU2xpZGVzLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3ModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cdHRoaXMuYXJyU2xpZGVzLmVxKG5leHRTbGlkZSkuYWRkQ2xhc3ModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG59O1xuXG4vLyDQndC10LfQsNC80LXRgtC90L7QtSDQv9C10YDQtdC80LXRidC10L3QuNC1INGB0LvQsNC50LTQtdGA0LBcbi8vINCU0LXQu9Cw0LXRgtGB0Y8g0LTQu9GPINGC0L7Qs9C+LCDRh9GC0L7QsdGLINC/0LXRgNC10LzQtdGB0YLQuNGC0Ywg0YHQu9Cw0LnQtNC10YAsINC60L7Qs9C00LAgXG4vLyDQvtC9INC00L7RgdGC0LjQsyDQuNC70Lgg0L/QvtGB0LvQtdC00L3QtdCz0L4sINC40LvQuCDQv9C10YDQstC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUuaW52aXNpYmxlTW92ZVNsaWRlciA9IGZ1bmN0aW9uKGluZGV4UG9zaXRpb24sIG1vdmluZ1Bvc2l0aW9uKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0dGhpcy5tb3ZlKGluZGV4UG9zaXRpb24sIGZ1bmN0aW9uKCkge1xuXHRcdF90aGlzLnNsaWRlci5jc3Moe1xuXHRcdFx0bGVmdDogLShfdGhpcy5zbGlkZVdpZHRoICogbW92aW5nUG9zaXRpb24pXG5cdFx0fSk7XG5cdFx0X3RoaXMuY2hhbmdlQWN0aXZlU2xpZGUobW92aW5nUG9zaXRpb24pO1xuXHR9KTtcbn07XG5cbi8vINCf0YDQvtCy0LXRgNC60LAg0LjQvdC00LXQutGB0LAg0YHQu9C10LQg0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmNoZWNrU2xpZGUgPSBmdW5jdGlvbihkYXRhU2xpZGUpIHtcblx0dmFyIFxuXHRcdGRhdGFTbGlkZSA9IGRhdGFTbGlkZSB8fCAxLFxuXHRcdG5leHRTbGlkZSA9IHRoaXMuZ2V0SW5kZXhBY3RpdmVTbGlkZSgpICsgZGF0YVNsaWRlO1xuXG5cdGlmIChuZXh0U2xpZGUgPT09IHRoaXMuc2xpZGVFbmRJbmRleCkge1xuXHRcdHRoaXMuaW52aXNpYmxlTW92ZVNsaWRlcihuZXh0U2xpZGUsIHRoaXMuc2xpZGVTdGFydEluZGV4KTtcblx0XHR0aGlzLmJhbGxBY3RpdmVQb3MgPSAwO1xuXHR9IGVsc2UgaWYgKG5leHRTbGlkZSA9PT0gKHRoaXMuc2xpZGVTdGFydEluZGV4IC0gMSkpIHtcblx0XHR0aGlzLmludmlzaWJsZU1vdmVTbGlkZXIobmV4dFNsaWRlLCB0aGlzLnNsaWRlRW5kSW5kZXggLSAxKTtcdFxuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IHRoaXMuYXJyTmF2RWxMZW5ndGggLSAxO1xuXHR9XHRlbHNlIHtcblx0XHR0aGlzLm1vdmUobmV4dFNsaWRlKTtcblx0XHR0aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKG5leHRTbGlkZSk7XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gbmV4dFNsaWRlIC0gMTtcblx0fVx0XG5cblx0dGhpcy5iYWxsc1NldEFjdGl2ZSh0aGlzLmJhbGxBY3RpdmVQb3MsIGZhbHNlKTtcbn07XG5cbi8vINCf0LvQsNCy0L3QvtC1INC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxuLy8g0J/QsNGA0LDQvNC10YLRgNGLOiBpbmRleFBvcyAtINC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihpbmRleFBvcywgY2FsbGJhY2spIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHR0aGlzLnNsaWRlci50cmFuc2l0aW9uKHtcblx0XHQnbGVmdCc6IC1fdGhpcy5zbGlkZVdpZHRoICogaW5kZXhQb3Ncblx0fSwgNTAwLCBmdW5jdGlvbigpIHtcblx0XHRfdGhpcy5mbGFnID0gZmFsc2U7XG5cblx0XHRpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblx0fSk7XHRcbn07XG5cbi8vINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINGC0LDQudC80LXRgNCwINC00LvRjyDQsNCy0YLQvtC90L7QvNC90L7Qs9C+INC/0LXRgNC10LzQtdGJ0LXQvdC40Y8g0YHQu9Cw0LnQtNC10YDQsFxuU2xpZGVyLnByb3RvdHlwZS5zdGFydFRpbWVyID0gZnVuY3Rpb24odGltZXIsIGZ1bmMpIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHRyZXR1cm4gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF90aGlzLmNoZWNrU2xpZGUoKTtcblx0XHRcdH0sIF90aGlzLnNldHRpbmdzLnRpbWVTdGVwKTtcbn07XG5cbi8vINCg0LDQsdC+0YLQsCDRgSDQvdC40LbQvdC10Lkg0L3QsNCy0LjQs9Cw0YbQuNC10Lko0YPRgdGC0LDQvdC+0LLQutCwLCDQv9C10YDQtdC80LXRidC10L3QuNC1INC6INGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0LXQvNGDINGI0LDRgNC40LrRgyDRgdC70LDQudC00YMpXG5TbGlkZXIucHJvdG90eXBlLmJhbGxzU2V0QWN0aXZlID0gZnVuY3Rpb24oZGF0YVNsaWRlLCBtb3ZlU2xpZGVyKSB7XG5cdHZhciBcblx0XHRiYWxsc0NsYXNzID0gdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzLFxuXHRcdGJhbGxzQ2xhc3NBY3RpdmUgPSBiYWxsc0NsYXNzICsgJy1hY3RpdmUnLFxuXHRcdGFycmF5QmFsbHMgPSB0aGlzLmFycmF5TmF2aWdFbGVtZW50cyxcblx0XHRhcnJCYWxsc0xlbmd0aCxcblx0XHRpO1xuXG5cdGZvciAoaSA9IDAsIGFyckJhbGxzTGVuZ3RoID0gYXJyYXlCYWxscy5sZW5ndGg7IGkgPCBhcnJCYWxsc0xlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKGFycmF5QmFsbHMuZXEoaSkuaGFzQ2xhc3MoYmFsbHNDbGFzcykpIHtcblx0XHRcdGFycmF5QmFsbHMuZXEoaSkucmVtb3ZlQ2xhc3MoYmFsbHNDbGFzc0FjdGl2ZSk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKG1vdmVTbGlkZXIpIHtcblx0XHR0aGlzLm1vdmUoZGF0YVNsaWRlKTtcblx0XHR0aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKGRhdGFTbGlkZSk7XG5cdFx0YXJyYXlCYWxscy5lcShkYXRhU2xpZGUgLSAxKS5hZGRDbGFzcyhiYWxsc0NsYXNzQWN0aXZlKTtcblx0fSBlbHNlIHtcblx0XHRhcnJheUJhbGxzLmVxKGRhdGFTbGlkZSkuYWRkQ2xhc3MoYmFsbHNDbGFzc0FjdGl2ZSk7XG5cdH1cblxuXHR0aGlzLmJhbGxBY3RpdmVQb3MgPSBkYXRhU2xpZGUgKyAxO1xufTtcblxuLy8g0K3RhNGE0LXQutGCINC/0L7Rj9Cy0LvQtdC90LjRjyDRgdC70LDQudC00LXRgNCwINCy0L4g0LLRgNC10LzRjyDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjQuFxuU2xpZGVyLnByb3RvdHlwZS5jaGFuZ2VPcGFjaXR5ID0gZnVuY3Rpb24oKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRfdGhpcy5zbGlkZXIuY3NzKHtvcGFjaXR5OiAxfSk7XG5cdH0sIDUwMCk7XG59XG5cbi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6INC60LvQuNC60LAg0L3QsCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQutC70Y7Rh9C10L3QuNGPXG5TbGlkZXIucHJvdG90eXBlLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtc2xpZGVyLWFycm93JywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGFTbGlkZSA9ICQodGhpcykuZGF0YSgnc2xpZGUnKTtcblxuXHRcdGlmIChfdGhpcy5mbGFnKSB7IFxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdF90aGlzLmZsYWcgPSB0cnVlO1xuXG5cdFx0Y2xlYXJJbnRlcnZhbChfdGhpcy5pbnRlcnZhbCk7XG5cdFx0X3RoaXMuY2hlY2tTbGlkZShkYXRhU2xpZGUpO1xuXHRcdF90aGlzLmJhbGxzU2V0QWN0aXZlKF90aGlzLmJhbGxBY3RpdmVQb3MgLSAxLCBmYWxzZSk7XG5cdFx0X3RoaXMuaW50ZXJ2YWwgPSBfdGhpcy5zdGFydFRpbWVyKF90aGlzLmludGVydmFsKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1uYXYtY2lyY2xlJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIFxuXHRcdFx0ZGF0YVNsaWRlID0gJCh0aGlzKS5kYXRhKCdzbGlkZScpLFxuXHRcdFx0YmFsbHNDbGFzc0FjdGl2ZSA9IF90aGlzLnNldHRpbmdzLmJhbGxzQ2xhc3MgKyAnLWFjdGl2ZSc7XG5cblx0XHRpZiAoJCh0aGlzKS5oYXNDbGFzcyhiYWxsc0NsYXNzQWN0aXZlKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gXG5cblx0XHRjbGVhckludGVydmFsKF90aGlzLmludGVydmFsKTtcblx0XHRfdGhpcy5iYWxsc1NldEFjdGl2ZShkYXRhU2xpZGUsIHRydWUpO1xuXHRcdF90aGlzLmludGVydmFsID0gX3RoaXMuc3RhcnRUaW1lcihfdGhpcy5pbnRlcnZhbCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YHQu9Cw0LnQtNC10YDQsFxuU2xpZGVyLnByb3RvdHlwZS5pbml0U2xpZGVyID0gZnVuY3Rpb24oKXtcblx0aWYgKCh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA+IHRoaXMuYXJyU2xpZGVzRGVmLmxlbmd0aCkgfHwgKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zIDwgMCkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBwb3NpdGlvbiB1bmRlZmluZWQnKTtcblx0fVxuXG5cdGlmICh0aGlzLmNvdW50U2xpZGVzID09IDIpIHtcblx0XHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zKTtcblx0XHR0aGlzLnNldEFjdGl2ZVNsaWRlKCk7XHRcblx0XHR0aGlzLmNoYW5nZU9wYWNpdHkoKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR0aGlzLmFkZEFycm93cygpO1xuXHR0aGlzLnNldEFjdGl2ZVNsaWRlKCk7XHRcblx0dGhpcy5jbGlja0hhbmRsZXIoKTtcblx0dGhpcy5iYWxsc1NldEFjdGl2ZSh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyk7XG5cdHRoaXMuY2hhbmdlT3BhY2l0eSgpO1xuXHR0aGlzLmludGVydmFsID0gdGhpcy5zdGFydFRpbWVyKHRoaXMuaW50ZXJ2YWwpO1xufTsiLCJmdW5jdGlvbiBTbGlkZXNQcmV2aWV3KGFycmF5VXJscykge1xyXG5cdHRoaXMuYXJyYXlVcmxzID0gYXJyYXlVcmxzO1xyXG5cdHRoaXMuYXJyTGVuZ3RoID0gYXJyYXlVcmxzLmxlbmd0aDtcclxufVxyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC40Lcg0YHRgtGA0L7QutC4INC80LDRgdGB0LjQslxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5zdHJpbmdUb0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGlucHV0U3RyaW5nO1xyXG5cclxuXHRpZiAoIXRoaXMuYXJyYXlVcmxzKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRpbnB1dFN0cmluZyA9IEpTT04ucGFyc2UodGhpcy5hcnJheVVybHMpO1xyXG5cclxuXHRyZXR1cm4gaW5wdXRTdHJpbmc7XHJcbn07XHJcblxyXG4vLyDQpNC+0YDQvNC40YDRg9C10Lwg0LzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIgXHJcbi8vINCd0LAg0LLRhdC+0LQg0LjQvdC00LXQutGBINCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LAo0YLQvtGCLCDQutC+0YLQvtGA0YvQuSDQsdGD0LTQtdGCINC/0L7QutCw0LfRi9Cy0LDRgtGM0YHRjyDQv9C10YDQstGL0LwpXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmFycmF5VG9BcnJPYmpzID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIFxyXG5cdFx0YXJyT2JqZWN0cyA9IFtdLFxyXG5cdFx0YXJyVXJscyA9IHRoaXMuc3RyaW5nVG9BcnJheSgpLFxyXG5cdFx0YXJyVXJsc0xlbmd0aCxcclxuXHRcdGk7XHJcblxyXG5cdGlmICghYXJyVXJscykge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0Zm9yIChpID0gMCwgYXJyVXJsc0xlbmd0aCA9IGFyclVybHMubGVuZ3RoOyBpIDwgYXJyVXJsc0xlbmd0aDsgaSsrKSB7XHJcblx0XHRhcnJPYmplY3RzW2ldID0geyBcclxuXHRcdFx0Zm90bzogYXJyVXJsc1tpXVxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0YXJyT2JqZWN0c1swXS5hY3RpdmUgPSAnY2hlY2tlZCc7XHJcblxyXG5cdHJldHVybiBhcnJPYmplY3RzO1xyXG59O1xyXG5cclxuLy8g0JrQu9C+0L3QuNGA0L7QstCw0L3QuNC1INC+0LHRitC10LrRgtCwINC/0L4g0LfQvdCw0YfQtdC90LjRjlxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5jbG9uZU9iaiA9IGZ1bmN0aW9uKG9iamVjdCkge1xyXG5cdHZhciBcclxuXHRcdG5ld09iaiA9IHt9LFxyXG5cdFx0cHJvcDtcclxuXHJcblx0Zm9yIChwcm9wIGluIG9iamVjdCkge1xyXG5cdFx0bmV3T2JqW3Byb3BdID0gb2JqZWN0W3Byb3BdO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIG5ld09iajtcclxufTtcclxuXHJcbi8vINCU0L7QsdCw0LLQu9GP0LXQvCAxINC/0L7RgdC70LXQtNC90LXQs9C+INC+0LHRitC10LrRgtCwINCy0L/QtdGA0ZHQtCDQuCAxINC/0LXRgNCy0L7Qs9C+INC+0LHRitC10LrRgtCwINCy0LrQvtC90LXRhlxyXG5TbGlkZXNQcmV2aWV3LnByb3RvdHlwZS5hZGRPYmpzVG9FZGdlcyA9IGZ1bmN0aW9uKGFyck9iamVjdHMpIHtcclxuXHR2YXIgXHJcblx0XHRsZW5ndGhBcnIgPSBhcnJPYmplY3RzLmxlbmd0aCAtIDEsXHJcblx0XHRuZXdBcnIgPSBhcnJPYmplY3RzLmNvbmNhdCgpO1xyXG5cclxuXHRhcnJPYmplY3RzLnB1c2godGhpcy5jbG9uZU9iaihhcnJPYmplY3RzWzBdKSk7XHJcblx0YXJyT2JqZWN0cy51bnNoaWZ0KHRoaXMuY2xvbmVPYmooYXJyT2JqZWN0c1tsZW5ndGhBcnJdKSlcclxuXHJcblx0bGVuZ3RoQXJyID0gYXJyT2JqZWN0cy5sZW5ndGggLSAxO1xyXG5cclxuXHRhcnJPYmplY3RzWzBdLm5vdFJlYWwgPSB0cnVlO1xyXG5cdGFyck9iamVjdHNbbGVuZ3RoQXJyXS5ub3RSZWFsID0gdHJ1ZTtcclxuXHJcblx0cmV0dXJuIGFyck9iamVjdHM7XHJcbn07XHJcblxyXG4vLyDQo9C00LDQu9GP0LXQvCDQtNC+0LHQsNCy0LvQtdC90L3Ri9C1INCy0L3QsNGH0LDQu9C+INC4INCy0LrQvtC90LXRhiDQvtCx0YrQtdC60YLRiyDQuNC3INC+0LHRidC10LPQviDQvNCw0YHRgdC40LLQsCDQvtCx0YrQtdC60YLQvtCyXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmRlbGV0ZVNsaWRlc0Zyb21FZGdlcyA9IGZ1bmN0aW9uKGFyck9iamVjdHMpIHtcclxuXHR2YXIgbGVuZ3RoQXJyID0gYXJyT2JqZWN0cy5sZW5ndGggLSAxO1xyXG5cclxuXHRhcnJPYmplY3RzLnNwbGljZShsZW5ndGhBcnIsIDEpO1xyXG5cdGFyck9iamVjdHMuc3BsaWNlKDAsIDEpO1xyXG5cclxuXHRyZXR1cm4gYXJyT2JqZWN0cztcclxufTtcclxuXHJcbi8vINCj0LTQsNC70LjRgtGMINGB0LIt0LLQviBhY3RpdmUg0YMg0YHRgtCw0YDQvtC60L4g0L7QsdGK0LXQutGC0LAg0Lgg0LTQvtCx0LDQstC40YLRjCDRjdGC0L4g0YHQsi3QstC+INC6INCy0YvQsdGA0LDQvdC90L7QvNGDINC+0LHRitC10LrRgtGDXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmNoYW5nZUFjdGl2ZUluZGV4ID0gZnVuY3Rpb24oYXJyT2JqZWN0cywgY3VycmVudEluZGV4LCBuZXdBY3RpdmVJbmRleCkge1xyXG5cdGlmIChuZXdBY3RpdmVJbmRleCAhPT0gY3VycmVudEluZGV4KSB7XHJcblx0XHRkZWxldGUgYXJyT2JqZWN0c1tjdXJyZW50SW5kZXhdLmFjdGl2ZTtcclxuXHRcdGN1cnJlbnRJbmRleCA9IG5ld0FjdGl2ZUluZGV4O1x0XHRcdFxyXG5cdH1cclxuXHJcblx0YXJyT2JqZWN0c1tjdXJyZW50SW5kZXhdLmFjdGl2ZSA9ICdjaGVja2VkJztcclxuXHJcblx0cmV0dXJuIGN1cnJlbnRJbmRleDtcclxufTtcclxuXHJcbi8vINCj0LTQsNC70LXQvdC40LUg0L7QsdGK0LXQutGC0LAg0LjQtyDQvNCw0YHRgdC40LLQsFxyXG4vLyDQktC+0LfQstGA0LDRidCw0LXRgiDQuNC90LTQtdC60YEg0LDQutGC0LjQstC90L7Qs9C+INC+0LHRitC10LrRgtCwXHJcblNsaWRlc1ByZXZpZXcucHJvdG90eXBlLmRlbGV0ZU9iamVjdEZyb21BcnJheSA9IGZ1bmN0aW9uKGFyck9iamVjdHMsIGluZGV4RGVsZXRlT2JqLCBhY3RpdmVJbmRleCkge1xyXG5cdGlmIChpbmRleERlbGV0ZU9iaiA9PT0gYWN0aXZlSW5kZXgpIHtcclxuXHRcdHRoaXMuY2hhbmdlQWN0aXZlSW5kZXgoYXJyT2JqZWN0cywgMCwgMCk7XHJcblx0XHRhY3RpdmVJbmRleCA9IDA7XHJcblx0fSBlbHNlIGlmIChpbmRleERlbGV0ZU9iaiA8IGFjdGl2ZUluZGV4KSB7XHJcblx0XHRhY3RpdmVJbmRleCAtPSAxO1xyXG5cdH1cclxuXHJcblx0YXJyT2JqZWN0cy5zcGxpY2UoaW5kZXhEZWxldGVPYmosIDEpO1xyXG5cclxuXHRyZXR1cm4gYWN0aXZlSW5kZXg7XHJcbn07IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbihmdW5jdGlvbigpe1xuXHR2YXIgXG5cdFx0X3RlbXBsYXRlcyA9IHtcblx0XHRcdGxpbmtzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2xpbmtzJykuaHRtbCgpKSxcblx0XHRcdGVycm9yOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2Vycm9yLXdpbmRvdycpLmh0bWwoKSksXG5cdFx0XHRwcmV3aWV3czogSGFuZGxlYmFycy5jb21waWxlKCQoJyNwcmV3aWV3cycpLmh0bWwoKSksXG5cdFx0XHRzbGlkZXI6IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjc2xpZGVyJykuaHRtbCgpKVxuXHQgIH0sXG5cdCAgX2Vycm9ySGFuZGxlciA9IG5ldyBFcnJvckhhbmRsZXIoJy5lcnJvci1wb3B1cCcsIF90ZW1wbGF0ZXMuZXJyb3IpLFxuXHRcdF9hY3RpdmVJbmRleCA9IDAsXG5cdFx0X3NsaWRlc1ByZXZpZXcsXG5cdFx0X29ialNsaWRlcztcblxuXHQkKCcuanMtd3JhcHBlcicpLmh0bWwoX3RlbXBsYXRlcy5saW5rcygpKTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLXNhdmVfZGF0YScsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpbnB1dFN0ciA9ICQoJy5pbnB1dC1mb3JtX2RhdGEtaW5wJykudmFsKCk7XG5cdFx0XG5cdFx0X3NsaWRlc1ByZXZpZXcgPSBuZXcgU2xpZGVzUHJldmlldyhpbnB1dFN0cik7XG5cdFx0X29ialNsaWRlcyA9IF9zbGlkZXNQcmV2aWV3LmFycmF5VG9BcnJPYmpzKCk7IFxuXG5cdFx0aWYgKCFfb2JqU2xpZGVzLmxlbmd0aCkge1xuXHRcdFx0X2Vycm9ySGFuZGxlci5nZW5lcmF0ZUVycm9yKHtcblx0XHRcdFx0dGl0bGU6ICfQntGI0LjQsdC60LAnLCBcblx0XHRcdFx0bWVzc2FnZTogJ9CS0LLQtdC00LjRgtC1INC00LDQvdC90YvQtSdcblx0XHRcdH0sICdEYXRhIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0JCgnLmpzLXdyYXBwZXInKS5odG1sKF90ZW1wbGF0ZXMucHJld2lld3MoX29ialNsaWRlcykpO1xuXHRcdFxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuanMtYWN0aXZlX2J0bicsIGZ1bmN0aW9uKCkge1x0XG5cdFx0dmFyIG51bU5ld0FjdGl2ZSA9IHBhcnNlSW50KCQodGhpcykudmFsKCkpO1xuXG5cdFx0X2FjdGl2ZUluZGV4ID0gX3NsaWRlc1ByZXZpZXcuY2hhbmdlQWN0aXZlSW5kZXgoX29ialNsaWRlcywgX2FjdGl2ZUluZGV4LCBudW1OZXdBY3RpdmUpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLWRlbGV0ZV9wcmV3aWV2JywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIFxuXHRcdFx0aXRlbSA9IHBhcnNlSW50KCQodGhpcykuZGF0YSgnaXRlbScpKSxcblx0XHRcdHdpblNjclRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuXHRcdF9hY3RpdmVJbmRleCA9IF9zbGlkZXNQcmV2aWV3LmRlbGV0ZU9iamVjdEZyb21BcnJheShfb2JqU2xpZGVzLCBpdGVtLCBfYWN0aXZlSW5kZXgpO1xuXHRcdFxuXHRcdCQoJy5qcy13cmFwcGVyJykuaHRtbChfdGVtcGxhdGVzLnByZXdpZXdzKF9vYmpTbGlkZXMpKTtcblx0XHQkKHdpbmRvdykuc2Nyb2xsVG9wKHdpblNjclRvcCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmpzLWNvbW1lbnQsIC5qcy1saW5rJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyXG5cdFx0XHQkdGhpcyA9ICQodGhpcyksXG5cdFx0XHRkYXRhTmFtZSA9ICR0aGlzLmF0dHIoJ25hbWUnKSwgXG5cdFx0XHRudW1iZXJPYmogPSAkdGhpcy5kYXRhKGRhdGFOYW1lKTtcblxuXHRcdF9vYmpTbGlkZXNbbnVtYmVyT2JqXVtkYXRhTmFtZV0gPSAkdGhpcy52YWwoKTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1nZW5lcmF0ZS1zbGlkZXInLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2xpZGVyO1xuXG5cdFx0X2FjdGl2ZUluZGV4ID0gcGFyc2VJbnQoX2FjdGl2ZUluZGV4KSB8fCAwO1xuXG5cdFx0aWYgKCFfb2JqU2xpZGVzLmxlbmd0aCkge1xuXHRcdFx0X2Vycm9ySGFuZGxlci5nZW5lcmF0ZUVycm9yKHtcblx0XHRcdFx0dGl0bGU6ICfQntGI0LjQsdC60LAnLCBcblx0XHRcdFx0bWVzc2FnZTogJ9Cd0LXRgiDQvdC4INC+0LTQvdC+0LPQviDRgdC70LDQudC00LAnXG5cdFx0XHR9LCAnRGF0YSBpcyBlbXB0eScpO1xuXHRcdH1cblxuXHRcdF9vYmpTbGlkZXMgPSBfc2xpZGVzUHJldmlldy5hZGRPYmpzVG9FZGdlcyhfb2JqU2xpZGVzKTtcblxuXHRcdCQoJy5qcy13cmFwcGVyJykuaHRtbChfdGVtcGxhdGVzLnNsaWRlcihfb2JqU2xpZGVzKSk7XHRcblxuXHRcdF9vYmpTbGlkZXMgPSBfc2xpZGVzUHJldmlldy5kZWxldGVTbGlkZXNGcm9tRWRnZXMoX29ialNsaWRlcyk7XG5cblx0XHRzbGlkZXIgPSBuZXcgU2xpZGVyKCQoJy5zbGlkZXInKSwge1xuXHRcdFx0YWN0aXZlQ2xhc3M6ICdzbGlkZXItYWN0aXZlJyxcblx0XHRcdGFjdGl2ZVBvczogX2FjdGl2ZUluZGV4XG5cdFx0fSk7XG5cblx0XHRzbGlkZXIuaW5pdFNsaWRlcigpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLXN0ZXAtZG93bicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciB0b0Jsb2NrID0gJCh0aGlzKS5kYXRhKCd0bycpO1xuXG5cdFx0JCgnLmpzLXdyYXBwZXInKS5odG1sKF9yZXR1cm5CbG9jayh0b0Jsb2NrLCBfdGVtcGxhdGVzLCBfb2JqU2xpZGVzKSk7XG5cdH0pO1xuXG5cdC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDRgNC10L3QtNC10YDQuNGCINGI0LDQsdC70L7QvSDQv9GA0Lgg0LLQvtC30LLRgNCw0YnQtdC90LjQuCDQuiDQv9GA0LXQtNGL0LTRg9GJ0LXQvNGDINGI0LDQs9GDXG5cdGZ1bmN0aW9uIF9yZXR1cm5CbG9jayhuYW1lVGVtcCwgbXlUZW1wbGF0ZXMsIGRhdGEpIHtcblx0XHR2YXIgZGF0YSA9IGRhdGEgfHwge307XG5cblx0XHRpZiAobXlUZW1wbGF0ZXMuaGFzT3duUHJvcGVydHkobmFtZVRlbXApKSB7XG5cdFx0XHRyZXR1cm4gbXlUZW1wbGF0ZXNbbmFtZVRlbXBdKGRhdGEpO1xuXHRcdH1cblx0fVxufSkoKTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
