function initLve() {
	lve.init({
		canvas: document.getElementById('myCanvas')
	});

	lve('camera').create({
		type: 'camera'
	}).use();
}

function createImageType() {
	lve('image').create({
		type: 'image',
		src: 'logo.png'
	});
}

window.onload = function () {
	initLve();
	createImageType();
};