$(document).ready(function() {

(function(){
	var 
		_templates = {
			links: Handlebars.compile($('#links').html()),
			error: Handlebars.compile($('#error-window').html()),
			prewiews: Handlebars.compile($('#prewiews').html()),
			slider: Handlebars.compile($('#slider').html())
	  },
		_optionsSlider = {
			arrows: true,
			balls: true
		},
	  _errorHandler = new ErrorHandler('.error-popup', _templates.error),
		_activeIndex = 0,
		_slidesPreview,
		_arrSlides,
		_objSlides,
		_slider;

	$('.js-wrapper').html(_templates.links());

	$(document).on('click', '.js-save_data', function() {
		var inputStr = $('.input-form_data-inp').val();
		
		if (!inputStr.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Введите данные'
			}, 'Data is empty');
		}
		
		_slidesPreview = new SlidesPreview(inputStr);
		_objSlides = _slidesPreview.arrayToArrObjs(); 
		_objSlides.optionsSlider = _optionsSlider;
		_arrSlides = _objSlides.slides;

		$('.js-wrapper').html(_templates.prewiews(_arrSlides));
		
		return false;
	});

	$(document).on('change', '.js-active_btn', function() {	
		var numNewActive = parseInt($(this).val());

		_activeIndex = _slidesPreview.changeActiveIndex(_arrSlides, _activeIndex, numNewActive);
	});

	$(document).on('click', '.js-delete_preview', function() {
		var 
			item = parseInt($(this).data('item')),
			winScrTop = $(window).scrollTop();

		_activeIndex = _slidesPreview.deleteObjectFromArray(_arrSlides, item, _activeIndex);
		
		$('.js-wrapper').html(_templates.prewiews(_arrSlides));
		$(window).scrollTop(winScrTop);

		return false;
	});

	$(document).on('change', '.js-comment, .js-link', function() {
		var
			$this = $(this),
			dataName = $this.attr('name'), 
			numberObj = $this.data(dataName);

		_arrSlides[numberObj][dataName] = $this.val();
	});

	$(document).on('click', '.js-generate-slider', function() {
		_activeIndex = _activeIndex || 0;

		if (!_arrSlides.length) {
			_errorHandler.generateError({
				title: 'Ошибка', 
				message: 'Нет ни одного слайда'
			}, 'Data is empty');
		}

		_arrSlides = _slidesPreview.addObjsToEdges(_arrSlides);

		$('.js-wrapper').html(_templates.slider(_objSlides));	

		_arrSlides = _slidesPreview.deleteSlidesFromEdges(_arrSlides);

		_slider = new Slider($('.slider'), {
			activeClass: 'slider-active',
			activePos: _activeIndex
		});

		_slider.initSlider();
	});

	$(document).on('click', '.js-step-down', function() {
		var toBlock = $(this).data('to');

		_activeIndex = 0;
		$('.js-wrapper').html(_templates[toBlock](_arrSlides));
	});
})();
});