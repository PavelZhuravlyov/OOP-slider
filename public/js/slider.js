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