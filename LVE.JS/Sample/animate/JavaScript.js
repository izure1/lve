
function initWorld() {
	lve.init({
		canvas: document.getElementById('can')
	});
}

function initCamera() {
	lve('camera')
		.create({ type: 'camera' })
		.use();
}

function createCircle() {
	const circle = lve('circle').create({ type: 'circle' });
	circle.css({ width: 50, height: 50, color: 'blue' });
}


/*
 *  button events function
 *
 */

function animationFromDuration() {
	const
		duration = 1000,
		easing = 'easeOutSine'; // default parameter = 'linear'

	lve('circle').animate({ width: 100, height: 100 }, duration, easing);
}

function animationFromSpeed() {
	const
		speed = 100, // Number of changes per second
		easing = 'easeOutSine'; // default parameter = 'linear'

	lve('circle').animate({ width: 100, height: 100 }, { speed: speed }, easing);
}


window.onload = function () {
	initWorld();
	initCamera();
	createCircle();
};