
/*
 *  lve.window.js
 *  MIT LICENSE
 *  https://izure.org
 */


'use strict';

lve.window = {};
lve.window.version = '1.0.0';
lve.window.dialogs = [];
lve.window.config = {
	window: {
		focusPerspective: 0.00001,
		focusColor: '#fafafa',
		activeColor: 'red',
		defaultColor: '#eee',
		frameBorderColor: '#0075c8',
		frameBorderWidth: 1,
		frameShadowColor: 'rgba(0, 0, 0, .5)',
		frameShadowBlur: undefined,
		frameBackgroundColor: 'white',
		frameWidth: 300,
		frameHeight: 50,
		frameColor: 'black',
		lineHeight: '120%',
		contentFontSize: 15
	}
};
lve.window.cache = {
	windowPrimary: 0.00001,
	activeWindow: null,
	beforeMouseOffset: {}
};
lve.window.windows = [];
lve.window.dialog = function (title, content, option = {}) {

	let modal;

	lve.ready(function () {

		const windowconfig = lve.window.config.window;

		const scene = 'anywhere';
		const canvas = lve.data().initSetting.canvas.element;
		const
			width = option.width || windowconfig.frameWidth,
			height = option.height || windowconfig.frameHeight,
			persp = lve.window.cache.windowPrimary += 0.00001;

		const frame = lve('__lve.window__').create({ type: 'square', scene: scene });
		const toolbar = lve('__lve.window__').create({ type: 'square', scene: scene });
		const closebtn = lve('__lve.window__').create({ type: 'square', scene: scene });

		const titletext = lve('__lve.window__').create({ type: 'text', text: title, scene: scene });
		const closetext = lve('__lve.window__').create({ type: 'text', text: 'ｘ', scene: scene });
		const bodytext = lve('__lve.window__').create({ type: 'text', scene: scene });

		function setContentText(content) {

			const beforeContentHeight = frame.data('__lve.window.body.height__')[0] || 0;

			frame.css({ height: `-=${beforeContentHeight}` }); // restore frame
			bodytext.attr({ text: content }); // set text

			setTimeout(function () {
				// body text overflow
				if (bodytext.css('height')[0] > height) {
					const currentContentHeight = bodytext.css('height')[0];

					frame.css({ height: `+=${currentContentHeight}` });
					frame.data({ '__lve.window.body.height__': currentContentHeight });
				}
				else {
					frame.css({ height: `+=${height}` });
					frame.data({ '__lve.window.body.height__': height });
				}
			}, 0);

		}

		// return self
		modal = {
			close: function () {
				const modalIndex = lve.window.dialogs.indexOf(modal);
				lve.window.dialogs.splice(modalIndex, 1);
				frame.remove(true);
			},
			focus: function () {
				frame.emit('focus');
			},
			title: function (content) {
				if (typeof content === 'string') {
					titletext.attr({ text: content });
				}
				else return titletext.attr('text')[0];
			},
			text: function (content) {
				if (typeof content === 'string') {
					setContentText(content);
				}
				else return bodytext.attr('text')[0];
			},
			get frame() {
				return frame;
			}
		};

		lve.window.dialogs.push(modal);


		// frame setting
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
			width: width,
			color: 'frameBackgroundColor' in option ? option.frameBackgroundColor : windowconfig.frameBackgroundColor,
			left: 'left' in option ? option.left : (canvas.width / 2) - (width / 2),
			bottom: 'bottom' in option ? option.bottom : (canvas.height / 2) - (height / 2),
			perspective: persp,
			borderWidth: 'frameBorderWidth' in option ? option.frameBorderWidth : windowconfig.frameBorderWidth,
			borderColor: 'frameBorderColor' in option ? option.frameBorderColor : windowconfig.frameBorderColor,
			shadowBlur: 'frameShadowBlur' in option ? option.frameShadowBlur : windowconfig.frameShadowBlur,
			shadowColor: 'frameShadowColor' in option ? option.frameShadowColor : windowconfig.frameShadowColor,
			position: 'fixed'
		});

		// toolbar setting
		const toolbarheight = 25;
		const padding = 10;
		const realWidth = width - (padding * 2);

		toolbar.addClass('__lve.window.toolbar__');
		toolbar.css({ width: width, height: toolbarheight, color: windowconfig.defaultColor, position: 'fixed' });
		toolbar.follow(frame, {
			left: 0,
			perspective: -0.000001,
			bottom: function (self) {
				return self.following().css('height')[0] - toolbarheight;
			}
		});
		toolbar.on('mousedown', function (e) {
			lve.window.cache.activeWindow = e.target.following();
			lve.window.cache.activeWindow.emit('focus');
		});

		titletext.addClass('__lve.window.toolbar.text__');
		titletext.css({ width: width - (padding * 2), fontSize: 15, color: windowconfig.frameColor, position: 'fixed', pointerEvents: 'none' });
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
			modal.close();
		});

		closetext.css({ fontSize: 15, color: windowconfig.frameColor, textAlign: 'center', position: 'fixed', pointerEvents: 'none' });
		closetext.follow(closebtn, { left: 12.5, bottom: 7, perspective: -0.000001 });

		bodytext.addClass('__lve.window.body.text__');
		bodytext.css({ width: width - (padding * 2), fontSize: windowconfig.contentFontSize, lineHeight: windowconfig.lineHeight, position: 'fixed', pointerEvents: 'none' });
		bodytext.follow(toolbar, {
			left: padding,
			perspective: -0.000001,
			bottom: function (self) {
				return -(padding + self.css('height')[0]);
			}
		});



		/*
		 *  frame height calculate
		 *  NOT INCLUDE BUTTONS
		 *
		 */
		setTimeout(function () {
			frame.css({ height: `+=${toolbarheight}` });
			frame.css({ height: `+=${padding * 2}` });

			setContentText(content);
		}, 0);

		setTimeout(function () {
			// if overflow top
			const
				frameHeight = frame.css('height')[0],
				frameBottom = frame.css('bottom')[0],
				frameBorder = frame.css('borderWidth')[0] || 0;

			const frameTotalHeight = frameHeight + frameBottom + (frameBorder * 2);

			if (frameTotalHeight > canvas.height) {
				frame.css({ bottom: `-=${frameTotalHeight - canvas.height}` });
			}
		}, 1);

		// focus active
		frame.emit('focus');


		/*
		 *  BUTTONS OPTION
		 */

		// horizon setting
		if (!option.buttons) return;
		if (Array.isArray(option.buttons) && !option.buttons.length) return;

		// create horizon
		const hr = lve('__lve.window__').create({ type: 'square', scene: scene });

		hr.addClass('__lve.window.body.horizon__');
		hr.css({ width: realWidth, height: .5, color: windowconfig.frameBorderColor, position: 'fixed' });

		// create buttons
		const buttonHeight = 30, buttonMargin = 5, buttonPadding = 15;
		let buttonsDivHeight = (buttonHeight + buttonMargin), buttonsDivLine = 1;
		let buttonsDivWidth = 0, beforeButtonWidth = 0;
		let isFirstButton = true;

		const buttonAlignRight = function (frame, line) {

			const sameLineButtons = hr.follower().filter(function (item) {
				if (item.data('__lve.window.button.line__')[0] === line) return true;
			});
			const buttonsDivWidth = (function () {
				const buttonsTotalWidth = sameLineButtons.css('width').reduce((a, b) => a + b, 0);
				return buttonsTotalWidth + ((sameLineButtons.context.length - 1) * buttonMargin);
			})();

			for (let item of sameLineButtons.context) {
				const beforeLeft = item.follow('left')[0];
				item.follow(hr, { left: beforeLeft + (realWidth - buttonsDivWidth) });
			}

		};

		for (let i = 0; i < option.buttons.length; i++) {
			const item = option.buttons[i];
			const
				button = lve('__lve.window__').create({ type: 'square', scene: scene }),
				buttontext = lve('__lve.window__').create({ type: 'text', text: item.text });

			buttontext.css({ fontSize: 13, color: windowconfig.frameColor, textAlign: 'center', position: 'fixed' });
			buttontext.measureText();
			buttontext.follow(button, {
				bottom: 10,
				perspective: -0.000001,
				left: function () {
					return button.css('width')[0] / 2
				}
			});

			button.css({
				width: (buttontext.css('width')[0] + buttonPadding), height: buttonHeight,
				color: windowconfig.defaultColor,
				position: 'fixed'
			});

			const currentButtonWidth = button.css('width')[0];
			if (isFirstButton) isFirstButton = false;
			else {
				buttonsDivWidth += (beforeButtonWidth + buttonMargin);
				// is overflow
				if ((buttonsDivWidth + currentButtonWidth) / realWidth > 1) {

					(function (buttonsDivLine) {
						setTimeout(function () {
							buttonAlignRight(frame, buttonsDivLine);
						}, 0);
					})(buttonsDivLine);

					buttonsDivWidth = 0;
					buttonsDivLine++;
					beforeButtonWidth = 0;
					// new line
					buttonsDivHeight += (buttonHeight + buttonMargin);
				}
			}

			beforeButtonWidth = currentButtonWidth;

			button.on('mouseover', function (e) {
				e.target.css({ color: windowconfig.focusColor });
			});
			button.on('mouseout', function (e) {
				e.target.css({ color: windowconfig.defaultColor });
			});
			button.on('click', function () {
				const fn = 'click' in item ? item.click : function () { };
				fn(modal);
			});

			button.data({ '__lve.window.button.line__': buttonsDivLine });
			button.follow(hr, { left: buttonsDivWidth, bottom: -buttonsDivHeight, perspective: -0.000001 });
		}

		setTimeout(function () {
			buttonAlignRight(frame, buttonsDivLine);
			frame.css({ height: `+=${buttonsDivHeight}` });
			frame.css({ height: `+=${padding + buttonMargin}` });
			hr.follow(frame, {
				left: padding, bottom: (buttonsDivHeight + buttonMargin + padding), perspective: -0.000001
			});
		}, 0);

	});

	return modal;
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