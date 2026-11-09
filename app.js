const $=s=>document.querySelector(s),uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S={notes:[],tasks:[],habits:[],timer:{w:25,b:5,n:0,d:'',m:0},theme:'auto'};
try{const r=localStorage.getItem('tetrad');if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
const save=()=>{try{localStorage.setItem('tetrad',JSON.stringify(S))}catch(e){}};
const fmt=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>fmt(new Date());
let v='today',nid=null,q='',tag='',tf='act',cm=new Date(),cs=today(),last=null;
cm.setDate(1);
const I={today:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',notes:'<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>',tasks:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'};
const K={today:'今',notes:'記',tasks:'務',cal:'暦',habits:'習'},D={today:'今日',notes:'手帳',tasks:'予定',cal:'暦',habits:'習慣'};const NAMES={today:'Сегодня',notes:'Заметки',tasks:'Задачи',cal:'Календарь',habits:'Привычки'};
function theme(){const r=document.documentElement;S.theme==='auto'?r.removeAttribute('data-theme'):r.setAttribute('data-theme',S.theme)}
function nav(){$('#nav').innerHTML='<div class="logo"><i class="hk">手帳</i><span>Тетрадь</span></div>'+Object.keys(NAMES).map(k=>`<button class="n ${v===k?'on':''}" data-a="v" data-k="${k}"><b class="kj">${K[k]}</b><span>${NAMES[k]}</span></button>`).join('')+'<span class="sp"></span><button class="sm" data-a="th">Тема: '+({auto:'авто',light:'светлая',dark:'тёмная'})[S.theme]+'</button><button class="sm" data-a="bk">Резервная копия</button>'}
function dueChip(t){if(!t.due)return'';const od=!t.done&&t.due<today();const d=new Date(t.due+'T00:00');return`<span class="chip ${od?'w':''}">${t.due===today()?'сегодня':d.toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}</span>`}
function row(t){return`<div class="t ${t.done?'d':''}"><button class="ck" data-a="tg" data-i="${t.id}" aria-label="Выполнено"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="m5 12 5 5 9-10"/></svg></button><span class="tx" contenteditable="plaintext-only" spellcheck="false" data-i="${t.id}">${esc(t.text)}</span>${t.prio?`<i class="p${t.prio}" title="${t.prio==2?'Важно':'Средне'}"></i>`:''}${t.rep?'<span class="chip" title="Повторяется">↻</span>':''}${dueChip(t)}<button class="x" data-a="td" data-i="${t.id}" aria-label="Удалить">×</button></div>`}
const sortT=(a,b)=>(a.due||'9')<(b.due||'9')?-1:(a.due||'9')>(b.due||'9')?1:b.prio-a.prio;
function addForm(due){return`<div class="row"><input type="text" id="tin" placeholder="Новая задача…" data-due="${due||''}"><button class="btn" data-a="ta">Добавить</button></div>`}
/* timer */
const T={mode:'w',left:S.timer.w*60,end:0,run:false,id:0};
const mm=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function tick(){if(T.run){T.left=Math.max(0,Math.round((T.end-Date.now())/1000));if(!T.left){T.run=false;clearInterval(T.id);if(T.mode==='w'){const td=today();if(S.timer.d!==td){S.timer.d=td;S.timer.n=0}S.timer.n++;S.timer.m=(S.timer.m||0)+S.timer.w}beep();save();T.mode=T.mode==='w'?'b':'w';T.left=(T.mode==='w'?S.timer.w:S.timer.b)*60;if($('#tmb'))render()}}const e=$('#tm');if(e){e.textContent=mm(T.left);document.title=T.run?mm(T.left)+' · Тетрадь':'Тетрадь — заметки и планы'}}
function today_(){const n=new Date(),h=n.getHours(),g=h<5?'Доброй ночи, おやすみ':h<12?'Доброе утро, おはよう':h<18?'Добрый день, こんにちは':'Добрый вечер, こんばんは';
const act=S.tasks.filter(t=>!t.done&&t.due&&t.due<=today()).sort(sortT),dn=S.tasks.filter(t=>t.done&&t.due===today()).length,tot=act.length+dn;
const nt=[...S.notes].sort((a,b)=>b.pin-a.pin||b.ts-a.ts).slice(0,4);
return`<div class="pg"><div class="deco" aria-hidden="true">${D[v]}</div><p class="mu" style="margin:0">${g}</p><h1>${n.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}</h1>
<div class="bar"><i style="width:${tot?dn/tot*100:0}%"></i></div><div class="mu" style="font-size:13px">${tot?`Сделано ${dn} из ${tot}`:'На сегодня задач нет'}</div>
<h2>Быстрая задача</h2>${addForm(today())}
<h2>На сегодня</h2><div class="card">${act.map(row).join('')||'<div class="empty">Пока пусто. Добавьте задачу выше.</div>'}</div>
${todayHabits()}<div class="grid"><div><h2>Фокус</h2><div class="card"><button class="chip" data-a="tmode">${T.mode==='w'?'Работа':'Перерыв'} ⇄</button><div class="tm" id="tm">${mm(T.left)}</div><div class="row" style="margin-top:8px" id="tmb"><button class="btn" data-a="ts">${T.run?'Пауза':'Старт'}</button><button class="btn g" data-a="tr">Сброс</button></div>${timerSet()}</div></div>
<div><h2>Заметки</h2><div class="card">${nt.map(x=>`<button class="ni" data-a="no" data-i="${x.id}"><b>${esc(x.title||'Без названия')}</b><span>${esc(x.body.slice(0,60)||'—')}</span></button>`).join('')||'<div class="empty">Заметок пока нет.</div>'}<button class="btn g" style="margin-top:8px" data-a="nn">Новая заметка</button></div></div></div></div>`}
function tasks_(){const all=S.tasks;let L=tf==='act'?all.filter(t=>!t.done):tf==='done'?all.filter(t=>t.done):all;L=[...L].sort(sortT);const td=today();
const G=tf==='act'?[['Просрочено',L.filter(t=>t.due&&t.due<td)],['Сегодня',L.filter(t=>t.due===td)],['Дальше',L.filter(t=>t.due>td)],['Без срока',L.filter(t=>!t.due)]]:[['',L]];
return`<div class="pg"><div class="deco" aria-hidden="true">${D[v]}</div><h1>Задачи</h1><div class="row" style="margin:14px 0 8px;flex-wrap:wrap"><input type="text" id="tin" placeholder="Что нужно сделать?" data-due=""><input type="date" id="tdt" aria-label="Срок"><select id="tpr" aria-label="Важность"><option value="0">Обычная</option><option value="1">Средняя</option><option value="2">Важная</option></select><select id="trp" aria-label="Повтор"><option value="">Без повтора</option><option value="d">Каждый день</option><option value="w">Каждую неделю</option><option value="m">Каждый месяц</option></select><button class="btn" data-a="ta">Добавить</button></div>
<div class="row" style="margin:12px 0">${[['act','Активные'],['done','Готово'],['all','Все']].map(([k,n])=>`<button class="chip ${tf===k?'on':''}" data-a="tf" data-k="${k}">${n}</button>`).join('')}</div>
${G.filter(g=>g[1].length).map(g=>(g[0]?`<h2>${g[0]} <span class="mu">${g[1].length}</span></h2>`:'')+`<div class="card">${g[1].map(row).join('')}</div>`).join('')||'<div class="empty">Здесь ничего нет.</div>'}</div>`}
function cal_(){const y=cm.getFullYear(),m=cm.getMonth(),off=(cm.getDay()+6)%7,td=today();let c='';
for(let i=0;i<42;i++){const d=new Date(y,m,1-off+i),k=fmt(d),n=S.tasks.filter(t=>t.due===k&&!t.done).length;
c+=`<button class="dy ${d.getMonth()!==m?'o':''} ${k===td?'td':''} ${k===cs?'s':''}" data-a="cd" data-k="${k}">${d.getDate()}<small>${n?n+' зад.':''}</small></button>`}
const L=S.tasks.filter(t=>t.due===cs).sort(sortT);
return`<div class="pg"><div class="deco" aria-hidden="true">${D[v]}</div><div class="row"><h1 class="grow">${cm.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}</h1><button class="btn g" data-a="cp">‹</button><button class="btn g" data-a="cn">›</button></div>
<div class="cal" style="margin-top:12px">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((x,i)=>`<div class="h">${x}<br>${"月火水木金土日"[i]}</div>`).join('')}${c}</div>
<h2>${new Date(cs+'T00:00').toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}</h2>${addForm(cs)}<div class="card" style="margin-top:10px">${L.map(row).join('')||'<div class="empty">На этот день ничего не запланировано.</div>'}</div></div>`}
function nlist(){const tags=[...new Set(S.notes.flatMap(n=>n.tags))];const ql=q.toLowerCase();
const L=S.notes.filter(n=>(!tag||n.tags.includes(tag))&&(!ql||(n.title+n.body+n.tags.join(' ')).toLowerCase().includes(ql))).sort((a,b)=>b.pin-a.pin||b.ts-a.ts);
$('#nl').innerHTML=L.map(n=>`<button class="ni ${n.id===nid?'on':''}" data-a="no" data-i="${n.id}"><b>${n.pin?'◆ ':''}${esc(n.title||'Без названия')}</b><span>${esc(n.body.slice(0,70)||'Пустая заметка')}</span><span>${new Date(n.ts).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}${n.tags.length?' · '+esc(n.tags.map(t=>'#'+t).join(' ')):''}</span></button>`).join('')||'<div class="empty">Ничего не найдено.</div>';
$('#tgs').innerHTML=tags.map(t=>`<button class="chip ${tag===t?'on':''}" data-a="tgf" data-k="${esc(t)}">#${esc(t)}</button>`).join('')}
function notes_(){const n=S.notes.find(x=>x.id===nid);
return`<div class="notes" data-o="${n?1:0}"><div class="nl"><div class="row"><input type="text" id="sq" placeholder="Поиск…" value="${esc(q)}"><button class="btn" data-a="nn" aria-label="Новая заметка">+</button></div><div class="row" style="flex-wrap:wrap" id="tgs"></div><div id="nl" style="display:flex;flex-direction:column;gap:2px"></div></div>
<div class="ed">${n?`<button class="back" data-a="nb">‹ Все заметки</button><input id="nt" placeholder="Заголовок" value="${esc(n.title)}"><input id="ng" placeholder="Теги через запятую" value="${esc(n.tags.join(', '))}"><textarea id="nb" placeholder="Пишите здесь…">${esc(n.body)}</textarea><div class="row"><span class="mu grow" id="wc"></span><button class="btn g" data-a="dl">В файл</button><button class="btn g" data-a="np">${n.pin?'Открепить':'Закрепить'}</button><button class="btn g" data-a="nd">Удалить</button></div>`:'<div class="empty">Выберите заметку или создайте новую.</div>'}</div></div>`}
function render(){nav();const m=$('#main');m.innerHTML=({today:today_,tasks:tasks_,cal:cal_,notes:notes_,habits:habits_})[v]();if(v==='notes'){nlist();wc()}}
const wc=()=>{const n=S.notes.find(x=>x.id===nid),e=$('#wc');if(n&&e){const w=(n.body.trim().match(/\S+/g)||[]).length;e.textContent=w+' сл. · '+n.body.length+' симв.'}};
function toast(t,undo){clearTimeout(toast.id);document.querySelectorAll('.toast').forEach(e=>e.remove());const e=document.createElement('div');e.className='toast';e.innerHTML=`<span>${t}</span>`+(undo?'<button data-a="undo">Отменить</button>':'');document.body.append(e);toast.id=setTimeout(()=>e.remove(),5000)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,i=b.dataset.i,k=b.dataset.k;
if(a==='v'){v=k;nid=null;render()}
else if(a==='th'){S.theme=({auto:'light',light:'dark',dark:'auto'})[S.theme];theme();save();nav()}
else if(a==='tg'){const t=S.tasks.find(x=>x.id===i);t.done=!t.done;if(t.done&&t.rep)nextRep(t);save();render()}
else if(a==='td'){const j=S.tasks.findIndex(x=>x.id===i);last={k:'t',o:S.tasks[j],j};S.tasks.splice(j,1);save();render();toast('Задача удалена',1)}
else if(a==='ta'){const inp=$('#tin'),x=inp.value.trim();if(!x)return inp.focus();S.tasks.push({id:uid(),text:x,done:false,due:inp.dataset.due||($('#tdt')?$('#tdt').value:''),prio:+($('#tpr')?$('#tpr').value:0),rep:$('#trp')?$('#trp').value:''});save();render();$('#tin')&&$('#tin').focus()}
else if(a==='tf'){tf=k;render()}
else if(a==='cd'){cs=k;const d=new Date(k+'T00:00');if(d.getMonth()!==cm.getMonth()){cm=new Date(d.getFullYear(),d.getMonth(),1)}render()}
else if(a==='cp'){cm=new Date(cm.getFullYear(),cm.getMonth()-1,1);render()}
else if(a==='cn'){cm=new Date(cm.getFullYear(),cm.getMonth()+1,1);render()}
else if(a==='nn'){const n={id:uid(),title:'',body:'',tags:[],pin:false,ts:Date.now()};S.notes.push(n);nid=n.id;v='notes';save();render();$('#nt').focus()}
else if(a==='no'){nid=i;v='notes';render()}
else if(a==='nb'){nid=null;render()}
else if(a==='np'){const n=S.notes.find(x=>x.id===nid);n.pin=!n.pin;save();render()}
else if(a==='nd'){const j=S.notes.findIndex(x=>x.id===nid);last={k:'n',o:S.notes[j],j};S.notes.splice(j,1);nid=null;save();render();toast('Заметка удалена',1)}
else if(a==='tgf'){tag=tag===k?'':k;nlist()}
else if(a==='undo'){if(last){(last.k==='t'?S.tasks:S.notes).splice(last.j,0,last.o);last=null;save();render();document.querySelectorAll('.toast').forEach(e=>e.remove())}}
else if(a==='ts'){if(T.run){T.run=false;clearInterval(T.id)}else{T.run=true;T.end=Date.now()+T.left*1000;T.id=setInterval(tick,500)}render()}
else if(a==='tr'){T.run=false;clearInterval(T.id);T.mode='w';T.left=S.timer.w*60;render()}
else if(a==='bk'){$('#bk').value=JSON.stringify({notes:S.notes,tasks:S.tasks,habits:S.habits,timer:S.timer});$('#dlg').showModal()}
else if(a==='cls')$('#dlg').close();
else if(a==='cpy'){$('#bk').select();try{navigator.clipboard.writeText($('#bk').value);toast('Скопировано')}catch(x){document.execCommand&&document.execCommand('copy')}}
else if(a==='imp'){try{const d=JSON.parse($('#bk').value);if(!Array.isArray(d.notes)||!Array.isArray(d.tasks))throw 0;S.notes=d.notes;S.tasks=d.tasks;S.habits=d.habits||[];if(d.timer)S.timer=d.timer;save();$('#dlg').close();render();toast('Данные загружены')}catch(x){toast('Не удалось прочитать копию: проверьте текст')}}});
document.addEventListener('input',e=>{const id=e.target.id,n=S.notes.find(x=>x.id===nid);
if(id==='sq'){q=e.target.value;nlist();return}
if(!n)return;
if(id==='nt')n.title=e.target.value;else if(id==='nb'){n.body=e.target.value;wc()}else if(id==='ng')n.tags=e.target.value.split(',').map(s=>s.trim().replace(/^#/,'')).filter(Boolean);else return;
n.ts=Date.now();save();nlist()});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='tin'){e.preventDefault();document.querySelector('[data-a=ta]').click()}
if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();v='notes';nid=null;render();$('#sq').focus()}});
theme();render();

