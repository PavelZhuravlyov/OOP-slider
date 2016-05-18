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