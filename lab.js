/* ---------- THE LAB (terminal) ---------- */
const T={mode:"guest",salt:null,hash:null,fails:0,first:30,lockSec:30,until:0,hist:[],hi:0,log:[],booted:false,stop:false};
const out=$("t-out"),cmd=$("t-cmd"),ps=$("t-ps");
const BOOT=["TSH-GATE 2.1 · secure access node gab-srv-01","Connecting to 10.0.4.17 ... connected","Authorised users only. Every failed login is logged.","No admin credential on file. Type genpass 16, then login. Type help for commands."];
const HELP={guest:"genpass [8-32]  create the admin credential\nlogin           sign in as admin\nattack          brute-force the gate\nfast            toggle 5 s lockouts\nstatus, clear",shell:"ls, cat <file>, whoami, logs, status, genpass, logout, clear",halted:"reboot"};
const FILES={"readme.md":"Gate node gab-srv-01. Rotate the admin credential every 90 days.","notes.txt":"Nine failed logins halt the node. Lockouts double: 30 s, then 60 s."};
function pr(x,c){out.append(el("div","tl"+(c?" "+c:""),x));out.scrollTop=out.scrollHeight;}
function pp(){ps.textContent={shell:"admin@gate:~# ",pass:"Password: ",halted:"halt# ",guest:"guest@gate:~$ "}[T.mode];cmd.type=T.mode==="pass"?"password":"text";}
function bar(){$("t-fail").textContent="failed "+T.fails+"/9"+(Date.now()<T.until?" · locked":"")+(T.mode==="halted"?" · halted":"");}
async function boot(lines){const d=matchMedia("(prefers-reduced-motion:reduce)").matches?0:200;cmd.disabled=true;
 for(const l of lines){pr(l);await sleep(d);}cmd.disabled=false;pp();cmd.focus();}
function failLogin(){T.fails++;T.log.push(new Date().toLocaleTimeString()+"  FAILED login for admin from 10.0.4.2 (#"+T.fails+")");pr("Authentication failure.","bad");
 if(T.fails>=9){T.mode="halted";T.log.push("HALT: intrusion threshold reached");
  pr("KERNEL: intrusion threshold reached (9 failed logins)","bad");pr("KERNEL: stopping services ...","bad");pr("System halted. Type reboot to restart the node.","bad");}
 else if(T.fails%3===0){T.until=Date.now()+T.lockSec*1000;pr("Too many failures. Login disabled for "+T.lockSec+" s.","bad");T.lockSec*=2;}
 else pr((3-T.fails%3)+" more before lockout.","bad");bar();}
async function attack(){
 if(!T.hash){pr("No credential on file. Run genpass first.","bad");return;}
 const W=["123456","password","qwerty","admin","letmein","welcome","iloveyou","monkey","dragon","password123","12345678","abc123","gaborone","botswana1"];
 T.stop=false;let sent=0,blk=0,i=0;pr("[attack] brute force started. Press Ctrl+C to stop. Tip: run fast first.","warn");
 while(T.mode!=="halted"&&!T.stop){
  if(Date.now()<T.until){sent++;blk++;await sleep(200);continue;}
  const g=i<W.length?W[i]:Math.random().toString(36).slice(2,11);i++;sent++;pr("[attack] trying "+g);
  if(same(await hash(g,T.salt),T.hash)){pr("[attack] password found: "+g,"ok");break;}
  failLogin();await sleep(150);}
 pr("[attack] ended. "+sent+" guesses sent, "+blk+" blocked by lockouts.","warn");}
async function run(line){const [c,a]=line.split(/\s+/);
 if(T.mode==="halted"){if(c==="reboot"){T.mode="guest";T.fails=0;T.until=0;T.lockSec=T.first;bar();await boot(["Rebooting ...","Node back online. The credential was kept. Type login."]);}else if(c)pr("System halted. Type reboot.","bad");return;}
 if(c==="")return;
 if(c==="help"){pr(HELP[T.mode]);return;}
 if(c==="clear"){out.textContent="";return;}
 if(c==="status"){pr("failed logins: "+T.fails+"/9\nlockout: "+(Date.now()<T.until?Math.ceil((T.until-Date.now())/1000)+" s left":"none")+"\ncredential: "+(T.hash?"set":"not set"));return;}
 if(c==="genpass"){const pw=makePassword(Math.min(32,Math.max(8,+a||16)));T.salt=crypto.getRandomValues(new Uint8Array(16));T.hash=await hash(pw,T.salt);
  T.fails=0;T.until=0;T.lockSec=T.first;bar();pr("New admin password: "+pw,"ok");pr("Only a salted hash is stored. Type login to sign in.");return;}
 if(c==="fast"){T.first=T.first===30?5:30;T.lockSec=T.first;pr("Lockouts are now "+T.first+" s, then "+T.first*2+" s.");return;}
 if(T.mode==="guest"){
  if(c==="login"){if(!T.hash){pr("No credential on file. Run genpass first.","bad");return;}
   const l=Math.ceil((T.until-Date.now())/1000);if(l>0){pr("Login disabled for "+l+" s.","bad");return;}T.mode="pass";pr("Login: admin");}
  else if(c==="attack")await attack();
  else pr("command not found: "+c+" (try help)","bad");return;}
 if(c==="ls")pr("readme.md  notes.txt  students.db  auth.log");
 else if(c==="whoami")pr("admin");
 else if(c==="logs"||(c==="cat"&&a==="auth.log"))pr(T.log.length?T.log.join("\n"):"(no failed logins on record)");
 else if(c==="cat"&&FILES[a])pr(FILES[a]);
 else if(c==="cat"&&a==="students.db")pr("Permission denied: audit-only file. This session is recorded.","bad");
 else if(c==="cat")pr("cat: "+(a||"missing file")+": no such file","bad");
 else if(c==="logout"){T.mode="guest";pr("Connection closed. Type login to sign in again.");}
 else pr("command not found: "+c,"bad");}
cmd.onkeydown=async e=>{
 if(e.key==="ArrowUp"&&T.hist.length){T.hi=Math.max(0,T.hi-1);cmd.value=T.hist[T.hi]||"";e.preventDefault();return;}
 if(e.key!=="Enter")return;const v=cmd.value;cmd.value="";cmd.disabled=true;
 if(T.mode==="pass"){pr("Password: "+"•".repeat(v.length));T.mode="guest";
  if(same(await hash(v,T.salt),T.hash)){T.fails=0;T.until=0;T.lockSec=T.first;T.mode="shell";bar();
   pr("Authentication successful.","ok");pr("Last login: "+new Date().toDateString()+" from 10.0.4.2");pr("Welcome, admin. Type help.");}
  else failLogin();
 }else{pr(ps.textContent+v);if(v.trim()){T.hist.push(v);T.hi=T.hist.length;}await run(v.trim());}
 cmd.disabled=false;pp();cmd.focus();};
addEventListener("keydown",e=>{if(e.ctrlKey&&e.key==="c")T.stop=true;});
$("term").onclick=()=>{if(!cmd.disabled)cmd.focus();};
setInterval(bar,500);

