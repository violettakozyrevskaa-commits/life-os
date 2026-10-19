/* Единый календарь: день / неделя / месяц, агрегация событий из всех разделов */
'use strict';

/* ============================================================
   СХЕМА СОБЫТИЙ (для быстрого добавления и openItemForm)
   ============================================================ */
Schemas.events={
  name:'События',desc:'Семейные даты, праздники, важные встречи.',add:'Событие',
  fields:[
    {k:'title',label:'Название',required:true},
    {k:'date',label:'Дата',type:'date',required:true},
    {k:'type',label:'Тип',type:'select',options:[
      {v:'other',label:'Другое'},
      {v:'anniv',label:'Годовщина'},
      {v:'holiday',label:'Праздник'},
      {v:'meeting',label:'Встреча'}
    ]},
    {k:'note',label:'Заметка',type:'textarea',rows:3}
  ],
  defaults:{date:D.today(),type:'other'},
  filters:[{k:'type',label:'Тип',options:[
    {v:'other',label:'Другое'},{v:'anniv',label:'Годовщина'},
    {v:'holiday',label:'Праздник'},{v:'meeting',label:'Встреча'}]}],
  sorts:[{v:'date',l:'По дате'},{v:'new',l:'Сначала новые'}],
  card:e=>`<div class="card hover"><b class="small">${esc(e.title)}</b>
    <div class="tiny muted mt8">${D.short(e.date)}</div></div>`
};

/* ============================================================
   ТИПЫ СОБЫТИЙ В КАЛЕНДАРЕ
   ============================================================ */
const EV_TYPES={
  task:{l:'Задачи',c:'#5aa9ff',i:'check'},
  sport:{l:'Спорт',c:'#3ddc97',i:'dumbbell'},
  birthday:{l:'Дни рождения',c:'#f0a6b8',i:'gift'},
  deadline:{l:'Дедлайны',c:'#ffbe55',i:'target'},
  event:{l:'События',c:'#7b6cf6',i:'calendar'},
  study:{l:'Учёба',c:'#a855f7',i:'edu'},
  meal:{l:'Питание',c:'#8fb996',i:'cart'}
};

function eventsInRange(from,to){
  const out=[];
  Store.get('tasks').forEach(t=>{
    if(!t.repeat||t.repeat==='none'){if(D.inRange(t.date,from,to))out.push({date:t.date,title:t.title,type:'task',done:!!t.done,go:'tasks',id:t.id})}
    else{for(let d=from;D.diff(from,d)<=D.diff(from,to);d=D.add(d,1))
      if(taskActiveOn(t,d))out.push({date:d,title:t.title,type:'task',done:taskDone(t,d),go:'tasks',id:t.id})}});
  Store.get('sports').forEach(s=>{if(D.inRange(s.date,from,to))out.push({date:s.date,title:(s.title||s.type)+' · спорт',type:'sport',go:'sport',id:s.id})});
  Store.get('people').forEach(p=>{const b=p.birth;if(!b)return;
    for(let y=D.parse(from).getFullYear();y<=D.parse(to).getFullYear();y++){
      const d=y+'-'+b.split('-')[1]+'-'+b.split('-')[2];
      if(D.inRange(d,from,to))out.push({date:d,title:'День рождения: '+p.name,type:'birthday',go:'family',id:p.id})}});
  Store.get('goals').forEach(g=>{if(g.deadline&&D.inRange(g.deadline,from,to))
    out.push({date:g.deadline,title:'Дедлайн: '+g.title,type:'deadline',go:'goals',id:g.id})});
  Store.get('events').forEach(e=>{if(D.inRange(e.date,from,to))out.push({date:e.date,title:e.title,type:'event',go:'family',id:e.id})});
  Store.get('homework').forEach(h=>{if(h.due&&D.inRange(h.due,from,to))
    out.push({date:h.due,title:(h.type==='exam'?'Экзамен: ':'Задание: ')+h.title,type:'study',done:!!h.done,go:'edu',id:h.id})});
  Store.get('meals').forEach(m=>{if(D.inRange(m.date,from,to))
    out.push({date:m.date,title:m.title+' ('+({breakfast:'завтрак',lunch:'обед',dinner:'ужин',snack:'перекус'}[m.meal]||'')+')',type:'meal',go:'shopping',id:m.id})});
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}

