# h5轮播图

```js
const carousel = new Carousel({
		warp: 'warp', // 父元素
		main: 'main', // 子元素
		play: true, // 是否自动播放
    point: true, // 是否带有小标
    time: 3000, // 转换时间 默认3000
    horizontal: true, // 是否横像
    pointColor: 'blue', // 小点颜色
    pointSize: '6px', // 圆点大小
    touch: true, // 是否可滑动 默认不可以
    half: 40, // 默认为宽度一半
	})

	carousel.init();
```