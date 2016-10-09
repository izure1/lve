/* Light Visualnovel Engine
 * version 1.6.2
 *
 * Made by izure@naver.com | "LVE.js (C) izure@naver.com 2016. All rights reserved."
 * http://linoaca.com, http://blog.linoaca.com
 *
 * Dev Blog -> http://blog.linoaca.com
 * Dev Center -> http://cafe.naver.com/lvejs
 * Release -> http://github.com/izure1/lve
 */

'use strict';

// 전역 함수 캐싱
var _Math = Math,
    _keys = Object.keys,
    _parseFloat = parseFloat;

var lve = function(name){
	// Ex. lve()
	if (!name)
		return;

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
			    retArray = lve_root.fn.getSceneObj(lve_root.vars.usingCamera.scene);
			    break;

		    case "[using_scene]":
		        retArray = lve_root.fn.getSceneObj(lve_root.vars.usingCamera.scene);
		        break;

			case "[USING_CAMERA]":
				retArray = [lve_root.vars.usingCamera];
				break;

		    case "[using_camera]":
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
        arr_object: [], // 객체 정보
		initSetting: {
		    canvas: {}
		}, // 초기 설정
		isStart: !1,
		isRunning: !0,
		selectorKeyword: {}, // 선택자. 객체 생성시 name을 키값으로 저장됨
		usingCamera: {}, // 사용중인 카메라
		version: "1.6.2" // lve.js 버전
	},
	cache: {
	    arr_callback: [], // 콜백 스택 - callback함수를 저장하는 변수
	    arr_type: ["camera", "image", "circle", "square", "text", "video"], // 객체 속성
	    arr_event: ["animatestart", "animateend", "animatestop", "cssmodified", "attrmodified", "animatemodified", "follow", "followupdate", "unfollow", "followed", "unfollowed", "kick", "kicked", "play", "pause", "ended", "click", "dblclick", "mousedown", "mouseup", "addclass", "removeclass", "toggleclass"], // 객체 이벤트
	    isNeedSort: 0,
	    now: 0,
	    primary: 1
	},
	fn: {
		// 프레임이 업데이트 될 때
		// 1초에 60번 작동
		update: function(timestamp){
		    var cache = lve_root.cache,

                vars = lve_root.vars,
				initSetting = vars.initSetting,

                canvas = initSetting.canvas,
                ctx = canvas.context,
                canvas_elem = canvas.element,
                
                ctx_width = canvas_elem.width,
                ctx_height = canvas_elem.height,

				usingCamera = vars.usingCamera,
				arr_object = vars.arr_object,
				arr_scene = lve_root.fn.getSceneObj(usingCamera.scene),

				interval = 1000 / (usingCamera.frameLimit || initSetting.frameLimit),
				deltaTime = timestamp - cache.now,

				isNeedSort = cache.isNeedSort,
				isDrawFrame = deltaTime > interval,
				    
			    userExtendStart = initSetting.userExtendStart,
				userExtendEnd = initSetting.userExtendEnd,
			    userExtendDrawStart = initSetting.userExtendDrawStart,
				userExtendDrawEnd = initSetting.userExtendDrawEnd;

			// 사용자가 초기설정시 extendStart 옵션을 사용했을 시
			if (!!userExtendStart)
			    userExtendStart(lve_root);

			// 설정 갱신
			if (isDrawFrame) {
			    // 프레임 초기화
			    ctx.restore();
			    ctx.save();

			    ctx.globalAlpha = 1;
			    ctx.fillStyle = usingCamera.backgroundColor || initSetting.backgroundColor;
			    ctx.clearRect(0, 0, ctx_width, ctx_height);
			    ctx.fillRect(0, 0, ctx_width, ctx_height);

			    cache.now = timestamp - (deltaTime % interval);

			    // 사용자가 초기설정시 extendDrawStart 옵션을 사용했을 시
			    if (!!userExtendDrawStart)
			        userExtendDrawStart(lve_root);
			}
			
		    // 해당 씬의 모든 객체 순회
			for (var i = 0, len_i = arr_object.length; i < len_i; i++){
			    var	item = arr_object[i], // 해당 객체
                    item_aniInit_countMax = item.ani_init.count_max,
                    attr_translateend = 0, // 해당 객체의 animated된 속성 갯수를 저장할 변수
                    attr_Length = item_aniInit_countMax ? _keys(item_aniInit_countMax).length : 0; // 해당 객체의 속성 갯수

			    // 사물 그려넣기
			    if (
                    isDrawFrame &&
                    item.scene == usingCamera.scene ||
                    item.scene == "anywhere"
                )
			        item.draw();

			    // 해당 객체가 animating이 아닐 시 제외
			    if (!item_aniInit_countMax)
			        continue;

			    // 해당 객체가 animating일 경우
			    // j를 객체 속성으로 잡음
			    for (var j in item.ani_init){
			        // 해당 속성이 animating 아닐 시 예외
			        if (item.ani_init[j] === undefined)
			            continue;

			        var item_style = item.style,
                        item_aniInit = item.ani_init,
                        item_aniInit_tar = item_aniInit[j],
                        item_aniInit_origin = item_aniInit.origin;

			        // 해당 속성에 animate값 저장
			        if (
                        item_aniInit_tar != item_aniInit_origin[j] &&
                        item_aniInit.count[j] < item_aniInit.count_max[j]
                    ){
			            item_style[j] = item.getEasingData(j);
			            item_aniInit.count[j]++;
			            item.emit("animatemodified");
			        }
					
			        // style.perspective 값이 변경되었을 시
			        // isNeedSort 설정
			        if (
                        j == "perspective" &&
                        item_aniInit_tar != item_aniInit_origin[j] &&
                        item_aniInit.count[j] < item_aniInit.count_max[j]
                    )
			            // 움직인 것이 카메라일 경우는 예외
			            isNeedSort += (item.type != "camera") - 0;

			        // 객체의 해당 속성이 animated 되었을 때
			        if (item_aniInit.count[j] >= item_aniInit.count_max[j]) {
			            item_style[j] = item_aniInit_tar !== undefined ? item_aniInit_tar : item_style[j];
			            attr_translateend++;

			            // animating 속성을 없앰으로써 다시 animated로 체크되는 일이 없도록 예외처리
			            delete item_aniInit[j];
			        }

			        // 해당 객체가 모든 속성이 animated 되었을 때
			        if (attr_translateend >= attr_Length){
			            // animateend 이벤트 발생
			            item.ani_init = {};
			            item.emit("animateend");
			        }
			    }
			}

			if (isDrawFrame){
			    // 지정된 카메라가 없을 경우
			    if (!lve_root.fn.checkCamera()){
			        ctx.fillStyle = "black";
			        ctx.fillRect(0, 0, ctx_width, ctx_height);

			        ctx.font = "30px consolas";
			        ctx.fillStyle = "white";
			        ctx.textAlign = "center";

			        var ctx_width_half = ctx_width / 2,
                        ctx_height_half = ctx_height / 2;

			        ctx.fillText("지정된 카메라가 없습니다", ctx_width_half, ctx_height_half - 15, ctx_width);
			        ctx.font = "15px consolas";
			        ctx.fillText("There is no using camera", ctx_width_half, ctx_height_half + 15, ctx_width);
			    }

			    // 사용자가 초기설정시 extendDrawEnd 옵션을 사용했을 시
			    if (!!userExtendDrawEnd)
			        userExtendDrawEnd(lve_root);

			    // z값이 변경되었을 시 재정렬
			    if (isNeedSort){
			        cache.isNeedSort = 0;
			        arr_object.sort(function(a, b){
			            return _parseFloat(b.style.perspective) - _parseFloat(a.style.perspective);
			        });
			    }
			}

			// 콜백함수 체크
			var arr_callback = cache.arr_callback,
                j = arr_callback.length;

			while (j--){
				var e = arr_callback[j];

				if (e.count > 0)
					e.count--;
				else {
					arr_callback.splice(j, 1);
					e.fn(e.target);
				}
			}

			// 사용자가 초기설정시 extendEnd 옵션을 사용했을 시
			if (!!userExtendEnd)
			    userExtendEnd(lve_root);

		    // update 재귀호출
			if (vars.isRunning)
			    window.requestAnimationFrame(lve_root.fn.update);
		},

		copyObject: function(data){
		    var ret = {},
		        _JSON = JSON;

			for (var i in data){
				var val = data[i];

				if (typeof val == "object" || typeof val == "array")
					ret[i] = _JSON.parse(_JSON.stringify(val))
				else
					ret[i] = val;
			}

			return ret;
		},

		adjustProperty: function(data){
			return (data + "").replace(/-.|[A-Z](?=[a-z])/gm, function(v){
				return "[" + v + "]";
			}).toLowerCase().replace(/\[.\]/gmi, function(v){
				return v.substr(1, 1).toUpperCase();
			});
		},

		adjustJSON: function(data, obj){
			// 새로운 객체로 생성
			var tmp_data = lve_root.fn.copyObject(data);

			// 모든 스타일 _parseFloat화 시키기
			for (var i in tmp_data){
			    var data_origin = data[i],
			        parseData = _parseFloat(data_origin);

				delete tmp_data[i];

				// "-" 제거
				// font-size | FONT-SIZE -> fontSize
				i = lve_root.fn.adjustProperty(i);

				// 속성값이 함수형일 경우
				if (typeof data_origin == "function" && obj)
					data_origin = data_origin(obj);

				tmp_data[i] = isNaN(data_origin - 0) ? data_origin : isNaN(parseData) ? data_origin : parseData;
			}

			return tmp_data;
		},

		canvasReset: function (opacity = 1, blur = 0) {
		    var ctx = lve_root.vars.initSetting.canvas.context;

			ctx.restore();
			ctx.save();
			ctx.beginPath();

			ctx.globalAlpha = opacity;
			ctx.filter = blur > 0 ? "blur(" + blur + "px)" : "none";
		},

		getRelativeSize: function (tarObj, tarObj_size) {
		    var vars = lve_root.vars,
                cameraObject = vars.usingCamera,
				scaleDistance = cameraObject.scaleDistance || vars.initSetting.scaleDistance;

			return tarObj_size * scaleDistance / (tarObj.style.perspective - cameraObject.style.perspective);
		},

		getRelativePosition: function (tarObj, direction) {
		    var pt_center, // 캔버스의 중앙 - 캔버스 그리기 시작 위치
				pt_fix, // 객체 자신을 그리기 중점 - pt_center - (width / 2) || (height / 2)
				camera_height, // 카메라 높이
				n,

                vars = lve_root.vars,
                initSetting = vars.initSetting,
				cameraObj = vars.usingCamera,
				scaleDistance = cameraObj.scaleDistance || initSetting.scaleDistance,
				canvas_elem = initSetting.canvas.element, // Nagative. top이 아니라, bottom으로 인한 반전값

                tarObj_style = tarObj.style,
                tarObj_relative = tarObj.relative,
                cameraObject_style = cameraObj.style;

			// direction이 left일 경우
			if (direction == "left"){
				pt_center = canvas_elem.width / 2;
				pt_fix = tarObj_relative.width / 2;
				camera_height = 0;
				n = 1;
			}
			// direction이 bottom일 경우
			else {
				pt_center = canvas_elem.height / 2;
				pt_fix = tarObj_relative.height;
				camera_height = cameraObject_style.height;
				n = -1;
			}

			// 직관적인 변수명 재명시
			var target_originPosition = tarObj_style[direction],
				camera_originPosition = cameraObject_style[direction],
				target_originRotate = tarObj_style.rotate,
				camera_originRotate = cameraObject_style.rotate,
				target_relativeScale = scaleDistance / tarObj_relative.perspective,

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
		},

		eventfilter: function(e){
		    var vars = lve_root.vars,
                cache = lve_root.cache,
				initSetting = vars.initSetting,
				usingCamera = vars.usingCamera || {},
				canvas_elem = initSetting.canvas.element,
				arr_scene = lve_root.fn.getSceneObj(usingCamera.scene),
				len_i = arr_scene.length,
				ox = e.offsetX,
				oy = e.offsetY;

			cache.isNeedSort = 0;
			vars.arr_object.sort(function(a, b){
				return _parseFloat(b.style.perspective) - _parseFloat(a.style.perspective);
			});

			while (len_i--){
				var item = arr_scene[len_i],
					_style = item.style,
					_relative = item.relative,
					_left = _relative.left,
					_top = _relative.bottom;

				// 예외 처리
				if (
					item.type == "camera" || // 카메라 객체일 경우
					_style.pointerEvents == "none" || // pointer-events 속성값이 none일 경우
					ox < _left || // 객체가 우측에 있을 경우
					ox > (_left + _relative.width) || // 객체가 좌측에 있을 경우
					oy < _top || // 객체가 아래에 있을 경우
					oy > (_top + _relative.height) // 객체가 위에 있을 경우
				)
					continue;

				// 이벤트 발동조건이 일치할 때
				// 현재 카메라 기준으로 perspective가 가장 근접한 객체에 최초 발동
				item.emit(e.type, e);
				break;
			}
		},

        getSceneObj: function(sceneName){
            var arr_object = lve_root.vars.arr_object,
                arr_ret = [];

            for (var i = 0, j = 0, len_i = arr_object.length; i < len_i; i++){
                var item = arr_object[i];

                if (item.scene == sceneName)
                    arr_ret[j++] = item;
            }

            return arr_ret;
        },

		checkCamera: function(){
		    var usingCamera = lve_root.vars.usingCamera;

		    return !(!usingCamera || !usingCamera.hasOwnProperty("primary"));
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
	var data = lve_root.fn.adjustJSON(data, initSetting),
		initSetting = lve_root.vars.initSetting;

	initSetting.scaleDistance = data.scaleDistance !== undefined ? data.scaleDistance : initSetting.scaleDistance ? initSetting.scaleDistance : 100; // 객체과의 일반적 거리
	initSetting.disappearanceSize = data.disappearanceSize !== undefined ? data.disappearanceSize : initSetting.disappearanceSize ? initSetting.disappearanceSize : 0.35; // 소멸 크기
	initSetting.disappearanceSight = data.disappearanceSight !== undefined ? data.disappearanceSight + initSetting.scaleDistance : undefined; // 소멸 시야
	initSetting.frameLimit = data.frameLimit !== undefined ? data.frameLimit : initSetting.frameLimit ? initSetting.frameLimit : 60; // 프레임 제한
	initSetting.backgroundColor = data.backgroundColor !== undefined ? data.backgroundColor : initSetting.backgroundColor ? initSetting.backgroundColor : "white"; // 캔버스 배경색

	// 필수 선언
	// 이는 객체의 지역설정으로 쓰일 수 없음
	if (data.canvas){
	    initSetting.canvas.context = data.canvas.getContext("2d");
		initSetting.canvas.element = data.canvas;
	}

	lve_root.fn.canvasReset();

	// 사용자 보조 선언
    initSetting.userExtendStart = data.extendStart || initSetting.userExtendStart;
	initSetting.userExtendEnd = data.extendEnd || initSetting.userExtendEnd;
	initSetting.userExtendDrawStart = data.extendDrawStart || initSetting.userExtendDrawStart;
	initSetting.userExtendDrawEnd = data.extendDrawEnd || initSetting.userExtendDrawEnd;

	// 시스템 보조 선언
	initSetting.success = !0;

	if (!lve_root.vars.isStart) {
		lve_root.vars.isStart = !0;
		lve_root.fn.update();

		var ce = initSetting.canvas.element,
			fn = lve_root.fn;

		// 캔버스 이벤트 할당
		ce.onclick =
		ce.ondblclick =
		ce.onmousedown =
		ce.onmouseup = function(e){
			fn.eventfilter(e);
		};
	}

	return !0;
},

lve.reltofix = function (p) {
	var initSetting = lve_root.vars.initSetting,
		canvas = initSetting.canvas.element,
		left = (canvas.width / 2) - p,
		bottom = (canvas.height / 2) - p;

	return {
		left: left, bottom: bottom
	};
},

lve.pause = function () {
    var cache = lve_root.cache,
        vars = lve_root.vars,
		arr_object = vars.arr_object;

    // 게임이 재생 중일 경우 정지
    if (vars.isRunning) {
        vars.isRunning = !1;

        for (var i = 0, len_i = arr_object.length; i < len_i; i++) {
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
    }
},

lve.play = function () {
    var cache = lve_root.cache,
        vars = lve_root.vars,
		arr_object = vars.arr_object;

	// 게임이 정지되어 있었을 경우 재생
	if (!vars.isRunning) {
	    vars.isRunning = !0;

		lve_root.fn.update();

		for (var i = 0, len_i = arr_object.length; i < len_i; i++) {
			var item = arr_object[i],
				item_elem = item.element;

			// 재생이 가능한 객체일 경우
			if (typeof item_elem.play != "function")
				continue;

			// 재생 중이던 객체였는가
			var isPlayed = item_elem.getAttribute("data-played");

			if (isPlayed) {
				// 일시중지 중이던 객체 재생
				item_elem.play();
				item_elem.removeAttribute("data-played");
			}
		}
	}
},

lve.fullScreen = function (extend) {
	// 캔버스 이벤트 등록
	var canvas_elem = lve_root.vars.initSetting.canvas.element,
		// 증가 비율이 짧은 면을 기준으로 잡음
		screenScale = [
			window.screen.availWidth / canvas_elem.width,
			window.screen.availHeight / canvas_elem.height
		].sort(function (a, b) {
			return a - b;
		})[0],

		// 이벤트 함수
		fn_eventExit = function () {
			var isFullScreen = canvas_elem.getAttribute("data-fullscreen");

			// 현재 전체화면 모드라면
			if (isFullScreen) {
				canvas_elem.removeAttribute("data-fullscreen");

				if (extend)
					canvas_elem.style.transform = "";

				canvas_elem.removeEventListener("fullscreenchange", fn_eventExit);
				canvas_elem.removeEventListener("webkitfullscreenchange", fn_eventExit);
				canvas_elem.removeEventListener("mozscreenchange", fn_eventExit);
				canvas_elem.removeEventListener("msscreenchange", fn_eventExit);
			}
				// 진입 시
			else {
				canvas_elem.setAttribute("data-fullscreen", true);

				// 확장을 허용했을 시
				if (extend)
					canvas_elem.style.transform = "scale(" + screenScale + ")";
			}
		};

	if (!canvas_elem || canvas_elem.getAttribute("data-fullscreen") == "true")
		return;

	// 이벤트 등록
	canvas_elem.addEventListener("fullscreenchange", fn_eventExit);
	canvas_elem.addEventListener("webkitfullscreenchange", fn_eventExit);
	canvas_elem.addEventListener("mozscreenchange", fn_eventExit);
	canvas_elem.addEventListener("msscreenchange", fn_eventExit);

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
					return;
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
			return;

		for (var i in data)
			lve_root.vars[i] = data[i];

		return data;
	}
},

lve.calc = function(data = {}){
	var data = lve_root.fn.adjustJSON(data),
		tmp_data = lve_root.fn.copyObject(data),
		// 전역변수 지역화
		vars = lve_root.vars,
		initSetting = vars.initSetting,
		usingCamera = vars.usingCamera,
		scaleDistance = usingCamera.scaleDistance || initSetting.scaleDistance;

	data.perspective = data.perspective === undefined ? scaleDistance : data.perspective;
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
		arr_fixedProp = ["rotate", "opacity", "gradientDirection", "scale"],

		_getRelativeSize = lve_root.fn.getRelativeSize;

	// getRelativeSize 실행
	// isNaN 값 제외
	for (var i in data){
		var isPosition = arr_positionList.indexOf(i) != -1;

		if (!isPosition)
			// 숫자식만 계산함
			if (!isNaN(
				data[i] - 0
			))
				tmp_ret[i] = _getRelativeSize(tmp_object, data[i]);
			// 숫자식이 아닐 경우
			else
				tmp_ret[i] = data[i];
		else
			tmp_ret[i] = data[i];
	}

	// getRelativeSize와 사용자의 요청값을 비교하여 증감 비율 구하기
	var compare_option = _keys(tmp_ret)[0],
		fixScale = data[compare_option] / tmp_ret[compare_option];

	// 좌표값이 아닌 속성값을 증감 비율에 따라 보정
	for (var i in tmp_ret){
		var isPosition = arr_positionList.indexOf(i) != -1;

		if (!isPosition)
			// 숫자식만 계산함
			if (!isNaN(
				_parseFloat(tmp_ret[i])
			))
				tmp_ret[i] *= fixScale * fixScale;
	}

	var canvas_elem = initSetting.canvas.element;

	// 좌표값 적용
	for (var i = 0, len_i = arr_positionList.length; i < len_i; i++){
		var key = arr_positionList[i];

		tmp_ret[key] *= fixScale;
	}

	// 사용자가 요청한 속성만 담음
	for (var i in tmp_ret)
		ret[i] = tmp_ret[i];

	// 상수 속성 수치 보정
	for (var i = 0, len_i = arr_fixedProp.length; i < len_i; i++){
		var key = arr_fixedProp[i];

		if (tmp_ret[key] !== undefined)
			ret[key] = tmp_data[key];
	}

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
		this.context = context || {};
	}
};

