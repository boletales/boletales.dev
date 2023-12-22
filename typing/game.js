let goalKanji="";//課題の漢字表記
let goal     ="";//課題の読み仮名
let kanamachi="";
let kana     ="";
let romans   ="";
let kouhos   =[];//現在の文字の入力候補
        
function onkey(e){
    var atoz="abcdefghijklmnopqrstuvwxyz";
    let code=e.keyCode;
    if (code>=65 && code<=90){// a~z
        var char=atoz.substr(code-65,1);
        handleInput(char);
    }else if (code>=48 && code<=57){// 0~9
        var char=code-48;
        handleInput(char);
    }else if (code==173){
        handleInput("-");
    }else if (code==109){
        handleInput("-");
    }else if (code==189){
        handleInput("-");
    }else if (code==190){
        handleInput(".");
    }else if (code==188){
        handleInput(".");
    }

    if(code==17)switchShowingData();//ctrlでデータ表示切り替え
}
function handleInput(char){
    let nowKouho=kouhos.filter(k=>(kana==k[0] && k[2].startsWith(kanamachi+char)));
    if(nowKouho.length>0){
        whenright();
        kanamachi+=char;
        romans+=char;
        let input=nowKouho.find(k=>k[2]==kanamachi);
        if(input!=undefined){//ひらがなが完成したら
            kana=input[1];
            kanamachi=input[3];
            if(kana==goal){
                whendone();
                reset();
            }
        }
    }else{
        whenwrong();
    }
    refresh();
}
reset();

function reset(){
    let next;
    while(next==undefined || (texts[theme].length>1 && next[0]==goalKanji)){
        next=texts[theme][Math.floor(Math.random()*texts[theme].length)];
    }
    goalKanji=next[0];
    goal=next[1];
    kouhos=strToKouho(goal);
    kanamachi="";
    kana="";
    romans="";
    refresh();
}




function strToKouho(string){
    //[そこまでのカナ,その後一入力分のローマ字]
    let search=[[string,""]];//これから候補を検索すべきリスト
    let kouhos=[];
    while(search.length>0){
        let searching=search.pop();
        //次の条件を満たすローマ字を探す:検索中の枝について、その枝のカナがそのローマ字で終わる かつ 次入力がその後のローマ字の先頭に一致
        let kouho=romanTable.filter(r=>(searching[0].endsWith(r[1])&&searching[1].startsWith(r[2])));
        kouho.forEach(k=>{
            kouhos.push([searching[0].slice(0,-k[1].length),searching[0],k[0],k[2]]);
            let newSearch=[searching[0].slice(0,-k[1].length),k[0]];
            //検索リスト上で重複しないばあいnewsearchを追加
            if( search.findIndex( s=>(s[0]==newSearch[0]&&s[1]==newSearch[1]) ) == -1){
                search.unshift(newSearch);
            }
        })
    }
    return kouhos;
}
function getYosoku(){
    let _romans="";
    let _kana=kana;
    let _machi=kanamachi;
    let _nowkouho;
    while(_kana!=goal){
        _nowkouho=kouhos.filter(k=>(_kana==k[0]& k[2].startsWith(_machi)));
        _romans+=_nowkouho[0][2].substr(_machi.length);
        _kana=_nowkouho[0][1];
        _machi=_nowkouho[0][3];
    }
    return _romans;
}