function KeyPress() {
	this.keyListeners = []
}
KeyPress.prototype = {
	addKeyListener: function (keyAndListener) {
		this.keyListeners.push(keyAndListener)
	},

	findKeyListener: function (key) {
		var listener = undefined

		this.keyListeners.forEach(function (keyAndListener) {
			var currentKey = keyAndListener.key
			if (currentKey === key) {
				listener = keyAndListener.listener
			}
		})

		return listener
	},

	keyPressed: function (e) {
		var listener = undefined,
			key = undefined

		switch (e.keyCode) {
			case 32: key = 'space'; break;
			case 37: key = 'left'; break;
			case 39: key = 'right'; break;
			case 38: key = 'up'; break;
			case 40: key = 'down'; break;
		}
		listener = this.findKeyListener(key)
		if (listener) {
			listener()
		}
	}
}



var canvas = document.getElementById('canvas')
var context = canvas.getContext('2d')
var increaseBtn = document.getElementById('increase')
var decreaseBtn = document.getElementById('decrease')
var isCollisions = false
var deg = 0

var Rectangle = function () {
	this.x = 120
	this.y = 60
	this.w = 50
	this.h = 50
}

var Circle = function () {
	this.x = 50
	this.y = 50
	this.r = 30
}

Rectangle.prototype = {
	paint: function () {
		this.getPathOfShape()
		context.save()
		context.fillStyle = 'black'
		context.fill()
		context.restore()
	},
	getPathOfShape: function () {
		var ctx = context
		var angleOfDeg = deg,
			x = this.x,
			y = this.y,
			centerX = this.x + this.w / 2, // 算出當前中心
			centerY = this.y + this.h / 2, // 算出當前中心
			w = this.w,
			h = this.h,
			angleOfRad = degToRad(angleOfDeg) //把角度轉成弧度用

		//目前方形各點的位置   
		var leftTop = [x, y],
			rightTop = [x + w, y],
			rightBottom = [x + w, y + h],
			leftBottom = [x, y + h]
		//旋轉計算後，方形各點的位置   
		var rotateLeftTop = this.rotatePoint([centerX, centerY], leftTop, angleOfRad),
			rotateRightTop = this.rotatePoint([centerX, centerY], rightTop, angleOfRad),
			rotateRightBottom = this.rotatePoint([centerX, centerY], rightBottom, angleOfRad),
			rotateLeftBottom = this.rotatePoint([centerX, centerY], leftBottom, angleOfRad)

		ctx.beginPath()
		ctx.moveTo(rotateLeftTop.x, rotateLeftTop.y)
		ctx.lineTo(rotateRightTop.x, rotateRightTop.y)
		ctx.lineTo(rotateRightBottom.x, rotateRightBottom.y)
		ctx.lineTo(rotateLeftBottom.x, rotateLeftBottom.y)
		ctx.closePath()

	},
	/* 計算旋轉後的各點位置 (旋轉中心點  , 4點之一[x, y] , 旋轉角度) */
	rotatePoint: function (pivot, point, angle) {
		//太麻煩了，要的話再回來看這篇 https://github.com/JChehe/blog/issues/8
		var x = Math.round((Math.cos(angle) * (point[0] - pivot[0])) - (Math.sin(angle) * (point[1] - pivot[1])) + pivot[0]),
			y = Math.round((Math.sin(angle) * (point[0] - pivot[0])) + (Math.cos(angle) * (point[1] - pivot[1])) + pivot[1]);
		return { x: x, y: y };
	}
}

function degToRad(deg) { //把角度轉成弧度用
	return deg * Math.PI / 180;
}

Circle.prototype = {
	paint: function () {
		context.save()
		context.beginPath()
		context.fillStyle = 'red'
		context.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
		context.closePath()
		context.fill()
		context.restore()
	}
}

var rect = new Rectangle()
var circle = new Circle()

/* 計算碰撞 */
function detectCollision(rect, circle) {
	var cx, cy
	var angleOfRad = degToRad(-deg) //计算旋转角度的弧度值
	var rectCenterX = rect.x + rect.w / 2 //计算矩形的中心点
	var rectCenterY = rect.y + rect.h / 2
	// 计算旋转后的圆形的坐标 
	var rotateCircleX = Math.cos(angleOfRad) * (circle.x - rectCenterX) - Math.sin(angleOfRad) * (circle.y - rectCenterY) + rectCenterX
	var rotateCircleY = Math.sin(angleOfRad) * (circle.x - rectCenterX) + Math.cos(angleOfRad) * (circle.y - rectCenterY) + rectCenterY

	//比较旋转后，判定障礙物離哪個點最近，用哪個點判斷
	if (rotateCircleX < rect.x) {
		cx = rect.x
	} else if (rotateCircleX > rect.x + rect.w) {
		cx = rect.x + rect.w
	} else {//這行是代表什麼?
		cx = rotateCircleX
	}
	if (rotateCircleY < rect.y) {
		cy = rect.y
	} else if (rotateCircleY > rect.y + rect.h) {
		cy = rect.y + rect.h
	} else {
		cy = rotateCircleY
	}
	console.log('rotateCircleX', rotateCircleX)//旋轉過後的x點
	console.log('rotateCircleY', rotateCircleY)//旋轉過後的y點
	console.log('cx', cx) //
	console.log('cy', cy)
	console.log(distance(rotateCircleX, rotateCircleY, cx, cy))
	//這邊是计算旋转后的圆形的坐标与最近点坐标 (cx, cy) 之间的距离
	if (distance(rotateCircleX, rotateCircleY, cx, cy) < circle.r) {
		return true
	}

	return false

}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height)

	context.save()
	context.fillStyle = 'cornflowerblue';
	context.font = '24px Arial';
	if (isCollisions) {
		context.fillText('collision', 15, canvas.height - 10);
	} else {
		context.fillText('通过↑↓←→键移动元素', 15, canvas.height - 10)
	}
	context.restore()

	circle.paint()
	rect.paint()
}

/* 這是在處理鍵盤事件 */
function keyPressHandle(e) {
	e.preventDefault()
	keyPress.keyPressed(e)
	isCollisions = detectCollision(rect, circle)
	draw() //之後每次繪製都要調用重畫一次
}

window.addEventListener('keypress', keyPressHandle, false)
window.addEventListener('keydown', keyPressHandle, false)

draw()//第一次繪製

var keyPress = new KeyPress()
keyPress.addKeyListener({
	key: 'right',
	listener: function () {
		circle.x += 2
	}
})

keyPress.addKeyListener({
	key: 'left',
	listener: function () {
		circle.x -= 2
	}
})

keyPress.addKeyListener({
	key: 'up',
	listener: function () {
		circle.y -= 2
	}
})

keyPress.addKeyListener({
	key: 'down',
	listener: function () {
		circle.y += 2
	}
})

increaseBtn.addEventListener('click', function () {
	deg += 5
	isCollisions = detectCollision(rect, circle)
	draw()
	console.log(deg)
}, false)

decreaseBtn.addEventListener('click', function () {
	deg -= 5
	isCollisions = detectCollision(rect, circle)
	draw()
	console.log(deg)
}, false)