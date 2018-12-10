Object.prototype.prepend = function (newElenment) {
  this.innerHTML = arguments[0] + this.innerHTML
  return this
}

const loop = () => {}

export default class Carousel {
  constructor(opts) {
    this.attrs = {
      warp: opts.warp,
      main: opts.main,
      startPos: '', // 初始位置
      endPos: '', // 结束位置
      play: opts.play || false, // 自动播放
      time: opts.time || 3000, // 播放时间 默认2000
      horizontal: opts.horizontal || false, // 方向 默认横向
      point: opts.point || false,
      pointColor: opts.pointColor || 'blue',
      pointSize: opts.pointSize || '6px',
      touch: opts.touch || false,
      pointEleRender: opts.pointEleRender || loop,
      onSwitch: opts.onSwitch || loop
    }

    this.index = 0;

    this.stop = false;
  }

  init() {
    this._warp = document.querySelector(`.${this.attrs.warp}`)

    this._main = document.querySelectorAll(`.${this.attrs.main}`)

    this._mainLen = this._main.length

    const warpH = this._warp.offsetHeight

    const warpW = this._warp.offsetWidth

    this.warpH = warpH

    this.warpW = warpW

    const cloneFirst = this._main[0].cloneNode(true)

    const cloneLast = this._main[this._main.length - 1].cloneNode(true)

    this._warp.appendChild(cloneFirst)

    this._warp.prepend(cloneLast)

    this._warp.childNodes.forEach((e, i) => {
      if (e.nodeType === 1) {
        e.style.height = `${warpH}px`;
        if (this.attrs.horizontal) {
          e.style.left = `${warpW * ((i / 2) - 1)}px`
        } else {
          e.style.top = `${warpH * ((i / 2) - 1)}px`
        }
        e.index = (i / 2) - 1
      }
    });

    if (this.attrs.touch) {
      this.handleMoveEventListener();
    }

    if (this.attrs.play) {
      this.handlePlayer()
    }

    // 创建小点
    if (this.attrs.point) {
      this.createPoint()

      this.handlePoint(this.index)
    }
  }

  createPoint() {
    const styleEl = document.createElement('style')

    const parentEle = this._warp.parentNode

    parentEle.style.position = 'relative'

    let pointDom = document.createElement('div');

    pointDom.className = `point-dom-${this.attrs.horizontal}`
    this._main.forEach((e, i) => {
      pointDom.innerHTML += this.attrs.pointEleRender(i) || `<span class='point-list-${this.attrs.horizontal}' data-tap='${i}'>●</span>`
    });

    if (this.attrs.horizontal) {
      styleEl.innerHTML =
        `
          .point-dom-true {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translate(-50%, 0);
          }
          .point-list-true {
            margin-right: 5px;
            font-size: ${this.attrs.pointSize};
          }
          .point-dom-true .selected-point-list {
            color: ${this.attrs.pointColor};
          }
        `
    } else {
      styleEl.innerHTML =
        `
        .point-dom-false {
          position: absolute;
          top: 50%;
          left: 30px;
          transform: translate(0, -50%);
        }
        .point-list-false {
          margin-right: 5px;
          display: block;
          font-size: ${this.attrs.pointSize};
        }
        .point-dom-false .selected-point-list {
          color: ${this.attrs.pointColor};
        }
      `
    }


    parentEle.appendChild(pointDom)

    parentEle.appendChild(styleEl)

    this.pointList = pointDom.childNodes

  }

