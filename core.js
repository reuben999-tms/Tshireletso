const $=id=>document.getElementById(id),el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
const enc=new TextEncoder(),sleep=ms=>new Promise(r=>setTimeout(r,ms)),gl=n=>n+(n===1?" guess":" guesses");
function rnd(n){const lim=Math.floor(4294967296/n)*n,a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=lim);return a[0]%n;}
function makePassword(len){const S=["abcdefghijklmnopqrstuvwxyz","ABCDEFGHIJKLMNOPQRSTUVWXYZ","0123456789","!@#$%^&*()-_=+[]{};:,.<>?/~"],all=S.join(""),o=S.map(s=>s[rnd(s.length)]);
 while(o.length<len)o.push(all[rnd(all.length)]);for(let i=o.length-1;i>0;i--){const j=rnd(i+1);[o[i],o[j]]=[o[j],o[i]];}return o.join("");}
async function hash(pw,s){const k=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]);
 return new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:s,iterations:200000,hash:"SHA-256"},k,256));}
function same(a,b){let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];return d===0;}

