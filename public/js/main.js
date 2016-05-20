// Обработчик ошибок
function ErrorHandler(classErrWindow, templatePopUp) {
	this.timeHide       = 2000;
	this.classErrWindow = classErrWindow;
	this.templatePopUp  = templatePopUp;
}

// Рендеринг шаблона ошибок
ErrorHandler.prototype.newError = function(errorObject) {
	return this.templatePopUp(errorObject);
};

// Скрываем и удаляем плашку ошибки через timeHide 
ErrorHandler.prototype.hideErrorWindow = function() {
	var _errWindow = $(this.classErrWindow);

	setTimeout(function(){
		_errWindow.fadeOut(this.timeHide, function() {
			_errWindow.remove();
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
function Slider(slider, options) {
	this.$slider            = slider;
	this.$arrSlides         = this.$slider.children();
	this.$arrSlidesDef      = this.$arrSlides;
	this.countSlides        = this.$arrSlides.length - 1;
	this.settings           = $.extend({
	  activeClass    : 'slider-active',
	  ballsBlock     : 'slider-navigation',
	  ballsClass     : 'slider-navigation-circle',
	  activePos      : 0,
	  timeStep       : 7000,
	  slideWidth     : this.$arrSlides.outerWidth(),
	  arrows         : true
	}, options);
	this.slideWidth         = this.settings.slideWidth;
	this.indexActiveSlide   = this.settings.activePos + 2;
	this.slideStartIndex    = 2;
	this.slideEndIndex      = this.countSlides - 1;
	this.ballsBlock         = $('.' + this.settings.ballsBlock);
	this.arrayNavigElements = this.ballsBlock.children('.' + this.settings.ballsClass);
	this.arrNavElLength     = this.arrayNavigElements.length;
	this.ballActivePos      = this.settings.activePos;
	this.interval;
}

// Поставить прозрачную плашку на body, 
// чтоб во время плавного перемещения нельзя было ещё раз 
// нажать на кнопку перемещения
Slider.prototype.cancelClick = function() {
	$('body').addClass('body-bg');
	setTimeout(function() {
		$('body').removeClass('body-bg');
	}, 500);
};

// Добавляем кнопки передвижения, если в опциях указано arrows: true (по умолч)
Slider.prototype.addArrows = function() {
	if(this.settings.arrows){
		this.$slider.after('<a href="#" data-slide="1" class="slider-arrow"></a><a href="#" data-slide="-1" class="slider-arrow"></a>');
	}
};

// Установить астивный класс на слайд
// Слайд вычисляется по индексу, где индекс - это activePos в options
// И перемещается на активный слайд
Slider.prototype.setActiveSlide = function() {
	this.$slider.children('*[data-item="'+ this.settings.activePos +'"]').addClass(this.settings.activeClass);
	this.move(this.indexActiveSlide);
};

// Узнать индекс текущего активного слайда
Slider.prototype.getIndexActiveSlide = function() {
	return this.$slider.children('.' + this.settings.activeClass).index();
};

// Сбросить со всех слайдов активный класс
// Поставить активный класс на след слайд (nextSlide - след. индекс)
Slider.prototype.changeActiveSlide = function(nextSlide) {
	this.$arrSlides.siblings().removeClass(this.settings.activeClass);
	this.$arrSlides.eq(nextSlide).addClass(this.settings.activeClass);
};

// Незаметное перемещение слайдера
// Делается для того, чтобы переместить слайдер, когда 
// он достиг или последнего, или первого слайда
Slider.prototype.invisibleMoveSlider = function(indexPosition, movingPosition) {
	var _this = this;
	this.move(indexPosition, function() {
		_this.$slider.css({
			'left': -_this.slideWidth * movingPosition
		});
		_this.changeActiveSlide(movingPosition);
	});
};

// Проверка индекса след слайда
Slider.prototype.checkSlide = function(dataSlide) {
	var _dataSlide = dataSlide || 1,
		  _nextSlide = this.getIndexActiveSlide() + _dataSlide;

	if (_nextSlide == this.slideEndIndex) {
		this.invisibleMoveSlider(_nextSlide, this.slideStartIndex);
		this.ballActivePos = 0;
	} else if (_nextSlide == (this.slideStartIndex-1)) {
		this.invisibleMoveSlider(_nextSlide, this.slideEndIndex-1);	
		this.ballActivePos = this.arrNavElLength - 1;
	}	else {
		this.move(_nextSlide);
		this.changeActiveSlide(_nextSlide);
		this.ballActivePos = _nextSlide - 2;
	}	

	this.ballsSetActive(this.ballActivePos, false);
};

// Плавное перемещение слайдера
// Параметры: indexPos - индекс активного слайда
Slider.prototype.move = function(indexPos, callback) {
	var _this = this;
	this.$slider.transition({
		'left': -_this.slideWidth * indexPos
	}, 500, function() {
		if (callback && typeof callback == 'function') callback();
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
	var _ballsClass        = this.settings.ballsClass,
		  _ballsClassActive  = _ballsClass + '-active',
		  _arrayBalls        = this.arrayNavigElements;

	for (var i = 0; i < _arrayBalls.length; i++) {
		if (_arrayBalls.eq(i).hasClass(_ballsClass)) {
			_arrayBalls.eq(i).removeClass(_ballsClassActive);
		}
	}

	_arrayBalls.eq(dataSlide).addClass(_ballsClassActive);

	this.ballActivePos = dataSlide + 1;

	if (moveSlider) {
		this.move(dataSlide + 2);
		this.changeActiveSlide(dataSlide + 2);
	}
};

// Обработчик клика на кнопки переключения
Slider.prototype.ClickHandler = function() {
	var _this = this;

	$(document).on('click', '.slider-arrow', function() {
		var _dataSlide = parseInt($(this).data('slide'));
		clearInterval(_this.interval);

		_this.cancelClick();
		_this.checkSlide(_dataSlide);
		_this.ballsSetActive(_this.ballActivePos-1, false); // ballActivePos - 1, тк при перемещении слайдера он увеличился на 1 

		_this.interval = _this.startTimer(_this.interval);

		return false;
	});

	$(document).on('click', '.slider-navigation-circle', function() {
		var _dataSlide = parseInt($(this).data('slide'));
		clearInterval(_this.interval);

		_this.ballsSetActive(_dataSlide, true);

		_this.interval = _this.startTimer(_this.interval);

		return false;
	});
};

// Инициализация слайдера
Slider.prototype.initSlider = function(){
	var _this = this;
	if ((this.settings.activePos > this.$arrSlidesDef.length) || (this.settings.activePos < 0)) {
		throw new Error('Active position undefined');
	}

	if (this.countSlides === 0) {
		this.ballsSetActive(this.settings.activePos);
		return false;
	}

	this.addArrows();
	this.setActiveSlide();	
	this.ClickHandler();
	this.ballsSetActive(this.settings.activePos);

	this.interval = this.startTimer(this.interval);

	setTimeout(function() {
		_this.$slider.css('opacity', 1);
	}, 500);
};

function PrevSlider(arrayUrls) {
	this.arrayUrls = arrayUrls;
	this.arrLength = arrayUrls.length;
}

// Удаляем из строки лишние символы
PrevSlider.prototype.deleteTabs = function() {
	var _arrayUrls = this.arrayUrls;
	return _arrayUrls.replace(/\s|\[|\]|\'|\'/g, '');
};

// Формируем из строки массив
PrevSlider.prototype.stringToArray = function() {
	var _inputString = this.deleteTabs();

	if (_inputString === '') return false;
	_inputString = _inputString.split(',');

	return _inputString;
};

// Формируем массив объектов 
// На вход индекс активного слайда(тот, который будет показываться первым)
PrevSlider.prototype.arrayToArrObjs = function() {
	var _arrObjects  = [],
		  _arrUrls     = this.stringToArray();

	for (var i = 0; i < _arrUrls.length; i++) {
		_arrObjects[i] = { 
			foto: _arrUrls[i],
			comment: '',
			link: ''
		};
	}
	
	return _arrObjects;
};

// Копирование массива объектов.
// Для того, чтоб можно было перемещаться между шагами
PrevSlider.prototype.copyArrayObjs = function(arrayObjs) {
	if (!arrayObjs || 'object' !== typeof arrayObjs) {	
	  return arrayObjs;
	}

	var _newArray = ('function' === typeof arrayObjs.pop) ? [] : {};
	var _prop, _value;

	for (_prop in arrayObjs) {
		if (arrayObjs.hasOwnProperty(_prop)) {
		  _value = arrayObjs[_prop];
		  if (_value && 'object' === typeof _value) {
			    _newArray[_prop] = this.copyArrayObjs(_value);
			  } else {
			    _newArray[_prop] = _value;
			  }
	    }
		}

	return _newArray;

	 // return [].concat(arrayObjs); // если надо будет сохранять уже записанные поля
};
$(document).ready(function() {

	var templates = {
		inputLinks: Handlebars.compile($('#inputLinks').html()),
		error:      Handlebars.compile($('#errorPopUp').html()),
		prewiews:   Handlebars.compile($('#prewiews').html()),
		sliderList: Handlebars.compile($('#sliderList').html())
	};

	var storeTemplates = {}; // Хранилище копий объектов для того, чтоб можно было перемещаться по шагам

	var errorHandler = new ErrorHandler('.errMes', templates.error),
		  prevSlider,
		  activeIndex,
		  $activeRadioBtn,
		  objSlides;

	$(document).on('click', '.wr-form_datas-btn', function() {
		var inputStr  = $('.wr-form_datas-inp').val();
		
		prevSlider  = new PrevSlider(inputStr);
		objSlides   = prevSlider.arrayToArrObjs(); 

		storeTemplates.prewiews = prevSlider.copyArrayObjs(objSlides);

		if (!objSlides.length) {
			errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Введите данные'
			}, 'Datas is empty');
		}

		fadeBlock($('.wr-form_datas'), 2, function() {
			$('.wrapper').prepend(templates.prewiews(objSlides)).fadeIn(500);
		});
		
		return false;
	});

	$(document).on('click', '.wr-block-delete', function() {
		var item      = $(this).data('item'),
			  winScrTop = $(window).scrollTop();

		objSlides.splice(item, 1);

		$('.wrapper').html('').append(templates.prewiews(objSlides));
		$(window).scrollTop(winScrTop);

		return false;
	});

	$(document).on('change', '.wr-block-select_active-radio', function() {	
		activeIndex = parseInt($(this).val());
	});

	$(document).on('change', '.wr-block-comment-lb-inp', function() {
		var numberComment = parseInt($(this).data('comment')),
			  textComment   = $(this).val();

		objSlides[numberComment].comment = textComment;
	});

	$(document).on('change', '.wr-block-link-lb-inp', function() {
		var numberComment = parseInt($(this).data('link')),
			 textComment   = $(this).val();

		objSlides[numberComment].link = textComment;
	});

	$(document).on('click', '.generate-slider', function() {
		activeIndex = (activeIndex === undefined) ? 0 : activeIndex;

		if (!objSlides.length) {
			errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Нет ни одного слайда'
			}, 'Datas is empty');
		}

		fadeBlock($('.wr-blocks-w'), 1, function() {
			$('.wrapper').append(templates.sliderList(objSlides)).fadeIn(500, function() {	

				var slider = new Slider($('.slider'), {
					activeClass: 'slider-active',
					activePos: activeIndex
				});

				slider.initSlider();
			});
		});
	});

	$(document).on('click', '.step-down', function() {
		var toBlock = $(this).data('to');

		objSlides = prevSlider.copyArrayObjs(storeTemplates[toBlock]);
		activeIndex = 0;
		$('.wrapper').html( returnBlock( toBlock, templates, storeTemplates[toBlock] ));
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
		var moveTo = moveTo || 'top',
			offset = offset || -1000;
		$block.css(moveTo, offset).fadeOut(100, function() {
			$(this).remove();
		});
	}

	// Определение способа перемещения
	function fadeBlock($block, animation, callback) { // animation может быть 1=up, 2=right
		var animation      = animation || 1;

		switch(animation) {
			case 1:
				blockMove($block, 'top');
				break;

			case 2:
				blockMove($block, 'right');
				break;
		}
		if(callback && typeof callback == 'function') callback();
	}

	// Хелпер, который добавляет 2 последовательных слайда 
	// position - начало позиции слайда, который надо добавить, obj - сам слайд
	Handlebars.registerHelper('addSlides', function(obj, position) {
		var returningStr = '',
			position     = position - 2;

		if (obj.length < 2) return false;

		for (var i = 2, j = position; i > 0; i--, j++ ) { 
			returningStr += '<li class="slider-img""><img src="' + obj[j].foto + '" alt=""/>';
			
			if (obj[j].comment.length) {
				returningStr += '<div class="slider-img-comment">' + obj[j].comment + '</div>';
				returningStr += '</li>';
			}
		}
		
		return new Handlebars.SafeString(returningStr);
	});

	// Если есть поле link, то обернуть контекст в ссылку
	Handlebars.registerHelper('wrapLink', function(link, options) {
		var returningStr;

		if (link.length) {
			returningStr = '<a href="'+ link +'">' + options.fn(this) + '</a>';
			return returningStr;
		}

		return options.fn(this);
	});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwicHJldlNsaWRlci5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g0J7QsdGA0LDQsdC+0YLRh9C40Log0L7RiNC40LHQvtC6XHJcbmZ1bmN0aW9uIEVycm9ySGFuZGxlcihjbGFzc0VycldpbmRvdywgdGVtcGxhdGVQb3BVcCkge1xyXG5cdHRoaXMudGltZUhpZGUgICAgICAgPSAyMDAwO1xyXG5cdHRoaXMuY2xhc3NFcnJXaW5kb3cgPSBjbGFzc0VycldpbmRvdztcclxuXHR0aGlzLnRlbXBsYXRlUG9wVXAgID0gdGVtcGxhdGVQb3BVcDtcclxufVxyXG5cclxuLy8g0KDQtdC90LTQtdGA0LjQvdCzINGI0LDQsdC70L7QvdCwINC+0YjQuNCx0L7QulxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLm5ld0Vycm9yID0gZnVuY3Rpb24oZXJyb3JPYmplY3QpIHtcclxuXHRyZXR1cm4gdGhpcy50ZW1wbGF0ZVBvcFVwKGVycm9yT2JqZWN0KTtcclxufTtcclxuXHJcbi8vINCh0LrRgNGL0LLQsNC10Lwg0Lgg0YPQtNCw0LvRj9C10Lwg0L/Qu9Cw0YjQutGDINC+0YjQuNCx0LrQuCDRh9C10YDQtdC3IHRpbWVIaWRlIFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmhpZGVFcnJvcldpbmRvdyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBfZXJyV2luZG93ID0gJCh0aGlzLmNsYXNzRXJyV2luZG93KTtcclxuXHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0X2VycldpbmRvdy5mYWRlT3V0KHRoaXMudGltZUhpZGUsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRfZXJyV2luZG93LnJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblx0fSwgdGhpcy50aW1lSGlkZSk7XHJcbn07XHJcblxyXG4vLyDQn9GA0Lgg0LLQvtC30L3QuNC60L3QvtCy0LXQvdC40Lgg0L7RiNC40LHQutC4INCy0YvQstC10YHRgtC4INC/0LvQsNGI0LrRgyDQuCDRg9C00LDQu9C40YLRjFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmNhdWdodEVyciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHQkKCdib2R5JykuYXBwZW5kKHRoaXMubmV3RXJyb3Iob3B0aW9ucykpO1xyXG5cdHRoaXMuaGlkZUVycm9yV2luZG93KCk7XHJcbn07XHJcblxyXG4vLyDQpNGD0L3QutGG0LjRjyDQstGL0LfQvtCy0LAg0L7RiNC40LHQutC4XHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuZ2VuZXJhdGVFcnJvciA9IGZ1bmN0aW9uKGVycm9yT3B0LCBjb25zb2xlTWVzc2FnZSkge1xyXG5cdHRoaXMuY2F1Z2h0RXJyKGVycm9yT3B0KTtcclxuXHR0aHJvdyBuZXcgRXJyb3IoY29uc29sZU1lc3NhZ2UgfHwgJ0Vycm9yJyk7XHJcbn07IiwiZnVuY3Rpb24gU2xpZGVyKHNsaWRlciwgb3B0aW9ucykge1xuXHR0aGlzLiRzbGlkZXIgICAgICAgICAgICA9IHNsaWRlcjtcblx0dGhpcy4kYXJyU2xpZGVzICAgICAgICAgPSB0aGlzLiRzbGlkZXIuY2hpbGRyZW4oKTtcblx0dGhpcy4kYXJyU2xpZGVzRGVmICAgICAgPSB0aGlzLiRhcnJTbGlkZXM7XG5cdHRoaXMuY291bnRTbGlkZXMgICAgICAgID0gdGhpcy4kYXJyU2xpZGVzLmxlbmd0aCAtIDE7XG5cdHRoaXMuc2V0dGluZ3MgICAgICAgICAgID0gJC5leHRlbmQoe1xuXHQgIGFjdGl2ZUNsYXNzICAgIDogJ3NsaWRlci1hY3RpdmUnLFxuXHQgIGJhbGxzQmxvY2sgICAgIDogJ3NsaWRlci1uYXZpZ2F0aW9uJyxcblx0ICBiYWxsc0NsYXNzICAgICA6ICdzbGlkZXItbmF2aWdhdGlvbi1jaXJjbGUnLFxuXHQgIGFjdGl2ZVBvcyAgICAgIDogMCxcblx0ICB0aW1lU3RlcCAgICAgICA6IDcwMDAsXG5cdCAgc2xpZGVXaWR0aCAgICAgOiB0aGlzLiRhcnJTbGlkZXMub3V0ZXJXaWR0aCgpLFxuXHQgIGFycm93cyAgICAgICAgIDogdHJ1ZVxuXHR9LCBvcHRpb25zKTtcblx0dGhpcy5zbGlkZVdpZHRoICAgICAgICAgPSB0aGlzLnNldHRpbmdzLnNsaWRlV2lkdGg7XG5cdHRoaXMuaW5kZXhBY3RpdmVTbGlkZSAgID0gdGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgKyAyO1xuXHR0aGlzLnNsaWRlU3RhcnRJbmRleCAgICA9IDI7XG5cdHRoaXMuc2xpZGVFbmRJbmRleCAgICAgID0gdGhpcy5jb3VudFNsaWRlcyAtIDE7XG5cdHRoaXMuYmFsbHNCbG9jayAgICAgICAgID0gJCgnLicgKyB0aGlzLnNldHRpbmdzLmJhbGxzQmxvY2spO1xuXHR0aGlzLmFycmF5TmF2aWdFbGVtZW50cyA9IHRoaXMuYmFsbHNCbG9jay5jaGlsZHJlbignLicgKyB0aGlzLnNldHRpbmdzLmJhbGxzQ2xhc3MpO1xuXHR0aGlzLmFyck5hdkVsTGVuZ3RoICAgICA9IHRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzLmxlbmd0aDtcblx0dGhpcy5iYWxsQWN0aXZlUG9zICAgICAgPSB0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcztcblx0dGhpcy5pbnRlcnZhbDtcbn1cblxuLy8g0J/QvtGB0YLQsNCy0LjRgtGMINC/0YDQvtC30YDQsNGH0L3Rg9GOINC/0LvQsNGI0LrRgyDQvdCwIGJvZHksIFxuLy8g0YfRgtC+0LEg0LLQviDQstGA0LXQvNGPINC/0LvQsNCy0L3QvtCz0L4g0L/QtdGA0LXQvNC10YnQtdC90LjRjyDQvdC10LvRjNC30Y8g0LHRi9C70L4g0LXRidGRINGA0LDQtyBcbi8vINC90LDQttCw0YLRjCDQvdCwINC60L3QvtC/0LrRgyDQv9C10YDQtdC80LXRidC10L3QuNGPXG5TbGlkZXIucHJvdG90eXBlLmNhbmNlbENsaWNrID0gZnVuY3Rpb24oKSB7XG5cdCQoJ2JvZHknKS5hZGRDbGFzcygnYm9keS1iZycpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdCQoJ2JvZHknKS5yZW1vdmVDbGFzcygnYm9keS1iZycpO1xuXHR9LCA1MDApO1xufTtcblxuLy8g0JTQvtCx0LDQstC70Y/QtdC8INC60L3QvtC/0LrQuCDQv9C10YDQtdC00LLQuNC20LXQvdC40Y8sINC10YHQu9C4INCyINC+0L/RhtC40Y/RhSDRg9C60LDQt9Cw0L3QviBhcnJvd3M6IHRydWUgKNC/0L4g0YPQvNC+0LvRhylcblNsaWRlci5wcm90b3R5cGUuYWRkQXJyb3dzID0gZnVuY3Rpb24oKSB7XG5cdGlmKHRoaXMuc2V0dGluZ3MuYXJyb3dzKXtcblx0XHR0aGlzLiRzbGlkZXIuYWZ0ZXIoJzxhIGhyZWY9XCIjXCIgZGF0YS1zbGlkZT1cIjFcIiBjbGFzcz1cInNsaWRlci1hcnJvd1wiPjwvYT48YSBocmVmPVwiI1wiIGRhdGEtc2xpZGU9XCItMVwiIGNsYXNzPVwic2xpZGVyLWFycm93XCI+PC9hPicpO1xuXHR9XG59O1xuXG4vLyDQo9GB0YLQsNC90L7QstC40YLRjCDQsNGB0YLQuNCy0L3Ri9C5INC60LvQsNGB0YEg0L3QsCDRgdC70LDQudC0XG4vLyDQodC70LDQudC0INCy0YvRh9C40YHQu9GP0LXRgtGB0Y8g0L/QviDQuNC90LTQtdC60YHRgywg0LPQtNC1INC40L3QtNC10LrRgSAtINGN0YLQviBhY3RpdmVQb3Mg0LIgb3B0aW9uc1xuLy8g0Jgg0L/QtdGA0LXQvNC10YnQsNC10YLRgdGPINC90LAg0LDQutGC0LjQstC90YvQuSDRgdC70LDQudC0XG5TbGlkZXIucHJvdG90eXBlLnNldEFjdGl2ZVNsaWRlID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuJHNsaWRlci5jaGlsZHJlbignKltkYXRhLWl0ZW09XCInKyB0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyArJ1wiXScpLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHR0aGlzLm1vdmUodGhpcy5pbmRleEFjdGl2ZVNsaWRlKTtcbn07XG5cbi8vINCj0LfQvdCw0YLRjCDQuNC90LTQtdC60YEg0YLQtdC60YPRidC10LPQviDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmdldEluZGV4QWN0aXZlU2xpZGUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuJHNsaWRlci5jaGlsZHJlbignLicgKyB0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKS5pbmRleCgpO1xufTtcblxuLy8g0KHQsdGA0L7RgdC40YLRjCDRgdC+INCy0YHQtdGFINGB0LvQsNC50LTQvtCyINCw0LrRgtC40LLQvdGL0Lkg0LrQu9Cw0YHRgVxuLy8g0J/QvtGB0YLQsNCy0LjRgtGMINCw0LrRgtC40LLQvdGL0Lkg0LrQu9Cw0YHRgSDQvdCwINGB0LvQtdC0INGB0LvQsNC50LQgKG5leHRTbGlkZSAtINGB0LvQtdC0LiDQuNC90LTQtdC60YEpXG5TbGlkZXIucHJvdG90eXBlLmNoYW5nZUFjdGl2ZVNsaWRlID0gZnVuY3Rpb24obmV4dFNsaWRlKSB7XG5cdHRoaXMuJGFyclNsaWRlcy5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHR0aGlzLiRhcnJTbGlkZXMuZXEobmV4dFNsaWRlKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbn07XG5cbi8vINCd0LXQt9Cw0LzQtdGC0L3QvtC1INC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxuLy8g0JTQtdC70LDQtdGC0YHRjyDQtNC70Y8g0YLQvtCz0L4sINGH0YLQvtCx0Ysg0L/QtdGA0LXQvNC10YHRgtC40YLRjCDRgdC70LDQudC00LXRgCwg0LrQvtCz0LTQsCBcbi8vINC+0L0g0LTQvtGB0YLQuNCzINC40LvQuCDQv9C+0YHQu9C10LTQvdC10LPQviwg0LjQu9C4INC/0LXRgNCy0L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5pbnZpc2libGVNb3ZlU2xpZGVyID0gZnVuY3Rpb24oaW5kZXhQb3NpdGlvbiwgbW92aW5nUG9zaXRpb24pIHtcblx0dmFyIF90aGlzID0gdGhpcztcblx0dGhpcy5tb3ZlKGluZGV4UG9zaXRpb24sIGZ1bmN0aW9uKCkge1xuXHRcdF90aGlzLiRzbGlkZXIuY3NzKHtcblx0XHRcdCdsZWZ0JzogLV90aGlzLnNsaWRlV2lkdGggKiBtb3ZpbmdQb3NpdGlvblxuXHRcdH0pO1xuXHRcdF90aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKG1vdmluZ1Bvc2l0aW9uKTtcblx0fSk7XG59O1xuXG4vLyDQn9GA0L7QstC10YDQutCwINC40L3QtNC10LrRgdCwINGB0LvQtdC0INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5jaGVja1NsaWRlID0gZnVuY3Rpb24oZGF0YVNsaWRlKSB7XG5cdHZhciBfZGF0YVNsaWRlID0gZGF0YVNsaWRlIHx8IDEsXG5cdFx0ICBfbmV4dFNsaWRlID0gdGhpcy5nZXRJbmRleEFjdGl2ZVNsaWRlKCkgKyBfZGF0YVNsaWRlO1xuXG5cdGlmIChfbmV4dFNsaWRlID09IHRoaXMuc2xpZGVFbmRJbmRleCkge1xuXHRcdHRoaXMuaW52aXNpYmxlTW92ZVNsaWRlcihfbmV4dFNsaWRlLCB0aGlzLnNsaWRlU3RhcnRJbmRleCk7XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gMDtcblx0fSBlbHNlIGlmIChfbmV4dFNsaWRlID09ICh0aGlzLnNsaWRlU3RhcnRJbmRleC0xKSkge1xuXHRcdHRoaXMuaW52aXNpYmxlTW92ZVNsaWRlcihfbmV4dFNsaWRlLCB0aGlzLnNsaWRlRW5kSW5kZXgtMSk7XHRcblx0XHR0aGlzLmJhbGxBY3RpdmVQb3MgPSB0aGlzLmFyck5hdkVsTGVuZ3RoIC0gMTtcblx0fVx0ZWxzZSB7XG5cdFx0dGhpcy5tb3ZlKF9uZXh0U2xpZGUpO1xuXHRcdHRoaXMuY2hhbmdlQWN0aXZlU2xpZGUoX25leHRTbGlkZSk7XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gX25leHRTbGlkZSAtIDI7XG5cdH1cdFxuXG5cdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5iYWxsQWN0aXZlUG9zLCBmYWxzZSk7XG59O1xuXG4vLyDQn9C70LDQstC90L7QtSDQv9C10YDQtdC80LXRidC10L3QuNC1INGB0LvQsNC50LTQtdGA0LBcbi8vINCf0LDRgNCw0LzQtdGC0YDRizogaW5kZXhQb3MgLSDQuNC90LTQtdC60YEg0LDQutGC0LjQstC90L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oaW5kZXhQb3MsIGNhbGxiYWNrKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHRoaXMuJHNsaWRlci50cmFuc2l0aW9uKHtcblx0XHQnbGVmdCc6IC1fdGhpcy5zbGlkZVdpZHRoICogaW5kZXhQb3Ncblx0fSwgNTAwLCBmdW5jdGlvbigpIHtcblx0XHRpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIGNhbGxiYWNrKCk7XG5cdH0pO1x0XG59O1xuXG4vLyDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDRgtCw0LnQvNC10YDQsCDQtNC70Y8g0LDQstGC0L7QvdC+0LzQvdC+0LPQviDQv9C10YDQtdC80LXRidC10L3QuNGPINGB0LvQsNC50LTQtdGA0LBcblNsaWRlci5wcm90b3R5cGUuc3RhcnRUaW1lciA9IGZ1bmN0aW9uKHRpbWVyLCBmdW5jKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHJldHVybiBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0X3RoaXMuY2hlY2tTbGlkZSgpO1xuXHRcdFx0fSwgX3RoaXMuc2V0dGluZ3MudGltZVN0ZXApO1xufTtcblxuLy8g0KDQsNCx0L7RgtCwINGBINC90LjQttC90LXQuSDQvdCw0LLQuNCz0LDRhtC40LXQuSjRg9GB0YLQsNC90L7QstC60LAsINC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0Log0YHQvtC+0YLQstC10YLRgdGC0LLRg9GO0YnQtdC80YMg0YjQsNGA0LjQutGDINGB0LvQsNC50LTRgylcblNsaWRlci5wcm90b3R5cGUuYmFsbHNTZXRBY3RpdmUgPSBmdW5jdGlvbihkYXRhU2xpZGUsIG1vdmVTbGlkZXIpIHtcblx0dmFyIF9iYWxsc0NsYXNzICAgICAgICA9IHRoaXMuc2V0dGluZ3MuYmFsbHNDbGFzcyxcblx0XHQgIF9iYWxsc0NsYXNzQWN0aXZlICA9IF9iYWxsc0NsYXNzICsgJy1hY3RpdmUnLFxuXHRcdCAgX2FycmF5QmFsbHMgICAgICAgID0gdGhpcy5hcnJheU5hdmlnRWxlbWVudHM7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBfYXJyYXlCYWxscy5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChfYXJyYXlCYWxscy5lcShpKS5oYXNDbGFzcyhfYmFsbHNDbGFzcykpIHtcblx0XHRcdF9hcnJheUJhbGxzLmVxKGkpLnJlbW92ZUNsYXNzKF9iYWxsc0NsYXNzQWN0aXZlKTtcblx0XHR9XG5cdH1cblxuXHRfYXJyYXlCYWxscy5lcShkYXRhU2xpZGUpLmFkZENsYXNzKF9iYWxsc0NsYXNzQWN0aXZlKTtcblxuXHR0aGlzLmJhbGxBY3RpdmVQb3MgPSBkYXRhU2xpZGUgKyAxO1xuXG5cdGlmIChtb3ZlU2xpZGVyKSB7XG5cdFx0dGhpcy5tb3ZlKGRhdGFTbGlkZSArIDIpO1xuXHRcdHRoaXMuY2hhbmdlQWN0aXZlU2xpZGUoZGF0YVNsaWRlICsgMik7XG5cdH1cbn07XG5cbi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6INC60LvQuNC60LAg0L3QsCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQutC70Y7Rh9C10L3QuNGPXG5TbGlkZXIucHJvdG90eXBlLkNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuc2xpZGVyLWFycm93JywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF9kYXRhU2xpZGUgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ3NsaWRlJykpO1xuXHRcdGNsZWFySW50ZXJ2YWwoX3RoaXMuaW50ZXJ2YWwpO1xuXG5cdFx0X3RoaXMuY2FuY2VsQ2xpY2soKTtcblx0XHRfdGhpcy5jaGVja1NsaWRlKF9kYXRhU2xpZGUpO1xuXHRcdF90aGlzLmJhbGxzU2V0QWN0aXZlKF90aGlzLmJhbGxBY3RpdmVQb3MtMSwgZmFsc2UpOyAvLyBiYWxsQWN0aXZlUG9zIC0gMSwg0YLQuiDQv9GA0Lgg0L/QtdGA0LXQvNC10YnQtdC90LjQuCDRgdC70LDQudC00LXRgNCwINC+0L0g0YPQstC10LvQuNGH0LjQu9GB0Y8g0L3QsCAxIFxuXG5cdFx0X3RoaXMuaW50ZXJ2YWwgPSBfdGhpcy5zdGFydFRpbWVyKF90aGlzLmludGVydmFsKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5zbGlkZXItbmF2aWdhdGlvbi1jaXJjbGUnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgX2RhdGFTbGlkZSA9IHBhcnNlSW50KCQodGhpcykuZGF0YSgnc2xpZGUnKSk7XG5cdFx0Y2xlYXJJbnRlcnZhbChfdGhpcy5pbnRlcnZhbCk7XG5cblx0XHRfdGhpcy5iYWxsc1NldEFjdGl2ZShfZGF0YVNsaWRlLCB0cnVlKTtcblxuXHRcdF90aGlzLmludGVydmFsID0gX3RoaXMuc3RhcnRUaW1lcihfdGhpcy5pbnRlcnZhbCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YHQu9Cw0LnQtNC10YDQsFxuU2xpZGVyLnByb3RvdHlwZS5pbml0U2xpZGVyID0gZnVuY3Rpb24oKXtcblx0dmFyIF90aGlzID0gdGhpcztcblx0aWYgKCh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA+IHRoaXMuJGFyclNsaWRlc0RlZi5sZW5ndGgpIHx8ICh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA8IDApKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgcG9zaXRpb24gdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRpZiAodGhpcy5jb3VudFNsaWRlcyA9PT0gMCkge1xuXHRcdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHRoaXMuYWRkQXJyb3dzKCk7XG5cdHRoaXMuc2V0QWN0aXZlU2xpZGUoKTtcdFxuXHR0aGlzLkNsaWNrSGFuZGxlcigpO1xuXHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zKTtcblxuXHR0aGlzLmludGVydmFsID0gdGhpcy5zdGFydFRpbWVyKHRoaXMuaW50ZXJ2YWwpO1xuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0X3RoaXMuJHNsaWRlci5jc3MoJ29wYWNpdHknLCAxKTtcblx0fSwgNTAwKTtcbn07XG4iLCJmdW5jdGlvbiBQcmV2U2xpZGVyKGFycmF5VXJscykge1xyXG5cdHRoaXMuYXJyYXlVcmxzID0gYXJyYXlVcmxzO1xyXG5cdHRoaXMuYXJyTGVuZ3RoID0gYXJyYXlVcmxzLmxlbmd0aDtcclxufVxyXG5cclxuLy8g0KPQtNCw0LvRj9C10Lwg0LjQtyDRgdGC0YDQvtC60Lgg0LvQuNGI0L3QuNC1INGB0LjQvNCy0L7Qu9GLXHJcblByZXZTbGlkZXIucHJvdG90eXBlLmRlbGV0ZVRhYnMgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgX2FycmF5VXJscyA9IHRoaXMuYXJyYXlVcmxzO1xyXG5cdHJldHVybiBfYXJyYXlVcmxzLnJlcGxhY2UoL1xcc3xcXFt8XFxdfFxcJ3xcXCcvZywgJycpO1xyXG59O1xyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC40Lcg0YHRgtGA0L7QutC4INC80LDRgdGB0LjQslxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5zdHJpbmdUb0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIF9pbnB1dFN0cmluZyA9IHRoaXMuZGVsZXRlVGFicygpO1xyXG5cclxuXHRpZiAoX2lucHV0U3RyaW5nID09PSAnJykgcmV0dXJuIGZhbHNlO1xyXG5cdF9pbnB1dFN0cmluZyA9IF9pbnB1dFN0cmluZy5zcGxpdCgnLCcpO1xyXG5cclxuXHRyZXR1cm4gX2lucHV0U3RyaW5nO1xyXG59O1xyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC80LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyIFxyXG4vLyDQndCwINCy0YXQvtC0INC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwKNGC0L7Rgiwg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDQv9C+0LrQsNC30YvQstCw0YLRjNGB0Y8g0L/QtdGA0LLRi9C8KVxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5hcnJheVRvQXJyT2JqcyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBfYXJyT2JqZWN0cyAgPSBbXSxcclxuXHRcdCAgX2FyclVybHMgICAgID0gdGhpcy5zdHJpbmdUb0FycmF5KCk7XHJcblxyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgX2FyclVybHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdF9hcnJPYmplY3RzW2ldID0geyBcclxuXHRcdFx0Zm90bzogX2FyclVybHNbaV0sXHJcblx0XHRcdGNvbW1lbnQ6ICcnLFxyXG5cdFx0XHRsaW5rOiAnJ1xyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIF9hcnJPYmplY3RzO1xyXG59O1xyXG5cclxuLy8g0JrQvtC/0LjRgNC+0LLQsNC90LjQtSDQvNCw0YHRgdC40LLQsCDQvtCx0YrQtdC60YLQvtCyLlxyXG4vLyDQlNC70Y8g0YLQvtCz0L4sINGH0YLQvtCxINC80L7QttC90L4g0LHRi9C70L4g0L/QtdGA0LXQvNC10YnQsNGC0YzRgdGPINC80LXQttC00YMg0YjQsNCz0LDQvNC4XHJcblByZXZTbGlkZXIucHJvdG90eXBlLmNvcHlBcnJheU9ianMgPSBmdW5jdGlvbihhcnJheU9ianMpIHtcclxuXHRpZiAoIWFycmF5T2JqcyB8fCAnb2JqZWN0JyAhPT0gdHlwZW9mIGFycmF5T2Jqcykge1x0XHJcblx0ICByZXR1cm4gYXJyYXlPYmpzO1xyXG5cdH1cclxuXHJcblx0dmFyIF9uZXdBcnJheSA9ICgnZnVuY3Rpb24nID09PSB0eXBlb2YgYXJyYXlPYmpzLnBvcCkgPyBbXSA6IHt9O1xyXG5cdHZhciBfcHJvcCwgX3ZhbHVlO1xyXG5cclxuXHRmb3IgKF9wcm9wIGluIGFycmF5T2Jqcykge1xyXG5cdFx0aWYgKGFycmF5T2Jqcy5oYXNPd25Qcm9wZXJ0eShfcHJvcCkpIHtcclxuXHRcdCAgX3ZhbHVlID0gYXJyYXlPYmpzW19wcm9wXTtcclxuXHRcdCAgaWYgKF92YWx1ZSAmJiAnb2JqZWN0JyA9PT0gdHlwZW9mIF92YWx1ZSkge1xyXG5cdFx0XHQgICAgX25ld0FycmF5W19wcm9wXSA9IHRoaXMuY29weUFycmF5T2JqcyhfdmFsdWUpO1xyXG5cdFx0XHQgIH0gZWxzZSB7XHJcblx0XHRcdCAgICBfbmV3QXJyYXlbX3Byb3BdID0gX3ZhbHVlO1xyXG5cdFx0XHQgIH1cclxuXHQgICAgfVxyXG5cdFx0fVxyXG5cclxuXHRyZXR1cm4gX25ld0FycmF5O1xyXG5cclxuXHQgLy8gcmV0dXJuIFtdLmNvbmNhdChhcnJheU9ianMpOyAvLyDQtdGB0LvQuCDQvdCw0LTQviDQsdGD0LTQtdGCINGB0L7RhdGA0LDQvdGP0YLRjCDRg9C20LUg0LfQsNC/0LjRgdCw0L3QvdGL0LUg0L/QvtC70Y9cclxufTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuXHR2YXIgdGVtcGxhdGVzID0ge1xuXHRcdGlucHV0TGlua3M6IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjaW5wdXRMaW5rcycpLmh0bWwoKSksXG5cdFx0ZXJyb3I6ICAgICAgSGFuZGxlYmFycy5jb21waWxlKCQoJyNlcnJvclBvcFVwJykuaHRtbCgpKSxcblx0XHRwcmV3aWV3czogICBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3ByZXdpZXdzJykuaHRtbCgpKSxcblx0XHRzbGlkZXJMaXN0OiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3NsaWRlckxpc3QnKS5odG1sKCkpXG5cdH07XG5cblx0dmFyIHN0b3JlVGVtcGxhdGVzID0ge307IC8vINCl0YDQsNC90LjQu9C40YnQtSDQutC+0L/QuNC5INC+0LHRitC10LrRgtC+0LIg0LTQu9GPINGC0L7Qs9C+LCDRh9GC0L7QsSDQvNC+0LbQvdC+INCx0YvQu9C+INC/0LXRgNC10LzQtdGJ0LDRgtGM0YHRjyDQv9C+INGI0LDQs9Cw0LxcblxuXHR2YXIgZXJyb3JIYW5kbGVyID0gbmV3IEVycm9ySGFuZGxlcignLmVyck1lcycsIHRlbXBsYXRlcy5lcnJvciksXG5cdFx0ICBwcmV2U2xpZGVyLFxuXHRcdCAgYWN0aXZlSW5kZXgsXG5cdFx0ICAkYWN0aXZlUmFkaW9CdG4sXG5cdFx0ICBvYmpTbGlkZXM7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy53ci1mb3JtX2RhdGFzLWJ0bicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpbnB1dFN0ciAgPSAkKCcud3ItZm9ybV9kYXRhcy1pbnAnKS52YWwoKTtcblx0XHRcblx0XHRwcmV2U2xpZGVyICA9IG5ldyBQcmV2U2xpZGVyKGlucHV0U3RyKTtcblx0XHRvYmpTbGlkZXMgICA9IHByZXZTbGlkZXIuYXJyYXlUb0Fyck9ianMoKTsgXG5cblx0XHRzdG9yZVRlbXBsYXRlcy5wcmV3aWV3cyA9IHByZXZTbGlkZXIuY29weUFycmF5T2JqcyhvYmpTbGlkZXMpO1xuXG5cdFx0aWYgKCFvYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRlcnJvckhhbmRsZXIuZ2VuZXJhdGVFcnJvcih7XG5cdFx0XHRcdHRpdGxlOiAn0J7RiNC40LHQutCwJywgXG5cdFx0XHRcdG1lc3NhZ2U6ICfQktCy0LXQtNC40YLQtSDQtNCw0L3QvdGL0LUnXG5cdFx0XHR9LCAnRGF0YXMgaXMgZW1wdHknKTtcblx0XHR9XG5cblx0XHRmYWRlQmxvY2soJCgnLndyLWZvcm1fZGF0YXMnKSwgMiwgZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCcud3JhcHBlcicpLnByZXBlbmQodGVtcGxhdGVzLnByZXdpZXdzKG9ialNsaWRlcykpLmZhZGVJbig1MDApO1xuXHRcdH0pO1xuXHRcdFxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy53ci1ibG9jay1kZWxldGUnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgaXRlbSAgICAgID0gJCh0aGlzKS5kYXRhKCdpdGVtJyksXG5cdFx0XHQgIHdpblNjclRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuXHRcdG9ialNsaWRlcy5zcGxpY2UoaXRlbSwgMSk7XG5cblx0XHQkKCcud3JhcHBlcicpLmh0bWwoJycpLmFwcGVuZCh0ZW1wbGF0ZXMucHJld2lld3Mob2JqU2xpZGVzKSk7XG5cdFx0JCh3aW5kb3cpLnNjcm9sbFRvcCh3aW5TY3JUb3ApO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy53ci1ibG9jay1zZWxlY3RfYWN0aXZlLXJhZGlvJywgZnVuY3Rpb24oKSB7XHRcblx0XHRhY3RpdmVJbmRleCA9IHBhcnNlSW50KCQodGhpcykudmFsKCkpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy53ci1ibG9jay1jb21tZW50LWxiLWlucCcsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBudW1iZXJDb21tZW50ID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdjb21tZW50JykpLFxuXHRcdFx0ICB0ZXh0Q29tbWVudCAgID0gJCh0aGlzKS52YWwoKTtcblxuXHRcdG9ialNsaWRlc1tudW1iZXJDb21tZW50XS5jb21tZW50ID0gdGV4dENvbW1lbnQ7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLndyLWJsb2NrLWxpbmstbGItaW5wJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG51bWJlckNvbW1lbnQgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2xpbmsnKSksXG5cdFx0XHQgdGV4dENvbW1lbnQgICA9ICQodGhpcykudmFsKCk7XG5cblx0XHRvYmpTbGlkZXNbbnVtYmVyQ29tbWVudF0ubGluayA9IHRleHRDb21tZW50O1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmdlbmVyYXRlLXNsaWRlcicsIGZ1bmN0aW9uKCkge1xuXHRcdGFjdGl2ZUluZGV4ID0gKGFjdGl2ZUluZGV4ID09PSB1bmRlZmluZWQpID8gMCA6IGFjdGl2ZUluZGV4O1xuXG5cdFx0aWYgKCFvYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRlcnJvckhhbmRsZXIuZ2VuZXJhdGVFcnJvcih7XG5cdFx0XHRcdHRpdGxlOiAn0J7RiNC40LHQutCwJywgXG5cdFx0XHRcdG1lc3NhZ2U6ICfQndC10YIg0L3QuCDQvtC00L3QvtCz0L4g0YHQu9Cw0LnQtNCwJ1xuXHRcdFx0fSwgJ0RhdGFzIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0ZmFkZUJsb2NrKCQoJy53ci1ibG9ja3MtdycpLCAxLCBmdW5jdGlvbigpIHtcblx0XHRcdCQoJy53cmFwcGVyJykuYXBwZW5kKHRlbXBsYXRlcy5zbGlkZXJMaXN0KG9ialNsaWRlcykpLmZhZGVJbig1MDAsIGZ1bmN0aW9uKCkge1x0XG5cblx0XHRcdFx0dmFyIHNsaWRlciA9IG5ldyBTbGlkZXIoJCgnLnNsaWRlcicpLCB7XG5cdFx0XHRcdFx0YWN0aXZlQ2xhc3M6ICdzbGlkZXItYWN0aXZlJyxcblx0XHRcdFx0XHRhY3RpdmVQb3M6IGFjdGl2ZUluZGV4XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHNsaWRlci5pbml0U2xpZGVyKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5zdGVwLWRvd24nLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9CbG9jayA9ICQodGhpcykuZGF0YSgndG8nKTtcblxuXHRcdG9ialNsaWRlcyA9IHByZXZTbGlkZXIuY29weUFycmF5T2JqcyhzdG9yZVRlbXBsYXRlc1t0b0Jsb2NrXSk7XG5cdFx0YWN0aXZlSW5kZXggPSAwO1xuXHRcdCQoJy53cmFwcGVyJykuaHRtbCggcmV0dXJuQmxvY2soIHRvQmxvY2ssIHRlbXBsYXRlcywgc3RvcmVUZW1wbGF0ZXNbdG9CbG9ja10gKSk7XG5cdH0pO1xuXG5cdC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDRgNC10L3QtNC10YDQuNGCINGI0LDQsdC70L7QvSDQv9GA0Lgg0LLQvtC30LLRgNCw0YnQtdC90LjQuCDQuiDQv9GA0LXQtNGL0LTRg9GJ0LXQvNGDINGI0LDQs9GDXG5cdGZ1bmN0aW9uIHJldHVybkJsb2NrKG5hbWVUZW1wLCBteVRlbXBsYXRlcywgb3B0aW9ucykge1xuXHRcdHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmIChteVRlbXBsYXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lVGVtcCkpIHtcblx0XHRcdHJldHVybiBteVRlbXBsYXRlc1tuYW1lVGVtcF0ob3B0aW9ucyk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvLyDQn9C10YDQtdC80LXRidC10L3QuNC1INCx0LvQvtC60LAsINGBINC/0L7RgdC70LXQtNGD0Y7RidC40Lwg0LXQs9C+INGD0LTQsNC70LXQvdC40LXQvCDQuNC3IERPTVxuXHRmdW5jdGlvbiBibG9ja01vdmUoJGJsb2NrLCBtb3ZlVG8sIG9mZnNldCkge1xuXHRcdHZhciBtb3ZlVG8gPSBtb3ZlVG8gfHwgJ3RvcCcsXG5cdFx0XHRvZmZzZXQgPSBvZmZzZXQgfHwgLTEwMDA7XG5cdFx0JGJsb2NrLmNzcyhtb3ZlVG8sIG9mZnNldCkuZmFkZU91dCgxMDAsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vINCe0L/RgNC10LTQtdC70LXQvdC40LUg0YHQv9C+0YHQvtCx0LAg0L/QtdGA0LXQvNC10YnQtdC90LjRj1xuXHRmdW5jdGlvbiBmYWRlQmxvY2soJGJsb2NrLCBhbmltYXRpb24sIGNhbGxiYWNrKSB7IC8vIGFuaW1hdGlvbiDQvNC+0LbQtdGCINCx0YvRgtGMIDE9dXAsIDI9cmlnaHRcblx0XHR2YXIgYW5pbWF0aW9uICAgICAgPSBhbmltYXRpb24gfHwgMTtcblxuXHRcdHN3aXRjaChhbmltYXRpb24pIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0YmxvY2tNb3ZlKCRibG9jaywgJ3RvcCcpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRibG9ja01vdmUoJGJsb2NrLCAncmlnaHQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGlmKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSBjYWxsYmFjaygpO1xuXHR9XG5cblx0Ly8g0KXQtdC70L/QtdGALCDQutC+0YLQvtGA0YvQuSDQtNC+0LHQsNCy0LvRj9C10YIgMiDQv9C+0YHQu9C10LTQvtCy0LDRgtC10LvRjNC90YvRhSDRgdC70LDQudC00LAgXG5cdC8vIHBvc2l0aW9uIC0g0L3QsNGH0LDQu9C+INC/0L7Qt9C40YbQuNC4INGB0LvQsNC50LTQsCwg0LrQvtGC0L7RgNGL0Lkg0L3QsNC00L4g0LTQvtCx0LDQstC40YLRjCwgb2JqIC0g0YHQsNC8INGB0LvQsNC50LRcblx0SGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYWRkU2xpZGVzJywgZnVuY3Rpb24ob2JqLCBwb3NpdGlvbikge1xuXHRcdHZhciByZXR1cm5pbmdTdHIgPSAnJyxcblx0XHRcdHBvc2l0aW9uICAgICA9IHBvc2l0aW9uIC0gMjtcblxuXHRcdGlmIChvYmoubGVuZ3RoIDwgMikgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDIsIGogPSBwb3NpdGlvbjsgaSA+IDA7IGktLSwgaisrICkgeyBcblx0XHRcdHJldHVybmluZ1N0ciArPSAnPGxpIGNsYXNzPVwic2xpZGVyLWltZ1wiXCI+PGltZyBzcmM9XCInICsgb2JqW2pdLmZvdG8gKyAnXCIgYWx0PVwiXCIvPic7XG5cdFx0XHRcblx0XHRcdGlmIChvYmpbal0uY29tbWVudC5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuaW5nU3RyICs9ICc8ZGl2IGNsYXNzPVwic2xpZGVyLWltZy1jb21tZW50XCI+JyArIG9ialtqXS5jb21tZW50ICsgJzwvZGl2Pic7XG5cdFx0XHRcdHJldHVybmluZ1N0ciArPSAnPC9saT4nO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhyZXR1cm5pbmdTdHIpO1xuXHR9KTtcblxuXHQvLyDQldGB0LvQuCDQtdGB0YLRjCDQv9C+0LvQtSBsaW5rLCDRgtC+INC+0LHQtdGA0L3Rg9GC0Ywg0LrQvtC90YLQtdC60YHRgiDQsiDRgdGB0YvQu9C60YNcblx0SGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd3JhcExpbmsnLCBmdW5jdGlvbihsaW5rLCBvcHRpb25zKSB7XG5cdFx0dmFyIHJldHVybmluZ1N0cjtcblxuXHRcdGlmIChsaW5rLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuaW5nU3RyID0gJzxhIGhyZWY9XCInKyBsaW5rICsnXCI+JyArIG9wdGlvbnMuZm4odGhpcykgKyAnPC9hPic7XG5cdFx0XHRyZXR1cm4gcmV0dXJuaW5nU3RyO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuXHR9KTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
