/* Linoaca Visualnovel Engine
 * version 1.4.1
 * Made by izure@naver.com | "LVE.js (C) izure@naver.com 2016. All rights reserved."
 * http://linoaca.com, http://blog.linoaca.com
 *
 * How to use?
 * → http://blog.linoaca.com
 */

'use strict';

var lve = function(name){
	var	retArray = [];

	// 문자열로 검색할 때
	// ex.
	// lve("[USING_CAMERA]")
	if (typeof name == "string"){
		// 특수선택자 처리
		switch(name){
			case "*":
				retArray = lve_root.vars.arr_object;
				break;

			case "[USING_SCENE]":
				retArray = lve_root.vars.arr_scene[lve_root.vars.usingCamera.scene];
				break;

			case "[USING_CAMERA]":
				retArray = [lve_root.vars.usingCamera];
				break;

			default:
				retArray = lve_root.vars.selectorKeyword[name];
				break;
		}
	}

	/* 변수로 검색할 때
	 * ex. lve(DOMElement)
	 */
	else{
		// session으로 검색했을 때
		if (name.context){
			retArray = name.context;
			name = name.name;
		}
		// 객체로 검색했을 때
		else{
			retArray = [name];
			name = name.name;
		}
	}

	return new lve.fn.session(name, retArray);
},

/* lve_root
 * lve의 설정이 이곳에 저장됨
 * 사용자 선언 함수도 이곳에 저장됨
 */
lve_root = {
	vars: {
		isStart: !1,
		isNeedSort: !1,
		isRunning: !0,
		primary: 1,
		arr_object: [], // 객체 정보
		arr_scene: {}, // 객체 정보 - 해당 씬에 담겨있는 객체
		arr_callback: [], // 콜백 스택 - callback함수를 저장하는 변수
		arr_type: ["camera", "image", "circle", "square", "text", "video"], // 객체 속성
		arr_event: ["animatestart", "animateend", "animatestop", "cssModified", "attrModified", "follow", "unfollow", "followed", "unfollowed", "kick", "kicked", "play", "pause", "ended"], // 객체 이벤트
		initSetting: {}, // 초기 설정
		usingCamera: {}, // 사용중인 카메라
		selectorKeyword: {}, // 선택자. 객체 생성시 name을 키값으로 저장됨
		version: "1.4.1" // lve.js 버전
	},
	fn: {
		// 프레임이 업데이트 될 때
		// 1초에 60번 작동
		update: function(progress){
			var vars = lve_root.vars,
				initSetting = vars.initSetting,

				canvas = initSetting.canvas,
				ctx = lve_root.vars.initSetting.canvas.context,
				canvas_elem = ctx.canvas,

				usingCamera = vars.usingCamera,
				arr_object = vars.arr_object,
				arr_scene = vars.arr_scene[usingCamera.scene] || 0,

				interval = 1000 / (usingCamera.frameLimit || initSetting.frameLimit),
				now = Date.now(),
				deltaTime = now - vars.now,

				isNeedSort = Number(vars.isNeedSort),
				isNeedDraw = !1,
				isDrawFrame = deltaTime > interval;


			// update 재귀호출
			if (vars.isRunning)
				window.requestAnimationFrame(lve_root.fn.update);

			// 설정 갱신
			if (isDrawFrame) {
				// 프레임 초기화
				ctx.globalAlpha = 1;
				ctx.fillStyle = usingCamera.backgroundColor || initSetting.backgroundColor;
				ctx.fillRect(0, 0, canvas_elem.width, canvas_elem.height);
				// frameLimit 갱신
				lve_root.vars.now = now - (deltaTime % interval);
			}
			
			// 해당 씬의 모든 객체 순회
			// 다른 씬의 객체는 처리하지 않음
			for (var i = 0, length = arr_object.length; i < length; i++){
				var	item = arr_object[i], // 해당 객체
					attr_translateend = 0, // 해당 객체의 animated된 속성 갯수를 저장할 변수
					attr_Length = item.ani_init.count_max ? Object.keys(item.ani_init.count_max).length : 0; // 해당 객체의 속성 갯수

				// 해당 객체가 animating이 아닐 시 제외
				if (!item.ani_init.count_max)
					continue;

				// 해당 객체가 animating일 경우
				// j를 객체 속성으로 잡음
				
				for (var j in item.ani_init){
					var item_style = item.style[j],
						item_ani_init = item.ani_init,
						item_ani_init_tar = item_ani_init[j];

					// 해당 속성이 animating 아닐 시 예외
					if (item_ani_init_tar === undefined)
						continue;

					// 해당 속성에 animate값 저장
					if (
						item_ani_init_tar != item_ani_init.origin[j] &&
						item_ani_init.count[j] < item_ani_init.count_max[j]
					){
						isNeedDraw = !0;
						item.style[j] = item.getEasingData(j);
						item_ani_init.count[j]++;
					}
					
					// style.perspective 값이 변경되었을 시
					// isNeedSort 설정
					if (item_ani_init_tar != item_ani_init.origin[j] && item_ani_init.count[j] < item_ani_init.count_max[j]) {
						// 움직인 것이 카메라일 경우는 예외
						isNeedSort += item.type != "camera" ? 1 : 0;
					}

					// 객체의 해당 속성이 animated 되었을 때
					if (item_ani_init.count[j] >= item_ani_init.count_max[j]) {
						item.style[j] = item_ani_init_tar !== undefined ? item_ani_init_tar : item_style;
						attr_translateend++;

						// animating 속성을 없앰으로써 다시 animated로 체크되는 일이 없도록 예외처리
						delete item_ani_init[j];
					}

					// 해당 객체가 모든 속성이 animated 되었을 때
					if (attr_translateend >= attr_Length){
						// animateend 이벤트 발생
						item.ani_init = {};
						lve(item).emit("animateend");
					}
				};
			}

			// 프레임 제한
			if (isDrawFrame) {
				// z값이 변경되었을 시 재정렬
				if (isNeedSort){
					vars.isNeedSort = !1;
					arr_object.sort(function(a, b){
						return parseFloat(b.style.perspective) - parseFloat(a.style.perspective);
					});
				}

				// 사물 그려넣기
				for (var j = 0, length = arr_scene.length; j < length; j++){
					var item = arr_scene[j];
					// 현재 카메라가 있는 현장의 사물만 그리기
					item.draw();
				}
			}

			// 콜백함수 체크
			var j = vars.arr_callback.length;
			while (j--){
				var e = vars.arr_callback[j];

				if (e.count > 0)
					e.count--;
				else {
					vars.arr_callback.splice(j, 1);
					e.fn(e.target);
				}
			}

			// 사용자가 초기설정시 extend 옵션을 사용했을 시
			if (!!initSetting.userExtend && typeof initSetting.userExtend == "function")
				initSetting.userExtend();
		},

		adjustProperty: function(data){
			return (data + "").replace(/-.|[A-Z](?=[a-z])/gm, function(v){
				return "[" + v + "]";
			}).toLowerCase().replace(/\[.\]/gmi, function(v){
				return v.substr(1, 1).toUpperCase();
			});
		},

		adjustJSON: function(data){
			// 새로운 객체로 생성
			var tmp_data = JSON.parse(JSON.stringify(data));

			// 모든 스타일 parseFloat화 시키기
			for (var i in tmp_data){
				var data_origin = data[i];

				delete tmp_data[i];

				// "-" 제거
				// font-size | FONT-SIZE -> fontSize
				i = lve_root.fn.adjustProperty(i);
				tmp_data[i] = isNaN(parseFloat(data_origin)) ? data_origin : parseFloat(data_origin);
			}

			return tmp_data;
		},

		canvasReset: function (opacity = 1) {
			var ctx = lve_root.vars.initSetting.canvas.context;

			ctx.restore();
			ctx.save();
			ctx.beginPath();

			ctx.globalAlpha = opacity;
		},

		getRelativeSize: function (tarObj, tarObj_size) {
			var cameraObject = lve_root.vars.usingCamera,
				scaleDistance = lve_root.vars.usingCamera.scaleDistance || lve_root.vars.initSetting.scaleDistance;

			return tarObj_size * scaleDistance / (tarObj.style.perspective - cameraObject.style.perspective);
		},

		getRelativePosition: function (tarObj, direction) {
			var pt_center, // 캔버스의 중앙 - 캔버스 그리기 시작 위치
				pt_fix, // 객체 자신을 그리기 중점 - pt_center - (width / 2) || (height / 2)
				camera_height, // 카메라 높이
				n,

				cameraObject = lve_root.vars.usingCamera,
				scaleDistance = lve_root.vars.usingCamera.scaleDistance || lve_root.vars.initSetting.scaleDistance,
				canvas_elem = lve_root.vars.initSetting.canvas.context.canvas; // Nagative. top이 아니라, bottom으로 인한 반전값

			// direction이 left일 경우
			if (direction == "left"){
				pt_center = canvas_elem.width / 2;
				pt_fix = tarObj.relative.width / 2;
				camera_height = 0;
				n = 1;
			}
			// direction이 bottom일 경우
			else {
				pt_center = canvas_elem.height / 2;
				pt_fix = tarObj.relative.height;
				camera_height = cameraObject.style.height;
				n = -1;
			}

			// 직관적인 변수명 재명시
			var target_originPosition = tarObj.style[direction],
				camera_originPosition = cameraObject.style[direction],
				target_originRotate = tarObj.style.rotate,
				camera_originRotate = cameraObject.style.rotate,
				target_relativeScale = scaleDistance / tarObj.relative.perspective,

				// perspective에 따른 relative position 계산
				target_gap_position = target_originPosition - camera_originPosition - camera_height,
				target_gal_relative = n * target_gap_position * target_relativeScale,
				target_relativePosition = pt_center - pt_fix + target_gal_relative;

			return target_relativePosition;
		},

		preloadData: function(tarObj, tag, callback){
			var tmpObj = document.createElement(tag);

			tmpObj.onload = function(){
				callback(tarObj, this);
			};

			tmpObj.src = tarObj.src;
		}
	}
};