lve.fn.session.prototype.getEasingData = function(attr){
    var aniInit = this.ani_init;

	// animating이 아닌 객체이거나, 속성 매개변수가 넘어오지 않았을 시
    if (!aniInit.count_max || !attr)
		return;

    var	tar = aniInit.origin[attr],
		tar_goal = aniInit[attr];

	// 존재하지 않는 속성일 경우
	if (tar === undefined || tar_goal === undefined)
		return;

	// t: current time, b: begInnIng value, c: change In value, d: duration
    var	t = aniInit.count[attr] * 1000 / 60 || 1,
		b = tar,
		c = tar_goal - tar,
		d = aniInit.duration[attr] || 1,
		easing = aniInit.easing[attr] || "linear";

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
		    return -c * _Math.cos(t/d * (_Math.PI/2)) + c + b;
		case "easeOutSine":
		    return c * _Math.sin(t/d * (_Math.PI/2)) + b;
		case "easeInOutSine":
		    return -c/2 * (_Math.cos(_Math.PI*t/d) - 1) + b;
		case "easeInExpo":
		    return c * _Math.pow( 2, 10 * (t/d - 1) ) + b;
		case "easeOutExpo":
		    return c * ( -_Math.pow( 2, -10 * t/d ) + 1 ) + b;
		case "easeInOutExpo":
			t /= d/2;
			if (t < 1) return c/2 * _Math.pow( 2, 10 * (t - 1) ) + b;
			t--;
			return c/2 * ( -_Math.pow( 2, -10 * t) + 2 ) + b;
		case "easeInCirc":
			t /= d;
			return -c * (_Math.sqrt(1 - t*t) - 1) + b;
		case "easeOutCirc":
			t /= d;
			t--;
			return c * _Math.sqrt(1 - t*t) + b;
		case "easeInOutCirc":
			t /= d/2;
			if (t < 1) return -c/2 * (_Math.sqrt(1 - t*t) - 1) + b;
			t -= 2;
			return c/2 * (_Math.sqrt(1 - t*t) + 1) + b;
	}
};



