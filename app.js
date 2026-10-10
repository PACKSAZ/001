(()=>{
const $=s=>document.querySelector(s),K='packsaz:v3';
const dg=v=>String(v??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫,،]/g,'.');
const num=v=>parseFloat(dg(v));
const vol=r=>+((r.h*r.w*r.l*r.c)/1e4).toFixed(3);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2200)};
const mk=()=>({id:Date.now().toString(36),title:'',rows:[],at:0});

function migrate(d){try{Object.keys(localStorage).filter(k=>k.startsWith('paksaz-')).forEach((k,n)=>{const o=JSON.parse(localStorage[k]),t=document.createElement('tbody');t.innerHTML=o.table;
const rows=[...t.querySelectorAll('tr.filled')].map(tr=>{const c=[...tr.cells].map(x=>num(x.textContent));return{h:c[4],w:c[3],l:c[2],c:c[1],b:tr.cells[5].textContent.trim()==='"'}});
if(rows.length)d.lists.push({id:'m'+n+Date.now().toString(36),title:o.title||k.slice(7),rows,at:Date.now()-n})})}catch{}}
function read(){try{const d=JSON.parse(localStorage[K]);if(d&&d.lists)return d}catch{}const d={lists:[],cur:null};migrate(d);return d}
let db=read(),doc=db.lists.find(l=>l.id===db.cur)||mk(),sel=-1;

function save(){doc.at=Date.now();const i=db.lists.findIndex(l=>l.id===doc.id),keep=doc.rows.length||doc.title.trim();
if(keep){i<0?db.lists.push(doc):db.lists[i]=doc}else if(i>=0)db.lists.splice(i,1);
db.cur=doc.id;try{localStorage[K]=JSON.stringify(db)}catch{toast('حافظه دستگاه پر است')}}
const tot=()=>({v:doc.rows.reduce((a,r)=>a+vol(r),0),c:doc.rows.reduce((a,r)=>a+r.c,0)});
const nums=()=>{let n=0;return doc.rows.map(r=>r.b?'"':++n)};

function render(){
 const t=tot(),ns=nums();
 $('#sVol').textContent=t.v.toFixed(3);$('#sCnt').textContent=t.c;$('#sRows').textContent=doc.rows.length;
 $('#tb').innerHTML=doc.rows.map((r,i)=>`<tr data-i="${i}"${i===sel?' class="sel"':''}><td>${vol(r).toFixed(3)}</td><td>${r.c}</td><td>${r.l}</td><td>${r.w}</td><td>${r.h}</td><td>${ns[i]}</td></tr>`).join('');
 $('#empty').hidden=!!doc.rows.length;
 if($('#title').value!==doc.title)$('#title').value=doc.title;
}
const F=['h','w','l','c'];
const rowFromForm=()=>({h:num($('#h').value),w:num($('#w').value),l:num($('#l').value),c:num($('#c').value),b:$('#bundle').checked});
function preview(){const r=rowFromForm();$('#pv').textContent=F.every(k=>r[k]>0)?vol(r).toFixed(3):'0.000'}
function resetForm(){F.forEach(k=>{$('#'+k).value='';$('#'+k).classList.remove('bad')});$('#bundle').checked=false;preview()}
function setSel(i){
 sel=i;const on=i>=0;
 $('#editBar').hidden=!on;$('#fTitle').textContent=on?'ویرایش ردیف '+nums()[i]:'ردیف جدید';$('#sTxt').textContent=on?'ذخیره تغییرات':'افزودن ردیف';
 if(on){const r=doc.rows[i];F.forEach(k=>$('#'+k).value=r[k]);$('#bundle').checked=!!r.b;preview();$('#form').scrollIntoView({behavior:'smooth',block:'center'})}else resetForm();
 render();
}
$('#form').addEventListener('input',preview);
F.slice(0,3).forEach((k,i)=>$('#'+k).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#'+F[i+1]).focus()}}));
$('#form').addEventListener('submit',e=>{
 e.preventDefault();const r=rowFromForm();let bad=null;
 F.forEach(k=>{const ok=r[k]>0&&(k!=='c'||Number.isInteger(r[k]));$('#'+k).classList.toggle('bad',!ok);if(!ok&&!bad)bad=k});
 if(bad){toast(bad==='c'?'تعداد باید عدد صحیح و بزرگ‌تر از صفر باشد':'مقادیر معتبر وارد کنید');$('#'+bad).focus();return}
 if(sel>=0){doc.rows[sel]=r;setSel(-1);toast('ردیف ویرایش شد')}else{doc.rows.push(r);resetForm();render();$('#h').focus();window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})}
 save();
});
$('#tb').addEventListener('click',e=>{const tr=e.target.closest('tr');if(!tr)return;const i=+tr.dataset.i;setSel(i===sel?-1:i)});
$('#bCancel').onclick=()=>setSel(-1);
$('#bDel').onclick=()=>{if(sel<0)return;doc.rows.splice(sel,1);setSel(-1);save();toast('ردیف حذف شد')};
const mv=d=>{const j=sel+d;if(sel<0||j<0||j>=doc.rows.length)return;[doc.rows[sel],doc.rows[j]]=[doc.rows[j],doc.rows[sel]];sel=j;$('#fTitle').textContent='ویرایش ردیف '+nums()[j];render();save()};
$('#bUp').onclick=()=>mv(-1);$('#bDn').onclick=()=>mv(1);
$('#title').addEventListener('input',e=>{doc.title=e.target.value;save()});

