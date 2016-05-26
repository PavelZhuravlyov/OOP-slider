$(document).ready(function() {

(function(){
	var _templates = {
		inputLinks: Handlebars.compile($('#inputLinks').html()),
		error: Handlebars.compile($('#errorPopUp').html()),
		prewiews: Handlebars.compile($('#prewiews').html()),
		sliderList: Handlebars.compile($('#sliderList').html())
	};

	var 
		_errorHandler = new ErrorHandler('.errMes', _templates.error),
		_activeIndex = 0,
		_prevSlider,
		_objSlides;

	$('.wrapper').html(_templates.inputLinks())

	$(document).on('click', '.js-save_datas', function() {
		var inputStr = $('.wr-form_datas-inp').val();
		
		_prevSlider = new PrevSlider(inputStr);
		_objSlides = _prevSlider.arrayToArrObjs(); 

		if (!_objSlides.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Введите данные'
			}, 'Datas is empty');
		}

		_fadeBlock($('.wr-form_datas'), 2, function() {
			$('.wrapper').prepend(_templates.prewiews(_objSlides)).fadeIn(500);
		});
		
		return false;
	});

	$(document).on('change', '.js-active_btn', function() {	
		var numNewActive = $(this).val();

		delete _objSlides[_activeIndex].active;

		_activeIndex = (_activeIndex === numNewActive) ? _activeIndex : numNewActive;
		_objSlides[_activeIndex].active = 'checked';
	});

	$(document).on('click', '.js-delete_prewiev', function() {
		var 
			item = $(this).data('item'),
			winScrTop = $(window).scrollTop(),
			activePrev = $('.wr-block').eq(item).find('.js-active_btn').is(':checked');

		if (activePrev) {
			_activeIndex = 0;
		}

		_objSlides.splice(item, 1);

		$('.wrapper').html(_templates.prewiews(_objSlides));
		$(window).scrollTop(winScrTop);

		return false;
	});

	$(document).on('change', '.js-comment, .js-link', function() {
		var
			$this = $(this),
			dataName = $this.attr('name'), 
			numberObj = $this.data(dataName);

		_objSlides[numberObj][dataName] = $this.val();
	});

	$(document).on('click', '.js-generate-slider', function() {
		var slider;

		_activeIndex = parseInt(_activeIndex) || 0;

		if (!_objSlides.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Нет ни одного слайда'
			}, 'Datas is empty');
		}

		_objSlides = _prevSlider.addObjsToEdges(_objSlides);

		_fadeBlock($('.wr-blocks-w'), 1, function() {
			$('.wrapper').append(_templates.sliderList(_objSlides)).fadeIn(500, function() {	

				_objSlides = _prevSlider.deleteSlidesFromEdges(_objSlides);

				slider = new Slider($('.slider'), {
					activeClass: 'slider-active',
					activePos: _activeIndex
				});

				slider.initSlider();
			});
		});
	});

	$(document).on('click', '.js-step-down', function() {
		var toBlock = $(this).data('to');

		$('.wrapper').html(_returnBlock(toBlock, _templates, _objSlides));
	});

	// функция, которая рендерит шаблон при возвращении к предыдущему шагу
	function _returnBlock(nameTemp, myTemplates, options) {
		var options = options || {};

		if (myTemplates.hasOwnProperty(nameTemp)) {
			return myTemplates[nameTemp](options);
		}
	}
	
	// Перемещение блока, с последующим его удалением из DOM
	function _blockMove($block, moveTo, offset) {
		var 
			moveTo = moveTo || 'top',
			offset = offset || -1000;

		$block.css(moveTo, offset).fadeOut(100, function() {
			$(this).remove();
		});
	}

	// Определение способа перемещения
	function _fadeBlock($block, animation, callback) { // animation может быть 1=up, 2=right
		var animation = animation || 1;

		switch (animation) {
			case 1:
				_blockMove($block, 'top');
				break;

			case 2:
				_blockMove($block, 'right');
				break;
		}

		if (callback && typeof callback === 'function') {
			callback();
		}
	}
})();
});