/* 객체 prototype을 지정함
 * selector에 배열화로 담겨져있는 객체는 for문을 돌며 처리
 * 그 외 객체는 일반적으로 해결
 */

lve.fn.session.prototype.create = function(data){
	if (!data.type){
		console.error("type속성은 객체 필수 속성입니다. 다음 중 한 가지를 필수로 선택해주세요. (" + lve_root.cache.arr_type.join(", ") + ")");
		return;
	} else if (lve_root.cache.arr_type.indexOf(data.type.toLowerCase()) == -1){
		console.error("존재하지 않는 type속성입니다. 이용할 수 있는 type속성은 다음과 같습니다. (" + lve_root.cache.arr_type.join(", ") + ")");
		return;
	}

	var data = lve_root.fn.adjustJSON(data, this),
		self = this,
		arr_autoList_1 = {
			text: {
				property: ["width", "height"],
				default: "auto"
			},
			image: {
				property: ["width", "height"],
				default: "not_ready"
			}
		},
		arr_autoList_2 = {
			circle: {
				property: ["gradientType"],
				default: "radial"
			},
			square: {
				property: ["gradientType"],
				default: "linear"
			},
			text: {
				property: ["gradientType"],
				default: "linear"
			}
		},
		vars = lve_root.vars,
		cache = lve_root.cache;

	function _setAuto(arr){
		for (var i in arr){
			if (self.type == i){
				var arr_tarProp = arr[i].property;

				for (var j = 0, len_j = arr_tarProp.length; j < len_j; j++)
					self.style[arr_tarProp[j]] = arr[i].default;
			}
		}
	}

	this.primary = cache.primary++;
	this.type = data.type.toLowerCase();
	this.scene = data.scene || "main";
	this.src = data.src;
	this.text = data.text;
	this.className = "";
	this.focus = !1;
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
		rotate: 0,
		scale: 1,
		blur: 0,
		gradientDirection: 0,
		gradientType: "",
		gradient: {},
		pointerEvents: "auto"
	};
	this.events = {};
	this.element = {};
	this.__system__ = {
	    drawing: !0
	};


	// arr_autoList 보정
	_setAuto(arr_autoList_1);
	_setAuto(arr_autoList_2);

	// 객체 이벤트 준비
	// 객체 preload
	if (!!this.src) {
		switch(this.type){
			case "image":{
				var callback = function(self, element){
					self.element = element;

					if (self.style.width == "not_ready")
						self.style.width = element.width || 10;

					if (self.style.height == "not_ready")
						self.style.height = element.height || 10;
				};

				lve_root.fn.preloadData(this, "img", callback);
				break;
			}

			case "video":{
				this.element = document.createElement("video");
				this.element.src = this.src;
				this.element.oncanplay = function(e){
					var elem_tar = e.target,
						isPlayQueue = elem_tar.getAttribute("data-play");

					if (isPlayQueue){
						elem_tar.removeAttribute("data-play");
						self.emit("play");
					}

					elem_tar.onplay = function(){
						self.emit("play");
					};
				};
				this.element.onended = function(){
					self.emit("ended");
				};

				break;
			}
		}
	}

	// 객체에 event룸 생성
	for (var i = 0, len_i = cache.arr_event.length; i < len_i; i++)
		this.events[cache.arr_event[i]] = [];

	// 객체화시키기 위해 session.context속성 지우기
	delete this.context;


	// 객체 좌표
	this.relative = {}; // 카메라 시점에 따라 변화되어 실질적으로 유저가 보는 위치
	// 객체가 animating일 시, 정보 임시저장 변수 
	this.ani_init = {};

	// 객체정보배열에 저장
	vars.arr_object.push(this);
	// 객체정보배열 재정렬
	cache.isNeedSort++;
	

	// 객체 생성시
	// selectorKeyword에 등록하여 선언 시 좀 더 빠른 검색
	if (!vars.selectorKeyword[this.name])
		vars.selectorKeyword[this.name] = [];

	vars.selectorKeyword[this.name].push(this);
	// primary= 특수선택자 객체정보배열 생성
	vars.selectorKeyword["[PRIMARY=" + this.primary + "]"] = [this];
	vars.selectorKeyword["[primary=" + this.primary + "]"] = [this];

	return this;
};