/* lve 전역 설정
 *
 * 이곳에서 전역설정한 설정은, 각 객체마다 지역설정보다 우선하지 않습니다
 * 예를 들어, 전역설정으로 disappearanceSight를 10으로 설정했고,
 * 'TEST1'이라는 카메라 객체의 disappearanceSight를 15로 설정했을 시, 'TEST1' 카메라의 설정이 우선됩니다
 *
 * 그 외, 객체에 지역설정이 되어있지 않을 시, 전역설정을 따릅니다
 */

lve.init = function (data) {
	// 전역 설정
	// 이는 객체의 지역설정으로도 쓰일 수 있음
	data = lve_root.fn.adjustJSON(data);
	var initSetting = lve_root.vars.initSetting;

	lve_root.vars.now = Date.now();

	initSetting.scaleDistance = data.scaleDistance !== undefined ? data.scaleDistance : initSetting.scaleDistance ? initSetting.scaleDistance : 150; // 객체과의 일반적 거리
	initSetting.disappearanceSize = data.disappearanceSize !== undefined ? data.disappearanceSize : initSetting.disappearanceSize ? initSetting.disappearanceSize : undefined; // 소멸 크기
	initSetting.disappearanceSight = data.disappearanceSight !== undefined ? data.disappearanceSight + initSetting.scaleDistance : undefined; // 소멸 시야
	initSetting.frameLimit = data.frameLimit !== undefined ? data.frameLimit : initSetting.frameLimit ? initSetting.frameLimit : 60; // 프레임 제한
	initSetting.backgroundColor = data.backgroundColor !== undefined ? data.backgroundColor : initSetting.backgroundColor ? initSetting.backgroundColor : "white"; // 캔버스 배경색

	// 필수 선언
	// 이는 객체의 지역설정으로 쓰일 수 없음
	initSetting.canvas = initSetting.canvas || {};
	initSetting.canvas.context = data.canvas !== undefined ? data.canvas.getContext("2d") : initSetting.canvas.context ? initSetting.canvas.context : undefined;

	lve_root.fn.canvasReset();

	// 사용자 보조 선언
	initSetting.userExtend = data.extend;

	// 시스템 보조 선언
	initSetting.success = !0;

	if (!lve_root.vars.isStart) {
		lve_root.vars.isStart = !0;
		lve_root.fn.update(0);
	}

	return !0;
},

