'use strict';

function initWorld() {
	lve.init({
		canvas: document.querySelector('#canvas')
	});

	lve('camera').create({
		type: 'camera'
	}).use();

	// HIDDNE ELEMENT
	const hiddenElement = document.createElement('textarea');

	hiddenElement.id = 'ipt_element';
	hiddenElement.style.width = '1px';
	hiddenElement.style.opacity = 0;
	hiddenElement.style.position = 'absolute';
	hiddenElement.style.left = 0;
	hiddenElement.style.bottom = 0;
	hiddenElement.style.zIndex = -1;

	hiddenElement.onkeydown = hiddenElement.onkeyup = hiddenElement.onchange = function () {
		// GET STRING FROM INPUT
		lve('text').attr({ text: this.value });
	};
	hiddenElement.onfocus = function () {
		lve('text').css({ color: 'blue' });
	};
	hiddenElement.onblur = function () {
		lve('text').css({ color: 'black' });
	};

	document.querySelector('body').appendChild(hiddenElement);
}

function createObject() {
	lve('text').create({
		type: 'text',
		text: 'click me and modify it!'
	}).css({
		fontSize: 50,
		textAlign: 'center',
		lineHeight: '150%'
	});
}

function attachEvent() {
	lve('text').on('click', (_e) => {
		document.querySelector('#ipt_element').focus();
	});
}


window.onload = () => {
	initWorld();
	createObject();
	attachEvent();
};