Views.calendar=el=>{
  const st=viewState.cal||(viewState.cal={mode:'month',anchor:D.today(),f:{}});
  const a=st.anchor;
  let from,to,label;
  if(st.mode==='month'){const d=D.parse(a);const f=a.slice(0,7)+'-01';
    const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();const t=D.add(f,last-1);from=f;to=t;label=D.monthName(D.mk(a))}
  else if(st.mode==='week'){const w=D.week(a,Store.st().weekStart);from=w[0];to=w[6];label=D.short(from)+' — '+D.short(to)}
  else{from=to=a;label=D.dowName(a)+', '+D.long(a)}
  const evs=eventsInRange(from,to).filter(e=>!st.f[e.type]);
  const byDay={};evs.forEach(e=>{(byDay[e.date]=byDay[e.date]||[]).push(e)});
  el.innerHTML=`<div class="page-head"><div class="grow"><h2>Календарь</h2><p>Задачи, тренировки, дни рождения, дедлайны и события</p></div>
    <div class="row gap8"><div class="seg">${['day','week','month'].map(m=>
      `<button data-m="${m}" class="${st.mode===m?'on':''}">${{day:'День',week:'Неделя',month:'Месяц'}[m]}</button>`).join('')}</div>
      <button class="btn primary" data-a="add">${icon('plus')} Событие</button></div></div>
   <div class="toolbar"><button class="btn icon ghost" data-nav="-1">${icon('left')}</button>
     <b class="small" style="min-width:170px;text-align:center">${esc(label)}</b>
     <button class="btn icon ghost" data-nav="1">${icon('right')}</button>
     <button class="btn sm ghost" data-nav="0">Сегодня</button>
     ${Object.keys(EV_TYPES).map(k=>`<label class="chk"><input type="checkbox" data-f="${k}" ${!st.f[k]?'checked':''}> ${EV_TYPES[k].l}</label>`).join('')}</div>
   <div id="cbody"></div>`;
  el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{st.mode=b.dataset.m;Views.calendar(el)});
  el.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{
    const v=b.dataset.nav;
    st.date=undefined;
    st.anchor=v==='0'?D.today():st.mode==='month'?D.ymd(new Date(+a.slice(0,4),+a.slice(5,7)-1+(+v),1)):D.add(a,+v*(st.mode==='week'?7:1));
    Views.calendar(el)});
  el.querySelectorAll('[data-f]').forEach(c=>c.onchange=()=>{st.f[c.dataset.f]=c.checked?null:true;Views.calendar(el)});
  el.querySelector('[data-a=add]').onclick=()=>openItemForm('events',{date:st.anchor,type:'other'});
  const body=el.querySelector('#cbody');
  const chip=e=>`<div class="ev" style="--c:${EV_TYPES[e.type].c}" data-ev="${e.id}" data-go="${e.go}" title="${esc(e.title)}">${e.done?'✓ ':''}${esc(e.title)}</div>`;
  if(st.mode==='month'){
    const first=D.parse(from),lead=(first.getDay()-Store.st().weekStart+7)%7;
    const days=D.monthDays(D.mk(from));
    body.innerHTML=`<div class="card"><div class="cal">${[...Array(7)].map((_,i)=>
      `<div class="cal-h">${DOW_S[(Store.st().weekStart+i)%7]}</div>`).join('')}
      ${[...Array(lead)].map(()=>'<div></div>').join('')}
      ${days.map(d=>`<div class="cal-c ${d===D.today()?'today':''}" data-day="${d}">
        <div class="cal-d">${D.parse(d).getDate()}</div>${(byDay[d]||[]).slice(0,3).map(chip).join('')}
        ${(byDay[d]||[]).length>3?`<div class="tiny muted">+${(byDay[d]||[]).length-3} ещё</div>`:''}</div>`).join('')}</div></div>`;
  }else if(st.mode==='week'){
    const w=D.week(a,Store.st().weekStart);
    body.innerHTML=`<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">${w.map(d=>
      `<div class="week-col ${d===D.today()?'':''}" data-day="${d}" style="${d===D.today()?'border-color:var(--primary)':''}">
        <b class="small">${D.dowName(d,true)} ${D.parse(d).getDate()}</b><div class="col gap4 mt8">${(byDay[d]||[]).map(chip).join('')||'<span class="tiny muted">пусто</span>'}</div></div>`).join('')}</div>`;
  }else{
    const list=byDay[a]||[];
    body.innerHTML=`<div class="card"><h3>${esc(label)}</h3><div class="list mt12">${list.length?list.map(e=>
      `<div class="li" data-ev="${e.id}" data-go="${e.go}" style="cursor:pointer"><span style="color:${EV_TYPES[e.type].c};display:flex">${icon(EV_TYPES[e.type].i)}</span>
       <span class="grow small">${esc(e.title)}</span><span class="chip">${EV_TYPES[e.type].l}</span></div>`).join('')
      :UI.empty('На этот день событий нет','Задачи, тренировки и дни рождения появятся здесь автоматически.')}</div></div>`;
  }
  body.onclick=e=>{
    const c=e.target.closest('[data-ev]');
    if(c){App.go(c.dataset.go);return}
    const d=e.target.closest('[data-day]');
    if(d&&st.mode!=='day'){st.mode='day';st.anchor=d.dataset.day;Views.calendar(el)}
  };
};