lve.reltofix = function (p) {
	var initSetting = lve_root.vars.initSetting,
		canvas = initSetting.canvas.context.canvas,
		left = (canvas.width / 2) - p,
		bottom = (canvas.height / 2) - p;

	return {
		left: left, bottom: bottom
	};
},

lve.pause = function () {
	var vars = lve_root.vars,
		arr_object = vars.arr_object;

	vars.isRunning = !1;

	for (var i in arr_object) {
		var item = arr_object[i],
			item_elem = item.element;

		// 재생이 가능한 객체일 경우
		if (typeof item_elem.play != "function")
			continue;

		// 객체가 재생 중이었을 경우
		else if (!item_elem.paused && !item_elem.ended) {
			// 객체 일시중지
			item_elem.pause();
			item_elem.setAttribute("data-played", true);
		}
	}
},

lve.play = function () {
	var vars = lve_root.vars,
		arr_object = vars.arr_object;

	// 게임이 정지되어 있었을 경우 재생
	if (!vars.isRunning) {
		vars.isRunning = !0;
		lve_root.fn.update(vars.progress);

		for (var i in arr_object) {
			var item = arr_object[i],
				item_elem = item.element;

			// 재생이 가능한 객체일 경우
			if (typeof item_elem.play != "function")
				continue;

			// 재생 중이던 객체였는가
			var isPlayed = item_elem.getAttribute("data-played");

			if (isPlayed) {
				// 객체 일시중지
				item_elem.play();
				item_elem.removeAttribute("data-played");
			}
		}
	}
},

lve.fullScreen = function (extend) {
	// 캔버스 이벤트 등록
	var canvas = lve_root.vars.initSetting.canvas.context.canvas,
		// 증가 비율이 짧은 면을 기준으로 잡음
		screenScale = [
			window.screen.availWidth / canvas.width,
			window.screen.availHeight / canvas.height
		].sort(function (a, b) {
			return a - b;
		})[0],

		// 이벤트 함수
		fn_eventExit = function () {
			var isFullScreen = canvas.getAttribute("data-fullscreen");

			// 현재 전체화면 모드라면
			if (isFullScreen) {
				canvas.removeAttribute("data-fullscreen");

				if (extend)
					canvas.style.transform = "";

				canvas.removeEventListener("fullscreenchange", fn_eventExit);
				canvas.removeEventListener("webkitfullscreenchange", fn_eventExit);
				canvas.removeEventListener("mozscreenchange", fn_eventExit);
				canvas.removeEventListener("msscreenchange", fn_eventExit);
			}
				// 진입 시
			else {
				canvas.setAttribute("data-fullscreen", true);

				// 확장을 허용했을 시
				if (extend)
					canvas.style.transform = "scale(" + screenScale + ")";
			}
		};

	if (!canvas || canvas.getAttribute("data-fullscreen") == "true")
		return !1;

	// 이벤트 등록
	canvas.addEventListener("fullscreenchange", fn_eventExit);
	canvas.addEventListener("webkitfullscreenchange", fn_eventExit);
	canvas.addEventListener("mozscreenchange", fn_eventExit);
	canvas.addEventListener("msscreenchange", fn_eventExit);

	try {
		canvas.requestFullScreen();
	} catch (e) {
		try {
			canvas.webkitRequestFullScreen();
		} catch (e) {
			try {
				canvas.mozRequestFullScreen();
			} catch (e) {
				try {
					canvas.msRequestFullScreen();
				} catch (e) {
					return !1;
				}
			}
		}
	}
},

lve.data = function (data) {
	if (!data)
		return lve_root.vars;
	else {
		if (typeof data != "object")
			return !1;

		var member = Object.keys(data);

		for (var i in member) {
			var keyword = member[i];

			lve_root.vars[keyword] = data[keyword];
		}

		return data;
	}
},