lve.fn.session.prototype.attr = function(data){
    // 속성 적용
    if (typeof data == "object"){
        var _adjustJSON = lve_root.fn.adjustJSON,
            _callback = function(item){
                // 매개변수가 Object형일 경우
                // 속성 대입
                if (typeof data == "object"){
                    var _data = _adjustJSON(data, item);

                    for (var j in _data){
                        var newAttrVal = _data[j];

                        if (j == "src" && item.type == "image"){
                            item[j] = newAttrVal;
                            // 이미지 미리불러오기
                            lve_root.fn.preloadData(item, "img", function(self, element){
                                self.element = element;
                            });
                            continue;
                        }

                        item[j] = newAttrVal;
                    }

                    item.emit("attrmodified");
                }
            };

        if (this.context)
            for (var i = 0, len_i = this.context.length; i < len_i; i++)
                _callback(this.context[i]);
        else
            _callback(this);

        // 객체 반환
        return this;
    }
    // 속성 반환
    else{
        var ret = [],
            _adjustProperty = lve_root.fn.adjustProperty,
            _callback = function(item){
                // 매개변수가 없을 때
                // 선택된 모든 객체의 속성 반환
                if (!data)
                    ret.push(item);

                else if (typeof data == "string")
                    ret.push(item[data]);
            };
        
        if (this.context)
            for (var i = 0, len_i = this.context.length; i < len_i; i++)
                _callback(this.context[i]);
        else
            _callback(this);

        // 결과 반환
        return ret;
    }
};

lve.fn.session.prototype.css = function(data){
    // 속성 적용
    if (typeof data == "object"){
        var _adjustJSON = lve_root.fn.adjustJSON,
            _callback = function(item){
                // 매개변수가 Object형일 경우
                // 스타일 속성 대입
                if (typeof data == "object"){
                    var _data = _adjustJSON(data, item);

                    // absolute, fixed 이외의 position 속성값을 가질 경우
                    if (
                        _data.position !== undefined &&
                        _data.position != "absolute" &&
                        _data.position != "fixed"
                    ){
                        console.error("position:" + _data.position + "은 사용할 수 없는 속성입니다. 사용할 수 있는 속성은 다음과 같습니다. (absolute, fixed) 기본값은 absolute입니다.");
                        return;
                    }
			
                    for (var j in _data){
                        // 없는 Style 속성일 경우
                        if (_keys(item.style).indexOf(j) == -1)
                            continue;

                        // Camera 객체가 아니면서
                        // perspective가 변경되었을 시
                        if (item.type != "camera" && j == "perspective")
                            // z-index 재정렬
                            lve_root.cache.isNeedSort++;

                        item.style[j] = _data[j];
                    }

                    item.emit("cssmodified");
                }
            };

	    if (this.context)
	        for (var i = 0, len_i = this.context.length; i < len_i; i++)
	            _callback(this.context[i]);
	    else
	        _callback(this);

        // 객체 반환
	    return this;
	}
	// 속성 반환
	else{
        var ret = [],
            _adjustProperty = lve_root.fn.adjustProperty,
            _callback = function(item){
                // 매개변수가 없을 때
                // 선택된 모든 객체의 style 속성 반환
                if (!data)
                    ret.push(item.style);

                else if (typeof data == "string")
                    ret.push(item.style[data]);
            };
        
        if (this.context)
            for (var i = 0, len_i = this.context.length; i < len_i; i++)
                _callback(this.context[i]);
        else
            _callback(this);

        // 결과 반환
        return ret;
	}
};

