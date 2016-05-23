// Обработчик ошибок
function ErrorHandler(classErrWindow, templatePopUp) {
	this.timeHide       = 2000;
	this.classErrWindow = classErrWindow;
	this.templatePopUp  = templatePopUp;
}

// Рендеринг шаблона ошибок
ErrorHandler.prototype.newError = function(errorObject) {
	return this.templatePopUp(errorObject);
};

// Скрываем и удаляем плашку ошибки через timeHide 
ErrorHandler.prototype.hideErrorWindow = function() {
	var _errWindow = $(this.classErrWindow);

	setTimeout(function() {
		_errWindow.fadeOut(this.timeHide, function() {
			_errWindow.remove();
		});
	}, this.timeHide);
};

// При возникновении ошибки вывести плашку и удалить
ErrorHandler.prototype.caughtErr = function(options) {
	$('body').append(this.newError(options));
	this.hideErrorWindow();
};

// Функция вызова ошибки
ErrorHandler.prototype.generateError = function(errorOpt, consoleMessage) {
	this.caughtErr(errorOpt);
	throw new Error(consoleMessage || 'Error');
};