lve.calc = function(data = {}){
	
	data = lve_root.fn.adjustJSON(data);

	var tmp_data = JSON.parse(JSON.stringify(data)),
		// 전역변수 지역화
		vars = lve_root.vars,
		initSetting = vars.initSetting,
		usingCamera = vars.usingCamera,
		scaleDistance = (usingCamera.scaleDistance || initSetting.scaleDistance);

	data.perspective = data.perspective === undefined ? scaleDistance : data.perspective === 0 ? 0 : data.perspective;
	data.width = data.width || 0;
	data.height = data.height || 0;
	data.left = data.left || 0;
	data.bottom = data.bottom || 0;

	// 반환값
	var ret = {},
		// 임시 변수들
		tmp_ret = {},
		tmp_object = {
			style: data,
			relative: {}
		},
		// getRelativePosition 리스트
		arr_positionList = ["left", "bottom"],
		// 상수 속성 리스트
		arr_fixedProp = ["rotate", "opacity"],

		_getRelativeSize = lve_root.fn.getRelativeSize;

	// getRelativeSize 실행
	// isNaN 값 제외
	for (var i in data){
		var isPosition = arr_positionList.indexOf(i) != -1;

		if (!isPosition)
			// 숫자식만 계산함
			if (!isNaN(
				parseFloat(data[i])
			))
				tmp_ret[i] = _getRelativeSize(tmp_object, data[i]);
			// 숫자식이 아닐 경우
			else
				tmp_ret[i] = data[i];
		else
			tmp_ret[i] = data[i];
	}

	// getRelativeSize와 사용자의 요청값을 비교하여 증감 비율 구하기
	var compare_option = Object.keys(tmp_ret)[0],
		fixScale = data[compare_option] / tmp_ret[compare_option];

	// 좌표값이 아닌 속성값을 증감 비율에 따라 보정
	for (var i in tmp_ret){
		var isPosition = arr_positionList.indexOf(i) != -1;

		if (!isPosition)
			// 숫자식만 계산함
			if (!isNaN(
				parseFloat(tmp_ret[i])
			))
				tmp_ret[i] *= fixScale * fixScale;
	}

	var canvas_elem = initSetting.canvas.context.canvas;

	// 좌표값 적용
	arr_positionList.forEach(function(i){
		tmp_ret[i] *= fixScale;
	});

	// 사용자가 요청한 속성만 담음
	for (var i in tmp_data)
		ret[i] = tmp_ret[i];

	// 상수 속성 수치 보정
	arr_fixedProp.forEach(function(i){
		if (tmp_ret[i] !== undefined)
			ret[i] = tmp_data[i];
	});

	// 사용자가 등록한 perspective값 등록
	ret.perspective = data.perspective;

	return ret;
},

/* 레퍼런스된 lve에 시스템이 접근할 함수들
 * 사용자는 접근할 수 없음
 */
lve.fn = {
	/* selector = 사용자가 검색하고자 하는 객체의 name (String type)
	 * context = 검색된 객체 리스트 (Array type)
	 */
	session: function(selector, context){
		this.name = selector;
		this.context = context;
	}
};

lve.fn.session.prototype.getEasingData = function(attr){

	// animating이 아닌 객체이거나, 속성 매개변수가 넘어오지 않았을 시
	if (!this.ani_init.count_max || !attr)
		return !1;

	var	tar = this.ani_init.origin[attr],
		tar_goal = this.ani_init[attr];

	// 존재하지 않는 속성일 경우
	if (tar === undefined || tar_goal === undefined)
		return !1;

	// t: current time, b: begInnIng value, c: change In value, d: duration
	var	t = this.ani_init.count[attr] * 1000 / 60 || 1,
		b = tar,
		c = tar_goal - tar,
		d = this.ani_init.duration[attr] || 1,
		easing = this.ani_init.easing[attr] || "linear";

	switch(easing){
		case "linear":
			return c*t/d + b;
		case "easeInQuad":
			t /= d;
			return c*t*t + b;
		case "easeOutQuad":
			t /= d;
			return -c * t*(t-2) + b;
		case "easeInOutQuad":
			t /= d/2;
			if (t < 1) return c/2*t*t + b;
			t--;
			return -c/2 * (t*(t-2) - 1) + b;
		case "easeInCubic":
			t /= d;
			return c*t*t*t + b;
		case "easeOutCubic":
			t /= d;
			t--;
			return c*(t*t*t + 1) + b;
		case "easeInOutCubic":
			t /= d/2;
			if (t < 1) return c/2*t*t*t + b;
			t -= 2;
			return c/2*(t*t*t + 2) + b;
		case "easeInQuart":
			t /= d;
			return c*t*t*t*t + b;
		case "easeOutQuart":
			t /= d;
			t--;
			return -c * (t*t*t*t - 1) + b;
		case "easeInOutQuart":
			t /= d/2;
			if (t < 1) return c/2*t*t*t*t + b;
			t -= 2;
			return -c/2 * (t*t*t*t - 2) + b;
		case "easeInQuint":
			t /= d;
			return c*t*t*t*t*t + b;
		case "easeOutQuint":
			t /= d;
			t--;
			return c*(t*t*t*t*t + 1) + b;
		case "easeInOutQuint":
			t /= d/2;
			if (t < 1) return c/2*t*t*t*t*t + b;
			t -= 2;
			return c/2*(t*t*t*t*t + 2) + b;
		case "easeInSine":
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		case "easeOutSine":
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		case "easeInOutSine":
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		case "easeInExpo":
			return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
		case "easeOutExpo":
			return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
		case "easeInOutExpo":
			t /= d/2;
			if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
			t--;
			return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
		case "easeInCirc":
			t /= d;
			return -c * (Math.sqrt(1 - t*t) - 1) + b;
		case "easeOutCirc":
			t /= d;
			t--;
			return c * Math.sqrt(1 - t*t) + b;
		case "easeInOutCirc":
			t /= d/2;
			if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			t -= 2;
			return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
	}
};



/* 객체 prototype을 지정함
 * selector에 배열화로 담겨져있는 객체는 for문을 돌며 처리
 * 그 외 객체는 일반적으로 해결
 */

