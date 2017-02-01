function initLve() {
	lve.init({
		canvas: document.getElementById('canvas')
	});

	lve('camera').create({
		type: 'camera'
	}).use();
}

function createTextObj() {
	lve('textObject').create({
		type: 'text',
		text: function (self) {
			return `012\n345\n6789` || `Hello, World!\nMy name is ${self.name}.\nNice to meet you!\nWelcome LVE.JS World!`
		}
	}).css({
		fontSize: 20,
		color: 'blue'
	});
}

window.onload = () => {
	initLve();
	createTextObj();
};