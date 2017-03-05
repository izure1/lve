class ParticleManager {

	static createParticle(name, randposObj, count, data = {}) {
		const newParticlesArr = [];
		for (let i = 0; i < count; i++) {
			const particle = lve(name)
				.create({ type: 'square' })
				.css(randposObj)
				.data(data);

			newParticlesArr.push(particle);
		}

		return lve({ name: name, context: newParticlesArr });
	}

	static createDust(name, perspective, count) {

		const
			canvas = lve.root.vars.initSetting.canvas.element,
			width = canvas.width, height = canvas.height,
			scaleDistance = lve.root.vars.usingCamera.scaleDistance || lve.root.vars.initSetting.scaleDistance;

		const randposObj = {
			left: (self) => {
				const nagative = Math.random() < .5 ? 1 : -1;
				return width * Math.random() * nagative;
			},
			bottom: (self) => {
				return height * Math.random();
			},
			perspective: () => {
				return (Math.random() * (perspective - scaleDistance) + scaleDistance);
			}
		};

		const dust = ParticleManager.createParticle(name, randposObj, count);

		dust.on('animateend', (e) => { ParticleManager.floatParticle(e.target, randposObj) });
		dust.css({ width: 1.5, height: 1.5, color: 'white', shadowBlur: 2, shadowColor: 'white' });

		dust.animate({});
	}

	static createSnow(name, perspective, count) {

		const
			canvas = lve.root.vars.initSetting.canvas.element,
			width = canvas.width, height = canvas.height,
			scaleDistance = lve.root.vars.usingCamera.scaleDistance || lve.root.vars.initSetting.scaleDistance;

		const randposObj = {
			left: (self) => {
				return lve.calc(self.style.perspective, { left: Math.random() * width }).left;
			},
			perspective: (self) => {
				return lve('[using_camera]').css('perspective')[0] + (Math.random() * (perspective - scaleDistance) + scaleDistance)
			},
			bottom: (self) => {
				return lve.calc(self.style.perspective, { bottom: height }).bottom;
			}
		};

		const snow = ParticleManager.createParticle(name, randposObj, count, { perspective: perspective });

		snow.on('animateend', (e) => { ParticleManager.meltParticle(e.target, randposObj) });
		snow.css({ width: 10, height: 10, color: 'white', opacity: 0 });

		for (let i in snow.context) {
			setTimeout(() => {
				snow.get(i).animate({});
			}, Math.random() * 5000);
		}
	}

	static floatParticle(target, randposObj) {

		const
			left = randposObj.left, bottom = randposObj.bottom,
			perspective = randposObj.perspective;

		const
			floattime = 60000,
			floateasing = target.data('floateasing')[0];

		target.animate({ left: left }, floattime, (floateasing ? 'easeInSine' : 'easeOutSine'));
		target.animate({ bottom: bottom }, floattime, (floateasing ? 'easeOutSine' : 'easeInSine'));
		target.animate({ perspective: perspective }, floattime, 'easeInOutSine');
		target.data({ floateasing: !floateasing });

	}

	static meltParticle(target, randposObj) {

		const melting = target.data('melting')[0];
		const height = lve.root.vars.initSetting.canvas.element.height;

		if (melting === true) {
			target.data({ melting: false });
			target.animate({ width: 0, height: 0, opacity: 0 }, 2000 * Math.random(), 'linear', (self) => {
				const persp = self.data('perspective')[0];
				// remove particle and recreate it
				self.remove();
				ParticleManager.createSnow('__particlemanager_snow__', persp, 1);
			});
		}
		else {
			const particleBottom = target.css('bottom')[0];

			target.data({ melting: true });
			target.css(Object.assign({ width: 10, height: 10, opacity: 1 }, randposObj));
			target.animate({ left: `-=${Math.random() * 200}` }, 2600);
			target.animate({ bottom: -(height / 2) }, { speed: 200 });
		}

	}

	constructor() {
		this.ready = false;
	}

	init() {

		if (lve === undefined) {
			throw new Error('LVE.JS is not defined.');
		}
		else if (lve.root.vars.isRunning !== true) {
			throw new Error('LVE.JS is not running.');
		}

		this.ready = true;
	}

	create(type, perspective, count) {

		if (this.ready === false) {
			throw new Error('particleManager is not init.');
		}

		switch (type) {
			case 'dust': {
				ParticleManager.createDust('__particlemanager_dust__', perspective, count);
				break;
			}
			case 'snow': {
				ParticleManager.createSnow('__particlemanager_snow__', perspective, count);
				break;
			}
			default: break;
		}
	}

};