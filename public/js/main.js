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

	setTimeout(function() {
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

Slider.prototype.changeOpacity = function() {
	var _this = this;

	setTimeout(function() {
		_this.$slider.css('opacity', 1);
	}, 500);
}

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
		this.changeOpacity();
		return false;
	}

	this.addArrows();
	this.setActiveSlide();	
	this.ClickHandler();
	this.ballsSetActive(this.settings.activePos);
	this.changeOpacity();
	this.interval = this.startTimer(this.interval);

	
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

	$(document).on('change', '.wr-block-select_active-radio', function() {	
		activeIndex = parseInt($(this).val());
	});

	$(document).on('click', '.wr-block-delete', function() {
		var item      = $(this).data('item'),
			  winScrTop = $(window).scrollTop();

		objSlides.splice(item, 1);

		$('.wrapper').html('').append(templates.prewiews(objSlides));
		$(window).scrollTop(winScrTop);

		// activeIndex = selectActiveAfterDel(item, activeIndex);
		// if (activeIndex != null) {
		// 	$('.wr-block').eq(activeIndex).find('.wr-block-select_active-text').trigger('click');
		// } else {
		// 	activeIndex = 0;
		// }

		return false;
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

	// Ищет активный слайд после удаления хоть одного превью
	function selectActiveAfterDel(item, activeIndex) {
		if (item == activeIndex) {
			return 0;
		} else if (item < activeIndex) {
			return activeIndex - 1;
		} else if (item > activeIndex){
			return activeIndex;
		} else {
			return null;
		}
	}

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

		if (obj.length < 2) return '';

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwicHJldlNsaWRlci5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6INC+0YjQuNCx0L7QulxyXG5mdW5jdGlvbiBFcnJvckhhbmRsZXIoY2xhc3NFcnJXaW5kb3csIHRlbXBsYXRlUG9wVXApIHtcclxuXHR0aGlzLnRpbWVIaWRlICAgICAgID0gMjAwMDtcclxuXHR0aGlzLmNsYXNzRXJyV2luZG93ID0gY2xhc3NFcnJXaW5kb3c7XHJcblx0dGhpcy50ZW1wbGF0ZVBvcFVwICA9IHRlbXBsYXRlUG9wVXA7XHJcbn1cclxuXHJcbi8vINCg0LXQvdC00LXRgNC40L3QsyDRiNCw0LHQu9C+0L3QsCDQvtGI0LjQsdC+0LpcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5uZXdFcnJvciA9IGZ1bmN0aW9uKGVycm9yT2JqZWN0KSB7XHJcblx0cmV0dXJuIHRoaXMudGVtcGxhdGVQb3BVcChlcnJvck9iamVjdCk7XHJcbn07XHJcblxyXG4vLyDQodC60YDRi9Cy0LDQtdC8INC4INGD0LTQsNC70Y/QtdC8INC/0LvQsNGI0LrRgyDQvtGI0LjQsdC60Lgg0YfQtdGA0LXQtyB0aW1lSGlkZSBcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5oaWRlRXJyb3JXaW5kb3cgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgX2VycldpbmRvdyA9ICQodGhpcy5jbGFzc0VycldpbmRvdyk7XHJcblxyXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRfZXJyV2luZG93LmZhZGVPdXQodGhpcy50aW1lSGlkZSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdF9lcnJXaW5kb3cucmVtb3ZlKCk7XHJcblx0XHR9KTtcclxuXHR9LCB0aGlzLnRpbWVIaWRlKTtcclxufTtcclxuXHJcbi8vINCf0YDQuCDQstC+0LfQvdC40LrQvdC+0LLQtdC90LjQuCDQvtGI0LjQsdC60Lgg0LLRi9Cy0LXRgdGC0Lgg0L/Qu9Cw0YjQutGDINC4INGD0LTQsNC70LjRgtGMXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuY2F1Z2h0RXJyID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cdCQoJ2JvZHknKS5hcHBlbmQodGhpcy5uZXdFcnJvcihvcHRpb25zKSk7XHJcblx0dGhpcy5oaWRlRXJyb3JXaW5kb3coKTtcclxufTtcclxuXHJcbi8vINCk0YPQvdC60YbQuNGPINCy0YvQt9C+0LLQsCDQvtGI0LjQsdC60LhcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5nZW5lcmF0ZUVycm9yID0gZnVuY3Rpb24oZXJyb3JPcHQsIGNvbnNvbGVNZXNzYWdlKSB7XHJcblx0dGhpcy5jYXVnaHRFcnIoZXJyb3JPcHQpO1xyXG5cdHRocm93IG5ldyBFcnJvcihjb25zb2xlTWVzc2FnZSB8fCAnRXJyb3InKTtcclxufTsiLCJmdW5jdGlvbiBTbGlkZXIoc2xpZGVyLCBvcHRpb25zKSB7XG5cdHRoaXMuJHNsaWRlciAgICAgICAgICAgID0gc2xpZGVyO1xuXHR0aGlzLiRhcnJTbGlkZXMgICAgICAgICA9IHRoaXMuJHNsaWRlci5jaGlsZHJlbigpO1xuXHR0aGlzLiRhcnJTbGlkZXNEZWYgICAgICA9IHRoaXMuJGFyclNsaWRlcztcblx0dGhpcy5jb3VudFNsaWRlcyAgICAgICAgPSB0aGlzLiRhcnJTbGlkZXMubGVuZ3RoIC0gMTtcblx0dGhpcy5zZXR0aW5ncyAgICAgICAgICAgPSAkLmV4dGVuZCh7XG5cdCAgYWN0aXZlQ2xhc3MgICAgOiAnc2xpZGVyLWFjdGl2ZScsXG5cdCAgYmFsbHNCbG9jayAgICAgOiAnc2xpZGVyLW5hdmlnYXRpb24nLFxuXHQgIGJhbGxzQ2xhc3MgICAgIDogJ3NsaWRlci1uYXZpZ2F0aW9uLWNpcmNsZScsXG5cdCAgYWN0aXZlUG9zICAgICAgOiAwLFxuXHQgIHRpbWVTdGVwICAgICAgIDogNzAwMCxcblx0ICBzbGlkZVdpZHRoICAgICA6IHRoaXMuJGFyclNsaWRlcy5vdXRlcldpZHRoKCksXG5cdCAgYXJyb3dzICAgICAgICAgOiB0cnVlXG5cdH0sIG9wdGlvbnMpO1xuXHR0aGlzLnNsaWRlV2lkdGggICAgICAgICA9IHRoaXMuc2V0dGluZ3Muc2xpZGVXaWR0aDtcblx0dGhpcy5pbmRleEFjdGl2ZVNsaWRlICAgPSB0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyArIDI7XG5cdHRoaXMuc2xpZGVTdGFydEluZGV4ICAgID0gMjtcblx0dGhpcy5zbGlkZUVuZEluZGV4ICAgICAgPSB0aGlzLmNvdW50U2xpZGVzIC0gMTtcblx0dGhpcy5iYWxsc0Jsb2NrICAgICAgICAgPSAkKCcuJyArIHRoaXMuc2V0dGluZ3MuYmFsbHNCbG9jayk7XG5cdHRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzID0gdGhpcy5iYWxsc0Jsb2NrLmNoaWxkcmVuKCcuJyArIHRoaXMuc2V0dGluZ3MuYmFsbHNDbGFzcyk7XG5cdHRoaXMuYXJyTmF2RWxMZW5ndGggICAgID0gdGhpcy5hcnJheU5hdmlnRWxlbWVudHMubGVuZ3RoO1xuXHR0aGlzLmJhbGxBY3RpdmVQb3MgICAgICA9IHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zO1xuXHR0aGlzLmludGVydmFsO1xufVxuXG4vLyDQn9C+0YHRgtCw0LLQuNGC0Ywg0L/RgNC+0LfRgNCw0YfQvdGD0Y4g0L/Qu9Cw0YjQutGDINC90LAgYm9keSwgXG4vLyDRh9GC0L7QsSDQstC+INCy0YDQtdC80Y8g0L/Qu9Cw0LLQvdC+0LPQviDQv9C10YDQtdC80LXRidC10L3QuNGPINC90LXQu9GM0LfRjyDQsdGL0LvQviDQtdGJ0ZEg0YDQsNC3IFxuLy8g0L3QsNC20LDRgtGMINC90LAg0LrQvdC+0L/QutGDINC/0LXRgNC10LzQtdGJ0LXQvdC40Y9cblNsaWRlci5wcm90b3R5cGUuY2FuY2VsQ2xpY2sgPSBmdW5jdGlvbigpIHtcblx0JCgnYm9keScpLmFkZENsYXNzKCdib2R5LWJnJyk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0JCgnYm9keScpLnJlbW92ZUNsYXNzKCdib2R5LWJnJyk7XG5cdH0sIDUwMCk7XG59O1xuXG4vLyDQlNC+0LHQsNCy0LvRj9C10Lwg0LrQvdC+0L/QutC4INC/0LXRgNC10LTQstC40LbQtdC90LjRjywg0LXRgdC70Lgg0LIg0L7Qv9GG0LjRj9GFINGD0LrQsNC30LDQvdC+IGFycm93czogdHJ1ZSAo0L/QviDRg9C80L7Qu9GHKVxuU2xpZGVyLnByb3RvdHlwZS5hZGRBcnJvd3MgPSBmdW5jdGlvbigpIHtcblx0aWYodGhpcy5zZXR0aW5ncy5hcnJvd3Mpe1xuXHRcdHRoaXMuJHNsaWRlci5hZnRlcignPGEgaHJlZj1cIiNcIiBkYXRhLXNsaWRlPVwiMVwiIGNsYXNzPVwic2xpZGVyLWFycm93XCI+PC9hPjxhIGhyZWY9XCIjXCIgZGF0YS1zbGlkZT1cIi0xXCIgY2xhc3M9XCJzbGlkZXItYXJyb3dcIj48L2E+Jyk7XG5cdH1cbn07XG5cbi8vINCj0YHRgtCw0L3QvtCy0LjRgtGMINCw0YHRgtC40LLQvdGL0Lkg0LrQu9Cw0YHRgSDQvdCwINGB0LvQsNC50LRcbi8vINCh0LvQsNC50LQg0LLRi9GH0LjRgdC70Y/QtdGC0YHRjyDQv9C+INC40L3QtNC10LrRgdGDLCDQs9C00LUg0LjQvdC00LXQutGBIC0g0Y3RgtC+IGFjdGl2ZVBvcyDQsiBvcHRpb25zXG4vLyDQmCDQv9C10YDQtdC80LXRidCw0LXRgtGB0Y8g0L3QsCDQsNC60YLQuNCy0L3Ri9C5INGB0LvQsNC50LRcblNsaWRlci5wcm90b3R5cGUuc2V0QWN0aXZlU2xpZGUgPSBmdW5jdGlvbigpIHtcblx0dGhpcy4kc2xpZGVyLmNoaWxkcmVuKCcqW2RhdGEtaXRlbT1cIicrIHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zICsnXCJdJykuYWRkQ2xhc3ModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cdHRoaXMubW92ZSh0aGlzLmluZGV4QWN0aXZlU2xpZGUpO1xufTtcblxuLy8g0KPQt9C90LDRgtGMINC40L3QtNC10LrRgSDRgtC10LrRg9GJ0LXQs9C+INCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUuZ2V0SW5kZXhBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy4kc2xpZGVyLmNoaWxkcmVuKCcuJyArIHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpLmluZGV4KCk7XG59O1xuXG4vLyDQodCx0YDQvtGB0LjRgtGMINGB0L4g0LLRgdC10YUg0YHQu9Cw0LnQtNC+0LIg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBXG4vLyDQn9C+0YHRgtCw0LLQuNGC0Ywg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9C10LQg0YHQu9Cw0LnQtCAobmV4dFNsaWRlIC0g0YHQu9C10LQuINC40L3QtNC10LrRgSlcblNsaWRlci5wcm90b3R5cGUuY2hhbmdlQWN0aXZlU2xpZGUgPSBmdW5jdGlvbihuZXh0U2xpZGUpIHtcblx0dGhpcy4kYXJyU2xpZGVzLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3ModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cdHRoaXMuJGFyclNsaWRlcy5lcShuZXh0U2xpZGUpLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xufTtcblxuLy8g0J3QtdC30LDQvNC10YLQvdC+0LUg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXG4vLyDQlNC10LvQsNC10YLRgdGPINC00LvRjyDRgtC+0LPQviwg0YfRgtC+0LHRiyDQv9C10YDQtdC80LXRgdGC0LjRgtGMINGB0LvQsNC50LTQtdGALCDQutC+0LPQtNCwIFxuLy8g0L7QvSDQtNC+0YHRgtC40LMg0LjQu9C4INC/0L7RgdC70LXQtNC90LXQs9C+LCDQuNC70Lgg0L/QtdGA0LLQvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmludmlzaWJsZU1vdmVTbGlkZXIgPSBmdW5jdGlvbihpbmRleFBvc2l0aW9uLCBtb3ZpbmdQb3NpdGlvbikge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHR0aGlzLm1vdmUoaW5kZXhQb3NpdGlvbiwgZnVuY3Rpb24oKSB7XG5cdFx0X3RoaXMuJHNsaWRlci5jc3Moe1xuXHRcdFx0J2xlZnQnOiAtX3RoaXMuc2xpZGVXaWR0aCAqIG1vdmluZ1Bvc2l0aW9uXG5cdFx0fSk7XG5cdFx0X3RoaXMuY2hhbmdlQWN0aXZlU2xpZGUobW92aW5nUG9zaXRpb24pO1xuXHR9KTtcbn07XG5cbi8vINCf0YDQvtCy0LXRgNC60LAg0LjQvdC00LXQutGB0LAg0YHQu9C10LQg0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmNoZWNrU2xpZGUgPSBmdW5jdGlvbihkYXRhU2xpZGUpIHtcblx0dmFyIF9kYXRhU2xpZGUgPSBkYXRhU2xpZGUgfHwgMSxcblx0XHQgIF9uZXh0U2xpZGUgPSB0aGlzLmdldEluZGV4QWN0aXZlU2xpZGUoKSArIF9kYXRhU2xpZGU7XG5cblx0aWYgKF9uZXh0U2xpZGUgPT0gdGhpcy5zbGlkZUVuZEluZGV4KSB7XG5cdFx0dGhpcy5pbnZpc2libGVNb3ZlU2xpZGVyKF9uZXh0U2xpZGUsIHRoaXMuc2xpZGVTdGFydEluZGV4KTtcblx0XHR0aGlzLmJhbGxBY3RpdmVQb3MgPSAwO1xuXHR9IGVsc2UgaWYgKF9uZXh0U2xpZGUgPT0gKHRoaXMuc2xpZGVTdGFydEluZGV4LTEpKSB7XG5cdFx0dGhpcy5pbnZpc2libGVNb3ZlU2xpZGVyKF9uZXh0U2xpZGUsIHRoaXMuc2xpZGVFbmRJbmRleC0xKTtcdFxuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IHRoaXMuYXJyTmF2RWxMZW5ndGggLSAxO1xuXHR9XHRlbHNlIHtcblx0XHR0aGlzLm1vdmUoX25leHRTbGlkZSk7XG5cdFx0dGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShfbmV4dFNsaWRlKTtcblx0XHR0aGlzLmJhbGxBY3RpdmVQb3MgPSBfbmV4dFNsaWRlIC0gMjtcblx0fVx0XG5cblx0dGhpcy5iYWxsc1NldEFjdGl2ZSh0aGlzLmJhbGxBY3RpdmVQb3MsIGZhbHNlKTtcbn07XG5cbi8vINCf0LvQsNCy0L3QvtC1INC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxuLy8g0J/QsNGA0LDQvNC10YLRgNGLOiBpbmRleFBvcyAtINC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihpbmRleFBvcywgY2FsbGJhY2spIHtcblx0dmFyIF90aGlzID0gdGhpcztcblx0dGhpcy4kc2xpZGVyLnRyYW5zaXRpb24oe1xuXHRcdCdsZWZ0JzogLV90aGlzLnNsaWRlV2lkdGggKiBpbmRleFBvc1xuXHR9LCA1MDAsIGZ1bmN0aW9uKCkge1xuXHRcdGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2soKTtcblx0fSk7XHRcbn07XG5cbi8vINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINGC0LDQudC80LXRgNCwINC00LvRjyDQsNCy0YLQvtC90L7QvNC90L7Qs9C+INC/0LXRgNC10LzQtdGJ0LXQvdC40Y8g0YHQu9Cw0LnQtNC10YDQsFxuU2xpZGVyLnByb3RvdHlwZS5zdGFydFRpbWVyID0gZnVuY3Rpb24odGltZXIsIGZ1bmMpIHtcblx0dmFyIF90aGlzID0gdGhpcztcblx0cmV0dXJuIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRfdGhpcy5jaGVja1NsaWRlKCk7XG5cdFx0XHR9LCBfdGhpcy5zZXR0aW5ncy50aW1lU3RlcCk7XG59O1xuXG4vLyDQoNCw0LHQvtGC0LAg0YEg0L3QuNC20L3QtdC5INC90LDQstC40LPQsNGG0LjQtdC5KNGD0YHRgtCw0L3QvtCy0LrQsCwg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDQuiDRgdC+0L7RgtCy0LXRgtGB0YLQstGD0Y7RidC10LzRgyDRiNCw0YDQuNC60YMg0YHQu9Cw0LnQtNGDKVxuU2xpZGVyLnByb3RvdHlwZS5iYWxsc1NldEFjdGl2ZSA9IGZ1bmN0aW9uKGRhdGFTbGlkZSwgbW92ZVNsaWRlcikge1xuXHR2YXIgX2JhbGxzQ2xhc3MgICAgICAgID0gdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzLFxuXHRcdCAgX2JhbGxzQ2xhc3NBY3RpdmUgID0gX2JhbGxzQ2xhc3MgKyAnLWFjdGl2ZScsXG5cdFx0ICBfYXJyYXlCYWxscyAgICAgICAgPSB0aGlzLmFycmF5TmF2aWdFbGVtZW50cztcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IF9hcnJheUJhbGxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKF9hcnJheUJhbGxzLmVxKGkpLmhhc0NsYXNzKF9iYWxsc0NsYXNzKSkge1xuXHRcdFx0X2FycmF5QmFsbHMuZXEoaSkucmVtb3ZlQ2xhc3MoX2JhbGxzQ2xhc3NBY3RpdmUpO1xuXHRcdH1cblx0fVxuXG5cdF9hcnJheUJhbGxzLmVxKGRhdGFTbGlkZSkuYWRkQ2xhc3MoX2JhbGxzQ2xhc3NBY3RpdmUpO1xuXG5cdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IGRhdGFTbGlkZSArIDE7XG5cblx0aWYgKG1vdmVTbGlkZXIpIHtcblx0XHR0aGlzLm1vdmUoZGF0YVNsaWRlICsgMik7XG5cdFx0dGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShkYXRhU2xpZGUgKyAyKTtcblx0fVxufTtcblxuU2xpZGVyLnByb3RvdHlwZS5jaGFuZ2VPcGFjaXR5ID0gZnVuY3Rpb24oKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRfdGhpcy4kc2xpZGVyLmNzcygnb3BhY2l0eScsIDEpO1xuXHR9LCA1MDApO1xufVxuXG4vLyDQntCx0YDQsNCx0L7RgtGH0LjQuiDQutC70LjQutCwINC90LAg0LrQvdC+0L/QutC4INC/0LXRgNC10LrQu9GO0YfQtdC90LjRj1xuU2xpZGVyLnByb3RvdHlwZS5DbGlja0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnNsaWRlci1hcnJvdycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBfZGF0YVNsaWRlID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdzbGlkZScpKTtcblx0XHRjbGVhckludGVydmFsKF90aGlzLmludGVydmFsKTtcblxuXHRcdF90aGlzLmNhbmNlbENsaWNrKCk7XG5cdFx0X3RoaXMuY2hlY2tTbGlkZShfZGF0YVNsaWRlKTtcblx0XHRfdGhpcy5iYWxsc1NldEFjdGl2ZShfdGhpcy5iYWxsQWN0aXZlUG9zLTEsIGZhbHNlKTsgLy8gYmFsbEFjdGl2ZVBvcyAtIDEsINGC0Log0L/RgNC4INC/0LXRgNC10LzQtdGJ0LXQvdC40Lgg0YHQu9Cw0LnQtNC10YDQsCDQvtC9INGD0LLQtdC70LjRh9C40LvRgdGPINC90LAgMSBcblxuXHRcdF90aGlzLmludGVydmFsID0gX3RoaXMuc3RhcnRUaW1lcihfdGhpcy5pbnRlcnZhbCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuc2xpZGVyLW5hdmlnYXRpb24tY2lyY2xlJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF9kYXRhU2xpZGUgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ3NsaWRlJykpO1xuXHRcdGNsZWFySW50ZXJ2YWwoX3RoaXMuaW50ZXJ2YWwpO1xuXG5cdFx0X3RoaXMuYmFsbHNTZXRBY3RpdmUoX2RhdGFTbGlkZSwgdHJ1ZSk7XG5cblx0XHRfdGhpcy5pbnRlcnZhbCA9IF90aGlzLnN0YXJ0VGltZXIoX3RoaXMuaW50ZXJ2YWwpO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcbn07XG5cbi8vINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINGB0LvQsNC50LTQtdGA0LBcblNsaWRlci5wcm90b3R5cGUuaW5pdFNsaWRlciA9IGZ1bmN0aW9uKCl7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdGlmICgodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgPiB0aGlzLiRhcnJTbGlkZXNEZWYubGVuZ3RoKSB8fCAodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgPCAwKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignQWN0aXZlIHBvc2l0aW9uIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0aWYgKHRoaXMuY291bnRTbGlkZXMgPT09IDApIHtcblx0XHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zKTtcblx0XHR0aGlzLmNoYW5nZU9wYWNpdHkoKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR0aGlzLmFkZEFycm93cygpO1xuXHR0aGlzLnNldEFjdGl2ZVNsaWRlKCk7XHRcblx0dGhpcy5DbGlja0hhbmRsZXIoKTtcblx0dGhpcy5iYWxsc1NldEFjdGl2ZSh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyk7XG5cdHRoaXMuY2hhbmdlT3BhY2l0eSgpO1xuXHR0aGlzLmludGVydmFsID0gdGhpcy5zdGFydFRpbWVyKHRoaXMuaW50ZXJ2YWwpO1xuXG5cdFxufTsiLCJmdW5jdGlvbiBQcmV2U2xpZGVyKGFycmF5VXJscykge1xyXG5cdHRoaXMuYXJyYXlVcmxzID0gYXJyYXlVcmxzO1xyXG5cdHRoaXMuYXJyTGVuZ3RoID0gYXJyYXlVcmxzLmxlbmd0aDtcclxufVxyXG5cclxuLy8g0KPQtNCw0LvRj9C10Lwg0LjQtyDRgdGC0YDQvtC60Lgg0LvQuNGI0L3QuNC1INGB0LjQvNCy0L7Qu9GLXHJcblByZXZTbGlkZXIucHJvdG90eXBlLmRlbGV0ZVRhYnMgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgX2FycmF5VXJscyA9IHRoaXMuYXJyYXlVcmxzO1xyXG5cdHJldHVybiBfYXJyYXlVcmxzLnJlcGxhY2UoL1xcc3xcXFt8XFxdfFxcJ3xcXCcvZywgJycpO1xyXG59O1xyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC40Lcg0YHRgtGA0L7QutC4INC80LDRgdGB0LjQslxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5zdHJpbmdUb0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIF9pbnB1dFN0cmluZyA9IHRoaXMuZGVsZXRlVGFicygpO1xyXG5cclxuXHRpZiAoX2lucHV0U3RyaW5nID09PSAnJykgcmV0dXJuIGZhbHNlO1xyXG5cdF9pbnB1dFN0cmluZyA9IF9pbnB1dFN0cmluZy5zcGxpdCgnLCcpO1xyXG5cclxuXHRyZXR1cm4gX2lucHV0U3RyaW5nO1xyXG59O1xyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC80LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyIFxyXG4vLyDQndCwINCy0YXQvtC0INC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwKNGC0L7Rgiwg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDQv9C+0LrQsNC30YvQstCw0YLRjNGB0Y8g0L/QtdGA0LLRi9C8KVxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5hcnJheVRvQXJyT2JqcyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBfYXJyT2JqZWN0cyAgPSBbXSxcclxuXHRcdCAgX2FyclVybHMgICAgID0gdGhpcy5zdHJpbmdUb0FycmF5KCk7XHJcblxyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgX2FyclVybHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdF9hcnJPYmplY3RzW2ldID0geyBcclxuXHRcdFx0Zm90bzogX2FyclVybHNbaV0sXHJcblx0XHRcdGNvbW1lbnQ6ICcnLFxyXG5cdFx0XHRsaW5rOiAnJ1xyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIF9hcnJPYmplY3RzO1xyXG59O1xyXG5cclxuLy8g0JrQvtC/0LjRgNC+0LLQsNC90LjQtSDQvNCw0YHRgdC40LLQsCDQvtCx0YrQtdC60YLQvtCyLlxyXG4vLyDQlNC70Y8g0YLQvtCz0L4sINGH0YLQvtCxINC80L7QttC90L4g0LHRi9C70L4g0L/QtdGA0LXQvNC10YnQsNGC0YzRgdGPINC80LXQttC00YMg0YjQsNCz0LDQvNC4XHJcblByZXZTbGlkZXIucHJvdG90eXBlLmNvcHlBcnJheU9ianMgPSBmdW5jdGlvbihhcnJheU9ianMpIHtcclxuXHRpZiAoIWFycmF5T2JqcyB8fCAnb2JqZWN0JyAhPT0gdHlwZW9mIGFycmF5T2Jqcykge1x0XHJcblx0ICByZXR1cm4gYXJyYXlPYmpzO1xyXG5cdH1cclxuXHJcblx0dmFyIF9uZXdBcnJheSA9ICgnZnVuY3Rpb24nID09PSB0eXBlb2YgYXJyYXlPYmpzLnBvcCkgPyBbXSA6IHt9O1xyXG5cdHZhciBfcHJvcCwgX3ZhbHVlO1xyXG5cclxuXHRmb3IgKF9wcm9wIGluIGFycmF5T2Jqcykge1xyXG5cdFx0aWYgKGFycmF5T2Jqcy5oYXNPd25Qcm9wZXJ0eShfcHJvcCkpIHtcclxuXHRcdCAgX3ZhbHVlID0gYXJyYXlPYmpzW19wcm9wXTtcclxuXHRcdCAgaWYgKF92YWx1ZSAmJiAnb2JqZWN0JyA9PT0gdHlwZW9mIF92YWx1ZSkge1xyXG5cdFx0XHQgICAgX25ld0FycmF5W19wcm9wXSA9IHRoaXMuY29weUFycmF5T2JqcyhfdmFsdWUpO1xyXG5cdFx0XHQgIH0gZWxzZSB7XHJcblx0XHRcdCAgICBfbmV3QXJyYXlbX3Byb3BdID0gX3ZhbHVlO1xyXG5cdFx0XHQgIH1cclxuXHQgICAgfVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIF9uZXdBcnJheTtcclxuXHJcblx0IC8vIHJldHVybiBbXS5jb25jYXQoYXJyYXlPYmpzKTsgLy8g0LXRgdC70Lgg0L3QsNC00L4g0LHRg9C00LXRgiDRgdC+0YXRgNCw0L3Rj9GC0Ywg0YPQttC1INC30LDQv9C40YHQsNC90L3Ri9C1INC/0L7Qu9GPXHJcbn07IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cblx0dmFyIHRlbXBsYXRlcyA9IHtcblx0XHRpbnB1dExpbmtzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2lucHV0TGlua3MnKS5odG1sKCkpLFxuXHRcdGVycm9yOiAgICAgIEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjZXJyb3JQb3BVcCcpLmh0bWwoKSksXG5cdFx0cHJld2lld3M6ICAgSGFuZGxlYmFycy5jb21waWxlKCQoJyNwcmV3aWV3cycpLmh0bWwoKSksXG5cdFx0c2xpZGVyTGlzdDogSGFuZGxlYmFycy5jb21waWxlKCQoJyNzbGlkZXJMaXN0JykuaHRtbCgpKVxuXHR9O1xuXG5cdHZhciBzdG9yZVRlbXBsYXRlcyA9IHt9OyAvLyDQpdGA0LDQvdC40LvQuNGJ0LUg0LrQvtC/0LjQuSDQvtCx0YrQtdC60YLQvtCyINC00LvRjyDRgtC+0LPQviwg0YfRgtC+0LEg0LzQvtC20L3QviDQsdGL0LvQviDQv9C10YDQtdC80LXRidCw0YLRjNGB0Y8g0L/QviDRiNCw0LPQsNC8XG5cblx0dmFyIGVycm9ySGFuZGxlciA9IG5ldyBFcnJvckhhbmRsZXIoJy5lcnJNZXMnLCB0ZW1wbGF0ZXMuZXJyb3IpLFxuXHRcdCAgcHJldlNsaWRlcixcblx0XHQgIGFjdGl2ZUluZGV4LFxuXHRcdCAgJGFjdGl2ZVJhZGlvQnRuLFxuXHRcdCAgb2JqU2xpZGVzO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcud3ItZm9ybV9kYXRhcy1idG4nLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgaW5wdXRTdHIgID0gJCgnLndyLWZvcm1fZGF0YXMtaW5wJykudmFsKCk7XG5cdFx0XG5cdFx0cHJldlNsaWRlciAgPSBuZXcgUHJldlNsaWRlcihpbnB1dFN0cik7XG5cdFx0b2JqU2xpZGVzICAgPSBwcmV2U2xpZGVyLmFycmF5VG9BcnJPYmpzKCk7IFxuXG5cdFx0c3RvcmVUZW1wbGF0ZXMucHJld2lld3MgPSBwcmV2U2xpZGVyLmNvcHlBcnJheU9ianMob2JqU2xpZGVzKTtcblxuXHRcdGlmICghb2JqU2xpZGVzLmxlbmd0aCkge1xuXHRcdFx0ZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0LTQsNC90L3Ri9C1J1xuXHRcdFx0fSwgJ0RhdGFzIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0ZmFkZUJsb2NrKCQoJy53ci1mb3JtX2RhdGFzJyksIDIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLndyYXBwZXInKS5wcmVwZW5kKHRlbXBsYXRlcy5wcmV3aWV3cyhvYmpTbGlkZXMpKS5mYWRlSW4oNTAwKTtcblx0XHR9KTtcblx0XHRcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLndyLWJsb2NrLXNlbGVjdF9hY3RpdmUtcmFkaW8nLCBmdW5jdGlvbigpIHtcdFxuXHRcdGFjdGl2ZUluZGV4ID0gcGFyc2VJbnQoJCh0aGlzKS52YWwoKSk7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcud3ItYmxvY2stZGVsZXRlJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGl0ZW0gICAgICA9ICQodGhpcykuZGF0YSgnaXRlbScpLFxuXHRcdFx0ICB3aW5TY3JUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cblx0XHRvYmpTbGlkZXMuc3BsaWNlKGl0ZW0sIDEpO1xuXG5cdFx0JCgnLndyYXBwZXInKS5odG1sKCcnKS5hcHBlbmQodGVtcGxhdGVzLnByZXdpZXdzKG9ialNsaWRlcykpO1xuXHRcdCQod2luZG93KS5zY3JvbGxUb3Aod2luU2NyVG9wKTtcblxuXHRcdC8vIGFjdGl2ZUluZGV4ID0gc2VsZWN0QWN0aXZlQWZ0ZXJEZWwoaXRlbSwgYWN0aXZlSW5kZXgpO1xuXHRcdC8vIGlmIChhY3RpdmVJbmRleCAhPSBudWxsKSB7XG5cdFx0Ly8gXHQkKCcud3ItYmxvY2snKS5lcShhY3RpdmVJbmRleCkuZmluZCgnLndyLWJsb2NrLXNlbGVjdF9hY3RpdmUtdGV4dCcpLnRyaWdnZXIoJ2NsaWNrJyk7XG5cdFx0Ly8gfSBlbHNlIHtcblx0XHQvLyBcdGFjdGl2ZUluZGV4ID0gMDtcblx0XHQvLyB9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLndyLWJsb2NrLWNvbW1lbnQtbGItaW5wJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG51bWJlckNvbW1lbnQgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2NvbW1lbnQnKSksXG5cdFx0XHQgIHRleHRDb21tZW50ICAgPSAkKHRoaXMpLnZhbCgpO1xuXG5cdFx0b2JqU2xpZGVzW251bWJlckNvbW1lbnRdLmNvbW1lbnQgPSB0ZXh0Q29tbWVudDtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcud3ItYmxvY2stbGluay1sYi1pbnAnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgbnVtYmVyQ29tbWVudCA9IHBhcnNlSW50KCQodGhpcykuZGF0YSgnbGluaycpKSxcblx0XHRcdCB0ZXh0Q29tbWVudCAgID0gJCh0aGlzKS52YWwoKTtcblxuXHRcdG9ialNsaWRlc1tudW1iZXJDb21tZW50XS5saW5rID0gdGV4dENvbW1lbnQ7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZ2VuZXJhdGUtc2xpZGVyJywgZnVuY3Rpb24oKSB7XG5cdFx0YWN0aXZlSW5kZXggPSAoYWN0aXZlSW5kZXggPT09IHVuZGVmaW5lZCkgPyAwIDogYWN0aXZlSW5kZXg7XG5cblx0XHRpZiAoIW9ialNsaWRlcy5sZW5ndGgpIHtcblx0XHRcdGVycm9ySGFuZGxlci5nZW5lcmF0ZUVycm9yKHtcblx0XHRcdFx0dGl0bGU6ICfQntGI0LjQsdC60LAnLCBcblx0XHRcdFx0bWVzc2FnZTogJ9Cd0LXRgiDQvdC4INC+0LTQvdC+0LPQviDRgdC70LDQudC00LAnXG5cdFx0XHR9LCAnRGF0YXMgaXMgZW1wdHknKTtcblx0XHR9XG5cblx0XHRmYWRlQmxvY2soJCgnLndyLWJsb2Nrcy13JyksIDEsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLndyYXBwZXInKS5hcHBlbmQodGVtcGxhdGVzLnNsaWRlckxpc3Qob2JqU2xpZGVzKSkuZmFkZUluKDUwMCwgZnVuY3Rpb24oKSB7XHRcblxuXHRcdFx0XHR2YXIgc2xpZGVyID0gbmV3IFNsaWRlcigkKCcuc2xpZGVyJyksIHtcblx0XHRcdFx0XHRhY3RpdmVDbGFzczogJ3NsaWRlci1hY3RpdmUnLFxuXHRcdFx0XHRcdGFjdGl2ZVBvczogYWN0aXZlSW5kZXhcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0c2xpZGVyLmluaXRTbGlkZXIoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnN0ZXAtZG93bicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciB0b0Jsb2NrID0gJCh0aGlzKS5kYXRhKCd0bycpO1xuXG5cdFx0b2JqU2xpZGVzID0gcHJldlNsaWRlci5jb3B5QXJyYXlPYmpzKHN0b3JlVGVtcGxhdGVzW3RvQmxvY2tdKTtcblx0XHRhY3RpdmVJbmRleCA9IDA7XG5cdFx0JCgnLndyYXBwZXInKS5odG1sKCByZXR1cm5CbG9jayggdG9CbG9jaywgdGVtcGxhdGVzLCBzdG9yZVRlbXBsYXRlc1t0b0Jsb2NrXSApKTtcblx0fSk7XG5cblx0Ly8g0JjRidC10YIg0LDQutGC0LjQstC90YvQuSDRgdC70LDQudC0INC/0L7RgdC70LUg0YPQtNCw0LvQtdC90LjRjyDRhdC+0YLRjCDQvtC00L3QvtCz0L4g0L/RgNC10LLRjNGOXG5cdGZ1bmN0aW9uIHNlbGVjdEFjdGl2ZUFmdGVyRGVsKGl0ZW0sIGFjdGl2ZUluZGV4KSB7XG5cdFx0aWYgKGl0ZW0gPT0gYWN0aXZlSW5kZXgpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH0gZWxzZSBpZiAoaXRlbSA8IGFjdGl2ZUluZGV4KSB7XG5cdFx0XHRyZXR1cm4gYWN0aXZlSW5kZXggLSAxO1xuXHRcdH0gZWxzZSBpZiAoaXRlbSA+IGFjdGl2ZUluZGV4KXtcblx0XHRcdHJldHVybiBhY3RpdmVJbmRleDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0Ly8g0YTRg9C90LrRhtC40Y8sINC60L7RgtC+0YDQsNGPINGA0LXQvdC00LXRgNC40YIg0YjQsNCx0LvQvtC9INC/0YDQuCDQstC+0LfQstGA0LDRidC10L3QuNC4INC6INC/0YDQtdC00YvQtNGD0YnQtdC80YMg0YjQsNCz0YNcblx0ZnVuY3Rpb24gcmV0dXJuQmxvY2sobmFtZVRlbXAsIG15VGVtcGxhdGVzLCBvcHRpb25zKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYgKG15VGVtcGxhdGVzLmhhc093blByb3BlcnR5KG5hbWVUZW1wKSkge1xuXHRcdFx0cmV0dXJuIG15VGVtcGxhdGVzW25hbWVUZW1wXShvcHRpb25zKTtcblx0XHR9XG5cdH1cblx0XG5cdC8vINCf0LXRgNC10LzQtdGJ0LXQvdC40LUg0LHQu9C+0LrQsCwg0YEg0L/QvtGB0LvQtdC00YPRjtGJ0LjQvCDQtdCz0L4g0YPQtNCw0LvQtdC90LjQtdC8INC40LcgRE9NXG5cdGZ1bmN0aW9uIGJsb2NrTW92ZSgkYmxvY2ssIG1vdmVUbywgb2Zmc2V0KSB7XG5cdFx0dmFyIG1vdmVUbyA9IG1vdmVUbyB8fCAndG9wJyxcblx0XHRcdG9mZnNldCA9IG9mZnNldCB8fCAtMTAwMDtcblx0XHQkYmxvY2suY3NzKG1vdmVUbywgb2Zmc2V0KS5mYWRlT3V0KDEwMCwgZnVuY3Rpb24oKSB7XG5cdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8g0J7Qv9GA0LXQtNC10LvQtdC90LjQtSDRgdC/0L7RgdC+0LHQsCDQv9C10YDQtdC80LXRidC10L3QuNGPXG5cdGZ1bmN0aW9uIGZhZGVCbG9jaygkYmxvY2ssIGFuaW1hdGlvbiwgY2FsbGJhY2spIHsgLy8gYW5pbWF0aW9uINC80L7QttC10YIg0LHRi9GC0YwgMT11cCwgMj1yaWdodFxuXHRcdHZhciBhbmltYXRpb24gICAgICA9IGFuaW1hdGlvbiB8fCAxO1xuXG5cdFx0c3dpdGNoKGFuaW1hdGlvbikge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRibG9ja01vdmUoJGJsb2NrLCAndG9wJyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGJsb2NrTW92ZSgkYmxvY2ssICdyaWdodCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aWYoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIGNhbGxiYWNrKCk7XG5cdH1cblxuXHQvLyDQpdC10LvQv9C10YAsINC60L7RgtC+0YDRi9C5INC00L7QsdCw0LLQu9GP0LXRgiAyINC/0L7RgdC70LXQtNC+0LLQsNGC0LXQu9GM0L3Ri9GFINGB0LvQsNC50LTQsCBcblx0Ly8gcG9zaXRpb24gLSDQvdCw0YfQsNC70L4g0L/QvtC30LjRhtC40Lgg0YHQu9Cw0LnQtNCwLCDQutC+0YLQvtGA0YvQuSDQvdCw0LTQviDQtNC+0LHQsNCy0LjRgtGMLCBvYmogLSDRgdCw0Lwg0YHQu9Cw0LnQtFxuXHRIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdhZGRTbGlkZXMnLCBmdW5jdGlvbihvYmosIHBvc2l0aW9uKSB7XG5cdFx0dmFyIHJldHVybmluZ1N0ciA9ICcnLFxuXHRcdFx0cG9zaXRpb24gICAgID0gcG9zaXRpb24gLSAyO1xuXG5cdFx0aWYgKG9iai5sZW5ndGggPCAyKSByZXR1cm4gJyc7XG5cblx0XHRmb3IgKHZhciBpID0gMiwgaiA9IHBvc2l0aW9uOyBpID4gMDsgaS0tLCBqKysgKSB7IFxuXHRcdFx0cmV0dXJuaW5nU3RyICs9ICc8bGkgY2xhc3M9XCJzbGlkZXItaW1nXCJcIj48aW1nIHNyYz1cIicgKyBvYmpbal0uZm90byArICdcIiBhbHQ9XCJcIi8+Jztcblx0XHRcdFxuXHRcdFx0aWYgKG9ialtqXS5jb21tZW50Lmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm5pbmdTdHIgKz0gJzxkaXYgY2xhc3M9XCJzbGlkZXItaW1nLWNvbW1lbnRcIj4nICsgb2JqW2pdLmNvbW1lbnQgKyAnPC9kaXY+Jztcblx0XHRcdFx0cmV0dXJuaW5nU3RyICs9ICc8L2xpPic7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHJldHVybmluZ1N0cik7XG5cdH0pO1xuXG5cdC8vINCV0YHQu9C4INC10YHRgtGMINC/0L7Qu9C1IGxpbmssINGC0L4g0L7QsdC10YDQvdGD0YLRjCDQutC+0L3RgtC10LrRgdGCINCyINGB0YHRi9C70LrRg1xuXHRIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3cmFwTGluaycsIGZ1bmN0aW9uKGxpbmssIG9wdGlvbnMpIHtcblx0XHR2YXIgcmV0dXJuaW5nU3RyO1xuXG5cdFx0aWYgKGxpbmsubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm5pbmdTdHIgPSAnPGEgaHJlZj1cIicrIGxpbmsgKydcIj4nICsgb3B0aW9ucy5mbih0aGlzKSArICc8L2E+Jztcblx0XHRcdHJldHVybiByZXR1cm5pbmdTdHI7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG5cdH0pO1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
