
/*
 *  lve.effect.js
 *  MIT LICENSE
 *  https://izure.org
 */


'use strict';

lve.effect = {};
lve.effect.version = '1.0.0';
lve.effect.config = {
	color: 'black',
	direction: 'left',
	easing: 'linear',
	duration: 1000,
	perspective: 0.5,
	get width() {
		return lve.data().initSetting.canvas.element.width;
	},
	get height() {
		return lve.data().initSetting.canvas.element.height;
	}
};

lve.effect.controller = function (option, objects) {
	this.option = option;
	this.objects = objects;
	this.end = () => {
		for (const item of this.objects) item.remove();
	};
};
lve.effect.slide = function (option = {}, duration = lve.effect.config.duration, easing = lve.effect.config.easing, complete = null) {
	const newEffector = lve('__lve.effect__').create({ type: 'square', scene: 'anywhere' });
	const config = lve.effect.config;
	const { width, height, perspective } = config;
	const { color = config.color, direction = config.direction } = option;

	let leftStart, bottomStart, leftEnd, bottomEnd, gradientDirection;
	switch (direction) {
		case 'left': {
			leftStart = width * -2, leftEnd = 0;
			bottomStart = 0, bottomEnd = 0;
			gradientDirection = 0;
			break;
		}
		case 'right': {
			leftStart = width, leftEnd = -width;
			bottomStart = 0, bottomEnd = 0;
			gradientDirection = 180;
			break;
		}
		case 'top': {
			leftStart = 0, leftEnd = 0;
			bottomStart = height, bottomEnd = -height;
			gradientDirection = 90;
			break;
		}
		case 'bottom': {
			leftStart = 0, leftEnd = 0;
			bottomStart = height * -2, bottomEnd = 0;
			gradientDirection = 270;
			break;
		}
		default: {
			return;
		}
	}

	const controller = new lve.effect.controller(option, [newEffector]);

	newEffector.css({ width: width * 2, height: height * 2, color: 'transparent', perspective: perspective });
	newEffector.css({ position: 'fixed', left: leftStart, bottom: bottomStart });
	newEffector.css({ gradientDirection: gradientDirection, gradient: { 0: color, 50: color, 100: 'transparent' } });
	newEffector.animate({ left: leftEnd, bottom: bottomEnd }, duration, easing, () => {
		if (complete) complete(controller);
	});

	return controller;
};
lve.effect.fadeOut = function (option, duration = lve.effect.config.duration, easing = lve.effect.config.easing, complete = null) {
	const newEffector = lve('__lve.effect__').create({ type: 'square', scene: 'anywhere' });
	const config = lve.effect.config;
	const { width, height, perspective } = config;
	const { color = config.color } = option;

	const controller = new lve.effect.controller(option, [newEffector]);

	newEffector.css({ width: width, height: height, color: color, opacity: 0, perspective: perspective });
	newEffector.css({ position: 'fixed', left: 0, bottom: 0 });
	newEffector.animate({ opacity: 1 }, duration, easing, () => {
		if (complete) complete(controller);
	});

	return controller;
};
lve.effect.fadeIn = function (option, duration = lve.effect.config.duration, easing = lve.effect.config.easing, complete = null) {
	const newEffector = lve('__lve.effect__').create({ type: 'square', scene: 'anywhere' });
	const config = lve.effect.config;
	const { width, height, perspective } = config;
	const { color = config.color } = option;

	const controller = new lve.effect.controller(option, [newEffector]);

	newEffector.css({ width: width, height: height, color: color, opacity: 1, perspective: perspective });
	newEffector.css({ position: 'fixed', left: 0, bottom: 0 });
	newEffector.animate({ opacity: 0 }, duration, easing, () => {
		if (complete) complete(controller);
	});

	return controller;
};
lve.effect.fallingDown = function (option, duration = lve.effect.config.duration, easing = lve.effect.config.easing, complete = null) {
	const newEffector = lve('__lve.effect__').create({ type: 'circle', scene: 'anywhere' });
	const config = lve.effect.config;
	const { width, height } = lve.data().initSetting.canvas.element;
	const { perspective } = config;
	const { color = config.color } = option;
	const circleWidth = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
	const minSize = lve.data().initSetting.minSize;

	const controller = new lve.effect.controller(option, [newEffector]);

	newEffector.css({ width: circleWidth, height: circleWidth, color: 'transparent', perspective: perspective, borderWidth: circleWidth, borderColor: color });
	newEffector.css({ position: 'fixed', left: (width / 2) - (circleWidth / 2), bottom: (height / 2) - (circleWidth / 2) });
	newEffector.animate({ width: minSize, height: minSize, left: (width / 2), bottom: (height / 2) }, duration, easing, () => {
		if (complete) complete(controller);
	});

	return controller;
};
lve.effect.flyingUp = function (option, duration = lve.effect.config.duration, easing = lve.effect.config.easing, complete = null) {
	const newEffector = lve('__lve.effect__').create({ type: 'circle', scene: 'anywhere' });
	const config = lve.effect.config;
	const { width, height } = lve.data().initSetting.canvas.element;
	const { perspective } = config;
	const { color = config.color } = option;
	const circleWidth = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
	const minSize = lve.data().initSetting.minSize;

	const controller = new lve.effect.controller(option, [newEffector]);

	newEffector.css({ width: minSize, height: minSize, color: 'transparent', perspective: perspective, borderWidth: circleWidth, borderColor: color });
	newEffector.css({ position: 'fixed', left: (width / 2), bottom: (height / 2) });
	newEffector.animate({ width: circleWidth, height: circleWidth, left: (width / 2) - (circleWidth / 2), bottom: (height / 2) - (circleWidth / 2) }, duration, easing, () => {
		if (complete) complete(controller);
	});

	return controller;
};