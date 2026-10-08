(()=>{
const D=window.CATALOG,$=s=>document.querySelector(s),app=$('#app');
/* ---------- Departamentos (ids explícitos) ---------- */
const rng=(a,b)=>Array.from({length:b-a+1},(_,i)=>String(a+i).padStart(2,'0'));
const DEPTS=[
 {ic:'💻',n:'Laptops y PCs',ids:rng(1,8)},
 {ic:'⌨️',n:'Teclados y mouse',ids:[...rng(9,14),'77']},
 {ic:'🖥️',n:'Monitores',ids:rng(15,19)},
 {ic:'📱',n:'Celulares y tablets',ids:rng(20,24)},
 {ic:'🖨️',n:'Impresión y escaneo',ids:[...rng(25,30),'81']},
 {ic:'🧩',n:'Componentes PC',ids:rng(31,38)},
 {ic:'💾',n:'Almacenamiento y cables',ids:['39','40','41','78','85']},
 {ic:'📡',n:'Redes y cableado',ids:['42','43','44','45','82','83','84']},
 {ic:'🎧',n:'Audio, foto y video',ids:rng(46,54)},
 {ic:'🎮',n:'Gaming y ergonomía',ids:rng(55,59)},
 {ic:'🔌',n:'Cargadores y accesorios',ids:['60','61','79','80']},
 {ic:'📺',n:'TV y proyección',ids:rng(62,65)},
 {ic:'🏢',n:'Oficina y seguridad',ids:rng(66,70)},
 {ic:'🔋',n:'Energía, drones y más',ids:rng(71,76)}
];
const NEWIDS=new Set(rng(77,85));
const deptOf=id=>DEPTS.findIndex(d=>d.ids.includes(id));
const catsOf=i=>DEPTS[i].ids.map(id=>D.find(c=>c.id===id)).filter(Boolean);
const P=[];D.forEach(c=>c.p.forEach((p,i)=>{p.cid=c.id;p.cn=c.n;p.i=i;p.key=c.id+'-'+i;p.d=deptOf(c.id);p.ic=DEPTS[p.d].ic;p.isNew=NEWIDS.has(c.id);p.hasPr=p.pr!=null;P.push(p)}));
/* ---------- Utilidades ---------- */
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const Q=n=>'Q'+n.toLocaleString('en-US',{maximumFractionDigits:2});
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const stem=t=>t.length>3?t.replace(/(es|s)$/,''):t;
let favs=[];try{favs=JSON.parse(localStorage.getItem('techgt-favs')||'[]')}catch(e){}
const saveFavs=()=>{try{localStorage.setItem('techgt-favs',JSON.stringify(favs))}catch(e){}const f=$('#favCount');f.textContent=favs.length;f.hidden=!favs.length};
const find=k=>P.find(p=>p.key===k);
const priceTxt=p=>p.hasPr?Q(p.pr):'Ver precio';
/* ---------- Búsqueda inteligente (sinónimos + relevancia) ---------- */
const ALIAS={
 celular:['!telefono gama'],movil:['!telefono gama'],smartphone:['!telefono gama','!smartphone'],
 telefono:['!telefono','!smartphone'],
 laptop:['!laptop','!portatil'],portatil:['!laptop','!portatil'],
 computadora:['!computadora','!todo en uno','!mini pc','laptop'],pc:['!computadora','!pc ','laptop'],
 pantalla:['!monitor','!televisor','!tv '],tv:['!televisor','!tv '],
 audifono:['!audifono','!headset','!tws'],auricular:['!audifono','!headset'],
 impresora:['!impresora'],cable:['!cable'],cargador:['!cargador','!power bank','!estacion de carga'],
 usb:['!memoria usb','!memorias usb','usb'],pendrive:['!memoria usb','!memorias usb'],flash:['!memoria usb','!memorias usb'],
 wifi:['!wi-fi','!wi‑fi','!router','!mesh'],internet:['!router','!mesh','!4g','!5g'],
 camara:['!camara','!webcam','!gopro'],silla:['!silla'],mouse:['!mouse','mousepad','mouse pad','alfombrilla'],
 mousepad:['!mouse pad','!alfombrilla','!almohadilla'],alfombrilla:['!mouse pad','!alfombrilla'],
 rj45:['!rj45','!rj-45','!patch','!utp','!ethernet'],utp:['!utp','rj45','ethernet'],ethernet:['!ethernet','!utp','rj45'],red:['!red ','!router','!switch','!utp','!rj45']
};
const hay=p=>({main:norm([p.n,p.cn,p.b].join(' ')),spec:norm([p.sp,p.st].join(' '))});
P.forEach(p=>p._h=hay(p));
function score(p,terms){
  let s=0;
  for(const raw of terms){
    const t=stem(raw),al=ALIAS[t]||ALIAS[raw]||[];
    const forms=al.length?al.map(x=>({f:norm(x.replace('!','')),w:x[0]==='!'?12:8})):[{f:t,w:10}];
    if(al.length)forms.push({f:t,w:6});
    let best=0;
    for(const {f,w} of forms){
      if(p._h.main.includes(f))best=Math.max(best,w);
      else if(p._h.spec.includes(f))best=Math.max(best,3);
    }
    if(!best)return 0;s+=best;
  }
  return s;
}
function searchList(q){
  const terms=norm(q).split(/\s+/).filter(Boolean);
  if(!terms.length)return P.map(p=>({p,s:1}));
  return P.map(p=>({p,s:score(p,terms)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
}
/* ---------- Tarjeta de producto ---------- */
function pic(p){return p.img?`<img src="${p.img}" alt="${esc(p.n)}" loading="lazy">`:`<div class="ph"><i>${p.ic}</i><span>${esc(p.n)}</span></div>`}
function card(p,o={}){
  const fav=favs.includes(p.key);
  return `<article class="card ${o.win?'win':''}" data-k="${p.key}">
  <div class="pic" data-open="${p.key}"><div class="tags">${p.isNew?'<span class="tag n">NUEVO</span>':''}${p.b?`<span class="tag">${esc(p.b)}</span>`:''}${o.win?'<span class="tag g">MÁS ECONÓMICO</span>':''}</div><button class="heart ${fav?'on':''}" data-fav="${p.key}" aria-label="Favorito">${fav?'♥':'♡'}</button>${pic(p)}</div>
  <span class="store">${esc(p.st)}</span>
  <h3 data-open="${p.key}">${esc(p.n)}</h3>
  ${o.why?`<div class="why"><b>✓ Por qué es buena opción</b>${esc(p.w)}</div>`:''}
  <div class="sp">${esc(p.sp)}</div>
  ${o.cat?`<div class="cat">${esc(p.cn)}</div>`:''}
  <div class="price ${p.hasPr?'':'nopr'}">${p.hasPr?Q(p.pr):'Precio en tienda'}${o.save?`<small>Ahorras ${Q(o.save)}</small>`:''}</div>
  <div class="acts"><a class="btn" href="${esc(p.u)}" target="_blank" rel="noopener noreferrer">${p.hasPr?'Ver en':'Ver precio en'} ${esc(p.st)} ↗</a><button class="btn ghost" data-open="${p.key}">Detalles</button></div></article>`;
}
function setNav(k){document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('on',a.dataset.nav===k))}
const deptChips=(sel)=>`<div class="dchips">${DEPTS.map((d,i)=>`<a href="#/depto/${i}" class="${sel===i?'on':''}"><span>${d.ic}</span>${esc(d.n)}</a>`).join('')}</div>`;
/* ---------- Inicio ---------- */
function home(){
  setNav('home');
  const best=P.filter(p=>p.b==='MEJOR PRECIO'&&p.img&&p.hasPr).slice(0,8);
  const fresh=P.filter(p=>p.isNew).slice(0,8);
  const quick=[['📱','Celulares','#/depto/3'],['💻','Laptops','#/depto/0'],['🖥️','Monitores','#/depto/2'],['🎧','Audífonos','#/buscar?q=audifonos'],['📺','Televisores','#/depto/11'],['📡','Redes','#/depto/7'],['🔌','Cargadores','#/buscar?q=cargador'],['🖱️','Mouse pad','#/cat/77']];
  app.innerHTML=`<section class="hero"><div class="eyebrow">R&amp;M Tech · Catálogo comparativo · Guatemala</div><h1>Compara precios de tecnología y elige mejor.</h1><p>${D.length} categorías y ${P.length} productos con especificaciones, comparación directa y enlace a la tienda.</p>
  <form class="hero-search" id="heroForm"><input name="q" placeholder="Prueba: celular, laptop gamer, cable UTP, mouse pad…" aria-label="Buscar" autocomplete="off"><button class="btn">Buscar</button></form>
  <div class="chips">${quick.map(c=>`<a href="${c[2]}"><span>${c[0]}</span>${c[1]}</a>`).join('')}</div></section>
  <div class="trust"><div><i>⚖️</i><p><b>Comparación directa</b><span>Opciones lado a lado</span></p></div><div><i>🏬</i><p><b>Tiendas de Guatemala</b><span>Pacifiko, MAX y Kemik</span></p></div><div><i>🔗</i><p><b>Enlace a la tienda</b><span>Ficha directa del producto</span></p></div><div><i>💡</i><p><b>Te decimos cuál elegir</b><span>Y para quién es cada una</span></p></div></div>
  <section class="sec"><div class="sec-h"><div><h2>Explora por departamento</h2><p>Encuentra la comparación que necesitas.</p></div><a href="#/buscar?q=">Ver todos →</a></div>
  <div class="depts">${DEPTS.map((d,i)=>{const n=d.ids.length,pc=d.ids.reduce((a,id)=>a+D.find(c=>c.id===id).p.length,0);return `<a class="dept" href="#/depto/${i}"><div class="ic">${d.ic}</div><b>${esc(d.n)}</b><span>${n} categorías · ${pc} productos</span></a>`}).join('')}</div></section>
  <section class="sec"><div class="sec-h"><div><h2>Recién agregados</h2><p>Cables, cargadores, memorias USB, mouse pad y más.</p></div><a href="#/buscar?q=&n=1">Ver todos →</a></div><div class="grid">${fresh.map(p=>card(p,{cat:1})).join('')}</div></section>
  <section class="sec"><div class="sec-h"><div><h2>Mejores precios</h2><p>Los ganadores por precio de cada comparación.</p></div><a href="#/buscar?q=&s=asc">Ver más →</a></div><div class="grid">${best.map(p=>card(p,{cat:1})).join('')}</div></section>`;
}
/* ---------- Departamento ---------- */
function depto(i){
  setNav('');const d=DEPTS[i];if(!d)return home();
  app.innerHTML=`<div class="crumb"><a href="#/">Inicio</a> / ${esc(d.n)}</div><div class="ph1"><h1>${d.ic} ${esc(d.n)}</h1><span class="cnt">${d.ids.length} categorías</span></div>${deptChips(i)}
  <div class="catgrid">${catsOf(i).map(c=>{const pr=c.p.filter(p=>p.hasPr).map(p=>p.pr);return `<a class="ccard" href="#/cat/${c.id}"><div class="thumbs n${Math.min(c.p.length,3)}">${c.p.slice(0,3).map(p=>p.img?`<img src="${p.img}" alt="" loading="lazy">`:`<span class="tph">${d.ic}</span>`).join('')}</div><div class="cinfo"><span class="cnum">${NEWIDS.has(c.id)?'<em class="newb">NUEVO</em>':''}${esc(c.id)}</span><b>${esc(c.n)}</b><span class="cfrom">${pr.length?`Desde <strong>${Q(Math.min(...pr))}</strong> · `:''}${c.p.length} opciones</span></div><i class="go">→</i></a>`}).join('')}</div>`;
}
/* ---------- Categoría ---------- */
function groupsOf(ps){const g=[];let i=0;while(i<ps.length){const left=ps.length-i;const n=left===3?3:2;g.push(ps.slice(i,i+n));i+=n}return g}
function block(ps,no,total){
  const priced=ps.filter(p=>p.hasPr);
  const lo=priced.length?priced.reduce((a,b)=>a.pr<=b.pr?a:b):null,hi=priced.length>1?priced.reduce((a,b)=>a.pr>=b.pr?a:b):null;
  const win=p=>priced.length>1&&p===lo&&hi.pr>lo.pr;
  let diff='';
  if(priced.length===ps.length&&priced.length>1){const d=hi.pr-lo.pr,pct=hi.pr?Math.round(d/hi.pr*100):0;diff=`<div class="diff"><b>${d?Q(d):'Mismo precio'}</b><p>${d?(ps.length===2?`<strong>${esc(lo.n)}</strong> cuesta ${pct}% menos que <strong>${esc(hi.n)}</strong>.`:`de diferencia entre la opción más económica (<strong>${esc(lo.n)}</strong>) y la más cara.`):'Todas las opciones tienen el mismo precio.'}</p></div>`}
  const cards=ps.map(p=>card(p,{win:win(p),why:1})).join('<div class="vs-mid"><span>VS</span></div>');
  const verdict=`<section class="verdict"><h2>¿Cuál elegir?</h2><div class="vgrid ${ps.length===3?'tri':''}">${ps.map(p=>{let t='';if(priced.length>1&&p.hasPr){const dd=p.pr-lo.pr;t=dd===0?'Es la opción más económica.':`Cuesta ${Q(dd)} más que la más económica.`}else if(!p.hasPr)t='Consulta el precio actualizado en la tienda.';return `<div class="vcard ${win(p)?'cheap':''}"><div class="vtop"><span class="vbadge">${esc(p.b||'Opción')}</span><b class="vprice">${p.hasPr?Q(p.pr):'—'}</b></div><h3>Elige ${esc(p.n)}</h3><p>Si ${esc(p.use)}.</p><small>${t}</small></div>`}).join('')}</div></section>`;
  return `<section class="cmpblock">${total>1?`<div class="cmph"><span>Comparación ${no} de ${total}</span></div>`:''}<div class="vs ${ps.length===3?'vs3':''}">${cards}</div>${diff}${verdict}</section>`;
}
function cat(id){
  setNav('');const k=D.findIndex(c=>c.id===id);if(k<0)return home();const c=D[k];
  const dep=deptOf(id),gs=groupsOf(c.p);
  app.innerHTML=`<div class="crumb"><a href="#/">Inicio</a> / <a href="#/depto/${dep}">${esc(DEPTS[dep].n)}</a> / ${esc(c.n)}</div>
  <div class="ph1"><h1>${esc(c.id)}. ${esc(c.n)}</h1></div>
  <div class="sib">${catsOf(dep).map(x=>`<a href="#/cat/${x.id}" class="${x.id===id?'on':''}">${esc(x.n)}</a>`).join('')}</div>
  ${gs.map((g,i)=>block(g,i+1,gs.length)).join('')}
  <p class="note">Los precios y existencias pueden variar según la tienda.${c.p.some(p=>!p.hasPr)?' Los productos sin precio muestran el valor vigente al abrir su ficha en la tienda.':''}</p>
  <nav class="pn" aria-label="Navegación entre categorías">${k>0?`<a class="pn-b prev" href="#/cat/${D[k-1].id}"><i>←</i><span><small>Anterior</small><b>${esc(D[k-1].n)}</b></span></a>`:'<span></span>'}<a class="pn-mid" href="#/depto/${dep}" aria-label="Volver al departamento">⊞<span>${esc(DEPTS[dep].n)}</span></a>${k<D.length-1?`<a class="pn-b next" href="#/cat/${D[k+1].id}"><span><small>Siguiente</small><b>${esc(D[k+1].n)}</b></span><i>→</i></a>`:'<span></span>'}</nav>`;
}
/* ---------- Resultados / filtros ---------- */
function results(params,titleOverride,list){
  setNav('buscar');
  const q=params.get('q')||'',onlyNew=params.get('n')==='1';
  const base=(list?list.map(p=>({p,s:1})):searchList(q)).filter(x=>!onlyNew||x.p.isNew);
  const stores=[...new Set(P.map(p=>p.st))],st=(params.get('st')||'').split(',').filter(Boolean),mn=+params.get('min')||0,mx=+params.get('max')||0,s=params.get('s')||'',cs=params.get('c')||'',ds=params.get('d')||'';
  let r=base.filter(({p})=>(!st.length||st.includes(p.st))&&(!ds||String(p.d)===ds)&&(!cs||p.cid===cs)&&(!(mn||mx)||(p.hasPr&&p.pr>=mn&&(!mx||p.pr<=mx))));
  const withPr=(a,b,f)=>a.p.hasPr&&b.p.hasPr?f(a.p,b.p):a.p.hasPr?-1:b.p.hasPr?1:0;
  if(s==='asc')r.sort((a,b)=>withPr(a,b,(x,y)=>x.pr-y.pr));else if(s==='desc')r.sort((a,b)=>withPr(a,b,(x,y)=>y.pr-x.pr));else if(s==='name')r.sort((a,b)=>a.p.n.localeCompare(b.p.n));
  const strong=r.filter(x=>x.s>=8||x.s===1),weak=s?[]:r.filter(x=>x.s<8&&x.s!==1);
  const shown=s?r:[...strong,...weak];
  const cats=D.map(c=>`<option value="${c.id}" ${cs===c.id?'selected':''}>${esc(c.id)}. ${esc(c.n)}</option>`).join('');
  const dcount=i=>base.filter(x=>x.p.d===i).length;
  const active=[];
  if(ds!=='')active.push(['d',DEPTS[+ds].n]);if(cs)active.push(['c',D.find(c=>c.id===cs).n]);st.forEach(x=>active.push(['st',x]));if(mn||mx)active.push(['pr',`Q${mn||0} – ${mx?'Q'+mx:'sin límite'}`]);if(onlyNew)active.push(['n','Solo nuevos']);
  const cardsHtml=(()=>{let h='',sw=false;shown.forEach((x,i)=>{if(!s&&weak.length&&strong.length&&!sw&&x.s<8&&x.s!==1){sw=true;h+='<div class="rel">Resultados relacionados</div>'}h+=card(x.p,{cat:1})});return h})();
  app.innerHTML=`<div class="crumb"><a href="#/">Inicio</a> / ${titleOverride||'Búsqueda'}</div><div class="ph1"><h1>${titleOverride||(q?`Resultados para “${esc(q)}”`:'Todos los productos')}</h1></div>
  ${list?'':`<div class="dchips scroll"><a href="#" data-dept="" class="${ds===''?'on':''}">Todos <em>${base.length}</em></a>${DEPTS.map((d,i)=>dcount(i)?`<a href="#" data-dept="${i}" class="${ds===String(i)?'on':''}"><span>${d.ic}</span>${esc(d.n)} <em>${dcount(i)}</em></a>`:'').join('')}</div>`}
  <div class="layout"><aside class="filters" id="flt"><div class="fh"><h3>Filtros</h3><button class="fx" id="fclose" aria-label="Cerrar filtros">✕</button></div>
  <div class="fg"><b>Tienda</b>${stores.map(x=>`<label><input type="checkbox" name="st" value="${esc(x)}" ${st.includes(x)?'checked':''}>${esc(x)} <span class="mutc">(${base.filter(y=>y.p.st===x).length})</span></label>`).join('')}</div>
  <div class="fg"><b>Precio (Q)</b><div class="rng"><input type="number" min="0" inputmode="numeric" placeholder="Mín" name="min" value="${mn||''}"><input type="number" min="0" inputmode="numeric" placeholder="Máx" name="max" value="${mx||''}"></div><small class="mutc">Los productos sin precio se ocultan al filtrar por precio.</small></div>
  <div class="fg"><b>Categoría</b><select name="c"><option value="">Todas</option>${cats}</select></div>
  <div class="fg"><label><input type="checkbox" name="n" ${onlyNew?'checked':''}> Solo productos nuevos</label></div>
  <a class="btn ghost sm" href="#/buscar?q=${encodeURIComponent(q)}">Limpiar filtros</a></aside>
  <section><div class="tools"><button class="btn ghost sm fbtn" id="fbtn">⚙ Filtros</button><span>${shown.length} de ${base.length} productos</span><label>Ordenar por <select id="sort"><option value="">Relevancia</option><option value="asc" ${s==='asc'?'selected':''}>Precio: menor a mayor</option><option value="desc" ${s==='desc'?'selected':''}>Precio: mayor a menor</option><option value="name" ${s==='name'?'selected':''}>Nombre A–Z</option></select></label></div>
  ${active.length?`<div class="act-f">${active.map(a=>`<button data-rm="${a[0]}|${esc(a[1])}">${esc(a[1])} ✕</button>`).join('')}</div>`:''}
  ${shown.length?`<div class="grid">${cardsHtml}</div>`:`<div class="empty"><div class="ic">🔎</div><h3>Sin resultados</h3><p>Prueba con otra palabra o quita filtros.</p><a class="btn" href="#/buscar?q=">Ver todo el catálogo</a></div>`}</section></div>`;
  const apply=(over={})=>{const u=new URLSearchParams();u.set('q',q);const cks=[...document.querySelectorAll('[name=st]:checked')].map(x=>x.value);if(cks.length)u.set('st',cks.join(','));['min','max','c'].forEach(n=>{const v=document.querySelector(`[name=${n}]`).value;if(v)u.set(n,v)});if(document.querySelector('[name=n]').checked)u.set('n','1');const so=$('#sort').value;if(so)u.set('s',so);const dd='d' in over?over.d:ds;if(dd!=='')u.set('d',dd);location.hash='#/buscar?'+u};
  document.querySelectorAll('#flt input,#flt select,#sort').forEach(e=>e.addEventListener('change',()=>apply()));
  document.querySelectorAll('[data-dept]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();apply({d:a.dataset.dept})}));
  document.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',()=>{const [k,v]=b.dataset.rm.split('|');const u=new URLSearchParams(params);if(k==='st'){const l=(u.get('st')||'').split(',').filter(x=>x&&x!==v);l.length?u.set('st',l.join(',')):u.delete('st')}else if(k==='pr'){u.delete('min');u.delete('max')}else u.delete(k);location.hash='#/buscar?'+u}));
  const fb=$('#fbtn'),fl=$('#flt');fb.onclick=()=>{fl.classList.add('open');document.body.classList.add('lock')};$('#fclose').onclick=()=>{fl.classList.remove('open');document.body.classList.remove('lock')};
}
function favorites(){setNav('favoritos');const l=P.filter(p=>favs.includes(p.key));
  if(!l.length){app.innerHTML=`<div class="ph1"><h1>Favoritos</h1></div><div class="empty"><div class="ic">♡</div><h3>Aún no tienes favoritos</h3><p>Toca el corazón en cualquier producto para guardarlo.</p><a class="btn" href="#/buscar?q=">Explorar productos</a></div>`;return}
  results(new URLSearchParams(),'Favoritos',l)}
/* ---------- Detalle ---------- */
function modal(k){const p=find(k);if(!p)return;const m=$('#modal');
  const cp=D.find(c=>c.id===p.cid).p,others=(groupsOf(cp).find(g=>g.includes(p))||[]).filter(x=>x!==p);
  const cmp=p.hasPr?others.filter(o=>o.hasPr).map(o=>{const d=p.pr-o.pr;return `<li>Frente a <b>${esc(o.n)}</b>: ${d===0?'mismo precio':d<0?`<span class="gd">${Q(-d)} más barato</span>`:`${Q(d)} más caro`}</li>`}).join(''):'';
  m.innerHTML=`<div class="mbox" role="dialog" aria-modal="true" aria-label="${esc(p.n)}"><button class="mx" aria-label="Cerrar" data-close>✕</button>
  <div class="pic">${p.b?`<span class="tag">${esc(p.b)}</span>`:''}${pic(p)}</div>
  <div class="mbody"><span class="store">${esc(p.st)}</span><h2>${esc(p.n)}</h2><div class="cat">${esc(p.cn)}</div>
  <div class="price ${p.hasPr?'':'nopr'}" style="font-size:1.8rem">${p.hasPr?Q(p.pr):'Precio en tienda'}</div>
  <ul class="spl">${p.sp.split('·').map(x=>`<li>${esc(x.trim())}</li>`).join('')}</ul>
  <p class="why"><b>✓ Por qué es buena opción</b>${esc(p.w)}</p><p class="why"><b>Ideal si…</b>${esc(p.use)}.</p>
  ${cmp?`<ul class="cmpl">${cmp}</ul>`:''}
  <div class="acts"><a class="btn" href="${esc(p.u)}" target="_blank" rel="noopener noreferrer">${p.hasPr?'Ver en':'Ver precio en'} ${esc(p.st)} ↗</a><a class="btn ghost" href="#/cat/${p.cid}" data-close>Ver comparación</a></div>
  <p class="note">${esc(p.av)||'Consultar existencias'} · Precio referencial.</p></div></div>`;
  m.hidden=false;document.body.style.overflow='hidden';m.querySelector('.mx').focus()}
const closeM=()=>{$('#modal').hidden=true;document.body.style.overflow=''};
/* ---------- Menú ---------- */
function buildMega(){const mb=$('#megaBody');
  mb.innerHTML=`<div class="mg2">${DEPTS.map((d,i)=>`<section class="mg2-d${i===0?' on':''}"><button type="button" class="mg2-t" id="mgt${i}" aria-expanded="${i===0}" aria-controls="mgp${i}" data-d="${i}"><span class="mg-ic">${d.ic}</span><b>${esc(d.n)}</b><em>${catsOf(i).length}</em><i class="mg2-ar" aria-hidden="true">›</i></button><div class="mg2-p" id="mgp${i}" role="region" aria-labelledby="mgt${i}"><h3>${d.ic} ${esc(d.n)}</h3><ul>${catsOf(i).map(c=>`<li><a href="#/cat/${c.id}"><span>${esc(c.n)}</span>${NEWIDS.has(c.id)?'<em class="newb" title="Nuevo">Nuevo</em>':''}</a></li>`).join('')}</ul><a class="mg2-all" href="#/depto/${i}">Ver todo el departamento →</a></div></section>`).join('')}</div>`;
  const mob=()=>matchMedia('(max-width:960px)').matches;
  const act=(i,tg)=>mb.querySelectorAll('.mg2-d').forEach((s,k)=>{const on=k===i&&(!tg||!s.classList.contains('on'));s.classList.toggle('on',on);s.firstChild.setAttribute('aria-expanded',on)});
  mb.addEventListener('click',e=>{const t=e.target.closest('.mg2-t');if(t)act(+t.dataset.d,mob())});
  mb.addEventListener('mouseover',e=>{const t=e.target.closest('.mg2-t');if(t&&!mob())act(+t.dataset.d)});
  mb.addEventListener('focusin',e=>{const t=e.target.closest('.mg2-t');if(t&&!mob())act(+t.dataset.d)});
  mb.addEventListener('keydown',e=>{const t=e.target.closest('.mg2-t');if(!t||!['ArrowDown','ArrowUp'].includes(e.key))return;e.preventDefault();const b=[...mb.querySelectorAll('.mg2-t')],n=b[b.indexOf(t)+(e.key==='ArrowDown'?1:-1)];if(n)n.focus()})}
function toggleMega(f){const m=$('#mega');m.hidden=f!==undefined?!f:!m.hidden;$('#btnCats').setAttribute('aria-expanded',!m.hidden);document.body.classList.toggle('mega-open',!m.hidden&&matchMedia('(max-width:960px)').matches)}
/* ---------- Autocompletado ---------- */
const sg=$('#sugg');let sgIdx=-1,sgItems=[];
function showSugg(v){
  const q=v.trim();if(q.length<2){sg.hidden=true;return}
  const nq=norm(q),key=nq.length>=3?Object.keys(ALIAS).find(k=>k.startsWith(nq)||k===stem(nq)):null,al=(ALIAS[key]||[]).map(a=>norm(a.replace('!','')));
  const viaAlias=D.filter(c=>al.some(a=>norm(c.n).includes(a))),literal=D.filter(c=>norm(c.n).includes(nq)&&!viaAlias.includes(c));
  const cats=[...viaAlias,...literal].slice(0,4);
  const prods=searchList(key||q).filter(x=>x.s>=8).slice(0,5).map(x=>x.p);
  sgItems=[...cats.map(c=>({t:'cat',h:`#/cat/${c.id}`,l:c.n,s:'Categoría',i:DEPTS[deptOf(c.id)].ic})),...prods.map(p=>({t:'p',h:`#/cat/${p.cid}`,l:p.n,s:p.hasPr?Q(p.pr):'Ver precio',i:p.ic})),{t:'all',h:'#/buscar?q='+encodeURIComponent(q),l:`Ver todos los resultados para “${q}”`,s:'',i:'🔎'}];
  sg.innerHTML=sgItems.map((x,i)=>`<a role="option" href="${x.h}" data-i="${i}"><span class="si">${x.i}</span><span class="sl">${esc(x.l)}</span><small>${esc(x.s)}</small></a>`).join('');
  sg.hidden=false;sgIdx=-1;
}
/* ---------- Router ---------- */
function route(){
  toggleMega(false);closeM();sg.hidden=true;document.body.classList.remove('lock');
  const h=location.hash.slice(1)||'/',[path,qs]=h.split('?'),pr=new URLSearchParams(qs||'');
  const seg=path.split('/').filter(Boolean);
  if(!seg.length)home();else if(seg[0]==='cat')cat(seg[1]);else if(seg[0]==='depto')depto(+seg[1]);else if(seg[0]==='buscar'){$('#q').value=pr.get('q')||'';results(pr)}else if(seg[0]==='favoritos')favorites();else home();
  if(seg[0]!=='buscar')$('#q').value='';
  window.scrollTo(0,0);
}
document.addEventListener('click',e=>{
  const f=e.target.closest('[data-fav]');if(f){e.preventDefault();const k=f.dataset.fav;favs=favs.includes(k)?favs.filter(x=>x!==k):[...favs,k];saveFavs();document.querySelectorAll(`[data-fav="${k}"]`).forEach(b=>{const on=favs.includes(k);b.classList.toggle('on',on);b.textContent=on?'♥':'♡'});if(location.hash==='#/favoritos')favorites();return}
  const o=e.target.closest('[data-open]');if(o){modal(o.dataset.open);return}
  if(e.target.closest('[data-close]')||e.target.id==='modal'){closeM();return}
  if(e.target.closest('#btnCats')||e.target.closest('#btnBurger')){toggleMega();return}
  if(!e.target.closest('#mega'))toggleMega(false);
  if(!e.target.closest('.search'))sg.hidden=true;
  if(e.target.closest('#toTop'))window.scrollTo({top:0,behavior:'smooth'});
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeM();toggleMega(false);sg.hidden=true;return}
  if(!sg.hidden&&document.activeElement===$('#q')&&['ArrowDown','ArrowUp','Enter'].includes(e.key)){
    const as=[...sg.querySelectorAll('a')];
    if(e.key==='Enter'){if(sgIdx>=0){e.preventDefault();location.hash=as[sgIdx].getAttribute('href')}return}
    e.preventDefault();sgIdx=(sgIdx+(e.key==='ArrowDown'?1:-1)+as.length)%as.length;as.forEach((a,i)=>a.classList.toggle('on',i===sgIdx));
  }
});
document.addEventListener('submit',e=>{if(e.target.id==='searchForm'||e.target.id==='heroForm'){e.preventDefault();sg.hidden=true;const v=e.target.querySelector('input').value.trim();location.hash='#/buscar?q='+encodeURIComponent(v)}});
$('#q').addEventListener('input',e=>showSugg(e.target.value));
$('#q').addEventListener('focus',e=>showSugg(e.target.value));
window.addEventListener('scroll',()=>{$('#toTop').classList.toggle('show',window.scrollY>600)},{passive:true});
window.addEventListener('hashchange',route);buildMega();saveFavs();route();
})();