lve.fn.session.prototype.create = function(data){
	if (!data.type){
		console.error("type속성은 객체 필수 속성입니다. 다음 중 한 가지를 필수로 선택해주세요. (" + lve_root.vars.arr_type.join(", ") + ")");
		return !1;
	} else if (lve_root.vars.arr_type.indexOf(data.type.toLowerCase()) == -1){
		console.error("존재하지 않는 type속성입니다. 이용할 수 있는 type속성은 다음과 같습니다. (" + lve_root.vars.arr_type.join(", ") + ")");
		return !1;
	}

	data = lve_root.fn.adjustJSON(data);


	var self = this,
		arr_autoList = {
			text: ["width"],
			image: ["width", "height"]
		},
		vars = lve_root.vars;

	this.primary = lve_root.vars.primary++;
	this.type = data.type.toLowerCase();
	this.scene = data.scene || "main";
	this.src = data.src;
	this.text = data.text;
	this.follow_init = {
		follower: [],
		following: undefined,
		relative: {}
	};
	this.style = {
		fontSize: 10,
		fontFamily: 'arial, sans-serif',
		fontWeight: "normal",
		fontStyle: "normal",
		textAlign: "left",
		width: this.type == "camera" ? 0 : 10,
		height: this.type == "camera" ? 0 : 10,
		color: "black",
		borderWidth: 0,
		borderColor: "black",
		shadowColor: undefined,
		shadowBlur: 10,
		shadowOffsetX: 0,
		shadowOffsetY: 0,
		position: "absolute",
		bottom: 0,
		left: 0,
		perspective: data.type == "camera" ? 0 : (vars.usingCamera.scaleDistance || vars.initSetting.scaleDistance),
		opacity: 1,
		rotate: 0
	};
	this.events = {};
	this.element = {};


	// arr_autoList 보정
	for (var i in arr_autoList){
		if (self.type == i){
			var arr_prop = arr_autoList[i];

			for (var j in arr_prop)
				self.style[arr_prop[j]] = "auto";

			break;
		}
	}

	// 객체 이벤트 준비
	// 객체 preload
	if (!!this.src) {
		switch(this.type){
			case "image":{
				var callback = function(self, element){
					self.element = element;

					if (self.style.width == "auto")
						self.style.width = element.width || 10;

					if (self.style.height == "auto")
						self.style.height = element.height || 10;
				};

				lve_root.fn.preloadData(this, "img", callback);
				break;
			}

			case "video":{
				this.element = document.createElement("video");
				this.element.src = this.src;
				this.element.onended = function(){
					lve(self).emit("ended");
				};

				break;
			}
		}
	}

	// 객체에 event룸 생성
	for (var i in vars.arr_event)
		this.events[vars.arr_event[i]] = [];

	// 객체화시키기 위해 session.context속성 지우기
	delete this.context;


	// 객체 좌표
	this.relative = {}; // 카메라 시점에 따라 변화되어 실질적으로 유저가 보는 위치
	// 객체가 animating일 시, 정보 임시저장 변수 
	this.ani_init = {};

	// 씬이 없을 경우 생성
	if (!vars.arr_scene[this.scene])
		vars.arr_scene[this.scene] = [];

	// 객체정보배열에 저장
	vars.arr_object.push(this);
	vars.arr_scene[this.scene].push(this);

	// 객체정보배열 재정렬
	vars.isNeedSort = !0;
	

	// 객체 생성시
	// selectorKeyword에 등록하여 선언 시 좀 더 빠른 검색
	if (!vars.selectorKeyword[this.name])
		vars.selectorKeyword[this.name] = [];

	vars.selectorKeyword[this.name].push(this);
	// primary= 특수선택자 객체정보배열 생성
	vars.selectorKeyword["[PRIMARY=" + this.primary + "]"] = [this];

	return lve(this);
};


lve.fn.session.prototype.attr = function(data){
	if (!data)
		return !1;

	// 속성 적용
	if (typeof data == "object"){
		data = lve_root.fn.adjustJSON(data);

		for (var i = 0, length = this.context.length; i < length; i++){
			var item = this.context[i];

			for (var j in data){
				item[j] = data[j];

				// src 속성이었을 경우
				if (j == "src" && item.type == "image")
					lve_root.fn.preloadData(item, "img", function(self, element){
						self.element = element;
					});
			}

			lve(item).emit("attrModified");
		}

		return this;
	}

	// 속성 반환
	else if (typeof data == "string")
		return this.context[0][lve_root.fn.adjustProperty(data)];
};


lve.fn.session.prototype.css = function(data){
	if (!data)
		return this.style;

	// 속성 적용
	if (typeof data == "object"){
		data = lve_root.fn.adjustJSON(data);

		// absolute, fixed 이외의 position 속성값을 가질 경우
		if (
			data.position !== undefined &&
			data.position != "absolute" &&
			data.position != "fixed"
		){
			console.error("position:" + data.position + "은 사용할 수 없는 속성입니다. 사용할 수 있는 속성은 다음과 같습니다. (absolute, fixed) 기본값은 absolute입니다.");
			return !1;
		}

		for (var i = 0, length = this.context.length; i < length; i++){
			var item = this.context[i];

			for (var j in data)
				item.style[j] = data[j] !== undefined ? data[j] : item.style[j];

			lve(item).emit("cssModified");
		}

		return this;
	}

	// 속성 반환
	else if (typeof data == "string")
		return this.context[0].style[lve_root.fn.adjustProperty(data)];
};

