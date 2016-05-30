$(document).ready(function() {

(function(){
	var 
		_templates = {
			links: Handlebars.compile($('#links').html()),
			error: Handlebars.compile($('#error-window').html()),
			prewiews: Handlebars.compile($('#prewiews').html()),
			slider: Handlebars.compile($('#slider').html())
	  },
	  _errorHandler = new ErrorHandler('.error-popup', _templates.error),
		_activeIndex = 0,
		_slidesPreview,
		_objSlides;

	$('.js-wrapper').html(_templates.links());

	$(document).on('click', '.js-save_data', function() {
		var inputStr = $('.input-form_data-inp').val();
		
		_slidesPreview = new SlidesPreview(inputStr);
		_objSlides = _slidesPreview.arrayToArrObjs(); 

		if (!_objSlides.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Введите данные'
			}, 'Data is empty');
		}

		$('.js-wrapper').html(_templates.prewiews(_objSlides));
		
		return false;
	});

	$(document).on('change', '.js-active_btn', function() {	
		var numNewActive = parseInt($(this).val());

		_activeIndex = _slidesPreview.changeActiveIndex(_objSlides, _activeIndex, numNewActive);
	});

	$(document).on('click', '.js-delete_prewiev', function() {
		var 
			item = parseInt($(this).data('item')),
			winScrTop = $(window).scrollTop();

		_activeIndex = _slidesPreview.deleteObjectFromArray(_objSlides, item, _activeIndex);
		
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
			}, 'Data is empty');
		}

		_objSlides = _slidesPreview.addObjsToEdges(_objSlides);

		$('.js-wrapper').html(_templates.slider(_objSlides));	

		_objSlides = _slidesPreview.deleteSlidesFromEdges(_objSlides);

		slider = new Slider($('.slider'), {
			activeClass: 'slider-active',
			activePos: _activeIndex
		});

		slider.initSlider();
	});

	$(document).on('click', '.js-step-down', function() {
		var toBlock = $(this).data('to');

		$('.js-wrapper').html(_returnBlock(toBlock, _templates, _objSlides));
	});

	// функция, которая рендерит шаблон при возвращении к предыдущему шагу
	function _returnBlock(nameTemp, myTemplates, data) {
		var data = data || {};

		if (myTemplates.hasOwnProperty(nameTemp)) {
			return myTemplates[nameTemp](data);
		}
	}
})();
});