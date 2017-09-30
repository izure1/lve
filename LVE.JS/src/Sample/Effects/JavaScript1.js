lve.init({
	canvas: '#canvas'
}).ready(() => {
	lve('camera').create({ type: 'camera' }).use();
	window.a = lve.effect.flyingUp({ color: 'red' }, 4000, 'linear', function (self) {
		self.end();
	});
});