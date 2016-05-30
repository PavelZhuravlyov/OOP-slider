function SlidesPreview(arrayUrls) {
	this.arrayUrls = arrayUrls;
	this.arrLength = arrayUrls.length;
}

// Формируем из строки массив
SlidesPreview.prototype.stringToArray = function() {
	var inputString;

	if (!this.arrayUrls) {
		return false;
	}

	inputString = JSON.parse(this.arrayUrls);

	return inputString;
};

// Формируем массив объектов 
// На вход индекс активного слайда(тот, который будет показываться первым)
SlidesPreview.prototype.arrayToArrObjs = function() {
	var 
		arrObjects = [],
		arrUrls = this.stringToArray(),
		arrUrlsLength,
		i;

	if (!arrUrls) {
		return false;
	}

	for (i = 0, arrUrlsLength = arrUrls.length; i < arrUrlsLength; i++) {
		arrObjects[i] = { 
			foto: arrUrls[i]
		};
	}
	
	arrObjects[0].active = 'checked';

	return arrObjects;
};

// Клонирование объекта по значению
SlidesPreview.prototype.cloneObj = function(object) {
	var 
		newObj = {},
		prop;

	for (prop in object) {
		newObj[prop] = object[prop];
	}

	return newObj;
};

// Добавляем 1 последнего объекта вперёд и 1 первого объекта вконец
SlidesPreview.prototype.addObjsToEdges = function(arrObjects) {
	var 
		lengthArr = arrObjects.length - 1,
		newArr = arrObjects.concat();

	arrObjects.push(this.cloneObj(arrObjects[0]));
	arrObjects.unshift(this.cloneObj(arrObjects[lengthArr]))

	lengthArr = arrObjects.length - 1;

	arrObjects[0].notReal = true;
	arrObjects[lengthArr].notReal = true;

	return arrObjects;
};

// Удаляем добавленные вначало и вконец объекты из общего массива объектов
SlidesPreview.prototype.deleteSlidesFromEdges = function(arrObjects) {
	var lengthArr = arrObjects.length - 1;

	arrObjects.splice(lengthArr, 1);
	arrObjects.splice(0, 1);

	return arrObjects;
};

// Удалить св-во active у староко объекта и добавить это св-во к выбранному объекту
SlidesPreview.prototype.changeActiveIndex = function(arrObjects, currentIndex, newActiveIndex) {
	if (newActiveIndex !== currentIndex) {
		delete arrObjects[currentIndex].active;
		currentIndex = newActiveIndex;			
	}

	arrObjects[currentIndex].active = 'checked';

	return currentIndex;
};

// Удаление объекта из массива
// Возвращает индекс активного объекта
SlidesPreview.prototype.deleteObjectFromArray = function(arrObjects, indexDeleteObj, activeIndex) {
	if (indexDeleteObj === activeIndex) {
		this.changeActiveIndex(arrObjects, 0, 0);
		activeIndex = 0;
	} else if (indexDeleteObj < activeIndex) {
		activeIndex -= 1;
	}

	arrObjects.splice(indexDeleteObj, 1);

	return activeIndex;
};