lve.fn.session.prototype.draw = function(){
    var vars = lve_root.vars,
		initSetting = vars.initSetting,

		usingCamera = vars.usingCamera,
		style = this.style,
		relative = this.relative,
		hasGradient = _keys(style.gradient).length;

	/* 지역 함수
	 * _getRelativeSize : perspective에 따른 객체 크기 반환 (this.relative.width || this.relative.height)
	 * _getRelativePosition : perspective에 따른 객체 위치 반환 (this.relative.left || this.relative.bottom)
	 */
	var _getRelativeSize = lve_root.fn.getRelativeSize,
		_getRelativePosition = lve_root.fn.getRelativePosition;

	function getGradient(that){
		var _ctx = ctx,
			_style = that.style,
			_relative = that.relative,
			_width = that.relative.width,
			_height = that.relative.height,
			// 그라데이션 정보
			grd,
			keys = _keys(_style.gradient),
			textAlign_fix = 0;

		if (!keys.length)
			return;

		lve_root.fn.canvasReset(_style.opacity);

		// text-align에 따라 위치 보정
		if (that.type == "text"){
			switch(_style.textAlign){
				case "left":{
					textAlign_fix = _width / 2;
					break;
				}
				case "right":{
					textAlign_fix = -_width / 2;
					break;
				}
			}
		}

		switch(_style.gradientType){
			case "linear":{
				var deg = _style.gradientDirection % 360 == 0 ? 1 : _style.gradientDirection % 360,
  					men = _Math.floor(deg / 90) % 4,
					spx = [0, _width, _width, 0],
					spy = [0, 0, _height, _height],
					sppx = [1, -1, -1, 1],
					sppy = [1, 1, -1, -1],
	    
					rad = deg * _Math.PI / 180,
	    
					sin = _Math.sin(rad),
					cos = _Math.cos(rad),
					abs = _Math.abs;
  
				var rs = _height / sin,
					px = abs(rs * cos),
					rd = (_width - px) * px / rs,
					r = rs + rd;

				var x0 = spx[men],
					y0 = spy[men],
					x1 = x0 + abs(r * cos) * sppx[men],
					y1 = y0 + abs(r * sin) * sppy[men];

				grd = _ctx.createLinearGradient(x0 + _relative.left + textAlign_fix, y0 + _relative.bottom, x1 + _relative.left + textAlign_fix, y1 + _relative.bottom);
				break;
			}
			case "radial":{
				var relativeWidth_half = _width / 2,
					relativeHeight_half = _height / 2,

					ret_left = _relative.left + relativeWidth_half + textAlign_fix,
					ret_bottom = _relative.bottom + relativeHeight_half

				grd = _ctx.createRadialGradient(ret_left, ret_bottom, 0, ret_left, ret_bottom, relativeWidth_half);
				break;
			}
		}

		for (var i in _style.gradient){
			var pos = i / 100,
				color = _style.gradient[i] || "transparent";

			if (isNaN(pos))
				return;

			grd.addColorStop(pos, color);
		}

		return grd;
	}
	
	// 상대적 거리 가져오기
	relative.perspective = style.perspective - usingCamera.style.perspective;

	// 1차 사물 그리기 예외 처리
	if (
		relative.perspective <= 0 || // 카메라보다 뒤에 있을 시
		this.type == "camera" || // camera타입
		this.type == "image" && !this.src || // image타입이며 url이 지정되지 않음
		this.type == "video" && !this.src || // video타입이며 url이 지정되지 않음
		this.src && this.element === {} || // src 속성을 가지고 있으나 로드되지 않음
		!this.src && !style.color && !hasGradient || // src 속성이 없으며 color, gradient가 지정되지 않음
		this.type == "text" && !this.text || // text타입이면서 text가 지정되지 않음
		this.type == "text" && !style.fontSize || // text타입이면서 fontSize가 지정되지 않았거나 0보다 작을 때
		!style.opacity || // 투명도가 0일 경우
		!style.width || // width 가 0일 경우
		!style.height || // height 가 0일 경우
		!style.scale // scale이 0일 경우
	){
	    this.__system__.drawing = !1;
	    return;
	}
	    

	var canvas = initSetting.canvas,
		ctx = canvas.context,
		canvas_elem = canvas.element,
		// 설정값 우선순위로 받아오기 (usingCamera -> initSetting)
		scaleDistance = usingCamera.scaleDistance || initSetting.scaleDistance,
		disappearanceSize = usingCamera.disappearanceSize || initSetting.disappearanceSize,
		disappearanceSight = usingCamera.disappearanceSight || initSetting.disappearanceSight;


	/* 캔버스 text타입
	 * width가 선언되지 않았을 시 자동으로 받아오기
	 * 이는 최초 1회만 실행된다
	 */
	if (style.width == "auto" || style.height == "auto"){
		switch(this.type){
			case "image":{
				var element = this.element,
					widthScale = element.width / element.height,
					heightScale = element.height / element.width;

				// 양쪽 변 모두 auto일 경우
				if (style.width == "auto" && style.height == "auto"){
					style.width = element.width;
					style.height = element.height;
					style.width_tmp = "auto";
					style.height_tmp = "auto";
				}
				// 한쪽 변만 auto일 시 
				else{
					// 가로 사이즈가 auto일 시
					if (style.width == "auto"){
						style.width = style.height * widthScale;
						style.width_tmp = "auto";
					}
						// 세로 사이즈가 auto일 시
					else{
						style.height = style.width * heightScale;
						style.height_tmp = "auto";
					}
				}

				break;
			}

		    case "text":{
				ctx.font = style.fontStyle + " " + style.fontWeight + " " + style.fontSize + "px " + style.fontFamily;

				var expectMeasure = ctx.measureText(this.text).width;
				style.width = expectMeasure;
				style.width_tmp = "auto";
				style.height = style.fontSize;
				style.height_tmp = "auto";
				relative.width_tmp = style.textAlign == "left" ? expectMeasure : style.textAlign == "center" ? expectMeasure / 2 : style.textAlign == "right" ? 0 : 0; 

				break;
			}
		}
	}


	// 카메라에서 보일 상대적 위치 생성
	// position속성값이 fixed일 시 relative 값 고정
	if (style.position == "absolute"){
		relative.scale = _getRelativeSize(this, style.scale) / style.scale;
		
		var relativeScale = relative.scale * style.scale;
		// style.scale 을 기준으로 relativeSize가 정해짐
		relative.fontSize = style.fontSize * relativeScale;
		relative.borderWidth = style.borderWidth * relativeScale;
		relative.shadowBlur = style.shadowBlur * relativeScale;
		relative.shadowOffsetX = style.shadowOffsetX * relativeScale;
		relative.shadowOffsetY = style.shadowOffsetY * relativeScale;
		relative.width = style.width * relativeScale;
		relative.height = style.height * relativeScale;
		relative.left = _getRelativePosition(this, "left");
		relative.bottom = _getRelativePosition(this, "bottom");
		relative.blur = style.blur;

		// blur 처리
		// focus 기능을 사용 중이라면
		if (usingCamera.focus){
			var relativePerspectiveFromDistance = scaleDistance - relative.perspective;

			// scaleDistance 보다 근접했을 경우
			if (relativePerspectiveFromDistance > 0){
				// 상대적 거리에 따라 blur 처리
				var maxiumBlur = 5,
					relativeBlur = (scaleDistance - relative.perspective) / (scaleDistance / maxiumBlur) + style.blur;

				relative.blur = relativeBlur;
			}
		}
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
		relative.blur = style.blur;
	}

	if (!style.width_tmp || !style.height_tmp){
		style.width = style.width_tmp || style.width;
		style.height = style.height_tmp || style.height;

		delete style.width_tmp;
		delete style.height_tmp;
	} else {
	    delete style.width_tmp;
	    delete style.height_tmp;
	}

	// 2차 사물 그리기 예외처리
	if (
		relative.left + relative.width + relative.width_tmp < 0 || // 화면 왼쪽으로 빠져나감
		relative.left - relative.width - relative.width_tmp > canvas_elem.width || // 화면 오른쪽으로 빠져나감
		relative.bottom + relative.height < 0 || // 화면 아래로 빠져나감
		relative.bottom - relative.height > canvas_elem.height || // 화면 위로 빠져나감
		relative.width <= 0 || //  width가 0보다 작을 때
		relative.height <= 0 || // height가 0보다 작을 때
		relative.width < disappearanceSize || // width가 소멸크기보다 작음
		relative.height < disappearanceSize || // height가 소멸크기보다 작음
		disappearanceSight !== undefined && relative.perspective > disappearanceSight // 소멸거리 지정 시 소멸거리보다 멀리있음
	){
	    this.__system__.drawing = !1;
	    return;
	}
		
	// 캔버시 지우기 및 그림 작업 (필터)
	lve_root.fn.canvasReset(style.opacity, relative.blur);
	this.__system__.drawing = !0;

	switch(this.type){
		case "image":{
			var imageObj = this.element;

			// 아직 그림 데이터가 로드되지 않았다면 그리지 않기
			if (imageObj === {})
				return;

			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			if (style.borderWidth){
				ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
				ctx.strokeStyle = style.borderColor;
				ctx.lineWidth = relative.borderWidth;
				ctx.stroke();
			}

			ctx.beginPath();

			try{
				ctx.fill();
				ctx.drawImage(imageObj, relative.left, relative.bottom, relative.width, relative.height);
			} catch(e){};

			break;
		}

		case "circle":{
			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			if (style.borderWidth){
				ctx.arc(relative.left + relative.width / 2, relative.bottom + relative.width / 2, relative.width / 2 + relative.borderWidth / 2, 0, _Math.PI * 2);
				ctx.strokeStyle = style.borderColor;
				ctx.lineWidth = relative.borderWidth;
				ctx.stroke();
			}

			ctx.beginPath();

			var fillColor = hasGradient ? getGradient(this) : style.color;

			ctx.fillStyle = fillColor;
			ctx.arc(relative.left + relative.width / 2, relative.bottom + relative.width / 2, relative.width / 2, 0, _Math.PI * 2);
			ctx.fill();

			break;
		}

		case "square":{
			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			if (style.borderWidth){
				ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
				ctx.strokeStyle = style.borderColor;
				ctx.lineWidth = relative.borderWidth;
				ctx.stroke();
			}

			ctx.beginPath();

			var fillColor = hasGradient ? getGradient(this) : style.color;

			ctx.fillStyle = fillColor;
			ctx.rect(relative.left, relative.bottom, relative.width, relative.height);
			ctx.fill();

			break;
		}

		case "text":{
		    delete relative.width_tmp;

		    if (style.position == "absolute")
		        relative.left += relative.width / 2;

			var fillColor = hasGradient ? getGradient(this) : style.color;

			ctx.font = style.fontStyle + " " + style.fontWeight + " " + relative.fontSize + "px " + style.fontFamily;
			ctx.fillStyle = fillColor;
			ctx.textAlign = style.textAlign;

			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			if (style.borderWidth){
				ctx.strokeStyle = style.borderColor;
				ctx.lineWidth = relative.borderWidth;
				ctx.strokeText(this.text, relative.left, relative.bottom, relative.width);
			}

			ctx.fillText(this.text, relative.left, relative.bottom + relative.height, relative.width);
			
			break;
		}
			
		case "video":{
			var videoObj = this.element;

			if (style.shadowColor) {
				ctx.shadowColor = style.shadowColor;
				ctx.shadowBlur = relative.shadowBlur;
				ctx.shadowOffsetX = relative.shadowOffsetX;
				ctx.shadowOffsetY = relative.shadowOffsetY;
			}

			if (style.borderWidth){
				ctx.rect(relative.left - relative.borderWidth / 2, relative.bottom - relative.borderWidth / 2, relative.width + relative.borderWidth, relative.height + relative.borderWidth);
				ctx.strokeStyle = style.borderColor;
				ctx.lineWidth = relative.borderWidth;
				ctx.stroke();
			}

			ctx.beginPath();
			ctx.rect(relative.left, relative.bottom, relative.width, relative.height);

			try{
				ctx.fill();
				ctx.drawImage(videoObj, relative.left, relative.bottom, relative.width, relative.height);
			} catch(e){};
			
			break;
		}
	}
};

