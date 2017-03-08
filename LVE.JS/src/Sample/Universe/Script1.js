// JavaScript source code
function initLve() {
	lve.init({
		canvas: document.getElementById('myCanvas'),
		backgroundColor: 'black'
	});

	lve('camera').create({
		type: 'camera'
	}).animate({
		perspective: 30000
	}, 20000).use();
}

function setStars() {
	for (let i = 0; i < 3000; i++) {
		let nagative_left = Math.random() > .5 ? 1 : -1,
			nagative_bottom = Math.random() > .5 ? 1 : -1,
			left = Math.random() * 30000 * nagative_left,
			bottom = Math.random() * 30000 * nagative_bottom,
			persp = Math.random() * 30000;

		lve('star').create({
			type: 'circle'
		}).css({
			width: 100,
			height: 100,
			color: 'white',
			left: left,
			bottom: bottom,
			perspective: persp
		});
	}
}


window.onload = function () {
	initLve();
	setStars();
};