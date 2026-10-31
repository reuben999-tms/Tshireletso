/* ---------- THE TRAIL ---------- */
const STOPS=[
{k:"Phone",day:"Day 1",t:"The found phone",type:"pin",ans:"1403",
 story:[["Case file","Friday’s term marks leaked online before release. Thuto Prep School hired you to find out who did it."],["Taxi rank","A driver hands in a phone. The lock screen says NEO DUBE. A sticky note reads: “Birthday, day then month.” His student card says he was born on 14 March 2008."]],
 hint:"Day first, then month: 14 and 03.",ev:"Neo’s phone: on Friday he chatted with “IT Desk”."},
{k:"Email",day:"Day 2",t:"The email",type:"pick",n:3,right:[0,2,4],ok:"Phishing spotted.",
 story:[["Neo’s inbox","The school’s real email addresses end in thuto-prep.ac.bw. One unread message looks wrong. Tick its 3 red flags."]],
 opts:["Sender: it-desk@thuto-prep-support.co","“Dear student,”","“Your account closes in 2 hours unless you act now.”","“Term 3 marks portal maintenance tonight.”","“Reply with your password to confirm.”","“Kind regards, IT Desk”"],
 hint:"Check the sender’s domain, the pressure, and what it asks for.",ev:"A look-alike email tricked Neo into sharing his password."},
{k:"Cipher",day:"Day 3",t:"The locker note",type:"cipher",ans:"MEETMEATTHELIBRARYATFIVE",
 story:[["Locker 27","A folded note in Neo’s locker: PHHW PH DW WKH OLEUDUB DW ILYH"],["Colleague","Old ciphers move every letter along the alphabet by the same number."]],
 hint:"Shift each letter back by 3: D becomes A.",ev:"Note: someone asked to meet Neo at the library at five."},
{k:"Alibis",day:"Day 4",t:"Who is lying?",type:"pick",n:2,right:[0,2],ok:"Contradiction found.",
 story:[["Interviews and logs","Two of these cannot both be true. Tick them."]],
 opts:["Ms Lerato, clerk: “I was home all Friday evening.”","Mr Kgosi, IT teacher: “I marked papers in my classroom until six.”","Library visitor book: “Friday 17:05, L. Lerato signed in.”","Server log: “Friday 17:12, admin login, staff room PC.”","Neo: “I had football practice until six.”"],
 hint:"Look for a statement that a record disproves.",ev:"Ms Lerato said she was home, but the library book shows her at 17:05."},
{k:"Server",day:"Day 5",t:"The staff room PC",type:"vault",ok:"Server unlocked.",
 story:[["Staff room PC","The log points here. Its admin screen wants a 4-character code, A to F. A filled dot means the right character in the right place, a hollow dot the right character in the wrong place. Nine wrong codes wipe the logs."]],
 ev:"Server log: at 17:14 the marks were exported from the clerk’s account."},
{k:"Verdict",day:"Day 6",t:"Name the culprit",type:"accuse",right:2,who:["Neo Dube","Mr Kgosi","Ms Lerato"],
 story:[["Case review","Review your evidence, then name who leaked the marks."]],
 hint:"Who lied about Friday, and whose account exported the marks?",
 end:"Ms Lerato phished a student, lied about her alibi and exported the marks from her own account."}
];
const S={i:0,score:0,pen:0,hints:0,ev:[],done:false,tries:0,until:0,code:"",rev:[],t:null};
const rank=s=>s>=520?"Cyber sleuth":s>=400?"Lead investigator":s>=250?"Forensic analyst":"Trainee analyst";
const pts=()=>Math.max(10,100-S.pen);
function say(m,c){const s=$("s-status");s.textContent=m;s.className="status "+(c||"");}
function lockPlay(on){$("s-play").querySelectorAll("input,button").forEach(b=>b.disabled=on);}
function pips(){[...$("s-meter").querySelectorAll("i")].forEach((p,i)=>p.classList.toggle("x",i<S.tries));}
function map(){const m=$("map");m.textContent="";STOPS.forEach((s,i)=>{const li=el("li",i<S.i||(i===S.i&&S.done)?"done":i===S.i?"now":"",s.k);m.append(li);});}
function evs(){const u=$("ev");u.textContent="";S.ev.forEach(x=>u.append(el("li","",x)));$("s-score").textContent="Score "+S.score+". Rank: "+rank(S.score)+".";}
function feed(g,c){let x=0,k=0;const a=[],b=[];for(let i=0;i<c.length;i++){if(g[i]===c[i])x++;else{a.push(g[i]);b.push(c[i]);}}
 a.forEach(ch=>{const j=b.indexOf(ch);if(j>-1){k++;b.splice(j,1);}});return [x,k];}
function row(list,v,x,k){const li=el("li"),p=el("span","pegs");for(let i=0;i<x+k;i++)p.append(el("i","pg"+(i<x?" e":"")));
 li.append(el("span","",v),p,el("small","",x+" in place, "+k+" close"));list.append(li);}
function tick(){clearInterval(S.t);const step=()=>{const l=Math.ceil((S.until-Date.now())/1000);
 if(l>0){lockPlay(true);say("Device locked. Try again in "+l+" s.","bad");}
 else{clearInterval(S.t);lockPlay(false);say(gl(9-S.tries)+" left before the device wipes itself.","");}};step();S.t=setInterval(step,250);}
function wrongGuess(){S.tries++;S.pen+=10;pips();
 if(S.tries>=9){fail();return;}
 if(S.tries%3===0){S.until=Date.now()+S.tries/3*4000;tick();}
 else say(gl(9-S.tries)+" left before the device wipes itself.","bad");}
