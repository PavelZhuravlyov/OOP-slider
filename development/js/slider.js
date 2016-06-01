function Slider($slider, options) {
	this.slider = $slider;
	this.arrSlides = this.slider.children();
	this.countSlides = this.arrSlides.length - 1;
	this.settings = $.extend({
	  activeClass : 'slider-active',
	  ballsBlock : 'slider-navigation',
	  ballsClass : 'slider-navigation-circle',
	  activePos : 0,
	  timeStep : 7000
	}, options);
	this.slideWidth = this.arrSlides.outerWidth();
	this.indexActiveSlide = this.settings.activePos + 1;
	this.ballsBlock = $('.' + this.settings.ballsBlock);
	this.arrayNavigElements = this.ballsBlock.children('.' + this.settings.ballsClass);
	this.arrNavElLength = this.arrayNavigElements.length;
	this.ballActivePos = this.settings.activePos;
	this.flag = false;
	this.startInit = true;
	this.currentSlideIndex = this.settings.activePos + 1;
	this.interval;
}

// Установить астивный класс на слайд
// Слайд вычисляется по индексу, где индекс - это activePos в options
// И перемещается на активный слайд
Slider.prototype.setActiveSlide = function() {
	this.arrSlides.eq(this.settings.activePos + 1).addClass(this.settings.activeClass);
	this.move(this.indexActiveSlide);
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
	var self = this;

	this.move(indexPosition, function() {
		self.slider.css({
			left: -(self.slideWidth * movingPosition)
		});
		self.changeActiveSlide(movingPosition);
	});
};

// Проверка индекса след слайда
Slider.prototype.checkSlide = function(dataSlide) {
	var 
		dataSlide = dataSlide || 1,
		nextSlide = this.currentSlideIndex + dataSlide,
		slideStartIndex = 1,
		slideEndIndex = this.countSlides;

	if (nextSlide === slideEndIndex) {
		this.invisibleMoveSlider(nextSlide, slideStartIndex);
		this.currentSlideIndex = 1;
		this.ballActivePos = 0;
	} else if (nextSlide === 0) {
		this.currentSlideIndex = slideEndIndex-1;
		this.invisibleMoveSlider(nextSlide, slideEndIndex - 1);	
		this.ballActivePos = this.arrNavElLength - 1;
	}	else {
		this.currentSlideIndex = (dataSlide > 0) ? this.currentSlideIndex += 1 : this.currentSlideIndex -= 1;
		this.move(nextSlide);
		this.changeActiveSlide(nextSlide);
		this.ballActivePos = nextSlide - 1;
	}	

	this.ballsSetActive(this.ballActivePos, false);
};

// Плавное перемещение слайдера
// Параметры: indexPos - индекс активного слайда
Slider.prototype.move = function(indexPos, callback) {
	var self = this;

	// Не плавное перемещение слайдера при инициализации
	if (this.startInit) {
		this.slider.css({
			'left': -(self.slideWidth * indexPos)
		});
		this.startInit = false;
	}

	this.slider.transition({
		'left': -(self.slideWidth * indexPos)
	}, 500, function() {
		self.flag = false;

		if (callback && typeof callback === 'function') {
			callback();
		}
	});	
};

// Инициализация таймера для автономного перемещения слайдера
Slider.prototype.startTimer = function(timer, func) {
	var self = this;

	return setInterval(function() {
					self.checkSlide();
				 }, self.settings.timeStep);
};

// Работа с нижней навигацией(установка, перемещение к соответствующему шарику слайду)
Slider.prototype.ballsSetActive = function(dataSlide, moveSlider) {
	var 
		ballsClass = this.settings.ballsClass,
		ballsClassActive = ballsClass + '-active',
		arrayBalls = this.arrayNavigElements,
		arrBallsLength,
		i;

	if (!this.settings.balls) {
		return false;
	}

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

// Обработчик клика на кнопки переключения
Slider.prototype.clickHandler = function() {
	var self = this;

	$(document).on('click', '.js-slider-arrow', function() {
		var dataSlide = $(this).data('slide');

		if (self.flag) { 
			return false;
		}

		self.flag = true;

		clearInterval(self.interval);
		self.checkSlide(dataSlide);
		self.ballsSetActive(self.ballActivePos - 1, false);
		self.interval = self.startTimer(self.interval);

		return false;
	});

	$(document).on('click', '.js-nav-circle', function() {
		var 
			dataSlide = $(this).data('slide'),
			ballsClassActive = self.settings.ballsClass + '-active';

		if ($(this).hasClass(ballsClassActive)) {
			return false;
		} 

		self.currentSlideIndex = parseInt(dataSlide);
		clearInterval(self.interval);
		self.ballsSetActive(dataSlide, true);
		self.interval = self.startTimer(self.interval);

		return false;
	});
};

// Инициализация слайдера
Slider.prototype.initSlider = function(){
	if ((this.settings.activePos > this.arrSlides.length) || (this.settings.activePos < 0)) {
		throw new Error('Active position undefined');
	}

	if (this.countSlides === 2) {
		this.ballsSetActive(this.settings.activePos);
		this.setActiveSlide();	

		return false;
	}

	this.setActiveSlide();	
	this.clickHandler();
	this.ballsSetActive(this.settings.activePos);
	this.interval = this.startTimer(this.interval);
};