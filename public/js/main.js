$(document).ready(function(){
	
	(function(){
		var templates = {
			error: Handlebars.compile($('#errorPopUp').html()),
			prewiews: Handlebars.compile($('#prewiews').html()),
			sliderList: Handlebars.compile($('#sliderList').html())
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
			this.arrayUrls = inputString.split(',');

			return this.arrayUrls;
		}

		DataLinks.prototype.arrToObj = function(arrUrls){
			var arrUrls = arrUrls || this.stringToArray();
			var obj = {
				'fotos': arrUrls
			};
			return obj;
		}
		
		DataLinks.prototype.arrayToArrObjs = function(activeIndex){
			var arrObjects  = [],
				arrUrls     = this.arrayUrls,
				activeIndex = activeIndex || 0;

			for(var i=0; i<arrUrls.length; i++){
				if(i == activeIndex){
					arrObjects[i] = { 
						foto: arrUrls[i],
						active: true,
						comment: ''
					};
				}
				else{
					arrObjects[i] = { 
						foto: arrUrls[i],
						comment: ''
					};
				}
			}
			return arrObjects;
		}

		// Обработчик ошибок
		function ErrorHandler(classErrWindow){
			this.timeHide       = 2000;
			this.classErrWindow = classErrWindow;
		}

		ErrorHandler.prototype.newError = function(errorObject){
			return templates.error(errorObject);
		}

		ErrorHandler.prototype.hideErrorWindow = function(){
			var errWindow = $(this.classErrWindow);

			setTimeout(function(){
				errWindow.fadeOut(this.timeHide, function(){
					errWindow.remove();
				});
			}, this.timeHide);
		}

		ErrorHandler.prototype.caughtErr = function(options){
			$('body').append(this.newError(options));
			this.hideErrorWindow();
		}

		ErrorHandler.checkError = function(errorOpt, consoleMessage){
			errorHandler.caughtErr(errorOpt);
			throw new Error(consoleMessage || "Error");
		}


		var errorHandler = new ErrorHandler('.errMes'),
			inputStr     = '',
			activeIndex  = 0,
			objSlides;

		$(document).on('click', '.wr-form_datas-btn', function(){
			var input  = $('.wr-form_datas-inp').val();
			
			inputStr   = new DataLinks(input);
			objSlides  = inputStr.arrayToArrObjs();

			if(!objSlides){
				ErrorHandler.checkError({
					title: 'Ошибка', 
					message: 'Введите данные'
				}, "Datas is empty");
			}

			fadeBlock($('.wr-form_datas'), 2, function(){
				$('.wr-blocks-w').append(templates.prewiews(objSlides)).fadeIn(500);
			});
			
			return false;
		});

		$(document).on('click', '.wr-block-delete', function(){
			var item      = $(this).data('item'),
				winScrTop = $(window).scrollTop();

			objSlides.splice(item, 1);

			$('.wr-blocks-w').html('').append(templates.prewiews(objSlides));
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

		$(document).on('click', '.generate-slider', function(){
			if(!objSlides.length){
				ErrorHandler.checkError({
					title: 'Ошибка', 
					message: 'Нет ни одного слайда'
				}, "Datas is empty");
			}

			fadeBlock($('.wr-blocks-w'), 1, function(){
				$('.wrapper').append(templates.sliderList(objSlides)).fadeIn(500, function(){
					$('.slider').Slider({
						activeClass: 'slider-active',
						activePos: activeIndex
					});
				});
			});
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
});