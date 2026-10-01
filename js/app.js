(()=>{
const D=window.CATALOG,$=s=>document.querySelector(s),app=$('#app');
const DEPTS=[['💻','Laptops y PCs',1,8],['⌨️','Teclados y mouse',9,14],['🖥️','Monitores',15,19],['📱','Celulares y tablets',20,24],['🖨️','Impresión y escaneo',25,30],['🧩','Componentes PC',31,38],['💾','Almacenamiento y cables',39,41],['📡','Redes',42,45],['🎧','Audio, foto y video',46,54],['🎮','Gaming y ergonomía',55,59],['⌚','Accesorios y wearables',60,61],['📺','TV y proyección',62,65],['🏢','Oficina y seguridad',66,70],['🔋','Energía, drones y más',71,76]];
const ICON=n=>(DEPTS.find(d=>n>=d[2]&&n<=d[3])||['📦'])[0];
const P=[];D.forEach(c=>c.p.forEach((p,i)=>{p.cid=c.id;p.cn=c.n;p.i=i;p.key=c.id+'-'+i;p.ic=ICON(+c.id);P.push(p)}));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const Q=n=>'Q'+n.toLocaleString('en-US',{maximumFractionDigits:2});
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const short=s=>({'MAX':'MAX','Pacifiko':'Pacifiko','Kemik':'Kemik'}[s]||s);
let favs=[];try{favs=JSON.parse(localStorage.getItem('techgt-favs')||'[]')}catch(e){}
const saveFavs=()=>{try{localStorage.setItem('techgt-favs',JSON.stringify(favs))}catch(e){}const f=$('#favCount');f.textContent=favs.length;f.hidden=!favs.length};
const find=k=>P.find(p=>p.key===k);

function card(p,o={}){
  const fav=favs.includes(p.key);
  const pic=p.img?`<img src="${p.img}" alt="${esc(p.n)}" loading="lazy">`:`<div class="ph"><i>${p.ic}</i>${esc(p.n)}</div>`;
  return `<article class="card ${o.win?'win':''}" data-k="${p.key}">
  <div class="pic" data-open="${p.key}">${p.b?`<span class="tag">${esc(p.b)}</span>`:''}${o.win?'<span class="tag g">MÁS ECONÓMICO</span>':''}<button class="heart ${fav?'on':''}" data-fav="${p.key}" aria-label="Favorito">${fav?'♥':'♡'}</button>${pic}</div>
  <span class="store">${esc(short(p.st))}</span>
  <h3 data-open="${p.key}">${esc(p.n)}</h3>
  <div class="sp">${esc(p.sp)}</div>
  ${o.cat?`<div class="cat">${esc(p.cn)}</div>`:''}
  <div class="price">${Q(p.pr)}${o.save?`<small>Ahorras ${Q(o.save)}</small>`:''}</div>
  <div class="acts"><a class="btn" href="${esc(p.u)}" target="_blank" rel="noopener noreferrer">${p.f?'Ver sección en':'Ver en'} ${esc(short(p.st))} ↗</a><button class="btn ghost" data-open="${p.key}">Detalles</button></div></article>`;
}
function setNav(k){document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('on',a.dataset.nav===k))}

function home(){
  setNav('home');
  const best=P.filter(p=>p.b==='MEJOR PRECIO'&&p.img).slice(0,8);
  app.innerHTML=`<section class="hero"><div class="eyebrow">Catálogo comparativo · Guatemala</div><h1>Compara precios de tecnología y elige mejor.</h1><p>76 categorías, 152 productos con precio, especificaciones y enlace directo a la tienda.</p>
  <form class="hero-search" id="heroForm"><input name="q" placeholder="Prueba: laptop gamer, monitor 4K, router…" aria-label="Buscar"><button class="btn">Buscar</button></form>
  <div class="chips">${['Laptop','Monitor','Celular','Audífonos','Televisor','Router'].map(t=>`<a href="#/buscar?q=${t}">${t}</a>`).join('')}</div></section>
  <div class="trust"><div><i>⚖️</i><p><b>Comparación directa</b><span>Dos opciones por categoría</span></p></div><div><i>🏬</i><p><b>Tiendas de Guatemala</b><span>Pacifiko, MAX y Kemik</span></p></div><div><i>🔗</i><p><b>Enlace recomendado</b><span>Directo a la tienda</span></p></div><div><i>💸</i><p><b>Precios en quetzales</b><span>Actualizados al catálogo</span></p></div></div>
  <section class="sec"><div class="sec-h"><div><h2>Explora por departamento</h2><p>Encuentra la comparación que necesitas.</p></div><a href="#/buscar?q=">Ver todos →</a></div>
  <div class="depts">${DEPTS.map((d,i)=>`<a class="dept" href="#/depto/${i}"><div class="ic">${d[0]}</div><b>${d[1]}</b><span>${d[3]-d[2]+1} comparaciones</span></a>`).join('')}</div></section>
  <section class="sec"><div class="sec-h"><div><h2>Mejores precios</h2><p>Los ganadores por precio de cada comparación.</p></div><a href="#/buscar?q=&s=asc">Ver más →</a></div><div class="grid">${best.map(p=>card(p,{cat:1})).join('')}</div></section>`;
}
function depto(i){
  setNav('');const d=DEPTS[i];if(!d)return home();
  app.innerHTML=`<div class="crumb"><a href="#/">Inicio</a> / ${esc(d[1])}</div><div class="ph1"><h1>${d[0]} ${esc(d[1])}</h1></div>
  <div class="catgrid">${D.filter(c=>+c.id>=d[2]&&+c.id<=d[3]).map(c=>`<a class="ccard" href="#/cat/${c.id}"><div class="thumbs">${c.p.map(p=>p.img?`<img src="${p.img}" alt="" loading="lazy">`:`<span class="tph">${d[0]}</span>`).join('')}</div><div class="cinfo"><span class="cnum">${esc(c.id)}</span><b>${esc(c.n)}</b><span class="cfrom">Desde <strong>${Q(Math.min(...c.p.map(p=>p.pr)))}</strong> · 2 opciones</span></div><i class="go">→</i></a>`).join('')}</div>`;
}
function cat(id){
  setNav('');const k=D.findIndex(c=>c.id===id);if(k<0)return home();const c=D[k];
  const [a,b]=c.p,lo=a.pr<=b.pr?a:b,hi=lo===a?b:a,d=Math.abs(a.pr-b.pr),pct=hi.pr?Math.round(d/hi.pr*100):0;
  const dep=DEPTS.findIndex(x=>+id>=x[2]&&+id<=x[3]);
  app.innerHTML=`<div class="crumb"><a href="#/">Inicio</a> / <a href="#/depto/${dep}">${esc(DEPTS[dep][1])}</a> / ${esc(c.n)}</div>
  <div class="ph1"><h1>${esc(c.id)}. ${esc(c.n)}</h1></div>
  <div class="sib">${D.filter(x=>+x.id>=DEPTS[dep][2]&&+x.id<=DEPTS[dep][3]).map(x=>`<a href="#/cat/${x.id}" class="${x.id===id?'on':''}">${esc(x.n)}</a>`).join('')}</div>
  <div class="vs">${cardVs(a,a===lo&&d>0)}<div class="vs-mid"><span>VS</span></div>${cardVs(b,b===lo&&d>0)}</div>
  <div class="diff"><b>${d?Q(d):'Mismo precio'}</b><p>${d?`<strong>${esc(lo.n)}</strong> cuesta ${pct}% menos que <strong>${esc(hi.n)}</strong>.`:'Ambas opciones tienen el mismo precio.'}</p></div>
  ${c.rec?`<div class="rec"><b>Recomendación:</b> ${esc(c.rec)}</div>`:''}
  <p class="note">Los precios y existencias pueden variar según la tienda.</p>
  <nav class="pn" aria-label="Navegación entre categorías">${k>0?`<a class="pn-b prev" href="#/cat/${D[k-1].id}"><i>←</i><span><small>Anterior</small><b>${esc(D[k-1].n)}</b></span></a>`:'<span></span>'}<a class="pn-mid" href="#/depto/${dep}" aria-label="Volver al departamento">⊞<span>${esc(DEPTS[dep][1])}</span></a>${k<D.length-1?`<a class="pn-b next" href="#/cat/${D[k+1].id}"><span><small>Siguiente</small><b>${esc(D[k+1].n)}</b></span><i>→</i></a>`:'<span></span>'}</nav>`;
}
function cardVs(p,win){return card(p,{win}).replace('<div class="sp">','<div class="why">'+esc(p.w)+'</div><div class="sp">')}
function results(params,titleOverride,list){
  setNav('buscar');
  const q=params.get('q')||'',terms=norm(q).split(/\s+/).filter(Boolean);
  let base=list||P.filter(p=>{const h=norm([p.n,p.sp,p.cn,p.b,p.st].join(' '));return terms.every(t=>h.includes(t))});
  const stores=[...new Set(P.map(p=>p.st))],st=(params.get('st')||'').split(',').filter(Boolean),mn=+params.get('min')||0,mx=+params.get('max')||0,s=params.get('s')||'',cs=params.get('c')||'';
  let r=base.filter(p=>(!st.length||st.includes(p.st))&&p.pr>=mn&&(!mx||p.pr<=mx)&&(!cs||p.cid===cs));
  if(s==='asc')r.sort((x,y)=>x.pr-y.pr);else if(s==='desc')r.sort((x,y)=>y.pr-x.pr);else if(s==='name')r.sort((x,y)=>x.n.localeCompare(y.n));
  const cats=D.map(c=>`<option value="${c.id}" ${cs===c.id?'selected':''}>${esc(c.id)}. ${esc(c.n)}</option>`).join('');
  app.innerHTML=`<div class="crumb"><a href="#/">Inicio</a> / ${titleOverride||'Búsqueda'}</div><div class="ph1"><h1>${titleOverride||(q?`Resultados para “${esc(q)}”`:'Todos los productos')}</h1></div>
  <div class="layout"><aside class="filters" id="flt"><h3>Filtros</h3>
  <div class="fg"><b style="font-size:.85rem">Tienda</b>${stores.map(x=>`<label><input type="checkbox" name="st" value="${esc(x)}" ${st.includes(x)?'checked':''}>${esc(x)} <span style="color:var(--mut);font-size:.78rem">(${base.filter(p=>p.st===x).length})</span></label>`).join('')}</div>
  <div class="fg"><b style="font-size:.85rem">Precio (Q)</b><div class="rng" style="margin-top:8px"><input type="number" min="0" placeholder="Mín" name="min" value="${mn||''}"><input type="number" min="0" placeholder="Máx" name="max" value="${mx||''}"></div></div>
  <div class="fg"><b style="font-size:.85rem">Categoría</b><select name="c" style="margin-top:8px"><option value="">Todas</option>${cats}</select></div>
  <a class="btn ghost sm" href="#/buscar?q=${encodeURIComponent(q)}" style="margin-top:6px">Limpiar</a></aside>
  <section><div class="tools"><button class="btn ghost sm fbtn" id="fbtn">Filtros</button><span>Mostrando ${r.length} de ${P.length} productos</span><label>Ordenar por <select id="sort"><option value="">Destacados</option><option value="asc" ${s==='asc'?'selected':''}>Precio: menor a mayor</option><option value="desc" ${s==='desc'?'selected':''}>Precio: mayor a menor</option><option value="name" ${s==='name'?'selected':''}>Nombre A–Z</option></select></label></div>
  ${r.length?`<div class="grid">${r.map(p=>card(p,{cat:1})).join('')}</div>`:`<div class="empty"><div class="ic">🔎</div><h3>Sin resultados</h3><p>Prueba con otra palabra o quita filtros.</p></div>`}</section></div>`;
  const apply=()=>{const u=new URLSearchParams();u.set('q',q);const cks=[...document.querySelectorAll('[name=st]:checked')].map(x=>x.value);if(cks.length)u.set('st',cks.join(','));['min','max','c'].forEach(n=>{const v=document.querySelector(`[name=${n}]`).value;if(v)u.set(n,v)});const so=$('#sort').value;if(so)u.set('s',so);location.hash='#/buscar?'+u}
  document.querySelectorAll('#flt input,#flt select,#sort').forEach(e=>e.addEventListener('change',apply));
  $('#fbtn').onclick=()=>$('#flt').classList.toggle('open');
}
function favorites(){setNav('favoritos');const l=P.filter(p=>favs.includes(p.key));
  if(!l.length){app.innerHTML=`<div class="ph1"><h1>Favoritos</h1></div><div class="empty"><div class="ic">♡</div><h3>Aún no tienes favoritos</h3><p>Toca el corazón en cualquier producto para guardarlo.</p><a class="btn" href="#/buscar?q=">Explorar productos</a></div>`;return}
  results(new URLSearchParams(),'Favoritos',l)}

function modal(k){const p=find(k);if(!p)return;const m=$('#modal');
  const other=D.find(c=>c.id===p.cid).p[1-p.i],d=p.pr-other.pr;
  m.innerHTML=`<div class="mbox" role="dialog" aria-modal="true" aria-label="${esc(p.n)}"><button class="mx" aria-label="Cerrar" data-close>✕</button>
  <div class="pic">${p.b?`<span class="tag">${esc(p.b)}</span>`:''}${p.img?`<img src="${p.img}" alt="${esc(p.n)}">`:`<div class="ph"><i>${p.ic}</i>${esc(p.n)}</div>`}</div>
  <div class="mbody"><span class="store">${esc(p.st)}</span><h2>${esc(p.n)}</h2><div class="cat">${esc(p.cn)}</div>
  <div class="price" style="font-size:1.8rem">${Q(p.pr)}</div>
  <ul class="spl">${p.sp.split('·').map(x=>`<li>${esc(x.trim())}</li>`).join('')}</ul>
  <p class="why">${esc(p.w)}</p>
  <p style="font-size:.84rem;color:var(--mut)">Frente a <b>${esc(other.n)}</b>: ${d===0?'mismo precio':d<0?`<span style="color:var(--good);font-weight:700">${Q(-d)} más barato</span>`:`${Q(d)} más caro`}.</p>
  <div class="acts"><a class="btn" href="${esc(p.u)}" target="_blank" rel="noopener noreferrer">${p.f?'Ver sección en':'Ver en'} ${esc(short(p.st))} ↗</a><a class="btn ghost" href="#/cat/${p.cid}" data-close>Ver comparación</a></div>
  <p class="note">${esc(p.av)||'Consultar existencias'} · Precio referencial.</p></div></div>`;
  m.hidden=false;document.body.style.overflow='hidden';m.querySelector('.mx').focus()}
const closeM=()=>{$('#modal').hidden=true;document.body.style.overflow=''};

function buildMega(){$('#megaBody').innerHTML=DEPTS.map((d,i)=>`<section class="mg"><a class="mg-h" href="#/depto/${i}"><span class="mg-ic">${d[0]}</span><b>${esc(d[1])}</b><em>${d[3]-d[2]+1}</em></a><ul>${D.filter(c=>+c.id>=d[2]&&+c.id<=d[3]).map(c=>`<li><a href="#/cat/${c.id}">${esc(c.n)}</a></li>`).join('')}</ul></section>`).join('')}
function toggleMega(f){const m=$('#mega');m.hidden=f!==undefined?!f:!m.hidden;$('#btnCats').setAttribute('aria-expanded',!m.hidden)}

function route(){
  toggleMega(false);closeM();
  const h=location.hash.slice(1)||'/',[path,qs]=h.split('?'),pr=new URLSearchParams(qs||'');
  const seg=path.split('/').filter(Boolean);
  if(!seg.length)home();else if(seg[0]==='cat')cat(seg[1]);else if(seg[0]==='depto')depto(+seg[1]);else if(seg[0]==='buscar'){$('#q').value=pr.get('q')||'';results(pr)}else if(seg[0]==='favoritos')favorites();else home();
  window.scrollTo(0,0);
}
document.addEventListener('click',e=>{
  const f=e.target.closest('[data-fav]');if(f){e.preventDefault();const k=f.dataset.fav;favs=favs.includes(k)?favs.filter(x=>x!==k):[...favs,k];saveFavs();document.querySelectorAll(`[data-fav="${k}"]`).forEach(b=>{const on=favs.includes(k);b.classList.toggle('on',on);b.textContent=on?'♥':'♡'});if(location.hash==='#/favoritos')favorites();return}
  const o=e.target.closest('[data-open]');if(o){modal(o.dataset.open);return}
  if(e.target.closest('[data-close]')||e.target.id==='modal'){closeM();return}
  if(e.target.closest('#btnCats')||e.target.closest('#btnBurger')){toggleMega();return}
  if(!e.target.closest('#mega'))toggleMega(false);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeM();toggleMega(false)}});
document.addEventListener('submit',e=>{if(e.target.id==='searchForm'||e.target.id==='heroForm'){e.preventDefault();const v=e.target.querySelector('input').value.trim();location.hash='#/buscar?q='+encodeURIComponent(v)}});
let t;$('#q').addEventListener('input',e=>{clearTimeout(t);t=setTimeout(()=>{const v=e.target.value.trim();if(v.length>1||location.hash.startsWith('#/buscar'))location.hash='#/buscar?q='+encodeURIComponent(v)},450)});
window.addEventListener('hashchange',route);buildMega();saveFavs();route();
})();
