$(document).ready(function() {

(function(){
	var _templates = {
		links: Handlebars.compile($('#links').html()),
		error: Handlebars.compile($('#errorPopUp').html()),
		prewiews: Handlebars.compile($('#prewiews').html()),
		slider: Handlebars.compile($('#slider').html())
	};

	var 
		_errorHandler = new ErrorHandler('.errMes', _templates.error),
		_activeIndex = 0,
		_prevSlider,
		_objSlides;

	$('.js-wrapper').html(_templates.links());

	$(document).on('click', '.js-save_datas', function() {
		var inputStr = $('.input-form_datas-inp').val();
		
		_prevSlider = new PrevSlider(inputStr);
		_objSlides = _prevSlider.arrayToArrObjs(); 

		if (!_objSlides.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Введите данные'
			}, 'Datas is empty');
		}

		_fadeBlock($('.js-input-form_datas'), 2, function() {
			$('.js-wrapper').prepend(_templates.prewiews(_objSlides)).fadeIn(500);
		});
		
		return false;
	});

	$(document).on('change', '.js-active_btn', function() {	
		var numNewActive = $(this).val();

		_activeIndex =_changeActiveIndex(_objSlides, _activeIndex, numNewActive);
	});

	$(document).on('click', '.js-delete_prewiev', function() {
		var 
			item = $(this).data('item'),
			winScrTop = $(window).scrollTop(),
			activePrev = $('.prew-block').eq(item).find('.js-active_btn').is(':checked');

		_objSlides.splice(item, 1);

		if (activePrev) {
			_activeIndex = _changeActiveIndex(_objSlides, 0, 0);
		}

		$('.js-wrapper').html(_templates.prewiews(_objSlides));
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

		_fadeBlock($('.js-prew-blocks-w'), 1, function() {
			$('.js-wrapper').append(_templates.slider(_objSlides)).fadeIn(500, function() {	

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

		$('.js-wrapper').html(_returnBlock(toBlock, _templates, _objSlides));
	});

	// Присваивание слайду свойства activе.
	// Слайд с таким св-вом появится первым при генерацции слайдера
	function _changeActiveIndex(object, currentIndex, newActiveIndex) {
		if (newActiveIndex !== currentIndex) {
			delete object[currentIndex].active;
			currentIndex = newActiveIndex;			
		}

		_objSlides[currentIndex].active = 'checked';

		return currentIndex;
	}

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