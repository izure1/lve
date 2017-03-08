/* Light Visualnovel Engine
 *
 * Made by izure.org | 'LVE.js (C) izure.org 2016. All rights reserved.'
 * MIT LICENSE
 * -> http://izure.org
 *
 * Dev Blog -> http://blog.izure.org
 * Dev Center -> http://cafe.naver.com/lvejs
 * Release -> http://github.com/izure1/lvejs
 * wiki book -> http://cafe.naver.com/lvejs/book5084371
 */

'use strict';

/*  lve.js 에서, 객체를 선택하는 방법은 해당 객체의 이름(name), 또는 객체 정보(context)를, lve() 함수의 인수로 담아 호출하는 방식입니다.
 *  반환되는 값은 JSON 형태를 지니며, name, context 속성을 갖습니다. 그리고 lve.js 에서 이것을 '세션(session)'이라고 부릅니다.
 *  name 속성은 해당 세션의 이름을 칭합니다. 시스템적으로 이용되며 사용자에게 큰 의미는 없습니다.
 *  context 속성은, 해당 세션에 검색된 모든 객체들을 배열형으로 갖고 있습니다.
 *
 *  lve는 상수이며, 함수임과 동시에 이름공간(namespace)이기도 합니다.
 *  그 외 lve.js 에서 필요한 내용은 lve 상수의 속성의 형태로 저장되어 있습니다. 변수형 또는 함수형입니다. ( Ex. lve.root or lve.init() )
 */
var lve = (name) => {
	// Ex. lve()
	if (!name) return;

	const
		root = lve.root,
		vars = root.vars, cache = root.cache, fn = root.fn,
		usingCamera = vars.usingCamera;

	let retArr = [];

	// 문자열로 검색 시
	if (typeof name == 'string') {
		switch (name) {
			case '*': {
				retArr = vars.objects;
				break;
			}
			case '[USING_SCENE]': {
				retArr = fn.getSceneObj(usingCamera.scene);
				break;
			}
			case '[using_scene]': {
				retArr = fn.getSceneObj(usingCamera.scene);
				break;
			}
			case '[USING_CAMERA]': {
				retArr = [usingCamera];
				break;
			}
			case '[using_camera]': {
				retArr = [usingCamera];
				break;
			}
			default: {
				retArr = cache.selectorKeyword[name];
				break;
			}
		}
	}
	/* 변수로 검색할 때
	 * ex. lve(context)
	 */
	else {
		// session으로 검색했을 때
		if (name.context) {
			retArr = name.context;
			name = name.name;
		}
		// 객체로 검색했을 때
		else {
			retArr = [name];
			name = name.name;
		}
	}

	return new lve.root.const.ObjectSession(name, retArr);
};


/*  lve.root
 *  lve.js 에서 사용되는 정보를 담는 이름공간입니다.
 *  생성된 객체(Object)의 정보를 보관합니다.
 *
 *  lve.root.vars : 생성된 객체(Object)를 보관하며, 때에 따라서 사용자에게 필요할지도 모르는 lve.js 의 전역설정 등을 보관합니다. lve.data() 함수로 호출이 가능합니다.
 *  lve.root.cache : 사용자에게 필요하지 않는 정보입니다. 변동되는 변수가 보관됩니다.
 *  lve.root.const : 사용자에게 필요하지 않는 정보입니다. 변동되지 않는 상수가 보관됩니다. 예를 들어, Math.PI 같은 것들이 있습니다.
 *  lve.root.fn : 시스템 상 필요하지만 사용자가 호출할 필요가 없거나, 직접적으로 호출해서는 안되는 함수를 보관합니다.
 *
 */
lve.root = {};
lve.root.vars = {
	objects: [], // 객체정보배열. 생성된 객체들은 이 배열에 style.perspective 속성값에 따라 내림차순으로 정렬됩니다.
	initSetting: { // 전역 설정. 객체에 지역설정이 되지 않았을 경우, 이 전역 설정을 따릅니다.
		canvas: {},
		scaleDistance: 100
	}, // 초기 설정
	isStart: false, // 게임이 실행됐는지 알 수 있습니다.
	isRunning: true, // 게임이 실행 중인지 알 수 있습니다. lve.play, lve.pause 함수에 영향을 받습니다.
	usingCamera: {}, // 사용중인 카메라 객체입니다.
	get version() {
		return lve.root.const.version;
	},
	get fps() {
		return lve.root.cache.fps;
	}
};
lve.root.cache = {
	// 각 이벤트 룸 배열이 생성된 구조체.
	// 캔버스 이벤트가 등록된 객체는, 맞는 이벤트 룸에 등록되어 캔버스에서 이벤트가 발생했을 시, 이 배열을 순회하여 빠르게 검색합니다.
	canvasEventKeyword: {
		mousedown: [], mouseup: [],
		mousemove: [], mouseover: [], mouseout: [],
		click: [], dblclick: []
	},
	globalEventKeyword: {},
	selectorKeyword: {}, // 선택자. 객체 생성시 name을 키값으로 저장됩니다.
	objectArr: [], // 캐싱된 객체들이 이곳에 저장되어, lve.root.fn.update 메서드 호출시 순회합니다.
	mouseoverItem: false, // 현재 mouseover 되어있는 객체가 저장됩니다.
	isNeedSort: 0,
	isNeedCaching: 0,
	loseTime: 0, // lve.pause, lve.play 등으로 멈추었던 총 interval timestamp가 저장됩니다.
	lastDraw: 0, // 마지막으로 캔버스에 그려졌던 timestamp가 이곳에 저장됩니다.
	now: 0,
	fps: 0, // 현재 fps값이 프레임마다 갱신되어 저장됩니다.
	pauseTime: 0, // 마지막으로 lve.pause가 되었던 timestamp가 저장됩니다.
	primary: 1
};
lve.root.const = {
	version: '2.6.1',
	radian: Math.PI / 180,
	arr_type: ['camera', 'image', 'circle', 'square', 'text', 'video', 'sprite'], // 사용할 수 있는 객체 속성들입니다
	arr_event: ['create', 'animatestart', 'animateend', 'animatestop', 'cssmodified', 'attrmodified', 'animateupdate', 'datamodified', 'follow', 'followupdate', 'unfollow', 'followed', 'unfollowed', 'kick', 'kicked', 'play', 'pause', 'ended', 'addclass', 'removeclass', 'toggleclass', 'measuretext', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'load', 'repeat', 'use'], // 사용할 수 객체 이벤트입니다
};
lve.root.fn = {};

