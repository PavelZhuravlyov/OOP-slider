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
	  timeStep : 3000,
	  slideWidth : this.arrSlides.outerWidth(),
	  arrows : true
	}, options);
	this.slideWidth = this.settings.slideWidth;
	this.indexActiveSlide = this.settings.activePos + 2;
	this.slideStartIndex = 2;
	this.slideEndIndex = this.countSlides - 1;
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
		this.slider.after('<a href="#" data-slide="1" class="slider-arrow"></a><a href="#" data-slide="-1" class="slider-arrow"></a>');
	}
};

// Установить астивный класс на слайд
// Слайд вычисляется по индексу, где индекс - это activePos в options
// И перемещается на активный слайд
Slider.prototype.setActiveSlide = function() {
	this.slider.children('*[data-item="' + (this.settings.activePos + 2) + '"]').addClass(this.settings.activeClass);
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
			'left': -_this.slideWidth * movingPosition
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
		this.ballActivePos = nextSlide - 2;
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
		i;

	for (i = 0; i < arrayBalls.length; i++) {
		if (arrayBalls.eq(i).hasClass(ballsClass)) {
			arrayBalls.eq(i).removeClass(ballsClassActive);
		}
	}

	if (moveSlider) {
		this.move(dataSlide);
		this.changeActiveSlide(dataSlide);
		arrayBalls.eq(dataSlide - 2).addClass(ballsClassActive);
	} else {
		arrayBalls.eq(dataSlide).addClass(ballsClassActive);
	}

	this.ballActivePos = dataSlide + 1;
};

// Эффект появления слайдера во время инициализации
Slider.prototype.changeOpacity = function() {
	var _this = this;

	setTimeout(function() {
		_this.slider.css('opacity', 1);
	}, 500);
}

