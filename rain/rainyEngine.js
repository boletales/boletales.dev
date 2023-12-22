var k_ctx={
    moveTo:function(cood){
        var canCood=camera.GroToCan(cood);
        ctx.moveTo(canCood.x,canCood.y)
    },
    lineTo:function(cood){
        var canCood=camera.GroToCan(cood);
        ctx.lineTo(canCood.x,canCood.y)
    },
    circle:function(cood,r){
        var canCood=camera.GroToCan(cood);
        var canR=r*camera.mag;
        ctx.arc(canCood.x-canR/2,canCood.y-canR/2,canR,0,6.29);
    }
}
var camera={
    cood:{x:0,y:0},
    mag:0.3,
    GroToCam:( cood => ({x:(cood.x-camera.cood.x)*camera.mag , y:(cood.y-camera.cood.y)*camera.mag}) ),
    CamToGro:( cood => ({x:cood.x/camera.mag+camera.cood.x , y:cood.y/camera.mag+camera.cood.y}) ),
    CamToCan:( cood => ({x:cood.x+canvas.clientWidth/2 , y:-cood.y+canvas.clientHeight/2})),
    CanToCam:( cood => ({x:cood.x-canvas.clientWidth/2 , y:-(cood.y-canvas.clientHeight/2)})),
    GroToCan:( cood => camera.CamToCan(camera.GroToCam(cood))),
    CanToGro:( cood => camera.CamToGro(camera.CanToCam(cood))),
    goal:{x:0,y:0},
    spd:10,
    tick:function(){
        var length=Math.sqrt((this.goal.x-this.cood.x)**2+(this.goal.y-this.cood.y)**2);
        if(length<this.spd/this.mag){
            this.cood.x=this.goal.x;
            this.cood.y=this.goal.y;
        }else{
            this.cood.x+=(this.goal.x-this.cood.x)/length/this.mag*this.spd;
            this.cood.y+=(this.goal.y-this.cood.y)/length/this.mag*this.spd;
        }
    }
}
//0:線分 1:円
var colFunc=[
    [col_line_line  ],//TODO:mcol_line_lineつくる
    [mCol_line_circle, mCol_circle_circle ]
];
function getSui(l,p){
    var ls=l.ls;
    var lg=l.lg;
    var length=Math.sqrt((lg.x-ls.x)*(lg.x-ls.x)+(lg.y-ls.y)*(lg.y-ls.y));
    return ((lg.y-ls.y)*(p.x-ls.x)-(lg.x-ls.x)*(p.y-ls.y))/length; //線分に垂直な方向の相対座標
}
function getHei(l,p){
    var ls=l.ls;
    var lg=l.lg;
    var length=Math.sqrt((lg.x-ls.x)*(lg.x-ls.x)+(lg.y-ls.y)*(lg.y-ls.y));
    return ((lg.x-ls.x)*(p.x-ls.x)+(lg.y-ls.y)*(p.y-ls.y))/length; //線分に垂直な方向の相対座標
}
function getSui2s(l,p){
    var ls=l.ls;
    var lg=l.lg;
    var length2=(lg.x-ls.x)*(lg.x-ls.x)+(lg.y-ls.y)*(lg.y-ls.y);
    return (((lg.y-ls.y)*(p.x-ls.x)-(lg.x-ls.x)*(p.y-ls.y)))*Math.abs(((lg.y-ls.y)*(p.x-ls.x)-(lg.x-ls.x)*(p.y-ls.y)))/length2; //線分に垂直な方向の相対座標
}
function getHei2s(l,p){
    var ls=l.ls;
    var lg=l.lg;
    var length2=(lg.x-ls.x)*(lg.x-ls.x)+(lg.y-ls.y)*(lg.y-ls.y);
    return (((lg.x-ls.x)*(p.x-ls.x)+(lg.y-ls.y)*(p.y-ls.y)))*Math.abs(((lg.x-ls.x)*(p.x-ls.x)+(lg.y-ls.y)*(p.y-ls.y)))/length2; //線分に垂直な方向の相対座標
}
function col_line_line(l1,l2){
    var l1s=l1.ls;
    var l1g=l1.lg;
    var l2s=l2.ls;
    var l2g=l2.lg;
    if(getSui2s(l1,l2s)*getSui2s(l1,l2g)<=0 && getSui2s(l2,l1s)*getSui2s(l2,l1g)<=0){
        return true;
    }else{
        return false;
    }
}
function col_line_circle(l,c){
    var cc=c.center;
    var cr=c.range;
    var sui=getSui2s(l,cc); //線分に垂直な方向の相対座標
    var hei=getHei2s(l,cc); //線分に平行な方向の相対座標
    if((sui*sui <= cr*cr && getHei2s(l,l.ls)<=hei && hei<=getHei2s(l,l.lg)) || calcDist2(l.ls,cc)<=cr*cr || calcDist2(l.lg,cc)<=cr*cr){
        return true;
    }else{
        return false;
    }
}
function mCol_line_circle(l,c){
    var vx=l.velocity.x-c.velocity.x;
    var vy=l.velocity.y-c.velocity.y;
    var cc=c.center;
    var cr=c.range;
    var p=[ l.ls , l.lg , {x:l.lg.x+vx,y:l.lg.y+vy} , {x:l.ls.x+vx,y:l.ls.y+vy} ];
    var online=false;
    for(var i=0;i<3;i++){
        if(col_line_circle({ls:p[i],lg:p[(i+1)%4]},c)){
            return true;
        }
    }
    if(isPointInPolygon(p,cc)){
        return true;
    }else{
        return false;
    }
}
function mCol_circle_circle(c1,c2){
    var vx=c2.velocity.x-c1.velocity.x;
    var vy=c2.velocity.y-c1.velocity.y;
    var c1c=c1.center;
    var c1r=c1.range;
    var c2c=c2.center;
    var c2r=c2.range;
    if(vx==0&&vy==0){
        return col_circle_circle(c1,c2);
    }
    if(col_circle_circle(c1,c2) || col_circle_circle(c1,{center:{x:c2c.x+vx,y:c2c.y+vy},range:c2r})){
        return true;
    }
    var rx=(-vy)/Math.sqrt(vx**2+vy**2)*c2r;
    var ry=(vx) /Math.sqrt(vx**2+vy**2)*c2r;
    var p=[ {x:c2c.x+rx,y:c2c.y+ry} , {x:c2c.x+rx+vx,y:c2c.y+ry+vy} , {x:c2c.x-rx+vx,y:c2c.y-ry+vy} , {x:c2c.x-rx,y:c2c.y-ry} ];
    var online=false;
    for(var i=0;i<3;i++){
        if(col_line_circle({ls:p[i],lg:p[(i+1)%4]},c1)){
            return true;
        }
    }
    if(isPointInPolygon(p,c1c)){
        return true;
    }else{
        return false;
    }
}
function isPointInPolygon(polygon,p) {
    var inside = false;
    //上向きに半直線を伸ばして、交点の数が奇数なら内側
    for (var i = 0; i < polygon.length; i++) {
        var startPoint = polygon[i];
        var endPoint = polygon[(i+1)%polygon.length];
        if (startPoint.x > endPoint.x) {
            var  l={ls:endPoint,lg:startPoint}; 
        }else {
            var  l={ls:startPoint,lg:endPoint}; 
        }
        //一つ目の条件：上向きの半直線がぶつかるか
        //二つ目の条件：その辺は点の上にあるか
        if ((l.ls.x<p.x) == (p.x<=l.lg.x) && isOnTheLinesRightSide(p,l)) {
            inside = !inside;
        }
    }
    return inside;
}
function isOnTheLinesRightSide(p,l){
    return getSui(l,p)>=0;
}
function col_circle_circle(c1,c2){
    var c1c=c1.center;
    var c1r=c1.range;
    var c2c=c2.center;
    var c2r=c2.range;
    if(calcDist(c1c,c2c)<=c1r+c2r){
        return true;
    }else{
        return false;
    }
}
function calcDist(p1,p2){
    return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
}
function calcDist2(p1,p2){
    return (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y);
}
class O_Object{
    constructor(x,y,vx,vy,gMult){
        this.cood       = {x:x,y:y};
        this.velocity   = {x:vx,y:vy};
        this.gMult  = gMult;
        this.killed = false;
        this.tickCount   = -1;
        this.summoning=[];
        this.hascol=false;
    }
    tick(GtickCount){
        this.tickCount++;
        this.cood.x     += this.velocity.x;
        this.cood.y     += this.velocity.y;
        this.velocity.y += this.gMult*G;
        this.onTick(this.tickCount);
        this.draw();
    }
}

