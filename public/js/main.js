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
(function($){
		
	$.fn.Slider = function(options){

		var $slider          = this,
			$arrSlides       = $slider.children(),
			$arrSlidesDef    = $arrSlides,
			countSlides      = $arrSlides.length - 1,
			settings         = $.extend({
		      activeClass    : 'slider-active',
		      activePos      : 0,
		      timeStep       : 7000,
		      slideWidth     : $arrSlides.outerWidth(),
		      arrows         : true
		    }, options),
		    slideWidth       = settings.slideWidth, 
		    indexActiveSlide = settings.activePos + 2,
		    slideStartIndex  = 2,
		    slideEndIndex,
		    interval;

		function _cancelClick(){
			$('body').addClass('body-bg');
			setTimeout(function(){
				$('body').removeClass('body-bg');
			}, 500);
		}

		this.addArrows = function(){
			if(settings.arrows){
				$slider.after("\
					<a href=\"#\" data-slide=\"1\" class=\"slider-arrow\"></a>\
					<a href=\"#\" data-slide=\"-1\" class=\"slider-arrow\"></a>"
				);
			}
		}

		this.setActiveSlide = function(){
			$arrSlides = $slider.children();
			
			$slider.children('*[data-item="'+ settings.activePos +'"]').addClass(settings.activeClass);
			$slider.move(indexActiveSlide);
			
			countSlides   = $arrSlides.length - 1;
			slideEndIndex = countSlides - 1;
		}

		this.getIndexActiveSlide = function(){
			return $slider.children('.' + settings.activeClass).index();
		}

		this.changeActiveSlide = function(nextSlide){
			$arrSlides.siblings().removeClass(settings.activeClass);
			$arrSlides.eq(nextSlide).addClass(settings.activeClass);
		}

		this.invisibleMoveSlider = function(indexPosition, movingPosition){
			$slider.move(indexPosition, function(){
				$slider.css({
					'left': -slideWidth * movingPosition
				});
				$slider.changeActiveSlide(movingPosition);
			});
		}

		this.checkSlide = function(dataSlide){
			var dataSlide = dataSlide || 1,
				nextSlide = $slider.getIndexActiveSlide() + dataSlide;

			if(nextSlide == slideEndIndex){
				$slider.invisibleMoveSlider(nextSlide, slideStartIndex);
			}
			else if(nextSlide == (slideStartIndex-1)){
				$slider.invisibleMoveSlider(nextSlide, slideEndIndex-1);	
			}
			else {
				$slider.move(nextSlide);
				$slider.changeActiveSlide(nextSlide);
			}	
		}

		this.move = function(indexPos, callback){
			$slider.transition({
				'left': -slideWidth * indexPos
			}, 500, function(){
				if(callback && typeof callback == "function") callback();
			});	
		}

		this.startTimer = function(timer, func){
			return setInterval(function(){
						$slider.checkSlide();
					}, settings.timeStep);
		}

		this.arrowClickHandler = function(){
			$(document).on('click', '.slider-arrow', function(){
				var dataSlide = parseInt($(this).data('slide'));
				clearInterval(interval);

				_cancelClick();
				$slider.checkSlide(dataSlide);

				interval = $slider.startTimer(interval);

				return false;
			});
		}

		this.initSlider = function(){
			if((settings.activePos > $arrSlidesDef.length) || (settings.activePos < 0)){
				throw new Error("Active position undefined");
			}

			this.addArrows();
			this.setActiveSlide();	
			this.arrowClickHandler();

			interval = $slider.startTimer(interval);
		}

		this.initSlider();

		return this;
	}

})(jQuery);
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
		sliderList: Handlebars.compile($('#sliderList').html())
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
			
				$('.slider').Slider({
					activeClass: 'slider-active',
					activePos: activeIndex
				});
				
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

		if(shift == -1 || (activeIndex == 0 && item != 0) || (activeIndex == 0 && item == 0)){
			activeIndex = 0;
			return false;
		}
		else{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwicHJldlNsaWRlci5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6INC+0YjQuNCx0L7QulxyXG5mdW5jdGlvbiBFcnJvckhhbmRsZXIoY2xhc3NFcnJXaW5kb3csIHRlbXBsYXRlUG9wVXApe1xyXG5cdHRoaXMudGltZUhpZGUgICAgICAgPSAyMDAwO1xyXG5cdHRoaXMuY2xhc3NFcnJXaW5kb3cgPSBjbGFzc0VycldpbmRvdztcclxuXHR0aGlzLnRlbXBsYXRlUG9wVXAgID0gdGVtcGxhdGVQb3BVcDtcclxufVxyXG5cclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5uZXdFcnJvciA9IGZ1bmN0aW9uKGVycm9yT2JqZWN0KXtcclxuXHRyZXR1cm4gdGhpcy50ZW1wbGF0ZVBvcFVwKGVycm9yT2JqZWN0KTtcclxufTtcclxuXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuaGlkZUVycm9yV2luZG93ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZXJyV2luZG93ID0gJCh0aGlzLmNsYXNzRXJyV2luZG93KTtcclxuXHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0ZXJyV2luZG93LmZhZGVPdXQodGhpcy50aW1lSGlkZSwgZnVuY3Rpb24oKXtcclxuXHRcdFx0ZXJyV2luZG93LnJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblx0fSwgdGhpcy50aW1lSGlkZSk7XHJcbn07XHJcblxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmNhdWdodEVyciA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xyXG5cdCQoJ2JvZHknKS5hcHBlbmQodGhpcy5uZXdFcnJvcihvcHRpb25zKSk7XHJcblx0dGhpcy5oaWRlRXJyb3JXaW5kb3coKTtcclxufTtcclxuXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUuY2hlY2tFcnJvciA9IGZ1bmN0aW9uKGVycm9yT3B0LCBjb25zb2xlTWVzc2FnZSl7XHJcblx0dGhpcy5jYXVnaHRFcnIoZXJyb3JPcHQpO1xyXG5cdHRocm93IG5ldyBFcnJvcihjb25zb2xlTWVzc2FnZSB8fCBcIkVycm9yXCIpO1xyXG59OyIsIihmdW5jdGlvbigkKXtcblx0XHRcblx0JC5mbi5TbGlkZXIgPSBmdW5jdGlvbihvcHRpb25zKXtcblxuXHRcdHZhciAkc2xpZGVyICAgICAgICAgID0gdGhpcyxcblx0XHRcdCRhcnJTbGlkZXMgICAgICAgPSAkc2xpZGVyLmNoaWxkcmVuKCksXG5cdFx0XHQkYXJyU2xpZGVzRGVmICAgID0gJGFyclNsaWRlcyxcblx0XHRcdGNvdW50U2xpZGVzICAgICAgPSAkYXJyU2xpZGVzLmxlbmd0aCAtIDEsXG5cdFx0XHRzZXR0aW5ncyAgICAgICAgID0gJC5leHRlbmQoe1xuXHRcdCAgICAgIGFjdGl2ZUNsYXNzICAgIDogJ3NsaWRlci1hY3RpdmUnLFxuXHRcdCAgICAgIGFjdGl2ZVBvcyAgICAgIDogMCxcblx0XHQgICAgICB0aW1lU3RlcCAgICAgICA6IDcwMDAsXG5cdFx0ICAgICAgc2xpZGVXaWR0aCAgICAgOiAkYXJyU2xpZGVzLm91dGVyV2lkdGgoKSxcblx0XHQgICAgICBhcnJvd3MgICAgICAgICA6IHRydWVcblx0XHQgICAgfSwgb3B0aW9ucyksXG5cdFx0ICAgIHNsaWRlV2lkdGggICAgICAgPSBzZXR0aW5ncy5zbGlkZVdpZHRoLCBcblx0XHQgICAgaW5kZXhBY3RpdmVTbGlkZSA9IHNldHRpbmdzLmFjdGl2ZVBvcyArIDIsXG5cdFx0ICAgIHNsaWRlU3RhcnRJbmRleCAgPSAyLFxuXHRcdCAgICBzbGlkZUVuZEluZGV4LFxuXHRcdCAgICBpbnRlcnZhbDtcblxuXHRcdGZ1bmN0aW9uIF9jYW5jZWxDbGljaygpe1xuXHRcdFx0JCgnYm9keScpLmFkZENsYXNzKCdib2R5LWJnJyk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJ2JvZHknKS5yZW1vdmVDbGFzcygnYm9keS1iZycpO1xuXHRcdFx0fSwgNTAwKTtcblx0XHR9XG5cblx0XHR0aGlzLmFkZEFycm93cyA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihzZXR0aW5ncy5hcnJvd3Mpe1xuXHRcdFx0XHQkc2xpZGVyLmFmdGVyKFwiXFxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXNsaWRlPVxcXCIxXFxcIiBjbGFzcz1cXFwic2xpZGVyLWFycm93XFxcIj48L2E+XFxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXNsaWRlPVxcXCItMVxcXCIgY2xhc3M9XFxcInNsaWRlci1hcnJvd1xcXCI+PC9hPlwiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHQkYXJyU2xpZGVzID0gJHNsaWRlci5jaGlsZHJlbigpO1xuXHRcdFx0XG5cdFx0XHQkc2xpZGVyLmNoaWxkcmVuKCcqW2RhdGEtaXRlbT1cIicrIHNldHRpbmdzLmFjdGl2ZVBvcyArJ1wiXScpLmFkZENsYXNzKHNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0XHRcdCRzbGlkZXIubW92ZShpbmRleEFjdGl2ZVNsaWRlKTtcblx0XHRcdFxuXHRcdFx0Y291bnRTbGlkZXMgICA9ICRhcnJTbGlkZXMubGVuZ3RoIC0gMTtcblx0XHRcdHNsaWRlRW5kSW5kZXggPSBjb3VudFNsaWRlcyAtIDE7XG5cdFx0fVxuXG5cdFx0dGhpcy5nZXRJbmRleEFjdGl2ZVNsaWRlID0gZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiAkc2xpZGVyLmNoaWxkcmVuKCcuJyArIHNldHRpbmdzLmFjdGl2ZUNsYXNzKS5pbmRleCgpO1xuXHRcdH1cblxuXHRcdHRoaXMuY2hhbmdlQWN0aXZlU2xpZGUgPSBmdW5jdGlvbihuZXh0U2xpZGUpe1xuXHRcdFx0JGFyclNsaWRlcy5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKHNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0XHRcdCRhcnJTbGlkZXMuZXEobmV4dFNsaWRlKS5hZGRDbGFzcyhzZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5pbnZpc2libGVNb3ZlU2xpZGVyID0gZnVuY3Rpb24oaW5kZXhQb3NpdGlvbiwgbW92aW5nUG9zaXRpb24pe1xuXHRcdFx0JHNsaWRlci5tb3ZlKGluZGV4UG9zaXRpb24sIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCRzbGlkZXIuY3NzKHtcblx0XHRcdFx0XHQnbGVmdCc6IC1zbGlkZVdpZHRoICogbW92aW5nUG9zaXRpb25cblx0XHRcdFx0fSk7XG5cdFx0XHRcdCRzbGlkZXIuY2hhbmdlQWN0aXZlU2xpZGUobW92aW5nUG9zaXRpb24pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5jaGVja1NsaWRlID0gZnVuY3Rpb24oZGF0YVNsaWRlKXtcblx0XHRcdHZhciBkYXRhU2xpZGUgPSBkYXRhU2xpZGUgfHwgMSxcblx0XHRcdFx0bmV4dFNsaWRlID0gJHNsaWRlci5nZXRJbmRleEFjdGl2ZVNsaWRlKCkgKyBkYXRhU2xpZGU7XG5cblx0XHRcdGlmKG5leHRTbGlkZSA9PSBzbGlkZUVuZEluZGV4KXtcblx0XHRcdFx0JHNsaWRlci5pbnZpc2libGVNb3ZlU2xpZGVyKG5leHRTbGlkZSwgc2xpZGVTdGFydEluZGV4KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYobmV4dFNsaWRlID09IChzbGlkZVN0YXJ0SW5kZXgtMSkpe1xuXHRcdFx0XHQkc2xpZGVyLmludmlzaWJsZU1vdmVTbGlkZXIobmV4dFNsaWRlLCBzbGlkZUVuZEluZGV4LTEpO1x0XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0JHNsaWRlci5tb3ZlKG5leHRTbGlkZSk7XG5cdFx0XHRcdCRzbGlkZXIuY2hhbmdlQWN0aXZlU2xpZGUobmV4dFNsaWRlKTtcblx0XHRcdH1cdFxuXHRcdH1cblxuXHRcdHRoaXMubW92ZSA9IGZ1bmN0aW9uKGluZGV4UG9zLCBjYWxsYmFjayl7XG5cdFx0XHQkc2xpZGVyLnRyYW5zaXRpb24oe1xuXHRcdFx0XHQnbGVmdCc6IC1zbGlkZVdpZHRoICogaW5kZXhQb3Ncblx0XHRcdH0sIDUwMCwgZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2soKTtcblx0XHRcdH0pO1x0XG5cdFx0fVxuXG5cdFx0dGhpcy5zdGFydFRpbWVyID0gZnVuY3Rpb24odGltZXIsIGZ1bmMpe1xuXHRcdFx0cmV0dXJuIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHQkc2xpZGVyLmNoZWNrU2xpZGUoKTtcblx0XHRcdFx0XHR9LCBzZXR0aW5ncy50aW1lU3RlcCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5hcnJvd0NsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCl7XG5cdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnNsaWRlci1hcnJvdycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciBkYXRhU2xpZGUgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ3NsaWRlJykpO1xuXHRcdFx0XHRjbGVhckludGVydmFsKGludGVydmFsKTtcblxuXHRcdFx0XHRfY2FuY2VsQ2xpY2soKTtcblx0XHRcdFx0JHNsaWRlci5jaGVja1NsaWRlKGRhdGFTbGlkZSk7XG5cblx0XHRcdFx0aW50ZXJ2YWwgPSAkc2xpZGVyLnN0YXJ0VGltZXIoaW50ZXJ2YWwpO1xuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHRoaXMuaW5pdFNsaWRlciA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZigoc2V0dGluZ3MuYWN0aXZlUG9zID4gJGFyclNsaWRlc0RlZi5sZW5ndGgpIHx8IChzZXR0aW5ncy5hY3RpdmVQb3MgPCAwKSl7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFjdGl2ZSBwb3NpdGlvbiB1bmRlZmluZWRcIik7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkQXJyb3dzKCk7XG5cdFx0XHR0aGlzLnNldEFjdGl2ZVNsaWRlKCk7XHRcblx0XHRcdHRoaXMuYXJyb3dDbGlja0hhbmRsZXIoKTtcblxuXHRcdFx0aW50ZXJ2YWwgPSAkc2xpZGVyLnN0YXJ0VGltZXIoaW50ZXJ2YWwpO1xuXHRcdH1cblxuXHRcdHRoaXMuaW5pdFNsaWRlcigpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufSkoalF1ZXJ5KTsiLCJmdW5jdGlvbiBQcmV2U2xpZGVyKGFycmF5VXJscykge1xyXG5cdHRoaXMuYXJyYXlVcmxzID0gYXJyYXlVcmxzO1xyXG5cdHRoaXMuYXJyTGVuZ3RoID0gYXJyYXlVcmxzLmxlbmd0aDtcclxufVxyXG5cclxuLy8g0KPQtNCw0LvRj9C10Lwg0LjQtyDRgdGC0YDQvtC60Lgg0LvQuNGI0L3QuNC1INGB0LjQvNCy0L7Qu9GLXHJcblByZXZTbGlkZXIucHJvdG90eXBlLmRlbGV0ZVRhYnMgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgX2FycmF5VXJscyA9IHRoaXMuYXJyYXlVcmxzO1xyXG5cdHJldHVybiBfYXJyYXlVcmxzLnJlcGxhY2UoL1xcc3xcXFt8XFxdfFxcJ3xcXCcvZywgJycpO1xyXG59XHJcblxyXG4vLyDQpNC+0YDQvNC40YDRg9C10Lwg0LjQtyDRgdGC0YDQvtC60Lgg0LzQsNGB0YHQuNCyXHJcblByZXZTbGlkZXIucHJvdG90eXBlLnN0cmluZ1RvQXJyYXkgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgaW5wdXRTdHJpbmcgPSB0aGlzLmRlbGV0ZVRhYnMoKTtcclxuXHJcblx0aWYoaW5wdXRTdHJpbmcgPT09IFwiXCIpIHJldHVybiBmYWxzZTtcclxuXHRpbnB1dFN0cmluZyA9IGlucHV0U3RyaW5nLnNwbGl0KCcsJyk7XHJcblxyXG5cdHJldHVybiBpbnB1dFN0cmluZztcclxufVxyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC80LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyIFxyXG4vLyDQndCwINCy0YXQvtC0INC40L3QtNC10LrRgSDQsNC60YLQuNCy0L3QvtCz0L4g0YHQu9Cw0LnQtNCwKNGC0L7Rgiwg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDQv9C+0LrQsNC30YvQstCw0YLRjNGB0Y8g0L/QtdGA0LLRi9C8KVxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5hcnJheVRvQXJyT2JqcyA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBhcnJPYmplY3RzICA9IFtdLFxyXG5cdFx0ICBhcnJVcmxzICAgICA9IHRoaXMuc3RyaW5nVG9BcnJheSgpO1xyXG5cclxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFyclVybHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdGFyck9iamVjdHNbaV0gPSB7IFxyXG5cdFx0XHRmb3RvOiBhcnJVcmxzW2ldLFxyXG5cdFx0XHRjb21tZW50OiAnJ1xyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGFyck9iamVjdHM7XHJcbn1cclxuXHJcbi8vINCa0L7Qv9C40YDQvtCy0LDQvdC40LUg0LzQsNGB0YHQuNCy0LAg0L7QsdGK0LXQutGC0L7Qsi5cclxuLy8g0JTQu9GPINGC0L7Qs9C+LCDRh9GC0L7QsSDQvNC+0LbQvdC+INCx0YvQu9C+INC/0LXRgNC10LzQtdGJ0LDRgtGM0YHRjyDQvNC10LbQtNGDINGI0LDQs9Cw0LzQuFxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5jb3B5QXJyYXlPYmpzID0gZnVuY3Rpb24oYXJyYXlPYmpzKSB7XHJcblx0IGlmICghYXJyYXlPYmpzIHx8ICdvYmplY3QnICE9PSB0eXBlb2YgYXJyYXlPYmpzKSB7XHRcclxuXHQgICByZXR1cm4gYXJyYXlPYmpzO1xyXG5cdCB9XHJcblxyXG5cdCB2YXIgbmV3QXJyYXkgPSAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGFycmF5T2Jqcy5wb3ApID8gW10gOiB7fTtcclxuXHQgdmFyIHByb3AsIHZhbHVlO1xyXG5cclxuXHJcblx0IGZvcihwcm9wIGluIGFycmF5T2Jqcykge1xyXG5cdCBcdFx0Y29uc29sZS5sb2cocHJvcCk7XHJcblx0XHQgIGlmKGFycmF5T2Jqcy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG5cdFx0XHQgIHZhbHVlID0gYXJyYXlPYmpzW3Byb3BdO1xyXG5cdFx0XHQgIGlmKHZhbHVlICYmICdvYmplY3QnID09PSB0eXBlb2YgdmFsdWUpIHtcclxuXHRcdFx0ICAgIG5ld0FycmF5W3Byb3BdID0gdGhpcy5jb3B5QXJyYXlPYmpzKHZhbHVlKTtcclxuXHRcdFx0ICB9IGVsc2Uge1xyXG5cdFx0XHQgICAgbmV3QXJyYXlbcHJvcF0gPSB2YWx1ZTtcclxuXHRcdFx0ICB9XHJcblx0ICAgIH1cclxuXHRcdH1cclxuXHJcblx0ICByZXR1cm4gbmV3QXJyYXk7XHJcblxyXG5cdCAvLyByZXR1cm4gW10uY29uY2F0KGFycmF5T2Jqcyk7IC8vINC10YHQu9C4INC90LDQtNC+INCx0YPQtNC10YIg0YHQvtGF0YDQsNC90Y/RgtGMINGD0LbQtSDQt9Cw0L/QuNGB0LDQvdC90YvQtSDQv9C+0LvRj1xyXG59OyIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblx0dmFyIHRlbXBsYXRlcyA9IHtcblx0XHRpbnB1dExpbmtzOiBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2lucHV0TGlua3MnKS5odG1sKCkpLFxuXHRcdGVycm9yOiAgICAgIEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjZXJyb3JQb3BVcCcpLmh0bWwoKSksXG5cdFx0cHJld2lld3M6ICAgSGFuZGxlYmFycy5jb21waWxlKCQoJyNwcmV3aWV3cycpLmh0bWwoKSksXG5cdFx0c2xpZGVyTGlzdDogSGFuZGxlYmFycy5jb21waWxlKCQoJyNzbGlkZXJMaXN0JykuaHRtbCgpKVxuXHR9O1xuXG5cdHZhciBzdG9yZVRlbXBsYXRlcyA9IHt9O1xuXG5cdHZhciBlcnJvckhhbmRsZXIgPSBuZXcgRXJyb3JIYW5kbGVyKCcuZXJyTWVzJywgdGVtcGxhdGVzLmVycm9yKSxcblx0XHRwcmV2U2xpZGVyICAgPSB7fSxcblx0XHRhY3RpdmVJbmRleCAgPSAwLFxuXHRcdG9ialNsaWRlcztcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLndyLWZvcm1fZGF0YXMtYnRuJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGlucHV0U3RyICA9ICQoJy53ci1mb3JtX2RhdGFzLWlucCcpLnZhbCgpO1xuXHRcdFxuXHRcdHByZXZTbGlkZXIgID0gbmV3IFByZXZTbGlkZXIoaW5wdXRTdHIpO1xuXHRcdG9ialNsaWRlcyAgID0gcHJldlNsaWRlci5hcnJheVRvQXJyT2JqcygpOyBcblxuXHRcdHN0b3JlVGVtcGxhdGVzWydwcmV3aWV3cyddID0gcHJldlNsaWRlci5jb3B5QXJyYXlPYmpzKG9ialNsaWRlcyk7XG5cblx0XHRpZighb2JqU2xpZGVzLmxlbmd0aCl7XG5cdFx0XHRlcnJvckhhbmRsZXIuY2hlY2tFcnJvcih7XG5cdFx0XHRcdHRpdGxlOiAn0J7RiNC40LHQutCwJywgXG5cdFx0XHRcdG1lc3NhZ2U6ICfQktCy0LXQtNC40YLQtSDQtNCw0L3QvdGL0LUnXG5cdFx0XHR9LCBcIkRhdGFzIGlzIGVtcHR5XCIpO1xuXHRcdH1cblxuXHRcdGZhZGVCbG9jaygkKCcud3ItZm9ybV9kYXRhcycpLCAyLCBmdW5jdGlvbigpe1xuXHRcdFx0JCgnLndyYXBwZXInKS5wcmVwZW5kKFxuXHRcdFx0XHR0ZW1wbGF0ZXMucHJld2lld3Mob2JqU2xpZGVzKVxuXHRcdFx0KS5mYWRlSW4oNTAwKTtcblx0XHR9KTtcblx0XHRcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcud3ItYmxvY2stZGVsZXRlJywgZnVuY3Rpb24oKXtcblx0XHR2YXIgaXRlbSAgICAgID0gJCh0aGlzKS5kYXRhKCdpdGVtJyksXG5cdFx0XHR3aW5TY3JUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cblx0XHRvYmpTbGlkZXMuc3BsaWNlKGl0ZW0sIDEpO1xuXG5cdFx0JCgnLndyYXBwZXInKS5odG1sKCcnKS5hcHBlbmQodGVtcGxhdGVzLnByZXdpZXdzKG9ialNsaWRlcykpO1xuXHRcdCQod2luZG93KS5zY3JvbGxUb3Aod2luU2NyVG9wKTtcblxuXHRcdChpdGVtIDwgYWN0aXZlSW5kZXgpID8gbmV3UG9zQWN0aXZlSW5kZXgoMSwgaXRlbSkgOiBcblx0XHQoaXRlbSA+IGFjdGl2ZUluZGV4KSA/IG5ld1Bvc0FjdGl2ZUluZGV4KDAsIGl0ZW0pIDogbmV3UG9zQWN0aXZlSW5kZXgoLTEsIGl0ZW0pOyBcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcud3ItYmxvY2stc2VsZWN0X2FjdGl2ZS1yYWRpbycsIGZ1bmN0aW9uKCl7XHRcblx0XHRhY3RpdmVJbmRleCA9IHBhcnNlSW50KCQodGhpcykudmFsKCkpO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy53ci1ibG9jay1jb21tZW50LWxiLWlucCcsIGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG51bWJlckNvbW1lbnQgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2NvbW1lbnQnKSksXG5cdFx0XHR0ZXh0Q29tbWVudCAgID0gJCh0aGlzKS52YWwoKTtcblxuXHRcdG9ialNsaWRlc1tudW1iZXJDb21tZW50XVsnY29tbWVudCddID0gdGV4dENvbW1lbnQ7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZ2VuZXJhdGUtc2xpZGVyJywgZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coc3RvcmVUZW1wbGF0ZXNbJ3ByZXdpZXdzJ10pO1xuXG5cdFx0aWYgKCFvYmpTbGlkZXMubGVuZ3RoKSB7XG5cdFx0XHRlcnJvckhhbmRsZXIuY2hlY2tFcnJvcih7XG5cdFx0XHRcdHRpdGxlOiAn0J7RiNC40LHQutCwJywgXG5cdFx0XHRcdG1lc3NhZ2U6ICfQndC10YIg0L3QuCDQvtC00L3QvtCz0L4g0YHQu9Cw0LnQtNCwJ1xuXHRcdFx0fSwgXCJEYXRhcyBpcyBlbXB0eVwiKTtcblx0XHR9XG5cblx0XHRmYWRlQmxvY2soJCgnLndyLWJsb2Nrcy13JyksIDEsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLndyYXBwZXInKS5hcHBlbmQodGVtcGxhdGVzLnNsaWRlckxpc3Qob2JqU2xpZGVzKSkuZmFkZUluKDUwMCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdFx0JCgnLnNsaWRlcicpLlNsaWRlcih7XG5cdFx0XHRcdFx0YWN0aXZlQ2xhc3M6ICdzbGlkZXItYWN0aXZlJyxcblx0XHRcdFx0XHRhY3RpdmVQb3M6IGFjdGl2ZUluZGV4XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnN0ZXAtZG93bicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciB0b0Jsb2NrID0gJCh0aGlzKS5kYXRhKCd0bycpO1xuXG5cdFx0b2JqU2xpZGVzID0gcHJldlNsaWRlci5jb3B5QXJyYXlPYmpzKHN0b3JlVGVtcGxhdGVzW3RvQmxvY2tdKTtcblx0XHRhY3RpdmVJbmRleCA9IDA7XG5cdFx0JCgnLndyYXBwZXInKS5odG1sKCByZXR1cm5CbG9jayggdG9CbG9jaywgdGVtcGxhdGVzLCBzdG9yZVRlbXBsYXRlc1t0b0Jsb2NrXSApICk7XG5cdH0pO1xuXG5cdC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDRgNC10L3QtNC10YDQuNGCINGI0LDQsdC70L7QvSDQv9GA0Lgg0LLQvtC30LLRgNCw0YnQtdC90LjQuCDQuiDQv9GA0LXQtNGL0LTRg9GJ0LXQvNGDINGI0LDQs9GDXG5cdGZ1bmN0aW9uIHJldHVybkJsb2NrKG5hbWVUZW1wLCBteVRlbXBsYXRlcywgb3B0aW9ucyl7XG5cdFx0dmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYgKG15VGVtcGxhdGVzLmhhc093blByb3BlcnR5KG5hbWVUZW1wKSkge1xuXHRcdFx0cmV0dXJuIG15VGVtcGxhdGVzW25hbWVUZW1wXShvcHRpb25zKTtcblx0XHR9XG5cdH1cblx0XG5cdC8vINCk0YPQvdC60YbQuNGPLCDQutC+0YLRgNCw0Y8g0LLRi9GH0LjRgdC70Y/QtdGCINCw0LrRgtC40LLQvdGL0Lkg0YHQu9Cw0LnQtCDQv9GA0Lgg0YPQtNCw0LvQtdC90LjQuCDRgdGC0LDRgNC+0LPQviDQsNC60YLQuNCy0L3QvtCz0L5cblx0ZnVuY3Rpb24gbmV3UG9zQWN0aXZlSW5kZXgoc2hpZnQsIGl0ZW0pe1xuXHRcdHZhciBzaGlmdCA9IHNoaWZ0IHx8IDA7XG5cblx0XHRpZihzaGlmdCA9PSAtMSB8fCAoYWN0aXZlSW5kZXggPT0gMCAmJiBpdGVtICE9IDApIHx8IChhY3RpdmVJbmRleCA9PSAwICYmIGl0ZW0gPT0gMCkpe1xuXHRcdFx0YWN0aXZlSW5kZXggPSAwO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0JCgnLndyLWJsb2NrJykuZXEoYWN0aXZlSW5kZXgtc2hpZnQpLmZpbmQoJy53ci1ibG9jay1zZWxlY3RfYWN0aXZlLXRleHQnKS50cmlnZ2VyKCdjbGljaycpO1xuXHRcdH1cblx0fVxuXG5cdC8vINCf0LXRgNC10LzQtdGJ0LXQvdC40LUg0LHQu9C+0LrQsCwg0YEg0L/QvtGB0LvQtdC00YPRjtGJ0LjQvCDQtdCz0L4g0YPQtNCw0LvQtdC90LjQtdC8INC40LcgRE9NXG5cdGZ1bmN0aW9uIGJsb2NrTW92ZSgkYmxvY2ssIG1vdmVUbywgb2Zmc2V0KXtcblx0XHR2YXIgbW92ZVRvID0gbW92ZVRvIHx8ICd0b3AnLFxuXHRcdFx0b2Zmc2V0ID0gb2Zmc2V0IHx8IC0xMDAwO1xuXHRcdCRibG9jay5jc3MobW92ZVRvLCBvZmZzZXQpLmZhZGVPdXQoMTAwLCBmdW5jdGlvbigpe1xuXHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vINCe0L/RgNC10LTQtdC70LXQvdC40LUg0YHQv9C+0YHQvtCx0LAg0L/QtdGA0LXQvNC10YnQtdC90LjRj1xuXHRmdW5jdGlvbiBmYWRlQmxvY2soJGJsb2NrLCBhbmltYXRpb24sIGNhbGxiYWNrKXsgLy8gYW5pbWF0aW9uINC80L7QttC10YIg0LHRi9GC0YwgMT11cCwgMj1yaWdodFxuXHRcdHZhciBhbmltYXRpb24gICAgICA9IGFuaW1hdGlvbiB8fCAxO1xuXG5cdFx0c3dpdGNoKGFuaW1hdGlvbil7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdGJsb2NrTW92ZSgkYmxvY2ssICd0b3AnKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0YmxvY2tNb3ZlKCRibG9jaywgJ3JpZ2h0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRpZihjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjaygpO1xuXHR9XG5cblx0Ly8g0KXQtdC70L/QtdGALCDQutC+0YLQvtGA0YvQuSDQtNC+0LHQsNCy0LvRj9C10YIgMiDQv9C+0YHQu9C10LTQvtCy0LDRgtC10LvRjNC90YvRhSDRgdC70LDQudC00LAgXG5cdC8vIHBvc2l0aW9uIC0g0L3QsNGH0LDQu9C+INC/0L7Qt9C40YbQuNC4INGB0LvQsNC50LTQsCwg0LrQvtGC0L7RgNGL0Lkg0L3QsNC00L4g0LTQvtCx0LDQstC40YLRjCwgb2JqIC0g0YHQsNC8INGB0LvQsNC50LRcblx0SGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYWRkU2xpZGVzJywgZnVuY3Rpb24ob2JqLCBwb3NpdGlvbil7XG5cdFx0dmFyIHJldHVybmluZ1N0ciA9ICcnLFxuXHRcdFx0cG9zaXRpb24gICAgID0gcG9zaXRpb24gLSAyO1xuXG5cdFx0Zm9yKHZhciBpID0gMiwgaiA9IHBvc2l0aW9uOyBpID4gMDsgaS0tLCBqKysgKXsgXG5cdFx0XHRyZXR1cm5pbmdTdHIgKz0gJzxsaSBjbGFzcz1cInNsaWRlci1pbWdcIlwiPjxpbWcgc3JjPVwiJyArIG9ialtqXS5mb3RvICsgJ1wiIGFsdD1cIlwiLz4nO1xuXHRcdFx0XG5cdFx0XHRpZiAob2JqW2pdLmNvbW1lbnQubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybmluZ1N0ciArPSAnPGRpdiBjbGFzcz1cInNsaWRlci1pbWctY29tbWVudFwiPicgKyBvYmpbal0uY29tbWVudCArICc8L2Rpdj4nO1xuXHRcdFx0XHRyZXR1cm5pbmdTdHIgKz0gJzwvbGk+J1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhyZXR1cm5pbmdTdHIpO1xuXHR9KTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
