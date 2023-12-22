var bg="#000";
var lines=[];
var near=0.1;
var far =1000;
var centerOfDisplay=new vec2d(canvas.width/2,canvas.height/2);
var mag=1;
var refrection=false;

function solve_3genRenritsu(A1,B1,C1,E1,A2,B2,C2,E2,A3,B3,C3,E3) {
    var denominator=(A1*B2*C3+A2*B3*C1+A3*B1*C2-A1*B3*C2-A2*B1*C3-A3*B2*C1);
    var x=(E1*B2*C3 + E2*B3*C1 + E3*B1*C2  - E1*B3*C2 - E2*B1*C3 -E3*B2*C1) / denominator;
    var y=(A1*E2*C3 + A2*E3*C1 + A3*E1*C2  - A1*E3*C2 - A2*E1*C3 -A3*E2*C1) / denominator;
    var z=(A1*B2*E3 + A2*B3*E1 + A3*B1*E2  - A1*B3*E2 - A2*B1*E3 -A3*B2*E1) / denominator;
    return [x,y,z];
}

function getSurfacesFromObjects(objects,eyeXcenter,eyeYcenter,eyeZcenter,lperpx){
    var sinyaw=Math.sin(yaw);
    var cosyaw=Math.cos(yaw);
    var sinpitch=Math.sin(pitch);
    var cospitch=Math.cos(pitch);
    var dx=centerOfDisplay.x;
    var dy=centerOfDisplay.y;
    return objects.reduce((p,o)=>p.concat(o.getSurfaces()
    //どれかの点が描画範囲内にあること
    .map(function(s){
        var A=s.points[0];
        var B=s.points[1];
        var C=s.points[2];

        var VA=vec3dMinus(A,cood);
        var VB=vec3dMinus(B,cood);
        var VC=vec3dMinus(C,cood);
        //視線ベクトル
        var L=new vec3d(-eyeXcenter,-eyeYcenter,-eyeZcenter);
        var X=new vec3d(-sinyaw*lperpx         ,0               ,+cosyaw*lperpx);
        var Y=new vec3d(+cosyaw*lperpx*sinpitch,-lperpx*cospitch,+sinyaw*lperpx*sinpitch);
        //return vec3dDotProduct(VA,L)>0 || vec3dDotProduct(VB,L)>0 || vec3dDotProduct(VC,L)>0;
        var dxMax=-dx;
        var dyMax=-dy;
        var dzMax=near;
        var dxMin=dx;
        var dyMin=dy;
        var dzMin=far;
        [VA,VB,VC].forEach(function(c){
            var stu=solve_3genRenritsu(
                L.x,X.x,Y.x,c.x,
                L.y,X.y,Y.y,c.y,
                L.z,X.z,Y.z,c.z,
            );
            if(stu[0]>0){
                dxMax=Math.max(dxMax,stu[1]/stu[0]);
                dyMax=Math.max(dyMax,stu[2]/stu[0]);
                dzMax=Math.max(dzMax,stu[0]);
                dxMin=Math.min(dxMin,stu[1]/stu[0]);
                dyMin=Math.min(dyMin,stu[2]/stu[0]);
                dzMin=Math.min(dzMin,stu[0]);
            }else if(stu[0]<0){
                dxMax=Math.max(dxMax,dx*Math.sign(-stu[1]/stu[0]));
                dyMax=Math.max(dyMax,dy*Math.sign(-stu[2]/stu[0]));
                dxMin=Math.min(dxMin,dx*Math.sign(-stu[1]/stu[0]));
                dyMin=Math.min(dyMin,dy*Math.sign(-stu[2]/stu[0]));
            }
        });

        var bx=B.x-A.x;
        var by=B.y-A.y;
        var bz=B.z-A.z;

        var cx=C.x-A.x;
        var cy=C.y-A.y;
        var cz=C.z-A.z;

        var ax=A.x;
        var ay=A.y;
        var az=A.z;

        var cross=vec3dCrossProduct(vec3dMinus(B,A),vec3dMinus(C,A));

        return {
            bx:bx,
            by:by,
            bz:bz,
            
            cx:cx,
            cy:cy,
            cz:cz,
            
            ax:ax,
            ay:ay,
            az:az,

            gx:cross.x,
            gy:cross.y,
            gz:cross.z,

            dxMax:dxMax,
            dyMax:dyMax,
            dzMax:dzMax,
            dxMin:dxMin,
            dyMin:dyMin,
            dzMin:dzMin,

            colorR:s.colorR,
            colorG:s.colorG,
            colorB:s.colorB
        };
    })
    /*.filter(s=>!(s.dxMax<=-dx  || dx <=s.dxMin))
    .filter(s=>!(s.dyMax<=-dy  || dy <=s.dyMin))
    .filter(s=>!(s.dzMax<=near || far<=s.dzMin))
    .filter(function(surface){
        var L=new vec3d(-eyeXcenter,-eyeYcenter,-eyeZcenter);
        var X=new vec3d(+sinyaw*lperpx*dx         ,0                  ,-cosyaw*lperpx*dx);
        var Y=new vec3d(-cosyaw*lperpx*sinpitch*dy,+lperpx*cospitch*dy,-sinyaw*lperpx*sinpitch*dy);
        var cross=new vec3d(surface.gx,surface.gy,surface.gz);
        return  vec3dDotProduct(cross,vec3dPlus (vec3dPlus (L,X),Y))<0 ||
                vec3dDotProduct(cross,vec3dPlus (vec3dMinus(L,X),Y))<0||
                vec3dDotProduct(cross,vec3dMinus(vec3dPlus (L,X),Y))<0 ||
                vec3dDotProduct(cross,vec3dMinus(vec3dMinus(L,X),Y))<0;
    })*/
    ),[]);
}
function drawObjects(objects,cood){
    ctx.clear(bg);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;

    var sight=Math.PI*0.6;
    var lperpx=Math.tan(sight/2)/canvas.width;
    //var sz=new vec3d( Math.cos(yaw),0,Math.sin(yaw));
    //var sx=new vec3d(-Math.sin(yaw)*lperpx,0,Math.cos(yaw)*lperpx);//よこ
    //var sy=new vec3d(0,lperpx,0);//よこ
    var sinyaw=Math.sin(yaw);
    var cosyaw=Math.cos(yaw);
    var sinpitch=Math.sin(pitch);
    var cospitch=Math.cos(pitch);
    var dx=centerOfDisplay.x;
    var dy=centerOfDisplay.y;
    var width=imageData.width;
    var height=imageData.height;
    
    var call=0;
    var zbuffer=new Float32Array(height*width).fill(far);
    
    //視線ベクトルの反対向き
    var eyeXcenter=-cosyaw*cospitch;
    var eyeYcenter=-sinpitch;
    var eyeZcenter=-sinyaw*cospitch;
    var surfaces=getSurfacesFromObjects(objects,eyeXcenter,eyeYcenter,eyeZcenter,lperpx);


    for(var i=0;i<surfaces.length;i++){
        var surface=surfaces[i];
        var startX=Math.max(Math.floor(surface.dxMin+dx)|0 , 0);
        var goalX =Math.min(Math.ceil (surface.dxMax+dx)|0 , width-1);
        var startY=Math.max(Math.floor(surface.dyMin+dy)|0 , 0);
        var goalY =Math.min(Math.ceil (surface.dyMax+dy)|0 , height-1);
        for(var x=startX;x<=goalX;x=(x+1)|0){
            for(var y=startY;y<=goalY;y=(y+1)|0){
                var Px=eyeXcenter -cosyaw*lperpx*sinpitch*(y-dy) +sinyaw*lperpx*(x-dx);
                var Py=eyeYcenter +lperpx*cospitch*(y-dy);
                var Pz=eyeZcenter -sinyaw*lperpx*sinpitch*(y-dy) -cosyaw*lperpx*(x-dx);
                call++;
                if(!paintBack && surface.gx*Px + surface.gy*Py + surface.gz*Pz < 0){
                    continue;
                }
                var stu=solve_3genRenritsu(
                    surface.bx,surface.cx,Px, cood.x-surface.ax,
                    surface.by,surface.cy,Py, cood.y-surface.ay,
                    surface.bz,surface.cz,Pz, cood.z-surface.az,
                );
                var s=stu[0];
                var t=stu[1];
                var u=stu[2];
                if(0<=s && 0<=t && s+t<=1 && near<=u && u<=zbuffer[x+y*width]){
                    if(refrection){
                        var Cx = surface.ax +surface.bx*s +surface.cx*t;
                        var Cy = surface.ay +surface.by*s +surface.cy*t;
                        var Cz = surface.az +surface.bz*s +surface.cz*t;
                        var refSurfaces=surfaces.filter((v,id)=>id!=i);
                        var refrec=calcRefrec(surface,Px,Py,Pz,Cx,Cy,Cz,refSurfaces);
                        zbuffer[x+y*width]=u;
                        drawPixel(pixels,width,height,x,y,
                            surface.colorR+refrec[0],
                            surface.colorG+refrec[1],
                            surface.colorB+refrec[2]);
                        call+=surfaces.length-1;
                    }else{
                        zbuffer[x+y*width]=u;
                        drawPixel(pixels,width,height,x,y,
                            surface.colorR,
                            surface.colorG,
                            surface.colorB);
                    }
                }
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
    /*ctx.strokeStyle="#00000088";
    for(var i=0;i<surfaces.length;i=(i+1)|0){
        var surface=surfaces[i];
        ctx.strokeRect(surface.dxMin+dx, surface.dyMin+dy, surface.dxMax-surface.dxMin, surface.dyMax-surface.dyMin);
    }*/
    ctx.fillStyle="#fff";
    ctx.fillText(cnum,10,10);
    ctx.fillText(surfaces.length,10,20);
    ctx.fillText(call,10,30);
    
}
function doesPxVecHitSurface(Px,Py,Pz,Cx,Cy,Cz,surface,zbuffer){
    //図形のベクトル 
    //AP=sa+tb+upとして、
    //s+t≦1 0≦s 0≦t (視線ベクトルと平面の交点が三角形内)
    //near≦u≦far (描画範囲内)
    if(!paintBack && surface.gx*Px + surface.gy*Py + surface.gz*Pz < 0){
        return Infinity;
    }
    var stu=solve_3genRenritsu(
        surface.bx,surface.cx,Px, Cx-surface.ax,
        surface.by,surface.cy,Py, Cy-surface.ay,
        surface.bz,surface.cz,Pz, Cz-surface.az,
    );
    var s=stu[0];
    var t=stu[1];
    var u=stu[2];
    if(0<=s && 0<=t && s+t<=1 && near<=u && u<=zbuffer){
        return stu;
    }else{
        return [s,t,Infinity];
    }
}
function calcRefrec(surface,Px,Py,Pz,Cx,Cy,Cz,surfaces){
    var refrecZ=far;
    var dot=surface.gx*Px + surface.gy*Py + surface.gz*Pz;
    var len2=surface.gx*surface.gx + surface.gy*surface.gy + surface.gz*surface.gz;
    var refrecVx=Px-surface.gx*2*dot/len2;
    var refrecVy=Py-surface.gy*2*dot/len2;
    var refrecVz=Pz-surface.gz*2*dot/len2;
    var refrecR=0;
    var refrecG=0;
    var refrecB=0;
    for(var i=0;i<surfaces.length;i=(i+1)|0){
        var refrecSurface=surfaces[i]; 
        var stu=solve_3genRenritsu(
            refrecSurface.bx,refrecSurface.cx,refrecVx, Cx-refrecSurface.ax,
            refrecSurface.by,refrecSurface.cy,refrecVy, Cy-refrecSurface.ay,
            refrecSurface.bz,refrecSurface.cz,refrecVz, Cz-refrecSurface.az,
        );
        var s=stu[0];
        var t=stu[1];
        var u=stu[2];
        if(0<=s && 0<=t && s+t<=1 && near<=u && u<=refrecZ){
            refrecZ=u;
            refrecR=Math.floor(refrecSurface.colorR/2);
            refrecG=Math.floor(refrecSurface.colorG/2);
            refrecB=Math.floor(refrecSurface.colorB/2);
        }
    }
    return [refrecR,refrecG,refrecB];
}

var pixelsize=1;
function drawPixel(pixels,width,height,x,y,r,g,b){
    var base = (y * width + x) * 4;
    pixels[base+0]=r;//r
    pixels[base+1]=g;//g
    pixels[base+2]=b;//b
    pixels[base+3]=255;//a
}

function matrixProduct( m1_x,m1_y,m1_z , m2_x,m2_y,m2_z ) {
    return { x:new vec3d( m1_x.x*m2_x.x+m1_x.y*m2_y.x+m1_x.z*m2_z.x , m1_x.x*m2_x.y+m1_x.y*m2_y.y+m1_x.z*m2_z.y , m1_x.x*m2_x.z+m1_x.y*m2_y.z+m1_x.z*m2_z.z )
            ,y:new vec3d( m1_y.x*m2_x.x+m1_y.y*m2_y.x+m1_y.z*m2_z.x , m1_y.x*m2_x.y+m1_y.y*m2_y.y+m1_y.z*m2_z.y , m1_y.x*m2_x.z+m1_y.y*m2_y.z+m1_y.z*m2_z.z )
            ,z:new vec3d( m1_z.x*m2_x.x+m1_z.y*m2_y.x+m1_z.z*m2_z.x , m1_z.x*m2_x.y+m1_z.y*m2_y.y+m1_z.z*m2_z.y , m1_z.x*m2_x.z+m1_z.y*m2_y.z+m1_z.z*m2_z.z )
            }
    // 11*11+12*21+13*31  11*12+12*22+13*32  11*13+12*23+13*33
    // 21*11+22*21+23*31  21*12+22*22+23*32  21*13+22*23+23*33
    // 31*11+32*21+33*31  31*12+32*22+33*32  31*13+32*23+33*33
}

const anbient=0.2;
class obj{
    constructor(vertex,surfaces,cood,mukix,mukiy,mukiz,color="#ffffff",rotates=true){
        this.vertex=vertex;
        this.surfaces=surfaces;
        this.cood=cood;
        this.mukix=mukix;
        this.mukiy=mukiy;
        this.mukiz=mukiz;
        this.color=color;
        this.rotates=rotates;
    }
    getSurfaces(){
        var self=this;
        var vertexWorld=this.vertex.map(function(v){
            var newx=vec3dDotProduct(v,self.mukix)  +self.cood.x;
            var newy=vec3dDotProduct(v,self.mukiy)  +self.cood.y;
            var newz=vec3dDotProduct(v,self.mukiz)  +self.cood.z;
            return new vec3d(newx,newy,newz);
        });
        var rgb=hextorgb(this.color);
        var colorR=rgb[0];
        var colorG=rgb[1];
        var colorB=rgb[2];
        return this.surfaces.map( function(s,i){
            var points=[
                vertexWorld[s[0]],
                vertexWorld[s[1]],
                vertexWorld[s[2]]
            ];
            var b=vec3dMinus(points[1],points[0]);
            var c=vec3dMinus(points[2],points[0]);
            var light=(vec3dDotProduct(new vec3d(0,1,0),
                vec3dCrossProduct(b,c).normalize()
                ));
            //var color=0;
            if(i===cnum){
                return {
                    "points":points,
                    "colorR":Math.floor((light*(1-anbient)/2+0.5)*256),
                    "colorG":0,
                    "colorB":0
                };
            }
            return {
                "points":points,
                "colorR":Math.floor((light*(1-anbient)/2 + 0.5)*colorR),
                "colorG":Math.floor((light*(1-anbient)/2 + 0.5)*colorG),
                "colorB":Math.floor((light*(1-anbient)/2 + 0.5)*colorB)
            };
        });
    }

    rotate(rx,ry,rz){
        if(!this.rotates)return;
        var product=matrixProduct(
            rx,
            ry,
            rz,

            this.mukix,
            this.mukiy,
            this.mukiz
            );

        this.mukix=product.x;
        this.mukiy=product.y;
        this.mukiz=product.z;
    }

    rotateX(rotate){
        this.rotate(
            new vec3d(1, 0               , 0),
            new vec3d(0, Math.cos(rotate),-Math.sin(rotate)),
            new vec3d(0, Math.sin(rotate), Math.cos(rotate))
        )
    }
    rotateY(rotate){
        this.rotate(
            new vec3d( Math.cos(rotate),0, Math.sin(rotate)),
            new vec3d( 0               ,1, 0               ),
            new vec3d(-Math.sin(rotate),0, Math.cos(rotate))
        );
    }
    rotateZ(rotate){
        this.rotate(
            new vec3d(Math.cos(rotate),-Math.sin(rotate),0),
            new vec3d(Math.sin(rotate), Math.cos(rotate),0),
            new vec3d(0               , 0               ,1)
        );
    }
}


canvas.onmousemove=function(e){
    //console.log(e);
    if(document.pointerLockElement!==canvas){
        canvas.requestPointerLock();
    }
    var sensi=0.005;
    yaw=yaw+e.movementX*sensi;
    pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch-e.movementY*sensi));
}
canvas.onclick=canvas.requestFullscreen;
/*window.addEventListener('deviceorientation', function(e){
	yaw=e.alpha/180*Math.PI;
    pitch=(e.beta-90)/180*Math.PI;
    //console.log(e);
}, false);*/

var cood=new vec3d(-100,0,0);
var yaw=0;
var pitch=0;
function normalizeRad(rad){
    return rad;
}

// .\座標系.png
var paintBack=false;

const _root_3=Math.sqrt(3);
const _root_5=Math.sqrt(5);

const obj_20mentai=[new vec3d(1,_root_3,(-3-_root_5)/2) , new vec3d(-2,0,(-3-_root_5)/2) , new vec3d(1,-_root_3,(-3-_root_5)/2) , new vec3d(-(1+_root_5)/2,-(1+_root_5)*_root_3/2,(1-_root_5)/2) , new vec3d(1+_root_5,0,(1-_root_5)/2) , new vec3d(-(1+_root_5)/2,(1+_root_5)*_root_3/2,(1-_root_5)/2) , new vec3d((1+_root_5)/2,(1+_root_5)*_root_3/2,(_root_5-1)/2) , new vec3d(-1-_root_5,0,(_root_5-1)/2) , new vec3d((1+_root_5)/2,-(1+_root_5)*_root_3/2,(_root_5-1)/2) , new vec3d(-1,-_root_3,(3+_root_5)/2) , new vec3d(2,0,(3+_root_5)/2) , new vec3d(-1, _root_3, (3+_root_5)/2)];
const tri_20mentai=[ [0,2,1],[1,2,3],[2,8,3],[2,0,4],[2,4,8],[0,1,5],[0,5,6],[0,6,4],[10,4,6],[10,8,4],[10,9,8],[9,3,8],[9,7,3],[1,3,7],[1,7,5],[5,11,6],[6,11,10],[9,10,11],[9,11,7],[5,7,11] ];

const obj_4mentai=[new vec3d(-1,-1,-1),new vec3d(-1,1,1),new vec3d(1,-1,1),new vec3d(1,1,-1)];
const tri_4mentai=[[0,2,1],[0,3,2],[0,1,3],[1,2,3]];

const obj_cuboid=[new vec3d(-1,-1,-1),new vec3d(1,-1,-1),new vec3d(1,-1,1),new vec3d(-1,-1,1),new vec3d(-1,1,-1),new vec3d(1,1,-1),new vec3d(1,1,1),new vec3d(-1,1,1)];
const tri_cuboid=[[0,1,3],[1,2,3],[0,3,4],[3,7,4],[0,4,5],[0,5,1],[4,7,5],[7,6,5],[1,5,2],[2,5,6],[3,2,7],[2,6,7]];

const obj_plane=[new vec3d(-1,0,-1),new vec3d(1,0,-1),new vec3d(1,0,1),new vec3d(-1,0,1)];
const tri_plane=[[0,2,1],[3,2,0]];

var objects=[   new obj(obj_20mentai,tri_20mentai,new vec3d(50 ,30  ,0),new vec3d(10,0,0),new vec3d(0,10,0),new vec3d(0,0,10),"#aaaaff"),
                new obj(obj_cuboid,tri_cuboid    ,new vec3d(20,-20 ,50),new vec3d(10,0,0),new vec3d(0,10,0),new vec3d(0,0,10),"#aaffaa"),
                new obj(obj_4mentai,tri_4mentai  ,new vec3d(20, -20,-50),new vec3d(10,0,0),new vec3d(0,10,0),new vec3d(0,0,10),"#ffaaaa"),
                new obj(obj_plane,tri_plane  ,new vec3d(100,-10,0),new vec3d(60,0,0),new vec3d(0,60,0),new vec3d(0,0,-60),"#faf",true),
                new obj(obj_plane,tri_plane  ,new vec3d(100,-10,0),new vec3d(60,0,0),new vec3d(0,60,0),new vec3d(0,0,60),"#faf",true),
            ];

var cnum=-1;
function roop(){
    var rotate=0.1;
    dealkeys();
    objects.forEach(o=>o.rotateX(-rotate*0.03));
    drawObjects(objects,cood);
    requestAnimationFrame(roop);
}
roop();


function dealkeys(){
    var speed=1;
    var rotate=0.1;
    if(wasd.z){
        speed=3;
    }

    if(wasd.d){
        cood=vec3dPlus(cood,vec3dInnerProduct(new vec3d(Math.sin(yaw),0,-Math.cos(yaw)),-speed));
    }
    if(wasd.a){
        cood=vec3dPlus(cood,vec3dInnerProduct(new vec3d(Math.sin(yaw),0,-Math.cos(yaw)),+speed));
    }
    if(wasd.s){
        cood=vec3dPlus(cood,vec3dInnerProduct(new vec3d(Math.cos(yaw),0,Math.sin(yaw)),-speed));
    }
    if(wasd.w){
        cood=vec3dPlus(cood,vec3dInnerProduct(new vec3d(Math.cos(yaw),0,Math.sin(yaw)),+speed));
    }
    if(wasd.lshift){
        cood=vec3dPlus(cood,vec3dInnerProduct(new vec3d(0,1,0),-speed));
    }
    if(wasd.space){
        cood=vec3dPlus(cood,vec3dInnerProduct(new vec3d(0,1,0),+speed));
    }
    if(wasd.y) objects.forEach(o=>o.rotateX(rotate));
    if(wasd.u) objects.forEach(o=>o.rotateY(rotate));
    if(wasd.i) objects.forEach(o=>o.rotateZ(rotate));
    if(wasd.h) objects.forEach(o=>o.rotateX(-rotate));
    if(wasd.j) objects.forEach(o=>o.rotateY(-rotate));
    if(wasd.k) objects.forEach(o=>o.rotateZ(-rotate));
    if(wasd.o){
        console.log(--cnum);
        wasd.o=false;
    }
    if(wasd.p){
        console.log(++cnum);
        wasd.p=false;
    }
}