class O_CObject extends O_Object{
    constructor(x,y,vx,vy,gMult,team,colTeam){
        super(x,y,vx,vy,gMult);
        this.team=team;
        this.colTeam=colTeam;
        this.hascol=true;
    }
}
class O_WCObject extends O_CObject{
    constructor(x,y,vx,vy,gMult,team,colTeam,cr){
        super(x,y,vx,vy,gMult,team,colTeam);
        this.cr=cr;
        this.colTeam.push("wall");
        this.col = {type:1,center:this.cood,range:1,velocity:this.velocity};
    }
    _onCol(obj){
        if(obj.team=="wall"){
            var ls=obj.col.ls;
            var lg=obj.col.lg;
            var length=Math.sqrt((lg.x-ls.x)**2+(lg.y-ls.y)**2);
            var nai=((lg.y-ls.y)*this.velocity.x-(lg.x-ls.x)*this.velocity.y)/length;
            this.velocity.x+=-(lg.y-ls.y)*nai/length*(1+this.cr);
            this.velocity.y+= (lg.x-ls.x)*nai/length*(1+this.cr);
        }
    }
}

class O_Wall extends O_CObject{
    constructor(ls,lg){
        super((ls.x+lg.x)/2,(ls.y+lg.y)/2,0,0,0,"wall",[]);
        this.ls=ls;
        this.lg=lg;
        this.col = {type:0,ls:this.ls,lg:this.lg,velocity:this.velocity};
        this.init();
    }
    init(){
        super.onTick=this.onTick;
        super.draw=this.draw;
    }
    onTick(tickCount){
    }
    draw(){
        ctx.beginPath();
        k_ctx.moveTo(this.ls);
        k_ctx.lineTo(this.lg);
        ctx.strokeStyle="#000055";
        ctx.stroke();
    }
    onCol(){
    }
}

