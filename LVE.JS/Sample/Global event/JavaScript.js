
function initWorld() {
	lve.init({
		canvas: document.getElementById('can')
	});
}

function attachGlobalEvent() {
	// attach 'use' event
	lve.on('use', function (e) {
		e.target.animate({
			perspective: 90
		}, 1000);
	});
}

function initCamera() {
	lve('camera').create({
		type: 'camera'
	}).use();
}

function createObject() {
	lve('square').create({
		type: 'square'
	});
}


window.onload = function () {
	initWorld();
	attachGlobalEvent();
	initCamera();
	createObject();
}