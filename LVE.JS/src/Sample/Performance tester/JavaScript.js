
function initWorld() {
	lve.init({
		canvas: document.getElementById('can'),
		backgroundColor: 'black'
	});
}

function initCamera(length, gap) {
	const width = length * gap;
	const camera = lve('camera').create({ type: 'camera' });
	camera.css({ left: (width / 2), bottom: (width / 2) });
	camera.use();
}

function createParticles(length, gap = 50) {

	for (let i = 0; i < length; i++) {
		const left = i * gap;
		for (let j = 0; j < length; j++) {
			const bottom = j * gap;
			for (let k = 0; k < length; k++) {
				const perspective = k * gap;
				const particle = lve('particle').create({ type: 'circle' });
				particle.css({ left, bottom, perspective });
			}
		}
	}

	lve('particle').css({ width: 5, height: 5, color: 'white' });

}


function checkPerformance(length, gap) {

	const duration = 10000;
	let start, end;

	start = performance.now();

	lve('camera').animate({
		perspective: length * gap
	}, {speed: 30}, function () {
		end = performance.now();

		console.log(`interval: ${end - start}ms`);
	});
}

window.onload = function () {

	const length = 20, gap = 50;

	initWorld();
	initCamera(length, gap);
	createParticles(length, gap);
	checkPerformance(length, gap);
};