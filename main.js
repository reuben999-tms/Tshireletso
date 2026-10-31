/* ---------- ROUTING ---------- */
const PAGES=["home","trail","lab","learn"],NAMES={home:"home",trail:"the trail",lab:"the lab",learn:"how it works"};
function route(){const h=(location.hash||"#home").slice(1),p=PAGES.includes(h)?h:"home";
 PAGES.forEach(n=>{$("p-"+n).hidden=n!==p;});
 document.querySelectorAll(".top nav a").forEach(a=>{if(a.hash==="#"+p)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
 document.title="Tshireletso: "+NAMES[p];window.scrollTo(0,0);
 if(p==="lab"){if(!T.booted){T.booted=true;boot(BOOT);}else cmd.focus();}}
addEventListener("hashchange",route);route();
if(!(window.crypto&&crypto.subtle)){pr("Secure hashing is blocked on plain http pages. Open this site over https, or open the file directly.","bad");}
