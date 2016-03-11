# lve
lve.js - Light Visualnovel Engine

##![LOGO](https://drive.google.com/uc?id=0B5VYTQdG_I-XZDBHSzNCd2h6anc)

lve.js는 html5의 canvas로 구현 가능한 비주얼노벨 엔진입니다.
쿼터뷰 형식의 3d 기능을 지원합니다.

좀 더 빠른 최신버전 업데이트는
[개발자 블로그](http://blog.linoaca.com/220650672644)에서 확인하실 수 있습니다.

## 기본 사용법 - 설정하기
```javascript
window.onload = function(){
    lve.init({
        canvas: document.getElementById('myCanvas'), // 보여줄 캔버스를 설정합니다. 필수 항목
        scaleDistance: 150, // 객체가 정상적인 크기로 보일 Perspective입니다. 이 수치보다 Perspective가 적을 시 더 크게 보입니다. 기본값은 150입니다
        disappearanceSight: undefined, // 시야 거리입니다. 객체와 현재 카메라의 perspective 차이가 이 수치보다 클 경우, 캔버스에 그리지 않습니다. 이는 최적화 용도로 사용됩니다. 기본값은 undefined입니다.
        disappearanceSize: undefined, // 객체의 perspective로 인해 크기가 이 수치보다 작아보일 때, 캔버스에 그리지 않습니다. 이는 최적화 용도로 사용됩니다. 기본값은 undefined입니다.
        frameLimit: 60, // 초당 프레임 제한을 설정합니다. 기본값은 60입니다
        backgroundColor: "white", // 캔버스 배경 색상을 설정합니다. 기본 white
    });
};
```
### 좀 더 간단히...

```javascript
lve.init({
    canvas: document.getElementById('myCanvas')
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
perspective: 0 // 객체가 얼마나 멀리 떨어져있는지 설정합니다. type이 camera일 경우 기본값은 0, 그 외의 type은 lve.init의 scaleDistance를 따릅니다. scaleDistance의 기본값은 150입니다.
```

> 예제 https://jsfiddle.net/izure/u99gwq5b/4/


## 카메라 객체를 사용하기

lVE.js는 무한대의 카메라를 만들 수 있고, 원하는 카메라를 사용함으로써 다른 비전으로 월드를 볼 수 있습니다.
사용하는 함수는 use()입니다.

```javascript
lve("카메라이름").use()
```

> 예제 https://jsfiddle.net/izure/u99gwq5b/5/