class Game{
    constructor(){
        this.objects=[];
        this.tickCount=-1;
    }
    tick(){
        ctx.fillStyle="#EEF8FF";
        ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
        this.tickCount++;
        camera.tick();
        for (var i = 0; i < this.objects.length; i++) {
            //あたり判定
            if(this.objects[i].hascol){
                for (var j=i+1; j < this.objects.length; j++) {
                    if(this.objects[j].hascol ){
                        if((this.objects[i].colTeam.includes(this.objects[j].team) || this.objects[j].colTeam.includes(this.objects[i].team))
                             && this.col(this.objects[i],this.objects[j])){
                            if(this.objects[i].colTeam.includes(this.objects[j].team))this.objects[i].onCol(this.objects[j]);
                            if(this.objects[j].colTeam.includes(this.objects[i].team))this.objects[j].onCol(this.objects[i]);
                        };
                    }
                }
            }
            this.objects[i].tick(this.tickCount);
            this.objects=this.objects.concat(this.objects[i].summoning);
            this.objects[i].summoning=[];
        }
        this.objects=this.objects.filter(o=>!o.killed);
        
    }
    col(_a,_b){
        if(_b.col.type>_a.col.type){
            var tbig=_b;
            var tsma=_a;
        }else{
            var tbig=_a;
            var tsma=_b;
        }
        return colFunc[tbig.col.type][tsma.col.type](tsma.col,tbig.col);
    }
}
var wasd=[];
var debug=true;
//長押し防止で false キーを離せば NaN | NaNならキー受付
document.onkeydown = function (e){
	if(!e) e = window.event;
	if(debug)console.log(e.keyCode);
	setwasd(e.keyCode,true);
}
document.onkeyup = function (e){
	if(!e) e = window.event;
	setwasd(e.keyCode,undefined);
}
function setwasd(code,value){
	if (code==38){//  ↑ 
        if(wasd.up!=false||value==undefined) wasd.up=value;
	}else if (code==37){//  ← 
		if(wasd.left!=false||value==undefined) wasd.left=value;
	}else if (code==40){//  ↓ 
		if(wasd.down!=false||value==undefined) wasd.down=value;
	}else if (code==39){//  → 
		if(wasd.right!=false||value==undefined) wasd.right=value;
	}else if (code==90){// z
		if(wasd.z!=false||value==undefined) wasd.z=value;
	}else if (code==88){// x
		if(wasd.x!=false||value==undefined) wasd.x=value;
	}else if (code==67){// c
		if(wasd.c!=false||value==undefined) wasd.c=value;
	}else if (code==65){// a
		if(wasd.a!=false||value==undefined) wasd.a=value;
	}else if (code==68){// d
		if(wasd.d!=false||value==undefined) wasd.d=value;
	}else if (code==69) {//e
        if(wasd.e!=false||value==undefined) wasd.e=value;
    }
}