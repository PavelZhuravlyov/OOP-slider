$(document).ready(function(){
	
	(function(){
		var templates = {
			error: Handlebars.compile($('#errorPopUp').html()),
			prewiews: Handlebars.compile($('#prewiews').html())
		};

		function DataLinks(arrayUrls){
			this.arrayUrls = arrayUrls;
			this.arrLength = arrayUrls.length;
		}

		DataLinks.prototype.deleteTabs = function(){
			return this.arrayUrls.replace(/\s|\[|\]|\'|\'/g, '');
		}

		DataLinks.prototype.stringToArray = function(){
			var inputString = this.deleteTabs();
			if(inputString === "") return false;
			this.arrUrls = this.deleteTabs().split(',');

			return this.arrUrls;
		}

		DataLinks.prototype.arrToObj = function(arrUrls){
			var arrUrls = arrUrls || this.stringToArray();
			var obj = {
				'fotos': arrUrls
			};

			return obj;
		}
		DataLinks.prototype.addActiveField = function(){

		}

		DataLinks.prototype.arrayToArrObjs = function(activeIndex){
			var arrObjects = [],
				arrUrls    = this.arrUrls;

			for(var i=0; i<arrUrls.length; i++){
				if(i == activeIndex){
					arrObjects[i] = { 
						foto: arrUrls[i],
						active: true
					};
				}
				else{
					arrObjects[i] = { 
						foto: arrUrls[i]
					};
				}
			}

			return arrObjects;
		}

		

		// Обработчик ошибок
		function ErrorHandler(classErrWindow){
			this.timeHide       = 3000;
			this.classErrWindow = classErrWindow;
		}

		ErrorHandler.prototype.newError = function(errorObject){
			return templates.error(errorObject);
		}

		ErrorHandler.prototype.hideErrorWindow = function(){
			var errWindow = $(this.classErrWindow);

			setTimeout(function(){
				$('.errMes').fadeOut(this.timeHide, function(){
					$('.errMes').remove();
				});
			}, this.timeHide);
		}

		ErrorHandler.prototype.caughtErr = function(options){
			$('body').append(this.newError(options));
			this.hideErrorWindow();
		}


		var errorHandler = new ErrorHandler('.errMes'),
			arrUrls      = [],
			inputStr     = {};

		var activeIndex = 0;

		$(document).on('click', '.wr-form_datas-btn', function(){
			var input    = $('.wr-form_datas-inp').val(),
				objUrls;
			
			inputStr = new DataLinks(input);
			objUrls  = inputStr.arrToObj();
			arrUrls = inputStr.stringToArray();

			if(!arrUrls){
				errorHandler.caughtErr({title: 'Ошибка', message: 'Введите данные'});
				return false;
			}

			fadeBlock($('.wr-form_datas'), 2, function(){
				$('.wr-blocks-w').append(templates.prewiews(objUrls)).fadeIn(500);
			});
			
			return false;
		});

		$(document).on('click', '.wr-block-delete', function(){
			var item      = $(this).data('item'),
				winScrTop = $(window).scrollTop();
			arrUrls.splice(item, 1);

			$('.wr-blocks-w').html('').append(templates.prewiews(inputStr.arrToObj(arrUrls)));
			$(window).scrollTop(winScrTop);

			console.log(item == activeIndex);

			(item < activeIndex) ? newPosActiveIndex(1, item) : 
			(item > activeIndex) ? newPosActiveIndex(0, item) : newPosActiveIndex(-1, item); 
			console.log(activeIndex);

			return false;
		});

		$(document).on('change', '.wr-block-select_active-radio', function(){
			
			activeIndex = parseInt($(this).val());
		});

		$(document).on('click', '.generate-slider', function(){

			console.log(inputStr.arrayToArrObjs(activeIndex));
		});


		

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
	})();

	(function(){
		
		$.fn.Slider = function(options){

			var $slider          = this,
				$arrSlides       = $slider.children(),
				$arrSlidesDef    = $arrSlides,
				countSlides      = $arrSlides.length - 1,
				settings         = $.extend({
			      activeClass    : 'slider-active',
			      activePos      : 0,
			      timeStep       : 3000,
			      slideWidth     : $arrSlides.outerWidth(),
			      arrows         : true
			    }, options),
			    slideWidth       = settings.slideWidth, 
			    indexActiveSlide = settings.activePos,
			    slideStartIndex  = 1,
			    slideEndIndex,
			    inter;

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
				$arrSlides.eq(settings.activePos).addClass(settings.activeClass);

				$arrSlides    = $slider.children();
				countSlides   = $arrSlides.length - 1;
				slideEndIndex = countSlides - 3;
			}

			this.moveToActive = function(data){
				// var toSlide = $slider.find('.slider-active').index() + 1;
				var toSlide = $arrSlides.eq(indexActiveSlide).index() + 2;
				console.log(toSlide);

				$slider.transition({
					'left': -slideWidth * toSlide
				}, function(){
					if(indexActiveSlide == slideEndIndex){
						$slider.css({
							'left': -slideWidth * 2
						});
						indexActiveSlide = slideStartIndex;	
					}
					else indexActiveSlide++;
				});
			}

			this.setActive = function(callback){
				$arrSlidesDef.siblings().removeClass(settings.activeClass);
				$arrSlidesDef.eq(indexActiveSlide).addClass(settings.activeClass);

				if(callback && typeof callback == "function") callback();
			}

			this.intervalStart_Stop = function(interval, action, func){ // action = stop, action = start
				if(action == "stop"){
					clearInterval(interval);
				}
				else if(action == "start"){
					interval = setInterval(func, settings.timeStep);
				}
			}

			this.actionInterval = function(){
				$slider.setActive(function(){
					$slider.moveToActive();
				});
			}

			this.arrowClickHandler = function(){
				
			}

			this.initSlider = function(){
				this.addArrows();
				this.addSlidesToEnd();
				this.setActiveSlide();
				this.moveToActive();
				this.arrowClickHandler();

				inter = setInterval(this.actionInterval, settings.timeStep)	
			}

			this.initSlider();

			return this;
		}

		$('.slider').Slider({
			activeClass: 'slider-active'
		});

	})();
});