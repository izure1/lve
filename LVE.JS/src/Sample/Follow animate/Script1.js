function initLve() {
	lve.init({
		canvas: document.getElementById('myCanvas')
	});

	lve('camera').create({
		type: 'camera'
	}).use();
}

function setUnits() {
	for (let i = 0; i < 10; i++) {
		lve(`unit_${i}`).create({
			type: 'text',
			text: i
		}).css({
			fontSize: 20
		}).addClass('unit');

		if (i !== 0) {
			lve(`unit_${i}`).follow(`unit_${i - 1}`, {
				left: -20,
				bottom: -20
			});
		}
	}
}

function moveUnit() {
	lve('unit_0').animate({
		bottom: 200
	}, 5000);
}

window.onload = function () {
	initLve();
	setUnits();
	moveUnit();
};