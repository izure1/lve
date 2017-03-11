
'use strict';

lve.window = {};
lve.window.config = {
	window: {
		focusPerspective: 0.00001,
		focusColor: 'white',
		activeColor: 'red',
		frameBorderColor: '#0075c8',
		frameBorderWidth: 1,
		frameBackgroundColor: 'white',
		toolbarBackgroundColor: '#fafafa',
		toolbarTextColor: 'black',
		contentFontSize: 15
	}
};
lve.window.cache = {
	windowPrimary: 0.00001,
	activeWindow: null,
	beforeMouseOffset: {}
};
lve.window.windows = [];
lve.window.alert = function (title, content, option = {}) {

	lve.ready(function () {

		const scene = 'anywhere';
		const canvas = lve.data().initSetting.canvas.element;
		const width = option.width || 100, height = option.height || 100, persp = lve.window.cache.windowPrimary += 0.00001;

		const frame = lve('__lve.window__').create({ type: 'square', scene: scene });
		const toolbar = lve('__lve.window__').create({ type: 'square', scene: scene });
		const closebtn = lve('__lve.window__').create({ type: 'square', scene: scene });

		const titletext = lve('__lve.window__').create({ type: 'text', text: title, scene: scene });
		const closetext = lve('__lve.window__').create({ type: 'text', text: 'ｘ', scene: scene });
		const bodytext = lve('__lve.window__').create({ type: 'text', text: content, scene: scene });

		const windowconfig = lve.window.config.window;

		frame.addClass('__lve.window.frame__');

		frame.on('mousedown', function (e) { e.target.emit('focus') });
		frame.on('focus', function (e) {
			lve('__lve.window__').findClass('__lve.window.frame__').emit('blur');
			e.target.css({ perspective: lve.window.config.window.focusPerspective });
		});
		frame.on('blur', function (e) {
			const persp = e.target.data('windowPrimary')[0];
			e.target.css({ perspective: persp });
		});

		frame.data({ windowPrimary: persp });
		frame.css({
			width: width, height: height,
			color: option.backgroundColor || windowconfig.frameBackgroundColor,
			left: option.left || (canvas.width / 2) - (width / 2),
			bottom: option.bottom || (canvas.height / 2) - (height / 2),
			perspective: persp,
			borderWidth: windowconfig.frameBorderWidth,
			borderColor: windowconfig.frameBorderColor,
			position: 'fixed'
		});


		const toolbarheight = 25;
		const padding = 10;

		toolbar.addClass('__lve.window.toolbar__');
		toolbar.css({ width: width, height: toolbarheight, color: windowconfig.toolbarBackgroundColor, position: 'fixed' });
		toolbar.follow(frame, { left: 0, bottom: (height - toolbarheight), perspective: -0.000001 });
		toolbar.on('mousedown', function (e) {
			lve.window.cache.activeWindow = e.target.following();
			lve.window.cache.activeWindow.emit('focus');
		});

		titletext.addClass('__lve.window.toolbar.text__');
		titletext.css({ width: width - (padding * 2), fontSize: 15, color: windowconfig.toolbarTextColor, position: 'fixed', pointerEvents: 'none' });
		titletext.follow(toolbar, { left: padding, bottom: 7, perspective: -0.000001 });
		

		// button setting
		closebtn.addClass('__lve.window.button__');
		closebtn.css({ width: 25, height: 25, color: 'transparent', position: 'fixed' });
		closebtn.follow(toolbar, { left: width - 25, bottom: 0, perspective: -0.000001 });
		closebtn.on('mouseover mouseout', function (e) {
			const color = e.type === 'mouseover' ? windowconfig.focusColor : 'transparent';
			e.target.css({ color: color });
		});
		closebtn.on('click', function (e) {
			frame.remove(true);
		});

		closetext.css({ fontSize: 15, color: windowconfig.toolbarTextColor, textAlign: 'center', position: 'fixed', pointerEvents: 'none' });
		closetext.follow(closebtn, { left: 12.5, bottom: 7, perspective: -0.000001 });

		bodytext.addClass('__lve.window.body.text__');
		bodytext.css({ width: width - (padding * 2), fontSize: windowconfig.contentFontSize, position: 'fixed', pointerEvents: 'none' });
		bodytext.follow(toolbar, { left: padding, bottom: -25, perspective: -0.000001 });

		// focus active
		frame.emit('focus');

	});
};


lve.ready(function () {

	const canvas = lve.data().initSetting.canvas.element;

	// reset
	canvas.addEventListener('mouseup', function (e) {
		if (lve.window.cache.activeWindow !== null) {
			lve.window.cache.activeWindow.css({ perspective: '+=0.1' });
		}
		lve.window.cache.activeWindow = null;
	});
	canvas.addEventListener('mousemove', function (currentMouseOffset) {

		const { clientX, clientY } = currentMouseOffset;
		const beforeMouseOffset = lve.window.cache.beforeMouseOffset;

		const
			gapX = clientX - beforeMouseOffset.clientX,
			gapY = clientY - beforeMouseOffset.clientY;

		beforeMouseOffset.clientX = clientX;
		beforeMouseOffset.clientY = clientY;

		if (lve.window.cache.activeWindow === null) return;

		lve.window.cache.activeWindow.css({ left: `+=${gapX}`, bottom: `-=${gapY}` });

	});
});