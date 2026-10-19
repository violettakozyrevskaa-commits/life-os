/* Разделы, навигация и главная панель */
'use strict';
const SECTIONS=[
 {id:'home',label:'Главная',short:'День',icon:'home',sub:'Обзор жизни за один экран'},
 {id:'habits',label:'Привычки',short:'Привычки',icon:'flame',sub:'Трекер и статистика'},
 {id:'tasks',label:'План на день',short:'План',icon:'check',sub:'Задачи и расписание'},
 {id:'sport',label:'Спорт',short:'Спорт',icon:'dumbbell',sub:'Дневник тренировок'},
 {id:'goals',label:'Глобальные планы',short:'Цели',icon:'target',sub:'Долгосрочные цели и этапы'},
 {id:'books',label:'Книги',short:'Книги',icon:'book',sub:'Библиотека и прогресс чтения'},
 {id:'shopping',label:'Продукты и покупки',short:'Покупки',icon:'cart',sub:'Список, запасы, питание, расходы'},
 {id:'family',label:'Семья и дни рождения',short:'Семья',icon:'users',sub:'Близкие, праздники, подарки'},
 {id:'finance',label:'Финансы',short:'Финансы',icon:'wallet',sub:'Доходы, расходы, бюджет, накопления'},
 {id:'calendar',label:'Календарь',short:'Календарь',icon:'calendar',sub:'Все события в одном месте'},
 {id:'edu',label:'Учёба и развитие',short:'Учёба',icon:'edu',sub:'Предметы, задания, экзамены'},
 {id:'wishes',label:'Мои желания',short:'Желания',icon:'star',sub:'Карта желаний и накопления'},
 {id:'notes',label:'Заметки и дневник',short:'Заметки',icon:'pen',sub:'Мысли, идеи, дневник дня'},
 {id:'media',label:'Медиатека',short:'Медиа',icon:'film',sub:'Фильмы, сериалы, подкасты'},
 {id:'analytics',label:'Аналитика',short:'Аналитика',icon:'chart',sub:'Статистика по реальным данным'},
 {id:'settings',label:'Настройки',short:'Ещё',icon:'gear',sub:'Темы, профиль, данные'}
];
function visibleSections(){
  const s=Store.st(),list=SECTIONS.filter(x=>!(s.hidden||[]).includes(x.id));
  const o=s.order||[];
  return list.slice().sort((a,b)=>{const ia=o.indexOf(a.id),ib=o.indexOf(b.id);
    return (ia<0?99:ia)-(ib<0?99:ib)});
}
function renderNav(){
  const nav=document.getElementById('nav');if(!nav)return;
  nav.innerHTML=visibleSections().map(s=>
    `<button class="nav-i ${App.current===s.id?'active':''}" data-id="${s.id}">${icon(s.icon)}<span>${esc(s.label)}</span></button>`).join('');
  nav.onclick=e=>{const b=e.target.closest('.nav-i');if(b)App.go(b.dataset.id)};
}
/* ---------- Главная ---------- */
const HOME_BLOCKS=[
 {id:'day',label:'Мой день',icon:'check'},{id:'habits',label:'Привычки',icon:'flame'},
 {id:'goals',label:'Мои цели',icon:'target'},{id:'finance',label:'Финансы',icon:'wallet'},
 {id:'sport',label:'Спорт',icon:'dumbbell'},{id:'books',label:'Книги',icon:'book'},
 {id:'events',label:'Предстоящие события',icon:'calendar'},{id:'notes',label:'Быстрые заметки',icon:'pen'}
];
Views.home=el=>{
  const s=Store.st(),t=D.today();
  const order=(s.homeOrder||HOME_BLOCKS.map(b=>b.id)).filter(id=>!(s.homeHidden||[]).includes(id)&&HOME_BLOCKS.some(b=>b.id===id));
  HOME_BLOCKS.forEach(b=>{if(!order.includes(b.id)&&!(s.homeHidden||[]).includes(b.id))order.push(b.id)});
  el.innerHTML=`
   <div class="page-head">
     <div class="grow"><h2>Привет, ${esc(s.name||'друг')} 👋</h2>
       <p>${D.dowName(t)}, ${D.long(t)} · ${App.notifications().length?App.notifications().length+' напоминаний':'всё под контролем'}</p></div>
     <button class="btn ghost" id="cfgHome">${icon('grid')} Настроить страницу</button>
   </div>
   <div class="grid cols2" id="homeGrid"></div>`;
  const g=el.querySelector('#homeGrid');
  g.innerHTML=order.map(id=>`<section data-block="${id}">${homeCard(id)}</section>`).join('');
  bindHome(g);
  el.querySelector('#cfgHome').onclick=cfgHome;
};
function homeCard(id){
  const t=D.today();
  const head=(title,ic,go,extra='')=>`<div class="card hover"><div class="row spread mb8" style="margin-bottom:12px">
     <div class="row gap8"><span style="color:var(--primary);display:flex">${icon(ic)}</span><h3>${title}</h3></div>
     <div class="row gap6">${extra}<button class="btn xs ghost" data-go="${go}">${icon('arrow')}</button></div></div>`;
  const end='</div>';
  switch(id){
  case 'day':{
    const ts=Store.get('tasks').filter(x=>taskActiveOn(x,t));
    const done=ts.filter(x=>taskDone(x,t)).length;
    const next=ts.filter(x=>!taskDone(x,t)&&x.time).sort((a,b)=>a.time.localeCompare(b.time))[0]
      ||ts.find(x=>!taskDone(x,t));
    return head('Мой день','check','tasks')+`
      <div class="row gap16 wrap"><div class="kpi"><b>${ts.length}</b><span>задач сегодня</span></div>
      <div class="kpi"><b style="color:var(--ok)">${done}</b><span>выполнено</span></div>
      <div class="kpi"><b>${pct(done,ts.length)}%</b><span>план дня</span></div></div>
      <div class="mt12">${UI.bar(pct(done,ts.length))}</div>
      <div class="small muted mt12">${next?`${icon('clock')} Ближайшая: <b style="color:var(--text)">${esc(next.title)}</b>${next.time?' · '+next.time:''}`:'На сегодня задач нет — добавьте первую'}</div>${end}`}
  case 'habits':{
    const hs=Store.get('habits').filter(h=>!h.archived&&habitDueOn(h,t));
    const done=hs.filter(h=>(h.log||{})[t]).length;
    return head('Привычки','flame','habits')+`
      <div class="row spread" style="margin-bottom:10px"><span class="small muted">${done} из ${hs.length} сегодня</span>
      <b class="num">${pct(done,hs.length)}%</b></div>
      ${hs.length?`<div class="list">${hs.slice(0,5).map(h=>`
        <div class="li" style="padding:8px 10px"><span class="tag-i" style="background:${h.color}22;color:${h.color}">${h.icon||'✓'}</span>
        <span class="grow ell">${esc(h.title)}</span>
        <button class="check ${(h.log||{})[t]?'on':''}" data-habit="${h.id}" data-date="${t}">${icon('check')}</button></div>`).join('')}</div>`
        :`<div class="small muted">Сегодня привычек нет.</div>`}${end}`}
  case 'goals':{
    const gs=Store.get('goals').filter(g=>g.status!=='done').slice(0,3);
    return head('Мои цели','target','goals')+`${gs.length?`<div class="col gap12">${gs.map(g=>`
      <div><div class="row spread"><b class="small ell">${esc(g.title)}</b><span class="chip ${g.deadline&&D.diff(t,g.deadline)<21?'warn':''}">${g.deadline?D.diff(t,g.deadline)+' дн.':'без срока'}</span></div>
      <div class="mt8">${UI.bar(g.progress||0)}</div>
      <div class="tiny muted mt8">${esc(g.category)} · ${GOAL_STATUS[g.status]||''} · ${g.progress||0}%</div></div>`).join('')}</div>`
      :`<div class="small muted">Целей пока нет — заведите первую мечту.</div>`}${end}`}
  case 'finance':{
    const m=monthStats();
    return head('Финансы','wallet','finance')+`
      <div class="row gap16 wrap"><div class="kpi"><b class="pos">+${num(m.in)}</b><span>доходы, ${D.monthName(D.mk(t))}</span></div>
      <div class="kpi"><b class="neg">−${num(m.out)}</b><span>расходы</span></div>
      <div class="kpi"><b>${num(m.in-m.out)}</b><span>остаток, ₽</span></div></div>
      ${m.budget>0?`<div class="mt12 small muted">Бюджет месяца: ${money(m.budget)} · ${UI.bar(pct(m.out,m.budget),'thin mt8')}</div>`:''}${end}`}
  case 'sport':{
    const sp=Store.get('sports'),wk=D.week(t,Store.st().weekStart);
    const cnt=sp.filter(x=>wk.includes(x.date)).length;
    const next=sp.filter(x=>x.date>=t).sort((a,b)=>a.date.localeCompare(b.date))[0];
    return head('Спорт','dumbbell','sport')+`
      <div class="row gap16 wrap"><div class="kpi"><b>${cnt}</b><span>тренировок за неделю</span></div>
      <div class="kpi"><b>${Store.st().sportGoal||0}</b><span>цель на неделю</span></div></div>
      <div class="small muted mt12">${next?`${icon('calendar')} Ближайшая: <b style="color:var(--text)">${esc(next.title||next.type)}</b> · ${D.long(next.date)}`:'Ближайших тренировок нет'}</div>
      <div class="mt12">${UI.bar(pct(cnt,Store.st().sportGoal||1))}</div>${end}`}
  case 'books':{
    const cur=Store.get('books').find(b=>b.status==='reading');
    return head('Книги','book','books')+`${cur?`
      <div class="row gap12"><div class="img-cover" style="width:56px;height:78px;margin:0;flex:0 0 56px;font-size:18px;${cur.cover?`background-image:url('${cur.cover}')`:''}">${cur.cover?'':'📕'}</div>
      <div class="grow"><b class="small ell">${esc(cur.title)}</b><div class="tiny muted">${esc(cur.author||'')}</div>
      <div class="mt8">${UI.bar(pct(cur.read||0,cur.pages||1))}</div>
      <div class="tiny muted mt8">${cur.read||0} / ${cur.pages||0} стр. · ${pct(cur.read||0,cur.pages||1)}%</div></div></div>`
      :`<div class="small muted">Сейчас ничего не читается. Откройте книгу в библиотеке.</div>`}${end}`}
  case 'events':{
    const list=upcomingEvents(t,45).slice(0,5);
    return head('Предстоящие события','calendar','calendar')+`${list.length?`<div class="list">${list.map(e=>`
      <div class="li" style="padding:8px 10px"><span style="color:${e.color};display:flex">${icon(e.icon)}</span>
      <span class="grow ell small">${esc(e.title)}</span><span class="chip">${e.days===0?'сегодня':e.days+' дн.'}</span></div>`).join('')}</div>`
      :`<div class="small muted">Событий на 45 дней нет.</div>`}${end}`}
  case 'notes':{
    return head('Быстрые заметки','pen','notes')+`
      <textarea class="inp" id="quickNote" rows="3" placeholder="Запишите мысль, идею, задачу-напоминание…"></textarea>
      <div class="row gap8 mt8"><button class="btn primary sm" id="saveQuick">${icon('plus')} Сохранить в заметки</button>
      <span class="tiny muted">сохранится с тегом «быстрое»</span></div>${end}`}
  }
  return '';
}
function bindHome(g){
  g.addEventListener('click',async e=>{
    const go=e.target.closest('[data-go]');
    const hb=e.target.closest('[data-habit]');
    if(hb){const h=Store.find('habits',hb.dataset.habit);if(!h)return;
      h.log=Object.assign({},h.log);
      if(h.log[hb.dataset.date])delete h.log[hb.dataset.date];else h.log[hb.dataset.date]=true;
      Store.update('habits',h.id,{log:h.log});UI.toast(h.log[hb.dataset.date]?'Отмечено!':'Снято');App.refresh();return}
    if(go)App.go(go.dataset.go);
  });
  const sv=document.getElementById('saveQuick');
  if(sv)sv.onclick=()=>{const v=document.getElementById('quickNote').value.trim();
    if(!v)return UI.toast('Пустая заметка','warn');
    Store.add('notes',{title:v.slice(0,42),body:'<p>'+esc(v)+'</p>',tags:['быстрое'],cat:'Быстрое',favorite:false,pinned:false});
    UI.toast('Заметка сохранена');App.refresh()};
}
function cfgHome(){
  const s=Store.st();
  const rows=HOME_BLOCKS.map(b=>{
    const on=!(s.homeHidden||[]).includes(b.id);
    return `<div class="reorder-i"><label class="chk grow"><input type="checkbox" data-h="${b.id}" ${on?'checked':''}> ${icon(b.icon)} ${b.label}</label></div>`}).join('');
  UI.modal({title:'Настройка главной страницы',width:480,
    body:`<p class="small muted" style="margin-bottom:12px">Скрывайте ненужные блоки — порядок совпадает с порядком ниже.</p>
      <div class="col gap8">${rows}</div>`,
    footer:`<button class="btn primary" data-x="save">Сохранить</button>`,
    onMount:(root,close)=>{root.querySelector('[data-x=save]').onclick=()=>{
      const hid=[];root.querySelectorAll('[data-h]').forEach(c=>{if(!c.checked)hid.push(c.dataset.h)});
      const st=Store.st();st.homeHidden=hid;Store.save();close();UI.toast('Главная обновлена');App.refresh()}}});
}
/* ---------- общие расчёты ---------- */
function monthStats(mKey){
  mKey=mKey||D.mk(D.today());
  let inn=0,out=0;const byCat={};
  Store.get('finance').forEach(f=>{if(D.mk(f.date)!==mKey)return;
    if(f.type==='income')inn+=+f.amount||0;
    else if(f.type==='expense'){out+=+f.amount||0;byCat[f.category||'Другое']=(byCat[f.category||'Другое']||0)+(+f.amount||0)}});
  return{in:inn,out:out,byCat,budget:Store.st().budget?+Store.st().budget.month||0:0};
}
function monthSpend(cat,mKey){
  mKey=mKey||D.mk(D.today());let s=0;
  Store.get('finance').forEach(f=>{if(f.type==='expense'&&D.mk(f.date)===mKey&&(f.category||'Другое')===cat)s+=+f.amount||0});
  return s;
}
function nextBirthday(birth){
  if(!birth)return null;const t=D.today(),p=birth.split('-');
  const thisYear=D.parse(t).getFullYear();
  let d=thisYear+'-'+p[1]+'-'+p[2];
  if(d<t)d=(thisYear+1)+'-'+p[1]+'-'+p[2];
  return d;
}
function ageOn(birth,on){
  if(!birth)return 0;const b=D.parse(birth),o=D.parse(on||D.today());
  let a=o.getFullYear()-b.getFullYear();
  if(o.getMonth()<b.getMonth()||(o.getMonth()===b.getMonth()&&o.getDate()<b.getDate()))a--;
  return a;
}
function upcomingEvents(from,days){
  const out=[],to=D.add(from,days);
  Store.get('people').forEach(p=>{const nx=nextBirthday(p.birth);
    if(nx&&D.inRange(nx,from,to))out.push({date:nx,title:'День рождения: '+p.name,icon:'gift',color:'var(--accent)',days:D.diff(from,nx),go:'family'})});
  Store.get('events').forEach(ev=>{if(D.inRange(ev.date,from,to))
    out.push({date:ev.date,title:ev.title,icon:'calendar',color:'var(--primary)',days:D.diff(from,ev.date),go:'calendar'})});
  Store.get('goals').forEach(g=>{if(g.deadline&&D.inRange(g.deadline,from,to)&&g.status!=='done')
    out.push({date:g.deadline,title:'Дедлайн: '+g.title,icon:'target',color:'var(--warn)',days:D.diff(from,g.deadline),go:'goals'})});
  Store.get('homework').forEach(h=>{if(h.due&&!h.done&&D.inRange(h.due,from,to))
    out.push({date:h.due,title:(h.type==='exam'?'Экзамен: ':'Задание: ')+h.title,icon:'edu',color:'#7b6cf6',days:D.diff(from,h.due),go:'edu'})});
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}
function achieve(title,iconName){
  const list=Store.get('achievements');
  if(list.some(a=>a.title===title))return;
  Store.add('achievements',{title,icon:iconName||'star',date:D.today()});
  UI.toast('🏆 Достижение: '+title,'ok',3600);
}