// 해당 객체를 카메라로 사용함
// 다른 카메라는 계속 작동 함
// 여러대의 객체가 선택되었을 시 가장 최초 객체를 선택
/* [!] 주의사항
 * .use() 메서드는 카메라뿐 아니라 사물 역시 카메라처럼 사용할 수 있습니다
 * 다만 사물을 카메라처럼 이용할 경우, perspective값 변동으로 인한 객체들의 z-index 재정렬이 이루어집니다
 * 이는 사물이 적을 시 큰 문제가 되진 않습니다. 하지만 사물이 많아질수록 성능이 급격히 저하됩니다
 */
lve.fn.session.prototype.use = function(){
    var vars = lve_root.vars,
        cache = lve_root.cache,
		usingCamera = vars.usingCamera,
		tarCamera = this.context ? this.context[0] : this;

	// 아직 카메라가 설정되지 않았을 경우
	if (!lve_root.fn.checkCamera()){
	    vars.usingCamera = tarCamera;
		return tarCamera;
	}

	// 카메라가 지정되어 있고
	// 현재와 다른 씬일 경우
	if (usingCamera.scene != tarCamera.scene){
	    var arr_scene_old = lve_root.fn.getSceneObj(usingCamera.scene),
			arr_scene_new = lve_root.fn.getSceneObj(tarCamera.scene);

		// 현재 씬에서 비디오 객체를 순회하며 볼륨 음소거
		for (var i = 0, len_i = arr_scene_old.length; i < len_i; i++){
			var item = arr_scene_old[i];

			if (item.type == "video")
				item.element.muted = !0;
		}

		for (var i = 0, len_i = arr_scene_new.length; i < len_i; i++){
			var item = arr_scene_new[i];

			if (item.type == "video")
				item.element.muted = !1;
		}
	}

    // 카메라 갱신
	vars.usingCamera = tarCamera;
	// 객체 정렬
	cache.isNeedSort++;

	return vars.usingCamera;
};

