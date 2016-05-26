// Обработчик ошибок
function ErrorHandler(classErrWindow, templatePopUp) {
	this.timeHide = 2000;
	this.classErrWindow = classErrWindow;
	this.templatePopUp = templatePopUp;
}

// Рендеринг шаблона ошибок
ErrorHandler.prototype.newError = function(errorObject) {
	return this.templatePopUp(errorObject);
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
			left: -_this.slideWidth * movingPosition
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
	var _this = this;

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
function PrevSlider(arrayUrls) {
	this.arrayUrls = arrayUrls;
	this.arrLength = arrayUrls.length;
}

// Формируем из строки массив
PrevSlider.prototype.stringToArray = function() {
	var inputString;

	if (!this.arrayUrls) {
		return false;
	}

	inputString = JSON.parse(this.arrayUrls);

	return inputString;
};

// Формируем массив объектов 
// На вход индекс активного слайда(тот, который будет показываться первым)
PrevSlider.prototype.arrayToArrObjs = function() {
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
			foto: arrUrls[i],
			comment: '',
			link: ''
		};
	}
	
	arrObjects[0].active = 'checked';

	return arrObjects;
};

// Клонирование объекта по значению
PrevSlider.prototype.cloneObj = function(object) {
	var 
		newObj = {},
		prop;

	for (prop in object) {
		newObj[prop] = object[prop];
	}

	return newObj;
};

