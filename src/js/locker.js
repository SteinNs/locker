/**
 * Created by Administrator on 2017/3/30.
 */

class Locker {
	constructor ( opt ) {
		this.height = opt.height;
		this.width = opt.width;
		this.container = document.getElementById ( opt.container );
		this.dpr = window.devicePixelRatio;
		this.status = 0;// 0初始密码1再次输入密码2检查密码

	}

	/**
	 *
	 * @param x  圆心坐标x
	 * @param y  圆心坐标y
	 */
	strokePoint ( x, y ) {
		let ctx = this.ctx;
		ctx.strokeStyle = 'grey';
		ctx.beginPath ();
		ctx.lineWidth = 2;
		ctx.arc ( x, y, this.r, 0, 2 * Math.PI, true );
		ctx.closePath ();
		ctx.stroke ();
	}

	/**
	 *
	 * @param x 圆心坐标x
	 * @param y 圆形坐标y
	 */
	fillPoint ( x, y ) {
		let ctx = this.ctx;
		ctx.fillStyle = 'orange';
		ctx.beginPath ();
		ctx.arc ( x, y, this.r - 2, 0, 2 * Math.PI, true );
		ctx.closePath ();
		ctx.fill ();
	}




	drawLine ( from, to ) {
		let ctx = this.ctx;
		ctx.save ();
		ctx.beginPath ();
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 3;
		ctx.moveTo ( from.x, from.y );
		ctx.lineTo ( to.x, to.y );
		ctx.stroke ();
		ctx.restore ();

	}


	getPosition ( e ) {
		let rect = e.currentTarget.getBoundingClientRect();
		let dpr = this.dpr;
		let pos = {
			x: (e.touches[ 0 ].clientX - rect.left) * dpr,
			y: (e.touches[ 0 ].clientY - rect.top) * dpr
		};
		return pos;
	}

	initPoints () {
		let count = 0;
		let total = 3;
		let ctx = this.ctx;
		//设半径为r,每个圆之间间距为2个圆，即4r，所以每个圆加上其右边距为2r+4r = 6r，
		//又要保证canvas对称，所以第一个圆前面还要加上4r的左边距,因此总共为4+6*n
		let r = this.r = ctx.canvas.width / (4 + 6 * n);
		this.linkedPoints = [];
		this.savLinkedPoints = [];
		this.allPoints = [];
		for (let row = 0; row < n; row++) {
			for (let col = 0; col < n; col++) {
				count++;
				let point = {
					//每个圆左边距起点与原点间距离为(6*(col|row)*r),左边距起点到圆心距离为4r+r
					x: 6 * col * r + 5 * r,
					y: 6 * row * r + 5 * r,
				};
				this.allPoints.push(point);
			}

		}
		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);//清除上次的画布
		//渲染空点
		for(let i = 0,len = this.allPoints.length; i<len;i++){
			this.strokePoint(this.allPoints[i].x,this.allPoints[i].y);
		}
	}


	initEventListener(){
		let canvas = this.canvas;
		let setPwd = this.setPwd;
		let checkPwd = this.checkPwd;
		let touchStartHandler = (e) => {
			//首先要阻止触控的默认行为——滚动页面
			e.preventDefault();
			let pos = this.getPosition(e);
			this.touching = true;
			//找到触摸到的点
			for(let i = 0,r = this.r;i<this.allPoints.length;i++){
				let curPoint = this.allPoints[i];
				if(Math.abs(pos.x - curPoint.x) < r && Math.abs(pos.y - curPoint.y) < r){
					curPoint.click = true;
					this.linkedPoints.push(curPoint);
					this.fillPoint(curPoint.x,curPoint.y,'orange',2);
				}
			}

		};
		let touchMoveHandler = (e) => {
			e.preventDefault();
			let pos = this.getPosition(e);
			let allPoints = this.allPoints;
			let linkedPoints = this.linkedPoints;
			let ctx = this.ctx;
			ctx.clearRect(0,0,this.width,this.height);
			if(this.touching ){

			}
		};
		let touchEndHandler = (e) => {
			let linkedPoints = this.linkedPoints;
			let allPoints = this.allPoints;
			let ctx = this.ctx;
			ctx.clearRect(0,0,this.width,this.height);
			for(let curPoint of allPoints){
				this.fillPoint(curPoint.x,curPoint.y);
			}
			for(let i = 0;i<linkedPoints.length-1;i++){
				this.drawLine(linkedPoints[i],linkedPoints[i+1]);
			}
			if(this.touching){
				this.touching = false;
				switch (this.status){
					case 0:
						if(linkedPoints.length <5){
							this.clearStatus();
							this.setHint('密码长度太短,至少5个点');
						} else {
							this.status = 1;

						}

				}


			}
		}
		canvas.addEventListener('touchstart',touchStartHandler,false);
		canvas.addEventListener('touchmove',touchMoveHandler,false);
		canvas.addEventListener('touchend',touchEndHandler,false);
		setPwd.addEventListener('click',()=>{this.status = 0},false);
		checkPwd.addEventListener('click',()=>{this.status = 2},false);
	}
	initInterface(){
		let wrap = document.createElement('div');
		let width = this.width || 300;
		let height = this.height || 300;
		let dpr = this.dpr
		wrap.innerHTML = `
			<canvas id="lock" width="${width * dpr}" height="${height*dpr}">
			<div id="hint"></div>
			<form>
				<label for="setPwd">
					设置密码
				</label>
				<input type="radio" id="setPwd" name="status" checked>
				<label for="checkPwd">
					验证密码
				</label>
				<input type="radio" id="checkPwd" name="status">
			</form>	
		`;
		wrap.style.cssText = `
			position:absolute;
			top:0;
			left:0;
			right:0;
			bottom:0;
		`;
		document.body.appendChild(wrap);
		let canvas = this.canvas =  document.getElementById('lock');
		this.hint = document.getElementById('hint');
		this.setPwd = document.getElementById('setPwd');
		this.checkPwd = document.getElementById('checkPwd');
		this.ctx = canvas.getContext('2d');

		canvas.style.cssText = `
			width:${width}px;
			height:${height}px;				`
	}
	init(){
		this.initInterface();
	}
	setHint( hint ){
		this.hint.innerText = hint;
	}
	clearStatus(){
		let ctx = this.ctx;
		let linkedPoints = this.linkedPoints;
		ctx.clearRect(0,0,this.width,this.height);
		linkedPoints = [];
		for(let i = 0,len = this.allPoints.length; i<len;i++){
			this.strokePoint(this.allPoints[i].x,this.allPoints[i].y);
		}
	}
	savePwd(){
		if(window.localStorage.getItem(id))
	}
	comparePwd(p1,p2){

	}



}