// Обработчик ошибок
function ErrorHandler(classErrWindow, templatePopUp){
	this.timeHide       = 2000;
	this.classErrWindow = classErrWindow;
	this.templatePopUp  = templatePopUp;
}

ErrorHandler.prototype.newError = function(errorObject){
	return this.templatePopUp(errorObject);
};

ErrorHandler.prototype.hideErrorWindow = function(){
	var errWindow = $(this.classErrWindow);

	setTimeout(function(){
		errWindow.fadeOut(this.timeHide, function(){
			errWindow.remove();
		});
	}, this.timeHide);
};

ErrorHandler.prototype.caughtErr = function(options){
	$('body').append(this.newError(options));
	this.hideErrorWindow();
};

ErrorHandler.prototype.checkError = function(errorOpt, consoleMessage){
	this.caughtErr(errorOpt);
	throw new Error(consoleMessage || "Error");
};
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

function PrevSlider(arrayUrls) {
	this.arrayUrls = arrayUrls;
	this.arrLength = arrayUrls.length;
}

// Удаляем из строки лишние символы
PrevSlider.prototype.deleteTabs = function() {
	var _arrayUrls = this.arrayUrls;
	return _arrayUrls.replace(/\s|\[|\]|\'|\'/g, '');
}

// Формируем из строки массив
PrevSlider.prototype.stringToArray = function() {
	var inputString = this.deleteTabs();

	if(inputString === "") return false;
	inputString = inputString.split(',');

	return inputString;
}

// Формируем массив объектов 
// На вход индекс активного слайда(тот, который будет показываться первым)
PrevSlider.prototype.arrayToArrObjs = function() {
	var arrObjects  = [],
		  arrUrls     = this.stringToArray();

	for (var i = 0; i < arrUrls.length; i++) {
		arrObjects[i] = { 
			foto: arrUrls[i],
			comment: ''
		};
	}
	
	return arrObjects;
}

// Копирование массива объектов.
// Для того, чтоб можно было перемещаться между шагами
PrevSlider.prototype.copyArrayObjs = function(arrayObjs) {
	 if (!arrayObjs || 'object' !== typeof arrayObjs) {	
	   return arrayObjs;
	 }

	 var newArray = ('function' === typeof arrayObjs.pop) ? [] : {};
	 var prop, value;


	 for(prop in arrayObjs) {
	 		console.log(prop);
		  if(arrayObjs.hasOwnProperty(prop)) {
			  value = arrayObjs[prop];
			  if(value && 'object' === typeof value) {
			    newArray[prop] = this.copyArrayObjs(value);
			  } else {
			    newArray[prop] = value;
			  }
	    }
		}

	  return newArray;

	 // return [].concat(arrayObjs); // если надо будет сохранять уже записанные поля
};
$(document).ready(function(){

	var templates = {
		inputLinks: Handlebars.compile($('#inputLinks').html()),
		error:      Handlebars.compile($('#errorPopUp').html()),
		prewiews:   Handlebars.compile($('#prewiews').html()),
		sliderList: Handlebars.compile($('#sliderList').html()),
		navigation: Handlebars.compile($('#slider-navigation').html())
	};

	var storeTemplates = {};

	var errorHandler = new ErrorHandler('.errMes', templates.error),
		prevSlider   = {},
		activeIndex  = 0,
		objSlides;

	$(document).on('click', '.wr-form_datas-btn', function() {
		var inputStr  = $('.wr-form_datas-inp').val();
		
		prevSlider  = new PrevSlider(inputStr);
		objSlides   = prevSlider.arrayToArrObjs(); 

		storeTemplates['prewiews'] = prevSlider.copyArrayObjs(objSlides);

		if(!objSlides.length){
			errorHandler.checkError({
				title: 'Ошибка', 
				message: 'Введите данные'
			}, "Datas is empty");
		}

		fadeBlock($('.wr-form_datas'), 2, function(){
			$('.wrapper').prepend(
				templates.prewiews(objSlides)
			).fadeIn(500);
		});
		
		return false;
	});

	$(document).on('click', '.wr-block-delete', function(){
		var item      = $(this).data('item'),
			winScrTop = $(window).scrollTop();

		objSlides.splice(item, 1);

		$('.wrapper').html('').append(templates.prewiews(objSlides));
		$(window).scrollTop(winScrTop);

		(item < activeIndex) ? newPosActiveIndex(1, item) : 
		(item > activeIndex) ? newPosActiveIndex(0, item) : newPosActiveIndex(-1, item); 

		return false;
	});

	$(document).on('change', '.wr-block-select_active-radio', function(){	
		activeIndex = parseInt($(this).val());
	});

	$(document).on('change', '.wr-block-comment-lb-inp', function(){
		var numberComment = parseInt($(this).data('comment')),
			textComment   = $(this).val();

		objSlides[numberComment]['comment'] = textComment;
	});

	$(document).on('click', '.generate-slider', function() {
		console.log(storeTemplates['prewiews']);

		if (!objSlides.length) {
			errorHandler.checkError({
				title: 'Ошибка', 
				message: 'Нет ни одного слайда'
			}, "Datas is empty");
		}

		fadeBlock($('.wr-blocks-w'), 1, function() {
			$('.wrapper').append(templates.sliderList(objSlides)).fadeIn(500, function() {
			
				// $('.slider').Slider({
				// 	activeClass: 'slider-active',
				// 	activePos: activeIndex
				// });
				var slider = new Slider($('.slider'), {
					activeClass: 'slider-active',
					activePos: activeIndex
				});

				$('.slider-w').after(templates.navigation(objSlides));
				slider.initSlider();
			});
		});
	});

	$(document).on('click', '.step-down', function() {
		var toBlock = $(this).data('to');

		objSlides = prevSlider.copyArrayObjs(storeTemplates[toBlock]);
		activeIndex = 0;
		$('.wrapper').html( returnBlock( toBlock, templates, storeTemplates[toBlock] ) );
	});

	// функция, которая рендерит шаблон при возвращении к предыдущему шагу
	function returnBlock(nameTemp, myTemplates, options){
		var options = options || {};

		if (myTemplates.hasOwnProperty(nameTemp)) {
			return myTemplates[nameTemp](options);
		}
	}
	
	// Функция, котрая вычисляет активный слайд при удалении старого активного
	function newPosActiveIndex(shift, item){
		var shift = shift || 0;

		if(shift == -1 || (activeIndex == 0 && item == 0)){
			console.log(activeIndex, item);
			activeIndex = 0;
			return false;
		} else if( activeIndex == 0 && item != 0 ){
			$('.wr-block').eq(activeIndex).find('.wr-block-select_active-text').trigger('click');
		} else{
			$('.wr-block').eq(activeIndex-shift).find('.wr-block-select_active-text').trigger('click');
		}
	}

	// Перемещение блока, с последующим его удалением из DOM
	function blockMove($block, moveTo, offset){
		var moveTo = moveTo || 'top',
			offset = offset || -1000;
		$block.css(moveTo, offset).fadeOut(100, function(){
			$(this).remove();
		});
	}

	// Определение способа перемещения
	function fadeBlock($block, animation, callback){ // animation может быть 1=up, 2=right
		var animation      = animation || 1;

		switch(animation){
			case 1:
				blockMove($block, 'top');
				break;

			case 2:
				blockMove($block, 'right');
				break;
		}
		if(callback && typeof callback == "function") callback();
	}

	// Хелпер, который добавляет 2 последовательных слайда 
	// position - начало позиции слайда, который надо добавить, obj - сам слайд
	Handlebars.registerHelper('addSlides', function(obj, position){
		var returningStr = '',
			position     = position - 2;

		for(var i = 2, j = position; i > 0; i--, j++ ){ 
			returningStr += '<li class="slider-img""><img src="' + obj[j].foto + '" alt=""/>';
			
			if (obj[j].comment.length) {
				returningStr += '<div class="slider-img-comment">' + obj[j].comment + '</div>';
				returningStr += '</li>'
			}
		}
		
		return new Handlebars.SafeString(returningStr);
	});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwicHJldlNsaWRlci5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g0J7QsdGA0LDQsdC+0YLRh9C40Log0L7RiNC40LHQvtC6XHJcbmZ1bmN0aW9uIEVycm9ySGFuZGxlcihjbGFzc0VycldpbmRvdywgdGVtcGxhdGVQb3BVcCl7XHJcblx0dGhpcy50aW1lSGlkZSAgICAgICA9IDIwMDA7XHJcblx0dGhpcy5jbGFzc0VycldpbmRvdyA9IGNsYXNzRXJyV2luZG93O1xyXG5cdHRoaXMudGVtcGxhdGVQb3BVcCAgPSB0ZW1wbGF0ZVBvcFVwO1xyXG59XHJcblxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLm5ld0Vycm9yID0gZnVuY3Rpb24oZXJyb3JPYmplY3Qpe1xyXG5cdHJldHVybiB0aGlzLnRlbXBsYXRlUG9wVXAoZXJyb3JPYmplY3QpO1xyXG59O1xyXG5cclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5oaWRlRXJyb3JXaW5kb3cgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBlcnJXaW5kb3cgPSAkKHRoaXMuY2xhc3NFcnJXaW5kb3cpO1xyXG5cclxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRlcnJXaW5kb3cuZmFkZU91dCh0aGlzLnRpbWVIaWRlLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRlcnJXaW5kb3cucmVtb3ZlKCk7XHJcblx0XHR9KTtcclxuXHR9LCB0aGlzLnRpbWVIaWRlKTtcclxufTtcclxuXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuY2F1Z2h0RXJyID0gZnVuY3Rpb24ob3B0aW9ucyl7XHJcblx0JCgnYm9keScpLmFwcGVuZCh0aGlzLm5ld0Vycm9yKG9wdGlvbnMpKTtcclxuXHR0aGlzLmhpZGVFcnJvcldpbmRvdygpO1xyXG59O1xyXG5cclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5jaGVja0Vycm9yID0gZnVuY3Rpb24oZXJyb3JPcHQsIGNvbnNvbGVNZXNzYWdlKXtcclxuXHR0aGlzLmNhdWdodEVycihlcnJvck9wdCk7XHJcblx0dGhyb3cgbmV3IEVycm9yKGNvbnNvbGVNZXNzYWdlIHx8IFwiRXJyb3JcIik7XHJcbn07IiwiZnVuY3Rpb24gU2xpZGVyKHNsaWRlciwgb3B0aW9ucykge1xuXG4gICAgdGhpcy4kc2xpZGVyICAgICAgICAgICAgPSBzbGlkZXIsXG5cdHRoaXMuJGFyclNsaWRlcyAgICAgICAgID0gdGhpcy4kc2xpZGVyLmNoaWxkcmVuKCksXG5cdHRoaXMuJGFyclNsaWRlc0RlZiAgICAgID0gdGhpcy4kYXJyU2xpZGVzLFxuXHR0aGlzLmNvdW50U2xpZGVzICAgICAgICA9IHRoaXMuJGFyclNsaWRlcy5sZW5ndGggLSAxLFxuXHR0aGlzLnNldHRpbmdzICAgICAgICAgICA9ICQuZXh0ZW5kKHtcbiAgICAgIGFjdGl2ZUNsYXNzICAgIDogJ3NsaWRlci1hY3RpdmUnLFxuICAgICAgYmFsbHNDbGFzcyAgICAgOiAnc2xpZGVyLW5hdmlnYXRpb24tY2lyY2xlJyxcbiAgICAgIGFjdGl2ZVBvcyAgICAgIDogMCxcbiAgICAgIHRpbWVTdGVwICAgICAgIDogMjAwMCxcbiAgICAgIHNsaWRlV2lkdGggICAgIDogdGhpcy4kYXJyU2xpZGVzLm91dGVyV2lkdGgoKSxcbiAgICAgIGFycm93cyAgICAgICAgIDogdHJ1ZVxuICAgIH0sIG9wdGlvbnMpLFxuICAgIHRoaXMuc2xpZGVXaWR0aCAgICAgICAgID0gdGhpcy5zZXR0aW5ncy5zbGlkZVdpZHRoLCBcbiAgICB0aGlzLmluZGV4QWN0aXZlU2xpZGUgICA9IHRoaXMuc2V0dGluZ3MuYWN0aXZlUG9zICsgMixcbiAgICB0aGlzLnNsaWRlU3RhcnRJbmRleCAgICA9IDIsXG4gICAgdGhpcy5zbGlkZUVuZEluZGV4ICAgICAgPSB0aGlzLmNvdW50U2xpZGVzIC0gMSxcbiAgICB0aGlzLmJhbGxzQmxvY2sgICAgICAgICA9ICQoJy5zbGlkZXItbmF2aWdhdGlvbicpLFxuICAgIHRoaXMuYmFsbHNCbG9ja0NoaWxkcmVuID0gdGhpcy5iYWxsc0Jsb2NrLmNoaWxkcmVuKCksXG4gICAgdGhpcy5pbnRlcnZhbDtcbn1cblxuLy8g0J/QvtGB0YLQsNCy0LjRgtGMINC/0YDQvtC30YDQsNGH0L3Rg9GOINC/0LvQsNGI0LrRgyDQvdCwIGJvZHksIFxuLy8g0YfRgtC+0LEg0LLQviDQstGA0LXQvNGPINC/0LvQsNCy0L3QvtCz0L4g0L/QtdGA0LXQvNC10YnQtdC90LjRjyDQvdC10LvRjNC30Y8g0LHRi9C70L4g0LXRidGRINGA0LDQtyBcbi8vINC90LDQttCw0YLRjCDQvdCwINC60L3QvtC/0LrRgyDQv9C10YDQtdC80LXRidC10L3QuNGPXG5TbGlkZXIucHJvdG90eXBlLmNhbmNlbENsaWNrID0gZnVuY3Rpb24oKXtcblx0JCgnYm9keScpLmFkZENsYXNzKCdib2R5LWJnJyk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHQkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2JvZHktYmcnKTtcblx0fSwgNTAwKTtcbn07XG5cbi8vINCU0L7QsdCw0LLQu9GP0LXQvCDQutC90L7Qv9C60Lgg0L/QtdGA0LXQtNCy0LjQttC10L3QuNGPLCDQtdGB0LvQuCDQsiDQvtC/0YbQuNGP0YUg0YPQutCw0LfQsNC90L4gYXJyb3dzOiB0cnVlICjQv9C+INGD0LzQvtC70YcpXG5TbGlkZXIucHJvdG90eXBlLmFkZEFycm93cyA9IGZ1bmN0aW9uKCl7XG5cdGlmKHRoaXMuc2V0dGluZ3MuYXJyb3dzKXtcblx0XHR0aGlzLiRzbGlkZXIuYWZ0ZXIoXCJcXFxuXHRcdFx0PGEgaHJlZj1cXFwiI1xcXCIgZGF0YS1zbGlkZT1cXFwiMVxcXCIgY2xhc3M9XFxcInNsaWRlci1hcnJvd1xcXCI+PC9hPlxcXG5cdFx0XHQ8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXNsaWRlPVxcXCItMVxcXCIgY2xhc3M9XFxcInNsaWRlci1hcnJvd1xcXCI+PC9hPlwiXG5cdFx0KTtcblx0fVxufTtcblxuLy8g0KPRgdGC0LDQvdC+0LLQuNGC0Ywg0LDRgdGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9Cw0LnQtFxuLy8g0KHQu9Cw0LnQtCDQstGL0YfQuNGB0LvRj9C10YLRgdGPINC/0L4g0LjQvdC00LXQutGB0YMsINCz0LTQtSDQuNC90LTQtdC60YEgLSDRjdGC0L4gYWN0aXZlUG9zINCyIG9wdGlvbnNcbi8vINCYINC/0LXRgNC10LzQtdGJ0LDQtdGC0YHRjyDQvdCwINCw0LrRgtC40LLQvdGL0Lkg0YHQu9Cw0LnQtFxuU2xpZGVyLnByb3RvdHlwZS5zZXRBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuJHNsaWRlci5jaGlsZHJlbignKltkYXRhLWl0ZW09XCInKyB0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyArJ1wiXScpLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHR0aGlzLm1vdmUodGhpcy5pbmRleEFjdGl2ZVNsaWRlKTtcbn07XG5cbi8vINCj0LfQvdCw0YLRjCDQuNC90LTQtdC60YEg0YLQtdC60YPRidC10LPQviDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmdldEluZGV4QWN0aXZlU2xpZGUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy4kc2xpZGVyLmNoaWxkcmVuKCcuJyArIHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpLmluZGV4KCk7XG59O1xuXG4vLyDQodCx0YDQvtGB0LjRgtGMINGB0L4g0LLRgdC10YUg0YHQu9Cw0LnQtNC+0LIg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBXG4vLyDQn9C+0YHRgtCw0LLQuNGC0Ywg0LDQutGC0LjQstC90YvQuSDQutC70LDRgdGBINC90LAg0YHQu9C10LQg0YHQu9Cw0LnQtCAobmV4dFNsaWRlIC0g0YHQu9C10LQuINC40L3QtNC10LrRgSlcblNsaWRlci5wcm90b3R5cGUuY2hhbmdlQWN0aXZlU2xpZGUgPSBmdW5jdGlvbihuZXh0U2xpZGUpe1xuXHR0aGlzLiRhcnJTbGlkZXMuc2libGluZ3MoKS5yZW1vdmVDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0dGhpcy4kYXJyU2xpZGVzLmVxKG5leHRTbGlkZSkuYWRkQ2xhc3ModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG59O1xuXG4vLyDQndC10LfQsNC80LXRgtC90L7QtSDQv9C10YDQtdC80LXRidC10L3QuNC1INGB0LvQsNC50LTQtdGA0LBcbi8vINCU0LXQu9Cw0LXRgtGB0Y8g0LTQu9GPINGC0L7Qs9C+LCDRh9GC0L7QsdGLINC/0LXRgNC10LzQtdGB0YLQuNGC0Ywg0YHQu9Cw0LnQtNC10YAsINC60L7Qs9C00LAgXG4vLyDQvtC9INC00L7RgdGC0LjQsyDQuNC70Lgg0L/QvtGB0LvQtdC00L3QtdCz0L4sINC40LvQuCDQv9C10YDQstC+0LPQviDRgdC70LDQudC00LBcblNsaWRlci5wcm90b3R5cGUuaW52aXNpYmxlTW92ZVNsaWRlciA9IGZ1bmN0aW9uKGluZGV4UG9zaXRpb24sIG1vdmluZ1Bvc2l0aW9uKXtcblx0dmFyIF90aGlzID0gdGhpcztcblx0dGhpcy5tb3ZlKGluZGV4UG9zaXRpb24sIGZ1bmN0aW9uKCl7XG5cdFx0X3RoaXMuJHNsaWRlci5jc3Moe1xuXHRcdFx0J2xlZnQnOiAtX3RoaXMuc2xpZGVXaWR0aCAqIG1vdmluZ1Bvc2l0aW9uXG5cdFx0fSk7XG5cdFx0X3RoaXMuY2hhbmdlQWN0aXZlU2xpZGUobW92aW5nUG9zaXRpb24pO1xuXHR9KTtcbn07XG5cbi8vINCf0YDQvtCy0LXRgNC60LAg0LjQvdC00LXQutGB0LAg0YHQu9C10LQg0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLmNoZWNrU2xpZGUgPSBmdW5jdGlvbihkYXRhU2xpZGUpe1xuXHR2YXIgZGF0YVNsaWRlID0gZGF0YVNsaWRlIHx8IDEsXG5cdFx0bmV4dFNsaWRlID0gdGhpcy5nZXRJbmRleEFjdGl2ZVNsaWRlKCkgKyBkYXRhU2xpZGU7XG5cblx0aWYobmV4dFNsaWRlID09IHRoaXMuc2xpZGVFbmRJbmRleCl7XG5cdFx0dGhpcy5pbnZpc2libGVNb3ZlU2xpZGVyKG5leHRTbGlkZSwgdGhpcy5zbGlkZVN0YXJ0SW5kZXgpO1xuXHR9XG5cdGVsc2UgaWYobmV4dFNsaWRlID09ICh0aGlzLnNsaWRlU3RhcnRJbmRleC0xKSl7XG5cdFx0dGhpcy5pbnZpc2libGVNb3ZlU2xpZGVyKG5leHRTbGlkZSwgdGhpcy5zbGlkZUVuZEluZGV4LTEpO1x0XG5cdH1cblx0ZWxzZSB7XG5cdFx0dGhpcy5tb3ZlKG5leHRTbGlkZSk7XG5cdFx0dGhpcy5jaGFuZ2VBY3RpdmVTbGlkZShuZXh0U2xpZGUpO1xuXHR9XHRcbn07XG5cbi8vINCf0LvQsNCy0L3QvtC1INC/0LXRgNC10LzQtdGJ0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxuLy8g0J/QsNGA0LDQvNC10YLRgNGLOiBpbmRleFBvcyAtINC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwXG5TbGlkZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihpbmRleFBvcywgY2FsbGJhY2spe1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHR0aGlzLiRzbGlkZXIudHJhbnNpdGlvbih7XG5cdFx0J2xlZnQnOiAtX3RoaXMuc2xpZGVXaWR0aCAqIGluZGV4UG9zXG5cdH0sIDUwMCwgZnVuY3Rpb24oKXtcblx0XHRpZihjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjaygpO1xuXHR9KTtcdFxufTtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YLQsNC50LzQtdGA0LAg0LTQu9GPINCw0LLRgtC+0L3QvtC80L3QvtCz0L4g0L/QtdGA0LXQvNC10YnQtdC90LjRjyDRgdC70LDQudC00LXRgNCwXG5TbGlkZXIucHJvdG90eXBlLnN0YXJ0VGltZXIgPSBmdW5jdGlvbih0aW1lciwgZnVuYyl7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHJldHVybiBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuXHRcdFx0XHRfdGhpcy5jaGVja1NsaWRlKCk7XG5cdFx0XHR9LCBfdGhpcy5zZXR0aW5ncy50aW1lU3RlcCk7XG59O1xuXG5TbGlkZXIucHJvdG90eXBlLmJhbGxzU2V0QWN0aXZlID0gZnVuY3Rpb24oKXtcblx0dmFyIF9iYWxsc0NsYXNzICAgICAgID0gdGhpcy5zZXR0aW5ncy5iYWxsc0NsYXNzLFxuXHRcdF9iYWxsc0NsYXNzQWN0aXZlID0gX2JhbGxzQ2xhc3MgKyAnLWFjdGl2ZSc7XG5cblx0Y29uc29sZS5sb2codGhpcy5iYWxsc0Jsb2NrQ2hpbGRyZW4pO1xufVxuXG4vLyDQntCx0YDQsNCx0L7RgtGH0LjQuiDQutC70LjQutCwINC90LAg0LrQvdC+0L/QutC4INC/0LXRgNC10LrQu9GO0YfQtdC90LjRj1xuU2xpZGVyLnByb3RvdHlwZS5DbGlja0hhbmRsZXIgPSBmdW5jdGlvbigpe1xuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuc2xpZGVyLWFycm93JywgZnVuY3Rpb24oKXtcblx0XHR2YXIgZGF0YVNsaWRlID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdzbGlkZScpKTtcblx0XHRjbGVhckludGVydmFsKF90aGlzLmludGVydmFsKTtcblxuXHRcdF90aGlzLmNhbmNlbENsaWNrKCk7XG5cdFx0X3RoaXMuY2hlY2tTbGlkZShkYXRhU2xpZGUpO1xuXG5cdFx0X3RoaXMuaW50ZXJ2YWwgPSBfdGhpcy5zdGFydFRpbWVyKF90aGlzLmludGVydmFsKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5zbGlkZXItbmF2aWdhdGlvbi1jaXJjbGUnLCBmdW5jdGlvbigpe1xuXHRcdHZhciBkYXRhU2xpZGUgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ3NsaWRlJykpO1xuXHRcdGNsZWFySW50ZXJ2YWwoX3RoaXMuaW50ZXJ2YWwpO1xuXG5cdFx0Ly8gX3RoaXMuY2FuY2VsQ2xpY2soKTtcblx0XHQvLyBfdGhpcy5jaGVja1NsaWRlKGRhdGFTbGlkZSk7XG5cblx0XHRfdGhpcy5iYWxsc1NldEFjdGl2ZSgpO1xuXG5cdFx0X3RoaXMuaW50ZXJ2YWwgPSBfdGhpcy5zdGFydFRpbWVyKF90aGlzLmludGVydmFsKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG59O1xuXG4vLyDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDRgdC70LDQudC00LXRgNCwXG5TbGlkZXIucHJvdG90eXBlLmluaXRTbGlkZXIgPSBmdW5jdGlvbigpe1xuXG5cdGlmKCh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA+IHRoaXMuJGFyclNsaWRlc0RlZi5sZW5ndGgpIHx8ICh0aGlzLnNldHRpbmdzLmFjdGl2ZVBvcyA8IDApKXtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBY3RpdmUgcG9zaXRpb24gdW5kZWZpbmVkXCIpO1xuXHR9XG5cblx0dGhpcy5hZGRBcnJvd3MoKTtcblx0dGhpcy5zZXRBY3RpdmVTbGlkZSgpO1x0XG5cdHRoaXMuQ2xpY2tIYW5kbGVyKCk7XG5cblx0dGhpcy5pbnRlcnZhbCA9IHRoaXMuc3RhcnRUaW1lcih0aGlzLmludGVydmFsKTtcbn07XG4iLCJmdW5jdGlvbiBQcmV2U2xpZGVyKGFycmF5VXJscykge1xyXG5cdHRoaXMuYXJyYXlVcmxzID0gYXJyYXlVcmxzO1xyXG5cdHRoaXMuYXJyTGVuZ3RoID0gYXJyYXlVcmxzLmxlbmd0aDtcclxufVxyXG5cclxuLy8g0KPQtNCw0LvRj9C10Lwg0LjQtyDRgdGC0YDQvtC60Lgg0LvQuNGI0L3QuNC1INGB0LjQvNCy0L7Qu9GLXHJcblByZXZTbGlkZXIucHJvdG90eXBlLmRlbGV0ZVRhYnMgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgX2FycmF5VXJscyA9IHRoaXMuYXJyYXlVcmxzO1xyXG5cdHJldHVybiBfYXJyYXlVcmxzLnJlcGxhY2UoL1xcc3xcXFt8XFxdfFxcJ3xcXCcvZywgJycpO1xyXG59XHJcblxyXG4vLyDQpNC+0YDQvNC40YDRg9C10Lwg0LjQtyDRgdGC0YDQvtC60Lgg0LzQsNGB0YHQuNCyXHJcblByZXZTbGlkZXIucHJvdG90eXBlLnN0cmluZ1RvQXJyYXkgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgaW5wdXRTdHJpbmcgPSB0aGlzLmRlbGV0ZVRhYnMoKTtcclxuXHJcblx0aWYoaW5wdXRTdHJpbmcgPT09IFwiXCIpIHJldHVybiBmYWxzZTtcclxuXHRpbnB1dFN0cmluZyA9IGlucHV0U3RyaW5nLnNwbGl0KCcsJyk7XHJcblxyXG5cdHJldHVybiBpbnB1dFN0cmluZztcclxufVxyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC80LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyIFxyXG4vLyDQndCwINCy0YXQvtC0INC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwKNGC0L7Rgiwg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDQv9C+0LrQsNC30YvQstCw0YLRjNGB0Y8g0L/QtdGA0LLRi9C8KVxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5hcnJheVRvQXJyT2JqcyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBhcnJPYmplY3RzICA9IFtdLFxyXG5cdFx0ICBhcnJVcmxzICAgICA9IHRoaXMuc3RyaW5nVG9BcnJheSgpO1xyXG5cclxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFyclVybHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdGFyck9iamVjdHNbaV0gPSB7IFxyXG5cdFx0XHRmb3RvOiBhcnJVcmxzW2ldLFxyXG5cdFx0XHRjb21tZW50OiAnJ1xyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGFyck9iamVjdHM7XHJcbn1cclxuXHJcbi8vINCa0L7Qv9C40YDQvtCy0LDQvdC40LUg0LzQsNGB0YHQuNCy0LAg0L7QsdGK0LXQutGC0L7Qsi5cclxuLy8g0JTQu9GPINGC0L7Qs9C+LCDRh9GC0L7QsSDQvNC+0LbQvdC+INCx0YvQu9C+INC/0LXRgNC10LzQtdGJ0LDRgtGM0YHRjyDQvNC10LbQtNGDINGI0LDQs9Cw0LzQuFxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5jb3B5QXJyYXlPYmpzID0gZnVuY3Rpb24oYXJyYXlPYmpzKSB7XHJcblx0IGlmICghYXJyYXlPYmpzIHx8ICdvYmplY3QnICE9PSB0eXBlb2YgYXJyYXlPYmpzKSB7XHRcclxuXHQgICByZXR1cm4gYXJyYXlPYmpzO1xyXG5cdCB9XHJcblxyXG5cdCB2YXIgbmV3QXJyYXkgPSAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGFycmF5T2Jqcy5wb3ApID8gW10gOiB7fTtcclxuXHQgdmFyIHByb3AsIHZhbHVlO1xyXG5cclxuXHJcblx0IGZvcihwcm9wIGluIGFycmF5T2Jqcykge1xyXG5cdCBcdFx0Y29uc29sZS5sb2cocHJvcCk7XHJcblx0XHQgIGlmKGFycmF5T2Jqcy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG5cdFx0XHQgIHZhbHVlID0gYXJyYXlPYmpzW3Byb3BdO1xyXG5cdFx0XHQgIGlmKHZhbHVlICYmICdvYmplY3QnID09PSB0eXBlb2YgdmFsdWUpIHtcclxuXHRcdFx0ICAgIG5ld0FycmF5W3Byb3BdID0gdGhpcy5jb3B5QXJyYXlPYmpzKHZhbHVlKTtcclxuXHRcdFx0ICB9IGVsc2Uge1xyXG5cdFx0XHQgICAgbmV3QXJyYXlbcHJvcF0gPSB2YWx1ZTtcclxuXHRcdFx0ICB9XHJcblx0ICAgIH1cclxuXHRcdH1cclxuXHJcblx0ICByZXR1cm4gbmV3QXJyYXk7XHJcblxyXG5cdCAvLyByZXR1cm4gW10uY29uY2F0KGFycmF5T2Jqcyk7IC8vINC10YHQu9C4INC90LDQtNC+INCx0YPQtNC10YIg0YHQvtGF0YDQsNC90Y/RgtGMINGD0LbQtSDQt9Cw0L/QuNGB0LDQvdC90YvQtSDQv9C+0LvRj1xyXG59OyIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblx0dmFyIHRlbXBsYXRlcyA9IHtcblx0XHRpbnB1dExpbmtzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2lucHV0TGlua3MnKS5odG1sKCkpLFxuXHRcdGVycm9yOiAgICAgIEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjZXJyb3JQb3BVcCcpLmh0bWwoKSksXG5cdFx0cHJld2lld3M6ICAgSGFuZGxlYmFycy5jb21waWxlKCQoJyNwcmV3aWV3cycpLmh0bWwoKSksXG5cdFx0c2xpZGVyTGlzdDogSGFuZGxlYmFycy5jb21waWxlKCQoJyNzbGlkZXJMaXN0JykuaHRtbCgpKSxcblx0XHRuYXZpZ2F0aW9uOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3NsaWRlci1uYXZpZ2F0aW9uJykuaHRtbCgpKVxuXHR9O1xuXG5cdHZhciBzdG9yZVRlbXBsYXRlcyA9IHt9O1xuXG5cdHZhciBlcnJvckhhbmRsZXIgPSBuZXcgRXJyb3JIYW5kbGVyKCcuZXJyTWVzJywgdGVtcGxhdGVzLmVycm9yKSxcblx0XHRwcmV2U2xpZGVyICAgPSB7fSxcblx0XHRhY3RpdmVJbmRleCAgPSAwLFxuXHRcdG9ialNsaWRlcztcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLndyLWZvcm1fZGF0YXMtYnRuJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGlucHV0U3RyICA9ICQoJy53ci1mb3JtX2RhdGFzLWlucCcpLnZhbCgpO1xuXHRcdFxuXHRcdHByZXZTbGlkZXIgID0gbmV3IFByZXZTbGlkZXIoaW5wdXRTdHIpO1xuXHRcdG9ialNsaWRlcyAgID0gcHJldlNsaWRlci5hcnJheVRvQXJyT2JqcygpOyBcblxuXHRcdHN0b3JlVGVtcGxhdGVzWydwcmV3aWV3cyddID0gcHJldlNsaWRlci5jb3B5QXJyYXlPYmpzKG9ialNsaWRlcyk7XG5cblx0XHRpZighb2JqU2xpZGVzLmxlbmd0aCl7XG5cdFx0XHRlcnJvckhhbmRsZXIuY2hlY2tFcnJvcih7XG5cdFx0XHRcdHRpdGxlOiAn0J7RiNC40LHQutCwJywgXG5cdFx0XHRcdG1lc3NhZ2U6ICfQktCy0LXQtNC40YLQtSDQtNCw0L3QvdGL0LUnXG5cdFx0XHR9LCBcIkRhdGFzIGlzIGVtcHR5XCIpO1xuXHRcdH1cblxuXHRcdGZhZGVCbG9jaygkKCcud3ItZm9ybV9kYXRhcycpLCAyLCBmdW5jdGlvbigpe1xuXHRcdFx0JCgnLndyYXBwZXInKS5wcmVwZW5kKFxuXHRcdFx0XHR0ZW1wbGF0ZXMucHJld2lld3Mob2JqU2xpZGVzKVxuXHRcdFx0KS5mYWRlSW4oNTAwKTtcblx0XHR9KTtcblx0XHRcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcud3ItYmxvY2stZGVsZXRlJywgZnVuY3Rpb24oKXtcblx0XHR2YXIgaXRlbSAgICAgID0gJCh0aGlzKS5kYXRhKCdpdGVtJyksXG5cdFx0XHR3aW5TY3JUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cblx0XHRvYmpTbGlkZXMuc3BsaWNlKGl0ZW0sIDEpO1xuXG5cdFx0JCgnLndyYXBwZXInKS5odG1sKCcnKS5hcHBlbmQodGVtcGxhdGVzLnByZXdpZXdzKG9ialNsaWRlcykpO1xuXHRcdCQod2luZG93KS5zY3JvbGxUb3Aod2luU2NyVG9wKTtcblxuXHRcdChpdGVtIDwgYWN0aXZlSW5kZXgpID8gbmV3UG9zQWN0aXZlSW5kZXgoMSwgaXRlbSkgOiBcblx0XHQoaXRlbSA+IGFjdGl2ZUluZGV4KSA/IG5ld1Bvc0FjdGl2ZUluZGV4KDAsIGl0ZW0pIDogbmV3UG9zQWN0aXZlSW5kZXgoLTEsIGl0ZW0pOyBcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcud3ItYmxvY2stc2VsZWN0X2FjdGl2ZS1yYWRpbycsIGZ1bmN0aW9uKCl7XHRcblx0XHRhY3RpdmVJbmRleCA9IHBhcnNlSW50KCQodGhpcykudmFsKCkpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy53ci1ibG9jay1jb21tZW50LWxiLWlucCcsIGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG51bWJlckNvbW1lbnQgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2NvbW1lbnQnKSksXG5cdFx0XHR0ZXh0Q29tbWVudCAgID0gJCh0aGlzKS52YWwoKTtcblxuXHRcdG9ialNsaWRlc1tudW1iZXJDb21tZW50XVsnY29tbWVudCddID0gdGV4dENvbW1lbnQ7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZ2VuZXJhdGUtc2xpZGVyJywgZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coc3RvcmVUZW1wbGF0ZXNbJ3ByZXdpZXdzJ10pO1xuXG5cdFx0aWYgKCFvYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRlcnJvckhhbmRsZXIuY2hlY2tFcnJvcih7XG5cdFx0XHRcdHRpdGxlOiAn0J7RiNC40LHQutCwJywgXG5cdFx0XHRcdG1lc3NhZ2U6ICfQndC10YIg0L3QuCDQvtC00L3QvtCz0L4g0YHQu9Cw0LnQtNCwJ1xuXHRcdFx0fSwgXCJEYXRhcyBpcyBlbXB0eVwiKTtcblx0XHR9XG5cblx0XHRmYWRlQmxvY2soJCgnLndyLWJsb2Nrcy13JyksIDEsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLndyYXBwZXInKS5hcHBlbmQodGVtcGxhdGVzLnNsaWRlckxpc3Qob2JqU2xpZGVzKSkuZmFkZUluKDUwMCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdFx0Ly8gJCgnLnNsaWRlcicpLlNsaWRlcih7XG5cdFx0XHRcdC8vIFx0YWN0aXZlQ2xhc3M6ICdzbGlkZXItYWN0aXZlJyxcblx0XHRcdFx0Ly8gXHRhY3RpdmVQb3M6IGFjdGl2ZUluZGV4XG5cdFx0XHRcdC8vIH0pO1xuXHRcdFx0XHR2YXIgc2xpZGVyID0gbmV3IFNsaWRlcigkKCcuc2xpZGVyJyksIHtcblx0XHRcdFx0XHRhY3RpdmVDbGFzczogJ3NsaWRlci1hY3RpdmUnLFxuXHRcdFx0XHRcdGFjdGl2ZVBvczogYWN0aXZlSW5kZXhcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JCgnLnNsaWRlci13JykuYWZ0ZXIodGVtcGxhdGVzLm5hdmlnYXRpb24ob2JqU2xpZGVzKSk7XG5cdFx0XHRcdHNsaWRlci5pbml0U2xpZGVyKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5zdGVwLWRvd24nLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9CbG9jayA9ICQodGhpcykuZGF0YSgndG8nKTtcblxuXHRcdG9ialNsaWRlcyA9IHByZXZTbGlkZXIuY29weUFycmF5T2JqcyhzdG9yZVRlbXBsYXRlc1t0b0Jsb2NrXSk7XG5cdFx0YWN0aXZlSW5kZXggPSAwO1xuXHRcdCQoJy53cmFwcGVyJykuaHRtbCggcmV0dXJuQmxvY2soIHRvQmxvY2ssIHRlbXBsYXRlcywgc3RvcmVUZW1wbGF0ZXNbdG9CbG9ja10gKSApO1xuXHR9KTtcblxuXHQvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0YDQtdC90LTQtdGA0LjRgiDRiNCw0LHQu9C+0L0g0L/RgNC4INCy0L7Qt9Cy0YDQsNGJ0LXQvdC40Lgg0Log0L/RgNC10LTRi9C00YPRidC10LzRgyDRiNCw0LPRg1xuXHRmdW5jdGlvbiByZXR1cm5CbG9jayhuYW1lVGVtcCwgbXlUZW1wbGF0ZXMsIG9wdGlvbnMpe1xuXHRcdHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmIChteVRlbXBsYXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lVGVtcCkpIHtcblx0XHRcdHJldHVybiBteVRlbXBsYXRlc1tuYW1lVGVtcF0ob3B0aW9ucyk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvLyDQpNGD0L3QutGG0LjRjywg0LrQvtGC0YDQsNGPINCy0YvRh9C40YHQu9GP0LXRgiDQsNC60YLQuNCy0L3Ri9C5INGB0LvQsNC50LQg0L/RgNC4INGD0LTQsNC70LXQvdC40Lgg0YHRgtCw0YDQvtCz0L4g0LDQutGC0LjQstC90L7Qs9C+XG5cdGZ1bmN0aW9uIG5ld1Bvc0FjdGl2ZUluZGV4KHNoaWZ0LCBpdGVtKXtcblx0XHR2YXIgc2hpZnQgPSBzaGlmdCB8fCAwO1xuXG5cdFx0aWYoc2hpZnQgPT0gLTEgfHwgKGFjdGl2ZUluZGV4ID09IDAgJiYgaXRlbSA9PSAwKSl7XG5cdFx0XHRjb25zb2xlLmxvZyhhY3RpdmVJbmRleCwgaXRlbSk7XG5cdFx0XHRhY3RpdmVJbmRleCA9IDA7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmKCBhY3RpdmVJbmRleCA9PSAwICYmIGl0ZW0gIT0gMCApe1xuXHRcdFx0JCgnLndyLWJsb2NrJykuZXEoYWN0aXZlSW5kZXgpLmZpbmQoJy53ci1ibG9jay1zZWxlY3RfYWN0aXZlLXRleHQnKS50cmlnZ2VyKCdjbGljaycpO1xuXHRcdH0gZWxzZXtcblx0XHRcdCQoJy53ci1ibG9jaycpLmVxKGFjdGl2ZUluZGV4LXNoaWZ0KS5maW5kKCcud3ItYmxvY2stc2VsZWN0X2FjdGl2ZS10ZXh0JykudHJpZ2dlcignY2xpY2snKTtcblx0XHR9XG5cdH1cblxuXHQvLyDQn9C10YDQtdC80LXRidC10L3QuNC1INCx0LvQvtC60LAsINGBINC/0L7RgdC70LXQtNGD0Y7RidC40Lwg0LXQs9C+INGD0LTQsNC70LXQvdC40LXQvCDQuNC3IERPTVxuXHRmdW5jdGlvbiBibG9ja01vdmUoJGJsb2NrLCBtb3ZlVG8sIG9mZnNldCl7XG5cdFx0dmFyIG1vdmVUbyA9IG1vdmVUbyB8fCAndG9wJyxcblx0XHRcdG9mZnNldCA9IG9mZnNldCB8fCAtMTAwMDtcblx0XHQkYmxvY2suY3NzKG1vdmVUbywgb2Zmc2V0KS5mYWRlT3V0KDEwMCwgZnVuY3Rpb24oKXtcblx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyDQntC/0YDQtdC00LXQu9C10L3QuNC1INGB0L/QvtGB0L7QsdCwINC/0LXRgNC10LzQtdGJ0LXQvdC40Y9cblx0ZnVuY3Rpb24gZmFkZUJsb2NrKCRibG9jaywgYW5pbWF0aW9uLCBjYWxsYmFjayl7IC8vIGFuaW1hdGlvbiDQvNC+0LbQtdGCINCx0YvRgtGMIDE9dXAsIDI9cmlnaHRcblx0XHR2YXIgYW5pbWF0aW9uICAgICAgPSBhbmltYXRpb24gfHwgMTtcblxuXHRcdHN3aXRjaChhbmltYXRpb24pe1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRibG9ja01vdmUoJGJsb2NrLCAndG9wJyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGJsb2NrTW92ZSgkYmxvY2ssICdyaWdodCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aWYoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2soKTtcblx0fVxuXG5cdC8vINCl0LXQu9C/0LXRgCwg0LrQvtGC0L7RgNGL0Lkg0LTQvtCx0LDQstC70Y/QtdGCIDIg0L/QvtGB0LvQtdC00L7QstCw0YLQtdC70YzQvdGL0YUg0YHQu9Cw0LnQtNCwIFxuXHQvLyBwb3NpdGlvbiAtINC90LDRh9Cw0LvQviDQv9C+0LfQuNGG0LjQuCDRgdC70LDQudC00LAsINC60L7RgtC+0YDRi9C5INC90LDQtNC+INC00L7QsdCw0LLQuNGC0YwsIG9iaiAtINGB0LDQvCDRgdC70LDQudC0XG5cdEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2FkZFNsaWRlcycsIGZ1bmN0aW9uKG9iaiwgcG9zaXRpb24pe1xuXHRcdHZhciByZXR1cm5pbmdTdHIgPSAnJyxcblx0XHRcdHBvc2l0aW9uICAgICA9IHBvc2l0aW9uIC0gMjtcblxuXHRcdGZvcih2YXIgaSA9IDIsIGogPSBwb3NpdGlvbjsgaSA+IDA7IGktLSwgaisrICl7IFxuXHRcdFx0cmV0dXJuaW5nU3RyICs9ICc8bGkgY2xhc3M9XCJzbGlkZXItaW1nXCJcIj48aW1nIHNyYz1cIicgKyBvYmpbal0uZm90byArICdcIiBhbHQ9XCJcIi8+Jztcblx0XHRcdFxuXHRcdFx0aWYgKG9ialtqXS5jb21tZW50Lmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm5pbmdTdHIgKz0gJzxkaXYgY2xhc3M9XCJzbGlkZXItaW1nLWNvbW1lbnRcIj4nICsgb2JqW2pdLmNvbW1lbnQgKyAnPC9kaXY+Jztcblx0XHRcdFx0cmV0dXJuaW5nU3RyICs9ICc8L2xpPidcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcocmV0dXJuaW5nU3RyKTtcblx0fSk7XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