// 객체가 해당 사물을 쫒음
// 객체가 현재 위치를 직접 이동함
// 여러대의 객체가 선택되었을 시 가장 최초 객체를 선택
lve.fn.session.prototype.follow = function(tarObjName, relativePosition){
    var	tarObj = lve_root.vars.selectorKeyword[tarObjName],
        tarObj_followInit_follower,

		relativePosition = relativePosition || {},
	    _callback = function(item){
	        var arr_follower = [],
	            item_followInit = item.follow_init;

	        // 객체에 팔로잉 지정
	        item_followInit.following = tarObj;
            // 객체의 relative 위치 수정
	        item_followInit.relative = {
	            bottom: relativePosition.bottom || 0,
	            left: relativePosition.left || 0,
	            perspective: relativePosition.perspective || 0
	        };

	        // follow 이벤트 발생
	        item.emit("follow");

	        // 팔로잉 객체에 현재 객체가 없으면
	        if (tarObj_followInit_follower.indexOf(item) == -1){
                // 리스트 추가
	            tarObj_followInit_follower.push(item);

	            // cssModified 이벤트를 걸어서 현재 객체의 팔로워의 위치 변화 (css)
	            tarObj.on("followed cssmodified animatemodified animateend followupdate", function(e){
	                for (var j = 0, len_j = e.target.follow_init.follower.length; j < len_j; j++){
	                    var	follower = e.target.follow_init.follower[j],
                            follower_style = follower.style,
                            obj_follower = follower.follow_init.relative;

	                    follower_style.left = tarObj.style.left + obj_follower.left;
	                    follower_style.bottom = tarObj.style.bottom + obj_follower.bottom;
	                    follower_style.perspective = tarObj.style.perspective + obj_follower.perspective;

	                    follower.emit("followupdate");
	                }
	            }).emit("followed"); // followed 이벤트 발생
	        }
	    };

	// 없는 객체일 경우
	if (!tarObj.length)
	    return;

    // 있는 객체일 경우, 맨 첫 객체를 팔로잉 타켓으로 지정
	tarObj = tarObj[0];
	tarObj_followInit_follower = tarObj.follow_init.follower;

	// 기존 팔로우 초기화
	lve(this).unfollow();

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return this;
};

// 객체가 해당 사물을 쫒음을 멈춤
lve.fn.session.prototype.unfollow = function(){
    var _callback = function(item){
        var item_following = item.follow_init.following,
            item_follower = item_following.follow_init.follower, // 팔로잉 대상의 팔로워 리스트
            item_index = item_follower.indexOf(item),
            arr_follower = [];

        // 팔로잉 초기화
        item.follow_init.following = undefined;
        // 팔로잉 대상의 팔로워 리스트에서 본인 제거
        item_follower.splice(item_index, 1);

        // unfollow 이벤트 발생
        item.emit("unfollow");

        // 팔로잉 대상 cssModified 이벤트 제거
        // 팔로잉 대상 unfollowed 이벤트 발생
        item_following.off("cssmodified").emit("unfollowed");
    };

    if (this.context){
        var i = this.context.length;
        while (i--){
            var item = this.context[i];

            // following 객체가 없을 경우
            if (!item.follow_init.following)
                continue;

            _callback(item);
        }
    }
    else
        _callback(this);

	return this;
};

// 해당 객체의 follower를 제거함
lve.fn.session.prototype.kick = function(tarObjName){
    var arr_kickTar = lve_root.vars.selectorKeyword[tarObjName],
        _callback = function(item){
            var item_follower = item.follow_init.follower;
			
            for (var j = 0, len_j = item_follower.length; j < len_j; j++)
                // 해당 팔로워가 킥 리스트에 있을 경우
                // 언팔로우
                // 팔로워 kicked 이벤트 발생
                if (arr_kickTar.indexOf(item_follower[j]) != -1)
                    item_follower[j].unfollow().emit("kicked");

            // kick 이벤트 발생
            item.emit("kick");
        };

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return this;
};

// 해당 객체를 움직임
// 이미 움직이고 있었을 시 기존 설정 초기화
lve.fn.session.prototype.animate = function(data, duration, easing, callback){
	if (!data)
		return;

	var tmp_duration = typeof duration == "number" ? duration : 1,
		tmp_easing = typeof easing == "string" ? easing : "linear",
		tmp_callback = arguments[arguments.length - 1],
        _adjustJSON = lve_root.fn.adjustJSON,
		_callback = function(item){
		    var _data = _adjustJSON(data, item),
			    ani_init = item.ani_init;

		    ani_init.count = ani_init.count || {};
		    ani_init.count_max = ani_init.count_max || {};
		    ani_init.duration = ani_init.duration || {};
		    ani_init.easing = ani_init.easing || {};
		    ani_init.origin = ani_init.origin || {};

		    for (var j in _data){
		        // animate 가능한 속성인 경우
		        // 불가능한 경우 -> #0075c8, red, DOMElement 등
		        if (isNaN(_data[j] - 0))
		            continue;

		        if (_data[j] !== undefined && _data[j] !== item.style[j]){
		            ani_init.duration[j] = tmp_duration;
		            ani_init[j] = _data[j];
		            ani_init.origin[j] = item.style[j];
		            ani_init.count[j] = 0;
		            ani_init.count_max[j] = _Math.ceil(ani_init.duration[j] / 1000 * 60);
		            ani_init.easing[j] = tmp_easing;
		        }
		    }

		    // 콜백 스택 저장
		    if (typeof tmp_callback == "function") {
		        lve_root.cache.arr_callback.push({
		            count: _Math.ceil(tmp_duration / 1000 * 60),
		            fn: tmp_callback,
		            target: item
		        });
		    }

		    item.emit("animatestart");
		};

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return this;
};

// 해당 객체의 움직임을 멈춤
lve.fn.session.prototype.stop = function(){
    var _callback = function(item){
        // animate 속성 초기화 후
        // animatestop 이벤트 발생
        item.ani_init = {};
        item.emit("animatestop");
    };

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return this;
};

