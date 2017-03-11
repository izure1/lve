

function initWorld() {
	lve.init({
		canvas: '#canvas'
	}).ready(function () {
		createDialog();
	});
}

function initCamera() {
	lve('camera').create({ type: 'camera' }).use();
}



// YOU MUST INCLUDE lve.window.js

function configDialog() {
	lve.window.config.window.frameBorderWidth = 0;
	lve.window.config.window.frameShadowBlur = 2;
}

function createDialog() {
	lve.window.dialog('Hello, World!', 'My name is LveJS!', {
		buttons: [
			{
				text: 'close',
				click: function (self) {
					self.close();
				}
			},
			{
				text: 'modify title',
				click: function (self) {
					const content = prompt('input title', '');
					self.title(content);
				}
			},
			{
				text: 'modify content',
				click: function (self) {
					const content = prompt('input text', '');
					self.text(content);
				}
			},
			{
				text: 'get content',
				click: function (self) {
					const content = self.text();
					alert(content);
				}
			}
		]
	});

	lve.window.dialog('Another dialog modal', 'You can input new line how to use \'\\n\' character.', {
		width: 500,
		height: 10
	});
}

initWorld();
initCamera();
configDialog();