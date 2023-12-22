var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");
const G=-0.2;
var rr=10;

function CanvasGetPositionFromClient(cood){
    var x=cood.x;
    var y=cood.y;
	var d = canvas.ownerDocument;
	var w = d.defaultView;
	var r = canvas.getBoundingClientRect();
	var s = w.getComputedStyle(canvas,"");
	var px = parseFloat(s.paddingLeft);
	var py = parseFloat(s.paddingTop);
	var bx = parseFloat(s.borderLeftWidth);
	var by = parseFloat(s.borderTopWidth);
	var sx = canvas.width / parseFloat(s.width);
	var sy = canvas.height / parseFloat(s.height);
	return {
		x:(x - bx - px - r.left) * (sx),
		y:(y - by - py - r.top ) * (sy)
	};
}
var sCood;
canvas.addEventListener("mousedown", function(e){
    sCood={x:e.x,y:e.y};
});
canvas.addEventListener("mouseup", function(e){
    game.objects.push(new O_Wall(camera.CanToGro(CanvasGetPositionFromClient(sCood)),camera.CanToGro(CanvasGetPositionFromClient({x:e.x,y:e.y}))));
});

canvas.addEventListener("touchstart", function(e){
    sCood={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};
});
canvas.addEventListener("touchend", function(e){
    game.objects.push(new O_Wall(camera.CanToGro(CanvasGetPositionFromClient(sCood)),camera.CanToGro(CanvasGetPositionFromClient({x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}))));
});
canvas.addEventListener("touchmove", function(e){
    e.preventDefault();
});

class O_Rain extends O_WCObject{
    constructor(x,y,vx,vy){
        super(x,y,vx,vy,1,"rain",[],0.01);
        this.col = {type:1,range:2,center:this.cood,velocity:this.velocity};
        this.hascol = true;
        //this.onCol = this.onCol;
        this.life=500;
        this.r=2;
        this.init();
    }
    init(){
        super.onTick=this.onTick;
        super.draw=this.draw;
    }
    onTick(tickCount){
        this.life--;
        if(this.life<0){
            //console.log("kill");
            this.killed=true;
        }
    }
    draw(){
        ctx.beginPath();
        k_ctx.circle(this.cood,3);
        ctx.fillStyle="#0000ff";
        ctx.fill();
        
    }
    onCol(obj){
        super._onCol(obj);
        //if(obj.team=="wall")this.life=100;
    }
}
class O_RainMini extends O_WCObject{
    constructor(x,y,vx,vy){
        super(x,y,vx,vy,1,"rain",[],0.01);
        this.col = {type:1,range:2,center:this.cood,velocity:this.velocity};
        this.hascol = true;
        this.r=1;
        this.init();
    }
    init(){
        super.onTick=this.onTick;
        super.draw=this.draw;
    }
    onTick(tickCount){
        if(tickCount>20){
            //console.log("kill");
            this.killed=true;
        }
    }
    onCol(){
        if(this.tickCount>4)this.killed=true;
    }
    draw(){
        ctx.beginPath();
        k_ctx.circle(this.cood,this.r);
        ctx.fillStyle="#0000ff";
        ctx.fill();
    }
}

class O_Cloud extends O_Object{
    constructor(ls,lg){
        super((ls.x+lg.x)/2,(ls.y+lg.y)/2,0,0,0);
        this.ls=ls;
        this.lg=lg;
        //this.onCol = this.onCol;
        this.init();
    }
    init(){
        super.onTick=this.onTick;
        super.draw=this.draw;
    }
    onTick(tickCount){
        if(this.tickCount%rr==0){
            for(var i=0;i<3;i++)this.rain();
        }
    }
    draw(){
    }
    rain(){
        var rand=Math.random();
        game.objects.push(new O_Rain(this.ls.x+rand*(this.lg.x-this.ls.x),this.ls.y+rand*(this.lg.y-this.ls.y),0,-6));
    }
}


var game=new Game();
var wallsDefalt=[
    new O_Wall({x:30,y:300},{x:290,y:500})
    ,new O_Wall({x:110,y:300},{x:370,y:500})
    ,new O_Wall({x:190,y:300},{x:450,y:500})

    ,new O_Wall({x:-650,y:600},{x:-500,y:500})
    ,new O_Wall({x:-300,y:500},{x:-500,y:400})
    ,new O_Wall({x:-680,y:450},{x:-500,y:300})
    ,new O_Wall({x:-400,y:300},{x:-500,y:200})

    ,new O_Wall({x:-750,y:240},{x:-630,y:110})
    ,new O_Wall({x:-630,y:110},{x:-570,y:100})
    ,new O_Wall({x:-570,y:180},{x:-500,y:150})

    ,new O_Wall({x:-400,y:40},{x:-500,y:-60})
    ,new O_Wall({x:-600,y:-60},{x:-500,y:-160})
    ,new O_Wall({x:-400,y:-160},{x:-500,y:-260})
    ,new O_Wall({x:-600,y:-260},{x:-500,y:-360})

    ,new O_Wall({x:-300,y:70},{x:200,y:0})
    ,new O_Wall({x:-500,y:100},{x:0,y:-30})

    ,new O_Wall({x:0,y:-30},{x:130,y:-30})

    ,new O_Wall({x:200,y:-50},{x:400,y:20})
]
function reset(){
    game.objects=[];
    game.objects=game.objects.concat(wallsDefalt);
    game.objects.push(new O_Cloud({x:-650,y:1500},{x:650,y:1500}));
}
reset();

function grobalTick(){
    game.tick()
    requestAnimationFrame(grobalTick);
    //stats.update();
}
grobalTick();

