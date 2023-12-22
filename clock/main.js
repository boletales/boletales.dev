window.addEventListener('load', function() {
 if ('serviceWorker' in navigator) {
 navigator.serviceWorker.register("/serviceWorker.js")
 .then(function(registration) {
 console.log("serviceWorker registed.");
 }).catch(function(error) {
 console.warn("serviceWorker error.", error);
 });
 }
});

let canvas=document.getElementById('canvas');
let ctx=canvas.getContext('2d');
let height=canvas.height;
let width=canvas.width;

let status=document.getElementById("status");
let pauseBt=document.getElementById("pause");

let clockRadius=140;
let clockWidth=1;

let secondLength=120;
let secondWidth=1;

let minuteLength=110;
let minuteWidth=2;

let hourLength=80;
let hourWidth=3;

let colors= [["#fff","#ff8","#fa8","#f44","#f00"],
            ["#fff","#f88","#f44","#44f"]];

let whirlColorKatori  ="#250";
let whirlColorBurning="#f00";
let whirlColorBurned  ="#888";
let whirlWidth=10;
let frameColor="#000";
let spaceKatori=-40;

let statusColorPause="#05d";
let statusColorNomal="#000";

let showHourHand=true;
let showMinuteHand=true;
let showTimeTimer=true;
let showKatori=false;
let deepPalette=false;
//document.getElementById("showHH").checked=showHourHand;
//document.getElementById("showMH").checked=showMinuteHand;
//document.getElementById("showTT").checked=showTimeTimer;
//document.getElementById("showKT").checked=showKatori;
//document.getElementById("useDP").checked=deepPalette;

let goal=undefined;
let goal_old=undefined;
let pause_time=undefined;
let glen=undefined;
let pause=false;
let now=new Date();
function clockAngToJsAng(ang){
    return -Math.PI/2 + ang;
}

function clockAngToJsCood(ang,radius){
    return [width/2 + radius*Math.cos(clockAngToJsAng(ang))   ,   height/2 + radius*Math.sin(clockAngToJsAng(ang))];
}
function hourToAng(date){
    return (date.getHours()/12+date.getMinutes()/12/60+date.getSeconds()/12/60/60)*Math.PI*2;
}

function minuteToAng(date){
    return (date.getMinutes()/60+date.getSeconds()/60/60)*Math.PI*2;
}

function secondToAng(date){
    return (date.getSeconds()/60)*Math.PI*2;
}


function draw(now=new Date()){
    ctx.clearRect(0,0,height,width);
    
    status.innerText= ("00"+now.getHours()).slice(-2)+":"+("00"+now.getMinutes()).slice(-2)+":"+("00"+now.getSeconds()).slice(-2);
    
    if(pause){
        status.style.color=statusColorPause;
    }else{
        status.style.color=statusColorNomal;
    }

    if(goal-now>0){
        if(showTimeTimer)drawTimeTimer(now);
        status.innerText=(pause?"❆停止中❆ ":"残り ")+Math.floor((goal-now)/1000/60)+"分"+("00"+Math.floor((goal-now)/1000%60)).slice(-2)+"秒("+Math.round((goal-now)/1000/60/glen*100)+"%)"
    }    
    if(showMinuteHand)drawHand(minuteToAng(now),minuteLength,minuteWidth);
    if(showHourHand){
        drawHand(hourToAng(now)  ,hourLength  ,hourWidth);
        drawHand(secondToAng(now),secondLength,secondWidth);
    }
    
    if(goal-now>0 && showKatori)drawWhirl(now);
    drawFrame();

}
function drawFrame(){
    ctx.beginPath();
    ctx.lineWidth=clockWidth;
    ctx.strokeStyle=frameColor;
    ctx.arc(width/2,height/2,clockRadius,0,Math.PI*2);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth=clockWidth;

    for(let i=0;i<60;i++){
        let ang=Math.PI*2/60 *i;
        
        if(i%15==0){
            ctx.lineWidth=clockWidth*2;
            var start=0.90;
        }else if(i%5==0){
            ctx.lineWidth=clockWidth;
            var start=0.95;
        }else{
            ctx.lineWidth=clockWidth;
            var start=0.98;
        }
        ctx.moveTo.apply(ctx,clockAngToJsCood(ang,clockRadius*start));
        ctx.lineTo.apply(ctx,clockAngToJsCood(ang,clockRadius));

    }
    ctx.stroke();
}
function drawHand(ang,length,width){
    ctx.beginPath();
    ctx.strokeStyle=frameColor;
    ctx.lineWidth=width;
    ctx.moveTo.apply(ctx,clockAngToJsCood(0,0));
    ctx.lineTo.apply(ctx,clockAngToJsCood(ang,length));
    ctx.stroke();
}

