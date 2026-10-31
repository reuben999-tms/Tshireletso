// Main: page routing and startup
for(let g=0;g<SHUTDOWN_AT/LOCK_EVERY;g++){const d=document.createElement("div");
 for(let i=0;i<LOCK_EVERY;i++)d.appendChild(document.createElement("i"));$("meter").appendChild(d);}
function setRule(){$("rule").textContent="Every "+LOCK_EVERY+" wrong guesses lock the gate for "+FIRST_LOCK+" s, then "+FIRST_LOCK*2+" s. Guess "+SHUTDOWN_AT+" shuts the system down.";}
setRule();
const PAGES=["home","game","lab","learn"],NAMES={home:"home",game:"crack the vault",lab:"lab",learn:"how it works"};
function route(){
 const h=(location.hash||"#home").slice(1),p=PAGES.includes(h)?h:"home";
 PAGES.forEach(n=>{$("p-"+n).hidden=n!==p;});
 document.querySelectorAll(".top nav a").forEach(a=>{if(a.hash==="#"+p)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
 document.title="Tshireletso: "+NAMES[p];
 window.scrollTo(0,0);
}
addEventListener("hashchange",route);route();
if(!(window.crypto&&crypto.subtle)){$("gen").disabled=true;status("Secure hashing is blocked on plain http pages. Open this site over https, or open the file directly.","bad");}
render();
