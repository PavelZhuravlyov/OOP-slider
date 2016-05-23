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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwicHJldlNsaWRlci5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g0J7QsdGA0LDQsdC+0YLRh9C40Log0L7RiNC40LHQvtC6XHJcbmZ1bmN0aW9uIEVycm9ySGFuZGxlcihjbGFzc0VycldpbmRvdywgdGVtcGxhdGVQb3BVcCkge1xyXG5cdHRoaXMudGltZUhpZGUgICAgICAgPSAyMDAwO1xyXG5cdHRoaXMuY2xhc3NFcnJXaW5kb3cgPSBjbGFzc0VycldpbmRvdztcclxuXHR0aGlzLnRlbXBsYXRlUG9wVXAgID0gdGVtcGxhdGVQb3BVcDtcclxufVxyXG5cclxuLy8g0KDQtdC90LTQtdGA0LjQvdCzINGI0LDQsdC70L7QvdCwINC+0YjQuNCx0L7QulxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLm5ld0Vycm9yID0gZnVuY3Rpb24oZXJyb3JPYmplY3QpIHtcclxuXHRyZXR1cm4gdGhpcy50ZW1wbGF0ZVBvcFVwKGVycm9yT2JqZWN0KTtcclxufTtcclxuXHJcbi8vINCh0LrRgNGL0LLQsNC10Lwg0Lgg0YPQtNCw0LvRj9C10Lwg0L/Qu9Cw0YjQutGDINC+0YjQuNCx0LrQuCDRh9C10YDQtdC3IHRpbWVIaWRlIFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmhpZGVFcnJvcldpbmRvdyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBfZXJyV2luZG93ID0gJCh0aGlzLmNsYXNzRXJyV2luZG93KTtcclxuXHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdF9lcnJXaW5kb3cuZmFkZU91dCh0aGlzLnRpbWVIaWRlLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0X2VycldpbmRvdy5yZW1vdmUoKTtcclxuXHRcdH0pO1xyXG5cdH0sIHRoaXMudGltZUhpZGUpO1xyXG59O1xyXG5cclxuLy8g0J/RgNC4INCy0L7Qt9C90LjQutC90L7QstC10L3QuNC4INC+0YjQuNCx0LrQuCDQstGL0LLQtdGB0YLQuCDQv9C70LDRiNC60YMg0Lgg0YPQtNCw0LvQuNGC0YxcclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5jYXVnaHRFcnIgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblx0JCgnYm9keScpLmFwcGVuZCh0aGlzLm5ld0Vycm9yKG9wdGlvbnMpKTtcclxuXHR0aGlzLmhpZGVFcnJvcldpbmRvdygpO1xyXG59O1xyXG5cclxuLy8g0KTRg9C90LrRhtC40Y8g0LLRi9C30L7QstCwINC+0YjQuNCx0LrQuFxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmdlbmVyYXRlRXJyb3IgPSBmdW5jdGlvbihlcnJvck9wdCwgY29uc29sZU1lc3NhZ2UpIHtcclxuXHR0aGlzLmNhdWdodEVycihlcnJvck9wdCk7XHJcblx0dGhyb3cgbmV3IEVycm9yKGNvbnNvbGVNZXNzYWdlIHx8ICdFcnJvcicpO1xyXG59OyIsImZ1bmN0aW9uIFNsaWRlcihzbGlkZXIsIG9wdGlvbnMpIHtcblx0dGhpcy4kc2xpZGVyICAgICAgICAgICAgPSBzbGlkZXI7XG5cdHRoaXMuJGFyclNsaWRlcyAgICAgICAgID0gdGhpcy4kc2xpZGVyLmNoaWxkcmVuKCk7XG5cdHRoaXMuJGFyclNsaWRlc0RlZiAgICAgID0gdGhpcy4kYXJyU2xpZGVzO1xuXHR0aGlzLmNvdW50U2xpZGVzICAgICAgICA9IHRoaXMuJGFyclNsaWRlcy5sZW5ndGggLSAxO1xuXHR0aGlzLnNldHRpbmdzICAgICAgICAgICA9ICQuZXh0ZW5kKHtcblx0ICBhY3RpdmVDbGFzcyAgICA6ICdzbGlkZXItYWN0aXZlJyxcblx0ICBiYWxsc0Jsb2NrICAgICA6ICdzbGlkZXItbmF2aWdhdGlvbicsXG5cdCAgYmFsbHNDbGFzcyAgICAgOiAnc2xpZGVyLW5hdmlnYXRpb24tY2lyY2xlJyxcblx0ICBhY3RpdmVQb3MgICAgICA6IDAsXG5cdCAgdGltZVN0ZXAgICAgICAgOiA3MDAwLFxuXHQgIHNsaWRlV2lkdGggICAgIDogdGhpcy4kYXJyU2xpZGVzLm91dGVyV2lkdGgoKSxcblx0ICBhcnJvd3MgICAgICAgICA6IHRydWVcblx0fSwgb3B0aW9ucyk7XG5cdHRoaXMuc2xpZGVXaWR0aCAgICAgICAgID0gdGhpcy5zZXR0aW5ncy5zbGlkZVdpZHRoO1xuXHR0aGlzLmluZGV4QWN0aXZlU2xpZGUgICA9IHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zICsgMjtcblx0dGhpcy5zbGlkZVN0YXJ0SW5kZXggICAgPSAyO1xuXHR0aGlzLnNsaWRlRW5kSW5kZXggICAgICA9IHRoaXMuY291bnRTbGlkZXMgLSAxO1xuXHR0aGlzLmJhbGxzQmxvY2sgICAgICAgICA9ICQoJy4nICsgdGhpcy5zZXR0aW5ncy5iYWxsc0Jsb2NrKTtcblx0dGhpcy5hcnJheU5hdmlnRWxlbWVudHMgPSB0aGlzLmJhbGxzQmxvY2suY2hpbGRyZW4oJy4nICsgdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzKTtcblx0dGhpcy5hcnJOYXZFbExlbmd0aCAgICAgPSB0aGlzLmFycmF5TmF2aWdFbGVtZW50cy5sZW5ndGg7XG5cdHRoaXMuYmFsbEFjdGl2ZVBvcyAgICAgID0gdGhpcy5zZXR0aW5ncy5hY3RpdmVQb3M7XG5cdHRoaXMuaW50ZXJ2YWw7XG59XG5cbi8vINCf0L7RgdGC0LDQstC40YLRjCDQv9GA0L7Qt9GA0LDRh9C90YPRjiDQv9C70LDRiNC60YMg0L3QsCBib2R5LCBcbi8vINGH0YLQvtCxINCy0L4g0LLRgNC10LzRjyDQv9C70LDQstC90L7Qs9C+INC/0LXRgNC10LzQtdGJ0LXQvdC40Y8g0L3QtdC70YzQt9GPINCx0YvQu9C+INC10YnRkSDRgNCw0LcgXG4vLyDQvdCw0LbQsNGC0Ywg0L3QsCDQutC90L7Qv9C60YMg0L/QtdGA0LXQvNC10YnQtdC90LjRj1xuU2xpZGVyLnByb3RvdHlwZS5jYW5jZWxDbGljayA9IGZ1bmN0aW9uKCkge1xuXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2JvZHktYmcnKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2JvZHktYmcnKTtcblx0fSwgNTAwKTtcbn07XG5cbi8vINCU0L7QsdCw0LLQu9GP0LXQvCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQtNCy0LjQttC10L3QuNGPLCDQtdGB0LvQuCDQsiDQvtC/0YbQuNGP0YUg0YPQutCw0LfQsNC90L4gYXJyb3dzOiB0cnVlICjQv9C+INGD0LzQvtC70YcpXG5TbGlkZXIucHJvdG90eXBlLmFkZEFycm93cyA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLnNldHRpbmdzLmFycm93cyl7XG5cdFx0dGhpcy4kc2xpZGVyLmFmdGVyKCc8YSBocmVmPVwiI1wiIGRhdGEtc2xpZGU9XCIxXCIgY2xhc3M9XCJzbGlkZXItYXJyb3dcIj48L2E+PGEgaHJlZj1cIiNcIiBkYXRhLXNsaWRlPVwiLTFcIiBjbGFzcz1cInNsaWRlci1hcnJvd1wiPjwvYT4nKTtcblx0fVxufTtcblxuLy8g0KPRgdGC0LDQvdC+0LLQuNGC0Ywg0LDRgdGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9Cw0LnQtFxuLy8g0KHQu9Cw0LnQtCDQstGL0YfQuNGB0LvRj9C10YLRgdGPINC/0L4g0LjQvdC00LXQutGB0YMsINCz0LTQtSDQuNC90LTQtdC60YEgLSDRjdGC0L4gYWN0aXZlUG9zINCyIG9wdGlvbnNcbi8vINCYINC/0LXRgNC10LzQtdGJ0LDQtdGC0YHRjyDQvdCwINCw0LrRgtC40LLQvdGL0Lkg0YHQu9Cw0LnQtFxuU2xpZGVyLnByb3RvdHlwZS5zZXRBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLiRzbGlkZXIuY2hpbGRyZW4oJypbZGF0YS1pdGVtPVwiJysgdGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MgKydcIl0nKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy5tb3ZlKHRoaXMuaW5kZXhBY3RpdmVTbGlkZSk7XG59O1xuXG4vLyDQo9C30L3QsNGC0Ywg0LjQvdC00LXQutGBINGC0LXQutGD0YnQtdCz0L4g0LDQutGC0LjQstC90L7Qs9C+INGB0LvQsNC50LTQsFxuU2xpZGVyLnByb3RvdHlwZS5nZXRJbmRleEFjdGl2ZVNsaWRlID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLiRzbGlkZXIuY2hpbGRyZW4oJy4nICsgdGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykuaW5kZXgoKTtcbn07XG5cbi8vINCh0LHRgNC+0YHQuNGC0Ywg0YHQviDQstGB0LXRhSDRgdC70LDQudC00L7QsiDQsNC60YLQuNCy0L3Ri9C5INC60LvQsNGB0YFcbi8vINCf0L7RgdGC0LDQstC40YLRjCDQsNC60YLQuNCy0L3Ri9C5INC60LvQsNGB0YEg0L3QsCDRgdC70LXQtCDRgdC70LDQudC0IChuZXh0U2xpZGUgLSDRgdC70LXQtC4g0LjQvdC00LXQutGBKVxuU2xpZGVyLnByb3RvdHlwZS5jaGFuZ2VBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKG5leHRTbGlkZSkge1xuXHR0aGlzLiRhcnJTbGlkZXMuc2libGluZ3MoKS5yZW1vdmVDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy4kYXJyU2xpZGVzLmVxKG5leHRTbGlkZSkuYWRkQ2xhc3ModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG59O1xuXG4vLyDQndC10LfQsNC80LXRgtC90L7QtSDQv9C10YDQtdC80LXRidC10L3QuNC1INGB0LvQsNC50LTQtdGA0LBcbi8vINCU0LXQu9Cw0LXRgtGB0Y8g0LTQu9GPINGC0L7Qs9C+LCDRh9GC0L7QsdGLINC/0LXRgNC10LzQtdGB0YLQuNGC0Ywg0YHQu9Cw0LnQtNC10YAsINC60L7Qs9C00LAgXG4vLyDQvtC9INC00L7RgdGC0LjQsyDQuNC70Lgg0L/QvtGB0LvQtdC00L3QtdCz0L4sINC40LvQuCDQv9C10YDQstC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUuaW52aXNpYmxlTW92ZVNsaWRlciA9IGZ1bmN0aW9uKGluZGV4UG9zaXRpb24sIG1vdmluZ1Bvc2l0aW9uKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHRoaXMubW92ZShpbmRleFBvc2l0aW9uLCBmdW5jdGlvbigpIHtcblx0XHRfdGhpcy4kc2xpZGVyLmNzcyh7XG5cdFx0XHQnbGVmdCc6IC1fdGhpcy5zbGlkZVdpZHRoICogbW92aW5nUG9zaXRpb25cblx0XHR9KTtcblx0XHRfdGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShtb3ZpbmdQb3NpdGlvbik7XG5cdH0pO1xufTtcblxuLy8g0J/RgNC+0LLQtdGA0LrQsCDQuNC90LTQtdC60YHQsCDRgdC70LXQtCDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUuY2hlY2tTbGlkZSA9IGZ1bmN0aW9uKGRhdGFTbGlkZSkge1xuXHR2YXIgX2RhdGFTbGlkZSA9IGRhdGFTbGlkZSB8fCAxLFxuXHRcdCAgX25leHRTbGlkZSA9IHRoaXMuZ2V0SW5kZXhBY3RpdmVTbGlkZSgpICsgX2RhdGFTbGlkZTtcblxuXHRpZiAoX25leHRTbGlkZSA9PSB0aGlzLnNsaWRlRW5kSW5kZXgpIHtcblx0XHR0aGlzLmludmlzaWJsZU1vdmVTbGlkZXIoX25leHRTbGlkZSwgdGhpcy5zbGlkZVN0YXJ0SW5kZXgpO1xuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IDA7XG5cdH0gZWxzZSBpZiAoX25leHRTbGlkZSA9PSAodGhpcy5zbGlkZVN0YXJ0SW5kZXgtMSkpIHtcblx0XHR0aGlzLmludmlzaWJsZU1vdmVTbGlkZXIoX25leHRTbGlkZSwgdGhpcy5zbGlkZUVuZEluZGV4LTEpO1x0XG5cdFx0dGhpcy5iYWxsQWN0aXZlUG9zID0gdGhpcy5hcnJOYXZFbExlbmd0aCAtIDE7XG5cdH1cdGVsc2Uge1xuXHRcdHRoaXMubW92ZShfbmV4dFNsaWRlKTtcblx0XHR0aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKF9uZXh0U2xpZGUpO1xuXHRcdHRoaXMuYmFsbEFjdGl2ZVBvcyA9IF9uZXh0U2xpZGUgLSAyO1xuXHR9XHRcblxuXHR0aGlzLmJhbGxzU2V0QWN0aXZlKHRoaXMuYmFsbEFjdGl2ZVBvcywgZmFsc2UpO1xufTtcblxuLy8g0J/Qu9Cw0LLQvdC+0LUg0L/QtdGA0LXQvNC10YnQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXG4vLyDQn9Cw0YDQsNC80LXRgtGA0Ys6IGluZGV4UG9zIC0g0LjQvdC00LXQutGBINCw0LrRgtC40LLQvdC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGluZGV4UG9zLCBjYWxsYmFjaykge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHR0aGlzLiRzbGlkZXIudHJhbnNpdGlvbih7XG5cdFx0J2xlZnQnOiAtX3RoaXMuc2xpZGVXaWR0aCAqIGluZGV4UG9zXG5cdH0sIDUwMCwgZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSBjYWxsYmFjaygpO1xuXHR9KTtcdFxufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YLQsNC50LzQtdGA0LAg0LTQu9GPINCw0LLRgtC+0L3QvtC80L3QvtCz0L4g0L/QtdGA0LXQvNC10YnQtdC90LjRjyDRgdC70LDQudC00LXRgNCwXG5TbGlkZXIucHJvdG90eXBlLnN0YXJ0VGltZXIgPSBmdW5jdGlvbih0aW1lciwgZnVuYykge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHRyZXR1cm4gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF90aGlzLmNoZWNrU2xpZGUoKTtcblx0XHRcdH0sIF90aGlzLnNldHRpbmdzLnRpbWVTdGVwKTtcbn07XG5cbi8vINCg0LDQsdC+0YLQsCDRgSDQvdC40LbQvdC10Lkg0L3QsNCy0LjQs9Cw0YbQuNC10Lko0YPRgdGC0LDQvdC+0LLQutCwLCDQv9C10YDQtdC80LXRidC10L3QuNC1INC6INGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0LXQvNGDINGI0LDRgNC40LrRgyDRgdC70LDQudC00YMpXG5TbGlkZXIucHJvdG90eXBlLmJhbGxzU2V0QWN0aXZlID0gZnVuY3Rpb24oZGF0YVNsaWRlLCBtb3ZlU2xpZGVyKSB7XG5cdHZhciBfYmFsbHNDbGFzcyAgICAgICAgPSB0aGlzLnNldHRpbmdzLmJhbGxzQ2xhc3MsXG5cdFx0ICBfYmFsbHNDbGFzc0FjdGl2ZSAgPSBfYmFsbHNDbGFzcyArICctYWN0aXZlJyxcblx0XHQgIF9hcnJheUJhbGxzICAgICAgICA9IHRoaXMuYXJyYXlOYXZpZ0VsZW1lbnRzO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgX2FycmF5QmFsbHMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoX2FycmF5QmFsbHMuZXEoaSkuaGFzQ2xhc3MoX2JhbGxzQ2xhc3MpKSB7XG5cdFx0XHRfYXJyYXlCYWxscy5lcShpKS5yZW1vdmVDbGFzcyhfYmFsbHNDbGFzc0FjdGl2ZSk7XG5cdFx0fVxuXHR9XG5cblx0X2FycmF5QmFsbHMuZXEoZGF0YVNsaWRlKS5hZGRDbGFzcyhfYmFsbHNDbGFzc0FjdGl2ZSk7XG5cblx0dGhpcy5iYWxsQWN0aXZlUG9zID0gZGF0YVNsaWRlICsgMTtcblxuXHRpZiAobW92ZVNsaWRlcikge1xuXHRcdHRoaXMubW92ZShkYXRhU2xpZGUgKyAyKTtcblx0XHR0aGlzLmNoYW5nZUFjdGl2ZVNsaWRlKGRhdGFTbGlkZSArIDIpO1xuXHR9XG59O1xuXG5TbGlkZXIucHJvdG90eXBlLmNoYW5nZU9wYWNpdHkgPSBmdW5jdGlvbigpIHtcblx0dmFyIF90aGlzID0gdGhpcztcblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdF90aGlzLiRzbGlkZXIuY3NzKCdvcGFjaXR5JywgMSk7XG5cdH0sIDUwMCk7XG59XG5cbi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6INC60LvQuNC60LAg0L3QsCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQutC70Y7Rh9C10L3QuNGPXG5TbGlkZXIucHJvdG90eXBlLkNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuc2xpZGVyLWFycm93JywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF9kYXRhU2xpZGUgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ3NsaWRlJykpO1xuXHRcdGNsZWFySW50ZXJ2YWwoX3RoaXMuaW50ZXJ2YWwpO1xuXG5cdFx0X3RoaXMuY2FuY2VsQ2xpY2soKTtcblx0XHRfdGhpcy5jaGVja1NsaWRlKF9kYXRhU2xpZGUpO1xuXHRcdF90aGlzLmJhbGxzU2V0QWN0aXZlKF90aGlzLmJhbGxBY3RpdmVQb3MtMSwgZmFsc2UpOyAvLyBiYWxsQWN0aXZlUG9zIC0gMSwg0YLQuiDQv9GA0Lgg0L/QtdGA0LXQvNC10YnQtdC90LjQuCDRgdC70LDQudC00LXRgNCwINC+0L0g0YPQstC10LvQuNGH0LjQu9GB0Y8g0L3QsCAxIFxuXG5cdFx0X3RoaXMuaW50ZXJ2YWwgPSBfdGhpcy5zdGFydFRpbWVyKF90aGlzLmludGVydmFsKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5zbGlkZXItbmF2aWdhdGlvbi1jaXJjbGUnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgX2RhdGFTbGlkZSAgICAgICAgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ3NsaWRlJykpLFxuXHRcdFx0XHRfYmFsbHNDbGFzc0FjdGl2ZSA9IF90aGlzLnNldHRpbmdzLmJhbGxzQ2xhc3MgKyAnLWFjdGl2ZSc7XG5cblx0XHRpZiAoJCh0aGlzKS5oYXNDbGFzcyhfYmFsbHNDbGFzc0FjdGl2ZSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IFxuXG5cdFx0Y2xlYXJJbnRlcnZhbChfdGhpcy5pbnRlcnZhbCk7XG5cdFx0X3RoaXMuYmFsbHNTZXRBY3RpdmUoX2RhdGFTbGlkZSwgdHJ1ZSk7XG5cdFx0X3RoaXMuaW50ZXJ2YWwgPSBfdGhpcy5zdGFydFRpbWVyKF90aGlzLmludGVydmFsKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG59O1xuXG4vLyDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDRgdC70LDQudC00LXRgNCwXG5TbGlkZXIucHJvdG90eXBlLmluaXRTbGlkZXIgPSBmdW5jdGlvbigpe1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHRpZiAoKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zID4gdGhpcy4kYXJyU2xpZGVzRGVmLmxlbmd0aCkgfHwgKHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zIDwgMCkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBwb3NpdGlvbiB1bmRlZmluZWQnKTtcblx0fVxuXG5cdGlmICh0aGlzLmNvdW50U2xpZGVzID09PSAwKSB7XG5cdFx0dGhpcy5iYWxsc1NldEFjdGl2ZSh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyk7XG5cdFx0dGhpcy5jaGFuZ2VPcGFjaXR5KCk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dGhpcy5hZGRBcnJvd3MoKTtcblx0dGhpcy5zZXRBY3RpdmVTbGlkZSgpO1x0XG5cdHRoaXMuQ2xpY2tIYW5kbGVyKCk7XG5cdHRoaXMuYmFsbHNTZXRBY3RpdmUodGhpcy5zZXR0aW5ncy5hY3RpdmVQb3MpO1xuXHR0aGlzLmNoYW5nZU9wYWNpdHkoKTtcblx0dGhpcy5pbnRlcnZhbCA9IHRoaXMuc3RhcnRUaW1lcih0aGlzLmludGVydmFsKTtcblxuXHRcbn07IiwiZnVuY3Rpb24gUHJldlNsaWRlcihhcnJheVVybHMpIHtcclxuXHR0aGlzLmFycmF5VXJscyA9IGFycmF5VXJscztcclxuXHR0aGlzLmFyckxlbmd0aCA9IGFycmF5VXJscy5sZW5ndGg7XHJcbn1cclxuXHJcbi8vINCj0LTQsNC70Y/QtdC8INC40Lcg0YHRgtGA0L7QutC4INC70LjRiNC90LjQtSDRgdC40LzQstC+0LvRi1xyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5kZWxldGVUYWJzID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIF9hcnJheVVybHMgPSB0aGlzLmFycmF5VXJscztcclxuXHRyZXR1cm4gX2FycmF5VXJscy5yZXBsYWNlKC9cXHN8XFxbfFxcXXxcXCd8XFwnL2csICcnKTtcclxufTtcclxuXHJcbi8vINCk0L7RgNC80LjRgNGD0LXQvCDQuNC3INGB0YLRgNC+0LrQuCDQvNCw0YHRgdC40LJcclxuUHJldlNsaWRlci5wcm90b3R5cGUuc3RyaW5nVG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBfaW5wdXRTdHJpbmcgPSB0aGlzLmRlbGV0ZVRhYnMoKTtcclxuXHJcblx0aWYgKF9pbnB1dFN0cmluZyA9PT0gJycpIHJldHVybiBmYWxzZTtcclxuXHRfaW5wdXRTdHJpbmcgPSBfaW5wdXRTdHJpbmcuc3BsaXQoJywnKTtcclxuXHJcblx0cmV0dXJuIF9pbnB1dFN0cmluZztcclxufTtcclxuXHJcbi8vINCk0L7RgNC80LjRgNGD0LXQvCDQvNCw0YHRgdC40LIg0L7QsdGK0LXQutGC0L7QsiBcclxuLy8g0J3QsCDQstGF0L7QtCDQuNC90LTQtdC60YEg0LDQutGC0LjQstC90L7Qs9C+INGB0LvQsNC50LTQsCjRgtC+0YIsINC60L7RgtC+0YDRi9C5INCx0YPQtNC10YIg0L/QvtC60LDQt9GL0LLQsNGC0YzRgdGPINC/0LXRgNCy0YvQvClcclxuUHJldlNsaWRlci5wcm90b3R5cGUuYXJyYXlUb0Fyck9ianMgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgX2Fyck9iamVjdHMgID0gW10sXHJcblx0XHQgIF9hcnJVcmxzICAgICA9IHRoaXMuc3RyaW5nVG9BcnJheSgpO1xyXG5cclxuXHRmb3IgKHZhciBpID0gMDsgaSA8IF9hcnJVcmxzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRfYXJyT2JqZWN0c1tpXSA9IHsgXHJcblx0XHRcdGZvdG86IF9hcnJVcmxzW2ldLFxyXG5cdFx0XHRjb21tZW50OiAnJyxcclxuXHRcdFx0bGluazogJydcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBfYXJyT2JqZWN0cztcclxufTtcclxuXHJcbi8vINCa0L7Qv9C40YDQvtCy0LDQvdC40LUg0LzQsNGB0YHQuNCy0LAg0L7QsdGK0LXQutGC0L7Qsi5cclxuLy8g0JTQu9GPINGC0L7Qs9C+LCDRh9GC0L7QsSDQvNC+0LbQvdC+INCx0YvQu9C+INC/0LXRgNC10LzQtdGJ0LDRgtGM0YHRjyDQvNC10LbQtNGDINGI0LDQs9Cw0LzQuFxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5jb3B5QXJyYXlPYmpzID0gZnVuY3Rpb24oYXJyYXlPYmpzKSB7XHJcblx0aWYgKCFhcnJheU9ianMgfHwgJ29iamVjdCcgIT09IHR5cGVvZiBhcnJheU9ianMpIHtcdFxyXG5cdCAgcmV0dXJuIGFycmF5T2JqcztcclxuXHR9XHJcblxyXG5cdHZhciBfbmV3QXJyYXkgPSAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGFycmF5T2Jqcy5wb3ApID8gW10gOiB7fTtcclxuXHR2YXIgX3Byb3AsIF92YWx1ZTtcclxuXHJcblx0Zm9yIChfcHJvcCBpbiBhcnJheU9ianMpIHtcclxuXHRcdGlmIChhcnJheU9ianMuaGFzT3duUHJvcGVydHkoX3Byb3ApKSB7XHJcblx0XHQgIF92YWx1ZSA9IGFycmF5T2Jqc1tfcHJvcF07XHJcblx0XHQgIGlmIChfdmFsdWUgJiYgJ29iamVjdCcgPT09IHR5cGVvZiBfdmFsdWUpIHtcclxuXHRcdFx0ICAgIF9uZXdBcnJheVtfcHJvcF0gPSB0aGlzLmNvcHlBcnJheU9ianMoX3ZhbHVlKTtcclxuXHRcdFx0ICB9IGVsc2Uge1xyXG5cdFx0XHQgICAgX25ld0FycmF5W19wcm9wXSA9IF92YWx1ZTtcclxuXHRcdFx0ICB9XHJcblx0ICAgIH1cclxuXHR9XHJcblxyXG5cdHJldHVybiBfbmV3QXJyYXk7XHJcblxyXG5cdCAvLyByZXR1cm4gW10uY29uY2F0KGFycmF5T2Jqcyk7IC8vINC10YHQu9C4INC90LDQtNC+INCx0YPQtNC10YIg0YHQvtGF0YDQsNC90Y/RgtGMINGD0LbQtSDQt9Cw0L/QuNGB0LDQvdC90YvQtSDQv9C+0LvRj1xyXG59OyIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG5cdHZhciB0ZW1wbGF0ZXMgPSB7XG5cdFx0aW5wdXRMaW5rczogSGFuZGxlYmFycy5jb21waWxlKCQoJyNpbnB1dExpbmtzJykuaHRtbCgpKSxcblx0XHRlcnJvcjogICAgICBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2Vycm9yUG9wVXAnKS5odG1sKCkpLFxuXHRcdHByZXdpZXdzOiAgIEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcHJld2lld3MnKS5odG1sKCkpLFxuXHRcdHNsaWRlckxpc3Q6IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjc2xpZGVyTGlzdCcpLmh0bWwoKSlcblx0fTtcblxuXHR2YXIgc3RvcmVUZW1wbGF0ZXMgPSB7fTsgLy8g0KXRgNCw0L3QuNC70LjRidC1INC60L7Qv9C40Lkg0L7QsdGK0LXQutGC0L7QsiDQtNC70Y8g0YLQvtCz0L4sINGH0YLQvtCxINC80L7QttC90L4g0LHRi9C70L4g0L/QtdGA0LXQvNC10YnQsNGC0YzRgdGPINC/0L4g0YjQsNCz0LDQvFxuXG5cdHZhciBlcnJvckhhbmRsZXIgPSBuZXcgRXJyb3JIYW5kbGVyKCcuZXJyTWVzJywgdGVtcGxhdGVzLmVycm9yKSxcblx0XHQgIHByZXZTbGlkZXIsXG5cdFx0ICBhY3RpdmVJbmRleCxcblx0XHQgICRhY3RpdmVSYWRpb0J0bixcblx0XHQgIG9ialNsaWRlcztcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLndyLWZvcm1fZGF0YXMtYnRuJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGlucHV0U3RyICA9ICQoJy53ci1mb3JtX2RhdGFzLWlucCcpLnZhbCgpO1xuXHRcdFxuXHRcdHByZXZTbGlkZXIgID0gbmV3IFByZXZTbGlkZXIoaW5wdXRTdHIpO1xuXHRcdG9ialNsaWRlcyAgID0gcHJldlNsaWRlci5hcnJheVRvQXJyT2JqcygpOyBcblxuXHRcdHN0b3JlVGVtcGxhdGVzLnByZXdpZXdzID0gcHJldlNsaWRlci5jb3B5QXJyYXlPYmpzKG9ialNsaWRlcyk7XG5cblx0XHRpZiAoIW9ialNsaWRlcy5sZW5ndGgpIHtcblx0XHRcdGVycm9ySGFuZGxlci5nZW5lcmF0ZUVycm9yKHtcblx0XHRcdFx0dGl0bGU6ICfQntGI0LjQsdC60LAnLCBcblx0XHRcdFx0bWVzc2FnZTogJ9CS0LLQtdC00LjRgtC1INC00LDQvdC90YvQtSdcblx0XHRcdH0sICdEYXRhcyBpcyBlbXB0eScpO1xuXHRcdH1cblxuXHRcdGZhZGVCbG9jaygkKCcud3ItZm9ybV9kYXRhcycpLCAyLCBmdW5jdGlvbigpIHtcblx0XHRcdCQoJy53cmFwcGVyJykucHJlcGVuZCh0ZW1wbGF0ZXMucHJld2lld3Mob2JqU2xpZGVzKSkuZmFkZUluKDUwMCk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy53ci1ibG9jay1zZWxlY3RfYWN0aXZlLXJhZGlvJywgZnVuY3Rpb24oKSB7XHRcblx0XHRhY3RpdmVJbmRleCA9IHBhcnNlSW50KCQodGhpcykudmFsKCkpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLndyLWJsb2NrLWRlbGV0ZScsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpdGVtICAgICAgPSAkKHRoaXMpLmRhdGEoJ2l0ZW0nKSxcblx0XHRcdCAgd2luU2NyVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG5cdFx0b2JqU2xpZGVzLnNwbGljZShpdGVtLCAxKTtcblxuXHRcdCQoJy53cmFwcGVyJykuaHRtbCgnJykuYXBwZW5kKHRlbXBsYXRlcy5wcmV3aWV3cyhvYmpTbGlkZXMpKTtcblx0XHQkKHdpbmRvdykuc2Nyb2xsVG9wKHdpblNjclRvcCk7XG5cblx0XHRhY3RpdmVJbmRleCA9IHNlbGVjdEFjdGl2ZUFmdGVyRGVsKGl0ZW0sIGFjdGl2ZUluZGV4KTtcblx0XHRpZiAoYWN0aXZlSW5kZXggIT0gbnVsbCkge1xuXHRcdFx0JCgnLndyLWJsb2NrJykuZXEoYWN0aXZlSW5kZXgpLmZpbmQoJy53ci1ibG9jay1zZWxlY3RfYWN0aXZlLXRleHQnKS50cmlnZ2VyKCdjbGljaycpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhY3RpdmVJbmRleCA9IDA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy53ci1ibG9jay1jb21tZW50LWxiLWlucCcsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBudW1iZXJDb21tZW50ID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdjb21tZW50JykpLFxuXHRcdFx0ICB0ZXh0Q29tbWVudCAgID0gJCh0aGlzKS52YWwoKTtcblxuXHRcdG9ialNsaWRlc1tudW1iZXJDb21tZW50XS5jb21tZW50ID0gdGV4dENvbW1lbnQ7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLndyLWJsb2NrLWxpbmstbGItaW5wJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG51bWJlckNvbW1lbnQgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2xpbmsnKSksXG5cdFx0XHQgdGV4dENvbW1lbnQgICA9ICQodGhpcykudmFsKCk7XG5cblx0XHRvYmpTbGlkZXNbbnVtYmVyQ29tbWVudF0ubGluayA9IHRleHRDb21tZW50O1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmdlbmVyYXRlLXNsaWRlcicsIGZ1bmN0aW9uKCkge1xuXHRcdGFjdGl2ZUluZGV4ID0gKGFjdGl2ZUluZGV4ID09PSB1bmRlZmluZWQpID8gMCA6IGFjdGl2ZUluZGV4O1xuXG5cdFx0aWYgKCFvYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRlcnJvckhhbmRsZXIuZ2VuZXJhdGVFcnJvcih7XG5cdFx0XHRcdHRpdGxlOiAn0J7RiNC40LHQutCwJywgXG5cdFx0XHRcdG1lc3NhZ2U6ICfQndC10YIg0L3QuCDQvtC00L3QvtCz0L4g0YHQu9Cw0LnQtNCwJ1xuXHRcdFx0fSwgJ0RhdGFzIGlzIGVtcHR5Jyk7XG5cdFx0fVxuXG5cdFx0ZmFkZUJsb2NrKCQoJy53ci1ibG9ja3MtdycpLCAxLCBmdW5jdGlvbigpIHtcblx0XHRcdCQoJy53cmFwcGVyJykuYXBwZW5kKHRlbXBsYXRlcy5zbGlkZXJMaXN0KG9ialNsaWRlcykpLmZhZGVJbig1MDAsIGZ1bmN0aW9uKCkge1x0XG5cblx0XHRcdFx0dmFyIHNsaWRlciA9IG5ldyBTbGlkZXIoJCgnLnNsaWRlcicpLCB7XG5cdFx0XHRcdFx0YWN0aXZlQ2xhc3M6ICdzbGlkZXItYWN0aXZlJyxcblx0XHRcdFx0XHRhY3RpdmVQb3M6IGFjdGl2ZUluZGV4XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHNsaWRlci5pbml0U2xpZGVyKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5zdGVwLWRvd24nLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9CbG9jayA9ICQodGhpcykuZGF0YSgndG8nKTtcblxuXHRcdG9ialNsaWRlcyA9IHByZXZTbGlkZXIuY29weUFycmF5T2JqcyhzdG9yZVRlbXBsYXRlc1t0b0Jsb2NrXSk7XG5cdFx0YWN0aXZlSW5kZXggPSAwO1xuXHRcdCQoJy53cmFwcGVyJykuaHRtbCggcmV0dXJuQmxvY2soIHRvQmxvY2ssIHRlbXBsYXRlcywgc3RvcmVUZW1wbGF0ZXNbdG9CbG9ja10gKSk7XG5cdH0pO1xuXG5cdC8vINCY0YnQtdGCINCw0LrRgtC40LLQvdGL0Lkg0YHQu9Cw0LnQtCDQv9C+0YHQu9C1INGD0LTQsNC70LXQvdC40Y8g0YXQvtGC0Ywg0L7QtNC90L7Qs9C+INC/0YDQtdCy0YzRjlxuXHRmdW5jdGlvbiBzZWxlY3RBY3RpdmVBZnRlckRlbChpdGVtLCBhY3RpdmVJbmRleCkge1xuXHRcdGlmIChpdGVtID09IGFjdGl2ZUluZGV4KSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9IGVsc2UgaWYgKGl0ZW0gPCBhY3RpdmVJbmRleCkge1xuXHRcdFx0cmV0dXJuIGFjdGl2ZUluZGV4IC0gMTtcblx0XHR9IGVsc2UgaWYgKGl0ZW0gPiBhY3RpdmVJbmRleCl7XG5cdFx0XHRyZXR1cm4gYWN0aXZlSW5kZXg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDRgNC10L3QtNC10YDQuNGCINGI0LDQsdC70L7QvSDQv9GA0Lgg0LLQvtC30LLRgNCw0YnQtdC90LjQuCDQuiDQv9GA0LXQtNGL0LTRg9GJ0LXQvNGDINGI0LDQs9GDXG5cdGZ1bmN0aW9uIHJldHVybkJsb2NrKG5hbWVUZW1wLCBteVRlbXBsYXRlcywgb3B0aW9ucykge1xuXHRcdHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmIChteVRlbXBsYXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lVGVtcCkpIHtcblx0XHRcdHJldHVybiBteVRlbXBsYXRlc1tuYW1lVGVtcF0ob3B0aW9ucyk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvLyDQn9C10YDQtdC80LXRidC10L3QuNC1INCx0LvQvtC60LAsINGBINC/0L7RgdC70LXQtNGD0Y7RidC40Lwg0LXQs9C+INGD0LTQsNC70LXQvdC40LXQvCDQuNC3IERPTVxuXHRmdW5jdGlvbiBibG9ja01vdmUoJGJsb2NrLCBtb3ZlVG8sIG9mZnNldCkge1xuXHRcdHZhciBtb3ZlVG8gPSBtb3ZlVG8gfHwgJ3RvcCcsXG5cdFx0XHRvZmZzZXQgPSBvZmZzZXQgfHwgLTEwMDA7XG5cdFx0JGJsb2NrLmNzcyhtb3ZlVG8sIG9mZnNldCkuZmFkZU91dCgxMDAsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vINCe0L/RgNC10LTQtdC70LXQvdC40LUg0YHQv9C+0YHQvtCx0LAg0L/QtdGA0LXQvNC10YnQtdC90LjRj1xuXHRmdW5jdGlvbiBmYWRlQmxvY2soJGJsb2NrLCBhbmltYXRpb24sIGNhbGxiYWNrKSB7IC8vIGFuaW1hdGlvbiDQvNC+0LbQtdGCINCx0YvRgtGMIDE9dXAsIDI9cmlnaHRcblx0XHR2YXIgYW5pbWF0aW9uICAgICAgPSBhbmltYXRpb24gfHwgMTtcblxuXHRcdHN3aXRjaChhbmltYXRpb24pIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0YmxvY2tNb3ZlKCRibG9jaywgJ3RvcCcpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRibG9ja01vdmUoJGJsb2NrLCAncmlnaHQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGlmKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSBjYWxsYmFjaygpO1xuXHR9XG5cblx0Ly8g0KXQtdC70L/QtdGALCDQutC+0YLQvtGA0YvQuSDQtNC+0LHQsNCy0LvRj9C10YIgMiDQv9C+0YHQu9C10LTQvtCy0LDRgtC10LvRjNC90YvRhSDRgdC70LDQudC00LAgXG5cdC8vIHBvc2l0aW9uIC0g0L3QsNGH0LDQu9C+INC/0L7Qt9C40YbQuNC4INGB0LvQsNC50LTQsCwg0LrQvtGC0L7RgNGL0Lkg0L3QsNC00L4g0LTQvtCx0LDQstC40YLRjCwgb2JqIC0g0YHQsNC8INGB0LvQsNC50LRcblx0SGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYWRkU2xpZGVzJywgZnVuY3Rpb24ob2JqLCBwb3NpdGlvbikge1xuXHRcdHZhciByZXR1cm5pbmdTdHIgPSAnJyxcblx0XHRcdHBvc2l0aW9uICAgICA9IHBvc2l0aW9uIC0gMjtcblxuXHRcdGlmIChvYmoubGVuZ3RoIDwgMikgcmV0dXJuICcnO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDIsIGogPSBwb3NpdGlvbjsgaSA+IDA7IGktLSwgaisrICkgeyBcblx0XHRcdHJldHVybmluZ1N0ciArPSAnPGxpIGNsYXNzPVwic2xpZGVyLWltZ1wiXCI+PGltZyBzcmM9XCInICsgb2JqW2pdLmZvdG8gKyAnXCIgYWx0PVwiXCIvPic7XG5cdFx0XHRcblx0XHRcdGlmIChvYmpbal0uY29tbWVudC5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuaW5nU3RyICs9ICc8ZGl2IGNsYXNzPVwic2xpZGVyLWltZy1jb21tZW50XCI+JyArIG9ialtqXS5jb21tZW50ICsgJzwvZGl2Pic7XG5cdFx0XHRcdHJldHVybmluZ1N0ciArPSAnPC9saT4nO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhyZXR1cm5pbmdTdHIpO1xuXHR9KTtcblxuXHQvLyDQldGB0LvQuCDQtdGB0YLRjCDQv9C+0LvQtSBsaW5rLCDRgtC+INC+0LHQtdGA0L3Rg9GC0Ywg0LrQvtC90YLQtdC60YHRgiDQsiDRgdGB0YvQu9C60YNcblx0SGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd3JhcExpbmsnLCBmdW5jdGlvbihsaW5rLCBvcHRpb25zKSB7XG5cdFx0dmFyIHJldHVybmluZ1N0cjtcblxuXHRcdGlmIChsaW5rLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuaW5nU3RyID0gJzxhIGhyZWY9XCInKyBsaW5rICsnXCI+JyArIG9wdGlvbnMuZm4odGhpcykgKyAnPC9hPic7XG5cdFx0XHRyZXR1cm4gcmV0dXJuaW5nU3RyO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuXHR9KTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
