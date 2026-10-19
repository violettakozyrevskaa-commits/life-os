/* План на день: список + расписание, повторения, перенос, три главные задачи */
'use strict';
function taskActiveOn(t,day){
  if(!t.repeat||t.repeat==='none')return t.date===day;
  if(!t.date||day<t.date)return false;
  if((t.doneDates||[]).includes(day))return false;
  const dw=D.dow(day),sw=D.dow(t.date);
  if(t.repeat==='daily')return true;
  if(t.repeat==='weekdays')return dw>=1&&dw<=5;
  if(t.repeat==='weekly')return dw===sw;
  if(t.repeat==='monthly')return D.parse(day).getDate()===D.parse(t.date).getDate();
  return false;
}
function taskDone(t,day){
  if(!t.repeat||t.repeat==='none')return !!t.done;
  return (t.doneDates||[]).includes(day);
}
function toggleTask(t,day){
  if(!t.repeat||t.repeat==='none'){Store.update('tasks',t.id,{done:!t.done})}
  else{const dd=(t.doneDates||[]).slice();
    dd.includes(day)?dd.splice(dd.indexOf(day),1):dd.push(day);
    Store.update('tasks',t.id,{doneDates:dd})}
}
Schemas.tasks={
  name:'Задачи',desc:'Задачи, время, приоритеты, повторения и напоминания.',add:'Задача',
  fields:[
    {k:'title',label:'Название',required:true},
    {k:'desc',label:'Описание',type:'textarea',rows:2},
    {k:'date',label:'Дата',type:'date',required:true},
    {k:'time',label:'Начало',type:'time'},{k:'timeEnd',label:'Окончание',type:'time'},
    {k:'priority',label:'Приоритет',type:'select',options:[{v:'high',label:'Высокий'},{v:'med',label:'Средний'},{v:'low',label:'Низкий'}]},
    {k:'category',label:'Категория',type:'select',options:CATS.map(c=>({v:c,label:c}))},
    {k:'repeat',label:'Повторение',type:'select',options:[{v:'none',label:'Не повторять'},{v:'daily',label:'Ежедневно'},
      {v:'weekdays',label:'По будням'},{v:'weekly',label:'Еженедельно'},{v:'monthly',label:'Ежемесячно'}]},
    {k:'remind',label:'Напомнить (время)',type:'time'},
    {k:'main',label:'Одна из трёх главных задач дня',type:'checkbox'}
  ],
  defaults:{date:D.today(),priority:'med',category:'Другое',repeat:'none',done:false,main:false,doneDates:[]},
  filters:[{k:'category',label:'Категория',options:CATS.map(c=>({v:c,label:c}))},
    {k:'priority',label:'Приоритет',options:[{v:'high',label:'Высокий'},{v:'med',label:'Средний'},{v:'low',label:'Низкий'}]}],
  sorts:[{v:'date',l:'По дате'},{v:'prio',l:'По приоритету'},{v:'new',l:'Сначала новые'},{v:'az',l:'По алфавиту'}],
  sortFn:(a,b)=>({high:0,med:1,low:2}[a.priority]-{high:0,med:1,low:2}[b.priority]),
  card:t=>`<div class="li"><span>${esc(t.title)}</span></div>`,
  onAction(){}
};
function moveTask(t){
  UI.form({title:'Перенести задачу',width:420,submitText:'Перенести',
    fields:[{k:'date',label:'Новая дата',type:'date',required:true},{k:'time',label:'Время',type:'time'}],
    values:{date:t.date,time:t.time||''},
    submit:(v,c)=>{Store.update('tasks',t.id,v);c();UI.toast('Перенесено на '+D.short(v.date));App.refresh()}});
}
Views.tasks=el=>{
  const st=viewState.tasks||(viewState.tasks={date:D.today(),tab:'list'});
  const day=st.date;
  const all=Store.get('tasks');
  const today=all.filter(t=>taskActiveOn(t,day));
  const done=today.filter(t=>taskDone(t,day));
  const overdue=all.filter(t=>t.repeat==='none'&&t.date<day&&!t.done);
  const mains=today.filter(t=>t.main);

  el.innerHTML=`
   <div class="page-head"><div class="grow"><h2>План на день</h2>
     <p>${D.dowName(day)}, ${D.long(day)} · выполнено ${done.length} из ${today.length} (${pct(done.length,today.length)}%)</p></div>
     <div class="row gap8"><div class="seg">
       <button data-tab="list" class="${st.tab==='list'?'on':''}">Список</button>
       <button data-tab="time" class="${st.tab==='time'?'on':''}">По часам</button></div>
       <button class="btn primary" data-act="add">${icon('plus')} Задача</button></div></div>

   <div class="toolbar">
     <button class="btn icon ghost" data-nav="-1">${icon('left')}</button>
     <input class="inp sm" type="date" id="dPick" value="${day}">
     <button class="btn icon ghost" data-nav="1">${icon('right')}</button>
     <button class="btn sm ghost" data-nav="0">Сегодня</button>
     ${overdue.length?`<span class="chip bad">Просрочено: ${overdue.length}</span>`:''}
   </div>

   <div class="card flat" style="margin-bottom:16px">
     <div class="row spread"><b>Выполнение плана</b><b class="num">${pct(done.length,today.length)}%</b></div>
     <div class="mt8">${UI.bar(pct(done.length,today.length))}</div>
   </div>

   <div id="tmain"></div>
   <div id="tbody"></div>`;

  const tm=el.querySelector('#tmain');
  tm.innerHTML=`<h3 class="mt16" style="margin-bottom:10px">Три главные задачи дня</h3>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-bottom:20px">
    ${[0,1,2].map(i=>{const t=mains[i];
      return `<div class="card" data-id="${t?t.id:''}" style="${t?'':'border-style:dashed'}">
        ${t?`<div class="row gap8"><button class="check ${taskDone(t,day)?'on':''}" data-x="toggle">${icon('check')}</button>
          <span class="grow ell ${taskDone(t,day)?'muted':''}" style="${taskDone(t,day)?'text-decoration:line-through':''}">${esc(t.title)}</span>
          <button class="btn xs ghost" data-x="unmain">✕</button></div>
          <div class="tiny muted mt8">${t.time||'без времени'} · ${esc(t.category)}</div>`
        :`<span class="small muted">Свободно — отметьте задачу звездой в списке</span>`}</div>`}).join('')}</div>`;

  const body=el.querySelector('#tbody');
  if(st.tab==='list'){
    const groups=[
      ['Выполнено',today.filter(t=>taskDone(t,day))],
      ['Предстоит',today.filter(t=>!taskDone(t,day)&&(!t.time||t.time>=new Date().toTimeString().slice(0,5)))],
      ['Уже должно идти',today.filter(t=>!taskDone(t,day)&&t.time&&t.time<new Date().toTimeString().slice(0,5))]
    ];
    body.innerHTML=`
      <h3 style="margin:16px 0 10px">📓 Записи на ${D.short(day)}</h3>
      <div class="notebook">
        ${today.length?groups.filter(g=>g[1].length).map(g=>
          `<div class="nb-section">${g[0]} · ${g[1].length}</div>`+
          g[1].map(t=>`
            <div class="nb-line ${taskDone(t,day)?'done':''}" data-id="${t.id}">
              <button class="check ${taskDone(t,day)?'on':''}" data-x="toggle">${icon('check')}</button>
              <div class="nb-body">
                <div class="nb-title">${esc(t.title)}
                  ${t.main?'<span class="chip p">главная</span>':''}
                  ${t.repeat&&t.repeat!=='none'?'<span class="chip">повтор</span>':''}
                </div>
                ${t.desc?`<div class="nb-desc">${esc(t.desc)}</div>`:''}
                <div class="nb-meta">${t.time?`⏰ ${t.time}${t.timeEnd?'–'+t.timeEnd:''} · `:''}${esc(t.category)}${t.remind?' · 🔔 '+t.remind:''}</div>
              </div>
              <div class="nb-actions">
                <button class="btn xs ghost" data-x="move" title="Перенести">${icon('move')}</button>
                <button class="btn xs ghost" data-act="edit">${icon('pen')}</button>
                <button class="btn xs ghost" data-act="del">${icon('trash')}</button>
              </div>
            </div>`).join('')
        ).join('')
        :UI.empty('На этот день задач нет','Добавьте задачу — она появится в календаре и уведомлениях.','Задача')}
      </div>
      ${overdue.length?`<h3 class="mt24" style="margin-bottom:10px">⚠️ Просроченные</h3>
      <div class="notebook">${overdue.map(t=>`
        <div class="nb-line overdue" data-id="${t.id}">
          <button class="check" data-x="toggle">${icon('check')}</button>
          <div class="nb-body">
            <div class="nb-title">${esc(t.title)}</div>
            <div class="nb-meta">было на ${D.short(t.date)} · ${esc(t.category)}</div>
          </div>
          <div class="nb-actions">
            <button class="btn xs ghost" data-x="move">${icon('move')}</button>
            <button class="btn xs ghost" data-act="edit">${icon('pen')}</button>
            <button class="btn xs ghost" data-act="del">${icon('trash')}</button>
          </div>
        </div>`).join('')}</div>`:''}`;
  }else{
    const s=Store.st(),h0=s.workStart||9,h1=s.workEnd||19,rows=[];
    for(let h=h0;h<=h1;h++){
      const hh=pad2(h)+':00';
      const items=today.filter(t=>t.time&&+t.time.slice(0,2)===h);
      rows.push(`<div class="nb-line hour">
        <div class="nb-hour">${hh}</div>
        <div class="nb-body">${items.length?items.map(t=>`
          <div class="nb-hour-item" data-id="${t.id}">
            <button class="check ${taskDone(t,day)?'on':''}" data-x="toggle">${icon('check')}</button>
            <span class="grow">${esc(t.title)}</span>
            <span class="chip">${t.time}${t.timeEnd?'–'+t.timeEnd:''}</span>
          </div>`).join(''):'<span class="tiny muted">—</span>'}</div>
      </div>`);
    }
    body.innerHTML=`<h3 style="margin:16px 0 10px">⏱ Расписание · ${D.short(day)}</h3>
      <div class="notebook">${rows.join('')}</div>
      <div class="tiny muted mt8">Рабочие часы настраиваются в «Настройках».</div>`;
  }

  el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{st.tab=b.dataset.tab;Views.tasks(el)});
  el.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{
    const v=b.dataset.nav;st.date=v==='0'?D.today():D.add(day,+v);Views.tasks(el)});
  el.querySelector('#dPick').onchange=e=>{st.date=e.target.value||D.today();Views.tasks(el)};
  el.addEventListener('click',e=>{if(e.target.closest('[data-act=add]'))openItemForm('tasks',null)});

  el.addEventListener('click',e=>{
    const host=e.target.closest('[data-id]'),id=host&&host.dataset.id;
    const x=e.target.closest('[data-x]');
    if(!id)return;
    const t=Store.find('tasks',id);
    if(!t)return;
    if(x&&x.dataset.x==='toggle'){toggleTask(t,day);if(taskDone(t,day))UI.toast('Выполнено 👍');App.refresh();return}
    if(x&&x.dataset.x==='unmain'){Store.update('tasks',id,{main:false});UI.toast('Убрано из главных');App.refresh();return}
    if(x&&x.dataset.x==='move')return moveTask(t);
    const a=e.target.closest('[data-act]');
    if(a&&a.dataset.act==='edit')return openItemForm('tasks',t);
    if(a&&a.dataset.act==='del')return UI.confirm('Удалить задачу «'+t.title+'»?').then(ok=>{
      if(ok){Store.remove('tasks',id);UI.toast('Удалено');App.refresh()}});
  });
};