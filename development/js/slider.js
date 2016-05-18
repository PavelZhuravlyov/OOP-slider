function Slider(slider, options) {

    this.$slider            = slider,
	this.$arrSlides         = this.$slider.children(),
	this.$arrSlidesDef      = this.$arrSlides,
	this.countSlides        = this.$arrSlides.length - 1,
	this.settings           = $.extend({
      activeClass    : 'slider-active',
      ballsClass     : 'slider-navigation-circle',
      activePos      : 0,
      timeStep       : 2000,
      slideWidth     : this.$arrSlides.outerWidth(),
      arrows         : true
    }, options),
    this.slideWidth         = this.settings.slideWidth, 
    this.indexActiveSlide   = this.settings.activePos + 2,
    this.slideStartIndex    = 2,
    this.slideEndIndex      = this.countSlides - 1,
    this.ballsBlock         = $('.slider-navigation'),
    this.ballsBlockChildren = this.ballsBlock.children(),
    this.interval;
}

// Поставить прозрачную плашку на body, 
// чтоб во время плавного перемещения нельзя было ещё раз 
// нажать на кнопку перемещения
Slider.prototype.cancelClick = function(){
	$('body').addClass('body-bg');
	setTimeout(function(){
		$('body').removeClass('body-bg');
	}, 500);
};

// Добавляем кнопки передвижения, если в опциях указано arrows: true (по умолч)
Slider.prototype.addArrows = function(){
	if(this.settings.arrows){
		this.$slider.after("\
			<a href=\"#\" data-slide=\"1\" class=\"slider-arrow\"></a>\
			<a href=\"#\" data-slide=\"-1\" class=\"slider-arrow\"></a>"
		);
	}
};

// Установить астивный класс на слайд
// Слайд вычисляется по индексу, где индекс - это activePos в options
// И перемещается на активный слайд
Slider.prototype.setActiveSlide = function(){
	this.$slider.children('*[data-item="'+ this.settings.activePos +'"]').addClass(this.settings.activeClass);
	this.move(this.indexActiveSlide);
};

// Узнать индекс текущего активного слайда
Slider.prototype.getIndexActiveSlide = function(){
	return this.$slider.children('.' + this.settings.activeClass).index();
};

// Сбросить со всех слайдов активный класс
// Поставить активный класс на след слайд (nextSlide - след. индекс)
Slider.prototype.changeActiveSlide = function(nextSlide){
	this.$arrSlides.siblings().removeClass(this.settings.activeClass);
	this.$arrSlides.eq(nextSlide).addClass(this.settings.activeClass);
};

// Незаметное перемещение слайдера
// Делается для того, чтобы переместить слайдер, когда 
// он достиг или последнего, или первого слайда
Slider.prototype.invisibleMoveSlider = function(indexPosition, movingPosition){
	var _this = this;
	this.move(indexPosition, function(){
		_this.$slider.css({
			'left': -_this.slideWidth * movingPosition
		});
		_this.changeActiveSlide(movingPosition);
	});
};

// Проверка индекса след слайда
Slider.prototype.checkSlide = function(dataSlide){
	var dataSlide = dataSlide || 1,
		nextSlide = this.getIndexActiveSlide() + dataSlide;

	if(nextSlide == this.slideEndIndex){
		this.invisibleMoveSlider(nextSlide, this.slideStartIndex);
	}
	else if(nextSlide == (this.slideStartIndex-1)){
		this.invisibleMoveSlider(nextSlide, this.slideEndIndex-1);	
	}
	else {
		this.move(nextSlide);
		this.changeActiveSlide(nextSlide);
	}	
};

// Плавное перемещение слайдера
// Параметры: indexPos - индекс активного слайда
Slider.prototype.move = function(indexPos, callback){
	var _this = this;
	this.$slider.transition({
		'left': -_this.slideWidth * indexPos
	}, 500, function(){
		if(callback && typeof callback == "function") callback();
	});	
};

// Инициализация таймера для автономного перемещения слайдера
Slider.prototype.startTimer = function(timer, func){
	var _this = this;
	return setInterval(function(){
				_this.checkSlide();
			}, _this.settings.timeStep);
};

Slider.prototype.ballsSetActive = function(){
	var _ballsClass       = this.settings.ballsClass,
		_ballsClassActive = _ballsClass + '-active';

	console.log(this.ballsBlockChildren);
}

// Обработчик клика на кнопки переключения
Slider.prototype.ClickHandler = function(){
	var _this = this;

	$(document).on('click', '.slider-arrow', function(){
		var dataSlide = parseInt($(this).data('slide'));
		clearInterval(_this.interval);

		_this.cancelClick();
		_this.checkSlide(dataSlide);

		_this.interval = _this.startTimer(_this.interval);

		return false;
	});

	$(document).on('click', '.slider-navigation-circle', function(){
		var dataSlide = parseInt($(this).data('slide'));
		clearInterval(_this.interval);

		// _this.cancelClick();
		// _this.checkSlide(dataSlide);

		_this.ballsSetActive();

		_this.interval = _this.startTimer(_this.interval);

		return false;
	});
};

// Инициализация слайдера
Slider.prototype.initSlider = function(){

	if((this.settings.activePos > this.$arrSlidesDef.length) || (this.settings.activePos < 0)){
		throw new Error("Active position undefined");
	}

	this.addArrows();
	this.setActiveSlide();	
	this.ClickHandler();

	this.interval = this.startTimer(this.interval);
};
