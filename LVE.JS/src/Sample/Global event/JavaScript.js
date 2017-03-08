
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

	lve.on('create', function (e) {
		e.target.on('mouseover', function (e) { e.target.css({ color: 'red' }) });
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