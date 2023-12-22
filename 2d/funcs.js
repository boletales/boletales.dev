var wasd=[];
var debug={};
debug.keys=false;
//(旧コメ)長押し防止で false キーを離せば NaN | NaNならキー受付
//キー動作拾ったらwasdの該当値をfalseにすると長押し防止出来る
document.onkeydown = function (e){
	if(!e) e = window.event;
	if(debug.keys)console.log(e.keyCode);
	setwasd(e.keyCode,true);
}
document.onkeyup = function (e){
	if(!e) e = window.event;
	setwasd(e.keyCode,undefined);
}
function setwasd(code,value){
	var atoz="abcdefghijklmnopqrstuvwxyz";
	if (code==38){//  ↑ 
		_set("up");
	}else if (code==37){//  ← 
		_set("left");
	}else if (code==40){//  ↓ 
		_set("down");
	}else if (code==39){//  → 
		_set("right");
	}else if (code>=65 && code<=90){// a~z
		var char=atoz.substr(code-65,1);
		_set(char);
    }else if (code>=48 && code<=57){// 0~9
		var char=code-48;
		_set(char);
    }else if (code==16) {//lshift
		_set("lshift");
    }else if (code==17) {//ctrl
		_set("ctrl");
    }else if (code==32){// space
		_set("space");
    }
    function _set(name){
        if(wasd[name]!=false||value==undefined) wasd[name]=value;
    }
}

class line{
    constructor(c1,c2){
        this.c1=c1.copy();
        this.c2=c2.copy();
    }

}

class vec2d{
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
    abs2(){
        return this.x**2+this.y**2;
    }
    abs(){
        return Math.sqrt(this.abs2());
    }
    toString(){
        return "["+this.x+","+this.y+"]";
    }
    copy(){
        return new vec2d(this.x,this.y);
    }
}
//↓大丈夫
function vec2dDotProduct(v1,v2){
    return v1.x*v2.x+v1.y*v2.y;
}
//↓大丈夫
function vec2dInnerProduct(v,s){
    return new vec2d(v.x*s,v.y*s);
}
//↓大丈夫
function vec2dPlus(v1,v2){
    return new vec2d(v1.x+v2.x,v1.y+v2.y);
}
//↓大丈夫
function vec2dMinus(v1,v2){
    return vec2dPlus(v1,vec2dInnerProduct(v2,-1));
}

class vec3d{
    constructor(x,y,z){
        this.x=x;
        this.y=y;
        this.z=z;
    }
    abs2(){
        return this.x**2+this.y**2+this.z**2;
    }
    abs(){
        return Math.sqrt(this.abs2());
    }
    toString(){
        return "["+round(this.x,3)+","+round(this.y,3)+","+round(this.z,3)+"]";
    }
    copy(){
        return new vec3d(this.x,this.y,this.z);
    }
    fromArr(a){
        return new vec3d(a[0],a[1],a[2]);
    }
    normalize(){
        return vec3dInnerProduct(this,1/this.abs());
    }
}
function round(n,keta=0){
    return Math.round(n*(10**keta))/(10**keta);
}
function vec3dFromArr(a){
    return new vec3d(a[0],a[1],a[2]);
}
function vec3dDotProduct(v1,v2){
    return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
}
function vec3dCrossProduct(v1,v2){
    return new vec3d(   v1.y*v2.z-v1.z*v2.y,
                        v1.z*v2.x-v1.x*v2.z,
                        v1.x*v2.y-v1.y*v2.x);
}
function vec3dInnerProduct(v,s){
    return new vec3d(v.x*s,v.y*s,v.z*s);
}
function vec3dPlus(v1,v2){
    return new vec3d(v1.x+v2.x,v1.y+v2.y,v1.z+v2.z);
}
function vec3dMinus(v1,v2){
    return new vec3d(v1.x-v2.x,v1.y-v2.y,v1.z-v2.z);
}

//↓大丈夫
function isSegmentsCrossed(l1,l2){
    var cp=getCrossPoint(l1,l2);
    return isSegmentsCrossedWithCp(l1,l2,cp);
}
function isSegmentsCrossedWithCp(l1,l2,cp){
    return      (vec2dMinus(l1.c1,cp),vec2dMinus(l1.c2,cp))<=0 
            &&  (vec2dMinus(l2.c1,cp),vec2dMinus(l2.c2,cp))<=0;
}

//↓大丈夫
function getCrossPoint(l1,l2){
    var s1= ((l2.c2.x - l2.c1.x) * (l1.c1.y - l2.c1.y) - (l2.c2.y - l2.c1.y) * (l1.c1.x - l2.c1.x)) / 2;
    var s2= ((l2.c2.x - l2.c1.x) * (l2.c1.y - l1.c2.y) - (l2.c2.y - l2.c1.y) * (l2.c1.x - l1.c2.x)) / 2;
    return new vec2d( l1.c1.x + (l1.c2.x - l1.c1.x) * s1 / (s1 + s2) , l1.c1.y + (l1.c2.y - l1.c1.y) * s1 / (s1 + s2));
}

//↓交差テスト
function crosstest(){
    var l1=new line(new vec2d(Math.random()*100,Math.random()*100),new vec2d(Math.random()*100,Math.random()*100));
    var l2=new line(new vec2d(Math.random()*100,Math.random()*100),new vec2d(Math.random()*100,Math.random()*100));
    var cp=getCrossPoint(l1,l2);
    var result=isSegmentsCrossed(l1,l2);
    console.log("---");
    console.log(l1);
    console.log(l2);
    console.log(result);
    console.log("---");
    ctx.clear(bg);
    ctx.beginPath();
    ctx.moveTo(l1.c1.x,l1.c1.y);
    ctx.lineTo(l1.c2.x,l1.c2.y);
    ctx.moveTo(l2.c1.x,l2.c1.y);
    ctx.lineTo(l2.c2.x,l2.c2.y);
    ctx.stroke();
    ctx.fillStyle=result?"#00ff00":"#ff0000";
    ctx.fillRect(cp.x-2,cp.y-2,4,4);
}


function assert(testname,test,answer){
    var result=(test===answer);
    console.log((result?"✅":"❌")+testname+":"+test+(result?"===":"!==")+answer);
}
var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");
ctx.clear=function(color){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    var oc=ctx.fillStyle;
    ctx.fillStyle=color;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=oc;
};
canvas.width =200;
canvas.height=300;

function hextorgb ( hex ) {
	if ( hex.slice(0, 1) == "#" ) hex = hex.slice(1) ;
	if ( hex.length == 3 ) hex = hex.slice(0,1) + hex.slice(0,1) + hex.slice(1,2) + hex.slice(1,2) + hex.slice(2,3) + hex.slice(2,3) ;

	return [ hex.slice( 0, 2 ), hex.slice( 2, 4 ), hex.slice( 4, 6 ) ].map( function ( str ) {
		return parseInt( str, 16 ) ;
	} ) ;
}