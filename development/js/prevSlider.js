function PrevSlider(arrayUrls) {
	this.arrayUrls = arrayUrls;
	this.arrLength = arrayUrls.length;
}

// Формируем из строки массив
PrevSlider.prototype.stringToArray = function() {
	var inputString;

	if (!this.arrayUrls) {
		return false;
	}

	inputString = JSON.parse(this.arrayUrls);

	return inputString;
};

// Формируем массив объектов 
// На вход индекс активного слайда(тот, который будет показываться первым)
PrevSlider.prototype.arrayToArrObjs = function() {
	var 
		arrObjects = [],
		arrUrls = this.stringToArray(),
		i;

	if (!arrUrls) {
		return false;
	}

	for (i = 0; i < arrUrls.length; i++) {
		arrObjects[i] = { 
			foto: arrUrls[i],
			comment: '',
			link: ''
		};
	}
	
	arrObjects[0].active = 'checked';

	return arrObjects;
};

// Клонирование объекта по значению
PrevSlider.prototype.cloneObj = function(object) {
	var 
		newObj = {},
		prop;

	for (prop in object) {
		newObj[prop] = object[prop];
	}

	return newObj;
};

// Добавляем 2 последних объекта вперёд и 2 первых объекта вконец
PrevSlider.prototype.addObjsToEdges = function(arrObjects) {
	var 
		lengthArr = arrObjects.length - 1,
		newArr = arrObjects.concat();

	arrObjects.push(this.cloneObj(arrObjects[0]), this.cloneObj(arrObjects[1]));
	arrObjects.unshift(this.cloneObj(arrObjects[lengthArr - 1]), this.cloneObj(arrObjects[lengthArr]));

	lengthArr = arrObjects.length - 1;

	arrObjects[0].notReal = true;
	arrObjects[1].notReal = true;
	arrObjects[lengthArr].notReal = true;
	arrObjects[lengthArr - 1].notReal = true;

	return arrObjects;
};

PrevSlider.prototype.deleteSlidesFromEdges = function(arrObjects) {
	var lengthArr = arrObjects.length - 1;

	arrObjects.splice(lengthArr, 1);
	arrObjects.splice(lengthArr - 1, 1);
	arrObjects.splice(1, 1);
	arrObjects.splice(0, 1);

	return arrObjects;
};