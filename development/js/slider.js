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