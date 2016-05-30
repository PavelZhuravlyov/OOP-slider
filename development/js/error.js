// Обработчик ошибок
function ErrorHandler(classErrWindow, templateError) {
	this.timeHide = 2000;
	this.classErrWindow = classErrWindow;
	this.templateError = templateError;
}

// Рендеринг шаблона ошибок
ErrorHandler.prototype.newError = function(errorObject) {
	return this.templateError(errorObject);
};

// Скрываем и удаляем плашку ошибки через timeHide 
ErrorHandler.prototype.hideErrorWindow = function() {
	var errWindow = $(this.classErrWindow);

	setTimeout(function() {
		errWindow.fadeOut(this.timeHide, function() {
			errWindow.remove();
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