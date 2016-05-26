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