// Добавляем 1 последнего объекта вперёд и 1 первого объекта вконец
PrevSlider.prototype.addObjsToEdges = function(arrObjects) {
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
PrevSlider.prototype.deleteSlidesFromEdges = function(arrObjects) {
	var lengthArr = arrObjects.length - 1;

	arrObjects.splice(lengthArr, 1);
	arrObjects.splice(0, 1);

	return arrObjects;
};
$(document).ready(function() {

(function(){
	var _templates = {
		inputLinks: Handlebars.compile($('#inputLinks').html()),
		error: Handlebars.compile($('#errorPopUp').html()),
		prewiews: Handlebars.compile($('#prewiews').html()),
		sliderList: Handlebars.compile($('#sliderList').html())
	};

	var 
		_errorHandler = new ErrorHandler('.errMes', _templates.error),
		_activeIndex = 0,
		_prevSlider,
		_objSlides;

	$('.wrapper').html(_templates.inputLinks())

	$(document).on('click', '.js-save_datas', function() {
		var inputStr = $('.wr-form_datas-inp').val();
		
		_prevSlider = new PrevSlider(inputStr);
		_objSlides = _prevSlider.arrayToArrObjs(); 

		if (!_objSlides.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Введите данные'
			}, 'Datas is empty');
		}

		_fadeBlock($('.wr-form_datas'), 2, function() {
			$('.wrapper').prepend(_templates.prewiews(_objSlides)).fadeIn(500);
		});
		
		return false;
	});

	$(document).on('change', '.js-active_btn', function() {	
		var numNewActive = $(this).val();

		_activeIndex =_changeActiveIndex(_objSlides, _activeIndex, numNewActive);
	});

	$(document).on('click', '.js-delete_prewiev', function() {
		var 
			item = $(this).data('item'),
			winScrTop = $(window).scrollTop(),
			activePrev = $('.wr-block').eq(item).find('.js-active_btn').is(':checked');

		_objSlides.splice(item, 1);

		if (activePrev) {
			_activeIndex = _changeActiveIndex(_objSlides, 0, 0);
		}

		$('.wrapper').html(_templates.prewiews(_objSlides));
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
			}, 'Datas is empty');
		}

		_objSlides = _prevSlider.addObjsToEdges(_objSlides);

		_fadeBlock($('.wr-blocks-w'), 1, function() {
			$('.wrapper').append(_templates.sliderList(_objSlides)).fadeIn(500, function() {	

				_objSlides = _prevSlider.deleteSlidesFromEdges(_objSlides);

				slider = new Slider($('.slider'), {
					activeClass: 'slider-active',
					activePos: _activeIndex
				});

				slider.initSlider();
			});
		});
	});

	$(document).on('click', '.js-step-down', function() {
		var toBlock = $(this).data('to');

		$('.wrapper').html(_returnBlock(toBlock, _templates, _objSlides));
	});

	// Присваивание слайду свойства activе.
	// слайд с таким св-вом появится первым при генерацции слайдера
	function _changeActiveIndex(object, currentIndex, newActiveIndex) {
		if (newActiveIndex !== currentIndex) {
			delete object[currentIndex].active;
			currentIndex = newActiveIndex;			
		}

		_objSlides[currentIndex].active = 'checked';

		return currentIndex;
	}

	// функция, которая рендерит шаблон при возвращении к предыдущему шагу
	function _returnBlock(nameTemp, myTemplates, options) {
		var options = options || {};

		if (myTemplates.hasOwnProperty(nameTemp)) {
			return myTemplates[nameTemp](options);
		}
	}
	
	// Перемещение блока, с последующим его удалением из DOM
	function _blockMove($block, moveTo, offset) {
		var 
			moveTo = moveTo || 'top',
			offset = offset || -1000;

		$block.css(moveTo, offset).fadeOut(100, function() {
			$(this).remove();
		});
	}

	// Определение способа перемещения
	function _fadeBlock($block, animation, callback) { // animation может быть 1=up, 2=right
		var animation = animation || 1;

		switch (animation) {
			case 1:
				_blockMove($block, 'top');
				break;

			case 2:
				_blockMove($block, 'right');
				break;
		}

		if (callback && typeof callback === 'function') {
			callback();
		}
	}
})();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwicHJldlNsaWRlci5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6INC+0YjQuNCx0L7QulxyXG5mdW5jdGlvbiBFcnJvckhhbmRsZXIoY2xhc3NFcnJXaW5kb3csIHRlbXBsYXRlUG9wVXApIHtcclxuXHR0aGlzLnRpbWVIaWRlID0gMjAwMDtcclxuXHR0aGlzLmNsYXNzRXJyV2luZG93ID0gY2xhc3NFcnJXaW5kb3c7XHJcblx0dGhpcy50ZW1wbGF0ZVBvcFVwID0gdGVtcGxhdGVQb3BVcDtcclxufVxyXG5cclxuLy8g0KDQtdC90LTQtdGA0LjQvdCzINGI0LDQsdC70L7QvdCwINC+0YjQuNCx0L7QulxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLm5ld0Vycm9yID0gZnVuY3Rpb24oZXJyb3JPYmplY3QpIHtcclxuXHRyZXR1cm4gdGhpcy50ZW1wbGF0ZVBvcFVwKGVycm9yT2JqZWN0KTtcclxufTtcclxuXHJcbi8vINCh0LrRgNGL0LLQsNC10Lwg0Lgg0YPQtNCw0LvRj9C10Lwg0L/Qu9Cw0YjQutGDINC+0YjQuNCx0LrQuCDRh9C10YDQtdC3IHRpbWVIaWRlIFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmhpZGVFcnJvcldpbmRvdyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBlcnJXaW5kb3cgPSAkKHRoaXMuY2xhc3NFcnJXaW5kb3cpO1xyXG5cclxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0ZXJyV2luZG93LmZhZGVPdXQodGhpcy50aW1lSGlkZSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVycldpbmRvdy5yZW1vdmUoKTtcclxuXHRcdH0pO1xyXG5cdH0sIHRoaXMudGltZUhpZGUpO1xyXG59O1xyXG5cclxuLy8g0J/RgNC4INCy0L7Qt9C90LjQutC90L7QstC10L3QuNC4INC+0YjQuNCx0LrQuCDQstGL0LLQtdGB0YLQuCDQv9C70LDRiNC60YMg0Lgg0YPQtNCw0LvQuNGC0YxcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5jYXVnaHRFcnIgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblx0JCgnYm9keScpLmFwcGVuZCh0aGlzLm5ld0Vycm9yKG9wdGlvbnMpKTtcclxuXHR0aGlzLmhpZGVFcnJvcldpbmRvdygpO1xyXG59O1xyXG5cclxuLy8g0KTRg9C90LrRhtC40Y8g0LLRi9C30L7QstCwINC+0YjQuNCx0LrQuFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmdlbmVyYXRlRXJyb3IgPSBmdW5jdGlvbihlcnJvck9wdCwgY29uc29sZU1lc3NhZ2UpIHtcclxuXHR0aGlzLmNhdWdodEVycihlcnJvck9wdCk7XHJcblx0dGhyb3cgbmV3IEVycm9yKGNvbnNvbGVNZXNzYWdlIHx8ICdFcnJvcicpO1xyXG59OyIsImZ1bmN0aW9uIFNsaWRlcigkc2xpZGVyLCBvcHRpb25zKSB7XG5cdHRoaXMuc2xpZGVyID0gJHNsaWRlcjtcblx0dGhpcy5hcnJTbGlkZXMgPSB0aGlzLnNsaWRlci5jaGlsZHJlbigpO1xuXHR0aGlzLmFyclNsaWRlc0RlZiA9IHRoaXMuYXJyU2xpZGVzO1xuXHR0aGlzLmNvdW50U2xpZGVzID0gdGhpcy5hcnJTbGlkZXMubGVuZ3RoIC0gMTtcblx0dGhpcy5zZXR0aW5ncyA9ICQuZXh0ZW5kKHtcblx0ICBhY3RpdmVDbGFzcyA6ICdzbGlkZXItYWN0aXZlJyxcblx0ICBiYWxsc0Jsb2NrIDogJ3NsaWRlci1uYXZpZ2F0aW9uJyxcblx0ICBiYWxsc0NsYXNzIDogJ3NsaWRlci1uYXZpZ2F0aW9uLWNpcmNsZScsXG5cdCAgYWN0aXZlUG9zIDogMCxcblx0ICB0aW1lU3RlcCA6IDcwMDAsXG5cdCAgc2xpZGVXaWR0aCA6IHRoaXMuYXJyU2xpZGVzLm91dGVyV2lkdGgoKSxcblx0ICBhcnJvd3MgOiB0cnVlXG5cdH0sIG9wdGlvbnMpO1xuXHR0aGlzLnNsaWRlV2lkdGggPSB0aGlzLnNldHRpbmdzLnNsaWRlV2lkdGg7XG5cdHRoaXMuaW5kZXhBY3RpdmVTbGlkZSA9IHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zICsgMTtcblx0dGhpcy5zbGlkZVN0YXJ0SW5kZXggPSAxO1xuXHR0aGlzLnNsaWRlRW5kSW5kZXggPSB0aGlzLmNvdW50U2xpZGVzO1xuXHR0aGlzLmJhbGxzQmxvY2sgPSAkKCcuJyArIHRoaXMuc2V0dGluZ3MuYmFsbHNCbG9jayk7XG5cdHRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzID0gdGhpcy5iYWxsc0Jsb2NrLmNoaWxkcmVuKCcuJyArIHRoaXMuc2V0dGluZ3MuYmFsbHNDbGFzcyk7XG5cdHRoaXMuYXJyTmF2RWxMZW5ndGggPSB0aGlzLmFycmF5TmF2aWdFbGVtZW50cy5sZW5ndGg7XG5cdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zO1xuXHR0aGlzLmludGVydmFsLFxuXHR0aGlzLmZsYWcgPSBmYWxzZTtcbn1cblxuLy8g0JTQvtCx0LDQstC70Y/QtdC8INC60L3QvtC/0LrQuCDQv9C10YDQtdC00LLQuNC20LXQvdC40Y8sINC10YHQu9C4INCyINC+0L/RhtC40Y/RhSDRg9C60LDQt9Cw0L3QviBhcnJvd3M6IHRydWUgKNC/0L4g0YPQvNC+0LvRhylcblNsaWRlci5wcm90b3R5cGUuYWRkQXJyb3dzID0gZnVuY3Rpb24oKSB7XG5cdGlmKHRoaXMuc2V0dGluZ3MuYXJyb3dzKXtcblx0XHR0aGlzLnNsaWRlci5hZnRlcignXFxcblx0XHRcdDxhIGhyZWY9XCIjXCIgZGF0YS1zbGlkZT1cIjFcIiBjbGFzcz1cInNsaWRlci1hcnJvdyBqcy1zbGlkZXItYXJyb3dcIj48L2E+XFxcblx0XHRcdDxhIGhyZWY9XCIjXCIgZGF0YS1zbGlkZT1cIi0xXCIgY2xhc3M9XCJzbGlkZXItYXJyb3cganMtc2xpZGVyLWFycm93XCI+PC9hPidcblx0XHRcdCk7XG5cdH1cbn07XG5cbi8vINCj0YHRgtCw0L3QvtCy0LjRgtGMINCw0YHRgtC40LLQvdGL0Lkg0LrQu9Cw0YHRgSDQvdCwINGB0LvQsNC50LRcbi8vINCh0LvQsNC50LQg0LLRi9GH0LjRgdC70Y/QtdGC0YHRjyDQv9C+INC40L3QtNC10LrRgdGDLCDQs9C00LUg0LjQvdC00LXQutGBIC0g0Y3RgtC+IGFjdGl2ZVBvcyDQsiBvcHRpb25zXG4vLyDQmCDQv9C10YDQtdC80LXRidCw0LXRgtGB0Y8g0L3QsCDQsNC60YLQuNCy0L3Ri9C5INGB0LvQsNC50LRcblNsaWRlci5wcm90b3R5cGUuc2V0QWN0aXZlU2xpZGUgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5zbGlkZXIuY2hpbGRyZW4oJypbZGF0YS1pdGVtPVwiJyArICh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyArIDEpICsgJ1wiXScpLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHR0aGlzLm1vdmUodGhpcy5pbmRleEFjdGl2ZVNsaWRlKTtcbn07XG5cbi8vINCj0LfQvdCw0YLRjCDQuNC90LTQtdC60YEg0YLQtdC60YPRidC10LPQviDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmdldEluZGV4QWN0aXZlU2xpZGUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuc2xpZGVyLmNoaWxkcmVuKCcuJyArIHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpLmluZGV4KCk7XG59O1xuXG4vLyDQodCx0YDQvtGB0LjRgtGMINGB0L4g0LLRgdC10YUg0YHQu9Cw0LnQtNC+0LIg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBXG4vLyDQn9C+0YHRgtCw0LLQuNGC0Ywg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9C10LQg0YHQu9Cw0LnQtCAobmV4dFNsaWRlIC0g0YHQu9C10LQuINC40L3QtNC10LrRgSlcblNsaWRlci5wcm90b3R5cGUuY2hhbmdlQWN0aXZlU2xpZGUgPSBmdW5jdGlvbihuZXh0U2xpZGUpIHtcblx0dGhpcy5hcnJTbGlkZXMuc2libGluZ3MoKS5yZW1vdmVDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy5hcnJTbGlkZXMuZXEobmV4dFNsaWRlKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbn07XG5cbi8vINCd0LXQt9Cw0LzQtdGC0L3QvtC1INC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxuLy8g0JTQtdC70LDQtdGC0YHRjyDQtNC70Y8g0YLQvtCz0L4sINGH0YLQvtCx0Ysg0L/QtdGA0LXQvNC10YHRgtC40YLRjCDRgdC70LDQudC00LXRgCwg0LrQvtCz0LTQsCBcbi8vINC+0L0g0LTQvtGB0YLQuNCzINC40LvQuCDQv9C+0YHQu9C10LTQvdC10LPQviwg0LjQu9C4INC/0LXRgNCy0L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5pbnZpc2libGVNb3ZlU2xpZGVyID0gZnVuY3Rpb24oaW5kZXhQb3NpdGlvbiwgbW92aW5nUG9zaXRpb24pIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHR0aGlzLm1vdmUoaW5kZXhQb3NpdGlvbiwgZnVuY3Rpb24oKSB7XG5cdFx0X3RoaXMuc2xpZGVyLmNzcyh7XG5cdFx0XHRsZWZ0OiAtX3RoaXMuc2xpZGVXaWR0aCAqIG1vdmluZ1Bvc2l0aW9uXG5cdFx0fSk7XG5cdFx0X3RoaXMuY2hhbmdlQWN0aXZlU2xpZGUobW92aW5nUG9zaXRpb24pO1xuXHR9KTtcbn07XG5cbi8vINCf0YDQvtCy0LXRgNC60LAg0LjQvdC00LXQutGB0LAg0YHQu9C10LQg0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmNoZWNrU2xpZGUgPSBmdW5jdGlvbihkYXRhU2xpZGUpIHtcblx0dmFyIFxuXHRcdGRhdGFTbGlkZSA9IGRhdGFTbGlkZSB8fCAxLFxuXHRcdG5leHRTbGlkZSA9IHRoaXMuZ2V0SW5kZXhBY3RpdmVTbGlkZSgpICsgZGF0YVNsaWRlO1xuXG5cdGlmIChuZXh0U2xpZGUgPT09IHRoaXMuc2xpZGVFbmRJbmRleCkge1xuXHRcdHRoaXMuaW52aXNpYmxlTW92ZVNsaWRlcihuZXh0U2xpZGUsIHRoaXMuc2xpZGVTdGFydEluZGV4KTtcblx0XHR0aGlzLmJhbGxBY3RpdmVQb3MgPSAwO1xuXHR9IGVsc2UgaWYgKG5leHRTbGlkZSA9PT0gKHRoaXMuc2xpZGVTdGFydEluZGV4IC0gMSkpIHtcblx0XHR0aGlzLmludmlzaWJsZU1vdmVTbGlkZXIobmV4dFNsaWRlLCB0aGlzLnNsaWRlRW5kSW5kZXggLSAxKTtcdFxuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IHRoaXMuYXJyTmF2RWxMZW5ndGggLSAxO1xuXHR9XHRlbHNlIHtcblx0XHR0aGlzLm1vdmUobmV4dFNsaWRlKTtcblx0XHR0aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKG5leHRTbGlkZSk7XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gbmV4dFNsaWRlIC0gMTtcblx0fVx0XG5cblx0dGhpcy5iYWxsc1NldEFjdGl2ZSh0aGlzLmJhbGxBY3RpdmVQb3MsIGZhbHNlKTtcbn07XG5cbi8vINCf0LvQsNCy0L3QvtC1INC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxuLy8g0J/QsNGA0LDQvNC10YLRgNGLOiBpbmRleFBvcyAtINC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihpbmRleFBvcywgY2FsbGJhY2spIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHR0aGlzLnNsaWRlci50cmFuc2l0aW9uKHtcblx0XHQnbGVmdCc6IC1fdGhpcy5zbGlkZVdpZHRoICogaW5kZXhQb3Ncblx0fSwgNTAwLCBmdW5jdGlvbigpIHtcblx0XHRfdGhpcy5mbGFnID0gZmFsc2U7XG5cblx0XHRpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblx0fSk7XHRcbn07XG5cbi8vINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINGC0LDQudC80LXRgNCwINC00LvRjyDQsNCy0YLQvtC90L7QvNC90L7Qs9C+INC/0LXRgNC10LzQtdGJ0LXQvdC40Y8g0YHQu9Cw0LnQtNC10YDQsFxuU2xpZGVyLnByb3RvdHlwZS5zdGFydFRpbWVyID0gZnVuY3Rpb24odGltZXIsIGZ1bmMpIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHRyZXR1cm4gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF90aGlzLmNoZWNrU2xpZGUoKTtcblx0XHRcdH0sIF90aGlzLnNldHRpbmdzLnRpbWVTdGVwKTtcbn07XG5cbi8vINCg0LDQsdC+0YLQsCDRgSDQvdC40LbQvdC10Lkg0L3QsNCy0LjQs9Cw0YbQuNC10Lko0YPRgdGC0LDQvdC+0LLQutCwLCDQv9C10YDQtdC80LXRidC10L3QuNC1INC6INGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0LXQvNGDINGI0LDRgNC40LrRgyDRgdC70LDQudC00YMpXG5TbGlkZXIucHJvdG90eXBlLmJhbGxzU2V0QWN0aXZlID0gZnVuY3Rpb24oZGF0YVNsaWRlLCBtb3ZlU2xpZGVyKSB7XG5cdHZhciBcblx0XHRiYWxsc0NsYXNzID0gdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzLFxuXHRcdGJhbGxzQ2xhc3NBY3RpdmUgPSBiYWxsc0NsYXNzICsgJy1hY3RpdmUnLFxuXHRcdGFycmF5QmFsbHMgPSB0aGlzLmFycmF5TmF2aWdFbGVtZW50cyxcblx0XHRhcnJCYWxsc0xlbmd0aCxcblx0XHRpO1xuXG5cdGZvciAoaSA9IDAsIGFyckJhbGxzTGVuZ3RoID0gYXJyYXlCYWxscy5sZW5ndGg7IGkgPCBhcnJCYWxsc0xlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKGFycmF5QmFsbHMuZXEoaSkuaGFzQ2xhc3MoYmFsbHNDbGFzcykpIHtcblx0XHRcdGFycmF5QmFsbHMuZXEoaSkucmVtb3ZlQ2xhc3MoYmFsbHNDbGFzc0FjdGl2ZSk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKG1vdmVTbGlkZXIpIHtcblx0XHR0aGlzLm1vdmUoZGF0YVNsaWRlKTtcblx0XHR0aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKGRhdGFTbGlkZSk7XG5cdFx0YXJyYXlCYWxscy5lcShkYXRhU2xpZGUgLSAxKS5hZGRDbGFzcyhiYWxsc0NsYXNzQWN0aXZlKTtcblx0fSBlbHNlIHtcblx0XHRhcnJheUJhbGxzLmVxKGRhdGFTbGlkZSkuYWRkQ2xhc3MoYmFsbHNDbGFzc0FjdGl2ZSk7XG5cdH1cblxuXHR0aGlzLmJhbGxBY3RpdmVQb3MgPSBkYXRhU2xpZGUgKyAxO1xufTtcblxuLy8g0K3RhNGE0LXQutGCINC/0L7Rj9Cy0LvQtdC90LjRjyDRgdC70LDQudC00LXRgNCwINCy0L4g0LLRgNC10LzRjyDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjQuFxuU2xpZGVyLnByb3RvdHlwZS5jaGFuZ2VPcGFjaXR5ID0gZnVuY3Rpb24oKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRfdGhpcy5zbGlkZXIuY3NzKHtvcGFjaXR5OiAxfSk7XG5cdH0sIDUwMCk7XG59XG5cbi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6INC60LvQuNC60LAg0L3QsCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQutC70Y7Rh9C10L3QuNGPXG5TbGlkZXIucHJvdG90eXBlLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtc2xpZGVyLWFycm93JywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGFTbGlkZSA9ICQodGhpcykuZGF0YSgnc2xpZGUnKTtcblxuXHRcdGlmIChfdGhpcy5mbGFnKSB7IFxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdF90aGlzLmZsYWcgPSB0cnVlO1xuXG5cdFx0Y2xlYXJJbnRlcnZhbChfdGhpcy5pbnRlcnZhbCk7XG5cdFx0X3RoaXMuY2hlY2tTbGlkZShkYXRhU2xpZGUpO1xuXHRcdF90aGlzLmJhbGxzU2V0QWN0aXZlKF90aGlzLmJhbGxBY3RpdmVQb3MgLSAxLCBmYWxzZSk7XG5cdFx0X3RoaXMuaW50ZXJ2YWwgPSBfdGhpcy5zdGFydFRpbWVyKF90aGlzLmludGVydmFsKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1uYXYtY2lyY2xlJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIFxuXHRcdFx0ZGF0YVNsaWRlID0gJCh0aGlzKS5kYXRhKCdzbGlkZScpLFxuXHRcdFx0YmFsbHNDbGFzc0FjdGl2ZSA9IF90aGlzLnNldHRpbmdzLmJhbGxzQ2xhc3MgKyAnLWFjdGl2ZSc7XG5cblx0XHRpZiAoJCh0aGlzKS5oYXNDbGFzcyhiYWxsc0NsYXNzQWN0aXZlKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gXG5cblx0XHRjbGVhckludGVydmFsKF90aGlzLmludGVydmFsKTtcblx0XHRfdGhpcy5iYWxsc1NldEFjdGl2ZShkYXRhU2xpZGUsIHRydWUpO1xuXHRcdF90aGlzLmludGVydmFsID0gX3RoaXMuc3RhcnRUaW1lcihfdGhpcy5pbnRlcnZhbCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YHQu9Cw0LnQtNC10YDQsFxuU2xpZGVyLnByb3RvdHlwZS5pbml0U2xpZGVyID0gZnVuY3Rpb24oKXtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHRpZiAoKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zID4gdGhpcy5hcnJTbGlkZXNEZWYubGVuZ3RoKSB8fCAodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgPCAwKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignQWN0aXZlIHBvc2l0aW9uIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0aWYgKHRoaXMuY291bnRTbGlkZXMgPT0gMikge1xuXHRcdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MpO1xuXHRcdHRoaXMuc2V0QWN0aXZlU2xpZGUoKTtcdFxuXHRcdHRoaXMuY2hhbmdlT3BhY2l0eSgpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHRoaXMuYWRkQXJyb3dzKCk7XG5cdHRoaXMuc2V0QWN0aXZlU2xpZGUoKTtcdFxuXHR0aGlzLmNsaWNrSGFuZGxlcigpO1xuXHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zKTtcblx0dGhpcy5jaGFuZ2VPcGFjaXR5KCk7XG5cdHRoaXMuaW50ZXJ2YWwgPSB0aGlzLnN0YXJ0VGltZXIodGhpcy5pbnRlcnZhbCk7XG59OyIsImZ1bmN0aW9uIFByZXZTbGlkZXIoYXJyYXlVcmxzKSB7XHJcblx0dGhpcy5hcnJheVVybHMgPSBhcnJheVVybHM7XHJcblx0dGhpcy5hcnJMZW5ndGggPSBhcnJheVVybHMubGVuZ3RoO1xyXG59XHJcblxyXG4vLyDQpNC+0YDQvNC40YDRg9C10Lwg0LjQtyDRgdGC0YDQvtC60Lgg0LzQsNGB0YHQuNCyXHJcblByZXZTbGlkZXIucHJvdG90eXBlLnN0cmluZ1RvQXJyYXkgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgaW5wdXRTdHJpbmc7XHJcblxyXG5cdGlmICghdGhpcy5hcnJheVVybHMpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdGlucHV0U3RyaW5nID0gSlNPTi5wYXJzZSh0aGlzLmFycmF5VXJscyk7XHJcblxyXG5cdHJldHVybiBpbnB1dFN0cmluZztcclxufTtcclxuXHJcbi8vINCk0L7RgNC80LjRgNGD0LXQvCDQvNCw0YHRgdC40LIg0L7QsdGK0LXQutGC0L7QsiBcclxuLy8g0J3QsCDQstGF0L7QtCDQuNC90LTQtdC60YEg0LDQutGC0LjQstC90L7Qs9C+INGB0LvQsNC50LTQsCjRgtC+0YIsINC60L7RgtC+0YDRi9C5INCx0YPQtNC10YIg0L/QvtC60LDQt9GL0LLQsNGC0YzRgdGPINC/0LXRgNCy0YvQvClcclxuUHJldlNsaWRlci5wcm90b3R5cGUuYXJyYXlUb0Fyck9ianMgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgXHJcblx0XHRhcnJPYmplY3RzID0gW10sXHJcblx0XHRhcnJVcmxzID0gdGhpcy5zdHJpbmdUb0FycmF5KCksXHJcblx0XHRhcnJVcmxzTGVuZ3RoLFxyXG5cdFx0aTtcclxuXHJcblx0aWYgKCFhcnJVcmxzKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRmb3IgKGkgPSAwLCBhcnJVcmxzTGVuZ3RoID0gYXJyVXJscy5sZW5ndGg7IGkgPCBhcnJVcmxzTGVuZ3RoOyBpKyspIHtcclxuXHRcdGFyck9iamVjdHNbaV0gPSB7IFxyXG5cdFx0XHRmb3RvOiBhcnJVcmxzW2ldLFxyXG5cdFx0XHRjb21tZW50OiAnJyxcclxuXHRcdFx0bGluazogJydcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdGFyck9iamVjdHNbMF0uYWN0aXZlID0gJ2NoZWNrZWQnO1xyXG5cclxuXHRyZXR1cm4gYXJyT2JqZWN0cztcclxufTtcclxuXHJcbi8vINCa0LvQvtC90LjRgNC+0LLQsNC90LjQtSDQvtCx0YrQtdC60YLQsCDQv9C+INC30L3QsNGH0LXQvdC40Y5cclxuUHJldlNsaWRlci5wcm90b3R5cGUuY2xvbmVPYmogPSBmdW5jdGlvbihvYmplY3QpIHtcclxuXHR2YXIgXHJcblx0XHRuZXdPYmogPSB7fSxcclxuXHRcdHByb3A7XHJcblxyXG5cdGZvciAocHJvcCBpbiBvYmplY3QpIHtcclxuXHRcdG5ld09ialtwcm9wXSA9IG9iamVjdFtwcm9wXTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBuZXdPYmo7XHJcbn07XHJcblxyXG4vLyDQlNC+0LHQsNCy0LvRj9C10LwgMSDQv9C+0YHQu9C10LTQvdC10LPQviDQvtCx0YrQtdC60YLQsCDQstC/0LXRgNGR0LQg0LggMSDQv9C10YDQstC+0LPQviDQvtCx0YrQtdC60YLQsCDQstC60L7QvdC10YZcclxuUHJldlNsaWRlci5wcm90b3R5cGUuYWRkT2Jqc1RvRWRnZXMgPSBmdW5jdGlvbihhcnJPYmplY3RzKSB7XHJcblx0dmFyIFxyXG5cdFx0bGVuZ3RoQXJyID0gYXJyT2JqZWN0cy5sZW5ndGggLSAxLFxyXG5cdFx0bmV3QXJyID0gYXJyT2JqZWN0cy5jb25jYXQoKTtcclxuXHJcblx0YXJyT2JqZWN0cy5wdXNoKHRoaXMuY2xvbmVPYmooYXJyT2JqZWN0c1swXSkpO1xyXG5cdGFyck9iamVjdHMudW5zaGlmdCh0aGlzLmNsb25lT2JqKGFyck9iamVjdHNbbGVuZ3RoQXJyXSkpXHJcblxyXG5cdGxlbmd0aEFyciA9IGFyck9iamVjdHMubGVuZ3RoIC0gMTtcclxuXHJcblx0YXJyT2JqZWN0c1swXS5ub3RSZWFsID0gdHJ1ZTtcclxuXHRhcnJPYmplY3RzW2xlbmd0aEFycl0ubm90UmVhbCA9IHRydWU7XHJcblxyXG5cdHJldHVybiBhcnJPYmplY3RzO1xyXG59O1xyXG5cclxuLy8g0KPQtNCw0LvRj9C10Lwg0LTQvtCx0LDQstC70LXQvdC90YvQtSDQstC90LDRh9Cw0LvQviDQuCDQstC60L7QvdC10YYg0L7QsdGK0LXQutGC0Ysg0LjQtyDQvtCx0YnQtdCz0L4g0LzQsNGB0YHQuNCy0LAg0L7QsdGK0LXQutGC0L7QslxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5kZWxldGVTbGlkZXNGcm9tRWRnZXMgPSBmdW5jdGlvbihhcnJPYmplY3RzKSB7XHJcblx0dmFyIGxlbmd0aEFyciA9IGFyck9iamVjdHMubGVuZ3RoIC0gMTtcclxuXHJcblx0YXJyT2JqZWN0cy5zcGxpY2UobGVuZ3RoQXJyLCAxKTtcclxuXHRhcnJPYmplY3RzLnNwbGljZSgwLCAxKTtcclxuXHJcblx0cmV0dXJuIGFyck9iamVjdHM7XHJcbn07IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbihmdW5jdGlvbigpe1xuXHR2YXIgX3RlbXBsYXRlcyA9IHtcblx0XHRpbnB1dExpbmtzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2lucHV0TGlua3MnKS5odG1sKCkpLFxuXHRcdGVycm9yOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2Vycm9yUG9wVXAnKS5odG1sKCkpLFxuXHRcdHByZXdpZXdzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3ByZXdpZXdzJykuaHRtbCgpKSxcblx0XHRzbGlkZXJMaXN0OiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3NsaWRlckxpc3QnKS5odG1sKCkpXG5cdH07XG5cblx0dmFyIFxuXHRcdF9lcnJvckhhbmRsZXIgPSBuZXcgRXJyb3JIYW5kbGVyKCcuZXJyTWVzJywgX3RlbXBsYXRlcy5lcnJvciksXG5cdFx0X2FjdGl2ZUluZGV4ID0gMCxcblx0XHRfcHJldlNsaWRlcixcblx0XHRfb2JqU2xpZGVzO1xuXG5cdCQoJy53cmFwcGVyJykuaHRtbChfdGVtcGxhdGVzLmlucHV0TGlua3MoKSlcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLXNhdmVfZGF0YXMnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgaW5wdXRTdHIgPSAkKCcud3ItZm9ybV9kYXRhcy1pbnAnKS52YWwoKTtcblx0XHRcblx0XHRfcHJldlNsaWRlciA9IG5ldyBQcmV2U2xpZGVyKGlucHV0U3RyKTtcblx0XHRfb2JqU2xpZGVzID0gX3ByZXZTbGlkZXIuYXJyYXlUb0Fyck9ianMoKTsgXG5cblx0XHRpZiAoIV9vYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRfZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0LTQsNC90L3Ri9C1J1xuXHRcdFx0fSwgJ0RhdGFzIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0X2ZhZGVCbG9jaygkKCcud3ItZm9ybV9kYXRhcycpLCAyLCBmdW5jdGlvbigpIHtcblx0XHRcdCQoJy53cmFwcGVyJykucHJlcGVuZChfdGVtcGxhdGVzLnByZXdpZXdzKF9vYmpTbGlkZXMpKS5mYWRlSW4oNTAwKTtcblx0XHR9KTtcblx0XHRcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmpzLWFjdGl2ZV9idG4nLCBmdW5jdGlvbigpIHtcdFxuXHRcdHZhciBudW1OZXdBY3RpdmUgPSAkKHRoaXMpLnZhbCgpO1xuXG5cdFx0X2FjdGl2ZUluZGV4ID1fY2hhbmdlQWN0aXZlSW5kZXgoX29ialNsaWRlcywgX2FjdGl2ZUluZGV4LCBudW1OZXdBY3RpdmUpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLWRlbGV0ZV9wcmV3aWV2JywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIFxuXHRcdFx0aXRlbSA9ICQodGhpcykuZGF0YSgnaXRlbScpLFxuXHRcdFx0d2luU2NyVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxuXHRcdFx0YWN0aXZlUHJldiA9ICQoJy53ci1ibG9jaycpLmVxKGl0ZW0pLmZpbmQoJy5qcy1hY3RpdmVfYnRuJykuaXMoJzpjaGVja2VkJyk7XG5cblx0XHRfb2JqU2xpZGVzLnNwbGljZShpdGVtLCAxKTtcblxuXHRcdGlmIChhY3RpdmVQcmV2KSB7XG5cdFx0XHRfYWN0aXZlSW5kZXggPSBfY2hhbmdlQWN0aXZlSW5kZXgoX29ialNsaWRlcywgMCwgMCk7XG5cdFx0fVxuXG5cdFx0JCgnLndyYXBwZXInKS5odG1sKF90ZW1wbGF0ZXMucHJld2lld3MoX29ialNsaWRlcykpO1xuXHRcdCQod2luZG93KS5zY3JvbGxUb3Aod2luU2NyVG9wKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuanMtY29tbWVudCwgLmpzLWxpbmsnLCBmdW5jdGlvbigpIHtcblx0XHR2YXJcblx0XHRcdCR0aGlzID0gJCh0aGlzKSxcblx0XHRcdGRhdGFOYW1lID0gJHRoaXMuYXR0cignbmFtZScpLCBcblx0XHRcdG51bWJlck9iaiA9ICR0aGlzLmRhdGEoZGF0YU5hbWUpO1xuXG5cdFx0X29ialNsaWRlc1tudW1iZXJPYmpdW2RhdGFOYW1lXSA9ICR0aGlzLnZhbCgpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLWdlbmVyYXRlLXNsaWRlcicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzbGlkZXI7XG5cblx0XHRfYWN0aXZlSW5kZXggPSBwYXJzZUludChfYWN0aXZlSW5kZXgpIHx8IDA7XG5cblx0XHRpZiAoIV9vYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRfZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0J3QtdGCINC90Lgg0L7QtNC90L7Qs9C+INGB0LvQsNC50LTQsCdcblx0XHRcdH0sICdEYXRhcyBpcyBlbXB0eScpO1xuXHRcdH1cblxuXHRcdF9vYmpTbGlkZXMgPSBfcHJldlNsaWRlci5hZGRPYmpzVG9FZGdlcyhfb2JqU2xpZGVzKTtcblxuXHRcdF9mYWRlQmxvY2soJCgnLndyLWJsb2Nrcy13JyksIDEsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLndyYXBwZXInKS5hcHBlbmQoX3RlbXBsYXRlcy5zbGlkZXJMaXN0KF9vYmpTbGlkZXMpKS5mYWRlSW4oNTAwLCBmdW5jdGlvbigpIHtcdFxuXG5cdFx0XHRcdF9vYmpTbGlkZXMgPSBfcHJldlNsaWRlci5kZWxldGVTbGlkZXNGcm9tRWRnZXMoX29ialNsaWRlcyk7XG5cblx0XHRcdFx0c2xpZGVyID0gbmV3IFNsaWRlcigkKCcuc2xpZGVyJyksIHtcblx0XHRcdFx0XHRhY3RpdmVDbGFzczogJ3NsaWRlci1hY3RpdmUnLFxuXHRcdFx0XHRcdGFjdGl2ZVBvczogX2FjdGl2ZUluZGV4XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHNsaWRlci5pbml0U2xpZGVyKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1zdGVwLWRvd24nLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9CbG9jayA9ICQodGhpcykuZGF0YSgndG8nKTtcblxuXHRcdCQoJy53cmFwcGVyJykuaHRtbChfcmV0dXJuQmxvY2sodG9CbG9jaywgX3RlbXBsYXRlcywgX29ialNsaWRlcykpO1xuXHR9KTtcblxuXHQvLyDQn9GA0LjRgdCy0LDQuNCy0LDQvdC40LUg0YHQu9Cw0LnQtNGDINGB0LLQvtC50YHRgtCy0LAgYWN0aXbQtS5cblx0Ly8g0YHQu9Cw0LnQtCDRgSDRgtCw0LrQuNC8INGB0LIt0LLQvtC8INC/0L7Rj9Cy0LjRgtGB0Y8g0L/QtdGA0LLRi9C8INC/0YDQuCDQs9C10L3QtdGA0LDRhtGG0LjQuCDRgdC70LDQudC00LXRgNCwXG5cdGZ1bmN0aW9uIF9jaGFuZ2VBY3RpdmVJbmRleChvYmplY3QsIGN1cnJlbnRJbmRleCwgbmV3QWN0aXZlSW5kZXgpIHtcblx0XHRpZiAobmV3QWN0aXZlSW5kZXggIT09IGN1cnJlbnRJbmRleCkge1xuXHRcdFx0ZGVsZXRlIG9iamVjdFtjdXJyZW50SW5kZXhdLmFjdGl2ZTtcblx0XHRcdGN1cnJlbnRJbmRleCA9IG5ld0FjdGl2ZUluZGV4O1x0XHRcdFxuXHRcdH1cblxuXHRcdF9vYmpTbGlkZXNbY3VycmVudEluZGV4XS5hY3RpdmUgPSAnY2hlY2tlZCc7XG5cblx0XHRyZXR1cm4gY3VycmVudEluZGV4O1xuXHR9XG5cblx0Ly8g0YTRg9C90LrRhtC40Y8sINC60L7RgtC+0YDQsNGPINGA0LXQvdC00LXRgNC40YIg0YjQsNCx0LvQvtC9INC/0YDQuCDQstC+0LfQstGA0LDRidC10L3QuNC4INC6INC/0YDQtdC00YvQtNGD0YnQtdC80YMg0YjQsNCz0YNcblx0ZnVuY3Rpb24gX3JldHVybkJsb2NrKG5hbWVUZW1wLCBteVRlbXBsYXRlcywgb3B0aW9ucykge1xuXHRcdHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmIChteVRlbXBsYXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lVGVtcCkpIHtcblx0XHRcdHJldHVybiBteVRlbXBsYXRlc1tuYW1lVGVtcF0ob3B0aW9ucyk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvLyDQn9C10YDQtdC80LXRidC10L3QuNC1INCx0LvQvtC60LAsINGBINC/0L7RgdC70LXQtNGD0Y7RidC40Lwg0LXQs9C+INGD0LTQsNC70LXQvdC40LXQvCDQuNC3IERPTVxuXHRmdW5jdGlvbiBfYmxvY2tNb3ZlKCRibG9jaywgbW92ZVRvLCBvZmZzZXQpIHtcblx0XHR2YXIgXG5cdFx0XHRtb3ZlVG8gPSBtb3ZlVG8gfHwgJ3RvcCcsXG5cdFx0XHRvZmZzZXQgPSBvZmZzZXQgfHwgLTEwMDA7XG5cblx0XHQkYmxvY2suY3NzKG1vdmVUbywgb2Zmc2V0KS5mYWRlT3V0KDEwMCwgZnVuY3Rpb24oKSB7XG5cdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8g0J7Qv9GA0LXQtNC10LvQtdC90LjQtSDRgdC/0L7RgdC+0LHQsCDQv9C10YDQtdC80LXRidC10L3QuNGPXG5cdGZ1bmN0aW9uIF9mYWRlQmxvY2soJGJsb2NrLCBhbmltYXRpb24sIGNhbGxiYWNrKSB7IC8vIGFuaW1hdGlvbiDQvNC+0LbQtdGCINCx0YvRgtGMIDE9dXAsIDI9cmlnaHRcblx0XHR2YXIgYW5pbWF0aW9uID0gYW5pbWF0aW9uIHx8IDE7XG5cblx0XHRzd2l0Y2ggKGFuaW1hdGlvbikge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRfYmxvY2tNb3ZlKCRibG9jaywgJ3RvcCcpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRfYmxvY2tNb3ZlKCRibG9jaywgJ3JpZ2h0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXHR9XG59KSgpO1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
