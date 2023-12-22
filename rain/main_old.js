var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");
const G=-0.2;
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
    x:0,
    y:0,
    mag:0.3,
    GroToCam:( cood => ({x:(cood.x-camera.x)*camera.mag , y:(cood.y-camera.y)*camera.mag}) ),
    CamToGro:( cood => ({x:cood.x/camera.mag+camera.x , y:cood.y/camera.mag+camera.y}) ),
    CamToCan:( cood => ({x:cood.x+canvas.clientWidth/2 , y:-cood.y+canvas.clientHeight/2})),
    GroToCan:( cood => camera.CamToCan(camera.GroToCam(cood))),
    goalX:0,
    goalY:0,
    spd:3,
    tick:function(){
        var length=Math.sqrt((this.goalX-this.x)**2+(this.goalY-this.y)**2);
        if(length<this.spd/this.mag){
            this.x=this.goalX;
            this.y=this.goalY;
        }else{
            this.x+=(this.goalX-this.x)/length/this.mag*this.spd;
            this.y+=(this.goalY-this.y)/length/this.mag*this.spd;
        }
    }
}
//0:線分 1:円
var colFunc=[
    [col_line_line  ],
    [mCol_line_circle, col_circle_circle ]
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
    constructor(x,y,vx,vy,gMult){
        super(x,y,vx,vy,gMult);
        this.hascol = true;
    }
}

class O_Rain extends O_CObject{
    constructor(x,y,vx,vy){
        super(x,y,vx,vy,1);
        this.col = {type:1,range:2,center:this.cood,velocity:this.velocity};
        this.hascol = true;
        //this.onCol = this.onCol;
        this.life=100;
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
        //k_ctx.moveTo(this.cood);
        //k_ctx.lineTo({x:this.cood.x+this.velocity.x,y:this.cood.y+this.velocity.y});
        //ctx.strokeStyle="#0000ff";
        //ctx.stroke();
        k_ctx.circle(this.cood,3);
        ctx.fillStyle="#0000ff";
        ctx.fill();
        
    }
    onCol(obj){
        if(typeof obj != typeof this){
        }
        if(obj.col.type==0){
            this.life=100;
            //this.killed=true;
            var ls=obj.col.ls;
            var lg=obj.col.lg;
            var length=Math.sqrt((lg.x-ls.x)**2+(lg.y-ls.y)**2);
            var nai=((lg.y-ls.y)*this.velocity.x-(lg.x-ls.x)*this.velocity.y)/length;
            var cr=0.01
            /*var kak=Math.atan2(this.velocity.y,this.velocity.x);
            var vs=Math.sqrt(this.velocity.x**2+this.velocity.y**2);
            var mltp=0.15;
            if(nai>1){
                for(var i=0;i<2;i++){
                    var rk=kak+3.14+(Math.random()-0.5)*3.14;
                    this.summoning.push(new O_RainMini(this.cood.x,this.cood.y,Math.cos(rk)*vs*mltp,Math.sin(rk)*vs*mltp));
                }
            }*/
            this.velocity.x+=-(lg.y-ls.y)*nai/length*(1+cr);
            this.velocity.y+= (lg.x-ls.x)*nai/length*(1+cr);
            //this.cood.x+=this.velocity.x;
            //this.cood.y+=this.velocity.y;
        }
    }
}
class O_RainMini extends O_CObject{
    constructor(x,y,vx,vy){
        super(x,y,vx,vy,1);
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
class O_Wall extends O_CObject{
    constructor(ls,lg){
        super((ls.x+lg.x)/2,(ls.y+lg.y)/2,0,0,0);
        this.ls=ls;
        this.lg=lg;
        this.col = {type:0,ls:this.ls,lg:this.lg,velocity:this.velocity};
        this.hascol = true;
        this.isWall=true;
        //this.onCol = this.onCol;
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
        if(this.tickCount%2==0){
            this.rain();
        }
    }
    draw(){
    }
    rain(){
        var rand=Math.random();
        game.objects.push(new O_Rain(this.ls.x+rand*(this.lg.x-this.ls.x),this.ls.y+rand*(this.lg.y-this.ls.y),0,-6));
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
                    if(this.objects[j].hascol){
                        if(this.col(this.objects[i],this.objects[j])){
                            this.objects[i].onCol(this.objects[j]);
                            this.objects[j].onCol(this.objects[i]);
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
        if(_a.isWall || _b.isWall){
            if(_b.col.type>_a.col.type){
                var tbig=_b;
                var tsma=_a;
            }else{
                var tbig=_a;
                var tsma=_b;
            }
            return colFunc[tbig.col.type][tsma.col.type](tsma.col,tbig.col);
        }else{
            return false;
        }
    }
}

/*stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = 100;
document.body.appendChild(stats.domElement);*/

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
game.objects=game.objects.concat(wallsDefalt);


game.objects.push(new O_Cloud({x:-650,y:1500},{x:650,y:1500}));
function grobalTick(){
    game.tick()
    requestAnimationFrame(grobalTick);
    //stats.update();
}
grobalTick();
