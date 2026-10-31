// Game: missions, hints, scoring, ranks. Add a mission by adding a line to GL.
const GL=[
{name:"Guest Wi-Fi",story:"Authorised test: a Gaborone café asked you to check its guest Wi-Fi gate. The code is short, but the gate fights back.",len:3,set:"ABCDEF",hints:1},
{name:"Phone lock",story:"Authorised test: a phone repair shop wants its lock screens tested before it sells them. Four characters this time.",len:4,set:"ABCDEF",hints:1},
{name:"School portal",story:"Authorised test: a school hired you to test its marks portal before results day. More characters to choose from.",len:4,set:"ABCDEFGH",hints:1},
{name:"Bank portal",story:"Authorised test: a small business bank signed a permission letter for you to test its login. Five characters.",len:5,set:"ABCDEFGH",hints:2},
{name:"Data centre",story:"Authorised test: a hosting company wants its server room gate pushed to the limit, with a bigger character set.",len:5,set:"ABCDEFGHIJ",hints:2},
{name:"Government vault",story:"Final contract: a ministry wants its vault tested. Six characters, ten possible symbols. Every hint counts.",len:6,set:"ABCDEFGHIJ",hints:2}
];
const G={lvl:0,score:0,code:"",tries:0,until:0,done:false,won:false,t:null,hints:0,reveal:[]};
let best=0;try{best=+localStorage.getItem("tsh-best")||0;}catch(e){}
const range=L=>L.set[0]+" to "+L.set[L.set.length-1];
const gl=n=>n+(n===1?" guess":" guesses");
const rank=s=>s>=2000?"Ghost hacker":s>=1200?"Red teamer":s>=500?"Pen tester":"Script kiddie";
function gStatus(m,c){const s=$("g-status");s.textContent=m;s.className="status "+(c||"");}
function gUI(){const off=G.done||Date.now()<G.until;$("g-guess").disabled=off;$("g-go").disabled=off;gHint();}
function gDraw(){
 const f=G.won?G.tries-1:G.tries;
 [...$("g-meter").querySelectorAll("i")].forEach((el,i)=>{el.classList.toggle("x",i<f);el.classList.toggle("w",G.won&&i===G.tries-1);});
 $("g-score").textContent="Score "+G.score+". Rank: "+rank(G.score)+". Best: "+best+".";
}
function gFeed(g,c){
 let ex=0,cl=0;const gs=[],cs=[];
 for(let i=0;i<c.length;i++){if(g[i]===c[i])ex++;else{gs.push(g[i]);cs.push(c[i]);}}
 gs.forEach(ch=>{const k=cs.indexOf(ch);if(k>-1){cl++;cs.splice(k,1);}});
 return [ex,cl];
}
function gRow(v,ex,cl){
 const li=document.createElement("li"),w=document.createElement("span"),p=document.createElement("span"),t=document.createElement("small");
 w.textContent=v;p.className="pegs";
 for(let i=0;i<ex+cl;i++){const d=document.createElement("i");d.className="pg"+(i<ex?" e":"");p.appendChild(d);}
 t.textContent=ex+" in place, "+cl+" close";
 li.append(w,p,t);$("g-log").appendChild(li);
}
function gTick(){
 clearInterval(G.t);
 const step=()=>{const left=Math.ceil((G.until-Date.now())/1000);
  if(left>0)gStatus("Vault locked. Try again in "+left+" s.","bad");
  else{clearInterval(G.t);if(!G.done)gStatus("Lockout over. "+gl(SHUTDOWN_AT-G.tries)+" left before shutdown.","");}
  gUI();};
 step();G.t=setInterval(step,250);
}
function gSave(){
 if(G.score>best){best=G.score;try{localStorage.setItem("tsh-best",String(best));}catch(e){}return true;}
 return false;
}
function gWin(){
 G.done=true;G.won=true;
 const pts=Math.max(10,(G.lvl+1)*100+(SHUTDOWN_AT-G.tries)*25-G.hints*40),last=G.lvl===GL.length-1;
 G.score+=pts;gSave();
 gStatus("Cracked in "+G.tries+(G.tries===1?" guess":" guesses")+". +"+pts+" points."+(last?" Every vault is open. Final rank: "+rank(G.score)+".":""),"ok");
 $("g-next").textContent=last?"Play again":"Next level";$("g-next").hidden=false;$("g-next").focus();
 gDraw();gUI();
}
function gLose(){
 G.done=true;clearInterval(G.t);const nb=gSave();
 $("goff-p").textContent="The 9th wrong guess shut the system down. The code was "+G.code+". Final score "+G.score+", rank "+rank(G.score)+"."+(nb?" New best score.":"");
 $("goff").classList.add("on");$("g-restart").focus();gDraw();gUI();
}
function gStart(){
 const L=GL[G.lvl];
 G.code=Array.from({length:L.len},()=>L.set[rnd(L.set.length)]).join("");
 G.tries=0;G.until=0;G.done=false;G.won=false;clearInterval(G.t);
 $("g-log").textContent="";$("g-next").hidden=true;
 G.hints=0;G.reveal=[];$("g-hintline").textContent="";$("g-story").textContent=L.story;gBoard();
 $("g-guess").maxLength=L.len;$("g-guess").placeholder=L.len+" characters, "+range(L);
 $("g-info").textContent="Level "+(G.lvl+1)+" of "+GL.length+": "+L.name+". The code has "+L.len+" characters, "+range(L)+".";
 gStatus("Vault armed. Take your first guess.","");gDraw();gUI();
}
$("g-form").onsubmit=e=>{
 e.preventDefault();
 if(G.done||Date.now()<G.until)return;
 const L=GL[G.lvl],v=$("g-guess").value.toUpperCase();
 if(v.length!==L.len||[...v].some(ch=>!L.set.includes(ch))){gStatus("Enter exactly "+L.len+" characters, "+range(L)+".","bad");return;}
 $("g-guess").value="";G.tries++;
 const [ex,cl]=gFeed(v,G.code);gRow(v,ex,cl);
 if(ex===L.len){gWin();return;}
 if(G.tries>=SHUTDOWN_AT){gLose();return;}
 if(G.tries%LOCK_EVERY===0){G.until=Date.now()+G.tries/LOCK_EVERY*4000;gTick();}
 else gStatus(gl(SHUTDOWN_AT-G.tries)+" left before shutdown. Lockout in "+(LOCK_EVERY-G.tries%LOCK_EVERY)+".","");
 gDraw();gUI();$("g-guess").focus();
};
function gHint(){const L=GL[G.lvl];$("g-hint").textContent=G.hints>=L.hints?"No hints left":"Hint ("+(L.hints-G.hints)+" left, -40 points)";$("g-hint").disabled=G.done||G.hints>=L.hints;}
function gBoard(){const b=$("g-board");b.textContent="";GL.forEach((s,i)=>{const li=document.createElement("li");li.textContent=(i<G.lvl?"Cleared: ":i===G.lvl?"Now: ":"Locked: ")+s.name;li.className=i<G.lvl?"done":i===G.lvl?"now":"";b.appendChild(li);});}
$("g-hint").onclick=()=>{
 const L=GL[G.lvl];if(G.done||G.hints>=L.hints)return;
 let p;do{p=rnd(L.len);}while(G.reveal.includes(p));
 G.reveal.push(p);G.hints++;
 $("g-hintline").textContent=G.reveal.map(i=>"Position "+(i+1)+" is "+G.code[i]).join(". ")+".";
 gHint();
};
$("g-next").onclick=()=>{if(G.lvl<GL.length-1)G.lvl++;else{G.lvl=0;G.score=0;}gStart();$("g-guess").focus();};
$("g-restart").onclick=()=>{$("goff").classList.remove("on");G.lvl=0;G.score=0;gStart();$("g-guess").focus();};
for(let g=0;g<SHUTDOWN_AT/LOCK_EVERY;g++){const d=document.createElement("div");for(let i=0;i<LOCK_EVERY;i++)d.appendChild(document.createElement("i"));$("g-meter").appendChild(d);}
gStart();