/* sheets */
const sh=id=>{document.querySelectorAll('.sheet').forEach(s=>s.classList.toggle('show',s.id===id));$('#bd').classList.toggle('show',!!id)};
$('#bd').onclick=()=>sh();addEventListener('keydown',e=>e.key==='Escape'&&sh());
function lib(){const L=[...db.lists].sort((a,b)=>b.at-a.at);
 $('#libList').innerHTML=L.length?L.map(l=>`<div class="li${l.id===doc.id?' cur':''}"><button class="open" data-open="${l.id}"><b>${esc(l.title||'بدون عنوان')}</b><small>${l.rows.length} ردیف · ${l.rows.reduce((a,r)=>a+vol(r),0).toFixed(3)} · ${new Date(l.at).toLocaleDateString('fa-IR')}</small></button><button class="icon" data-del="${l.id}" aria-label="حذف"><svg class="i"><use href="#i-trash"/></svg></button></div>`).join(''):'<p class="empty">پکینگ ذخیره‌شده‌ای وجود ندارد.</p>'}
$('#bLib').onclick=()=>{lib();sh('shLib')};
$('#libList').addEventListener('click',e=>{
 const o=e.target.closest('[data-open]'),d=e.target.closest('[data-del]');
 if(o){doc=db.lists.find(l=>l.id===o.dataset.open);db.cur=doc.id;sel=-1;setSel(-1);save();sh();toast('پکینگ باز شد')}
 if(d&&confirm('این پکینگ برای همیشه حذف شود؟')){db.lists=db.lists.filter(l=>l.id!==d.dataset.del);if(d.dataset.del===doc.id){doc=mk();db.cur=doc.id;setSel(-1)}save();lib()}
});
$('#bNew').onclick=()=>{if(!doc.rows.length&&!doc.title.trim()){$('#title').focus();return}doc=mk();sel=-1;setSel(-1);save();window.scrollTo({top:0,behavior:'smooth'});toast('پکینگ جدید ساخته شد')};

/* export */
const per=20,pad=(n,m)=>Array.from({length:Math.max(0,m-n)},()=>'<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>').join('');
function page(p,np,ns,t){
 const rows=doc.rows.slice(p*per,(p+1)*per),last=p===np-1;
 const body=rows.map((r,i)=>`<tr><td>${vol(r).toFixed(3)}</td><td>${r.c}</td><td>${r.l}</td><td>${r.w}</td><td>${r.h}</td><td>${ns[p*per+i]}</td></tr>`).join('')+(last?pad(rows.length,10):'');
 return `<div class="pg"><div class="ph"><div><h2>${esc(doc.title.trim()||'پکینگ لیست')}</h2><span>${new Date().toLocaleDateString('fa-IR')}</span></div><div class="pb">پک‌ساز</div></div>
 <table><thead><tr><th>متراژ</th><th>تعداد</th><th>طول</th><th>عرض</th><th>ارتفاع</th><th>ردیف</th></tr></thead><tbody>${body}</tbody></table>
 ${last?`<div class="pt"><div class="m"><span>جمع متراژ</span><b>${t.v.toFixed(3)}</b></div><div><span>جمع تعداد شاخه</span><b>${t.c}</b></div></div>`:''}
 <div class="pf">صفحه ${p+1} از ${np}</div></div>`}
async function shots(){
 await document.fonts.ready;const P=$('#print'),np=Math.max(1,Math.ceil(doc.rows.length/per)),ns=nums(),t=tot(),out=[];
 for(let p=0;p<np;p++){P.innerHTML=page(p,np,ns,t);out.push(await html2canvas(P.firstElementChild,{scale:2,backgroundColor:'#fff',logging:false}))}
 P.innerHTML='';return out}
const dl=(f,i)=>setTimeout(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4e3)},i*400);
async function out(kind){
 if(!doc.rows.length){toast('ابتدا حداقل یک ردیف ثبت کنید');return}
 sh();$('#busy').classList.add('show');
 try{
  const cv=await shots(),name=(doc.title.trim()||'packing').replace(/[\\/:*?"<>|]/g,'-');let files;
  if(kind==='jpg')files=await Promise.all(cv.map((c,i)=>new Promise(r=>c.toBlob(b=>r(new File([b],`${name}${cv.length>1?'-'+(i+1):''}.jpg`,{type:'image/jpeg'})),'image/jpeg',.92))));
  else{const pdf=new jspdf.jsPDF('p','mm','a4');cv.forEach((c,i)=>{if(i)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297)});files=[new File([pdf.output('blob')],name+'.pdf',{type:'application/pdf'})]}
  if(kind==='share'){try{await navigator.share({files,title:doc.title})}catch(e){if(e.name!=='AbortError')throw e}}
  else{files.forEach(dl);toast('فایل ذخیره شد')}
 }catch(e){console.error(e);toast('خطا در ساخت خروجی')}finally{$('#busy').classList.remove('show')}
}
$('#bOut').onclick=()=>sh('shOut');
$('#shOut').addEventListener('click',e=>{const b=e.target.closest('[data-out]');if(b)out(b.dataset.out)});
if(navigator.canShare&&navigator.canShare({files:[new File(['x'],'a.pdf',{type:'application/pdf'})]}))$('#bShare').hidden=false;

/* install + sw + splash */
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#btnInstall').hidden=false});
$('#btnInstall').onclick=async()=>{if(!dp)return;dp.prompt();await dp.userChoice;dp=null;$('#btnInstall').hidden=true};
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
const sp=$('#splash');if(sessionStorage.getItem('s'))sp.remove();else{sessionStorage.setItem('s','1');setTimeout(()=>{sp.classList.add('out');setTimeout(()=>sp.remove(),400)},900)}
render();
})();