lve.fn.session.prototype.draw = function(){
	var vars = lve_root.vars,
		initSetting = vars.initSetting,

		canvas = lve_root.vars.initSetting.canvas,
		ctx = canvas.context,
		canvas_elem = ctx.canvas,

		usingCamera = vars.usingCamera,
		style = this.style,
		relative = this.relative,

		// 설정값 우선순위로 받아오기 (usingCamera -> initSetting)
		scaleDistance = usingCamera.scaleDistance || initSetting.scaleDistance,
		disappearanceSize = usingCamera.disappearanceSize || initSetting.disappearanceSize,
		disappearanceSight = usingCamera.disappearanceSight || initSetting.disappearanceSight;

	/* 지역 함수
	 * _getRelativeSize : perspective에 따른 객체 크기 반환 (this.relative.width || this.relative.height)
	 * _getRelativePosition : perspective에 따른 객체 위치 반환 (this.relative.left || this.relative.bottom)
	 */
	var _getRelativeSize = lve_root.fn.getRelativeSize,
		_getRelativePosition = lve_root.fn.getRelativePosition;


	lve_root.fn.canvasReset();

	if (!usingCamera)
		return !1;

	// 1차 사물 그리기 예외 처리
	if (
		this.type == "camera" || // camera타입
		this.type == "image" && !this.src || // image타입이며 url이 지정되지 않음
		this.type == "video" && !this.src || // video타입이며 url이 지정되지 않음
		this.src && this.element === {} || // src 속성을 가지고 있으나 로드되지 않음
		!this.src && !style.color || // src 속성이 없으며 color가 지정되지 않음
		this.type == "text" && !this.text || // text타입이면서 text가 지정되지 않음
		this.type == "text" && !style.fontSize || // text타입이면서 fontSize가 지정되지 않았거나 0보다 작을 때
		!style.opacity || // 투명도가 0일 경우
		!style.width || // width 가 0일 경우
		!style.height // height 가 0일 경우
	)
		return !1;


	/* 캔버스 text타입
	 * width가 선언되지 않았을 시 자동으로 받아오기
	 * 이는 최초 1회만 실행된다
	 */
	if (this.type == "text" && style.width == "auto"){
		ctx.font = style.fontStyle + " " + style.fontWeight + " " + style.fontSize + "px " + style.fontFamily;
		ctx.fillStyle = "transparent";

		style.width = ctx.measureText(this.text).width;
		style.width_tmp = "auto";
	}


	// 카메라에서 보일 상대적 위치 생성
	// position속성값이 fixed일 시 relative 값 고정
	if (style.position == "absolute"){
		relative.perspective = style.perspective - usingCamera.style.perspective;
		relative.fontSize = _getRelativeSize(this, style.fontSize);
		relative.borderWidth = _getRelativeSize(this, style.borderWidth);
		relative.shadowBlur = _getRelativeSize(this, style.shadowBlur);
		relative.shadowOffsetX = _getRelativeSize(this, style.shadowOffsetX);
		relative.shadowOffsetY = _getRelativeSize(this, style.shadowOffsetY);
		relative.width = _getRelativeSize(this, style.width);
		relative.height = _getRelativeSize(this, style.height || 1);
		relative.left = _getRelativePosition(this, "left");
		relative.bottom = _getRelativePosition(this, "bottom");
	} else{
		relative.perspective = style.perspective;
		relative.fontSize = style.fontSize;
		relative.borderWidth = style.borderWidth;
		relative.shadowBlur = style.shadowBlur;
		relative.shadowOffsetX = style.shadowOffsetX;
		relative.shadowOffsetY = style.shadowOffsetY;
		relative.width = style.width;
		relative.height = style.height;
		relative.left = style.left;
		relative.bottom = canvas_elem.height - (style.bottom + style.height);
	}


	if (style.width_tmp == "auto"){
		style.width = "auto";
		delete style.width_tmp;
	}


	// 2차 사물 그리기 예외처리
	if (
		relative.left + relative.width < 0 || // 화면 왼쪽으로 빠져나감
		relative.left - relative.width > canvas_elem.width || // 화면 오른쪽으로 빠져나감
		relative.bottom + relative.height < 0 || // 화면 아래로 빠져나감
		relative.bottom - relative.height > canvas_elem.height || // 화면 위로 빠져나감
		relative.width <= 0 || //  width가 0보다 작을 때
		relative.height <= 0 || // height가 0보다 작을 때
		relative.width < disappearanceSize || // width가 소멸크기보다 작음
		relative.height < disappearanceSize || // height가 소멸크기보다 작음
		disappearanceSight !== undefined && relative.perspective > disappearanceSight // 소멸거리 지정 시 소멸거리보다 멀리있음
	)
		return !1;
		


	// 투명도 설정 (Opacity)
	ctx.globalAlpha = style.opacity;
	// 회전도 설정 (Rotate)
	//ctx.rotate(this.style.rotate * Math.PI / 180);


	switch(this.type){
		case "image":
			var imageObj = this.element;

			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			ctx.rect(relative.left, relative.bottom, relative.width, relative.height);
			ctx.fill();

			lve_root.fn.canvasReset(style.opacity);

			ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
			ctx.strokeStyle = style.borderColor;
			ctx.lineWidth = relative.borderWidth;

			if (style.borderWidth)
				ctx.stroke();

			try{
				ctx.drawImage(imageObj, relative.left, relative.bottom, relative.width, relative.height);
			} catch(e){};

			break;

		case "circle":
			canvas.context.fillStyle = style.color;

			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			ctx.arc(relative.left + relative.width / 2, relative.bottom + relative.width / 2, relative.width / 2, 0, Math.PI * 2);
			ctx.fill();

			lve_root.fn.canvasReset(style.opacity);

			ctx.arc(relative.left + relative.width / 2, relative.bottom + relative.width / 2, relative.width / 2 + relative.borderWidth / 2, 0, Math.PI * 2);
			ctx.strokeStyle = style.borderColor;
			ctx.lineWidth = relative.borderWidth;

			if (style.borderWidth)
				ctx.stroke();

			break;

		case "square":
			ctx.fillStyle = style.color;

			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			ctx.rect(relative.left, relative.bottom, relative.width, relative.height);
			ctx.fill();

			lve_root.fn.canvasReset(style.opacity);

			ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
			ctx.strokeStyle = style.borderColor;
			ctx.lineWidth = relative.borderWidth;

			if (style.borderWidth)
				ctx.stroke();

			break;

		case "text":
			var fix_textAlignLeft = relative.width / 2;

			ctx.font = style.fontStyle + " " + style.fontWeight + " " + relative.fontSize + "px " + style.fontFamily;
			ctx.fillStyle = style.color;
			ctx.textAlign = style.textAlign;

			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			ctx.strokeStyle = style.borderColor;
			ctx.lineWidth = relative.borderWidth;

			if (style.borderWidth)
				ctx.strokeText(this.text, relative.left + fix_textAlignLeft, relative.bottom, relative.width);

			ctx.fillText(this.text, relative.left + fix_textAlignLeft, relative.bottom, relative.width);
			break;

		case "video":
			var videoObj = this.element;

			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			ctx.rect(relative.left, relative.bottom, relative.width, relative.height);
			ctx.fill();

			lve_root.fn.canvasReset(style.opacity);

			ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
			ctx.strokeStyle = style.borderColor;
			ctx.lineWidth = relative.borderWidth;

			if (style.borderWidth)
				ctx.stroke();

			try{
				ctx.drawImage(videoObj, relative.left, relative.bottom, relative.width, relative.height);
			} catch(e){};
			
			break;
	}
};

