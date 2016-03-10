/* Linoaca Visualnovel Engine
 * version 1.0.1
 * Made by izure | "LVE.js (C) izure 2016. All rights reserved."
 * http://linoaca.com, http://blog.linoaca.com
 *
 * How to use?
 * → http://blog.linoaca.com
 */

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

		return new lve.fn.session(name, retArray);
	}

	/* DOM으로 검색할 때
	 * ex. lve(DOMElement)
	 */
	else{
		// session으로 검색했을 때
		if (name.context)
			return new lve.fn.session(name.name, name.context);
		// 코어로 검색했을 때
		else
			return new lve.fn.session(name.name, [name]);
	}
},

/* lve_root
 * lve의 설정이 이곳에 저장됨
 * 사용자 선언 함수도 이곳에 저장됨
 */
lve_root = {
	vars: {
		isStart: !1,
		isNeedSort: !1,
		primary: 1,
		arr_object: [], // 객체 정보
		arr_scene: {}, // 객체 정보 - 해당 씬에 담겨있는 객체
		arr_callback: [], // 콜백 스택 - callback함수를 저장하는 변수
		arr_type: ["camera", "image", "circle", "square", "text"], // 객체 속성
		arr_event: ["animatestart", "animateend", "animatestop", "moved"], // 객체 이벤트
		initSetting: {}, // 초기 설정
		usingCamera: undefined, // 사용중인 카메라
		selectorKeyword: {} // 선택자. 객체 생성시 name을 키값으로 저장됨
	},
	fn: {
		// 프레임이 업데이트 될 때
		// 1초에 60번 작동
		update: function(progress){
			var	canvasContext = lve_root.vars.initSetting.canvas.context,
				isNeedSort = Number(lve_root.vars.isNeedSort),
				isNeedDraw = !1,
				isDrawFrame = Math.floor(progress) % (60 / lve_root.vars.initSetting.frameLimit) == 0;

			// 캔퍼스 초기화
			if (isDrawFrame){
				canvasContext.fillStyle = lve_root.vars.initSetting.backgroundColor;
				canvasContext.fillRect(0, 0, lve_root.vars.initSetting.canvas.width, lve_root.vars.initSetting.canvas.height);
			}
			
			// 해당 씬의 모든 객체 순회
			// 다른 씬의 객체는 처리하지 않음
			for (var i in lve_root.vars.arr_object){

				if (!lve_root.vars.arr_object[i])
					continue;

				var	item = lve_root.vars.arr_object[i], // 해당 객체
					attr_translateend = 0, // 해당 객체의 animated된 속성 갯수를 저장할 변수
					attr_Length = item.ani_init.count_max ? Object.keys(item.ani_init.count_max).length : 0; // 해당 객체의 속성 갯수

				// 해당 씬에서 움직이는 객체가 아닐 때
				if (item.scene != lve_root.vars.usingCamera.scene)
					continue;

				// 해당 객체가 animating이 아닐 시 제외
				if (!item.ani_init.count_max)
					continue;


				// 해당 객체가 animating일 경우
				// j를 객체 속성으로 잡음
				for (var j in item.style){

					// 해당 속성이 animating 아닐 시 예외
					if (item.ani_init[j] === undefined)
						continue;

					// 해당 속성에 animate값 저장
					if (
						item.ani_init[j] != item.ani_init.origin[j] &&
						item.ani_init.count[j] < item.ani_init.count_max[j]
					){
						isNeedDraw = !0;
						item.style[j] = item.getEasingData(j);
						item.ani_init.count[j]++;
					}
					
					// style.perspective 값이 변경되었을 시
					// isNeedSort 설정
					if (item.ani_init[j] != item.ani_init.origin[j] && item.ani_init.count[j] < item.ani_init.count_max[j])
						// 움직인 것이 카메라일 경우는 예외
						isNeedSort += item.type != "camera" ? 1 : 0;


					// 객체의 해당 속성이 animated 되었을 때
					if (item.ani_init.count[j] >= item.ani_init.count_max[j]){
						item.style[j] = item.ani_init[j] !== undefined ? item.ani_init[j] : item.style[j];
						attr_translateend++;

						// animating 속성을 없앰으로써 다시 animated로 체크되는 일이 없도록 예외처리
						delete item.ani_init[j];
					}

					// 해당 객체가 모든 속성이 animated 되었을 때
					if (attr_translateend >= attr_Length)
						// stop, animateend 이벤트 발생
						lve(item).stop().emit("animateend");
				}

				lve(item).emit("moved");
			}


			// 프레임 제한
			if (isDrawFrame){
				// z값이 변경되었을 시 재정렬
				if (isNeedSort){
					lve_root.vars.isNeedSort = !1;
					lve_root.vars.arr_object.sort(function(a, b){
						return parseFloat(b.style.perspective) - parseFloat(a.style.perspective);
					});
				}
					

				// 사물 그려넣기
				for (var i in lve_root.vars.arr_object){
					var item = lve_root.vars.arr_object[i];

					// 현재 카메라가 있는 현장의 사물만 그리기
					if (item.scene == lve_root.vars.usingCamera.scene || item.scene == "anywhere")
						item.draw();
				}
			}


			// 콜백함수 체크
			for (var i in lve_root.vars.arr_callback){
				var item = lve_root.vars.arr_callback[i];

				if (item.count > 0)
					item.count--
				else{
					item.fn();
					delete lve_root.vars.arr_callback[i];
				}
			}

			// 사용자가 초기설정시 extend 옵션을 사용했을 시
			if (!!lve_root.vars.initSetting.userExtend && typeof lve_root.vars.initSetting.userExtend == "function")
				lve.root_vars.initSetting.userExtend();

			// update 재귀호출
			window.requestAnimationFrame(lve_root.fn.update);
		},

		adjustJSON: function(data){
			// 모든 스타일 parseFloat화 시키기
			for (var i in data){
				if (typeof data[i] != "object"){
					var data_origin = data[i];

					delete data[i];

					// "-" 제거
					// font-size | FONT-SIZE -> fontSize
					i = (i + "").replace(/-.|[A-Z](?=[a-z])/gm, function(v){
						return "[" + v + "]";
					}).toLowerCase().replace(/\[.\]/gmi, function(v){
						return v.substr(1, 1).toUpperCase();
					});
					data[i] = isNaN(parseFloat(data_origin)) ? data_origin : parseFloat(data_origin);
				}
			}

			return data;
		},

		canvasReset: function(){
			lve_root.vars.initSetting.canvas.context.restore();
			lve_root.vars.initSetting.canvas.context.save();
			lve_root.vars.initSetting.canvas.context.beginPath();
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

lve.init = function(data){
	// 전역 설정
	// 이는 객체의 지역설정으로도 쓰일 수 있음
	data = lve_root.fn.adjustJSON(data);

	var initSetting = lve_root.vars.initSetting;

	initSetting.scaleDistance = data.scaleDistance !== undefined ? data.scaleDistance : initSetting.scaleDistance ? initSetting.scaleDistance : 150; // 객체과의 일반적 거리
	initSetting.disappearanceSize = data.disappearanceSize !== undefined ? data.disappearanceSize : initSetting.disappearanceSize ? initSetting.disappearanceSize : undefined; // 소멸 크기
	initSetting.disappearanceSight = data.disappearanceSight !== undefined ? data.disappearanceSight + initSetting.scaleDistance : undefined; // 소멸 시야
	initSetting.frameLimit = data.frameLimit !== undefined ? data.frameLimit : initSetting.frameLimit ? initSetting.frameLimit : 60; // 프레임 제한
	initSetting.backgroundColor = data.backgroundColor !== undefined ? data.backgroundColor : initSetting.backgroundColor ? initSetting.backgroundColor : "white"; // 캔버스 배경색

	// 필수 선언
	// 이는 객체의 지역설정으로 쓰일 수 없음
	initSetting.canvas = initSetting.canvas || {};
	initSetting.canvas.context = data.canvas !== undefined ? data.canvas.getContext("2d") : initSetting.canvas.context ? initSetting.canvas.context : undefined;
	initSetting.canvas.width = initSetting.canvas.context.canvas.width;
	initSetting.canvas.height = initSetting.canvas.context.canvas.height;

	lve_root.fn.canvasReset();

	// 사용자 보조 선언
	initSetting.userExtend = data.extend;

	// 시스템 보조 선언
	initSetting.success = !0;

	if (!lve_root.vars.isStart){
		lve_root.vars.isStart = !0;
		lve_root.fn.update(0);
	}

	return !0;
},

lve.canvasResize = function(){
	lve_root.vars.initSetting.canvas.width = lve_root.vars.initSetting.canvas.context.canvas.width;
	lve_root.vars.initSetting.canvas.height = lve_root.vars.initSetting.canvas.context.canvas.height;
},

lve.reltofix = function(p){
	var	initSetting = lve_root.vars.initSetting,
		canvas = initSetting.canvas,
		left = (canvas.width / 2) - p,
		bottom = (canvas.height / 2) - p;

	return {
		left: left, bottom: bottom
	};
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
		width: this.type != "text" ? 10 : "auto", // text타입이 아니라면 기본값 10, text타입이라면 문자열 길이가 기본값
		height: 10,
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
		perspective: data.type == "camera" ? 0 : lve_root.vars.initSetting.scaleDistance,
	};
	this.events = {};


	// 객체에 event룸 생성
	for (var i in lve_root.vars.arr_event)
		this.events[lve_root.vars.arr_event[i]] = [];

	// 객체화시키기 위해 session.context속성 지우기
	delete this.context;


	// 객체 좌표
	this.relative = {}; // 카메라 시점에 따라 변화되어 실질적으로 유저가 보는 위치
	// 객체가 animating일 시, 정보 임시저장 변수 
	this.ani_init = {};

	// 씬이 없을 경우 생성
	if (!lve_root.vars.arr_scene[this.scene])
		lve_root.vars.arr_scene[this.scene] = [];

	// 객체정보배열에 저장
	lve_root.vars.arr_object.push(this);
	lve_root.vars.arr_scene[this.scene].push(this);

	// 객체정보배열 재정렬
	lve_root.vars.isNeedSort = !0;
	

	// 객체 생성시
	// selectorKeyword에 등록하여 선언 시 좀 더 빠른 검색
	if (lve_root.vars.selectorKeyword[this.name] === undefined)
		lve_root.vars.selectorKeyword[this.name] = [];

	lve_root.vars.selectorKeyword[this.name].push(this);

	// primary= 특수선택자 객체정보배열 생성
	lve_root.vars.selectorKeyword["[PRIMARY=" + this.primary + "]"] = [];
	lve_root.vars.selectorKeyword["[PRIMARY=" + this.primary + "]"].push(this);

	return lve(this);
};


lve.fn.session.prototype.attr = function(data){
	if (!data)
		return !1;

	data = lve_root.fn.adjustJSON(data);

	for (var i in this.context){
		var item = this.context[i];

		for (var j in item)
			item[j] = data[j] || item[j];
	}

	return this;
};


lve.fn.session.prototype.css = function(data){
	if (!data)
		return !1;

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

	for (var i in this.context){
		var item = this.context[i];

		for (var j in data)
			item.style[j] = data[j] !== undefined ? data[j] : item.style[j];

		/* 캔버스 text타입
		 * width가 선언되지 않았을 시 자동으로 받아오기
		 * 이는 최초 1회만 실행된다
		 */
		if (item.type == "text" && item.style.width == "auto"){
			var canvas = lve_root.vars.initSetting.canvas;

			lve_root.fn.canvasReset();

			canvas.context.font = item.style.fontStyle + " " + item.style.fontWeight + " " + item.style.fontSize + "px " + item.style.fontFamily;
			canvas.context.fillStyle = "transparent";

			item.style.width = canvas.context.measureText(item.text).width;
		}

		lve(item).emit("moved");
	}

	return this;
};

lve.fn.session.prototype.draw = function(){
	var	canvas = lve_root.vars.initSetting.canvas,
		ctx = canvas.context,
		initSetting = lve_root.vars.initSetting;

	lve_root.fn.canvasReset();

	function _getRelativeSize(tarObject, cameraObject, tarObject_size){
		return tarObject_size * initSetting.scaleDistance / (tarObject.style.position == "absolute" ? tarObject.style.perspective - lve_root.vars.usingCamera.style.perspective : tarObject.style.perspective);
	}

	function _getRelativePosition(tarObject, cameraObject, direction){
		// 캔버스의 정중앙을 시작 좌표로 설정
		var	pt_center = direction == "left" ? canvas.width / 2 : canvas.height / 2,
			// 자기 자신의 width의 1/2만큼 빼서, 객체가 left의 정중앙에 올 수 있도록
			fix_measure = direction == "left" ? tarObject.relative.width / 2 : tarObject.relative.height,
			relativeSize,
			m = direction == "left" ? 1 : -1;

		// perspective에 따른 relative size계산
		relativeSize = tarObject.style.position == "absolute" ? m * ((tarObject.style[direction] - cameraObject.style[direction]) * initSetting.scaleDistance / tarObject.relative.perspective) : -tarObject.style[direction];

		return pt_center - fix_measure + relativeSize;
	}

	if (!lve_root.vars.usingCamera)
		return !1;


	// 카메라에서 보일 상대적 위치 생성
	// position속성값이 fixed일 시 relative 값 고정
	this.relative.perspective = this.style.perspective - lve_root.vars.usingCamera.style.perspective;
	this.relative.fontSize = _getRelativeSize(this, lve_root.vars.usingCamera, this.style.fontSize);
	this.relative.borderWidth = _getRelativeSize(this, lve_root.vars.usingCamera, this.style.borderWidth);
	this.relative.width = _getRelativeSize(this, lve_root.vars.usingCamera, this.style.width);
	this.relative.height = _getRelativeSize(this, lve_root.vars.usingCamera, this.style.height || 1);
	this.relative.left = _getRelativePosition(this, lve_root.vars.usingCamera, "left");
	this.relative.bottom = _getRelativePosition(this, lve_root.vars.usingCamera, "bottom");

	// 사물 그리기 예외처리
	if (
		this.type == "camera" || // camera타입
		this.type == "image" && !this.src || // image타입이며 url이 지정되지 않음
		this.type != "image" && !this.style.color || // image타입이 아니면서 color가 지정되지 않음
		this.type == "text" && !this.text || // text타입이면서 text가 지정되지 않음
		this.type == "text" && !this.style.fontSize || // text타입이면서 fontSize가 지정되지 않았거나 0보다 작을 때
		this.relative.width <= 0 || //  width가 0보다 작을 때
		this.relative.height <= 0 || // height가 0보다 작을 때
		this.relative.left + this.relative.width < 0 || // 화면 왼쪽으로 빠져나감
		this.relative.left - this.relative.width > canvas.width || // 화면 오른쪽으로 빠져나감
		this.relative.bottom + this.relative.height < 0 || // 화면 아래로 빠져나감
		this.relative.bottom - this.relative.height > canvas.height || // 화면 위로 빠져나감
		this.relative.width < initSetting.disappearanceSize || // width가 소멸크기보다 작음
		this.relative.height < initSetting.disappearanceSize || // height가 소멸크기보다 작음
		initSetting.disappearanceSight !== undefined && this.relative.perspective > initSetting.disappearanceSight // 소멸거리 지정 시 소멸거리보다 멀리있음
	)
		return !1;



	switch(this.type){
		case "image":
			var imageObj = new Image();
			imageObj.src = this.src;
			ctx.drawImage(imageObj, this.relative.left, this.relative.bottom, this.relative.width, this.relative.height);
			break;

		case "circle":
			canvas.context.fillStyle = this.style.color;

			if (ctx.shadowColor){
				ctx.shadowColor = this.style.shadowColor;
				ctx.shadowBlur = this.style.shadowBlur;
				ctx.shadowBlur = this.style.shadowBlur;
				ctx.shadowOffsetX = this.style.shadowOffsetX;
				ctx.shadowOffsetY = this.style.shadowOffsetY;
			}

			ctx.arc(this.relative.left + this.relative.width / 2, this.relative.bottom + this.relative.width / 2, this.relative.width / 2, 0, Math.PI * 2);
			ctx.fill();

			lve_root.fn.canvasReset();

			ctx.arc(this.relative.left + this.relative.width / 2, this.relative.bottom + this.relative.width / 2, this.relative.width / 2 + this.relative.borderWidth / 2, 0, Math.PI * 2);
			ctx.strokeStyle = this.style.borderColor;
			ctx.lineWidth = this.relative.borderWidth;

			if (this.style.borderWidth)
				ctx.stroke();

			break;

		case "square":
			canvas.context.fillStyle = this.style.color;

			if (ctx.shadowColor){
				ctx.shadowColor = this.style.shadowColor;
				ctx.shadowBlur = this.style.shadowBlur;
				ctx.shadowOffsetX = this.style.shadowOffsetX;
				ctx.shadowOffsetY = this.style.shadowOffsetY;
			}

			ctx.rect(this.relative.left, this.relative.bottom, this.relative.width, this.relative.height);
			ctx.fill();

			lve_root.fn.canvasReset();

			ctx.rect(this.relative.left - this.relative.borderWidth / 2, this.relative.bottom - this.relative.borderWidth / 2, this.relative.width + this.relative.borderWidth, this.relative.height + this.relative.borderWidth);
			ctx.strokeStyle = this.style.borderColor;
			ctx.lineWidth = this.relative.borderWidth;

			if (this.style.borderWidth)
				ctx.stroke();

			break;

		case "text":
			var fix_textAlignLeft = this.relative.width / 2;

			ctx.font = this.style.fontStyle + " " + this.style.fontWeight + " " + this.relative.fontSize + "px " + this.style.fontFamily;
			ctx.fillStyle = this.style.color;
			ctx.textAlign = this.style.textAlign;

			if (ctx.shadowColor){
				ctx.shadowColor = this.style.shadowColor;
				ctx.shadowBlur = this.style.shadowBlur;
				ctx.shadowOffsetX = this.style.shadowOffsetX;
				ctx.shadowOffsetY = this.style.shadowOffsetY;
			}

			ctx.strokeStyle = this.style.borderColor;
			ctx.lineWidth = this.relative.borderWidth;

			if (this.style.borderWidth)
				ctx.strokeText(this.text, this.relative.left + fix_textAlignLeft, this.relative.bottom, this.relative.width);

			ctx.fillText(this.text, this.relative.left + fix_textAlignLeft, this.relative.bottom, this.relative.width);
			break;
	}
};

// 해당 객체를 카메라로 사용함
// 다른 카메라는 계속 작동 함
// 여러대의 객체가 선택되었을 시 가장 최초 객체를 선택
/* [!] 주의사항
 * .use() 메소드는 카메라뿐 아니라 사물 역시 카메라처럼 사용할 수 있습니다
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
lve.fn.session.prototype.follow = function(tarObjectName, relativePosition){
	var	tarObject = lve(tarObjectName),
		relativePosition = relativePosition || {};

	// 없는 객체일 경우
	if (!tarObject.context.length)
		return !1;

	tarObject = tarObject.context[0];

	// unfollow하여 팔로잉 객체의 팔로워 리스트에서 본인 제거
	lve(this).unfollow();

	for (var i in this.context){
		var	item = this.context[i],
			arr_follower = [];

		// 객체에 팔로잉 지정
		item.follow_init.following = tarObject;
		item.follow_init.relative = {
			bottom: relativePosition.bottom || 0,
			left: relativePosition.left || 0,
			perspective: relativePosition.perspective || 0
		};

		// 팔로잉 객체의 팔로워 리스트에 본인이 있는지 확인 후 있으면 삭제
		// 없으면 추가
		if (tarObject.follow_init.follower.indexOf(item) == -1){
			tarObject.follow_init.follower.push(item);

			// moved 이벤트를 걸어서 본인의 팔로워들의 위치 변화 (css)
			lve(tarObject).on("moved", function(e){
				for (var j in e.target.follow_init.follower){
					var	follower = e.target.follow_init.follower[j],
						obj_follower = follower.follow_init.relative;

					lve(follower).css({
						left: tarObject.style.left + obj_follower.left,
						bottom: tarObject.style.bottom + obj_follower.bottom,
						perspective: tarObject.style.perspective + obj_follower.perspective
					});
				}
			});
		}
	}

	return this;
};

// 객체가 해당 사물을 쫒음을 멈춤
lve.fn.session.prototype.unfollow = function(){
	for (var i in this.context){
		// following 객체가 없을 경우
		if (!this.context[i].follow_init.following)
			return !1;

		var	item = this.context[i],
			item_following = item.follow_init.following,
			item_follower = item_following.follow_init.follower, // 팔로잉 대상의 팔로워 리스트
			arr_follower = [];

		lve(item_following).off("moved");
		item.follow_init.following = undefined;

		// 팔로잉 대상의 팔로워 리스트 순회 중
		for (var j in item_follower){
			// 본인이 있을 경우 제외
			if (item_follower[j] == item)
				item_follower[j] = undefined;
			else
				arr_follower.push(item_follower[j]);
		}

		item_following.follow_init.follower = arr_follower;
	}

	return this;
};

// 해당 객체의 follower를 제거함
lve.fn.session.prototype.kick = function(tarObjectName){
	var arr_kickTar = lve(tarObjectName).context;

	for (var i in this.context){
		var	item = this.context[i],
			item_follower = item.follow_init.follower;

		for (var j in item_follower)
			// 해당 팔로워가 킥 리스트에 있을 경우
			// 언팔로우
			if (arr_kickTar.indexOf(item_follower[j]) != -1)
				lve(item_follower[j]).unfollow();
	}

	return this;
};

// 해당 객체를 움직임
// 이미 움직이고 있었을 시 기존 설정 초기화
lve.fn.session.prototype.animate = function(data, duration, easing, callback){
	if (!data)
		return !1;

	data = lve_root.fn.adjustJSON(data);

	duration = duration || 1;
	easing = easing || "linear";

	for (var i in this.context){
		var item = this.context[i];

		item.ani_init.count = item.ani_init.count || {};
		item.ani_init.count_max = item.ani_init.count_max || {};
		item.ani_init.duration = item.ani_init.duration || {};
		item.ani_init.easing = item.ani_init.easing || {};
		item.ani_init.origin = item.ani_init.origin || {};

		for (var j in data){
			// animate 가능한 속성인 경우
			// 불가능한 경우 -> #0075c8, red, DOMElement 등
			if (isNaN(parseFloat(data[j])))
				continue;

			if (data[j] !== undefined && data[j] !== item.style[j]){
				item.ani_init.duration[j] = duration;
				item.ani_init[j] = data[j];
				item.ani_init.origin[j] = item.style[j];
				item.ani_init.count[j] = 0;
				item.ani_init.count_max[j] = Math.ceil(item.ani_init.duration[j] / 1000 * 60);
				item.ani_init.easing[j] = easing;
			}
		}

		lve("[PRIMARY=" + item.primary + "]").emit("animatestart");
	}

	// 콜백 스택 저장
	for (var i in arguments){
		if (typeof arguments[i] != "function")
			continue;

		lve_root.vars.arr_callback.push({
			count: Math.ceil(item.ani_init.duration[j] / 1000 * 60),
			fn: arguments[i]
		});

		break;
	}

	return this;
};

// 해당 객체의 움직임을 멈춤
lve.fn.session.prototype.stop = function(){
	for (var i in this.context){
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
		usingScene = lve_root.vars.usingCamera ? lve_root.vars.usingCamera.scene : "main";

	// 객체정보배열을 돌면서 일괄삭제 후
	// 객체정보배열 재생성
	for (var i in this.context){
		var item = this.context[i],
			arr_newObject_object = [],
			arr_newObject_scene = [];

		// 객체정보배열을 돌며 일괄 삭제
		for (var j in arr_object)
			if (arr_object[j].primary == item.primary)
				// 해당 selectKeyword 삭제
				delete lve_root.vars.selectorKeyword["[PRIMARY=" + item.primary + "]"];
			else
				arr_newObject_object.push(arr_object[j]);

		lve_root.vars.arr_object = arr_newObject_object;

		// 이후 객체정보배열을 돌며
		// 삭제된 영역을 조각모음하여 배열크기 최소화
		for (var j in arr_scene){
			var arr_scene_item = arr_scene[j];

			// 타켓이 소속된 씬이 아닐 경우 예외처리
			if (j != item.scene)
				continue;

			for (var k in arr_scene_item)
				if (arr_scene_item[k].primary != item.primary)
					arr_newObject_scene.push(arr_scene_item[k]);

			lve_root.vars.arr_scene[arr_scene_item[k].scene] = arr_newObject_scene;
		}
	}
};

// 객체에 이벤트를 검
lve.fn.session.prototype.on = function(e, fn){
	if (e === undefined){
		console.error("이벤트리스너가 없습니다. 다음 중 한 가지를 필수로 선택해주세요. (" + lve_root.vars.arr_event.join(", ") + ")");
		return !1;
	}

	if (!fn)
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

	return fn;
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

	return !0;
};

// 객체의 이벤트 발생
lve.fn.session.prototype.emit = function(e){
	for (var i in this.context){
		var	item = this.context[i],
			eObj = {
				type: e,
				target: item
			};

		for (var j in item.events[e])
			item.events[e][j](eObj);
	}
};