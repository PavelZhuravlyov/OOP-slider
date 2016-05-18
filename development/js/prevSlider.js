function PrevSlider(arrayUrls) {
	this.arrayUrls = arrayUrls;
	this.arrLength = arrayUrls.length;
}

// Удаляем из строки лишние символы
PrevSlider.prototype.deleteTabs = function() {
	var _arrayUrls = this.arrayUrls;
	return _arrayUrls.replace(/\s|\[|\]|\'|\'/g, '');
}

// Формируем из строки массив
PrevSlider.prototype.stringToArray = function() {
	var inputString = this.deleteTabs();

	if(inputString === "") return false;
	inputString = inputString.split(',');

	return inputString;
}

// Формируем массив объектов 
// На вход индекс активного слайда(тот, который будет показываться первым)
PrevSlider.prototype.arrayToArrObjs = function() {
	var arrObjects  = [],
		  arrUrls     = this.stringToArray();

	for (var i = 0; i < arrUrls.length; i++) {
		arrObjects[i] = { 
			foto: arrUrls[i],
			comment: ''
		};
	}
	
	return arrObjects;
}

// Копирование массива объектов.
// Для того, чтоб можно было перемещаться между шагами
PrevSlider.prototype.copyArrayObjs = function(arrayObjs) {
	 if (!arrayObjs || 'object' !== typeof arrayObjs) {	
	   return arrayObjs;
	 }

	 var newArray = ('function' === typeof arrayObjs.pop) ? [] : {};
	 var prop, value;


	 for(prop in arrayObjs) {
	 		console.log(prop);
		  if(arrayObjs.hasOwnProperty(prop)) {
			  value = arrayObjs[prop];
			  if(value && 'object' === typeof value) {
			    newArray[prop] = this.copyArrayObjs(value);
			  } else {
			    newArray[prop] = value;
			  }
	    }
		}

	  return newArray;

	 // return [].concat(arrayObjs); // если надо будет сохранять уже записанные поля
};