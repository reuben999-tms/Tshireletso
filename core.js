// Core: helpers, password generator, hashing, login gate, attack demo
const LOCK_EVERY=3, SHUTDOWN_AT=9;
let FIRST_LOCK=30;
const SETS={lower:"abcdefghijklmnopqrstuvwxyz",upper:"ABCDEFGHIJKLMNOPQRSTUVWXYZ",digit:"0123456789",symbol:"!@#$%^&*()-_=+[]{};:,.<>?/~"};
const $=id=>document.getElementById(id), enc=new TextEncoder();
let salt=null, secret=null, fails=0, lockSec=FIRST_LOCK, lockUntil=0, down=false, timer=null, attacking=false, sent=0, blocked=0;

function rnd(n){const lim=Math.floor(4294967296/n)*n, a=new Uint32Array(1);
 do{crypto.getRandomValues(a);}while(a[0]>=lim); return a[0]%n;}
function makePassword(len,symbols){
 const sets=[SETS.lower,SETS.upper,SETS.digit].concat(symbols?[SETS.symbol]:[]), all=sets.join("");
 const out=sets.map(s=>s[rnd(s.length)]);
 while(out.length<len) out.push(all[rnd(all.length)]);
 for(let i=out.length-1;i>0;i--){const j=rnd(i+1);[out[i],out[j]]=[out[j],out[i]];}
 return out.join("");
}
async function hash(pw,s){
 const k=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]);
 return new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:s,iterations:200000,hash:"SHA-256"},k,256));
}
function same(a,b){let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];return d===0;}

function status(msg,cls){const s=$("status");s.textContent=msg;s.className="status "+(cls||"");}
function addLog(msg){const li=document.createElement("li"),t=document.createElement("time");
 t.textContent=new Date().toLocaleTimeString();li.append(t,document.createTextNode(msg));$("log").prepend(li);}
function locked(){return Date.now()<lockUntil;}
function ui(){const off=!secret||down||locked();$("guess").disabled=off;$("go").disabled=off;$("atk").disabled=!secret||down;}
function render(){
 [...$("meter").querySelectorAll("i")].forEach((el,i)=>el.classList.toggle("x",i<fails));
 $("count").textContent=fails+" of "+SHUTDOWN_AT+" failed attempts";
 ui();
}
function tick(){
 clearInterval(timer);
 const step=()=>{const left=Math.ceil((lockUntil-Date.now())/1000);
  if(left>0){status("Locked. Try again in "+left+" s.","bad");}
  else{clearInterval(timer);status("Lockout over. Enter the password.","");}
  ui();};
 step();timer=setInterval(step,250);
}
function shutdown(){
 down=true;clearInterval(timer);addLog("System shut down");
 $("off-p").textContent=SHUTDOWN_AT+" wrong passwords. Every login is blocked until the system restarts.";
 $("off").classList.add("on");$("restart").focus();ui();
}

$("len").oninput=()=>{$("lenv").textContent=$("len").value;};
$("gen").onclick=async()=>{
 const pw=makePassword(+$("len").value,$("sym").checked);
 $("pw").textContent=pw;
 salt=crypto.getRandomValues(new Uint8Array(16));
 secret=await hash(pw,salt);
 fails=0;lockSec=FIRST_LOCK;lockUntil=0;clearInterval(timer);
 status("New password set. Try logging in.","");render();
};
$("copy").onclick=async()=>{
 const t=$("pw").textContent;if(!t)return;
 try{await navigator.clipboard.writeText(t);$("copy").textContent="Copied";}
 catch(e){const r=document.createRange();r.selectNodeContents($("pw"));const s=getSelection();s.removeAllRanges();s.addRange(r);$("copy").textContent="Select and copy";}
 setTimeout(()=>{$("copy").textContent="Copy";},1600);
};
$("form").onsubmit=async e=>{
 e.preventDefault();
 if(down||!secret||locked())return;
 const guess=$("guess").value;$("guess").value="";
 if(same(await hash(guess,salt),secret)){
  fails=0;lockSec=FIRST_LOCK;status("Access granted. Failed-attempt counter reset.","ok");render();return;
 }
 fails++;addLog("Failed attempt "+fails+" of "+SHUTDOWN_AT);
 if(fails>=SHUTDOWN_AT){render();shutdown();return;}
 if(fails%LOCK_EVERY===0){lockUntil=Date.now()+lockSec*1000;addLog("Locked for "+lockSec+" s");lockSec*=2;render();tick();return;}
 status("Wrong password. "+(LOCK_EVERY-fails%LOCK_EVERY)+" more before lockout.","bad");render();
 $("guess").focus();
};
$("restart").onclick=()=>{
 down=false;fails=0;lockSec=FIRST_LOCK;lockUntil=0;
 $("off").classList.remove("on");addLog("System restarted");
 status("System restarted. Enter the password.","");render();$("guess").focus();
};

const WORDS=["123456","password","qwerty","admin","letmein","welcome","iloveyou","monkey","dragon","password123","12345678","abc123","Botswana1","gaborone"];
function stats(){$("stats").textContent="Attacker sent "+sent+" guesses. "+blocked+" were blocked by the lockout, "+(sent-blocked)+" reached the password check.";}
$("fast").onchange=()=>{FIRST_LOCK=$("fast").checked?5:30;lockSec=FIRST_LOCK;setRule();};
$("atk").onclick=async()=>{
 if(attacking){attacking=false;return;}
 attacking=true;sent=0;blocked=0;$("atk").textContent="Stop attack";stats();
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 for(let i=0;attacking&&!down;i++){
  const g=i<WORDS.length?WORDS[i]:Math.random().toString(36).slice(2,12);
  sent++;
  if(locked()){blocked++;}
  else{$("guess").value=g;await $("form").onsubmit({preventDefault(){}});}
  stats();await pause(200);
 }
 attacking=false;$("atk").textContent="Launch brute-force attack";
 status(down?"Attack ended: the system shut down.":"Attack stopped.",down?"bad":"");
};