function fail(){S.done=true;clearInterval(S.t);lockPlay(true);S.score=Math.max(0,S.score-50);evs();
 $("off-p").textContent="Nine wrong codes. The device wiped itself and you lose 50 points. Try this day again.";
 $("off").classList.add("on");$("off-b").focus();}
function win(msg){S.done=true;clearInterval(S.t);const p=pts(),s=STOPS[S.i];S.score+=p;if(s.ev)S.ev.push(s.ev);
 say(msg+" +"+p+" points.","ok");lockPlay(true);map();evs();$("s-hint").hidden=true;
 const n=$("s-next");n.hidden=false;n.textContent=S.i<STOPS.length-1?"Go to next day":"Play again";n.focus();}
const P={
 pin(s){const f=el("form"),i=el("input");i.type="text";i.inputMode="numeric";i.maxLength=4;i.placeholder="4-digit passcode";i.setAttribute("aria-label","Passcode");
  const b=el("button","","Unlock");b.type="submit";f.append(i,b);
  f.onsubmit=e=>{e.preventDefault();if(S.done||Date.now()<S.until)return;const v=i.value.trim();
   if(!/^\d{4}$/.test(v)){say("Enter exactly 4 digits.","bad");return;}i.value="";if(v===s.ans)win("Phone unlocked.");else wrongGuess();};
  $("s-play").replaceChildren(f);},
 pick(s){const f=el("form"),box=el("div");
  s.opts.forEach((o,k)=>{const l=el("label","opt"),c=el("input");c.type="checkbox";c.value=k;l.append(c,el("span","",o));box.append(l);});
  const b=el("button","","Check evidence");b.type="submit";f.append(box,b);
  f.onsubmit=e=>{e.preventDefault();if(S.done)return;const got=[...f.querySelectorAll("input:checked")].map(c=>+c.value);
   if(got.length!==s.n){say("Pick exactly "+s.n+".","bad");return;}
   const hit=got.filter(k=>s.right.includes(k)).length;
   if(hit===s.n)win(s.ok);else{S.pen+=20;say(hit+" of "+s.n+" are right. Look again.","bad");}};
  $("s-play").replaceChildren(f);},
 cipher(s){const f=el("form"),i=el("input");i.type="text";i.placeholder="Type the decoded message";i.setAttribute("aria-label","Decoded message");
  const b=el("button","","Decode");b.type="submit";f.append(i,b);
  f.onsubmit=e=>{e.preventDefault();if(S.done)return;
   if(i.value.toUpperCase().replace(/[^A-Z]/g,"")===s.ans)win("Message decoded.");else{S.pen+=20;say("Not yet. Check your shift.","bad");}};
  $("s-play").replaceChildren(f);},
 vault(s){S.code=Array.from({length:4},()=>"ABCDEF"[rnd(6)]).join("");
  const f=el("form"),i=el("input"),lg=el("ol","glog");i.type="text";i.maxLength=4;i.placeholder="4 characters, A to F";i.setAttribute("aria-label","Admin code");
  const b=el("button","","Try code");b.type="submit";f.append(i,b);
  f.onsubmit=e=>{e.preventDefault();if(S.done||Date.now()<S.until)return;const v=i.value.toUpperCase();
   if(!/^[A-F]{4}$/.test(v)){say("Enter 4 characters from A to F.","bad");return;}i.value="";
   const [x,k]=feed(v,S.code);row(lg,v,x,k);if(x===4)win(s.ok);else wrongGuess();};
  $("s-play").replaceChildren(f,lg);},
 accuse(s){const w=el("div","who");
  s.who.forEach((n,k)=>{const b=el("button","alt",n);b.type="button";b.onclick=()=>{if(S.done)return;
   if(k===s.right)win("Case closed. "+s.end+" Final rank: "+rank(S.score+pts())+".");else{S.pen+=30;say("That does not fit the evidence. Review it and try again.","bad");}};w.append(b);});
  $("s-play").replaceChildren(w);}
};
function show(){const s=STOPS[S.i];S.pen=0;S.hints=0;S.tries=0;S.until=0;S.done=false;S.rev=[];clearInterval(S.t);
 $("s-kick").textContent=s.day+" · "+s.k;$("s-title").textContent=s.t;
 const st=$("s-story");st.textContent="";s.story.forEach(([w,x])=>{const m=el("div","msg");m.append(el("b","",w),el("span","",x));st.append(m);});
 $("s-meter").hidden=!(s.type==="pin"||s.type==="vault");pips();
 $("s-next").hidden=true;const h=$("s-hint");h.hidden=false;h.disabled=false;h.textContent=s.type==="vault"?"Reveal a character (-30)":"Hint (-30)";
 say("","");P[s.type](s);map();evs();}
$("s-hint").onclick=()=>{const s=STOPS[S.i],max=s.type==="vault"?2:1;if(S.done||S.hints>=max)return;
 S.hints++;S.pen+=30;
 if(s.type==="vault"){let p;do{p=rnd(4);}while(S.rev.includes(p));S.rev.push(p);say("Revealed: "+S.rev.map(p=>"position "+(p+1)+" is "+S.code[p]).join(", ")+".","");}
 else say("Hint: "+s.hint,"");
 if(S.hints>=max)$("s-hint").disabled=true;};
$("s-next").onclick=()=>{if(S.i<STOPS.length-1)S.i++;else{S.i=0;S.score=0;S.ev=[];}show();};
$("off-b").onclick=()=>{$("off").classList.remove("on");show();};
for(let g=0;g<3;g++){const d=el("div");for(let i=0;i<3;i++)d.append(el("i"));$("s-meter").append(d);}
show();

