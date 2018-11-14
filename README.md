# h5轮播图

```js
const carousel = new Carousel({
		warp: 'warp', // 父元素
		main: 'main', // 子元素
		play: true, // 是否自动播放
    point: true, // 是否带有小标
    time: 2000, // 转换时间 默认2000
    horizontal: true, // 是否横像
    pointColor: 'blue', // 小点颜色
    pointSize: '6px', // 圆点大小
    touch: true, // 是否可滑动 默认不可以
    pointEleRender: function(currentIndex) {
      return `<span data-tap='${currentIndex}'>${currentIndex}</span>`
    }, // 可修改圆点样式
    onSwitch: function(currentIndex) {
      console.log(currentIndex)
    } // 返回切换的index
	})

	carousel.init();
```