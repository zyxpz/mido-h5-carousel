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
      time: opts.time || 3000, // 播放时间 默认3000
      horizontal: opts.horizontal || false, // 方向 默认横向
      point: opts.point || false, // 是否创建小点
      pointColor: opts.pointColor || 'blue', // 选择颜色
      pointSize: opts.pointSize || '6px', // 圆点大小
      touch: opts.touch || false, // 是否可滑动
      half: opts.half || null // 切换
    }

    this.index = 0;
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

    this._warp.style.cssText = `transform: translate3d(0, 0, 0); transition: none`

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
      pointDom.innerHTML += `<span class='point-list-${this.attrs.horizontal}' data-tap='${i}'>●</span>`
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
    this.attrs.startPos = e.touches[0].pageY

    this.attrs.startPosX = e.touches[0].pageX

    this.attrs.endPos = 0

    this.attrs.endPosX = 0

    if (new RegExp(this.attrs.main).test(e.target.className)) {
      this.index = e.target.index
    } else {
      this.index = e.target.parentNode.index
    }

    this._warp.addEventListener('touchmove', this.handleTouchMove.bind(this))

    clearInterval(this.interval)
  }

  handleTouchMove(e) {
    e.preventDefault()

    this.attrs.endPos = e.touches[0].pageY

    this.attrs.endPosX = e.touches[0].pageX

    if (this.attrs.horizontal) {
      this._warp.style.cssText = `transform: translate3d(${this.attrs.endPosX - this.attrs.startPosX - this.index * e.target.offsetWidth}px, 0, 0); transition: none`
    } else {
      this._warp.style.cssText = `transform: translate3d(0, ${this.attrs.endPos - this.attrs.startPos - this.index * e.target.offsetHeight}px, 0); transition: none`
    }

  }

  handleTouchEnd() {
    let isMove;
    let halfs;
    if (this.attrs.horizontal) {
      halfs = this.attrs.half || this.warpW * .5
      isMove = ~~(this.attrs.endPosX - this.attrs.startPosX)
      if (Math.abs(isMove) > 0 && this.attrs.endPosX !== 0) {
        if (Math.abs(isMove) >= halfs) {
          if (isMove < 0) {
            this.handleMoveList(this.index + 1)
            this.handlePoint(this.index + 1)
          } else {
            this.handleMoveList(this.index - 1)
            this.handlePoint(this.index - 1)
          }
        } else {
          this.handleMoveList(this.index)
        }
      } else {
        console.log('未拖动')
      }

    } else {
      isMove = ~~(this.attrs.endPos - this.attrs.startPos)
      halfs = this.attrs.half || this.warpH * .5
      if (Math.abs(isMove) > 0 && this.attrs.endPos !== 0) {
        if (Math.abs(isMove) >= halfs) {
          if (isMove < 0) {
            this.handleMoveList(this.index + 1)
            this.handlePoint(this.index + 1)
          } else {
            this.handleMoveList(this.index - 1)
            this.handlePoint(this.index - 1)
          }
        } else {
          this.handleMoveList(this.index)
        }
      } else {
        console.log('未拖动')
      }
    }
  }


  handleMoveList(index) {
    let start,
      end

    if (this.attrs.horizontal) {
      start = parseInt(this._warp.style.transform.slice(12))
      end = -(index * this.warpW)
      this.tweenTranslateAnimate(start, end, () => {
        switch (index) {
          case this._mainLen:
            this.handleMainMove(0)
            break;
          case -1:
            this.handleMainMove(this.warpW * (1 - this._mainLen))
            break;
          default:
            break;
        }
      })
    } else {
      start = parseInt(this._warp.style.transform.slice(16))
      end = -(index * this.warpH)
      this.tweenTranslateAnimate(start, end, () => {
        switch (index) {
          case this._mainLen:
            this.handleMainMove(0)
            break;
          case -1:
            this.handleMainMove(this.warpH * (1 - this._mainLen))
            break;
          default:
            break;
        }
      })
    }
  }

  handleMainMove(pos) {
    if (this.attrs.horizontal) {
      this._warp.style.cssText = `transform: translate3d(${pos}px, 0, 0); transition: none`
    } else {
      this._warp.style.cssText = `transform: translate3d(0, ${pos}px, 0); transition: none`
    }
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

  handlePlayer() {
    this.interval = setInterval(function () {
      this.handleMoveList(this.index++)
    }.bind(this), this.attrs.time)
  }

  tweenTranslateAnimate(start, end, cb) {
    let duration = 50;
    let t = 0;
    let vv = end - start; //移动的值
    let easeOut = (t, b, c, d) =>
      -c * (t /= d) * (t - 2) + b;

    this.timer = setInterval(function () {
      let dis = start + easeOut(++t, 0, vv, duration);
      if (this.attrs.horizontal) {
        this._warp.style.transform = `translate3d(${parseInt(dis)}px, 0, 0)`
        if (vv > 0 && parseInt(this._warp.style.transform.slice(12)) >= end) {
          this._warp.style.transform = `translate3d(${parseInt(dis)}px, 0, 0)`
          clearInterval(this.timer);
          cb && cb();
        }
        if (vv < 0 && parseInt(this._warp.style.transform.slice(12)) <= end) {
          this._warp.style.transform = `translate3d(${parseInt(dis)}px, 0, 0)`
          clearInterval(this.timer)
          cb && cb();
        }
      } else {
        this._warp.style.transform = `translate3d(0, ${parseInt(dis)}px, 0)`
        if (vv > 0 && parseInt(this._warp.style.transform.slice(16)) >= end) {
          this._warp.style.transform = `translate3d(0, ${parseInt(dis)}px, 0)`
          clearInterval(this.timer);
          cb && cb();
        }

        if (vv < 0 && parseInt(this._warp.style.transform.slice(16)) <= end) {
          this._warp.style.transform = `translate3d(0, ${parseInt(dis)}px, 0)`
          clearInterval(this.timer)
          cb && cb();
        }
      }
    }.bind(this), 4)
  }
}