// Обработчик клика на кнопки переключения
Slider.prototype.clickHandler = function() {
	var _this = this;

	$(document).on('click', '.slider-arrow', function() {
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

	$(document).on('click', '.slider-navigation-circle', function() {
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

	if (this.countSlides == 4) {
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
		i;

	if (!arrUrls) {
		return false;
	}

	for (i = 0; i < arrUrls.length; i++) {
		arrObjects[i] = { 
			foto: arrUrls[i],
			comment: '',
			link: ''
		};
	}
	
	arrObjects[0].active = 'checked';

	return arrObjects;
};

PrevSlider.prototype.addSlidesToEdges = function(arrObjects) {
	var 
		lengthArr = arrObjects.length - 1,
		newArr = arrObjects.concat();

	arrObjects.push(_cloneObj(arrObjects[0]), _cloneObj(arrObjects[1]));
	arrObjects.unshift(_cloneObj(arrObjects[lengthArr - 1]), _cloneObj(arrObjects[lengthArr]));

	lengthArr = arrObjects.length - 1;

	arrObjects[0].notReal = true;
	arrObjects[1].notReal = true;
	arrObjects[lengthArr].notReal = true;
	arrObjects[lengthArr - 1].notReal = true;

	return arrObjects;

	function _cloneObj(obj){
		var 
			newObj = {},
			prop;

		for (prop in obj) {
			newObj[prop] = obj[prop];
		}

		return newObj;
	}
};

PrevSlider.prototype.deleteSlidesFromEdges = function(arrObjects) {
	var lengthArr = arrObjects.length - 1;

	arrObjects.splice(lengthArr, 1);
	arrObjects.splice(lengthArr - 1, 1);
	arrObjects.splice(1, 1);
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

		fadeBlock($('.wr-form_datas'), 2, function() {
			$('.wrapper').prepend(_templates.prewiews(_objSlides)).fadeIn(500);
		});
		
		return false;
	});

	$(document).on('change', '.js-active_btn', function() {	
		var numNewActive = $(this).val();

		delete _objSlides[_activeIndex].active;

		_activeIndex = (_activeIndex === numNewActive) ? _activeIndex : numNewActive;
		_objSlides[_activeIndex].active = 'checked';
	});

	$(document).on('click', '.js-delete_prewiev', function() {
		var 
			item = $(this).data('item'),
			winScrTop = $(window).scrollTop(),
			activePrev = $('.wr-block').eq(item).find('.js-active_btn').is(':checked');

		if (activePrev) {
			_activeIndex = 0;
		}

		_objSlides.splice(item, 1);

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

		_objSlides = _prevSlider.addSlidesToEdges(_objSlides);

		fadeBlock($('.wr-blocks-w'), 1, function() {
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

		$('.wrapper').html(returnBlock(toBlock, _templates, _objSlides));
	});

	// функция, которая рендерит шаблон при возвращении к предыдущему шагу
	function returnBlock(nameTemp, myTemplates, options) {
		var options = options || {};

		if (myTemplates.hasOwnProperty(nameTemp)) {
			return myTemplates[nameTemp](options);
		}
	}
	
	// Перемещение блока, с последующим его удалением из DOM
	function blockMove($block, moveTo, offset) {
		var 
			moveTo = moveTo || 'top',
			offset = offset || -1000;

		$block.css(moveTo, offset).fadeOut(100, function() {
			$(this).remove();
		});
	}

	// Определение способа перемещения
	function fadeBlock($block, animation, callback) { // animation может быть 1=up, 2=right
		var animation = animation || 1;

		switch (animation) {
			case 1:
				blockMove($block, 'top');
				break;

			case 2:
				blockMove($block, 'right');
				break;
		}

		if (callback && typeof callback === 'function') {
			callback();
		}
	}
})();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwicHJldlNsaWRlci5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g0J7QsdGA0LDQsdC+0YLRh9C40Log0L7RiNC40LHQvtC6XHJcbmZ1bmN0aW9uIEVycm9ySGFuZGxlcihjbGFzc0VycldpbmRvdywgdGVtcGxhdGVQb3BVcCkge1xyXG5cdHRoaXMudGltZUhpZGUgPSAyMDAwO1xyXG5cdHRoaXMuY2xhc3NFcnJXaW5kb3cgPSBjbGFzc0VycldpbmRvdztcclxuXHR0aGlzLnRlbXBsYXRlUG9wVXAgPSB0ZW1wbGF0ZVBvcFVwO1xyXG59XHJcblxyXG4vLyDQoNC10L3QtNC10YDQuNC90LMg0YjQsNCx0LvQvtC90LAg0L7RiNC40LHQvtC6XHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUubmV3RXJyb3IgPSBmdW5jdGlvbihlcnJvck9iamVjdCkge1xyXG5cdHJldHVybiB0aGlzLnRlbXBsYXRlUG9wVXAoZXJyb3JPYmplY3QpO1xyXG59O1xyXG5cclxuLy8g0KHQutGA0YvQstCw0LXQvCDQuCDRg9C00LDQu9GP0LXQvCDQv9C70LDRiNC60YMg0L7RiNC40LHQutC4INGH0LXRgNC10LcgdGltZUhpZGUgXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuaGlkZUVycm9yV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGVycldpbmRvdyA9ICQodGhpcy5jbGFzc0VycldpbmRvdyk7XHJcblxyXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRlcnJXaW5kb3cuZmFkZU91dCh0aGlzLnRpbWVIaWRlLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0ZXJyV2luZG93LnJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblx0fSwgdGhpcy50aW1lSGlkZSk7XHJcbn07XHJcblxyXG4vLyDQn9GA0Lgg0LLQvtC30L3QuNC60L3QvtCy0LXQvdC40Lgg0L7RiNC40LHQutC4INCy0YvQstC10YHRgtC4INC/0LvQsNGI0LrRgyDQuCDRg9C00LDQu9C40YLRjFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmNhdWdodEVyciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHQkKCdib2R5JykuYXBwZW5kKHRoaXMubmV3RXJyb3Iob3B0aW9ucykpO1xyXG5cdHRoaXMuaGlkZUVycm9yV2luZG93KCk7XHJcbn07XHJcblxyXG4vLyDQpNGD0L3QutGG0LjRjyDQstGL0LfQvtCy0LAg0L7RiNC40LHQutC4XHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuZ2VuZXJhdGVFcnJvciA9IGZ1bmN0aW9uKGVycm9yT3B0LCBjb25zb2xlTWVzc2FnZSkge1xyXG5cdHRoaXMuY2F1Z2h0RXJyKGVycm9yT3B0KTtcclxuXHR0aHJvdyBuZXcgRXJyb3IoY29uc29sZU1lc3NhZ2UgfHwgJ0Vycm9yJyk7XHJcbn07IiwiZnVuY3Rpb24gU2xpZGVyKCRzbGlkZXIsIG9wdGlvbnMpIHtcblx0dGhpcy5zbGlkZXIgPSAkc2xpZGVyO1xuXHR0aGlzLmFyclNsaWRlcyA9IHRoaXMuc2xpZGVyLmNoaWxkcmVuKCk7XG5cdHRoaXMuYXJyU2xpZGVzRGVmID0gdGhpcy5hcnJTbGlkZXM7XG5cdHRoaXMuY291bnRTbGlkZXMgPSB0aGlzLmFyclNsaWRlcy5sZW5ndGggLSAxO1xuXHR0aGlzLnNldHRpbmdzID0gJC5leHRlbmQoe1xuXHQgIGFjdGl2ZUNsYXNzIDogJ3NsaWRlci1hY3RpdmUnLFxuXHQgIGJhbGxzQmxvY2sgOiAnc2xpZGVyLW5hdmlnYXRpb24nLFxuXHQgIGJhbGxzQ2xhc3MgOiAnc2xpZGVyLW5hdmlnYXRpb24tY2lyY2xlJyxcblx0ICBhY3RpdmVQb3MgOiAwLFxuXHQgIHRpbWVTdGVwIDogMzAwMCxcblx0ICBzbGlkZVdpZHRoIDogdGhpcy5hcnJTbGlkZXMub3V0ZXJXaWR0aCgpLFxuXHQgIGFycm93cyA6IHRydWVcblx0fSwgb3B0aW9ucyk7XG5cdHRoaXMuc2xpZGVXaWR0aCA9IHRoaXMuc2V0dGluZ3Muc2xpZGVXaWR0aDtcblx0dGhpcy5pbmRleEFjdGl2ZVNsaWRlID0gdGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgKyAyO1xuXHR0aGlzLnNsaWRlU3RhcnRJbmRleCA9IDI7XG5cdHRoaXMuc2xpZGVFbmRJbmRleCA9IHRoaXMuY291bnRTbGlkZXMgLSAxO1xuXHR0aGlzLmJhbGxzQmxvY2sgPSAkKCcuJyArIHRoaXMuc2V0dGluZ3MuYmFsbHNCbG9jayk7XG5cdHRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzID0gdGhpcy5iYWxsc0Jsb2NrLmNoaWxkcmVuKCcuJyArIHRoaXMuc2V0dGluZ3MuYmFsbHNDbGFzcyk7XG5cdHRoaXMuYXJyTmF2RWxMZW5ndGggPSB0aGlzLmFycmF5TmF2aWdFbGVtZW50cy5sZW5ndGg7XG5cdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zO1xuXHR0aGlzLmludGVydmFsLFxuXHR0aGlzLmZsYWcgPSBmYWxzZTtcbn1cblxuLy8g0JTQvtCx0LDQstC70Y/QtdC8INC60L3QvtC/0LrQuCDQv9C10YDQtdC00LLQuNC20LXQvdC40Y8sINC10YHQu9C4INCyINC+0L/RhtC40Y/RhSDRg9C60LDQt9Cw0L3QviBhcnJvd3M6IHRydWUgKNC/0L4g0YPQvNC+0LvRhylcblNsaWRlci5wcm90b3R5cGUuYWRkQXJyb3dzID0gZnVuY3Rpb24oKSB7XG5cdGlmKHRoaXMuc2V0dGluZ3MuYXJyb3dzKXtcblx0XHR0aGlzLnNsaWRlci5hZnRlcignPGEgaHJlZj1cIiNcIiBkYXRhLXNsaWRlPVwiMVwiIGNsYXNzPVwic2xpZGVyLWFycm93XCI+PC9hPjxhIGhyZWY9XCIjXCIgZGF0YS1zbGlkZT1cIi0xXCIgY2xhc3M9XCJzbGlkZXItYXJyb3dcIj48L2E+Jyk7XG5cdH1cbn07XG5cbi8vINCj0YHRgtCw0L3QvtCy0LjRgtGMINCw0YHRgtC40LLQvdGL0Lkg0LrQu9Cw0YHRgSDQvdCwINGB0LvQsNC50LRcbi8vINCh0LvQsNC50LQg0LLRi9GH0LjRgdC70Y/QtdGC0YHRjyDQv9C+INC40L3QtNC10LrRgdGDLCDQs9C00LUg0LjQvdC00LXQutGBIC0g0Y3RgtC+IGFjdGl2ZVBvcyDQsiBvcHRpb25zXG4vLyDQmCDQv9C10YDQtdC80LXRidCw0LXRgtGB0Y8g0L3QsCDQsNC60YLQuNCy0L3Ri9C5INGB0LvQsNC50LRcblNsaWRlci5wcm90b3R5cGUuc2V0QWN0aXZlU2xpZGUgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5zbGlkZXIuY2hpbGRyZW4oJypbZGF0YS1pdGVtPVwiJyArICh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyArIDIpICsgJ1wiXScpLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHR0aGlzLm1vdmUodGhpcy5pbmRleEFjdGl2ZVNsaWRlKTtcbn07XG5cbi8vINCj0LfQvdCw0YLRjCDQuNC90LTQtdC60YEg0YLQtdC60YPRidC10LPQviDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmdldEluZGV4QWN0aXZlU2xpZGUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuc2xpZGVyLmNoaWxkcmVuKCcuJyArIHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpLmluZGV4KCk7XG59O1xuXG4vLyDQodCx0YDQvtGB0LjRgtGMINGB0L4g0LLRgdC10YUg0YHQu9Cw0LnQtNC+0LIg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBXG4vLyDQn9C+0YHRgtCw0LLQuNGC0Ywg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9C10LQg0YHQu9Cw0LnQtCAobmV4dFNsaWRlIC0g0YHQu9C10LQuINC40L3QtNC10LrRgSlcblNsaWRlci5wcm90b3R5cGUuY2hhbmdlQWN0aXZlU2xpZGUgPSBmdW5jdGlvbihuZXh0U2xpZGUpIHtcblx0dGhpcy5hcnJTbGlkZXMuc2libGluZ3MoKS5yZW1vdmVDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy5hcnJTbGlkZXMuZXEobmV4dFNsaWRlKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbn07XG5cbi8vINCd0LXQt9Cw0LzQtdGC0L3QvtC1INC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxuLy8g0JTQtdC70LDQtdGC0YHRjyDQtNC70Y8g0YLQvtCz0L4sINGH0YLQvtCx0Ysg0L/QtdGA0LXQvNC10YHRgtC40YLRjCDRgdC70LDQudC00LXRgCwg0LrQvtCz0LTQsCBcbi8vINC+0L0g0LTQvtGB0YLQuNCzINC40LvQuCDQv9C+0YHQu9C10LTQvdC10LPQviwg0LjQu9C4INC/0LXRgNCy0L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5pbnZpc2libGVNb3ZlU2xpZGVyID0gZnVuY3Rpb24oaW5kZXhQb3NpdGlvbiwgbW92aW5nUG9zaXRpb24pIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHR0aGlzLm1vdmUoaW5kZXhQb3NpdGlvbiwgZnVuY3Rpb24oKSB7XG5cdFx0X3RoaXMuc2xpZGVyLmNzcyh7XG5cdFx0XHQnbGVmdCc6IC1fdGhpcy5zbGlkZVdpZHRoICogbW92aW5nUG9zaXRpb25cblx0XHR9KTtcblx0XHRfdGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShtb3ZpbmdQb3NpdGlvbik7XG5cdH0pO1xufTtcblxuLy8g0J/RgNC+0LLQtdGA0LrQsCDQuNC90LTQtdC60YHQsCDRgdC70LXQtCDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUuY2hlY2tTbGlkZSA9IGZ1bmN0aW9uKGRhdGFTbGlkZSkge1xuXHR2YXIgXG5cdFx0ZGF0YVNsaWRlID0gZGF0YVNsaWRlIHx8IDEsXG5cdFx0bmV4dFNsaWRlID0gdGhpcy5nZXRJbmRleEFjdGl2ZVNsaWRlKCkgKyBkYXRhU2xpZGU7XG5cblx0aWYgKG5leHRTbGlkZSA9PT0gdGhpcy5zbGlkZUVuZEluZGV4KSB7XG5cdFx0dGhpcy5pbnZpc2libGVNb3ZlU2xpZGVyKG5leHRTbGlkZSwgdGhpcy5zbGlkZVN0YXJ0SW5kZXgpO1xuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IDA7XG5cdH0gZWxzZSBpZiAobmV4dFNsaWRlID09PSAodGhpcy5zbGlkZVN0YXJ0SW5kZXggLSAxKSkge1xuXHRcdHRoaXMuaW52aXNpYmxlTW92ZVNsaWRlcihuZXh0U2xpZGUsIHRoaXMuc2xpZGVFbmRJbmRleCAtIDEpO1x0XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gdGhpcy5hcnJOYXZFbExlbmd0aCAtIDE7XG5cdH1cdGVsc2Uge1xuXHRcdHRoaXMubW92ZShuZXh0U2xpZGUpO1xuXHRcdHRoaXMuY2hhbmdlQWN0aXZlU2xpZGUobmV4dFNsaWRlKTtcblx0XHR0aGlzLmJhbGxBY3RpdmVQb3MgPSBuZXh0U2xpZGUgLSAyO1xuXHR9XHRcblxuXHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuYmFsbEFjdGl2ZVBvcywgZmFsc2UpO1xufTtcblxuLy8g0J/Qu9Cw0LLQvdC+0LUg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXG4vLyDQn9Cw0YDQsNC80LXRgtGA0Ys6IGluZGV4UG9zIC0g0LjQvdC00LXQutGBINCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGluZGV4UG9zLCBjYWxsYmFjaykge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdHRoaXMuc2xpZGVyLnRyYW5zaXRpb24oe1xuXHRcdCdsZWZ0JzogLV90aGlzLnNsaWRlV2lkdGggKiBpbmRleFBvc1xuXHR9LCA1MDAsIGZ1bmN0aW9uKCkge1xuXHRcdF90aGlzLmZsYWcgPSBmYWxzZTtcblxuXHRcdGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXHR9KTtcdFxufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YLQsNC50LzQtdGA0LAg0LTQu9GPINCw0LLRgtC+0L3QvtC80L3QvtCz0L4g0L/QtdGA0LXQvNC10YnQtdC90LjRjyDRgdC70LDQudC00LXRgNCwXG5TbGlkZXIucHJvdG90eXBlLnN0YXJ0VGltZXIgPSBmdW5jdGlvbih0aW1lciwgZnVuYykge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdHJldHVybiBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0X3RoaXMuY2hlY2tTbGlkZSgpO1xuXHRcdFx0fSwgX3RoaXMuc2V0dGluZ3MudGltZVN0ZXApO1xufTtcblxuLy8g0KDQsNCx0L7RgtCwINGBINC90LjQttC90LXQuSDQvdCw0LLQuNCz0LDRhtC40LXQuSjRg9GB0YLQsNC90L7QstC60LAsINC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0Log0YHQvtC+0YLQstC10YLRgdGC0LLRg9GO0YnQtdC80YMg0YjQsNGA0LjQutGDINGB0LvQsNC50LTRgylcblNsaWRlci5wcm90b3R5cGUuYmFsbHNTZXRBY3RpdmUgPSBmdW5jdGlvbihkYXRhU2xpZGUsIG1vdmVTbGlkZXIpIHtcblx0dmFyIFxuXHRcdGJhbGxzQ2xhc3MgPSB0aGlzLnNldHRpbmdzLmJhbGxzQ2xhc3MsXG5cdFx0YmFsbHNDbGFzc0FjdGl2ZSA9IGJhbGxzQ2xhc3MgKyAnLWFjdGl2ZScsXG5cdFx0YXJyYXlCYWxscyA9IHRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzLFxuXHRcdGk7XG5cblx0Zm9yIChpID0gMDsgaSA8IGFycmF5QmFsbHMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoYXJyYXlCYWxscy5lcShpKS5oYXNDbGFzcyhiYWxsc0NsYXNzKSkge1xuXHRcdFx0YXJyYXlCYWxscy5lcShpKS5yZW1vdmVDbGFzcyhiYWxsc0NsYXNzQWN0aXZlKTtcblx0XHR9XG5cdH1cblxuXHRpZiAobW92ZVNsaWRlcikge1xuXHRcdHRoaXMubW92ZShkYXRhU2xpZGUpO1xuXHRcdHRoaXMuY2hhbmdlQWN0aXZlU2xpZGUoZGF0YVNsaWRlKTtcblx0XHRhcnJheUJhbGxzLmVxKGRhdGFTbGlkZSAtIDIpLmFkZENsYXNzKGJhbGxzQ2xhc3NBY3RpdmUpO1xuXHR9IGVsc2Uge1xuXHRcdGFycmF5QmFsbHMuZXEoZGF0YVNsaWRlKS5hZGRDbGFzcyhiYWxsc0NsYXNzQWN0aXZlKTtcblx0fVxuXG5cdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IGRhdGFTbGlkZSArIDE7XG59O1xuXG4vLyDQrdGE0YTQtdC60YIg0L/QvtGP0LLQu9C10L3QuNGPINGB0LvQsNC50LTQtdGA0LAg0LLQviDQstGA0LXQvNGPINC40L3QuNGG0LjQsNC70LjQt9Cw0YbQuNC4XG5TbGlkZXIucHJvdG90eXBlLmNoYW5nZU9wYWNpdHkgPSBmdW5jdGlvbigpIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdF90aGlzLnNsaWRlci5jc3MoJ29wYWNpdHknLCAxKTtcblx0fSwgNTAwKTtcbn1cblxuLy8g0J7QsdGA0LDQsdC+0YLRh9C40Log0LrQu9C40LrQsCDQvdCwINC60L3QvtC/0LrQuCDQv9C10YDQtdC60LvRjtGH0LXQvdC40Y9cblNsaWRlci5wcm90b3R5cGUuY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5zbGlkZXItYXJyb3cnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGF0YVNsaWRlID0gJCh0aGlzKS5kYXRhKCdzbGlkZScpO1xuXG5cdFx0aWYgKF90aGlzLmZsYWcpIHsgXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0X3RoaXMuZmxhZyA9IHRydWU7XG5cblx0XHRjbGVhckludGVydmFsKF90aGlzLmludGVydmFsKTtcblx0XHRfdGhpcy5jaGVja1NsaWRlKGRhdGFTbGlkZSk7XG5cdFx0X3RoaXMuYmFsbHNTZXRBY3RpdmUoX3RoaXMuYmFsbEFjdGl2ZVBvcyAtIDEsIGZhbHNlKTtcblx0XHRfdGhpcy5pbnRlcnZhbCA9IF90aGlzLnN0YXJ0VGltZXIoX3RoaXMuaW50ZXJ2YWwpO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnNsaWRlci1uYXZpZ2F0aW9uLWNpcmNsZScsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBcblx0XHRcdGRhdGFTbGlkZSA9ICQodGhpcykuZGF0YSgnc2xpZGUnKSxcblx0XHRcdGJhbGxzQ2xhc3NBY3RpdmUgPSBfdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzICsgJy1hY3RpdmUnO1xuXG5cdFx0aWYgKCQodGhpcykuaGFzQ2xhc3MoYmFsbHNDbGFzc0FjdGl2ZSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IFxuXG5cdFx0Y2xlYXJJbnRlcnZhbChfdGhpcy5pbnRlcnZhbCk7XG5cdFx0X3RoaXMuYmFsbHNTZXRBY3RpdmUoZGF0YVNsaWRlLCB0cnVlKTtcblx0XHRfdGhpcy5pbnRlcnZhbCA9IF90aGlzLnN0YXJ0VGltZXIoX3RoaXMuaW50ZXJ2YWwpO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcbn07XG5cbi8vINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINGB0LvQsNC50LTQtdGA0LBcblNsaWRlci5wcm90b3R5cGUuaW5pdFNsaWRlciA9IGZ1bmN0aW9uKCl7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0aWYgKCh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA+IHRoaXMuYXJyU2xpZGVzRGVmLmxlbmd0aCkgfHwgKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zIDwgMCkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBwb3NpdGlvbiB1bmRlZmluZWQnKTtcblx0fVxuXG5cdGlmICh0aGlzLmNvdW50U2xpZGVzID09IDQpIHtcblx0XHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zKTtcblx0XHR0aGlzLnNldEFjdGl2ZVNsaWRlKCk7XHRcblx0XHR0aGlzLmNoYW5nZU9wYWNpdHkoKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR0aGlzLmFkZEFycm93cygpO1xuXHR0aGlzLnNldEFjdGl2ZVNsaWRlKCk7XHRcblx0dGhpcy5jbGlja0hhbmRsZXIoKTtcblx0dGhpcy5iYWxsc1NldEFjdGl2ZSh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyk7XG5cdHRoaXMuY2hhbmdlT3BhY2l0eSgpO1xuXHR0aGlzLmludGVydmFsID0gdGhpcy5zdGFydFRpbWVyKHRoaXMuaW50ZXJ2YWwpO1xufTsiLCJmdW5jdGlvbiBQcmV2U2xpZGVyKGFycmF5VXJscykge1xyXG5cdHRoaXMuYXJyYXlVcmxzID0gYXJyYXlVcmxzO1xyXG5cdHRoaXMuYXJyTGVuZ3RoID0gYXJyYXlVcmxzLmxlbmd0aDtcclxufVxyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC40Lcg0YHRgtGA0L7QutC4INC80LDRgdGB0LjQslxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5zdHJpbmdUb0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGlucHV0U3RyaW5nO1xyXG5cclxuXHRpZiAoIXRoaXMuYXJyYXlVcmxzKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRpbnB1dFN0cmluZyA9IEpTT04ucGFyc2UodGhpcy5hcnJheVVybHMpO1xyXG5cclxuXHRyZXR1cm4gaW5wdXRTdHJpbmc7XHJcbn07XHJcblxyXG4vLyDQpNC+0YDQvNC40YDRg9C10Lwg0LzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIgXHJcbi8vINCd0LAg0LLRhdC+0LQg0LjQvdC00LXQutGBINCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LAo0YLQvtGCLCDQutC+0YLQvtGA0YvQuSDQsdGD0LTQtdGCINC/0L7QutCw0LfRi9Cy0LDRgtGM0YHRjyDQv9C10YDQstGL0LwpXHJcblByZXZTbGlkZXIucHJvdG90eXBlLmFycmF5VG9BcnJPYmpzID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIFxyXG5cdFx0YXJyT2JqZWN0cyA9IFtdLFxyXG5cdFx0YXJyVXJscyA9IHRoaXMuc3RyaW5nVG9BcnJheSgpLFxyXG5cdFx0aTtcclxuXHJcblx0aWYgKCFhcnJVcmxzKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRmb3IgKGkgPSAwOyBpIDwgYXJyVXJscy5sZW5ndGg7IGkrKykge1xyXG5cdFx0YXJyT2JqZWN0c1tpXSA9IHsgXHJcblx0XHRcdGZvdG86IGFyclVybHNbaV0sXHJcblx0XHRcdGNvbW1lbnQ6ICcnLFxyXG5cdFx0XHRsaW5rOiAnJ1xyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0YXJyT2JqZWN0c1swXS5hY3RpdmUgPSAnY2hlY2tlZCc7XHJcblxyXG5cdHJldHVybiBhcnJPYmplY3RzO1xyXG59O1xyXG5cclxuUHJldlNsaWRlci5wcm90b3R5cGUuYWRkU2xpZGVzVG9FZGdlcyA9IGZ1bmN0aW9uKGFyck9iamVjdHMpIHtcclxuXHR2YXIgXHJcblx0XHRsZW5ndGhBcnIgPSBhcnJPYmplY3RzLmxlbmd0aCAtIDEsXHJcblx0XHRuZXdBcnIgPSBhcnJPYmplY3RzLmNvbmNhdCgpO1xyXG5cclxuXHRhcnJPYmplY3RzLnB1c2goX2Nsb25lT2JqKGFyck9iamVjdHNbMF0pLCBfY2xvbmVPYmooYXJyT2JqZWN0c1sxXSkpO1xyXG5cdGFyck9iamVjdHMudW5zaGlmdChfY2xvbmVPYmooYXJyT2JqZWN0c1tsZW5ndGhBcnIgLSAxXSksIF9jbG9uZU9iaihhcnJPYmplY3RzW2xlbmd0aEFycl0pKTtcclxuXHJcblx0bGVuZ3RoQXJyID0gYXJyT2JqZWN0cy5sZW5ndGggLSAxO1xyXG5cclxuXHRhcnJPYmplY3RzWzBdLm5vdFJlYWwgPSB0cnVlO1xyXG5cdGFyck9iamVjdHNbMV0ubm90UmVhbCA9IHRydWU7XHJcblx0YXJyT2JqZWN0c1tsZW5ndGhBcnJdLm5vdFJlYWwgPSB0cnVlO1xyXG5cdGFyck9iamVjdHNbbGVuZ3RoQXJyIC0gMV0ubm90UmVhbCA9IHRydWU7XHJcblxyXG5cdHJldHVybiBhcnJPYmplY3RzO1xyXG5cclxuXHRmdW5jdGlvbiBfY2xvbmVPYmoob2JqKXtcclxuXHRcdHZhciBcclxuXHRcdFx0bmV3T2JqID0ge30sXHJcblx0XHRcdHByb3A7XHJcblxyXG5cdFx0Zm9yIChwcm9wIGluIG9iaikge1xyXG5cdFx0XHRuZXdPYmpbcHJvcF0gPSBvYmpbcHJvcF07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5ld09iajtcclxuXHR9XHJcbn07XHJcblxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5kZWxldGVTbGlkZXNGcm9tRWRnZXMgPSBmdW5jdGlvbihhcnJPYmplY3RzKSB7XHJcblx0dmFyIGxlbmd0aEFyciA9IGFyck9iamVjdHMubGVuZ3RoIC0gMTtcclxuXHJcblx0YXJyT2JqZWN0cy5zcGxpY2UobGVuZ3RoQXJyLCAxKTtcclxuXHRhcnJPYmplY3RzLnNwbGljZShsZW5ndGhBcnIgLSAxLCAxKTtcclxuXHRhcnJPYmplY3RzLnNwbGljZSgxLCAxKTtcclxuXHRhcnJPYmplY3RzLnNwbGljZSgwLCAxKTtcclxuXHJcblx0cmV0dXJuIGFyck9iamVjdHM7XHJcbn07IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbihmdW5jdGlvbigpe1xuXHR2YXIgX3RlbXBsYXRlcyA9IHtcblx0XHRpbnB1dExpbmtzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2lucHV0TGlua3MnKS5odG1sKCkpLFxuXHRcdGVycm9yOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2Vycm9yUG9wVXAnKS5odG1sKCkpLFxuXHRcdHByZXdpZXdzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3ByZXdpZXdzJykuaHRtbCgpKSxcblx0XHRzbGlkZXJMaXN0OiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3NsaWRlckxpc3QnKS5odG1sKCkpXG5cdH07XG5cblx0dmFyIFxuXHRcdF9lcnJvckhhbmRsZXIgPSBuZXcgRXJyb3JIYW5kbGVyKCcuZXJyTWVzJywgX3RlbXBsYXRlcy5lcnJvciksXG5cdFx0X2FjdGl2ZUluZGV4ID0gMCxcblx0XHRfcHJldlNsaWRlcixcblx0XHRfb2JqU2xpZGVzO1xuXG5cdCQoJy53cmFwcGVyJykuaHRtbChfdGVtcGxhdGVzLmlucHV0TGlua3MoKSlcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLXNhdmVfZGF0YXMnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgaW5wdXRTdHIgPSAkKCcud3ItZm9ybV9kYXRhcy1pbnAnKS52YWwoKTtcblx0XHRcblx0XHRfcHJldlNsaWRlciA9IG5ldyBQcmV2U2xpZGVyKGlucHV0U3RyKTtcblx0XHRfb2JqU2xpZGVzID0gX3ByZXZTbGlkZXIuYXJyYXlUb0Fyck9ianMoKTsgXG5cblx0XHRpZiAoIV9vYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRfZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0LTQsNC90L3Ri9C1J1xuXHRcdFx0fSwgJ0RhdGFzIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0ZmFkZUJsb2NrKCQoJy53ci1mb3JtX2RhdGFzJyksIDIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLndyYXBwZXInKS5wcmVwZW5kKF90ZW1wbGF0ZXMucHJld2lld3MoX29ialNsaWRlcykpLmZhZGVJbig1MDApO1xuXHRcdH0pO1xuXHRcdFxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuanMtYWN0aXZlX2J0bicsIGZ1bmN0aW9uKCkge1x0XG5cdFx0dmFyIG51bU5ld0FjdGl2ZSA9ICQodGhpcykudmFsKCk7XG5cblx0XHRkZWxldGUgX29ialNsaWRlc1tfYWN0aXZlSW5kZXhdLmFjdGl2ZTtcblxuXHRcdF9hY3RpdmVJbmRleCA9IChfYWN0aXZlSW5kZXggPT09IG51bU5ld0FjdGl2ZSkgPyBfYWN0aXZlSW5kZXggOiBudW1OZXdBY3RpdmU7XG5cdFx0X29ialNsaWRlc1tfYWN0aXZlSW5kZXhdLmFjdGl2ZSA9ICdjaGVja2VkJztcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1kZWxldGVfcHJld2lldicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBcblx0XHRcdGl0ZW0gPSAkKHRoaXMpLmRhdGEoJ2l0ZW0nKSxcblx0XHRcdHdpblNjclRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcblx0XHRcdGFjdGl2ZVByZXYgPSAkKCcud3ItYmxvY2snKS5lcShpdGVtKS5maW5kKCcuanMtYWN0aXZlX2J0bicpLmlzKCc6Y2hlY2tlZCcpO1xuXG5cdFx0aWYgKGFjdGl2ZVByZXYpIHtcblx0XHRcdF9hY3RpdmVJbmRleCA9IDA7XG5cdFx0fVxuXG5cdFx0X29ialNsaWRlcy5zcGxpY2UoaXRlbSwgMSk7XG5cblx0XHQkKCcud3JhcHBlcicpLmh0bWwoX3RlbXBsYXRlcy5wcmV3aWV3cyhfb2JqU2xpZGVzKSk7XG5cdFx0JCh3aW5kb3cpLnNjcm9sbFRvcCh3aW5TY3JUb3ApO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5qcy1jb21tZW50LCAuanMtbGluaycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhclxuXHRcdFx0JHRoaXMgPSAkKHRoaXMpLFxuXHRcdFx0ZGF0YU5hbWUgPSAkdGhpcy5hdHRyKCduYW1lJyksIFxuXHRcdFx0bnVtYmVyT2JqID0gJHRoaXMuZGF0YShkYXRhTmFtZSk7XG5cblx0XHRfb2JqU2xpZGVzW251bWJlck9ial1bZGF0YU5hbWVdID0gJHRoaXMudmFsKCk7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtZ2VuZXJhdGUtc2xpZGVyJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNsaWRlcjtcblxuXHRcdF9hY3RpdmVJbmRleCA9IHBhcnNlSW50KF9hY3RpdmVJbmRleCkgfHwgMDtcblxuXHRcdGlmICghX29ialNsaWRlcy5sZW5ndGgpIHtcblx0XHRcdF9lcnJvckhhbmRsZXIuZ2VuZXJhdGVFcnJvcih7XG5cdFx0XHRcdHRpdGxlOiAn0J7RiNC40LHQutCwJywgXG5cdFx0XHRcdG1lc3NhZ2U6ICfQndC10YIg0L3QuCDQvtC00L3QvtCz0L4g0YHQu9Cw0LnQtNCwJ1xuXHRcdFx0fSwgJ0RhdGFzIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0X29ialNsaWRlcyA9IF9wcmV2U2xpZGVyLmFkZFNsaWRlc1RvRWRnZXMoX29ialNsaWRlcyk7XG5cblx0XHRmYWRlQmxvY2soJCgnLndyLWJsb2Nrcy13JyksIDEsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLndyYXBwZXInKS5hcHBlbmQoX3RlbXBsYXRlcy5zbGlkZXJMaXN0KF9vYmpTbGlkZXMpKS5mYWRlSW4oNTAwLCBmdW5jdGlvbigpIHtcdFxuXG5cdFx0XHRcdF9vYmpTbGlkZXMgPSBfcHJldlNsaWRlci5kZWxldGVTbGlkZXNGcm9tRWRnZXMoX29ialNsaWRlcyk7XG5cblx0XHRcdFx0c2xpZGVyID0gbmV3IFNsaWRlcigkKCcuc2xpZGVyJyksIHtcblx0XHRcdFx0XHRhY3RpdmVDbGFzczogJ3NsaWRlci1hY3RpdmUnLFxuXHRcdFx0XHRcdGFjdGl2ZVBvczogX2FjdGl2ZUluZGV4XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHNsaWRlci5pbml0U2xpZGVyKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1zdGVwLWRvd24nLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9CbG9jayA9ICQodGhpcykuZGF0YSgndG8nKTtcblxuXHRcdCQoJy53cmFwcGVyJykuaHRtbChyZXR1cm5CbG9jayh0b0Jsb2NrLCBfdGVtcGxhdGVzLCBfb2JqU2xpZGVzKSk7XG5cdH0pO1xuXG5cdC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDRgNC10L3QtNC10YDQuNGCINGI0LDQsdC70L7QvSDQv9GA0Lgg0LLQvtC30LLRgNCw0YnQtdC90LjQuCDQuiDQv9GA0LXQtNGL0LTRg9GJ0LXQvNGDINGI0LDQs9GDXG5cdGZ1bmN0aW9uIHJldHVybkJsb2NrKG5hbWVUZW1wLCBteVRlbXBsYXRlcywgb3B0aW9ucykge1xuXHRcdHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmIChteVRlbXBsYXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lVGVtcCkpIHtcblx0XHRcdHJldHVybiBteVRlbXBsYXRlc1tuYW1lVGVtcF0ob3B0aW9ucyk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvLyDQn9C10YDQtdC80LXRidC10L3QuNC1INCx0LvQvtC60LAsINGBINC/0L7RgdC70LXQtNGD0Y7RidC40Lwg0LXQs9C+INGD0LTQsNC70LXQvdC40LXQvCDQuNC3IERPTVxuXHRmdW5jdGlvbiBibG9ja01vdmUoJGJsb2NrLCBtb3ZlVG8sIG9mZnNldCkge1xuXHRcdHZhciBcblx0XHRcdG1vdmVUbyA9IG1vdmVUbyB8fCAndG9wJyxcblx0XHRcdG9mZnNldCA9IG9mZnNldCB8fCAtMTAwMDtcblxuXHRcdCRibG9jay5jc3MobW92ZVRvLCBvZmZzZXQpLmZhZGVPdXQoMTAwLCBmdW5jdGlvbigpIHtcblx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyDQntC/0YDQtdC00LXQu9C10L3QuNC1INGB0L/QvtGB0L7QsdCwINC/0LXRgNC10LzQtdGJ0LXQvdC40Y9cblx0ZnVuY3Rpb24gZmFkZUJsb2NrKCRibG9jaywgYW5pbWF0aW9uLCBjYWxsYmFjaykgeyAvLyBhbmltYXRpb24g0LzQvtC20LXRgiDQsdGL0YLRjCAxPXVwLCAyPXJpZ2h0XG5cdFx0dmFyIGFuaW1hdGlvbiA9IGFuaW1hdGlvbiB8fCAxO1xuXG5cdFx0c3dpdGNoIChhbmltYXRpb24pIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0YmxvY2tNb3ZlKCRibG9jaywgJ3RvcCcpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRibG9ja01vdmUoJGJsb2NrLCAncmlnaHQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0aWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cdH1cbn0pKCk7XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
