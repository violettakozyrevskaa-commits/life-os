/* Спортивный дневник */
'use strict';
const SPORT_TYPES=['Силовая','Кардио','Бег','Ходьба','Растяжка','Домашняя','Йога','Велосипед','Плавание','Другое'];

function parseSets(raw){
  return String(raw||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{
    const p=l.split(/[—–\-:]/).map(s=>s.trim());
    return {ex:p[0]||l,reps:p[1]||'',weight:p[2]||''};
  });
}
function stringifySets(sets){
  return (sets||[]).map(s=>[s.ex,s.reps,s.weight].filter(Boolean).join(' — ')).join('\n');
}

Schemas.sports={
  name:'Тренировки',desc:'Дневник активности: длительность, дистанция, подходы и повторения.',add:'Тренировка',
  fields:[
    {k:'title',label:'Название',required:true,ph:'Например: Верх тела'},
    {k:'date',label:'Дата',type:'date',required:true},
    {k:'type',label:'Категория',type:'select',options:SPORT_TYPES.map(t=>({v:t,label:t}))},
    {k:'duration',label:'Длительность, мин',type:'number'},
    {k:'distance',label:'Дистанция, км',type:'number',step:'0.1'},
    {k:'setsRaw',label:'Упражнения',type:'textarea',rows:3,hint:'По одному в строке: Жим лёжа — 4×8 — 60 кг',full:true},
    {k:'notes',label:'Комментарий',type:'textarea',rows:2}
  ],
  defaults:{date:D.today(),type:'Силовая',duration:45,distance:0,sets:[]},
  filters:[{k:'type',label:'Тип',options:SPORT_TYPES.map(t=>({v:t,label:t}))}],
  sorts:[{v:'date',l:'Сначала новые'},{v:'old',l:'Сначала старые'},{v:'dur',l:'По длительности'}],
  sortFn:(a,b)=>(b.duration||0)-(a.duration||0),
  prepare:i=>i.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')),
  card:s=>`<div class="card hover">
    <div class="row spread"><div class="row gap10"><span class="tag-i" style="background:var(--primary-soft);color:var(--primary)">${icon('dumbbell')}</span>
      <div><b>${esc(s.title)}</b><div class="tiny muted">${D.long(s.date)} · ${esc(s.type)}</div></div></div>
      <div class="row gap6"><button class="btn icon ghost" data-act="edit">${icon('pen')}</button>
      <button class="btn icon ghost" data-act="del">${icon('trash')}</button></div></div>
    <div class="row gap12 mt12 wrap"><span class="chip">${s.duration||0} мин</span>
      ${s.distance?`<span class="chip">${s.distance} км</span>`:''}
      ${(s.sets||[]).length?`<span class="chip">${s.sets.length} упражнений</span>`:''}</div>
    ${(s.sets||[]).length?`<div class="mt12 col gap4">${s.sets.map(x=>`<div class="small">• ${esc(x.ex)} — ${esc(x.reps)}${x.weight?' · '+esc(x.weight):''}</div>`).join('')}</div>`:''}
    ${s.notes?`<div class="tiny muted mt8">${esc(s.notes)}</div>`:''}</div>`
};

FORM_OVERRIDES.sports=function(item,after){
  const v=Object.assign({},Schemas.sports.defaults,item||{});
  v.setsRaw=stringifySets(item&&item.sets);
  return UI.form({
    title:(item?'Редактировать':'Новая')+' тренировка',
    fields:Schemas.sports.fields,
    values:v,
    submit:(val,close)=>{
      const sets=parseSets(val.setsRaw);
      delete val.setsRaw;
      val.sets=sets;
      if(item)Store.update('sports',item.id,val);else Store.add('sports',val);
      close();UI.toast('Сохранено');App.refresh();
      if(after)after();
      const wk=D.week(D.today(),Store.st().weekStart);
      const cnt=Store.get('sports').filter(s=>wk.includes(s.date)).length;
      if(cnt>=(Store.st().sportGoal||99))achieve('Недельная норма тренировок','dumbbell');
    }
  });
};

Views.sport=el=>{
  const t=D.today(),wk=D.week(t,Store.st().weekStart);
  const all=Store.get('sports');
  const weekN=all.filter(s=>wk.includes(s.date)).length;
  const month=all.filter(s=>D.mk(s.date)===D.mk(t));
  const mins=month.reduce((a,b)=>a+(+b.duration||0),0);
  const km=month.reduce((a,b)=>a+(+b.distance||0),0);
  const goal=Store.st().sportGoal||3;
  el.innerHTML=`<div class="page-head"><div class="grow"><h2>Спорт</h2>
    <p>Активность, прогресс и цели по тренировкам</p></div>
    <button class="btn primary" data-act="add">${icon('plus')} Тренировка</button></div>
   <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:16px">
     <div class="card"><div class="kpi"><b>${weekN}</b><span>за неделю · цель ${goal}</span></div><div class="mt8">${UI.bar(pct(weekN,goal))}</div></div>
     <div class="card"><div class="kpi"><b>${month.length}</b><span>тренировок за месяц</span></div></div>
     <div class="card"><div class="kpi"><b>${mins}</b><span>минут активности</span></div></div>
     <div class="card"><div class="kpi"><b>${km.toFixed(1)}</b><span>км за месяц</span></div></div></div>
   <div class="card" style="margin-bottom:16px"><h3>Динамика за 8 недель</h3><div class="chart-box mt12"><canvas id="spChart"></canvas></div></div>
   <div id="slist"></div>`;
  el.addEventListener('click',e=>{if(e.target.closest('[data-act=add]'))openItemForm('sports',null)});
  const labels=[],vals=[];
  for(let i=7;i>=0;i--){const ws=D.add(wk[0],-7*i),we=D.add(ws,6);
    labels.push(D.short(ws).slice(0,5));vals.push(all.filter(s=>s.date>=ws&&s.date<=we).length)}
  Charts.bar(el.querySelector('#spChart'),labels,vals,{label:'Тренировки'});
  const list=el.querySelector('#slist');
  const draw=()=>{const items=all.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    list.innerHTML=items.length?`<div class="grid">${items.map(s=>`<div data-id="${s.id}">${Schemas.sports.card(s)}</div>`).join('')}</div>`
      :UI.empty('Тренировок пока нет','Добавьте первую — статистика построится автоматически.','Тренировка')};
  draw();
  list.addEventListener('click',e=>{
    const host=e.target.closest('[data-id]'),id=host&&host.dataset.id;if(!id)return;
    const s=Store.find('sports',id),a=e.target.closest('[data-act]');if(!s||!a)return;
    if(a.dataset.act==='edit')openItemForm('sports',s,draw);
    if(a.dataset.act==='del')UI.confirm('Удалить тренировку?').then(ok=>{
      if(ok){
        const backup=JSON.parse(JSON.stringify(s));
        Store.remove('sports',id);
        UI.toast('Удалено','ok',5000,{label:'Отменить',onClick:()=>{Store.add('sports',backup);App.refresh()}});
      }
    });
  });
};