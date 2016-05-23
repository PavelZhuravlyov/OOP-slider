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
Slider.prototype.clickHandler = function() {
	var _this = this;

	$(document).on('click', '.slider-arrow', function() {
		var _dataSlide = parseInt($(this).data('slide'));
		clearInterval(_this.interval);

		_this.cancelClick();
		_this.checkSlide(_dataSlide);
		_this.ballsSetActive(_this.ballActivePos-1, false); // ballActivePos - 1, тк при перемещении слайдера он увеличился на 1(checkSlide->ballsSetActive) 

		_this.interval = _this.startTimer(_this.interval);

		return false;
	});

	$(document).on('click', '.slider-navigation-circle', function() {
		var _dataSlide        = parseInt($(this).data('slide')),
				_ballsClassActive = _this.settings.ballsClass + '-active';

		if ($(this).hasClass(_ballsClassActive)) {
			return false;
		} 

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
	this.clickHandler();
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

		activeIndex = selectActiveAfterDel(item, activeIndex);
		if (activeIndex != null) {
			$('.wr-block').eq(activeIndex).find('.wr-block-select_active-text').trigger('click');
		} else {
			activeIndex = 0;
		}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwicHJldlNsaWRlci5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g0J7QsdGA0LDQsdC+0YLRh9C40Log0L7RiNC40LHQvtC6XHJcbmZ1bmN0aW9uIEVycm9ySGFuZGxlcihjbGFzc0VycldpbmRvdywgdGVtcGxhdGVQb3BVcCkge1xyXG5cdHRoaXMudGltZUhpZGUgICAgICAgPSAyMDAwO1xyXG5cdHRoaXMuY2xhc3NFcnJXaW5kb3cgPSBjbGFzc0VycldpbmRvdztcclxuXHR0aGlzLnRlbXBsYXRlUG9wVXAgID0gdGVtcGxhdGVQb3BVcDtcclxufVxyXG5cclxuLy8g0KDQtdC90LTQtdGA0LjQvdCzINGI0LDQsdC70L7QvdCwINC+0YjQuNCx0L7QulxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLm5ld0Vycm9yID0gZnVuY3Rpb24oZXJyb3JPYmplY3QpIHtcclxuXHRyZXR1cm4gdGhpcy50ZW1wbGF0ZVBvcFVwKGVycm9yT2JqZWN0KTtcclxufTtcclxuXHJcbi8vINCh0LrRgNGL0LLQsNC10Lwg0Lgg0YPQtNCw0LvRj9C10Lwg0L/Qu9Cw0YjQutGDINC+0YjQuNCx0LrQuCDRh9C10YDQtdC3IHRpbWVIaWRlIFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmhpZGVFcnJvcldpbmRvdyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBfZXJyV2luZG93ID0gJCh0aGlzLmNsYXNzRXJyV2luZG93KTtcclxuXHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdF9lcnJXaW5kb3cuZmFkZU91dCh0aGlzLnRpbWVIaWRlLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0X2VycldpbmRvdy5yZW1vdmUoKTtcclxuXHRcdH0pO1xyXG5cdH0sIHRoaXMudGltZUhpZGUpO1xyXG59O1xyXG5cclxuLy8g0J/RgNC4INCy0L7Qt9C90LjQutC90L7QstC10L3QuNC4INC+0YjQuNCx0LrQuCDQstGL0LLQtdGB0YLQuCDQv9C70LDRiNC60YMg0Lgg0YPQtNCw0LvQuNGC0YxcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5jYXVnaHRFcnIgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblx0JCgnYm9keScpLmFwcGVuZCh0aGlzLm5ld0Vycm9yKG9wdGlvbnMpKTtcclxuXHR0aGlzLmhpZGVFcnJvcldpbmRvdygpO1xyXG59O1xyXG5cclxuLy8g0KTRg9C90LrRhtC40Y8g0LLRi9C30L7QstCwINC+0YjQuNCx0LrQuFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmdlbmVyYXRlRXJyb3IgPSBmdW5jdGlvbihlcnJvck9wdCwgY29uc29sZU1lc3NhZ2UpIHtcclxuXHR0aGlzLmNhdWdodEVycihlcnJvck9wdCk7XHJcblx0dGhyb3cgbmV3IEVycm9yKGNvbnNvbGVNZXNzYWdlIHx8ICdFcnJvcicpO1xyXG59OyIsImZ1bmN0aW9uIFNsaWRlcihzbGlkZXIsIG9wdGlvbnMpIHtcblx0dGhpcy4kc2xpZGVyICAgICAgICAgICAgPSBzbGlkZXI7XG5cdHRoaXMuJGFyclNsaWRlcyAgICAgICAgID0gdGhpcy4kc2xpZGVyLmNoaWxkcmVuKCk7XG5cdHRoaXMuJGFyclNsaWRlc0RlZiAgICAgID0gdGhpcy4kYXJyU2xpZGVzO1xuXHR0aGlzLmNvdW50U2xpZGVzICAgICAgICA9IHRoaXMuJGFyclNsaWRlcy5sZW5ndGggLSAxO1xuXHR0aGlzLnNldHRpbmdzICAgICAgICAgICA9ICQuZXh0ZW5kKHtcblx0ICBhY3RpdmVDbGFzcyAgICA6ICdzbGlkZXItYWN0aXZlJyxcblx0ICBiYWxsc0Jsb2NrICAgICA6ICdzbGlkZXItbmF2aWdhdGlvbicsXG5cdCAgYmFsbHNDbGFzcyAgICAgOiAnc2xpZGVyLW5hdmlnYXRpb24tY2lyY2xlJyxcblx0ICBhY3RpdmVQb3MgICAgICA6IDAsXG5cdCAgdGltZVN0ZXAgICAgICAgOiA3MDAwLFxuXHQgIHNsaWRlV2lkdGggICAgIDogdGhpcy4kYXJyU2xpZGVzLm91dGVyV2lkdGgoKSxcblx0ICBhcnJvd3MgICAgICAgICA6IHRydWVcblx0fSwgb3B0aW9ucyk7XG5cdHRoaXMuc2xpZGVXaWR0aCAgICAgICAgID0gdGhpcy5zZXR0aW5ncy5zbGlkZVdpZHRoO1xuXHR0aGlzLmluZGV4QWN0aXZlU2xpZGUgICA9IHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zICsgMjtcblx0dGhpcy5zbGlkZVN0YXJ0SW5kZXggICAgPSAyO1xuXHR0aGlzLnNsaWRlRW5kSW5kZXggICAgICA9IHRoaXMuY291bnRTbGlkZXMgLSAxO1xuXHR0aGlzLmJhbGxzQmxvY2sgICAgICAgICA9ICQoJy4nICsgdGhpcy5zZXR0aW5ncy5iYWxsc0Jsb2NrKTtcblx0dGhpcy5hcnJheU5hdmlnRWxlbWVudHMgPSB0aGlzLmJhbGxzQmxvY2suY2hpbGRyZW4oJy4nICsgdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzKTtcblx0dGhpcy5hcnJOYXZFbExlbmd0aCAgICAgPSB0aGlzLmFycmF5TmF2aWdFbGVtZW50cy5sZW5ndGg7XG5cdHRoaXMuYmFsbEFjdGl2ZVBvcyAgICAgID0gdGhpcy5zZXR0aW5ncy5hY3RpdmVQb3M7XG5cdHRoaXMuaW50ZXJ2YWw7XG59XG5cbi8vINCf0L7RgdGC0LDQstC40YLRjCDQv9GA0L7Qt9GA0LDRh9C90YPRjiDQv9C70LDRiNC60YMg0L3QsCBib2R5LCBcbi8vINGH0YLQvtCxINCy0L4g0LLRgNC10LzRjyDQv9C70LDQstC90L7Qs9C+INC/0LXRgNC10LzQtdGJ0LXQvdC40Y8g0L3QtdC70YzQt9GPINCx0YvQu9C+INC10YnRkSDRgNCw0LcgXG4vLyDQvdCw0LbQsNGC0Ywg0L3QsCDQutC90L7Qv9C60YMg0L/QtdGA0LXQvNC10YnQtdC90LjRj1xuU2xpZGVyLnByb3RvdHlwZS5jYW5jZWxDbGljayA9IGZ1bmN0aW9uKCkge1xuXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2JvZHktYmcnKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2JvZHktYmcnKTtcblx0fSwgNTAwKTtcbn07XG5cbi8vINCU0L7QsdCw0LLQu9GP0LXQvCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQtNCy0LjQttC10L3QuNGPLCDQtdGB0LvQuCDQsiDQvtC/0YbQuNGP0YUg0YPQutCw0LfQsNC90L4gYXJyb3dzOiB0cnVlICjQv9C+INGD0LzQvtC70YcpXG5TbGlkZXIucHJvdG90eXBlLmFkZEFycm93cyA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLnNldHRpbmdzLmFycm93cyl7XG5cdFx0dGhpcy4kc2xpZGVyLmFmdGVyKCc8YSBocmVmPVwiI1wiIGRhdGEtc2xpZGU9XCIxXCIgY2xhc3M9XCJzbGlkZXItYXJyb3dcIj48L2E+PGEgaHJlZj1cIiNcIiBkYXRhLXNsaWRlPVwiLTFcIiBjbGFzcz1cInNsaWRlci1hcnJvd1wiPjwvYT4nKTtcblx0fVxufTtcblxuLy8g0KPRgdGC0LDQvdC+0LLQuNGC0Ywg0LDRgdGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9Cw0LnQtFxuLy8g0KHQu9Cw0LnQtCDQstGL0YfQuNGB0LvRj9C10YLRgdGPINC/0L4g0LjQvdC00LXQutGB0YMsINCz0LTQtSDQuNC90LTQtdC60YEgLSDRjdGC0L4gYWN0aXZlUG9zINCyIG9wdGlvbnNcbi8vINCYINC/0LXRgNC10LzQtdGJ0LDQtdGC0YHRjyDQvdCwINCw0LrRgtC40LLQvdGL0Lkg0YHQu9Cw0LnQtFxuU2xpZGVyLnByb3RvdHlwZS5zZXRBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLiRzbGlkZXIuY2hpbGRyZW4oJypbZGF0YS1pdGVtPVwiJysgdGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgKydcIl0nKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy5tb3ZlKHRoaXMuaW5kZXhBY3RpdmVTbGlkZSk7XG59O1xuXG4vLyDQo9C30L3QsNGC0Ywg0LjQvdC00LXQutGBINGC0LXQutGD0YnQtdCz0L4g0LDQutGC0LjQstC90L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5nZXRJbmRleEFjdGl2ZVNsaWRlID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLiRzbGlkZXIuY2hpbGRyZW4oJy4nICsgdGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykuaW5kZXgoKTtcbn07XG5cbi8vINCh0LHRgNC+0YHQuNGC0Ywg0YHQviDQstGB0LXRhSDRgdC70LDQudC00L7QsiDQsNC60YLQuNCy0L3Ri9C5INC60LvQsNGB0YFcbi8vINCf0L7RgdGC0LDQstC40YLRjCDQsNC60YLQuNCy0L3Ri9C5INC60LvQsNGB0YEg0L3QsCDRgdC70LXQtCDRgdC70LDQudC0IChuZXh0U2xpZGUgLSDRgdC70LXQtC4g0LjQvdC00LXQutGBKVxuU2xpZGVyLnByb3RvdHlwZS5jaGFuZ2VBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKG5leHRTbGlkZSkge1xuXHR0aGlzLiRhcnJTbGlkZXMuc2libGluZ3MoKS5yZW1vdmVDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy4kYXJyU2xpZGVzLmVxKG5leHRTbGlkZSkuYWRkQ2xhc3ModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG59O1xuXG4vLyDQndC10LfQsNC80LXRgtC90L7QtSDQv9C10YDQtdC80LXRidC10L3QuNC1INGB0LvQsNC50LTQtdGA0LBcbi8vINCU0LXQu9Cw0LXRgtGB0Y8g0LTQu9GPINGC0L7Qs9C+LCDRh9GC0L7QsdGLINC/0LXRgNC10LzQtdGB0YLQuNGC0Ywg0YHQu9Cw0LnQtNC10YAsINC60L7Qs9C00LAgXG4vLyDQvtC9INC00L7RgdGC0LjQsyDQuNC70Lgg0L/QvtGB0LvQtdC00L3QtdCz0L4sINC40LvQuCDQv9C10YDQstC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUuaW52aXNpYmxlTW92ZVNsaWRlciA9IGZ1bmN0aW9uKGluZGV4UG9zaXRpb24sIG1vdmluZ1Bvc2l0aW9uKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHRoaXMubW92ZShpbmRleFBvc2l0aW9uLCBmdW5jdGlvbigpIHtcblx0XHRfdGhpcy4kc2xpZGVyLmNzcyh7XG5cdFx0XHQnbGVmdCc6IC1fdGhpcy5zbGlkZVdpZHRoICogbW92aW5nUG9zaXRpb25cblx0XHR9KTtcblx0XHRfdGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShtb3ZpbmdQb3NpdGlvbik7XG5cdH0pO1xufTtcblxuLy8g0J/RgNC+0LLQtdGA0LrQsCDQuNC90LTQtdC60YHQsCDRgdC70LXQtCDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUuY2hlY2tTbGlkZSA9IGZ1bmN0aW9uKGRhdGFTbGlkZSkge1xuXHR2YXIgX2RhdGFTbGlkZSA9IGRhdGFTbGlkZSB8fCAxLFxuXHRcdCAgX25leHRTbGlkZSA9IHRoaXMuZ2V0SW5kZXhBY3RpdmVTbGlkZSgpICsgX2RhdGFTbGlkZTtcblxuXHRpZiAoX25leHRTbGlkZSA9PSB0aGlzLnNsaWRlRW5kSW5kZXgpIHtcblx0XHR0aGlzLmludmlzaWJsZU1vdmVTbGlkZXIoX25leHRTbGlkZSwgdGhpcy5zbGlkZVN0YXJ0SW5kZXgpO1xuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IDA7XG5cdH0gZWxzZSBpZiAoX25leHRTbGlkZSA9PSAodGhpcy5zbGlkZVN0YXJ0SW5kZXgtMSkpIHtcblx0XHR0aGlzLmludmlzaWJsZU1vdmVTbGlkZXIoX25leHRTbGlkZSwgdGhpcy5zbGlkZUVuZEluZGV4LTEpO1x0XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gdGhpcy5hcnJOYXZFbExlbmd0aCAtIDE7XG5cdH1cdGVsc2Uge1xuXHRcdHRoaXMubW92ZShfbmV4dFNsaWRlKTtcblx0XHR0aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKF9uZXh0U2xpZGUpO1xuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IF9uZXh0U2xpZGUgLSAyO1xuXHR9XHRcblxuXHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuYmFsbEFjdGl2ZVBvcywgZmFsc2UpO1xufTtcblxuLy8g0J/Qu9Cw0LLQvdC+0LUg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXG4vLyDQn9Cw0YDQsNC80LXRgtGA0Ys6IGluZGV4UG9zIC0g0LjQvdC00LXQutGBINCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGluZGV4UG9zLCBjYWxsYmFjaykge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHR0aGlzLiRzbGlkZXIudHJhbnNpdGlvbih7XG5cdFx0J2xlZnQnOiAtX3RoaXMuc2xpZGVXaWR0aCAqIGluZGV4UG9zXG5cdH0sIDUwMCwgZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSBjYWxsYmFjaygpO1xuXHR9KTtcdFxufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YLQsNC50LzQtdGA0LAg0LTQu9GPINCw0LLRgtC+0L3QvtC80L3QvtCz0L4g0L/QtdGA0LXQvNC10YnQtdC90LjRjyDRgdC70LDQudC00LXRgNCwXG5TbGlkZXIucHJvdG90eXBlLnN0YXJ0VGltZXIgPSBmdW5jdGlvbih0aW1lciwgZnVuYykge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHRyZXR1cm4gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF90aGlzLmNoZWNrU2xpZGUoKTtcblx0XHRcdH0sIF90aGlzLnNldHRpbmdzLnRpbWVTdGVwKTtcbn07XG5cbi8vINCg0LDQsdC+0YLQsCDRgSDQvdC40LbQvdC10Lkg0L3QsNCy0LjQs9Cw0YbQuNC10Lko0YPRgdGC0LDQvdC+0LLQutCwLCDQv9C10YDQtdC80LXRidC10L3QuNC1INC6INGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0LXQvNGDINGI0LDRgNC40LrRgyDRgdC70LDQudC00YMpXG5TbGlkZXIucHJvdG90eXBlLmJhbGxzU2V0QWN0aXZlID0gZnVuY3Rpb24oZGF0YVNsaWRlLCBtb3ZlU2xpZGVyKSB7XG5cdHZhciBfYmFsbHNDbGFzcyAgICAgICAgPSB0aGlzLnNldHRpbmdzLmJhbGxzQ2xhc3MsXG5cdFx0ICBfYmFsbHNDbGFzc0FjdGl2ZSAgPSBfYmFsbHNDbGFzcyArICctYWN0aXZlJyxcblx0XHQgIF9hcnJheUJhbGxzICAgICAgICA9IHRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgX2FycmF5QmFsbHMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoX2FycmF5QmFsbHMuZXEoaSkuaGFzQ2xhc3MoX2JhbGxzQ2xhc3MpKSB7XG5cdFx0XHRfYXJyYXlCYWxscy5lcShpKS5yZW1vdmVDbGFzcyhfYmFsbHNDbGFzc0FjdGl2ZSk7XG5cdFx0fVxuXHR9XG5cblx0X2FycmF5QmFsbHMuZXEoZGF0YVNsaWRlKS5hZGRDbGFzcyhfYmFsbHNDbGFzc0FjdGl2ZSk7XG5cblx0dGhpcy5iYWxsQWN0aXZlUG9zID0gZGF0YVNsaWRlICsgMTtcblxuXHRpZiAobW92ZVNsaWRlcikge1xuXHRcdHRoaXMubW92ZShkYXRhU2xpZGUgKyAyKTtcblx0XHR0aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKGRhdGFTbGlkZSArIDIpO1xuXHR9XG59O1xuXG5TbGlkZXIucHJvdG90eXBlLmNoYW5nZU9wYWNpdHkgPSBmdW5jdGlvbigpIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdF90aGlzLiRzbGlkZXIuY3NzKCdvcGFjaXR5JywgMSk7XG5cdH0sIDUwMCk7XG59XG5cbi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6INC60LvQuNC60LAg0L3QsCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQutC70Y7Rh9C10L3QuNGPXG5TbGlkZXIucHJvdG90eXBlLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuc2xpZGVyLWFycm93JywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF9kYXRhU2xpZGUgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ3NsaWRlJykpO1xuXHRcdGNsZWFySW50ZXJ2YWwoX3RoaXMuaW50ZXJ2YWwpO1xuXG5cdFx0X3RoaXMuY2FuY2VsQ2xpY2soKTtcblx0XHRfdGhpcy5jaGVja1NsaWRlKF9kYXRhU2xpZGUpO1xuXHRcdF90aGlzLmJhbGxzU2V0QWN0aXZlKF90aGlzLmJhbGxBY3RpdmVQb3MtMSwgZmFsc2UpOyAvLyBiYWxsQWN0aXZlUG9zIC0gMSwg0YLQuiDQv9GA0Lgg0L/QtdGA0LXQvNC10YnQtdC90LjQuCDRgdC70LDQudC00LXRgNCwINC+0L0g0YPQstC10LvQuNGH0LjQu9GB0Y8g0L3QsCAxKGNoZWNrU2xpZGUtPmJhbGxzU2V0QWN0aXZlKSBcblxuXHRcdF90aGlzLmludGVydmFsID0gX3RoaXMuc3RhcnRUaW1lcihfdGhpcy5pbnRlcnZhbCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuc2xpZGVyLW5hdmlnYXRpb24tY2lyY2xlJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF9kYXRhU2xpZGUgICAgICAgID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdzbGlkZScpKSxcblx0XHRcdFx0X2JhbGxzQ2xhc3NBY3RpdmUgPSBfdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzICsgJy1hY3RpdmUnO1xuXG5cdFx0aWYgKCQodGhpcykuaGFzQ2xhc3MoX2JhbGxzQ2xhc3NBY3RpdmUpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBcblxuXHRcdGNsZWFySW50ZXJ2YWwoX3RoaXMuaW50ZXJ2YWwpO1xuXHRcdF90aGlzLmJhbGxzU2V0QWN0aXZlKF9kYXRhU2xpZGUsIHRydWUpO1xuXHRcdF90aGlzLmludGVydmFsID0gX3RoaXMuc3RhcnRUaW1lcihfdGhpcy5pbnRlcnZhbCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YHQu9Cw0LnQtNC10YDQsFxuU2xpZGVyLnByb3RvdHlwZS5pbml0U2xpZGVyID0gZnVuY3Rpb24oKXtcblx0dmFyIF90aGlzID0gdGhpcztcblx0aWYgKCh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA+IHRoaXMuJGFyclNsaWRlc0RlZi5sZW5ndGgpIHx8ICh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA8IDApKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgcG9zaXRpb24gdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRpZiAodGhpcy5jb3VudFNsaWRlcyA9PT0gMCkge1xuXHRcdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MpO1xuXHRcdHRoaXMuY2hhbmdlT3BhY2l0eSgpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHRoaXMuYWRkQXJyb3dzKCk7XG5cdHRoaXMuc2V0QWN0aXZlU2xpZGUoKTtcdFxuXHR0aGlzLmNsaWNrSGFuZGxlcigpO1xuXHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zKTtcblx0dGhpcy5jaGFuZ2VPcGFjaXR5KCk7XG5cdHRoaXMuaW50ZXJ2YWwgPSB0aGlzLnN0YXJ0VGltZXIodGhpcy5pbnRlcnZhbCk7XG5cblx0XG59OyIsImZ1bmN0aW9uIFByZXZTbGlkZXIoYXJyYXlVcmxzKSB7XHJcblx0dGhpcy5hcnJheVVybHMgPSBhcnJheVVybHM7XHJcblx0dGhpcy5hcnJMZW5ndGggPSBhcnJheVVybHMubGVuZ3RoO1xyXG59XHJcblxyXG4vLyDQo9C00LDQu9GP0LXQvCDQuNC3INGB0YLRgNC+0LrQuCDQu9C40YjQvdC40LUg0YHQuNC80LLQvtC70YtcclxuUHJldlNsaWRlci5wcm90b3R5cGUuZGVsZXRlVGFicyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBfYXJyYXlVcmxzID0gdGhpcy5hcnJheVVybHM7XHJcblx0cmV0dXJuIF9hcnJheVVybHMucmVwbGFjZSgvXFxzfFxcW3xcXF18XFwnfFxcJy9nLCAnJyk7XHJcbn07XHJcblxyXG4vLyDQpNC+0YDQvNC40YDRg9C10Lwg0LjQtyDRgdGC0YDQvtC60Lgg0LzQsNGB0YHQuNCyXHJcblByZXZTbGlkZXIucHJvdG90eXBlLnN0cmluZ1RvQXJyYXkgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgX2lucHV0U3RyaW5nID0gdGhpcy5kZWxldGVUYWJzKCk7XHJcblxyXG5cdGlmIChfaW5wdXRTdHJpbmcgPT09ICcnKSByZXR1cm4gZmFsc2U7XHJcblx0X2lucHV0U3RyaW5nID0gX2lucHV0U3RyaW5nLnNwbGl0KCcsJyk7XHJcblxyXG5cdHJldHVybiBfaW5wdXRTdHJpbmc7XHJcbn07XHJcblxyXG4vLyDQpNC+0YDQvNC40YDRg9C10Lwg0LzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIgXHJcbi8vINCd0LAg0LLRhdC+0LQg0LjQvdC00LXQutGBINCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LAo0YLQvtGCLCDQutC+0YLQvtGA0YvQuSDQsdGD0LTQtdGCINC/0L7QutCw0LfRi9Cy0LDRgtGM0YHRjyDQv9C10YDQstGL0LwpXHJcblByZXZTbGlkZXIucHJvdG90eXBlLmFycmF5VG9BcnJPYmpzID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIF9hcnJPYmplY3RzICA9IFtdLFxyXG5cdFx0ICBfYXJyVXJscyAgICAgPSB0aGlzLnN0cmluZ1RvQXJyYXkoKTtcclxuXHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBfYXJyVXJscy5sZW5ndGg7IGkrKykge1xyXG5cdFx0X2Fyck9iamVjdHNbaV0gPSB7IFxyXG5cdFx0XHRmb3RvOiBfYXJyVXJsc1tpXSxcclxuXHRcdFx0Y29tbWVudDogJycsXHJcblx0XHRcdGxpbms6ICcnXHJcblx0XHR9O1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gX2Fyck9iamVjdHM7XHJcbn07XHJcblxyXG4vLyDQmtC+0L/QuNGA0L7QstCw0L3QuNC1INC80LDRgdGB0LjQstCwINC+0LHRitC10LrRgtC+0LIuXHJcbi8vINCU0LvRjyDRgtC+0LPQviwg0YfRgtC+0LEg0LzQvtC20L3QviDQsdGL0LvQviDQv9C10YDQtdC80LXRidCw0YLRjNGB0Y8g0LzQtdC20LTRgyDRiNCw0LPQsNC80LhcclxuUHJldlNsaWRlci5wcm90b3R5cGUuY29weUFycmF5T2JqcyA9IGZ1bmN0aW9uKGFycmF5T2Jqcykge1xyXG5cdGlmICghYXJyYXlPYmpzIHx8ICdvYmplY3QnICE9PSB0eXBlb2YgYXJyYXlPYmpzKSB7XHRcclxuXHQgIHJldHVybiBhcnJheU9ianM7XHJcblx0fVxyXG5cclxuXHR2YXIgX25ld0FycmF5ID0gKCdmdW5jdGlvbicgPT09IHR5cGVvZiBhcnJheU9ianMucG9wKSA/IFtdIDoge307XHJcblx0dmFyIF9wcm9wLCBfdmFsdWU7XHJcblxyXG5cdGZvciAoX3Byb3AgaW4gYXJyYXlPYmpzKSB7XHJcblx0XHRpZiAoYXJyYXlPYmpzLmhhc093blByb3BlcnR5KF9wcm9wKSkge1xyXG5cdFx0ICBfdmFsdWUgPSBhcnJheU9ianNbX3Byb3BdO1xyXG5cdFx0ICBpZiAoX3ZhbHVlICYmICdvYmplY3QnID09PSB0eXBlb2YgX3ZhbHVlKSB7XHJcblx0XHRcdCAgICBfbmV3QXJyYXlbX3Byb3BdID0gdGhpcy5jb3B5QXJyYXlPYmpzKF92YWx1ZSk7XHJcblx0XHRcdCAgfSBlbHNlIHtcclxuXHRcdFx0ICAgIF9uZXdBcnJheVtfcHJvcF0gPSBfdmFsdWU7XHJcblx0XHRcdCAgfVxyXG5cdCAgICB9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gX25ld0FycmF5O1xyXG5cclxuXHQgLy8gcmV0dXJuIFtdLmNvbmNhdChhcnJheU9ianMpOyAvLyDQtdGB0LvQuCDQvdCw0LTQviDQsdGD0LTQtdGCINGB0L7RhdGA0LDQvdGP0YLRjCDRg9C20LUg0LfQsNC/0LjRgdCw0L3QvdGL0LUg0L/QvtC70Y9cclxufTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuXHR2YXIgdGVtcGxhdGVzID0ge1xuXHRcdGlucHV0TGlua3M6IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjaW5wdXRMaW5rcycpLmh0bWwoKSksXG5cdFx0ZXJyb3I6ICAgICAgSGFuZGxlYmFycy5jb21waWxlKCQoJyNlcnJvclBvcFVwJykuaHRtbCgpKSxcblx0XHRwcmV3aWV3czogICBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3ByZXdpZXdzJykuaHRtbCgpKSxcblx0XHRzbGlkZXJMaXN0OiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3NsaWRlckxpc3QnKS5odG1sKCkpXG5cdH07XG5cblx0dmFyIHN0b3JlVGVtcGxhdGVzID0ge307IC8vINCl0YDQsNC90LjQu9C40YnQtSDQutC+0L/QuNC5INC+0LHRitC10LrRgtC+0LIg0LTQu9GPINGC0L7Qs9C+LCDRh9GC0L7QsSDQvNC+0LbQvdC+INCx0YvQu9C+INC/0LXRgNC10LzQtdGJ0LDRgtGM0YHRjyDQv9C+INGI0LDQs9Cw0LxcblxuXHR2YXIgZXJyb3JIYW5kbGVyID0gbmV3IEVycm9ySGFuZGxlcignLmVyck1lcycsIHRlbXBsYXRlcy5lcnJvciksXG5cdFx0ICBwcmV2U2xpZGVyLFxuXHRcdCAgYWN0aXZlSW5kZXgsXG5cdFx0ICAkYWN0aXZlUmFkaW9CdG4sXG5cdFx0ICBvYmpTbGlkZXM7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy53ci1mb3JtX2RhdGFzLWJ0bicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpbnB1dFN0ciAgPSAkKCcud3ItZm9ybV9kYXRhcy1pbnAnKS52YWwoKTtcblx0XHRcblx0XHRwcmV2U2xpZGVyICA9IG5ldyBQcmV2U2xpZGVyKGlucHV0U3RyKTtcblx0XHRvYmpTbGlkZXMgICA9IHByZXZTbGlkZXIuYXJyYXlUb0Fyck9ianMoKTsgXG5cblx0XHRzdG9yZVRlbXBsYXRlcy5wcmV3aWV3cyA9IHByZXZTbGlkZXIuY29weUFycmF5T2JqcyhvYmpTbGlkZXMpO1xuXG5cdFx0aWYgKCFvYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRlcnJvckhhbmRsZXIuZ2VuZXJhdGVFcnJvcih7XG5cdFx0XHRcdHRpdGxlOiAn0J7RiNC40LHQutCwJywgXG5cdFx0XHRcdG1lc3NhZ2U6ICfQktCy0LXQtNC40YLQtSDQtNCw0L3QvdGL0LUnXG5cdFx0XHR9LCAnRGF0YXMgaXMgZW1wdHknKTtcblx0XHR9XG5cblx0XHRmYWRlQmxvY2soJCgnLndyLWZvcm1fZGF0YXMnKSwgMiwgZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCcud3JhcHBlcicpLnByZXBlbmQodGVtcGxhdGVzLnByZXdpZXdzKG9ialNsaWRlcykpLmZhZGVJbig1MDApO1xuXHRcdH0pO1xuXHRcdFxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcud3ItYmxvY2stc2VsZWN0X2FjdGl2ZS1yYWRpbycsIGZ1bmN0aW9uKCkge1x0XG5cdFx0YWN0aXZlSW5kZXggPSBwYXJzZUludCgkKHRoaXMpLnZhbCgpKTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy53ci1ibG9jay1kZWxldGUnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgaXRlbSAgICAgID0gJCh0aGlzKS5kYXRhKCdpdGVtJyksXG5cdFx0XHQgIHdpblNjclRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuXHRcdG9ialNsaWRlcy5zcGxpY2UoaXRlbSwgMSk7XG5cblx0XHQkKCcud3JhcHBlcicpLmh0bWwoJycpLmFwcGVuZCh0ZW1wbGF0ZXMucHJld2lld3Mob2JqU2xpZGVzKSk7XG5cdFx0JCh3aW5kb3cpLnNjcm9sbFRvcCh3aW5TY3JUb3ApO1xuXG5cdFx0YWN0aXZlSW5kZXggPSBzZWxlY3RBY3RpdmVBZnRlckRlbChpdGVtLCBhY3RpdmVJbmRleCk7XG5cdFx0aWYgKGFjdGl2ZUluZGV4ICE9IG51bGwpIHtcblx0XHRcdCQoJy53ci1ibG9jaycpLmVxKGFjdGl2ZUluZGV4KS5maW5kKCcud3ItYmxvY2stc2VsZWN0X2FjdGl2ZS10ZXh0JykudHJpZ2dlcignY2xpY2snKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YWN0aXZlSW5kZXggPSAwO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcud3ItYmxvY2stY29tbWVudC1sYi1pbnAnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgbnVtYmVyQ29tbWVudCA9IHBhcnNlSW50KCQodGhpcykuZGF0YSgnY29tbWVudCcpKSxcblx0XHRcdCAgdGV4dENvbW1lbnQgICA9ICQodGhpcykudmFsKCk7XG5cblx0XHRvYmpTbGlkZXNbbnVtYmVyQ29tbWVudF0uY29tbWVudCA9IHRleHRDb21tZW50O1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy53ci1ibG9jay1saW5rLWxiLWlucCcsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBudW1iZXJDb21tZW50ID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdsaW5rJykpLFxuXHRcdFx0IHRleHRDb21tZW50ICAgPSAkKHRoaXMpLnZhbCgpO1xuXG5cdFx0b2JqU2xpZGVzW251bWJlckNvbW1lbnRdLmxpbmsgPSB0ZXh0Q29tbWVudDtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5nZW5lcmF0ZS1zbGlkZXInLCBmdW5jdGlvbigpIHtcblx0XHRhY3RpdmVJbmRleCA9IChhY3RpdmVJbmRleCA9PT0gdW5kZWZpbmVkKSA/IDAgOiBhY3RpdmVJbmRleDtcblxuXHRcdGlmICghb2JqU2xpZGVzLmxlbmd0aCkge1xuXHRcdFx0ZXJyb3JIYW5kbGVyLmdlbmVyYXRlRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0J3QtdGCINC90Lgg0L7QtNC90L7Qs9C+INGB0LvQsNC50LTQsCdcblx0XHRcdH0sICdEYXRhcyBpcyBlbXB0eScpO1xuXHRcdH1cblxuXHRcdGZhZGVCbG9jaygkKCcud3ItYmxvY2tzLXcnKSwgMSwgZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCcud3JhcHBlcicpLmFwcGVuZCh0ZW1wbGF0ZXMuc2xpZGVyTGlzdChvYmpTbGlkZXMpKS5mYWRlSW4oNTAwLCBmdW5jdGlvbigpIHtcdFxuXG5cdFx0XHRcdHZhciBzbGlkZXIgPSBuZXcgU2xpZGVyKCQoJy5zbGlkZXInKSwge1xuXHRcdFx0XHRcdGFjdGl2ZUNsYXNzOiAnc2xpZGVyLWFjdGl2ZScsXG5cdFx0XHRcdFx0YWN0aXZlUG9zOiBhY3RpdmVJbmRleFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRzbGlkZXIuaW5pdFNsaWRlcigpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuc3RlcC1kb3duJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRvQmxvY2sgPSAkKHRoaXMpLmRhdGEoJ3RvJyk7XG5cblx0XHRvYmpTbGlkZXMgPSBwcmV2U2xpZGVyLmNvcHlBcnJheU9ianMoc3RvcmVUZW1wbGF0ZXNbdG9CbG9ja10pO1xuXHRcdGFjdGl2ZUluZGV4ID0gMDtcblx0XHQkKCcud3JhcHBlcicpLmh0bWwoIHJldHVybkJsb2NrKCB0b0Jsb2NrLCB0ZW1wbGF0ZXMsIHN0b3JlVGVtcGxhdGVzW3RvQmxvY2tdICkpO1xuXHR9KTtcblxuXHQvLyDQmNGJ0LXRgiDQsNC60YLQuNCy0L3Ri9C5INGB0LvQsNC50LQg0L/QvtGB0LvQtSDRg9C00LDQu9C10L3QuNGPINGF0L7RgtGMINC+0LTQvdC+0LPQviDQv9GA0LXQstGM0Y5cblx0ZnVuY3Rpb24gc2VsZWN0QWN0aXZlQWZ0ZXJEZWwoaXRlbSwgYWN0aXZlSW5kZXgpIHtcblx0XHRpZiAoaXRlbSA9PSBhY3RpdmVJbmRleCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSBlbHNlIGlmIChpdGVtIDwgYWN0aXZlSW5kZXgpIHtcblx0XHRcdHJldHVybiBhY3RpdmVJbmRleCAtIDE7XG5cdFx0fSBlbHNlIGlmIChpdGVtID4gYWN0aXZlSW5kZXgpe1xuXHRcdFx0cmV0dXJuIGFjdGl2ZUluZGV4O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHQvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0YDQtdC90LTQtdGA0LjRgiDRiNCw0LHQu9C+0L0g0L/RgNC4INCy0L7Qt9Cy0YDQsNGJ0LXQvdC40Lgg0Log0L/RgNC10LTRi9C00YPRidC10LzRgyDRiNCw0LPRg1xuXHRmdW5jdGlvbiByZXR1cm5CbG9jayhuYW1lVGVtcCwgbXlUZW1wbGF0ZXMsIG9wdGlvbnMpIHtcblx0XHR2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRpZiAobXlUZW1wbGF0ZXMuaGFzT3duUHJvcGVydHkobmFtZVRlbXApKSB7XG5cdFx0XHRyZXR1cm4gbXlUZW1wbGF0ZXNbbmFtZVRlbXBdKG9wdGlvbnMpO1xuXHRcdH1cblx0fVxuXHRcblx0Ly8g0J/QtdGA0LXQvNC10YnQtdC90LjQtSDQsdC70L7QutCwLCDRgSDQv9C+0YHQu9C10LTRg9GO0YnQuNC8INC10LPQviDRg9C00LDQu9C10L3QuNC10Lwg0LjQtyBET01cblx0ZnVuY3Rpb24gYmxvY2tNb3ZlKCRibG9jaywgbW92ZVRvLCBvZmZzZXQpIHtcblx0XHR2YXIgbW92ZVRvID0gbW92ZVRvIHx8ICd0b3AnLFxuXHRcdFx0b2Zmc2V0ID0gb2Zmc2V0IHx8IC0xMDAwO1xuXHRcdCRibG9jay5jc3MobW92ZVRvLCBvZmZzZXQpLmZhZGVPdXQoMTAwLCBmdW5jdGlvbigpIHtcblx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyDQntC/0YDQtdC00LXQu9C10L3QuNC1INGB0L/QvtGB0L7QsdCwINC/0LXRgNC10LzQtdGJ0LXQvdC40Y9cblx0ZnVuY3Rpb24gZmFkZUJsb2NrKCRibG9jaywgYW5pbWF0aW9uLCBjYWxsYmFjaykgeyAvLyBhbmltYXRpb24g0LzQvtC20LXRgiDQsdGL0YLRjCAxPXVwLCAyPXJpZ2h0XG5cdFx0dmFyIGFuaW1hdGlvbiAgICAgID0gYW5pbWF0aW9uIHx8IDE7XG5cblx0XHRzd2l0Y2goYW5pbWF0aW9uKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdGJsb2NrTW92ZSgkYmxvY2ssICd0b3AnKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0YmxvY2tNb3ZlKCRibG9jaywgJ3JpZ2h0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRpZihjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2soKTtcblx0fVxuXG5cdC8vINCl0LXQu9C/0LXRgCwg0LrQvtGC0L7RgNGL0Lkg0LTQvtCx0LDQstC70Y/QtdGCIDIg0L/QvtGB0LvQtdC00L7QstCw0YLQtdC70YzQvdGL0YUg0YHQu9Cw0LnQtNCwIFxuXHQvLyBwb3NpdGlvbiAtINC90LDRh9Cw0LvQviDQv9C+0LfQuNGG0LjQuCDRgdC70LDQudC00LAsINC60L7RgtC+0YDRi9C5INC90LDQtNC+INC00L7QsdCw0LLQuNGC0YwsIG9iaiAtINGB0LDQvCDRgdC70LDQudC0XG5cdEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2FkZFNsaWRlcycsIGZ1bmN0aW9uKG9iaiwgcG9zaXRpb24pIHtcblx0XHR2YXIgcmV0dXJuaW5nU3RyID0gJycsXG5cdFx0XHRwb3NpdGlvbiAgICAgPSBwb3NpdGlvbiAtIDI7XG5cblx0XHRpZiAob2JqLmxlbmd0aCA8IDIpIHJldHVybiAnJztcblxuXHRcdGZvciAodmFyIGkgPSAyLCBqID0gcG9zaXRpb247IGkgPiAwOyBpLS0sIGorKyApIHsgXG5cdFx0XHRyZXR1cm5pbmdTdHIgKz0gJzxsaSBjbGFzcz1cInNsaWRlci1pbWdcIlwiPjxpbWcgc3JjPVwiJyArIG9ialtqXS5mb3RvICsgJ1wiIGFsdD1cIlwiLz4nO1xuXHRcdFx0XG5cdFx0XHRpZiAob2JqW2pdLmNvbW1lbnQubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybmluZ1N0ciArPSAnPGRpdiBjbGFzcz1cInNsaWRlci1pbWctY29tbWVudFwiPicgKyBvYmpbal0uY29tbWVudCArICc8L2Rpdj4nO1xuXHRcdFx0XHRyZXR1cm5pbmdTdHIgKz0gJzwvbGk+Jztcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcocmV0dXJuaW5nU3RyKTtcblx0fSk7XG5cblx0Ly8g0JXRgdC70Lgg0LXRgdGC0Ywg0L/QvtC70LUgbGluaywg0YLQviDQvtCx0LXRgNC90YPRgtGMINC60L7QvdGC0LXQutGB0YIg0LIg0YHRgdGL0LvQutGDXG5cdEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3dyYXBMaW5rJywgZnVuY3Rpb24obGluaywgb3B0aW9ucykge1xuXHRcdHZhciByZXR1cm5pbmdTdHI7XG5cblx0XHRpZiAobGluay5sZW5ndGgpIHtcblx0XHRcdHJldHVybmluZ1N0ciA9ICc8YSBocmVmPVwiJysgbGluayArJ1wiPicgKyBvcHRpb25zLmZuKHRoaXMpICsgJzwvYT4nO1xuXHRcdFx0cmV0dXJuIHJldHVybmluZ1N0cjtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcblx0fSk7XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