// 해당 객체를 카메라로 사용함
// 다른 카메라는 계속 작동 함
// 여러대의 객체가 선택되었을 시 가장 최초 객체를 선택
/* [!] 주의사항
 * .use() 메서드는 카메라뿐 아니라 사물 역시 카메라처럼 사용할 수 있습니다
 * 다만 사물을 카메라처럼 이용할 경우, z값 변동으로 인한 객체들의 z-index 재정렬이 이루어집니다
 * 이는 사물이 적을 시 큰 문제가 되진 않습니다. 하지만 사물이 많아질수록 성능이 급격히 저하됩니다
 */
lve.fn.session.prototype.use = function(){
	lve_root.vars.usingCamera = Array.isArray(this.context) ? this.context[0] : this.context;
	return lve(lve_root.vars.usingCamera);
};

// 객체가 해당 사물을 쫒음
// 객체가 현재 위치를 직접 이동함
// 여러대의 객체가 선택되었을 시 가장 최초 객체를 선택
lve.fn.session.prototype.follow = function(tarObjName, relativePosition){
	var	tarObj = lve(tarObjName),
		relativePosition = relativePosition || {};

	// 없는 객체일 경우
	if (!tarObj.context.length)
		return !1;

	tarObj = tarObj.context[0];

	// unfollow하여 팔로잉 객체의 팔로워 리스트에서 본인 제거
	lve(this).unfollow();

	for (var i = 0, length = this.context.length; i < length; i++){
		var	item = this.context[i],
			arr_follower = [];

		// 객체에 팔로잉 지정
		item.follow_init.following = tarObj;
		item.follow_init.relative = {
			bottom: relativePosition.bottom || 0,
			left: relativePosition.left || 0,
			perspective: relativePosition.perspective || 0
		};

		// follow 이벤트 발생
		lve(item).emit("follow");

		// 팔로잉 객체의 팔로워 리스트에 본인이 있는지 확인 후 있으면 삭제
		// 없으면 추가
		if (tarObj.follow_init.follower.indexOf(item) == -1){
			tarObj.follow_init.follower.push(item);

			// cssModified 이벤트를 걸어서 본인의 팔로워들의 위치 변화 (css)
			lve(tarObj).on("cssModified", function(e){
				for (var j = 0, length = e.target.follow_init.follower.length; j < length; j++){
					var	follower = e.target.follow_init.follower[j],
						follower_style = follower.style,
						obj_follower = follower.follow_init.relative;

					follower_style.left = tarObj.style.left + obj_follower.left;
					follower_style.bottom = tarObj.style.bottom + obj_follower.bottom;
					follower_style.perspective = tarObj.style.perspective + obj_follower.perspective;
				}
			}).emit("followed"); // followed 이벤트 발생
		}
	}

	return this;
};

// 객체가 해당 사물을 쫒음을 멈춤
lve.fn.session.prototype.unfollow = function(){
	var i = this.context.length;
	while (i--){
		// following 객체가 없을 경우
		if (!this.context[i].follow_init.following)
			return !1;

		var	item = this.context[i],
			item_following = item.follow_init.following,
			item_follower = item_following.follow_init.follower, // 팔로잉 대상의 팔로워 리스트
			item_index = item_follower.indexOf(item),
			arr_follower = [];


		// 팔로잉 초기화
		item.follow_init.following = undefined;
		// 팔로잉 대상의 팔로워 리스트에서 본인 제거
		item_follower.splice(item_index, 1);

		// unfollow 이벤트 발생
		lve(item).emit("unfollow");

		// 팔로잉 대상 cssModified 이벤트 제거
		// 팔로잉 대상 unfollowed 이벤트 발생
		lve(item_following).off("cssModified").emit("unfollowed");
	}

	return this;
};

// 해당 객체의 follower를 제거함
lve.fn.session.prototype.kick = function(tarObjName){
	var arr_kickTar = lve(tarObjName).context;

	for (var i = 0, length = this.context.length; i < length; i++){
		var	item = this.context[i],
			item_follower = item.follow_init.follower;

		for (var j in item_follower)
			// 해당 팔로워가 킥 리스트에 있을 경우
			// 언팔로우
			// 팔로워 kicked 이벤트 발생
			if (arr_kickTar.indexOf(item_follower[j]) != -1)
				lve(item_follower[j]).unfollow().emit("kicked");

		// kick 이벤트 발생
		lve(item).emit("kick");
	}

	return this;
};

// 해당 객체를 움직임
// 이미 움직이고 있었을 시 기존 설정 초기화
lve.fn.session.prototype.animate = function(data, duration, easing, callback){
	if (!data)
		return !1;

	data = lve_root.fn.adjustJSON(data);

	var tmp_duration = typeof duration == "number" ? duration : 1,
		tmp_easing = typeof easing == "string" ? easing : "linear",
		tmp_callback = arguments[arguments.length - 1];

	for (var i = 0, length = this.context.length; i < length; i++){
		var item = this.context[i],
			ani_init = item.ani_init;

		ani_init.count = ani_init.count || {};
		ani_init.count_max = ani_init.count_max || {};
		ani_init.duration = ani_init.duration || {};
		ani_init.easing = ani_init.easing || {};
		ani_init.origin = ani_init.origin || {};

		for (var j in data){
			// animate 가능한 속성인 경우
			// 불가능한 경우 -> #0075c8, red, DOMElement 등
			if (isNaN(parseFloat(data[j])))
				continue;

			if (data[j] !== undefined && data[j] !== item.style[j]){
				ani_init.duration[j] = tmp_duration;
				ani_init[j] = data[j];
				ani_init.origin[j] = item.style[j];
				ani_init.count[j] = 0;
				ani_init.count_max[j] = Math.ceil(ani_init.duration[j] / 1000 * 60);
				ani_init.easing[j] = tmp_easing;
			}
		}

		// 콜백 스택 저장
		if (typeof tmp_callback == "function") {
			lve_root.vars.arr_callback.push({
				count: Math.ceil(tmp_duration / 1000 * 60),
				fn: tmp_callback,
				target: item
			});
		}

		lve("[PRIMARY=" + item.primary + "]").emit("animatestart");
	}

	return this;
};