/* ---- v2: таймер, привычки, повторы, правка задач, PWA ---- */
function beep(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=660;g.gain.setValueAtTime(.2,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+1.2);o.start();o.stop(c.currentTime+1.2)}catch(e){}}
function nextRep(t){const d=new Date((t.due||today())+'T00:00');if(t.rep==='d')d.setDate(d.getDate()+1);else if(t.rep==='w')d.setDate(d.getDate()+7);else d.setMonth(d.getMonth()+1);S.tasks.push({id:uid(),text:t.text,done:false,due:fmt(d),prio:t.prio,rep:t.rep})}
function timerSet(){return`<div class="row" style="margin-top:12px;flex-wrap:wrap">${[5,10,15,25,45,60].map(m=>`<button class="chip ${S.timer.w===m?'on':''}" data-a="tpre" data-k="${m}">${m}</button>`).join('')}</div><div class="row" style="margin-top:10px"><label class="mu fld">Работа, мин<input type="number" id="tw" min="1" max="600" value="${S.timer.w}"></label><label class="mu fld">Перерыв, мин<input type="number" id="tb" min="1" max="600" value="${S.timer.b}"></label></div><div class="mu" style="font-size:13px;margin-top:8px">Сегодня: ${S.timer.d===today()?S.timer.n:0} сессий</div>`}
function todayHabits(){return S.habits.length?`<h2>Привычки</h2><div class="row" style="flex-wrap:wrap">${S.habits.map(h=>`<button class="chip ${h.days[today()]?'on':''}" data-a="hm" data-i="${h.id}" data-k="${today()}">${esc(h.name)}</button>`).join('')}</div>`:''}
function streak(h){let n=0,d=new Date();if(!h.days[fmt(d)])d.setDate(d.getDate()-1);while(h.days[fmt(d)]){n++;d.setDate(d.getDate()-1)}return n}
function habits_(){const ds=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d});
return`<div class="pg"><div class="deco" aria-hidden="true">${D[v]}</div><h1>Привычки</h1><p class="mu">Отмечайте дни — серия растёт.</p><div class="row" style="margin:14px 0"><input type="text" id="hin" placeholder="Новая привычка: чтение, зарядка…"><button class="btn" data-a="ha">Добавить</button></div>
<div class="card">${S.habits.map(h=>`<div class="t hb"><span class="tx">${esc(h.name)}<br><small class="mu">Серия: ${streak(h)} дн.</small></span><div class="row">${ds.map(d=>{const k=fmt(d);return`<button class="hd ${h.days[k]?'on':''} ${k===today()?'tdy':''}" data-a="hm" data-i="${h.id}" data-k="${k}" title="${k}">${'日月火水木金土'[d.getDay()]}</button>`}).join('')}</div><button class="x" data-a="hx" data-i="${h.id}" aria-label="Удалить">×</button></div>`).join('')||'<div class="empty">Привычек пока нет. Добавьте первую.</div>'}</div></div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,i=b.dataset.i,k=b.dataset.k;
if(a==='tmode'&&!T.run){T.mode=T.mode==='w'?'b':'w';T.left=(T.mode==='w'?S.timer.w:S.timer.b)*60;render()}
else if(a==='tpre'){S.timer.w=+k;if(!T.run&&T.mode==='w')T.left=S.timer.w*60;save();render()}
else if(a==='ha'){const x=$('#hin').value.trim();if(!x)return;S.habits.push({id:uid(),name:x,days:{}});save();render()}
else if(a==='hm'){const h=S.habits.find(x=>x.id===i);h.days[k]?delete h.days[k]:h.days[k]=1;save();render()}
else if(a==='hx'){S.habits=S.habits.filter(x=>x.id!==i);save();render()}
else if(a==='dl'){const n=S.notes.find(x=>x.id===nid),u=URL.createObjectURL(new Blob([(n.title?n.title+'\n\n':'')+n.body],{type:'text/plain'})),l=document.createElement('a');l.href=u;l.download=(n.title||'заметка')+'.txt';l.click();URL.revokeObjectURL(u)}});
document.addEventListener('change',e=>{const id=e.target.id;if(id!=='tw'&&id!=='tb')return;const n=Math.max(1,Math.min(600,Math.round(+e.target.value)||1));S.timer[id==='tw'?'w':'b']=n;if(!T.run&&T.mode===(id==='tw'?'w':'b'))T.left=n*60;save();render()});
document.addEventListener('focusout',e=>{const el=e.target;if(!el.classList||!el.classList.contains('tx')||!el.dataset.i)return;const t=S.tasks.find(x=>x.id===el.dataset.i),x=el.textContent.trim();if(t&&x){t.text=x;save()}else if(t)el.textContent=t.text});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='hin'){e.preventDefault();document.querySelector('[data-a=ha]').click()}if(e.key==='Enter'&&e.target.classList&&e.target.classList.contains('tx')){e.preventDefault();e.target.blur()}});
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0)navigator.serviceWorker.register('sw.js').catch(()=>{});