  handleMoveEventListener() {
    this._warp.addEventListener('touchstart', this.handleTouchStart.bind(this))

    this._warp.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  handleTouchStart(e) {
    e.preventDefault()
    
    if (this.stop) {
      console.log('stop')
      return
    }

    this.attrs.startPos = e.touches[0].pageY

    this.attrs.startPosX = e.touches[0].pageX

    this.attrs.endPos = ''

    if (new RegExp(this.attrs.main).test(e.target.className)) {
      this.index = e.target.index
    } else {
      this.index = e.target.parentNode.index
    }

    clearInterval(this.interval)

    this._warp.addEventListener('touchmove', this.handleTouchMove.bind(this))

  }

  handleTouchMove(e) {
    e.preventDefault()

    this.attrs.endPos = e.touches[0].pageY

    this.attrs.endPosX = e.touches[0].pageX

    // if (this.attrs.horizontal) {
    //   this._warp.style.cssText = `transform: translate3d(${this.attrs.endPosX - this.attrs.startPosX - this.index * e.target.offsetWidth}px, 0, 0); transition: none`
    // } else {
    //   this._warp.style.cssText = `transform: translate3d(0, ${this.attrs.endPos - this.attrs.startPos - this.index * e.target.offsetHeight}px, 0); transition: none`
    // }

  }

  handleTouchEnd() {
    if (this.stop) {
      console.log('stop')
      return
    }
    if (this.attrs.horizontal && this.attrs.endPos !== '') {
      if ((this.attrs.endPosX - this.attrs.startPosX) > 10) {
        this.prev()
      } else if ((this.attrs.endPosX - this.attrs.startPosX) < -10) {
        this.next()
      }
    } else {
      if ((this.attrs.endPos - this.attrs.startPos) > 10) {
        this.prev()
      } else if ((this.attrs.endPos - this.attrs.startPos) < -10) {
        this.next()
      }
    }

    if (this.attrs.play) {
      this.handlePlayer()
    }

  }

  prev() {
    this.index = this.index - 1

    if (this.index < 0) {
      this.index = -1
      this.domShow(this.index)
      return
    }

    this.domShow(this.index)
  }

  next() {
    this.index = this.index + 1

    if (this.index >= this._mainLen) {
      this.index = this._mainLen
      this.domShow(this.index)
      return
    }

    this.domShow(this.index)
  }

  handlePoint(index) {
    if (index === -1) {
      index = this._mainLen - 1
    } else if (index === this._mainLen) {
      index = 0
    }
    this.pointList.forEach(e => {
      if (e.getAttribute('data-tap') === index.toString()) {
        e.className = e.className.replace(/selected-point-list/, '');
        e.className += ' selected-point-list'
      } else {
        e.className = e.className.replace(/\s+selected-point-list/, '');
      }
    })
  }

  domShow(index) {
    const that = this;
    if (this.attrs.horizontal) {
      if (index === -1) {
        this.index = this._mainLen
        this._warp.style.cssText = `transform: translate3d(${1 * this.warpW}px, 0, 0); transition: transform .5s`
        this.stop = true
        this.timmer = setTimeout(() => {
          this._warp.style.cssText = `transform: translate3d(${-(this._mainLen - 1) * this.warpW}px, 0, 0);`
          this.stop = false
          clearTimeout(that.timmer)
        }, 550);
      } else {
        this._warp.style.cssText = `transform: translate3d(${-index * this.warpW}px, 0,0); transition: transform .5s`
      }

      if (index === this._mainLen) {
        this.index = 0
        this.stop = true
        this.timmer = setTimeout(() => {
          this._warp.style.cssText = `transform: translate3d(0, 0, 0);`
          this.stop = false
          clearTimeout(that.timmer)
        }, 550);
      }
    } else {
      if (index === -1) {
        this.index = this._mainLen
        this._warp.style.cssText = `transform: translate3d(0, ${1 * this.warpH}px, 0); transition: transform .5s`

        this.timmer = setTimeout(() => {
          this._warp.style.cssText = `transform: translate3d(0, ${-(this._mainLen - 1) * this.warpH}px, 0);`
          clearTimeout(that.timmer)
        }, 550);
      } else {
        this._warp.style.cssText = `transform: translate3d(0, -${index * this.warpH}px, 0); transition: transform .5s`
      }

      if (index === this._mainLen) {
        this.index = 0
        this.timmer = setTimeout(() => {
          this._warp.style.cssText = `transform: translate3d(0, 0, 0);`
          clearTimeout(that.timmer)
        }, 550);
      }
    }

    if (this.attrs.point) {
      this.handlePoint(index)
    }

    this.attrs.onSwitch(this.index)
  }

  handlePlayer() {
    this.interval = setInterval(() => {
      this.next()
    }, this.attrs.time)
  }
}