function drawTimeTimer(now){
    let round_max=Math.ceil((goal-now)/1000/60/60);
    for(let round=0;round<round_max;round++){
        fillFanClock(0,Math.PI*2,getColor(round),calcPRad(round));
    }
    fillFanClock(minuteToAng(now),minuteToAng(goal),getColor(round_max),calcPRad(round_max));
}
//calc round radius(prop)
function calcPRad(round){
    let adjust=1/1.5;
    return adjust**(round-1);
}

function getColor(n){
    return colors[deepPalette?1:0][Math.max(0,Math.min(n,colors[deepPalette?1:0].length-1))];
}

function drawWhirl(now){
    let start=goal.getTime()-glen*1000*60;
    let interval=1;

    let sectionBurning=Math.ceil((now-start)/1000/60/interval);

    ctx.beginPath();
    ctx.moveTo.apply(ctx,angToWhirl(new Date(start),0  ,minuteLength,spaceKatori));
    for(let section=0 ; section<(glen/interval)+1; section+=interval){
        let min=interval*section;
        ctx.lineTo.apply(ctx,angToWhirl(new Date(start),min,minuteLength,spaceKatori));

        if(section==sectionBurning-1){
            ctx.lineWidth=whirlWidth+1.5;
            ctx.strokeStyle="#fff";
            ctx.stroke();
            ctx.lineWidth=whirlWidth;
            ctx.strokeStyle=whirlColorBurned;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo.apply(ctx,angToWhirl(new Date(start),min,minuteLength,spaceKatori));
        }else if(section==sectionBurning){
            ctx.lineWidth=whirlWidth+1.5;
            ctx.strokeStyle="#fff";
            ctx.stroke();
            ctx.lineWidth=whirlWidth;
            ctx.strokeStyle=whirlColorBurning;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo.apply(ctx,angToWhirl(new Date(start),min,minuteLength,spaceKatori));
        }
    }
    ctx.lineWidth=whirlWidth+1.5;
    ctx.strokeStyle="#fff";
    ctx.stroke();
    ctx.lineWidth=whirlWidth;
    ctx.strokeStyle=whirlColorKatori;
    ctx.stroke();
}

function angToWhirl(start,plus,sradius,space){
    return clockAngToJsCood(minuteToAng(new Date(start.getTime()+plus*1000*60)),sradius+(plus/60*space));
}

function fillFanClock(start,end,color,prop_radius){
    if(start==end){
        end+=Math.PI*2;
    }
    ctx.beginPath();
    ctx.moveTo.apply(ctx,clockAngToJsCood(0,0));
    ctx.arc(width/2,height/2,clockRadius*prop_radius,clockAngToJsAng(start),clockAngToJsAng(end));
    ctx.fillStyle=color;
    ctx.fill();
}

function setGoalMinute(min){
    glen=min;
    goal=new Date();
    goal.setMinutes(goal.getMinutes()+min);
    setSpaceKatori();
    draw();
}
function setGoalTime(time){
    if(time!=""){
        let tints=time.split(":");
        goal=new Date();
        goal.setHours(tints[0]);
        goal.setMinutes(tints[1]);
        goal.setSeconds(0);
        let now=new Date();
        if(goal<now)goal.setDate(goal.getDate()+1);
        glen=Math.ceil((goal-now)/1000/60);
        setSpaceKatori();
        draw();
    }
}

function onPause(){
    if(pause){
        pause=false;
        pauseBt.value="一時停止";
    }else{
        pause=true;
        pauseBt.value="再開";
        goal_old=new Date(goal.getTime());
        pause_time=new Date(new Date().getTime());
    }
    draw();
}

function setSpaceKatori(){
    spaceKatori=-120/Math.max(glen/60 +1,2)
}
function tick(){
    
    if(goal-new Date()>0){
        pauseBt.hidden=false;
        if(pause){
            goal=new Date(goal_old.getTime()+(new Date()-pause_time));
        }else{
        }
    }else{
        pause=false;
        pauseBt.hidden=true;
    }

    draw();
    setTimeout(tick,1000-new Date().getMilliseconds());
}
tick();
