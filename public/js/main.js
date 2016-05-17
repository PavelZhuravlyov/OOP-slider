// Обработчик ошибок
function ErrorHandler(classErrWindow){
	this.timeHide       = 2000;
	this.classErrWindow = classErrWindow;
}

ErrorHandler.prototype.newError = function(errorObject){
	return templates.error(errorObject);
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

		function cancelClick(){
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

		this.clearAttrs = function($elem){
			return $elem.removeAttr('data-item');
		}

		this.copySlide = function(indexSlide){
			return this.clearAttrs($arrSlides.eq(indexSlide).clone());
		}

		this.addSlidesToEnd = function(){
			$slider.append(this.copySlide(0));
			$slider.append(this.copySlide(1));

			$slider.prepend(this.copySlide(countSlides));
			$slider.prepend(this.copySlide(countSlides-1));
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

				cancelClick();
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
			this.addSlidesToEnd();
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

// Удаляем из строки лишние знаки
PrevSlider.prototype.deleteTabs = function() {
	var arrayUrls = this.arrayUrls;
	return arrayUrls.replace(/\s|\[|\]|\'|\'/g, '');
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
PrevSlider.prototype.arrayToArrObjs = function(activeIndex) {
	var arrObjects  = [],
		arrUrls     = this.stringToArray(),
		activeIndex = activeIndex || 0;

	console.log(arrUrls);

	for (var i = 0; i < arrUrls.length; i++) {
		if (i == activeIndex) {
			arrObjects[i] = { 
				foto: arrUrls[i],
				active: true,
				comment: ''
			};
		} else {
			arrObjects[i] = { 
				foto: arrUrls[i],
				comment: ''
			};
		}
	}
	
	return arrObjects;
}
$(document).ready(function(){

	var templates = {
		inputLinks: Handlebars.compile($('#inputLinks').html()),
		error:      Handlebars.compile($('#errorPopUp').html()),
		prewiews:   Handlebars.compile($('#prewiews').html()),
		sliderList: Handlebars.compile($('#sliderList').html())
	};

	var storeTemplates = {};

	console.log(storeTemplates);

	var errorHandler = new ErrorHandler('.errMes'),
		inputStr     = '',
		activeIndex  = 0,
		objSlides,
		copyObj = {};

	$(document).on('click', '.wr-form_datas-btn', function() {
		var input  = $('.wr-form_datas-inp').val();
		
		inputStr      = new PrevSlider(input);
		objSlides     = inputStr.arrayToArrObjs(); 

		console.log(objSlides);

		for(var i=0; i < objSlides.length; i++){
			// for(prop in objSlides[i]){
				copyObj[i] = objSlides[i];
			// }
		}

		storeTemplates['prewiews'] = copyObj;

		if(!objSlides){
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

		console.log(storeTemplates['prewiews']);

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
		$('.wrapper').html( returnBlock(toBlock, templates, storeTemplates[toBlock]) );
	});

	function returnBlock(nameTemp, myTemplates, options){
		var options = options || {};

		if (myTemplates.hasOwnProperty(nameTemp)) {
			return myTemplates[nameTemp](options);
		}
	}
	
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

	function blockMove($block, moveTo, offset){
		var moveTo = moveTo || 'top',
			offset = offset || -1000;
		$block.css(moveTo, offset).delay(200).fadeOut(400);
	}

	function fadeBlock($block, animation, callback){ // animation может быть 1=up, 2=left, 3=right
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLmpzIiwic2xpZGVyLmpzIiwicHJldlNsaWRlci5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyDQntCx0YDQsNCx0L7RgtGH0LjQuiDQvtGI0LjQsdC+0LpcclxuZnVuY3Rpb24gRXJyb3JIYW5kbGVyKGNsYXNzRXJyV2luZG93KXtcclxuXHR0aGlzLnRpbWVIaWRlICAgICAgID0gMjAwMDtcclxuXHR0aGlzLmNsYXNzRXJyV2luZG93ID0gY2xhc3NFcnJXaW5kb3c7XHJcbn1cclxuXHJcbkVycm9ySGFuZGxlci5wcm90b3R5cGUubmV3RXJyb3IgPSBmdW5jdGlvbihlcnJvck9iamVjdCl7XHJcblx0cmV0dXJuIHRlbXBsYXRlcy5lcnJvcihlcnJvck9iamVjdCk7XHJcbn07XHJcblxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmhpZGVFcnJvcldpbmRvdyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGVycldpbmRvdyA9ICQodGhpcy5jbGFzc0VycldpbmRvdyk7XHJcblxyXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHRcdGVycldpbmRvdy5mYWRlT3V0KHRoaXMudGltZUhpZGUsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdGVycldpbmRvdy5yZW1vdmUoKTtcclxuXHRcdH0pO1xyXG5cdH0sIHRoaXMudGltZUhpZGUpO1xyXG59O1xyXG5cclxuRXJyb3JIYW5kbGVyLnByb3RvdHlwZS5jYXVnaHRFcnIgPSBmdW5jdGlvbihvcHRpb25zKXtcclxuXHQkKCdib2R5JykuYXBwZW5kKHRoaXMubmV3RXJyb3Iob3B0aW9ucykpO1xyXG5cdHRoaXMuaGlkZUVycm9yV2luZG93KCk7XHJcbn07XHJcblxyXG5FcnJvckhhbmRsZXIucHJvdG90eXBlLmNoZWNrRXJyb3IgPSBmdW5jdGlvbihlcnJvck9wdCwgY29uc29sZU1lc3NhZ2Upe1xyXG5cdHRoaXMuY2F1Z2h0RXJyKGVycm9yT3B0KTtcclxuXHR0aHJvdyBuZXcgRXJyb3IoY29uc29sZU1lc3NhZ2UgfHwgXCJFcnJvclwiKTtcclxufTsiLCIoZnVuY3Rpb24oJCl7XG5cdFx0XG5cdCQuZm4uU2xpZGVyID0gZnVuY3Rpb24ob3B0aW9ucyl7XG5cblx0XHR2YXIgJHNsaWRlciAgICAgICAgICA9IHRoaXMsXG5cdFx0XHQkYXJyU2xpZGVzICAgICAgID0gJHNsaWRlci5jaGlsZHJlbigpLFxuXHRcdFx0JGFyclNsaWRlc0RlZiAgICA9ICRhcnJTbGlkZXMsXG5cdFx0XHRjb3VudFNsaWRlcyAgICAgID0gJGFyclNsaWRlcy5sZW5ndGggLSAxLFxuXHRcdFx0c2V0dGluZ3MgICAgICAgICA9ICQuZXh0ZW5kKHtcblx0XHQgICAgICBhY3RpdmVDbGFzcyAgICA6ICdzbGlkZXItYWN0aXZlJyxcblx0XHQgICAgICBhY3RpdmVQb3MgICAgICA6IDAsXG5cdFx0ICAgICAgdGltZVN0ZXAgICAgICAgOiA3MDAwLFxuXHRcdCAgICAgIHNsaWRlV2lkdGggICAgIDogJGFyclNsaWRlcy5vdXRlcldpZHRoKCksXG5cdFx0ICAgICAgYXJyb3dzICAgICAgICAgOiB0cnVlXG5cdFx0ICAgIH0sIG9wdGlvbnMpLFxuXHRcdCAgICBzbGlkZVdpZHRoICAgICAgID0gc2V0dGluZ3Muc2xpZGVXaWR0aCwgXG5cdFx0ICAgIGluZGV4QWN0aXZlU2xpZGUgPSBzZXR0aW5ncy5hY3RpdmVQb3MgKyAyLFxuXHRcdCAgICBzbGlkZVN0YXJ0SW5kZXggID0gMixcblx0XHQgICAgc2xpZGVFbmRJbmRleCxcblx0XHQgICAgaW50ZXJ2YWw7XG5cblx0XHRmdW5jdGlvbiBjYW5jZWxDbGljaygpe1xuXHRcdFx0JCgnYm9keScpLmFkZENsYXNzKCdib2R5LWJnJyk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJ2JvZHknKS5yZW1vdmVDbGFzcygnYm9keS1iZycpO1xuXHRcdFx0fSwgNTAwKTtcblx0XHR9XG5cblx0XHR0aGlzLmFkZEFycm93cyA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihzZXR0aW5ncy5hcnJvd3Mpe1xuXHRcdFx0XHQkc2xpZGVyLmFmdGVyKFwiXFxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXNsaWRlPVxcXCIxXFxcIiBjbGFzcz1cXFwic2xpZGVyLWFycm93XFxcIj48L2E+XFxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXNsaWRlPVxcXCItMVxcXCIgY2xhc3M9XFxcInNsaWRlci1hcnJvd1xcXCI+PC9hPlwiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5jbGVhckF0dHJzID0gZnVuY3Rpb24oJGVsZW0pe1xuXHRcdFx0cmV0dXJuICRlbGVtLnJlbW92ZUF0dHIoJ2RhdGEtaXRlbScpO1xuXHRcdH1cblxuXHRcdHRoaXMuY29weVNsaWRlID0gZnVuY3Rpb24oaW5kZXhTbGlkZSl7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbGVhckF0dHJzKCRhcnJTbGlkZXMuZXEoaW5kZXhTbGlkZSkuY2xvbmUoKSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5hZGRTbGlkZXNUb0VuZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHQkc2xpZGVyLmFwcGVuZCh0aGlzLmNvcHlTbGlkZSgwKSk7XG5cdFx0XHQkc2xpZGVyLmFwcGVuZCh0aGlzLmNvcHlTbGlkZSgxKSk7XG5cblx0XHRcdCRzbGlkZXIucHJlcGVuZCh0aGlzLmNvcHlTbGlkZShjb3VudFNsaWRlcykpO1xuXHRcdFx0JHNsaWRlci5wcmVwZW5kKHRoaXMuY29weVNsaWRlKGNvdW50U2xpZGVzLTEpKTtcblx0XHR9XG5cblx0XHR0aGlzLnNldEFjdGl2ZVNsaWRlID0gZnVuY3Rpb24oKXtcblx0XHRcdCRhcnJTbGlkZXMgPSAkc2xpZGVyLmNoaWxkcmVuKCk7XG5cdFx0XHRcblx0XHRcdCRzbGlkZXIuY2hpbGRyZW4oJypbZGF0YS1pdGVtPVwiJysgc2V0dGluZ3MuYWN0aXZlUG9zICsnXCJdJykuYWRkQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHRcdFx0JHNsaWRlci5tb3ZlKGluZGV4QWN0aXZlU2xpZGUpO1xuXHRcdFx0XG5cdFx0XHRjb3VudFNsaWRlcyAgID0gJGFyclNsaWRlcy5sZW5ndGggLSAxO1xuXHRcdFx0c2xpZGVFbmRJbmRleCA9IGNvdW50U2xpZGVzIC0gMTtcblx0XHR9XG5cblx0XHR0aGlzLmdldEluZGV4QWN0aXZlU2xpZGUgPSBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRzbGlkZXIuY2hpbGRyZW4oJy4nICsgc2V0dGluZ3MuYWN0aXZlQ2xhc3MpLmluZGV4KCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5jaGFuZ2VBY3RpdmVTbGlkZSA9IGZ1bmN0aW9uKG5leHRTbGlkZSl7XG5cdFx0XHQkYXJyU2xpZGVzLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHRcdFx0JGFyclNsaWRlcy5lcShuZXh0U2xpZGUpLmFkZENsYXNzKHNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0XHR9XG5cblx0XHR0aGlzLmludmlzaWJsZU1vdmVTbGlkZXIgPSBmdW5jdGlvbihpbmRleFBvc2l0aW9uLCBtb3ZpbmdQb3NpdGlvbil7XG5cdFx0XHQkc2xpZGVyLm1vdmUoaW5kZXhQb3NpdGlvbiwgZnVuY3Rpb24oKXtcblx0XHRcdFx0JHNsaWRlci5jc3Moe1xuXHRcdFx0XHRcdCdsZWZ0JzogLXNsaWRlV2lkdGggKiBtb3ZpbmdQb3NpdGlvblxuXHRcdFx0XHR9KTtcblx0XHRcdFx0JHNsaWRlci5jaGFuZ2VBY3RpdmVTbGlkZShtb3ZpbmdQb3NpdGlvbik7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHR0aGlzLmNoZWNrU2xpZGUgPSBmdW5jdGlvbihkYXRhU2xpZGUpe1xuXHRcdFx0dmFyIGRhdGFTbGlkZSA9IGRhdGFTbGlkZSB8fCAxLFxuXHRcdFx0XHRuZXh0U2xpZGUgPSAkc2xpZGVyLmdldEluZGV4QWN0aXZlU2xpZGUoKSArIGRhdGFTbGlkZTtcblxuXHRcdFx0aWYobmV4dFNsaWRlID09IHNsaWRlRW5kSW5kZXgpe1xuXHRcdFx0XHQkc2xpZGVyLmludmlzaWJsZU1vdmVTbGlkZXIobmV4dFNsaWRlLCBzbGlkZVN0YXJ0SW5kZXgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihuZXh0U2xpZGUgPT0gKHNsaWRlU3RhcnRJbmRleC0xKSl7XG5cdFx0XHRcdCRzbGlkZXIuaW52aXNpYmxlTW92ZVNsaWRlcihuZXh0U2xpZGUsIHNsaWRlRW5kSW5kZXgtMSk7XHRcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHQkc2xpZGVyLm1vdmUobmV4dFNsaWRlKTtcblx0XHRcdFx0JHNsaWRlci5jaGFuZ2VBY3RpdmVTbGlkZShuZXh0U2xpZGUpO1xuXHRcdFx0fVx0XG5cdFx0fVxuXG5cdFx0dGhpcy5tb3ZlID0gZnVuY3Rpb24oaW5kZXhQb3MsIGNhbGxiYWNrKXtcblx0XHRcdCRzbGlkZXIudHJhbnNpdGlvbih7XG5cdFx0XHRcdCdsZWZ0JzogLXNsaWRlV2lkdGggKiBpbmRleFBvc1xuXHRcdFx0fSwgNTAwLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRpZihjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjaygpO1xuXHRcdFx0fSk7XHRcblx0XHR9XG5cblx0XHR0aGlzLnN0YXJ0VGltZXIgPSBmdW5jdGlvbih0aW1lciwgZnVuYyl7XG5cdFx0XHRyZXR1cm4gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdCRzbGlkZXIuY2hlY2tTbGlkZSgpO1xuXHRcdFx0XHRcdH0sIHNldHRpbmdzLnRpbWVTdGVwKTtcblx0XHR9XG5cblx0XHR0aGlzLmFycm93Q2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oKXtcblx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuc2xpZGVyLWFycm93JywgZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyIGRhdGFTbGlkZSA9IHBhcnNlSW50KCQodGhpcykuZGF0YSgnc2xpZGUnKSk7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuXG5cdFx0XHRcdGNhbmNlbENsaWNrKCk7XG5cdFx0XHRcdCRzbGlkZXIuY2hlY2tTbGlkZShkYXRhU2xpZGUpO1xuXG5cdFx0XHRcdGludGVydmFsID0gJHNsaWRlci5zdGFydFRpbWVyKGludGVydmFsKTtcblxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHR0aGlzLmluaXRTbGlkZXIgPSBmdW5jdGlvbigpe1xuXHRcdFx0aWYoKHNldHRpbmdzLmFjdGl2ZVBvcyA+ICRhcnJTbGlkZXNEZWYubGVuZ3RoKSB8fCAoc2V0dGluZ3MuYWN0aXZlUG9zIDwgMCkpe1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBY3RpdmUgcG9zaXRpb24gdW5kZWZpbmVkXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmFkZEFycm93cygpO1xuXHRcdFx0dGhpcy5hZGRTbGlkZXNUb0VuZCgpO1xuXHRcdFx0dGhpcy5zZXRBY3RpdmVTbGlkZSgpO1x0XG5cdFx0XHR0aGlzLmFycm93Q2xpY2tIYW5kbGVyKCk7XG5cblx0XHRcdGludGVydmFsID0gJHNsaWRlci5zdGFydFRpbWVyKGludGVydmFsKTtcblx0XHR9XG5cblx0XHR0aGlzLmluaXRTbGlkZXIoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn0pKGpRdWVyeSk7IiwiZnVuY3Rpb24gUHJldlNsaWRlcihhcnJheVVybHMpIHtcclxuXHR0aGlzLmFycmF5VXJscyA9IGFycmF5VXJscztcclxuXHR0aGlzLmFyckxlbmd0aCA9IGFycmF5VXJscy5sZW5ndGg7XHJcbn1cclxuXHJcbi8vINCj0LTQsNC70Y/QtdC8INC40Lcg0YHRgtGA0L7QutC4INC70LjRiNC90LjQtSDQt9C90LDQutC4XHJcblByZXZTbGlkZXIucHJvdG90eXBlLmRlbGV0ZVRhYnMgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgYXJyYXlVcmxzID0gdGhpcy5hcnJheVVybHM7XHJcblx0cmV0dXJuIGFycmF5VXJscy5yZXBsYWNlKC9cXHN8XFxbfFxcXXxcXCd8XFwnL2csICcnKTtcclxufVxyXG5cclxuLy8g0KTQvtGA0LzQuNGA0YPQtdC8INC40Lcg0YHRgtGA0L7QutC4INC80LDRgdGB0LjQslxyXG5QcmV2U2xpZGVyLnByb3RvdHlwZS5zdHJpbmdUb0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGlucHV0U3RyaW5nID0gdGhpcy5kZWxldGVUYWJzKCk7XHJcblxyXG5cdGlmKGlucHV0U3RyaW5nID09PSBcIlwiKSByZXR1cm4gZmFsc2U7XHJcblx0aW5wdXRTdHJpbmcgPSBpbnB1dFN0cmluZy5zcGxpdCgnLCcpO1xyXG5cclxuXHRyZXR1cm4gaW5wdXRTdHJpbmc7XHJcbn1cclxuXHJcbi8vINCk0L7RgNC80LjRgNGD0LXQvCDQvNCw0YHRgdC40LIg0L7QsdGK0LXQutGC0L7QsiBcclxuLy8g0J3QsCDQstGF0L7QtCDQuNC90LTQtdC60YEg0LDQutGC0LjQstC90L7Qs9C+INGB0LvQsNC50LTQsCjRgtC+0YIsINC60L7RgtC+0YDRi9C5INCx0YPQtNC10YIg0L/QvtC60LDQt9GL0LLQsNGC0YzRgdGPINC/0LXRgNCy0YvQvClcclxuUHJldlNsaWRlci5wcm90b3R5cGUuYXJyYXlUb0Fyck9ianMgPSBmdW5jdGlvbihhY3RpdmVJbmRleCkge1xyXG5cdHZhciBhcnJPYmplY3RzICA9IFtdLFxyXG5cdFx0YXJyVXJscyAgICAgPSB0aGlzLnN0cmluZ1RvQXJyYXkoKSxcclxuXHRcdGFjdGl2ZUluZGV4ID0gYWN0aXZlSW5kZXggfHwgMDtcclxuXHJcblx0Y29uc29sZS5sb2coYXJyVXJscyk7XHJcblxyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyVXJscy5sZW5ndGg7IGkrKykge1xyXG5cdFx0aWYgKGkgPT0gYWN0aXZlSW5kZXgpIHtcclxuXHRcdFx0YXJyT2JqZWN0c1tpXSA9IHsgXHJcblx0XHRcdFx0Zm90bzogYXJyVXJsc1tpXSxcclxuXHRcdFx0XHRhY3RpdmU6IHRydWUsXHJcblx0XHRcdFx0Y29tbWVudDogJydcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFyck9iamVjdHNbaV0gPSB7IFxyXG5cdFx0XHRcdGZvdG86IGFyclVybHNbaV0sXHJcblx0XHRcdFx0Y29tbWVudDogJydcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGFyck9iamVjdHM7XHJcbn0iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXG5cdHZhciB0ZW1wbGF0ZXMgPSB7XG5cdFx0aW5wdXRMaW5rczogSGFuZGxlYmFycy5jb21waWxlKCQoJyNpbnB1dExpbmtzJykuaHRtbCgpKSxcblx0XHRlcnJvcjogICAgICBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2Vycm9yUG9wVXAnKS5odG1sKCkpLFxuXHRcdHByZXdpZXdzOiAgIEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcHJld2lld3MnKS5odG1sKCkpLFxuXHRcdHNsaWRlckxpc3Q6IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjc2xpZGVyTGlzdCcpLmh0bWwoKSlcblx0fTtcblxuXHR2YXIgc3RvcmVUZW1wbGF0ZXMgPSB7fTtcblxuXHRjb25zb2xlLmxvZyhzdG9yZVRlbXBsYXRlcyk7XG5cblx0dmFyIGVycm9ySGFuZGxlciA9IG5ldyBFcnJvckhhbmRsZXIoJy5lcnJNZXMnKSxcblx0XHRpbnB1dFN0ciAgICAgPSAnJyxcblx0XHRhY3RpdmVJbmRleCAgPSAwLFxuXHRcdG9ialNsaWRlcyxcblx0XHRjb3B5T2JqID0ge307XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy53ci1mb3JtX2RhdGFzLWJ0bicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpbnB1dCAgPSAkKCcud3ItZm9ybV9kYXRhcy1pbnAnKS52YWwoKTtcblx0XHRcblx0XHRpbnB1dFN0ciAgICAgID0gbmV3IFByZXZTbGlkZXIoaW5wdXQpO1xuXHRcdG9ialNsaWRlcyAgICAgPSBpbnB1dFN0ci5hcnJheVRvQXJyT2JqcygpOyBcblxuXHRcdGNvbnNvbGUubG9nKG9ialNsaWRlcyk7XG5cblx0XHRmb3IodmFyIGk9MDsgaSA8IG9ialNsaWRlcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHQvLyBmb3IocHJvcCBpbiBvYmpTbGlkZXNbaV0pe1xuXHRcdFx0XHRjb3B5T2JqW2ldID0gb2JqU2xpZGVzW2ldO1xuXHRcdFx0Ly8gfVxuXHRcdH1cblxuXHRcdHN0b3JlVGVtcGxhdGVzWydwcmV3aWV3cyddID0gY29weU9iajtcblxuXHRcdGlmKCFvYmpTbGlkZXMpe1xuXHRcdFx0ZXJyb3JIYW5kbGVyLmNoZWNrRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0LTQsNC90L3Ri9C1J1xuXHRcdFx0fSwgXCJEYXRhcyBpcyBlbXB0eVwiKTtcblx0XHR9XG5cblx0XHRmYWRlQmxvY2soJCgnLndyLWZvcm1fZGF0YXMnKSwgMiwgZnVuY3Rpb24oKXtcblx0XHRcdCQoJy53cmFwcGVyJykucHJlcGVuZChcblx0XHRcdFx0dGVtcGxhdGVzLnByZXdpZXdzKG9ialNsaWRlcylcblx0XHRcdCkuZmFkZUluKDUwMCk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLndyLWJsb2NrLWRlbGV0ZScsIGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGl0ZW0gICAgICA9ICQodGhpcykuZGF0YSgnaXRlbScpLFxuXHRcdFx0d2luU2NyVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG5cdFx0b2JqU2xpZGVzLnNwbGljZShpdGVtLCAxKTtcblxuXHRcdCQoJy53cmFwcGVyJykuaHRtbCgnJykuYXBwZW5kKHRlbXBsYXRlcy5wcmV3aWV3cyhvYmpTbGlkZXMpKTtcblx0XHQkKHdpbmRvdykuc2Nyb2xsVG9wKHdpblNjclRvcCk7XG5cblx0XHQoaXRlbSA8IGFjdGl2ZUluZGV4KSA/IG5ld1Bvc0FjdGl2ZUluZGV4KDEsIGl0ZW0pIDogXG5cdFx0KGl0ZW0gPiBhY3RpdmVJbmRleCkgPyBuZXdQb3NBY3RpdmVJbmRleCgwLCBpdGVtKSA6IG5ld1Bvc0FjdGl2ZUluZGV4KC0xLCBpdGVtKTsgXG5cblx0XHRjb25zb2xlLmxvZyhzdG9yZVRlbXBsYXRlc1sncHJld2lld3MnXSk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLndyLWJsb2NrLXNlbGVjdF9hY3RpdmUtcmFkaW8nLCBmdW5jdGlvbigpe1x0XG5cdFx0YWN0aXZlSW5kZXggPSBwYXJzZUludCgkKHRoaXMpLnZhbCgpKTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcud3ItYmxvY2stY29tbWVudC1sYi1pbnAnLCBmdW5jdGlvbigpe1xuXHRcdHZhciBudW1iZXJDb21tZW50ID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdjb21tZW50JykpLFxuXHRcdFx0dGV4dENvbW1lbnQgICA9ICQodGhpcykudmFsKCk7XG5cblx0XHRvYmpTbGlkZXNbbnVtYmVyQ29tbWVudF1bJ2NvbW1lbnQnXSA9IHRleHRDb21tZW50O1xuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmdlbmVyYXRlLXNsaWRlcicsIGZ1bmN0aW9uKCkge1xuXHRcdGlmICghb2JqU2xpZGVzLmxlbmd0aCkge1xuXHRcdFx0ZXJyb3JIYW5kbGVyLmNoZWNrRXJyb3Ioe1xuXHRcdFx0XHR0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIFxuXHRcdFx0XHRtZXNzYWdlOiAn0J3QtdGCINC90Lgg0L7QtNC90L7Qs9C+INGB0LvQsNC50LTQsCdcblx0XHRcdH0sIFwiRGF0YXMgaXMgZW1wdHlcIik7XG5cdFx0fVxuXG5cdFx0ZmFkZUJsb2NrKCQoJy53ci1ibG9ja3MtdycpLCAxLCBmdW5jdGlvbigpIHtcblx0XHRcdCQoJy53cmFwcGVyJykuYXBwZW5kKHRlbXBsYXRlcy5zbGlkZXJMaXN0KG9ialNsaWRlcykpLmZhZGVJbig1MDAsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCcuc2xpZGVyJykuU2xpZGVyKHtcblx0XHRcdFx0XHRhY3RpdmVDbGFzczogJ3NsaWRlci1hY3RpdmUnLFxuXHRcdFx0XHRcdGFjdGl2ZVBvczogYWN0aXZlSW5kZXhcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5zdGVwLWRvd24nLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9CbG9jayA9ICQodGhpcykuZGF0YSgndG8nKTtcblx0XHQkKCcud3JhcHBlcicpLmh0bWwoIHJldHVybkJsb2NrKHRvQmxvY2ssIHRlbXBsYXRlcywgc3RvcmVUZW1wbGF0ZXNbdG9CbG9ja10pICk7XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIHJldHVybkJsb2NrKG5hbWVUZW1wLCBteVRlbXBsYXRlcywgb3B0aW9ucyl7XG5cdFx0dmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYgKG15VGVtcGxhdGVzLmhhc093blByb3BlcnR5KG5hbWVUZW1wKSkge1xuXHRcdFx0cmV0dXJuIG15VGVtcGxhdGVzW25hbWVUZW1wXShvcHRpb25zKTtcblx0XHR9XG5cdH1cblx0XG5cdGZ1bmN0aW9uIG5ld1Bvc0FjdGl2ZUluZGV4KHNoaWZ0LCBpdGVtKXtcblx0XHR2YXIgc2hpZnQgPSBzaGlmdCB8fCAwO1xuXG5cdFx0aWYoc2hpZnQgPT0gLTEgfHwgKGFjdGl2ZUluZGV4ID09IDAgJiYgaXRlbSAhPSAwKSB8fCAoYWN0aXZlSW5kZXggPT0gMCAmJiBpdGVtID09IDApKXtcblx0XHRcdGFjdGl2ZUluZGV4ID0gMDtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdCQoJy53ci1ibG9jaycpLmVxKGFjdGl2ZUluZGV4LXNoaWZ0KS5maW5kKCcud3ItYmxvY2stc2VsZWN0X2FjdGl2ZS10ZXh0JykudHJpZ2dlcignY2xpY2snKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBibG9ja01vdmUoJGJsb2NrLCBtb3ZlVG8sIG9mZnNldCl7XG5cdFx0dmFyIG1vdmVUbyA9IG1vdmVUbyB8fCAndG9wJyxcblx0XHRcdG9mZnNldCA9IG9mZnNldCB8fCAtMTAwMDtcblx0XHQkYmxvY2suY3NzKG1vdmVUbywgb2Zmc2V0KS5kZWxheSgyMDApLmZhZGVPdXQoNDAwKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGZhZGVCbG9jaygkYmxvY2ssIGFuaW1hdGlvbiwgY2FsbGJhY2speyAvLyBhbmltYXRpb24g0LzQvtC20LXRgiDQsdGL0YLRjCAxPXVwLCAyPWxlZnQsIDM9cmlnaHRcblx0XHR2YXIgYW5pbWF0aW9uICAgICAgPSBhbmltYXRpb24gfHwgMTtcblxuXHRcdHN3aXRjaChhbmltYXRpb24pe1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRibG9ja01vdmUoJGJsb2NrLCAndG9wJyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGJsb2NrTW92ZSgkYmxvY2ssICdyaWdodCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aWYoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2soKTtcblx0fVxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