lve.root.const.ObjectSession = class {
	/* selector = 사용자가 검색하고자 하는 객체의 name (String type)
	 * context = 검색된 객체 리스트 (Array type)
	 */
	constructor(selector, context) {
		this.name = selector;
		this.context = context || [];
	}

	getEasingData(_attr) {
		const ani = this.__system__.ani_init;
		// animating이 아닌 객체이거나, 속성 매개변수가 넘어오지 않았을 시
		if (!ani.count_max || !_attr) {
			return;
		}
		let
			tar = ani.origin[_attr],
			tar_goal = ani[_attr];
		// 존재하지 않는 속성일 경우
		if (tar === undefined || tar_goal === undefined) {
			return;
		}
		// t: current time, b: begInnIng value, c: change In value, d: duration
		let
			t = ani.count[_attr] * 1000 / 60 || 1,
			b = tar,
			c = tar_goal - tar,
			d = ani.duration[_attr] || 1,
			a = 0, p = 0, s = 0,
			easing = ani.easing[_attr] || 'linear';

		switch (easing) {
			case 'linear': {
				return c * t / d + b;
			}
			case 'easeInQuad': {
				t /= d;
				return c * t * t + b;
			}
			case 'easeOutQuad': {
				t /= d;
				return -c * t * (t - 2) + b;
			}
			case 'easeInOutQuad': {
				t /= d / 2;
				if (t < 1) return c / 2 * t * t + b;
				t--;
				return -c / 2 * (t * (t - 2) - 1) + b;
			}
			case 'easeInCubic': {
				t /= d;
				return c * t * t * t + b;
			}
			case 'easeOutCubic': {
				t /= d;
				t--;
				return c * (t * t * t + 1) + b;
			}
			case 'easeInOutCubic': {
				t /= d / 2;
				if (t < 1) return c / 2 * t * t * t + b;
				t -= 2;
				return c / 2 * (t * t * t + 2) + b;
			}
			case 'easeInSine': {
				return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
			}
			case 'easeOutSine': {
				return c * Math.sin(t / d * (Math.PI / 2)) + b;
			}
			case 'easeInQuart': {
				t /= d;
				return c * t * t * t * t + b;
			}
			case 'easeOutQuart': {
				t /= d;
				t--;
				return -c * (t * t * t * t - 1) + b;
			}
			case 'easeInOutQuart': {
				t /= d / 2;
				if (t < 1) return c / 2 * t * t * t * t + b;
				t -= 2;
				return -c / 2 * (t * t * t * t - 2) + b;
			}
			case 'easeInQuint': {
				t /= d;
				return c * t * t * t * t * t + b;
			}
			case 'easeOutQuint': {
				t /= d;
				t--;
				return c * (t * t * t * t * t + 1) + b;
			}
			case 'easeInOutQuint': {
				t /= d / 2;
				if (t < 1) return c / 2 * t * t * t * t * t + b;
				t -= 2;
				return c / 2 * (t * t * t * t * t + 2) + b;
			}
			case 'easeInSine': {
				return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
			}
			case 'easeOutSine': {
				return c * Math.sin(t / d * (Math.PI / 2)) + b;
			}
			case 'easeInOutSine': {
				return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
			}
			case 'easeInExpo': {
				return c * Math.pow(2, 10 * (t / d - 1)) + b;
			}
			case 'easeOutExpo': {
				return c * (-Math.pow(2, -10 * t / d) + 1) + b;
			}
			case 'easeInOutExpo': {
				t /= d / 2;
				if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
				t--;
				return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
			}
			case 'easeInCirc': {
				t /= d;
				return -c * (Math.sqrt(1 - t * t) - 1) + b;
			}
			case 'easeOutCirc': {
				t /= d;
				t--;
				return c * Math.sqrt(1 - t * t) + b;
			}
			case 'easeInOutCirc': {
				t /= d / 2;
				if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
				t -= 2;
				return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
			}
			case 'easeInElastic': {
				if (t == 0) return b;
				if ((t /= d) == 1) return b + c;
				if (!p) p = d * .3;
				if (!a || a < Math.abs(c)) { a = c; s = p / 4; }
				else s = p / (2 * Math.PI) * Math.asin(c / a);
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
			}
			case 'easeOutElastic': {
				if (t == 0) return b;
				if ((t /= d) == 1) return b + c;
				if (!p) p = d * .3;
				if (!a || a < Math.abs(c)) { a = c; s = p / 4; }
				else s = p / (2 * Math.PI) * Math.asin(c / a);
				return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
			}
			case 'easeInOutElastic': {
				if (t == 0) return b;
				if ((t /= d / 2) == 2) return b + c;
				if (!p) p = d * (.3 * 1.5);
				if (!a || a < Math.abs(c)) { a = c; s = p / 4; }
				else s = p / (2 * Math.PI) * Math.asin(c / a);
				if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
			}
			case 'easeInBack': {
				if (!s) s = 1.70158;
				return c * (t /= d) * t * ((s + 1) * t - s) + b;
			}
			case 'easeOutBack': {
				if (!s) s = 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			}
			case 'easeInOutBack': {
				if (!s) s = 1.70158;
				if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
				return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
			}
			case 'easeInBounce': {
				return c - ((t, b, c, d) => {
					if ((t /= d) < (1 / 2.75)) return c * (7.5625 * t * t) + b;
					else if (t < (2 / 2.75)) return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
					else if (t < (2.5 / 2.75)) return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
					else return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
				})(d - t, 0, c, d) + b;
			}
			case 'easeOutBounce': {
				if ((t /= d) < (1 / 2.75)) return c * (7.5625 * t * t) + b;
				else if (t < (2 / 2.75)) return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
				else if (t < (2.5 / 2.75)) return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
				else return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
			}
			case 'easeInOutBounce': {
				if (t < d / 2) return ((t, b, c, d) => {
					if ((t /= d) < (1 / 2.75)) return c * (7.5625 * t * t) + b;
					else if (t < (2 / 2.75)) return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
					else if (t < (2.5 / 2.75)) return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
					else return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
				})(t * 2, b, c / 2, d);
				return ((t, b, c, d) => {
					return c - ((t, b, c, d) => {
						if ((t /= d) < (1 / 2.75)) return c * (7.5625 * t * t) + b;
						else if (t < (2 / 2.75)) return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
						else if (t < (2.5 / 2.75)) return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
						else return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
					})(d - t, 0, c, b) + b;
				})((t * 2) - d, b + c / 2, c / 2, d);
			}
		}
	}

	create(rawdata) {

		const
			vars = lve.root.vars,
			cache = lve.root.cache, consts = lve.root.const,
			fn = lve.root.fn;

		if (!rawdata.type) {
			throw new Error(`type 속성은 객체 필수 속성입니다. 다음 중 한 가지를 필수로 선택해주세요. (${consts.arr_type.join(', ')})`);
			return;
		}
		else if (
			consts.arr_type.indexOf(rawdata.type.toLowerCase()) == -1
		) {
			throw new Error(`${rawdata.type} 은(는) 존재하지 않는 type 속성입니다. 이용할 수 있는 type 속성은 다음과 같습니다. (${consts.arr_type.join(', ')})`);
			return;
		}

		const
			data = lve.root.fn.adjustJSON(rawdata, this, this),
			stylePropObj = {
				text: { width: 'auto', gradientType: 'linear' },
				image: { width: 'not_ready', height: 'not_ready' },
				sprite: { width: 'not_ready', height: 'not_ready' },
				circle: { gradientType: 'radial' },
				square: { gradientType: 'linear' }
			},
			attrPropObj = {
				video: { loop: false },
				sprite: { loop: true }
			};

		const initor = {};
		initor.initAttribute = () => {
			for (let i in attrPropObj) {
				if (this.type !== i) continue;
				for (let j in attrPropObj[i]) {
					if (this[j] !== undefined) continue;
					this[j] = attrPropObj[i][j];
				}
			}
		};
		initor.initStyle = () => {
			for (let i in stylePropObj) {
				if (this.type !== i) continue;
				for (let j in stylePropObj[i]) {
					this.style[j] = stylePropObj[i][j];
				}
			}
		};
		initor.initElement = () => {
			fn.initElement(this);
		};
		initor.initTextWidth = () => {
			if (this.type === 'text' && this.style.width === 'auto') {
				setTimeout(() => {
					fn.getTextWidth(this);
				}, 1);
			}
		};
		initor.insertKeyword = () => {
			if (cache.selectorKeyword[this.name] === undefined) {
				cache.selectorKeyword[this.name] = [];
			}
			cache.selectorKeyword[this.name].push(this);
			cache.selectorKeyword[`[PRIMARY=${this.primary}]`] = [this];
			cache.selectorKeyword[`[primary=${this.primary}]`] = [this];
		};

		this.primary = cache.primary++;
		this.type = data.type.toLowerCase();
		this.scene = data.scene || 'main';
		this.src = data.src;
		this.text = data.text;
		this.loop = data.loop;
		this.timescale = data.timescale !== undefined ? data.timescale : 1;
		this.className = data.className !== undefined ? data.className : "";
		this.style = {
			fontSize: 10,
			fontFamily: 'arial, sans-serif',
			fontWeight: 'normal',
			fontStyle: 'normal',
			textAlign: 'left',
			width: this.type === 'camera' ? 0 : 10,
			height: this.type === 'camera' ? 0 : 10,
			color: 'black',
			borderWidth: 0,
			borderColor: 'black',
			shadowColor: undefined,
			shadowBlur: 10,
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			position: 'absolute',
			bottom: 0,
			left: 0,
			perspective: data.type === 'camera' ? 0 : (vars.usingCamera.scaleDistance || vars.initSetting.scaleDistance),
			opacity: 1,
			rotate: 0,
			scale: 1,
			blur: 0,
			gradientDirection: 0,
			gradientType: '',
			gradient: {},
			pointerEvents: true,
			display: 'block',
			lineHeight: '100%'
		};
		this.relative = { origin: { left: 0, bottom: 0 } };
		this.element = {};
		this.__system__ = {
			ani_init: { callbacks: [] },
			follow_init: { follower: [], following: undefined, relative: {} },
			sprite_init: { playing: false, stage: 1, fps: 1, current: 0, timestamp: performance.now() },
			data: {},
			events: {},
			drawing: true,
			hasGradient: false,
			textWidth: 'auto'
		};

		vars.objects.push(this);

		initor.initAttribute();
		initor.initStyle();
		initor.initElement();
		initor.initTextWidth();
		initor.insertKeyword();

		cache.isNeedCaching++;

		delete this.context;
		this.emit('create');
		return this;
	}

	attr(rawdata) {
		// 속성 적용
		if (typeof rawdata == 'object') {
			const work = (item) => {
				// 매개변수가 Object형일 경우
				// 속성 대입
				if (typeof rawdata == 'object') {
					const data = lve.root.fn.adjustJSON(rawdata, item, item);
					for (let j in data) {
						const value = data[j];
						switch (j) {
							case 'type': {
								item.type = value;
								lve.root.fn.initElement(item);
								break;
							}
							case 'src': {
								item.src = value;
								lve.root.fn.initElement(item);
								break;
							}
							case 'text': {
								item.text = value;
								lve.root.fn.getTextWidth(item);
								break;
							}
							case 'scene': {

								let usingCamera = lve.root.vars.usingCamera;

								if (item != usingCamera) {
									if (item.type == 'video' && value != usingCamera.scene) {
										item.element.muted = true;
									}
								}

								else if (item == usingCamera) {

									let
										oldVideoArr = lve.root.fn.getSceneObj(item.scene),
										newVideoArr = lve.root.fn.getSceneObj(value);

									for (let sceneObj of oldVideoArr) {
										if (sceneObj.type !== 'video') continue;
										sceneObj.element.muted = true;
									}

									for (let sceneObj of newVideoArr) {
										if (sceneObj.type !== 'video') continue;
										sceneObj.element.muted = false;
									}
								}

								lve.root.cache.isNeedCaching++;
							}
							default: {
								item[j] = value;
								break;
							}
						}
					}
					item.emit('attrmodified');
				}
			};

			if (!this.context) work(this);
			else {
				for (let item of this.context) work(item);
			}

			// 객체 반환
			return this;
		}
		// 속성 반환
		else {
			const rets = [];
			const work = (item) => {
				// 매개변수가 없을 때
				// 선택된 모든 객체의 속성 반환
				if (!rawdata) rets.push(item);
				else if (typeof data == 'string') {
					rets.push(item[data]);
				}
			};

			if (!this.context) work(this);
			else {
				for (let item of this.context) work(item);
			}

			return rets;
		}
	}

	css(rawdata) {

		const retArr = [];
		const work = (item) => {

			let data;
			switch (typeof rawdata) {
				case 'object': {
					data = lve.root.fn.adjustJSON(rawdata, item.style, item);
					break;
				}
				case 'function': {
					data = rawdata(item);
					break;
				}
				case 'string': {
					data = rawdata;
					break;
				}
			}

			switch (typeof data) {
				case 'object': {

					for (let i in data) {

						switch (i) {
							case 'position': {
								if (data.position != 'absolute' && data.position != 'fixed') {
									throw new Error(`position:${data.position}은 사용할 수 없는 속성입니다. 사용할 수 있는 속성은 다음과 같습니다. (absolute, fixed) 기본값은 absolute입니다.`);
									console.trace(item);
									return;
								}
								break;
							}
							case 'perspective': {
								if (item.type != 'camera') {
									lve.root.cache.isNeedSort++;
								}
								break;
							}
							case 'width': {
								if (item.type == 'text') {
									item.style.width = data[i];
									// get from modified text width
									lve.root.fn.getTextWidth(item);
								}
								break;
							}
							case 'textAlign': {
								if (
									item.style.position === 'absolute' &&
									item.__system__.textWidth || 0 >= item.style.width
								) {
									console.warn('이 객체의 넓이(style.width)가 문자열의 길이보다 짧거나 같습니다. style.textAlign 속성은 정상적으로 변경되었으나, 정렬이 제대로 이루어지지 않은 것처럼 보일 것입니다.');
									console.trace(item);
								}
								break;
							}
							case 'gradient': {
								if (Object.keys(data[i]).length != 0) {
									item.__system__.hasGradient = true;
								}
								else item.__system__.hasGradient = false;
							}
						}

						item.style[i] = data[i];
						item.emit('cssmodified');
					}

					break;
				}
				case 'string': {
					retArr.push(item.style[data]);
					break;
				}
				case 'undefined': {
					retArr.push(item.style);
					break;
				}
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		switch (typeof rawdata) {
			case 'object': return this;
			case 'function':
			case 'string': return retArr;
			case 'undefined': return retArr;
		}
	}

	draw() {
		const
			fn = lve.root.fn, vars = lve.root.vars,
			initSetting = vars.initSetting,

			usingCamera = vars.usingCamera,
			style = this.style, relative = this.relative,
			hasGradient = this.__system__.hasGradient;

		/* 지역 함수
		 * _getRelativeSize : perspective에 따른 객체 크기 반환 (this.relative.width || this.relative.height)
		 * _getRelativePosition : perspective에 따른 객체 위치 반환 (this.relative.left || this.relative.bottom)
		 */
		const
			_getRelativeSize = lve.root.fn.getRelativeSize,
			_getRelativePosition = lve.root.fn.getRelativePosition;

		// Special Thanks to d_match@naver.com
		const
			getGradient = () => {
				let
					width = this.relative.width,
					height = this.relative.height,
					// 그라데이션 정보
					grd,
					keys = Object.keys(style.gradient),
					textAlign_fix = 0;

				if (!keys.length) return;

				fn.canvasReset(this);
				// text-align에 따라 위치 보정
				if (this.type == 'text') {
					switch (style.textAlign) {
						case 'left': {
							if (style.gradientType === 'linear') {
								textAlign_fix = this.relative.textWidth / 2;
							}
							else {
								textAlign_fix = -(this.relative.width / 2) + (this.relative.textWidth / 2);
							}
							break;
						}
						case 'right': {
							if (this.style.gradientType === 'linear') {
								textAlign_fix = -this.relative.textWidth / 2;
							}
							else {
								textAlign_fix = (this.relative.width / 2) - (this.relative.textWidth / 2);
							}
							break;
						}
					}
				}

				switch (style.gradientType) {
					case 'linear': {
						let
							deg = style.gradientDirection % 360 == 0 ? 1 : style.gradientDirection % 360,
							men = ~~(deg / 90) % 4,
							spx = [0, width, width, 0],
							spy = [0, 0, height, height],
							sppx = [1, -1, -1, 1],
							sppy = [1, 1, -1, -1],

							rad = deg * Math.PI / 180,

							sin = Math.sin(rad),
							cos = Math.cos(rad),
							abs = Math.abs;

						let
							rs = height / sin,
							px = abs(rs * cos),
							rd = (width - px) * px / rs,
							r = rs + rd;

						let
							x0 = spx[men],
							y0 = spy[men],
							x1 = x0 + abs(r * cos) * sppx[men],
							y1 = y0 + abs(r * sin) * sppy[men];

						grd = ctx.createLinearGradient(x0 + relative.left + textAlign_fix, y0 + relative.bottom, x1 + relative.left + textAlign_fix, y1 + relative.bottom);
						break;
					}
					case 'radial': {
						let
							relativeWidth_half = width / 2,
							relativeHeight_half = height / 2,

							ret_left = relative.left + relativeWidth_half + textAlign_fix,
							ret_bottom = relative.bottom + relativeHeight_half

						grd = ctx.createRadialGradient(ret_left, ret_bottom, 0, ret_left, ret_bottom, relativeWidth_half);
						break;
					}
				}

				for (let i in style.gradient) {
					const
						pos = i / 100,
						color = style.gradient[i] || 'transparent';

					if (isNaN(pos)) return;

					grd.addColorStop(pos, color);
				}

				return grd;
			};

		const disappearanceSight = usingCamera.disappearanceSight || initSetting.disappearanceSight;
		// 상대적 거리 가져오기
		relative.perspective = style.perspective - usingCamera.style.perspective;

		if (disappearanceSight) {
			relative.opacity = style.opacity - (relative.perspective / disappearanceSight);
		} else {
			relative.opacity = style.opacity;
		}

		// 1차 사물 그리기 예외 처리
		this.__system__.drawing = false;

		switch (this.type) {
			case 'camera': return;
			case 'image': {
				if (this.src === undefined) return;
				if (this.element.complete != true) return;
				break;
			}
			case 'video': {
				if (this.src === undefined) return;
				break;
			}
			case 'sprite': {
				if (this.src === undefined) return;
				if (this.element.complete != true) return;
				break;
			}
			case 'text': {
				if (this.text === undefined) return;
				if (this.text === '') return;
				if (style.fontSize <= 0) return;
				if (style.width === 'auto') return;
				if (style.height === 'auto') return;
				break;
			}
		}

		if (
			relative.perspective <= 0 ||
			relative.opacity <= 0 ||
			this.scene != 'anywhere' && usingCamera.scene.indexOf(this.scene) != 0 ||
			style.width <= 0 ||
			style.height <= 0 ||
			style.scale <= 0
		) {
			return;
		}

		this.__system__.drawing = true;


		const
			canvas = initSetting.canvas,
			ctx = canvas.context,
			canvas_elem = canvas.element,
			// 설정값 우선순위로 받아오기 (usingCamera -> initSetting)
			scaleDistance = usingCamera.scaleDistance || initSetting.scaleDistance,
			disappearanceSize = usingCamera.disappearanceSize || initSetting.disappearanceSize;

		/* 캔버스 image, text타입
		 * width가 선언되지 않았을 시 자동으로 받아오기
		 * 이는 최초 1회만 실행된다
		 */
		if (style.width == 'auto' || style.height == 'auto') {
			switch (this.type) {
				case 'image': {
					const
						element = this.element,
						widthScale = element.width / element.height,
						heightScale = element.height / element.width;

					// 양쪽 변 모두 auto일 경우
					if (style.width == 'auto' && style.height == 'auto') {
						style.width = element.width || 1;
						style.height = element.height || 1;
						style.width_tmp = 'auto';
						style.height_tmp = 'auto';
					}
					// 한쪽 변만 auto일 시 
					else {
						// 가로 사이즈가 auto일 시
						if (style.width == 'auto') {
							style.width = style.height * widthScale;
							style.width_tmp = 'auto';
						}
						// 세로 사이즈가 auto일 시
						else {
							style.height = style.width * heightScale;
							style.height_tmp = 'auto';
						}
					}

					break;
				}
				case 'sprite': {
					const
						element = this.element,
						widthScale = element.width / this.__system__.sprite_init.stage / element.height,
						heightScale = element.height / (element.width / this.__system__.sprite_init.stage);

					// 양쪽 변 모두 auto일 경우
					if (style.width == 'auto' && style.height == 'auto') {
						style.width = element.width / this.__system__.sprite_init.stage || 1;
						style.height = element.height || 1;
						style.width_tmp = 'auto';
						style.height_tmp = 'auto';
					}
					// 한쪽 변만 auto일 시 
					else {
						// 가로 사이즈가 auto일 시
						if (style.width == 'auto') {
							style.width = style.height * widthScale;
							style.width_tmp = 'auto';
						}
						// 세로 사이즈가 auto일 시
						else {
							style.height = style.width * heightScale;
							style.height_tmp = 'auto';
						}
					}

					break;
				}
			}
		}
		// 카메라에서 보일 상대적 위치 생성
		// position속성값이 fixed일 시 relative 값 고정
		if (style.position == 'absolute') {
			relative.scale = _getRelativeSize(this, style.scale) / style.scale;

			const relativeScale = relative.scale * style.scale;
			// style.scale 을 기준으로 relativeSize가 정해짐
			relative.fontSize = style.fontSize * relativeScale;
			relative.borderWidth = style.borderWidth * relativeScale;
			relative.shadowBlur = style.shadowBlur * relativeScale;
			relative.shadowOffsetX = style.shadowOffsetX * relativeScale;
			relative.shadowOffsetY = style.shadowOffsetY * relativeScale;
			relative.width = style.width * relativeScale;
			relative.height = style.height * relativeScale;
			relative.textWidth = this.__system__.textWidth * relativeScale;
			relative.lineHeight = isNaN(style.lineHeight) ? style.lineHeight : style.lineHeight * relativeScale;
			relative.left = _getRelativePosition(this, 'left');
			relative.bottom = _getRelativePosition(this, 'bottom');
			relative.rotate = style.rotate - usingCamera.style.rotate;
			relative.blur = (() => {
				const maxiumBlur = 5;
				return (scaleDistance - relative.perspective) / (scaleDistance / maxiumBlur) + style.blur;
			})();
		} else {
			relative.perspective = style.perspective;
			relative.fontSize = style.fontSize * style.scale;
			relative.borderWidth = style.borderWidth * style.scale;
			relative.shadowBlur = style.shadowBlur * style.scale;
			relative.shadowOffsetX = style.shadowOffsetX * style.scale;
			relative.shadowOffsetY = style.shadowOffsetY * style.scale;
			relative.width = style.width * style.scale;
			relative.height = style.height * style.scale;
			relative.textWidth = this.__system__.textWidth * style.scale;
			relative.lineHeight = isNaN(style.lineHeight) ? style.lineHeight : style.lineHeight * style.scale;
			relative.left = style.left;
			relative.bottom = canvas_elem.height - (style.bottom + (style.height * style.scale));
			relative.rotate = style.rotate;
			relative.blur = style.blur;
			relative.scale = style.scale;
		}
		// 2차 사물 그리기 예외처리
		if (
			relative.width >= canvas_elem.width * 10 || // 캔버스 넓이보다 매우 클 경우
			relative.height >= canvas_elem.height * 10 || // 캔버스 높이보다 매우 클 경우
			relative.width <= 0 || //  width가 0보다 작을 때
			relative.height <= 0 || // height가 0보다 작을 때
			relative.width < disappearanceSize || // width가 소멸크기보다 작음
			relative.height < disappearanceSize || // height가 소멸크기보다 작음
			disappearanceSight !== undefined && relative.perspective > disappearanceSight // 소멸거리 지정 시 소멸거리보다 멀리있음
		) {
			this.__system__.drawing = false;
			return;
		}
		// 현재 객체에 회전 예상 정보 담기
		//lve.root.fn.isRotateVisible(this);
		// 3차 사물 그리기 예외처리
		if (
			relative.origin.left + relative.width + relative.width_tmp < 0 || // 화면 왼쪽으로 빠져나감
			relative.origin.left - relative.width - relative.width_tmp > canvas_elem.width || // 화면 오른쪽으로 빠져나감
			relative.origin.bottom + relative.height < 0 || // 화면 아래로 빠져나감
			relative.origin.bottom - relative.height > canvas_elem.height // 화면 위로 빠져나감
		) {
			this.__system__.drawing = false;
			return;
		}
		// 객체 자체의 회전 정보 받아오기
		//lve.root.fn.setRotateObject(this);
		// 캔버시 지우기 및 그림 작업 (필터, 트랜스레이트)
		lve.root.fn.canvasReset(this);

		this.__system__.drawing = true;
		switch (this.type) {
			case 'image': {
				const imageObj = this.element;

				if (style.shadowColor) {
					ctx.shadowColor = style.shadowColor;
					ctx.shadowBlur = relative.shadowBlur;
					ctx.shadowOffsetX = relative.shadowOffsetX;
					ctx.shadowOffsetY = relative.shadowOffsetY;
				}
				if (style.borderWidth) {
					ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
					ctx.strokeStyle = style.borderColor;
					ctx.lineWidth = relative.borderWidth;
					ctx.stroke();
				}
				ctx.beginPath();

				try {
					ctx.fill();
					ctx.drawImage(imageObj, relative.left, relative.bottom, relative.width, relative.height);
				} catch (e) { };
				break;
			}
			case 'circle': {
				if (style.shadowColor) {
					ctx.shadowColor = style.shadowColor;
					ctx.shadowBlur = relative.shadowBlur;
					ctx.shadowOffsetX = relative.shadowOffsetX;
					ctx.shadowOffsetY = relative.shadowOffsetY;
				}
				if (style.borderWidth) {
					ctx.ellipse((relative.left + relative.width / 2), (relative.bottom + relative.width / 2), (relative.width / 2 + relative.borderWidth / 2), (relative.height / 2 + relative.borderWidth / 2), 0, 0, (Math.PI * 2));
					ctx.strokeStyle = style.borderColor;
					ctx.lineWidth = relative.borderWidth;
					ctx.stroke();
				}
				const fillColor = hasGradient ? getGradient() : style.color;

				ctx.beginPath();
				ctx.fillStyle = fillColor;
				ctx.ellipse((relative.left + relative.width / 2), (relative.bottom + relative.width / 2), (relative.width / 2), (relative.height / 2), 0, 0, (Math.PI * 2));
				ctx.fill();
				break;
			}
			case 'square': {
				if (style.shadowColor) {
					ctx.shadowColor = style.shadowColor;
					ctx.shadowBlur = relative.shadowBlur;
					ctx.shadowOffsetX = relative.shadowOffsetX;
					ctx.shadowOffsetY = relative.shadowOffsetY;
				}
				if (style.borderWidth) {
					ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
					ctx.strokeStyle = style.borderColor;
					ctx.lineWidth = relative.borderWidth;
					ctx.stroke();
				}
				const fillColor = hasGradient ? getGradient(this) : style.color;

				ctx.beginPath();
				ctx.fillStyle = fillColor;
				ctx.rect(relative.left, relative.bottom, relative.width, relative.height);
				ctx.fill();
				break;
			}
			case 'text': {
				delete relative.width_tmp;

				const fillColor = hasGradient ? getGradient(this) : style.color;
				let left;

				ctx.font = style.fontStyle + ' ' + style.fontWeight + ' ' + relative.fontSize + 'px ' + style.fontFamily;
				ctx.fillStyle = fillColor;
				ctx.textAlign = style.position == 'absolute' ? 'left' : style.textAlign;

				if (style.shadowColor) {
					ctx.shadowColor = style.shadowColor;
					ctx.shadowBlur = relative.shadowBlur;
					ctx.shadowOffsetX = relative.shadowOffsetX;
					ctx.shadowOffsetY = relative.shadowOffsetY;
				}

				if (style.borderWidth) {
					ctx.strokeStyle = style.borderColor;
					ctx.lineWidth = relative.borderWidth;
					fn.text(ctx, 'strokeText', this);
				}
				fn.text(ctx, 'fillText', this);
				break;
			}
			case 'video': {
				const videoObj = this.element;

				if (style.shadowColor) {
					ctx.shadowColor = style.shadowColor;
					ctx.shadowBlur = relative.shadowBlur;
					ctx.shadowOffsetX = relative.shadowOffsetX;
					ctx.shadowOffsetY = relative.shadowOffsetY;
				}
				if (style.borderWidth) {
					ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
					ctx.strokeStyle = style.borderColor;
					ctx.lineWidth = relative.borderWidth;
					ctx.stroke();
				}
				ctx.beginPath();
				ctx.rect(relative.left, relative.bottom, relative.width, relative.height);

				try {
					ctx.fill();
					ctx.drawImage(videoObj, relative.left, relative.bottom, relative.width, relative.height);
				} catch (e) { };
				break;
			}
			case 'sprite': {
				const
					imageObj = this.element,
					current = this.__system__.sprite_init.current,
					gap = imageObj.width / this.__system__.sprite_init.stage;

				if (style.shadowColor) {
					ctx.shadowColor = style.shadowColor;
					ctx.shadowBlur = relative.shadowBlur;
					ctx.shadowOffsetX = relative.shadowOffsetX;
					ctx.shadowOffsetY = relative.shadowOffsetY;
				}
				if (style.borderWidth) {
					ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
					ctx.strokeStyle = style.borderColor;
					ctx.lineWidth = relative.borderWidth;
					ctx.stroke();
				}
				ctx.beginPath();

				try {
					ctx.fill();
					ctx.drawImage(imageObj, current * gap, 0, gap, imageObj.height, relative.left, relative.bottom, relative.width, relative.height);
				} catch (e) { };
				break;
			}
		}
	}

	// 해당 객체를 카메라로 사용함
	// 다른 카메라는 계속 작동 함
	// 여러대의 객체가 선택되었을 시 가장 최초 객체를 선택

	/* [!] 주의사항
	 * .use() 메서드는 카메라뿐 아니라 사물 역시 카메라처럼 사용할 수 있습니다
	 * 다만 사물을 카메라처럼 이용할 경우, perspective값 변동으로 인한 객체들의 z-index 재정렬이 이루어집니다
	 * 이는 사물이 적을 시 큰 문제가 되진 않습니다. 하지만 사물이 많아질수록 성능이 급격히 저하됩니다
	 */
	use() {

		const
			vars = lve.root.vars, cache = lve.root.cache,
			usingCamera = vars.usingCamera,
			tarCamera = this.context ? this.context[0] : this;

		// 아직 카메라가 설정되지 않았을 경우
		if (!lve.root.fn.checkCamera()) {
			vars.usingCamera = tarCamera;
			vars.usingCamera.emit('use');
			return tarCamera;
		}

		// 카메라가 지정되어 있고
		// 현재와 다른 씬일 경우
		if (usingCamera.scene != tarCamera.scene) {
			const
				oldVideoArr = lve.root.fn.getSceneObj(usingCamera.scene),
				newVideoArr = lve.root.fn.getSceneObj(tarCamera.scene);

			for (let item of oldVideoArr) {
				if (item.type !== 'video') continue;
				item.element.muted = true;
			}
			for (let item of newVideoArr) {
				if (item.type !== 'video') continue;
				item.element.muted = false;
			}
		}
		vars.usingCamera = tarCamera;
		vars.usingCamera.emit('use');
		cache.isNeedCaching++;

		return vars.usingCamera;
	}

	// 객체가 해당 사물을 쫒습니다
	// 객체가 현재 위치를 직접 이동합니다
	// 여러대의 객체가 선택되었을 시 가장 최초 객체를 선택
	follow(selectObj, relpos = {}) {

		let tarObj, tarObj_followInit_follower;
		const work = (item) => {

			const item_followInit = item.__system__.follow_init;

			item_followInit.following = tarObj;
			item_followInit.relative = {
				bottom: relpos.bottom || 0,
				left: relpos.left || 0,
				perspective: relpos.perspective || 0
			};

			item.emit('follow');

			// 팔로잉 객체에 현재 객체가 없으면
			if (tarObj_followInit_follower.indexOf(item) == -1) {
				// 리스트 추가
				tarObj_followInit_follower.push(item);
				// cssModified 이벤트를 걸어서 현재 객체의 팔로워의 위치 변화 (css)
				tarObj.on('__followed __followupdate __cssmodified __animateupdate __animateend', (e) => {
					for (let j = 0, len_j = e.target.__system__.follow_init.follower.length; j < len_j; j++) {

						const
							follower = e.target.__system__.follow_init.follower[j],
							follower_style = follower.style,
							obj_follower = follower.__system__.follow_init.relative;

						follower_style.left = tarObj.style.left + obj_follower.left;
						follower_style.bottom = tarObj.style.bottom + obj_follower.bottom;
						follower_style.perspective = tarObj.style.perspective + obj_follower.perspective;

						follower.emit('followupdate');
					}
				}).emit('followed'); // followed 이벤트 발생
			}
		};

		if (selectObj instanceof lve.root.const.ObjectSession) {
			tarObj = selectObj.get(0);
		}
		else {
			tarObj = lve.root.cache.selectorKeyword[selectObj];
			if (!tarObj) return;
			if (tarObj.length > 0) {
				tarObj = tarObj[0];
			}
			else return;
		}
		tarObj_followInit_follower = tarObj.__system__.follow_init.follower;
		// 기존 팔로우 초기화
		lve(this).unfollow();

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return this;
	}

	// 객체가 해당 사물을 쫒음을 멈춥니다
	unfollow() {

		const work = (item) => {
			const
				item_following = item.__system__.follow_init.following,
				item_follower = item_following.__system__.follow_init.follower; // 팔로잉 대상의 팔로워 리스트

			item.__system__.follow_init.following = undefined;
			item_follower.splice(item_follower.indexOf(item), 1);

			item.emit('unfollow');
			item_following.off('__cssmodified').emit('unfollowed');
		};

		if (this.context) {
			let i = this.context.length;
			while (i--) {
				const item = this.context[i];
				// following 객체가 없을 경우
				if (!item.__system__.follow_init.following) continue;
				work(item);
			}
		}
		else {
			work(this);
		}
		return this;
	}

	// 해당 객체의 follower를 제거합니다
	kick(tarObj) {

		let kickTars;
		if (tarObj instanceof lve.root.const.ObjectSession) {
			kickTars = tarObj.context || [tarObj];
		}
		else kickTars = lve.root.cache.selectorKeyword[tarObj] || [];

		const work = (item) => {
			for (let follower of item.__system__.follow_init.follower) {
				// All kick
				if (!tarObj) {
					follower.unfollow().emit('kicked');
					continue;
				}
				// 해당 팔로워가 킥 리스트에 있을 경우 언팔로우
				if (kickTars.indexOf(follower) != -1) {
					follower.unfollow().emit('kicked');
				}
			}
			// kick 이벤트 발생
			item.emit('kick');
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return this;
	}

	// 해당 객체의 Style 속성을 유동적으로 변경합니다
	// 이미 움직이고 있었을 시 기존 설정 초기화
	animate(rawdata, _duration = 1, _easing = 'linear', _complete) {

		if (!rawdata) return;

		let easing, complete;
		const lastArgu = arguments[arguments.length - 1];

		switch (arguments.length) {
			case 3: {
				if (typeof lastArgu === 'string') {
					easing = _easing;
					complete = null;
				}
				else if (typeof lastArgu === 'function') {
					easing = 'linear';
					complete = lastArgu;
				}
				break;
			}
			case 4: {
				easing = _easing;
				complete = _complete;
				break;
			}
		}

		const work = (item) => {
			const
				data = lve.root.fn.adjustJSON(rawdata, item.style, item),
				ani_init = item.__system__.ani_init;

			ani_init.count = ani_init.count || {};
			ani_init.count_max = ani_init.count_max || {};
			ani_init.duration = ani_init.duration || {};
			ani_init.easing = ani_init.easing || {};
			ani_init.origin = ani_init.origin || {};

			let durationMax = 0;
			for (let j in data) {
				// animate 가능한 속성인 경우
				// 불가능한 경우 -> #0075c8, red, DOMElement 등
				if (isNaN(data[j] - 0) === true) continue;
				if (data[j] !== undefined && data[j] !== item.style[j]) {

					let duration;
					if (isNaN(_duration - 0) === false) {
						duration = _duration - 0;
						durationMax = duration;
					}
					else if (typeof _duration === 'object' && isNaN(_duration.speed - 0) === false) {
						const diff = Math.abs(data[j] - item.style[j]);
						duration = diff / _duration.speed * 1000;
						durationMax = duration > durationMax ? duration : durationMax;
					}
					else return;

					// common change properties
					ani_init[j] = data[j];
					ani_init.duration[j] = duration;
					ani_init.origin[j] = item.style[j];
					ani_init.count[j] = 0;
					ani_init.count_max[j] = Math.ceil(duration / 1000 * 60);
					ani_init.easing[j] = easing;
				}
			}
			// animate 속성 갯수값을 저장
			ani_init.count_length = Object.keys(ani_init.count_max).length;
			// 콜백 스택 저장
			if (typeof complete === 'function') {
				ani_init.callbacks.push({
					count: Math.ceil(durationMax / 1000 * 60),
					fn: complete
				});
			}

			item.emit('animatestart');
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		lve.root.cache.isNeedCaching++;
		return this;
	}

	// 해당 객체의 움직임을 멈춥니다
	stop() {
		const work = (item) => {
			item.__system__.ani_init = { callbacks: [] };
			item.emit('animatestop');
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		lve.root.cache.isNeedCaching++;
		return this;
	}

	// 객체를 삭제합니다
	remove() {

		const
			vars = lve.root.vars, cache = lve.root.cache,
			objects = vars.objects, keywords = cache.selectorKeyword,
			canvas = vars.initSetting.canvas.element;

		const work = (item) => {
			// play 속성을 가지고 있는 객체일 경우
			// Element 삭제
			if (typeof item.element.play == 'function') {
				canvas.appendChild(item.element);
				canvas.removeChild(item.element);
			}
			// 캔버스 이벤트 삭제
			const canvasEventObjlst = lve.root.cache.canvasEventKeyword;
			for (let event in canvasEventObjlst) {
				const
					arr_objlst = canvasEventObjlst[event],
					item_i = arr_objlst.indexOf(item);
				// 캔버스 이벤트가 등록된 객체일 경우
				if (item_i != -1) {
					arr_objlst.splice(item_i, 1);
				}
			}
			// lve.root.cache.mouseoverItem 일 경우 초기화
			if (cache.mouseoverItem == item) {
				cache.mouseoverItem = false;
			}
			// 객체 삭제
			objects.splice(objects.indexOf(item), 1);
			keywords[item.name].splice(keywords[item.name].indexOf(item), 1);
			// 사용중인 카메라 객체일 경우
			// 카메라 설정 초기화
			if (item == vars.usingCamera) {
				vars.usingCamera = {};
			}
			// 키워드 삭제
			delete keywords[`[PRIMARY=${item.primary}]`];
			delete keywords[`[primary=${item.primary}]`];
		};

		// 객체정보배열을 돌면서 일괄삭제 후
		// 객체정보배열 재생성
		if (this.context) {
			let i = this.context.length;
			while (i--) {
				work(this.context[i]);
			}
		}
		else {
			work(this);
		}
		// 해당 키워드의 모든 객체가 삭제되었을 경우
		// 해당 키워드 삭제
		if (keywords.hasOwnProperty(this.name)) {
			if (keywords[this.name].length) return;
			delete keywords[this.name];
		}

		lve.root.cache.isNeedCaching++;
	}

	// 객체에 이벤트를 등록합니다
	on(e, fn) {
		const events = lve.root.const.arr_event;
		const
			attachEvent = (event, item) => {
				const eventRoomObj = item.__system__.events;
				if (Array.isArray(eventRoomObj[event]) === false) {
					eventRoomObj[event] = [];
				}
				if (eventRoomObj[event].indexOf(fn) == -1) {
					eventRoomObj[event].push(fn);
				}
			},
			attachCanvasEventList = (event, item) => {
				const eventObjs = lve.root.cache.canvasEventKeyword[event];
				// 캔버스 이벤트가 아닐 경우
				if (!eventObjs) return;
				// canvasEventKeyword에 객체가 등록되어 있지 않을 경우
				if (eventObjs.indexOf(item) == -1) {
					eventObjs.push(item);
					eventObjs.sort((_a, _b) => {
						return _a.style.perspective - _b.style.perspective;
					});
				}
			};

		if (e === undefined) {
			throw new Error(`이벤트리스너가 없습니다. 다음 중 한 가지를 필수로 선택해주세요. (${events.join(', ')})`);
			console.trace(this);
			return;
		}

		if (!fn) return;

		e = e.toLowerCase().split(' ');
		for (let item of e) {
			// 객체를 순회하며 이벤트 할당
			if (this.context) {
				for (let j of this.context) {
					attachEvent(item, j);
					attachCanvasEventList(item, j);
				}
			}
			else {
				attachEvent(item, this);
				attachCanvasEventList(item, this);
			}
		}

		return this;
	}

	// 객체에 이벤트 제거합니다
	off(e, fn) {
		const events = lve.root.const.arr_event;
		const
			removeEvent = (event, item) => {
				const eventRoomObj = item.__system__.events;
				if (fn) {
					const index = eventRoomObj[event].indexOf(fn);
					if (index === -1) return;
					eventRoomObj[event].splice(index, 1);
				}
				else {
					eventRoomObj[event] = undefined;
				}
			},
			removeCanvasEventList = (event, item) => {
				const eventObj = lve.root.cache.canvasEventKeyword[event];
				// it's not canvas event
				if (!eventObj) return;
				// if all canvas event was removed
				if (item.__system__.events[event] !== undefined) return;

				if (eventObj.indexOf(item) != -1) {
					eventObj.splice(obj_i, 1);
				}
			};

		if (e === undefined) {
			throw new Error(`이벤트가 없습니다. 다음 중 한 가지를 필수로 선택해주세요. (${events.join(', ')})`);
			console.trace(this);
			return;
		}

		e = e.toLowerCase().split(' ');
		for (let item of e) {
			// 객체를 순회하며 이벤트 제거
			if (this.context) {
				for (let j of this.context) {
					removeEvent(item, j);
					removeCanvasEventList(item, j);
				}
			}
			else {
				removeEvent(item, this);
				removeCanvasEventList(item, this);
			}
		}

		return this;
	}

	// 객체를 재생합니다
	play() {

		if (!lve.root.vars.isRunning) return;

		const work = (item) => {
			if (!item.src) {
				throw new Error('객체에 src 속성이 없어 재생할 수 없습니다. attr 메서드를 이용하여 먼저 속성을 부여하십시오.');
				console.trace(item);
				return;
			}

			switch (item.type) {
				case 'video': {
					item.element.dataset.playing = 'true';
					item.element.play();
					break;
				}
				case 'sprite': {
					item.__system__.sprite_init.playing = true;
					break;
				}
				default: {
					throw new Error('재생할 수 없는 객체입니다. 이 메서드는 type 속성이 sprite/video 같은 재생/정지가 가능한 객체에 이용하십시오.');
					console.trace(item);
					return;
				}
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return this;
	}

	// 객체의 재생을 멈춤니다
	pause() {
		const work = (item) => {
			switch (item.type) {
				case 'video': {
					item.element.pause();
					item.emit('pause');
					break;
				}
				case 'sprite': {
					item.__system__.sprite_init.playing = false;
					item.emit('pause');
					break;
				}
				default: {
					console.warn('정지가 불가능한 객체입니다. 이 메서드는 type 속성이 video 같은 재생/정지가 가능한 객체에 이용하십시오.');
					console.trace(item);
					return;
				}
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return this;
	}

	// 객체에 클래스 추가합니다
	addClass(rawClassName) {

		const isFn = typeof rawClassName == 'function';
		const work = (item) => {

			const
				className = isFn ? rawClassName(item) : rawClassName,
				newClassNames = className.split(' ');

			for (let tarClass of newClassNames) {

				const
					item_className = item.className + '',
					oldClassNames = item_className.split(' '),
					index_className = oldClassNames.indexOf(tarClass);

				// 해당 객체에 className이 없을 경우
				if (index_className == -1) {
					oldClassNames.push(tarClass);
					if (oldClassNames[0] == '') {
						oldClassNames.splice(0, 1);
					}
					item.className = oldClassNames.join(' ');
					item.emit('addclass');
				}
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return this;
	}

	// 객체에 클래스 제거합니다
	removeClass(rawClassName) {

		const isFn = typeof rawClassName == 'function';
		const work = (item) => {

			const
				className = isFn ? rawClassName(item) : rawClassName,
				newClassNames = className.split(' ');

			for (let tarClass of newClassNames) {

				const
					item_className = item.className + '',
					oldClassNames = item_className.split(' '),
					index_className = oldClassNames.indexOf(tarClass);

				// 해당 객체에 className이 있을 경우
				if (index_className != -1) {
					oldClassNames.splice(index_className, 1);
					if (oldClassNames[0] == '') {
						oldClassNames.splice(0, 1);
					}
					item.className = oldClassNames.join(' ');
					item.emit('removeclass');
				}
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return this;
	}

	// 객체에 클래스 반전합니다
	toggleClass(rawClassName) {

		const isFn = typeof rawClassName == 'function';
		const work = (item) => {

			const
				className = isFn ? rawClassName(item) : rawClassName,
				newClassNames = className.split(' ');

			for (let tarClass of newClassNames) {
				const
					item_className = item.className + '',
					oldClassNames = item_className.split(' '),
					index_className = oldClassNames.indexOf(tarClass);

				// 해당 객체에 className이 없을 경우
				if (index_className == -1) {
					oldClassNames.push(tarClass);
				}
				else oldClassNames.splice(index_className, 1);

				if (oldClassNames[0] == '') {
					oldClassNames.splice(0, 1);
				}
				item.className = oldClassNames.join(' ');
				item.emit('toggleclass');
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return this;
	}

	// 객체들에 클래스가 있는지 확인합니다
	hasClass(rawClassName) {

		let isExist = true;
		const isFn = typeof rawClassName == 'function';

		const work = (item) => {
			const
				item_className = item.className + '',
				className = isFn ? rawClassName(item) : rawClassName,
				classNames = item_className.split(' '),
				index_className = classNames.indexOf(className);
			// 해당 객체에 className이 없을 경우
			if (index_className == -1) {
				isExist = false;
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return isExist;
	}

	// 객체에 해당되는 클래스가 있는 객체만 추출합니다
	findClass(rawClassName) {

		const isFn = typeof rawClassName == 'function';
		const retArray = { name: this.name, context: [] };

		const work = (item) => {
			const
				item_className = item.className + '',
				className = isFn ? rawClassName(item) : rawClassName,
				classNames = item_className.split(' '),
				index_className = classNames.indexOf(className);
			// 해당 객체에 className이 없을 경우
			if (index_className != -1) {
				retArray.context.push(item);
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return lve(retArray);
	}

	// 해당 세션 중 지정된 클래스가 아닌 객체를 반환합니다
	notClass(rawClassName) {

		const isFn = typeof rawClassName == 'function';
		const retArray = { name: this.name, context: [] };

		const work = (item) => {
			const
				item_className = item.className + '',
				className = isFn ? rawClassName(item) : rawClassName,
				classNames = item_className.split(' '),
				index_className = classNames.indexOf(className);
			// 해당 객체에 className이 없을 경우
			if (index_className == -1) {
				retArray.context.push(item);
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return lve(retArray);
	}

	// 객체의 element를 반환합니다
	element() {
		const rets = [];
		const work = (item) => {
			if (item.element.nodeName) {
				rets.push(item.element);
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return rets;
	}

	// 객체의 이벤트 발생시킵니다
	emit(e, detail = {}) {
		const events = e.toLowerCase().split(' ');
		const work = (item) => {
			for (let event of events) {
				const
					globalEventArr = lve.root.cache.globalEventKeyword[event] || [],
					itemEventsArr = item.__system__.events[event] || [];
				const eventInfoObj = {
					type: event,
					target: item,
					originalEvent: detail
				};

				for (let k of globalEventArr) k(eventInfoObj);
				for (let k of itemEventsArr) k(eventInfoObj);
			}
		};

		const eventheader = '__';
		// add system events
		for (let i = 0, len = events.length; i < len; i++) {
			const event = events[i];
			if (event.indexOf(eventheader) === 0) continue;
			events.splice(i, 0, eventheader + event);
		}

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}
	}

	// 해당 객체의 문자열 길이를 재정의합니다
	measureText() {
		const work = (item) => {
			if (item.type !== 'text') {
				console.warn('measureText 메서드는 type:text 객체에만 사용할 수 있습니다');
				return;
			}
			item.css({ width: 'auto' });
			lve.root.fn.getTextWidth(item);
			item.emit('measuretext');
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return this;
	}

	// 해당 세션의 팔로워를 반환합니다
	follower() {
		const retObj = {
			name: this.name,
			context: []
		};
		const work = (item) => {
			const arr_itemFollower = item.__system__.follow_init.follower;
			// 팔로워가 있을 경우
			for (let follower of arr_itemFollower) {
				// 반환값에 팔로워가 아직 없을 경우
				if (retObj.context.indexOf(follower) == -1) {
					retObj.context.push(follower);
				}
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		lve.root.cache.isNeedCaching++;
		return lve(retObj);
	}

	// 해당 세션의 팔로잉을 반환합니다
	following() {
		const retObj = {
			name: this.name,
			context: []
		};
		const work = (item) => {
			const item_followingTar = item.__system__.follow_init.following;
			if (!item_followingTar) return;
			if (retObj.context.indexOf(item_followingTar) == -1) {
				retObj.context.push(item_followingTar);
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return lve(retObj);
	}

	// 객체에 데이터를 저장 또는 반환합니다
	data(rawdata) {
		// 속성 적용
		if (typeof rawdata == 'object') {
			const work = (item) => {
				// 매개변수가 Object형일 경우 스타일 속성 대입
				if (typeof rawdata == 'object') {
					const data = lve.root.fn.adjustJSON(rawdata, item.__system__.data, item);
					for (let j in rawdata) {
						item.__system__.data[j] = data[j];
					}
					item.emit('datamodified');
				}
			};

			if (!this.context) work(this);
			else {
				for (let item of this.context) work(item);
			}

			// 객체 반환
			return this;
		}
		// 속성 반환
		else {
			const rets = [];
			const work = (item) => {
				const tarData = item.__system__.data[rawdata];
				// 매개변수가 없을 때
				// 선택된 모든 객체의 style 속성 반환
				if (!rawdata) rets.push(item.__system__.data);
				else if (typeof rawdata == 'string') {
					rets.push(tarData);
				}
			};

			if (!this.context) work(this);
			else {
				for (let item of this.context) work(item);
			}

			return rets;
		}
	}

	// 검색된 객체의 i번 째 순번의 객체를 반환합니다
	get(i) {
		if (!this.context) return this;
		else {
			if (i >= 0) return this.context[i];
			else {
				return this.context[this.context.length + i];
			}
		}
	}

	// >= v2.0.1
	// 객체의 
	load(_src, _complete) {

		if (_src === undefined) {
			throw new Error('최소한 1개의 매개변수가 필요합니다. 불러올 src 속성값을 입력하십시오.');
			return;
		}

		const work = (item) => {
			item.src = typeof _src == 'function' ? _src(item) : _src;
			item.style.width = 'not_ready';
			item.style.height = 'not_ready';
			lve.root.fn.initElement(item, _complete);
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		return this;
	}

	// >= v2.0.3
	from(originObj) {
		let
			tarObj,
			retObj = { name: this.name, context: [] };

		if (originObj === undefined) return;
		if (originObj instanceof lve.root.const.ObjectSession) {
			if (originObj.context) {
				tarObj = originObj.context;
			}
			else {
				tarObj = [originObj];
			}
		}
		else {
			tarObj = lve.root.cache.selectorKeyword[originObj];
		}
		if (!tarObj) return;

		for (let item of tarObj) {
			const newObj = lve(this.name).create({ type: item.type });
			const
				oldObj_deepcopy = lve.root.fn.copyObject(item),
				newObj_primary = newObj.primary,
				newObj_i = lve.root.vars.objects.indexOf(newObj),
				keyword_name_i = lve.root.cache.selectorKeyword[this.name].indexOf(newObj);

			// init method copied object
			oldObj_deepcopy.__proto__ = newObj.__proto__;
			oldObj_deepcopy.primary = newObj_primary;
			// update object's properties in selectorKeyword['name']
			lve.root.cache.selectorKeyword[this.name][keyword_name_i] = oldObj_deepcopy;
			// update object`s properties in selectorKeyword['primary']
			lve.root.cache.selectorKeyword[`[primary=${newObj_primary}]`] = [oldObj_deepcopy];
			lve.root.cache.selectorKeyword[`[PRIMARY=${newObj_primary}]`] = [oldObj_deepcopy];
			// update object`s properties in lve.root.vars.objects
			lve.root.vars.objects[newObj_i] = oldObj_deepcopy;
			// element > deep copy from origin object
			if (item.element instanceof HTMLElement) {
				oldObj_deepcopy.element = item.element.cloneNode(true);
			}
			// push return object
			retObj.context[i] = oldObj_deepcopy;
		}

		lve.root.cache.isNeedCaching++;
		return lve(retObj);
	}

	// >= 2.2.0
	in(sceneName, underlevel) {

		const
			rets = [],
			sceneNameArr = Array.isArray(sceneName) ? sceneName : sceneName.split(' ');

		const work = (item) => {
			for (let scene of sceneNameArr) {
				if (underlevel) {
					if (item.scene.indexOf(scene) === 0) {
						rets.push(item);
						continue;
					}
				}
				if (scene === item.scene) {
					rets.push(item);
				}
			}
		};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		// update session
		this.context = rets;
		return this;
	}

	// >= 2.4.0
	sprite(rawdata) {
		const
			retArr = [],
			work = (item) => {
				const sprite_init = item.__system__.sprite_init;
				let data;

				switch (typeof rawdata) {
					case 'object': {
						data = lve.root.fn.adjustJSON(rawdata, sprite_init, item);
						break;
					}
					case 'function': {
						data = rawdata(item);
						break;
					}
					case 'string': {
						data = rawdata;
						break;
					}
				}

				switch (typeof data) {
					case 'object': {
						for (let i in data) {
							sprite_init[i] = data[i];
						}
						break;
					}
					case 'string': {
						retArr.push(item.__system__.sprite_init[data]);
						break;
					}
				}
			};

		if (!this.context) work(this);
		else {
			for (let item of this.context) work(item);
		}

		switch (typeof rawdata) {
			case 'object': {
				return this;
			}
			case 'function':
			case 'string': {
				return retArr;
			}
		}
	}
};


/*  LVE.JS system function
 *  사용자가 직접 호출해서는 안되는 함수들입니다.
 */

lve.root.fn.update = (timestamp = lve.root.cache.loseTime) => {

	const
		cache = lve.root.cache,
		vars = lve.root.vars,
		initSetting = vars.initSetting,

		canvas = initSetting.canvas,
		ctx = canvas.context,
		canvas_elem = canvas.element,

		ctx_width = canvas_elem.width,
		ctx_height = canvas_elem.height,

		usingCamera = vars.usingCamera,
		objects = vars.objects,

		fps = usingCamera.frameLimit || initSetting.frameLimit,
		virtualInterval = 1000 / fps,
		realInterval = timestamp - (cache.loseTime + cache.now),
		delayscale = realInterval / (1000 / 60),

		userExtendStart = initSetting.userExtendStart,
		userExtendEnd = initSetting.userExtendEnd,
		userExtendDrawStart = initSetting.userExtendDrawStart,
		userExtendDrawEnd = initSetting.userExtendDrawEnd;

	let
		isNeedSort = cache.isNeedSort,
		isNeedCaching = cache.isNeedCaching,
		isDrawFrame = virtualInterval <= timestamp - cache.lastDraw;

	// 만일 캐싱 요청이 있을 경우 전 오브젝트 순회하며 캐싱할 것
	if (isNeedCaching) {

		let cameraSceneArr;
		const allObjectArr = lve.root.vars.objects;

		try {
			cameraSceneArr = usingCamera.scene.split('::');
		} catch (e) { };

		cache.objectArr = [];

		for (let item of objects) {

			let sceneCapture = cameraSceneArr[0];

			for (let j = 0, len_j = cameraSceneArr.length; j < len_j; j++) {

				if (
					item.scene === sceneCapture ||
					item.scene === 'anywhere' ||
					item.__system__.ani_init.count_length > 0 ||
					item.type == 'sprite' && item.__system__.sprite_init.playing === true
				) {
					cache.objectArr.push(item);
					break;
				}

				if (cameraSceneArr[j + 1] !== undefined) {
					sceneCapture += `::${cameraSceneArr[j + 1]}`;
				}
			}
		}

		for (let tarObj of allObjectArr) {
			if (
				tarObj.scene === 'anywhere' &&
				cache.objectArr.indexOf(tarObj) == -1
			) {
				cache.objectArr.push(tarObj);
			}
		}

		cache.isNeedCaching = 0;
		cache.isNeedSort++;
	}

	// 현재 시각 갱신
	cache.now += realInterval;
	// 사용자가 초기설정시 extendStart 옵션을 사용했을 시
	if (!!userExtendStart) {
		userExtendStart(lve.root);
	}
	// 설정 갱신
	if (isDrawFrame) {
		cache.lastDraw = timestamp - 1;
		cache.fps = ~~(fps / delayscale);

		// reset frame
		ctx.restore();
		ctx.save();

		// global canvas setting
		ctx.globalAlpha = 1;
		ctx.fillStyle = usingCamera.backgroundColor || initSetting.backgroundColor;
		ctx.clearRect(0, 0, ctx_width, ctx_height);
		ctx.fillRect(0, 0, ctx_width, ctx_height);
		// 사용자가 초기설정시 extendDrawStart 옵션을 사용했을 시
		if (!!userExtendDrawStart) {
			userExtendDrawStart(lve.root);
		}
	}
	// 해당 씬의 모든 객체 순회
	let i = cache.objectArr.length;
	while (i--) {
		let
			item = cache.objectArr[i], // 해당 객체
			item_timescale = item.timescale * delayscale,
			item_ani_callbacks = item.__system__.ani_init.callbacks,
			item_ani_callbacks_len = item_ani_callbacks.length,
			item_ani_countMax = item.__system__.ani_init.count_max,
			attr_translateend = 0, // 해당 객체의 animated된 속성 갯수를 저장할 변수
			attr_length = item.__system__.ani_init.count_length;

		// 사물 그려넣기
		if (isDrawFrame) {
			item.draw();
		}
		// 스프라이트 이미지
		if (item.type == 'sprite') {
			const
				sprite_init = item.__system__.sprite_init,
				sprite_interval = 1000 / sprite_init.fps;

			if (sprite_init.playing && sprite_interval < timestamp - sprite_init.timestamp) {
				sprite_init.timestamp = timestamp;
				sprite_init.current++;
			}
			// sprite onended
			if (sprite_init.current >= sprite_init.stage) {
				item.emit('ended');
				// if sprite object has not loop
				if (!item.loop) {
					sprite_init.playing = false;
					sprite_init.current--;
				}
				else {
					sprite_init.current = 0;
					item.play();
				}
			}
		}
		// 해당 객체가 animating이 아닐 시 제외
		if (!item_ani_countMax && item_ani_callbacks_len === 0) continue;
		// 해당 객체가 animating일 경우
		// j를 객체 속성으로 잡음
		for (let j in item.__system__.ani_init) {
			// 해당 속성이 animating, number형이 아닐 시 예외
			if (item.__system__.ani_init[j] === undefined) continue;
			if (typeof item.__system__.ani_init[j] != 'number') continue;
			let
				item_style = item.style,
				item_ani = item.__system__.ani_init,
				item_ani_tar = item_ani[j],
				item_ani_origin = item_ani.origin,
				item_ani_count = item_ani.count,
				item_ani_countMax_item = item_ani.count_max[j];
			// 해당 속성에 animate값 저장
			if (
				item_ani_tar != item_ani_origin[j] &&
				item_ani_count[j] < item_ani_countMax_item
			) {
				item_style[j] = item.getEasingData(j);
				item_ani_count[j] += item_timescale;
				item.emit('animateupdate');
			}
			// style.perspective 값이 변경되었을 시
			// isNeedSort 설정
			if (
				j == 'perspective' &&
				item_ani_tar != item_ani_origin[j] &&
				item_ani_count[j] < item_ani_countMax_item
			) {
				// 움직인 것이 카메라가 아니거나, timescale이 0일 때는 인덱싱하지 않음
				isNeedSort += (item.type != 'camera' || item.timescale !== 0) - 0;
			}
			// 객체의 해당 속성이 animated 되었을 때
			if (item_ani_count[j] >= item_ani_countMax_item) {
				item_style[j] = item_ani_tar !== undefined ? item_ani_tar : item_style[j];
				attr_translateend++;
				item_ani.count_length--;
				// animating 속성을 없앰으로써 다시 animated로 체크되는 일이 없도록 예외처리
				delete item_ani_count[j];
			}
			// 해당 객체가 모든 속성이 animated 되었을 때
			if (attr_translateend >= attr_length) {
				// animateend 이벤트 발생
				item.__system__.ani_init = { callbacks: item_ani.callbacks.concat() };
				setTimeout(() => {
					item.emit('animateend');
				}, 0);
				cache.isNeedCaching++;
			}
		}
		// 애니메이션 콜백 함수 체크
		while (item_ani_callbacks_len--) {
			const e = item_ani_callbacks[item_ani_callbacks_len];
			if (e.count > 0) {
				e.count -= item_timescale;
			}
			else {
				e.fn(item);
				item_ani_callbacks.splice(item_ani_callbacks_len, 1);
			}
		}
	}

	if (isDrawFrame) {
		// 지정된 카메라가 없을 경우
		if (!lve.root.fn.checkCamera()) {
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, ctx_width, ctx_height);
			ctx.font = '30px consolas';
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';

			const
				ctx_width_half = ctx_width / 2,
				ctx_height_half = ctx_height / 2;

			ctx.fillText('지정된 카메라가 없습니다', ctx_width_half, ctx_height_half - 15, ctx_width);
			ctx.font = '15px consolas';
			ctx.fillText('There is no using camera', ctx_width_half, ctx_height_half + 15, ctx_width);
		}
		// 사용자가 초기설정시 extendDrawEnd 옵션을 사용했을 시
		if (!!userExtendDrawEnd) {
			userExtendDrawEnd(lve.root);
		}
		// z값이 변경되었을 시 재정렬
		if (isNeedSort) {
			cache.isNeedSort = 0;
			cache.objectArr.sort((a, b) => {
				return parseFloat(a.style.perspective) - parseFloat(b.style.perspective);
			});
		}
	}
	// 사용자가 초기설정시 extendEnd 옵션을 사용했을 시
	if (!!userExtendEnd) {
		userExtendEnd(lve.root);
	}
	// update 재귀호출
	if (vars.isRunning) {
		window.requestAnimationFrame(lve.root.fn.update);
	}
};

lve.root.fn.copyObject = (rawdata) => {
	let data;
	if (typeof rawdata == 'object') {
		if (rawdata instanceof HTMLElement) {
			data = rawdata.cloneNode(true);
			return data;
		}
		else if (Array.isArray(rawdata)) {
			data = [];
		}
		else {
			data = {};
		}

		for (let i in rawdata) {
			const value = rawdata[i];
			if (
				typeof value == 'object' &&
				value instanceof lve.root.const.ObjectSession === false
			) {
				data[i] = lve.root.fn.copyObject(value);
			}
			else {
				data[i] = value;
			}
		}
	}
	else {
		data = rawdata;
	}
	return data;
};

lve.root.fn.adjustProperty = (data) => {
	return (data + '').replace(/-.|[A-Z](?=[a-z])/gm, (v) => {
		return `[${v}]`;
	}).toLowerCase().replace(/\[.\]/gmi, (v) => {
		return v.substr(1, 1).toUpperCase();
	});
};

lve.root.fn.adjustJSON = (rawdata, _parent, _obj) => {
	// 새로운 객체로 생성
	const data = lve.root.fn.copyObject(rawdata);
	// 모든 스타일 parseFloat화 시키기
	for (let i in data) {
		let
			data_origin = rawdata[i],
			parseData = parseFloat(data_origin),
			calcFormulaArr = ['+=', '-=', '*=', '/='];

		delete data[i];
		// '-' 제거
		// font-size | FONT-SIZE -> fontSize
		i = lve.root.fn.adjustProperty(i);
		// 속성값이 함수형일 경우
		// 객체 자기자신을 인수로 전달하여 값을 받아옴
		if (typeof data_origin == 'function' && _obj) {
			data_origin = data_origin(_obj);
		}
		if (typeof data_origin == 'string') {
			const
				headChar = data_origin.substr(0, 2),
				footChar = data_origin.substr(2);

			// 계산식일 경우
			if (calcFormulaArr.indexOf(headChar) != -1) {
				switch (headChar) {
					case '+=': {
						data_origin = _parent[i] + parseFloat(footChar);
						break;
					}
					case '-=': {
						data_origin = _parent[i] - parseFloat(footChar);
						break;
					}
					case '*=': {
						data_origin = _parent[i] * parseFloat(footChar);
						break;
					}
					case '/=': {
						data_origin = _parent[i] / parseFloat(footChar);
						break;
					}
				}
			}
		}
		data[i] = isNaN(data_origin - 0) ? data_origin : isNaN(parseData) ? data_origin : parseData;
	}
	return data;
};

lve.root.fn.getRelativeSize = (tarObj, tarObj_size) => {
	const
		vars = lve.root.vars,
		cameraObject = vars.usingCamera,
		scaleDistance = cameraObject.scaleDistance || vars.initSetting.scaleDistance;

	return tarObj_size * scaleDistance / ((tarObj.style.perspective - cameraObject.style.perspective) || -1);
};

lve.root.fn.getRelativePosition = (tarObj, direction) => {
	let
		pt_center, // 캔버스의 중앙 - 캔버스 그리기 시작 위치
		pt_fix, // 객체 자신을 그리기 중점 - pt_center - (width / 2) || (height / 2)
		camera_height, // 카메라 높이
		n,

		vars = lve.root.vars,
		initSetting = vars.initSetting,
		cameraObj = vars.usingCamera,
		scaleDistance = cameraObj.scaleDistance || initSetting.scaleDistance,
		canvas_elem = initSetting.canvas.element, // Nagative. top이 아니라, bottom으로 인한 반전값

		tarObj_style = tarObj.style,
		tarObj_relative = tarObj.relative,
		cameraObject_style = cameraObj.style;

	// direction이 left일 경우
	if (direction == 'left') {
		pt_center = canvas_elem.width / 2;
		pt_fix = tarObj_relative.width / 2;
		camera_height = 0;
		n = 1;
	}
	// direction이 bottom일 경우
	else {
		pt_center = canvas_elem.height / 2;
		pt_fix = tarObj_relative.height;
		camera_height = cameraObject_style.height * cameraObject_style.scale;
		n = -1;
	}
	// 직관적인 변수명 재명시
	const
		target_originPosition = tarObj_style[direction],
		camera_originPosition = cameraObject_style[direction],
		target_originRotate = tarObj_style.rotate,
		camera_originRotate = cameraObject_style.rotate,
		target_relativeScale = scaleDistance / tarObj_relative.perspective,
		// perspective에 따른 relative position 계산
		target_gap_position = target_originPosition - camera_originPosition - camera_height,
		target_gal_relative = n * target_gap_position * target_relativeScale,
		target_relativePosition = pt_center - pt_fix + target_gal_relative;

	return target_relativePosition;
};

lve.root.fn.eventfilter = (e) => {
	const
		vars = lve.root.vars,
		cache = lve.root.cache,
		initSetting = vars.initSetting,
		usingCamera = vars.usingCamera || {},
		canvas_elem = initSetting.canvas.element,
		canvasEventKeyword = cache.canvasEventKeyword,
		ox = e.offsetX,
		oy = e.offsetY;
	let
		arr_targetlst = canvasEventKeyword[e.type].concat(),
		arr_targetlst_len = arr_targetlst.length;

	cache.isNeedSort = 0;
	vars.objects.sort((a, b) => {
		return parseFloat(a.style.perspective) - parseFloat(b.style.perspective);
	});

	// mousemove 이벤트일 경우
	// arr_targetlst 갱신하여 mouseover 객체 정보를 담은 배열도 추가하기
	if (e.type == 'mousemove') {
		const arr_mouseoverlst = canvasEventKeyword['mouseover'];

		arr_targetlst = arr_targetlst.concat(arr_mouseoverlst);
		arr_targetlst_len = arr_targetlst.length;
	}

	for (let i = 0; i < arr_targetlst_len; i++) {
		const
			item = arr_targetlst[i],
			style = item.style,
			relative = item.relative,
			left = relative.left,
			top = relative.bottom;

		// 예외 처리
		if (
			item.type == 'camera' || // 카메라 객체일 경우
			item.scene != 'anywhere' && usingCamera.scene.indexOf(item.scene) != 0 || // 현재 카메라와 다른 씬일 경우
			style.display == 'none' || // display 속성값이 none일 경우
			!style.pointerEvents || // pointer-events 속성값이 none일 경우
			ox < left || // 객체가 우측에 있을 경우
			ox > (left + relative.width) || // 객체가 좌측에 있을 경우
			oy < top || // 객체가 아래에 있을 경우
			oy > (top + relative.height) // 객체가 위에 있을 경우
		) {
			// 마지막 루프까지 순회했으나, 일치한 결과가 없었을 경우
			if (i == arr_targetlst_len - 1) {
				// mousemove 이벤트였으나, cache.mouseoverItem 결과값이 남아있을 경우
				const beforeMouseoverItem = cache.mouseoverItem;
				if (e.type == 'mousemove' && beforeMouseoverItem instanceof lve.root.const.ObjectSession) {
					beforeMouseoverItem.emit('mouseout');
					cache.mouseoverItem = false;
				}
			}
			continue;
		}
		// 이벤트 발동조건이 일치할 때
		// 현재 카메라 기준으로 perspective가 가장 근접한 객체에 최초 발동
		// 만일 mouseover 이벤트를 가지고 있을 경우
		if (
			item.__system__.events['mouseover'] !== undefined &&
			item.__system__.events['mouseover'].length > 0
		) {
			const beforeMouseoverItem = cache.mouseoverItem;
			// 이전 아이템과 일치하지 않을 경우 갱신하기
			if (item != beforeMouseoverItem) {
				// 생성된 객체일 경우
				if (beforeMouseoverItem instanceof lve.root.const.ObjectSession) {
					beforeMouseoverItem.emit('mouseout');
				}
				item.emit('mouseover');
				cache.mouseoverItem = item;
			}
		}
		// 이벤트 호출
		item.emit(e.type, e);
		break;
	}
};

lve.root.fn.getSceneObj = (sceneName, sampleObjects) => {
	const
		objects = sampleObjects || lve.root.vars.objects,
		retArr = [];

	const sceneNameArr = sceneName.split('::');

	for (let item of objects) {

		let sceneCapture = sceneNameArr[0];

		for (let j = 0, len_j = sceneNameArr.length; j < len_j; j++) {
			if (
				item.scene === sceneCapture ||
				item.scene === 'anywhere'
			) {
				retArr.push(item);
				break;
			}

			if (sceneNameArr[j + 1] !== undefined) {
				sceneCapture += `::${sceneNameArr[j + 1]}`;
			}
		}
	}

	return retArr;
};

lve.root.fn.checkCamera = () => {
	const usingCamera = lve.root.vars.usingCamera;
	return !(!usingCamera || !usingCamera.hasOwnProperty('primary'));
};

lve.root.fn.getTextWidth = (_obj) => {
	const
		ctx = lve.root.vars.initSetting.canvas.context,
		style = _obj.style;

	const
		cars = (_obj.text + '').split('\n'),
		breakPointArr = [0];

	let maxiumTextWidth = 0;

	ctx.font = style.fontStyle + ' ' + style.fontWeight + ' ' + style.fontSize + 'px ' + style.fontFamily;

	if (_obj.style.width == 'auto') {
		style.width = 0;

		for (let car of cars) {

			const
				lineTextWidth = ctx.measureText(car).width,
				lineTextOffset = breakPointArr[breakPointArr.length - 1] + car.length;

			if (_obj.style.width < lineTextWidth) {
				_obj.style.width = lineTextWidth;
				maxiumTextWidth = lineTextWidth;
			}

			breakPointArr.push(lineTextOffset);
		}
	}
	else {

		for (let car of cars) {

			const
				lineTextWidth = ctx.measureText(car).width,
				lineTextOffset = breakPointArr[breakPointArr.length - 1] + car.length;

			// 이 줄의 길이가 객체의 너비를 넘어 줄바꿈이 필요함
			if (_obj.style.width < lineTextWidth) {

				let row_lastOffset = 0;

				for (let j = 0, len_j = car.length; j < len_j; j++) {

					const
						testText = car.substring(row_lastOffset, j),
						arr_lastOffset = breakPointArr[breakPointArr.length - 1];

					if (ctx.measureText(testText).width > _obj.style.width) {
						row_lastOffset = j;
						breakPointArr.push(arr_lastOffset + testText.length);
					}
				}
			}

			breakPointArr.push(lineTextOffset);
		}
	}

	let lineHeight;
	if (isNaN(_obj.style.lineHeight - 0)) {
		lineHeight = _obj.style.fontSize * (parseFloat(_obj.style.lineHeight) / 100);
	}
	else {
		lineHeight = _obj.style.lineHeight - 0;
	}

	_obj.style.height = breakPointArr.length * lineHeight;
	_obj.__system__.textWidth = maxiumTextWidth;
	_obj.__system__.textBreakPointArr = breakPointArr;

	lve.root.cache.isNeedCaching++;
};

lve.root.fn.isRotateVisible = (_item) => {

	const
		vars = lve.root.vars,
		canvas_elem = vars.initSetting.canvas.element,

		relative = _item.relative,
		rotate = vars.usingCamera.style.rotate || 0;
	// 카메라 객체가 회전 중이 아닐 시
	if (!_rotate % 360) {
		return;
	}
	const
		radian = lve.root.const.radian * rotate,
		centX = canvas_elem.width / 2,
		centY = canvas_elem.height / 2,
		x = relative.left - centX,
		y = relative.bottom - centY,

		r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
		rotX = r * Math.cos(-radian) + centX,
		rotY = -(r * Math.sin(-radian)) + centY;

	relative.origin = {
		left: rotX,
		bottom: rotY
	};
};

lve.root.fn.setRotateObject = (_item) => {
	let
		canvas = lve.root.vars.initSetting.canvas,
		canvas_elem = canvas.element,

		relative = _item.relative,
		rotate = relative.rotate || 0,
		radian = lve.root.const.radian * rotate;

	if (!rotate % 360) {
		return;
	}
	const
		centX = canvas_elem.width / 2,
		centY = canvas_elem.height / 2,
		_left = relative.left - centX,
		_bottom = centY - relative.bottom;

	const r = Math.sqrt(Math.pow(_left, 2) + Math.pow(_bottom, 2));
};

lve.root.fn.canvasReset = (_item = { style: {}, relative: {} }) => {
	const
		vars = lve.root.vars,
		initSetting = vars.initSetting,
		usingCamera = vars.usingCamera,

		canvas = initSetting.canvas,
		ctx = canvas.context,
		style = _item.style,
		relative = _item.relative,

		opacity = style.opacity || 0,
		blur = style.blur || 0,
		rotate = relative.rotate || 0,

		radian = style.position != 'fixed' ? lve.root.const.radian * rotate : 0;

	ctx.restore();
	ctx.save();
	ctx.beginPath();
	ctx.rotate(radian);

	ctx.globalAlpha = opacity;
	ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none';
};

lve.root.fn.initElement = (that, _onload) => {
	switch (that.type) {
		case 'image':
		case 'sprite': {
			that.element = document.createElement('img');
			break;
		}
		case 'video': {
			that.element = document.createElement('video');
			break;
		}
		default: {
			that.element = {};
			return;
		}
	}
	// attach events
	switch (that.type) {
		case 'image': {
			that.element.onload = () => {
				if (that.style.width === 'not_ready') {
					that.style.width = that.element.width || 10;
				}
				if (that.style.height === 'not_ready') {
					that.style.height = that.element.height || 10;
				}

				that.emit('load');

				if (typeof _onload == 'function') {
					_onload(that);
				}
			};
			break;
		}
		case 'sprite': {
			that.element.onload = () => {
				if (that.style.width === 'not_ready') {
					that.style.width = that.element.width / that.__system__.sprite_init.stage;
				}
				if (that.style.height === 'not_ready') {
					that.style.height = that.element.height;
				}
				if (typeof _onload == 'function') {
					that.emit('load');
					_onload(that);
				}
			};
			break;
		}
		case 'video': {
			that.element.oncanplay = () => {
				if (that.element.dataset.playing === 'true') {
					delete that.element.dataset.playing;
					that.emit('play');
				}
				that.element.onplay = () => {
					that.emit('play');
				}
			};
			that.element.onended = () => {
				that.emit('ended');
				if (that.loop) {
					that.element.currentTime = 0;
					that.play();
				}
			};
			that.element.onloadeddata = () => {
				if (typeof _onload == 'function') {
					that.emit('load');
					_onload(that);
				}
			};
			break;
		}
	}
	// load element from source
	if (that.src) {
		that.element.src = that.src;
	}
};

lve.root.fn.text = (_ctx, _type, _that) => {

	const
		ctx = _ctx,
		relative = _that.relative,
		breakPointArr = _that.__system__.textBreakPointArr,
		text = (_that.text + '').replace(/\n/g, '');

	let
		x = relative.left,
		y = relative.bottom + relative.height,
		lineHeight;

	if (
		isNaN(relative.lineHeight - 0) === true
	) {
		if (relative.lineHeight.substr(-1) != '%') {
			return;
		}
		lineHeight = relative.fontSize * parseFloat(relative.lineHeight) / 100;
	}
	else {
		lineHeight = relative.lineHeight;
	}

	let
		i = breakPointArr.length,
		row = 0;

	while (i--) {
		const
			startOffset = breakPointArr[i - 1] || 0,
			endOffset = breakPointArr[i] || text.length;

		const
			rowText = text.substring(startOffset, endOffset),
			rowWidth = _ctx.measureText(rowText).width * _that.style.scale;

		let xx;

		if (_that.style.position == 'absolute') {
			switch (_that.style.textAlign) {
				case 'left': {
					xx = relative.left;
					break;
				}
				case 'center': {
					xx = relative.left + (relative.width / 2) - (rowWidth / 2);
					break;
				}
				case 'right': {
					xx = relative.left + relative.width - rowWidth;
					break;
				}
			}
		} else {
			xx = relative.left;
		}

		_ctx[_type](rowText, xx, y - (row * lineHeight), relative.width);
		row++;

		if (startOffset === 0) {
			break;
		}
	}
};


/* lve.js 함수
 *
 * 이곳에서 전역설정한 설정은, 각 객체마다 지역설정보다 우선하지 않습니다
 * 예를 들어, 전역설정으로 disappearanceSight를 10으로 설정했고,
 * 'TEST1'이라는 카메라 객체의 disappearanceSight를 15로 설정했을 시, 'TEST1' 카메라의 설정이 우선됩니다
 *
 * 그 외, 객체에 지역설정이 되어있지 않을 시, 전역설정을 따릅니다
 */

lve.init = (rawdata) => {

	if (document.readyState !== 'complete') {
		window.addEventListener('load', () => { lve.init(rawdata) });
		return;
	}

	// 전역 설정
	// 이는 객체의 지역설정으로도 쓰일 수 있음
	const
		initSetting = lve.root.vars.initSetting,
		data = lve.root.fn.adjustJSON(rawdata, initSetting);

	initSetting.scaleDistance = data.scaleDistance !== undefined ? data.scaleDistance : initSetting.scaleDistance; // 객체과의 일반적 거리
	initSetting.disappearanceSize = data.disappearanceSize !== undefined ? data.disappearanceSize : initSetting.disappearanceSize ? initSetting.disappearanceSize : 0.35; // 소멸 크기
	initSetting.disappearanceSight = data.disappearanceSight !== undefined ? data.disappearanceSight + initSetting.scaleDistance : undefined; // 소멸 시야
	initSetting.frameLimit = data.frameLimit !== undefined ? data.frameLimit : initSetting.frameLimit ? initSetting.frameLimit : 60; // 프레임 제한
	initSetting.backgroundColor = data.backgroundColor !== undefined ? data.backgroundColor : initSetting.backgroundColor ? initSetting.backgroundColor : 'white'; // 캔버스 배경색
	// 필수 선언
	// 이는 객체의 지역설정으로 쓰일 수 없음
	if (data.canvas) {

		let canvas;
		if (data.canvas instanceof HTMLElement) {
			canvas = data.canvas;
		}
		else canvas = document.querySelector(data.canvas);

		initSetting.canvas.context = canvas.getContext('2d');
		initSetting.canvas.element = canvas;
	}
	lve.root.fn.canvasReset();
	// 사용자 보조 선언
	initSetting.userExtendStart = data.extendStart || initSetting.userExtendStart;
	initSetting.userExtendEnd = data.extendEnd || initSetting.userExtendEnd;
	initSetting.userExtendDrawStart = data.extendDrawStart || initSetting.userExtendDrawStart;
	initSetting.userExtendDrawEnd = data.extendDrawEnd || initSetting.userExtendDrawEnd;
	// 시스템 보조 선언
	initSetting.success = true;

	if (!lve.root.vars.isStart) {
		const
			ce = initSetting.canvas.element,
			fn = lve.root.fn;

		// 캔버스 이벤트 할당
		ce.onclick =
			ce.ondblclick =
			ce.onmousemove =
			ce.onmousedown =
			ce.onmouseup = (e) => {
				fn.eventfilter(e);
			};

		setTimeout(() => {
			lve.root.cache.loseTime = performance.now();
			lve.root.vars.isStart = true;
			lve.root.fn.update();
		}, 1);
	}
	return true;
};

lve.pause = () => {
	if (lve.root.vars.isRunning) {
		lve.root.cache.pauseTime = performance.now();
		lve.root.vars.isRunning = false;
		for (let item of lve.root.vars.objects) {
			const playlistArr = ['video', 'sprite'];

			if (playlistArr.indexOf(item.type) == -1) continue;
			switch (item.type) {
				case 'video': {
					// 객체가 재생 중이었을 경우
					if (!item.element.paused && !item.element.ended) {
						item.element.pause();
						item.element.dataset.played = 'true';
					}
					break;
				}
				case 'sprite': {
					if (item.__system__.sprite_init.playing) {
						item.__system__.sprite_init.playing = false;
						item.element.dataset.played = 'true';
					}
					break;
				}
			}
		}
	}
};

lve.play = () => {
	if (!lve.root.vars.isRunning) {
		lve.root.cache.loseTime += (performance.now() - lve.root.cache.pauseTime);
		lve.root.vars.isRunning = true;
		lve.root.fn.update();

		for (let item of lve.root.vars.objects) {
			const playlistArr = ['video', 'sprite'];

			if (playlistArr.indexOf(item.type) == -1) continue;
			if (item.element.dataset.played !== 'true') continue;

			// 재생 중이던 객체였다면 재생
			switch (item.type) {
				case 'video': {
					item.element.play();
					delete item.element.dataset.played;
					break;
				}
				case 'sprite': {
					item.__system__.sprite_init.playing = 'true';
					delete item.element.dataset.played;
					break;
				}
			}
		}
	}
};

lve.fullScreen = (extend) => {
	// 캔버스 이벤트 등록
	const
		canvas_elem = lve.root.vars.initSetting.canvas.element,
		// 증가 비율이 짧은 면을 기준으로 잡음
		screenScale = [
			window.screen.width / canvas_elem.width,
			window.screen.height / canvas_elem.height
		].sort((a, b) => {
			return a - b;
		})[0],
		// 이벤트 함수
		fn_eventExit = () => {
			let isFullScreen = canvas_elem.getAttribute('data-fullscreen');
			// 현재 전체화면 모드라면
			if (isFullScreen) {
				canvas_elem.removeAttribute('data-fullscreen');

				if (extend) {
					canvas_elem.style.transform = '';
				}
				canvas_elem.removeEventListener('fullscreenchange', fn_eventExit);
				canvas_elem.removeEventListener('webkitfullscreenchange', fn_eventExit);
				canvas_elem.removeEventListener('mozscreenchange', fn_eventExit);
				canvas_elem.removeEventListener('msscreenchange', fn_eventExit);
			}
			// 진입 시
			else {
				canvas_elem.setAttribute('data-fullscreen', true);
				// 확장을 허용했을 시
				if (extend) {
					canvas_elem.style.transform = 'scale(' + screenScale + ')';
				}
			}
		};

	if (!canvas_elem || canvas_elem.getAttribute('data-fullscreen') == 'true') {
		return;
	}
	// 이벤트 등록
	canvas_elem.addEventListener('fullscreenchange', fn_eventExit);
	canvas_elem.addEventListener('webkitfullscreenchange', fn_eventExit);
	canvas_elem.addEventListener('mozscreenchange', fn_eventExit);
	canvas_elem.addEventListener('msscreenchange', fn_eventExit);

	try {
		canvas_elem.requestFullScreen();
	} catch (e) {
		try {
			canvas_elem.webkitRequestFullScreen();
		} catch (e) {
			try {
				canvas_elem.mozRequestFullScreen();
			} catch (e) {
				try {
					canvas_elem.msRequestFullScreen();
				} catch (e) {
					throw new Error('브라우저가 전체화면 기능을 지원하지 않습니다');
					return;
				}
			}
		}
	}
};

lve.data = (rawdata) => {
	if (!rawdata) return lve.root.vars;
	else {
		if (typeof rawdata != 'object') return;
		for (let i in rawdata) {
			lve.root.vars[i] = rawdata[i];
		}
		return rawdata;
	}
};

lve.calc = (_perspective, rawdata = {}) => {

	if (_perspective === undefined || typeof _perspective != 'number') {
		throw new Error('반드시 첫 번째 매개변수로 숫자를 넣어야 합니다.');
		return;
	}

	const
		data = lve.root.fn.adjustJSON(rawdata),
		rawDataObj = lve.root.fn.copyObject(data);

	const
		initSetting = lve.root.vars.initSetting,
		usingCamera = lve.root.vars.usingCamera,
		scaleDistance = usingCamera.scaleDistance || initSetting.scaleDistance;

	data.width = data.width || 0;
	data.height = data.height || 0;
	data.left = data.left || 0;
	data.bottom = data.bottom || 0;
	data.scale = data.scale || 1;
	data.perspective = _perspective;

	const
		virtualObject = { style: data, relative: {} },
		posPropArr = ['left', 'bottom'],
		constPropArr = ['rotate', 'opacity', 'gradientDirection', 'scale'];

	const calcPropObj = {}, NaNPropObj = {}, posPropObj = {}, constPropObj = {};

	for (let i in data) {
		if (isNaN(data[i] - 0) === true) {
			NaNPropObj[i] = data[i];
			delete data[i];
		}
	}

	for (let i in data) {
		if (posPropArr.indexOf(i) != -1) {
			posPropObj[i] = data[i];
			delete data[i];
		}
	}

	for (let i in data) {
		if (constPropArr.indexOf(i) != -1) {
			constPropObj[i] = data[i];
			delete data[i];
		}
	}

	Object.assign(calcPropObj, data);

	const compareProp = constPropObj.scale;
	const fixScale = compareProp / lve.root.fn.getRelativeSize(virtualObject, compareProp);

	for (let i in calcPropObj) {
		calcPropObj[i] *= fixScale;
	}

	// 좌표값 계산
	for (let i in posPropObj) {
		switch (i) {
			case 'left': {
				const
					centerpos = initSetting.canvas.element.width / 2,
					fixedLeft = posPropObj.left - centerpos;

				posPropObj.left = (fixedLeft * fixScale) + usingCamera.css('left')[0];
				break;
			}
			case 'bottom': {
				const
					centerpos = initSetting.canvas.element.height / 2,
					fixedBottom = posPropObj.bottom - centerpos;

				posPropObj.bottom = (fixedBottom * fixScale) + usingCamera.css('bottom')[0];
				break;
			}
		}
	};

	const retObj = {};
	// merge props
	Object.assign(retObj, NaNPropObj);
	Object.assign(retObj, calcPropObj);
	Object.assign(retObj, posPropObj);
	Object.assign(retObj, constPropObj);

	for (let i in retObj) {
		if (i in rawDataObj === false) {
			delete retObj[i];
		}
	}

	retObj.perspective = _perspective;
	return retObj;
};

// >= 2.3.0
lve.extend = (_method, _fn) => {
	lve.root.const.ObjectSession.prototype[_method] = _fn;
};

// > 2.6.0
lve.on = (e, fn) => {
	const events = lve.root.const.arr_event;

	if (e === undefined) {
		throw new Error(`이벤트리스너가 없습니다. 다음 중 한 가지를 필수로 선택해주세요. (${events.join(', ')})`);
		console.trace(this);
		return;
	}

	if (!fn) return;

	e = e.toLowerCase().split(' ');
	for (let event of e) {

		const
			eventRoomObj = lve.root.cache.globalEventKeyword,
			eventCanvasRoomObj = lve.root.cache.canvasEventKeyword;

		if (Array.isArray(eventRoomObj[event]) === false) {
			eventRoomObj[event] = [];
		}
		if (eventRoomObj[event].indexOf(fn) == -1) {
			eventRoomObj[event].push(fn);
		}
		// 캔버스 이벤트가 아닐 경우
		if (!eventCanvasRoomObj[event]) return;
		// canvasEventKeyword에 객체가 등록되어 있지 않을 경우
		if (eventCanvasRoomObj[event].indexOf(item) == -1) {
			eventCanvasRoomObj[event].push(item);
			eventCanvasRoomObj[event].sort((_a, _b) => {
				return _a.style.perspective - _b.style.perspective;
			});
		}
	}
};

// >= 2.6.0
lve.off = (e, fn) => {
	const events = lve.root.const.arr_event;

	if (e === undefined) {
		throw new Error(`이벤트가 없습니다. 다음 중 한 가지를 필수로 선택해주세요. (${events.join(', ')})`);
		console.trace(this);
		return;
	}

	e = e.toLowerCase().split(' ');
	for (let event of e) {
		const eventRoomObj = lve.root.cache.globalEventKeyword;
		if (fn) {
			const index = eventRoomObj[event].indexOf(fn);
			if (index === -1) return;
			eventRoomObj[event].splice(index, 1);
		}
		else {
			eventRoomObj[event] = undefined;
		}
	}
};

/*  밀봉 - 객체에 새로운 속성을 추가/제거할 순 없으나, 기존 속성의 값을 수정할 수 있음
 *  동결 - 객체에 새로운 속성의 추가/제거/수정할 수 없음. 불변화 (상수화)
 *
 *  시스템 변수를 보호하여 사용자가 조작할 수 없도록 설정
 */
Object.seal(lve); // 밀봉
Object.seal(lve.root); // 밀봉
Object.seal(lve.root.vars); // 밀봉
Object.seal(lve.root.cache); // 밀봉
Object.freeze(lve.root.const); // 동결
Object.freeze(lve.root.fn); // 동결