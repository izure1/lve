# LVE.js
Light Visualnovel Engine

##![LOGO](https://drive.google.com/uc?id=0B5VYTQdG_I-XZDBHSzNCd2h6anc)

lve.js는 html5의 canvas로 구현 가능한 비주얼노벨 엔진입니다.
쿼터뷰 형식의 3d 기능을 지원합니다.

좀 더 빠른 최신버전 업데이트는
[개발자 블로그](http://blog.izure.org/220650672644)에서 확인하실 수 있습니다.
[개발자 센터](http://cafe.naver.com/lvejs)에서 당신이 원하는 정보를 찾을 수 있습니다.

## 기본 사용법 - 설정하기
```javascript
lve.init({
  canvas: '#myCanvas', // 보여줄 캔버스를 설정합니다. 필수 항목
  scaleDistance: 100, // 객체가 정상적인 크기로 보일 Perspective입니다. 이 수치보다 Perspective가 적을 시 더 크게 보입니다. 기본값은 100입니다
  disappearanceSight: undefined, // 시야 거리입니다. 객체와 현재 카메라의 perspective 차이가 이 수치보다 클 경우, 캔버스에 그리지 않습니다. 이는 최적화 용도로 사용됩니다. 기본값은 undefined입니다.
  disappearanceSize: 0.35, // 객체의 perspective로 인해 크기가 이 수치보다 작아보일 때, 캔버스에 그리지 않습니다. 이는 최적화 용도로 사용됩니다. 기본값은 0.35입니다.
  frameLimit: 60, // 초당 프레임 제한을 설정합니다. 기본값은 60입니다
  backgroundColor: "white", // 캔버스 배경 색상을 설정합니다. 기본 white
});
```
### 좀 더 간단히...

```javascript
lve.init({
    canvas: '#myCanvas'
});
```


## 기본 사용법 - 객체 생성하기
```javascript
lve("객체이름").create({
    type: "camera", // 객체의 타입을 설정합니다. camera, image, circle, square, text 총 5개가 있습니다
});
```
사용할 수 있는 타입 갯수는 정해져 있습니다
- camera: 해당 객체는 카메라임. 월드를 보기 위해선 이 객체를 생성해야함
- image: 해당 객체는 이미지임. src 속성이 추가로 필요함
- circle: 해당 객체는 원형 구임
- square: 해당 객체는 사각형임
- text: 해당 객체는 글상자임
- video: 해당 객체는 비디오임. src 속성이 추가로 필요함

> 예제 https://jsfiddle.net/izure/u99gwq5b/2/

## 기본 사용법 - 객체에 CSS 설정하기

```javascript
lve("객체이름").css({
 ... (속성)
});
```

지원하는 CSS 속성은 다음과 같습니다.
```javascript
fontSize: 10, // 객체 type이 text일 경우
fontFamily: 'arial, sans-serif', // 객체 type이 text일 경우
fontWeight: "normal", // 객체 type이 text일 경우
fontStyle: "normal", // 객체 type이 text일 경우
textAlign: "left", // 객체 type이 text일 경우
width: 10, // 객체의 넓이를 설정합니다
height: 10, // 객체의 높이를 설정합니다
color: "black", // 객체의 색상을 설정합니다
borderWidth: 0, // 객체의 테두리 두께를 설정합니다
borderColor: "black", // 객체의 테두리 색상을 설정합니다
shadowColor: undefined,  // 객체의 그림자 색상을 설정합니다. 따로 설정하지 않을 시, 기본값은 undefined이며 보여지지 않습니다
shadowBlur: 10, // 객체의 그림자 번짐 정도를 설정합니다
shadowOffsetX: 0, // 객체의 그림자 X좌표를 설정합니다
shadowOffsetY: 0, // 객체의 그림자 Y좌표를 설정합니다
position: "absolute", // 객체의 위치를 설정할 때 사용합니다. absolute와 fixed 두개가 있습니다 .기본값은 absolute입니다
bottom: 0, // 객체가 바닥으로부터 얼마나 높이있는지 설정합니다
left: 0, // 객체가 왼쪽으로 얼마나 있는지 설정합니다
perspective: 0, // 객체가 얼마나 멀리 떨어져있는지 설정합니다. type이 camera일 경우 기본값은 0, 그 외의 type은 lve.init의 scaleDistance를 따릅니다. scaleDistance의 기본값은 100입니다.
opacity: 1, // 객체의 투명도를 말합니다
rotate: 0, // 객체의 회전도를 말합니다. 현재는 옵션만 있고 사용할 수 없습니다. 추후에 추가될 것입니다.
scale: 1, // 객체의 크기 비율을 말합니다.
blur: 0, // 객체의 흐림도를 말합니다.
gradientDirection: 0, // 객체의 그라디언트의 방향을 말합니다. 단위는 각도(deg)입니다
gradientType: "", // 객체의 그라디언트 종류를 말합니다. 직선 그라디언트는 linear, 원형 그라디언트는 radial 입니다. 객체마다 기본값이 다릅니다.
gradient: {}, // 객체의 그라디언트를 지정할 수 있습니다.
pointerEvents: true, // false로 설정되었을 시, 객체에게 click, dblclick, mousemove, mousedown, mouseup 이벤트를 제외합니다.
display: true // false로 설정되었을 시, 객체가 화면에서 보이지 않습니다. opacity와는 다른 개념입니다.
```

> 예제 https://jsfiddle.net/izure/u99gwq5b/4/


## 카메라 객체를 사용하기

lVE.js는 무한대의 카메라를 만들 수 있고, 원하는 카메라를 사용함으로써 다른 비전으로 월드를 볼 수 있습니다.
사용하는 함수는 use()입니다.

```javascript
lve("카메라이름").use()
```

> 예제 https://jsfiddle.net/izure/u99gwq5b/5/
