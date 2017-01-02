// JavaScript source code
function initLve() {
	lve.init({
		canvas: document.getElementById('myCanvas')
	});

	lve('camera').create({
		type: 'camera'
	}).use();
}

function setText(_text) {
	lve('text').create({
		type: 'text',
		text: _text
	}).css({
		fontSize: 70,
		color: 'blue'
	});
}

window.onload = function () {
	initLve();
	setText('Hello, World!');
};