// 객체를 삭제
lve.fn.session.prototype.remove = function(){
    var	vars = lve_root.vars,
        cache = lve_root.cache,

		arr_object = vars.arr_object,
		arr_callback = cache.arr_callback,
		arr_keyword = vars.selectorKeyword,
		canvas = vars.initSetting.canvas.element,
		_callback = function(item){
		    var item_index = {
		            arr_object: arr_object.indexOf(item),
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
		    arr_keyword[item.name].splice(item_index.arr_keyword, 1);

		    // 사용중인 카메라 객체일 경우
		    // 카메라 설정 초기화
		    if (item == vars.usingCamera)
		        vars.usingCamera = {};

		    // 키워드 삭제
		    delete arr_keyword["[PRIMARY=" + item.primary + "]"];
		    delete arr_keyword["[primary=" + item.primary + "]"];
		},
	    this_name = this.name;

	// 객체정보배열을 돌면서 일괄삭제 후
    // 객체정보배열 재생성
	if (this.context){
	    var i = this.context.length;
	    while (i--)
	        _callback(this.context[i]);
	}
	else
	    _callback(this);

	// 해당 키워드의 모든 객체가 삭제되었을 경우
	// 해당 키워드 삭제
	if (arr_keyword.hasOwnProperty(this_name))
		if (!arr_keyword[this_name].length)
			delete arr_keyword[this_name];
};

// 객체에 이벤트를 검
lve.fn.session.prototype.on = function(e, fn){
    var arr_event = lve_root.cache.arr_event;

	if (e === undefined){
		console.error("이벤트리스너가 없습니다. 다음 중 한 가지를 필수로 선택해주세요. (" + arr_event.join(", ") + ")");
		return;
	}

	else if (!fn)
		return;

	e = e.toLowerCase().split(" ");

	for (var i = 0, len_i = e.length; i < len_i; i++){
		var item = e[i];

		if (arr_event.indexOf(item) == -1){
			console.error(item + "은(는) 존재하지 않는 이벤트입니다. 이용할 수 있는 이벤트는 다음과 같습니다. (" + arr_event.join(", ") + ")");
			return;
		}

	    // 객체를 순회하며 이벤트 할당
		if (this.context)
		    for (var j = 0, len_j = this.context.length; j < len_j; j++)
		        this.context[j].events[item].push(fn);
		else
		    this.events[item].push(fn);
	}

	return this;
};

// 객체에 이벤트 제거
lve.fn.session.prototype.off = function(e){
    var arr_event = lve_root.cache.arr_event;

	if (e === undefined){
	    console.error("이벤트가 없습니다. 다음 중 한 가지를 필수로 선택해주세요. (" + arr_event.join(", ") + ")");
		return;
	}

	e = e.toLowerCase().split(" ");

	for (var i = 0, len_i = e.length; i < len_i; i++){
		var item = e[i];

		if (arr_event.indexOf(item.toLowerCase()) == -1){
			console.error("존재하지 않는 이벤트입니다. 이용할 수 있는 이벤트는 다음과 같습니다. (" + arr_event.join(", ") + ")");
			return;
		}

	    // 객체를 순회하며 이벤트 제거
		if (this.context)
		    for (var j = 0, len_j = this.context.length; j < len_j; j++)
		        this.context[j].events[item] = [];
		else
		    this.events[item] = [];
	}

	return this;
};

// 객체를 재생함
lve.fn.session.prototype.play = function () {
	if (!lve_root.vars.isRunning)
	    return;

	var _callback = function(item){
	    if (!item.src){
	        console.error("객체에 src 속성이 없어 재생할 수 없습니다. attr 메서드를 이용하여 먼저 속성을 부여하십시오.");
	        return;
	    }

	    else if (!item.element.play) {
	        console.error("재생할 수 객체입니다. 이 메서드는 type 속성이 video 같은 재생/정지가 가능한 객체에 이용하십시오.");
	        return;
	    }

	    item.element.setAttribute("data-play", !0);
	    item.element.play();
	};

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return this;
};

// 객체의 재생을 멈춤
lve.fn.session.prototype.pause = function () {
    var _callback = function(item){
        if (!item.element.pause) {
            console.error("정지가 불가능한 객체입니다. 이 메서드는 type 속성이 video 같은 재생/정지가 가능한 객체에 이용하십시오.");
            return;
        }

        item.element.pause();
        item.emit("pause");
    };

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return this;
};

// 객체에 클래스 추가
lve.fn.session.prototype.addClass = function(_className){
    var isFn = typeof _className == "function",
        _callback = function(item){
            var className = isFn ? _className(item) : _className,
                arr_newClassName = className.split(" ");

            for (var i = 0, len_i = arr_newClassName.length; i < len_i; i++){
                var item_className = item.className + "",
			        tarClass = arr_newClassName[i],
                    arr_className = item_className.split(" "),
			        index_className = arr_className.indexOf(tarClass);

                // 해당 객체에 className이 없을 경우
                if (index_className == -1){
                    arr_className.push(tarClass);

                    if (arr_className[0] == "")
                        arr_className.splice(0, 1);

                    item.className = arr_className.join(" ");
                    item.emit("addclass");
                }
            }
        };

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return this;
};

// 객체에 클래스 제거
lve.fn.session.prototype.removeClass = function(_className){
    var isFn = typeof _className == "function",
        _callback = function(item){
            var className = isFn ? _className(item) : _className,
                arr_newClassName = className.split(" ");

            for (var i = 0, len_i = arr_newClassName.length; i < len_i; i++){
                var item_className = item.className + "",
			        tarClass = arr_newClassName[i],
                    arr_className = item_className.split(" "),
			        index_className = arr_className.indexOf(tarClass);

                // 해당 객체에 className이 있을 경우
                if (index_className != -1){
                    arr_className.splice(index_className, 1);

                    if (arr_className[0] == "")
                        arr_className.splice(0, 1);

                    item.className = arr_className.join(" ");
                    item.emit("removeclass");
                }
            }
        };

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return this;
};

// 객체에 클래스 반전
lve.fn.session.prototype.toggleClass = function(_className){
    var isFn = typeof _className == "function",
        _callback = function(item){
            var className = isFn ? _className(item) : _className,
                arr_newClassName = className.split(" ");

            for (var i = 0, len_i = arr_newClassName.length; i < len_i; i++){
                var item_className = item.className + "",
			        tarClass = arr_newClassName[i],
                    arr_className = item_className.split(" "),
                    index_className = arr_className.indexOf(tarClass);

                // 해당 객체에 className이 없을 경우
                if (index_className == -1)
                    arr_className.push(tarClass);

                    // 해당 객체에 className이 있을 경우
                else
                    arr_className.splice(index_className, 1);

                if (arr_className[0] == "")
                    arr_className.splice(0, 1);

                item.className = arr_className.join(" ");
                item.emit("toggleclass");
            }
        };

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return this;
};

// 객체들에 클래스가 있는지 확인
lve.fn.session.prototype.hasClass = function(_className){
    var isExist = !0,
		isFn = typeof _className == "function",
        _callback = function(item){
            var item_className = item.className + "",
			    className = isFn ? _className(item) : _className,
			    arr_className = item_className.split(" "),
			    index_className = arr_className.indexOf(className);

            // 해당 객체에 className이 없을 경우
            if (index_className == -1)
                isExist = !1;
        };

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i && isExist; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return isExist;
};

// 객체에 해당되는 클래스가 있는 객체만 추출
lve.fn.session.prototype.findClass = function(_className){
    var retArray = {
        name: this.name,
        context: []
    },
	isFn = typeof _className == "function",
    _callback = function(item){
        var item_className = item.className + "",
			className = isFn ? _className(item) : _className,
			arr_className = item_className.split(" "),
			index_className = arr_className.indexOf(className);

        // 해당 객체에 className이 없을 경우
        if (index_className != -1)
            retArray.context.push(item);
    };

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return lve(retArray);
};

lve.fn.session.prototype.notClass = function(_className){
	var retArray = {
		name: this.name,
		context: []
	},
	isFn = typeof _className == "function",
	_callback = function(item){
	    var item_className = item.className + "",
			className = isFn ? _className(item) : _className,
			arr_className = item_className.split(" "),
			index_className = arr_className.indexOf(className);

	    // 해당 객체에 className이 없을 경우
	    if (index_className == -1)
	        retArray.context.push(item);
	};

	if (this.context)
	    for (var i = 0, len_i = this.context.length; i < len_i; i++)
	        _callback(this.context[i]);
	else
	    _callback(this);

	return lve(retArray);
};

lve.fn.session.prototype.element = function(){
    var retArray = [],
        _callback = function(item){
            if (item.element.nodeName)
                retArray.push(item.element);
        };

    if (this.context)
        for (var i = 0, len_i = this.context.length; i < len_i; i++)
            _callback(this.context[i]);
    else
        _callback(this);

    return retArray;
};

// 객체의 이벤트 발생
lve.fn.session.prototype.emit = function(e, detail = {}){
    var arr_events = e.toLowerCase().split(" "),
        _callback = function(item){
            for (var j = 0, len_j = arr_events.length; j < len_j; j++){
                var tarEvent = arr_events[j],
                    arr_eventList = item.events[tarEvent],
			        eObj = {
			            type: tarEvent,
			            target: item,
			            originalEvent: detail
			        };

                for (var k in arr_eventList)
                    arr_eventList[k](eObj);
            }
        };

    if (this.context)
        for (var i = 0, len_i = this.context.length; i < len_i; i++)
            _callback(this.context[i]);
    else
        _callback(this);
};