// 해당 객체의 움직임을 멈춤
lve.fn.session.prototype.stop = function(){
	for (var i = 0, length = this.context.length; i < length; i++){
		this.context[i].ani_init = {};

		// animatestop 이벤트 발생
		lve("[PRIMARY=" + this.context[i].primary + "]").emit("animatestop");
	}

	return this;
};

// 객체를 삭제
lve.fn.session.prototype.remove = function(){
	var	arr_object = lve_root.vars.arr_object,
		arr_scene = lve_root.vars.arr_scene,
		arr_callback = lve_root.vars.arr_callback,
		arr_keyword = lve_root.vars.selectorKeyword,
		canvas = lve_root.vars.initSetting.canvas.context.canvas;

	// 객체정보배열을 돌면서 일괄삭제 후
	// 객체정보배열 재생성
	if (!this.context)
		return !1;

	var i = this.context.length;
	while (i--){
		var item = this.context[i],
			item_index = {
				arr_object: arr_object.indexOf(item),
				arr_scene: arr_scene[item.scene].indexOf(item),
				arr_keyword: arr_keyword[item.name].indexOf(item)
			};

		// play 속성을 가지고 있는 객체일 경우
		// Element 삭제
		if (typeof item.element.play == "function") {
			canvas.appendChild(item.element);
			canvas.removeChild(item.element);
		}

		// animate callback 함수 제거
		var j = arr_callback.length;
		while (j--) {
			var e = arr_callback[j];

			if (e.target == item)
				arr_callback.splice(j, 1);
		}

		// 객체 삭제
		arr_object.splice(item_index.arr_object, 1);
		arr_scene[item.scene].splice(item_index.arr_scene, 1);
		arr_keyword[item.name].splice(item_index.arr_keyword, 1);

		// 키워드 삭제
		delete arr_keyword["[PRIMARY=" + item.primary + "]"];
	}

	// 해당 키워드의 모든 객체가 삭제되었을 경우
	// 해당 키워드 삭제
	if (arr_keyword.hasOwnProperty(this.name))
		if (!arr_keyword[this.name].length)
			delete arr_keyword[this.name];
};

// 객체에 이벤트를 검
lve.fn.session.prototype.on = function(e, fn){
	if (e === undefined){
		console.error("이벤트리스너가 없습니다. 다음 중 한 가지를 필수로 선택해주세요. (" + lve_root.vars.arr_event.join(", ") + ")");
		return !1;
	}

	else if (!fn)
		return !1;

	e = e.split(" ");

	for (var i in e){
		var item = e[i];

		if (lve_root.vars.arr_event.indexOf(item.toLowerCase()) == -1){
			console.error("존재하지 않는 이벤트입니다. 이용할 수 있는 이벤트는 다음과 같습니다. (" + lve_root.vars.arr_event.join(", ") + ")");
			return !1;
		}

		// 객체를 순회하며 이벤트 할당
		for (var j in this.context)
			this.context[j].events[item].push(fn);
	}

	return this;
};

// 객체에 이벤트 제거
lve.fn.session.prototype.off = function(e){
	if (e === undefined){
		console.error("이벤트리스너가 없습니다. 다음 중 한 가지를 필수로 선택해주세요. (" + lve_root.vars.arr_event.join(", ") + ")");
		return !1;
	}

	e = e.split(" ");

	for (var i in e){
		var item = e[i];

		if (lve_root.vars.arr_event.indexOf(item.toLowerCase()) == -1){
			console.error("존재하지 않는 이벤트입니다. 이용할 수 있는 이벤트는 다음과 같습니다. (" + lve_root.vars.arr_event.join(", ") + ")");
			return !1;
		}

		// 객체를 순회하며 이벤트 할당
		for (var j in this.context)
			this.context[j].events[item] = [];
	}

	return this;
};

// 객체를 재생함
lve.fn.session.prototype.play = function () {
	if (!lve_root.vars.isRunning)
		return !1;

	for (var i = 0, length = this.context.length; i < length; i++) {
		var item = this.context[i];

		if (!item.src){
			console.error("객체에 src 속성이 없어 재생할 수 없습니다. attr 메서드를 이용하여 먼저 속성을 부여하십시오.");
			continue;
		}

		else if (!item.element.play) {
			console.error("재생할 수 객체입니다. 이 메서드는 type 속성이 video 같은 재생/정지가 가능한 객체에 이용하십시오.");
			continue;
		}

		item.element.play();
		lve(item).emit("play");
	}

	return this;
};

// 객체의 재생을 멈춤
lve.fn.session.prototype.pause = function () {
	for (var i = 0, length = this.context.length; i < length; i++) {
		var item = this.context[i];

		if (!item.element.pause) {
			console.error("정지가 불가능한 객체입니다. 이 메서드는 type 속성이 video 같은 재생/정지가 가능한 객체에 이용하십시오.");
			continue;
		}

		item.element.pause();
		lve(item).emit("pause");
	}

	return this;
};

// 객체의 이벤트 발생
lve.fn.session.prototype.emit = function(e){
	for (var i = 0, length = this.context.length; i < length; i++){
		var	item = this.context[i],
			eObj = {
				type: e,
				target: item
			};

		for (var j in item.events[e])
			item.events[e][j](eObj);
	}
};
