// Обработчик ошибок
function ErrorHandler(classErrWindow, templatePopUp){
	this.timeHide       = 2000;
	this.classErrWindow = classErrWindow;
	this.templatePopUp  = templatePopUp;
}

ErrorHandler.prototype.newError = function(errorObject){
	return this.templatePopUp(errorObject);
};

ErrorHandler.prototype.hideErrorWindow = function(){
	var errWindow = $(this.classErrWindow);

	setTimeout(function(){
		errWindow.fadeOut(this.timeHide, function(){
			errWindow.remove();
		});
	}, this.timeHide);
};

ErrorHandler.prototype.caughtErr = function(options){
	$('body').append(this.newError(options));
	this.hideErrorWindow();
};

ErrorHandler.prototype.checkError = function(errorOpt, consoleMessage){
	this.caughtErr(errorOpt);
	throw new Error(consoleMessage || "Error");
};