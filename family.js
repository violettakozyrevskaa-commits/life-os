/* Семья, дни рождения, подарки, подготовка к праздникам */
'use strict';
const _of2=openItemForm;
openItemForm=function(key,item,after){
  if(key==='people'){
    const v=Object.assign({gifts:[],interests:''},item||{});
    return UI.form({title:item?'Человек':'Новый человек',width:620,fields:[
      {k:'name',label:'Имя',required:true},{k:'relation',label:'Степень родства',
        type:'select',options:['Мама','Папа','Брат','Сестра','Бабушка','Дедушка','Партнёр','Друг','Коллега','Другое'].map(r=>({v:r,label:r}))},
      {k:'birth',label:'Дата рождения',type:'date'},{k:'avatar',label:'Фото',type:'image'},
      {k:'interests',label:'Интересы (через запятую)'},{k:'contact',label:'Контакты'},
      {k:'notes',label:'Заметки',type:'textarea',rows:2}],values:v,
      submit:(val,c)=>{item?Store.update('people',item.id,val):Store.add('people',Object.assign({gifts:[]},val));
        c();UI.toast('Сохранено');App.refresh();if(after)after()}});
  }
  return _of2(key,item,after);
};
function giftsModal(p,after){
  const g=p.gifts||[];
  UI.modal({title:'Подарки: '+p.name,width:560,
    body:`<div class="list">${g.length?g.map(x=>`<div class="li">
      <button class="check ${x.bought?'on':''}" data-g="${x.id}">${icon('check')}</button>
      <span class="grow ${x.bought?'muted':''}">${esc(x.title)}</span><span class="chip">${money(x.budget)}</span>
      <button class="btn icon ghost" data-gd="${x.id}">${icon('trash')}</button></div>`).join('')
      :`<div class="small muted">Подарков пока нет.</div>`}</div>
      <div class="row gap8 mt16"><input class="inp grow" id="gT" placeholder="Идея подарка">
      <input class="inp sm num" id="gB" type="number" placeholder="Бюджет" style="width:110px">
      <button class="btn primary" id="gAdd">${icon('plus')}</button></div>
      <div class="divider"></div>
      <button class="btn soft w100" id="mkTask">${icon('check')} Создать задачу подготовки в плане на день</button>`,
    footer:`<button class="btn ghost" data-x="c">Готово</button>`,
    onMount:(r,c)=>{
      r.querySelector('[data-x=c]').onclick=c;
      r.querySelector('#gAdd').onclick=()=>{const t=r.querySelector('#gT').value.trim();if(!t)return;
        Store.update('people',p.id,{gifts:g.concat([{id:uid('g'),title:t,budget:+r.querySelector('#gB').value||0,bought:false}])});
        UI.toast('Добавлено');c();after&&after()};
      r.querySelector('#mkTask').onclick=()=>{const nx=nextBirthday(p.birth);
        Store.add('tasks',{title:'Подготовиться к дню рождения: '+p.name,desc:'Купить подарок, продумать поздравление',
          date:nx?D.add(nx,-3):D.today(),category:'Семья',priority:'med',repeat:'none',done:false});
        UI.toast('Задача создана');c();App.refresh()};
      r.onclick=e=>{const t=e.target.closest('[data-g]');if(t){const x=g.find(q=>q.id===t.dataset.g);x.bought=!x.bought;
          Store.update('people',p.id,{gifts:g});c();after&&after();return}
        const d=e.target.closest('[data-gd]');if(d){const i=g.findIndex(q=>q.id===d.dataset.gd);g.splice(i,1);
          Store.update('people',p.id,{gifts:g});c();after&&after()}};
    }});
}
Views.family=el=>{
  const t=D.today(),people=Store.get('people'),evs=Store.get('events');
  el.innerHTML=`<div class="page-head"><div class="grow"><h2>Семья и дни рождения</h2>
     <p>Близкие, важные даты и подарки</p></div>
     <div class="row gap8"><button class="btn ghost" data-a="ev">${icon('plus')} Дата</button>
     <button class="btn primary" data-a="add">${icon('plus')} Человек</button></div></div>
   <div class="card flat" style="margin-bottom:16px"><h3>Ближайшие события</h3><div class="list mt12">${
     (()=>{const list=[];
       people.forEach(p=>{const nx=nextBirthday(p.birth);if(nx)list.push({d:nx,t:'День рождения · '+p.name,age:ageOn(p.birth,nx)+1,p})});
       evs.forEach(e=>list.push({d:e.date,t:e.t||e.title,ev:e}));
       list.sort((a,b)=>a.d.localeCompare(b.d));
       return list.slice(0,6).map(x=>`<div class="li"><span style="color:var(--accent);display:flex">${icon(x.ev?'calendar':'gift')}</span>
         <span class="grow small">${esc(x.t)}</span><span class="chip">${x.d===t?'сегодня':D.diff(t,x.d)+' дн.'}</span>
         ${x.age?`<span class="chip p">${x.age} лет</span>`:''}</div>`).join('')||`<div class="small muted">Событий нет</div>`})()
   }</div></div>
   <div class="grid" id="fgrid">${people.length?people.map(p=>{const nx=nextBirthday(p.birth),dl=nx?D.diff(t,nx):null;
     return `<div class="card hover" data-id="${p.id}">
      <div class="row gap12"><div class="avatar lg">${p.avatar?`<img src="${p.avatar}">`:(p.name||'?')[0]}</div>
       <div class="grow"><b>${esc(p.name)}</b><div class="tiny muted">${esc(p.relation||'')}${p.birth?` · ${ageOn(p.birth,t)} лет`:''}</div>
       ${nx?`<div class="tiny muted">День рождения ${D.short(nx)} · через ${dl} дн.</div>`:''}</div></div>
      ${p.interests?`<div class="row gap6 wrap mt12">${String(p.interests).split(',').map(i=>`<span class="chip">${esc(i.trim())}</span>`).join('')}</div>`:''}
      <div class="tiny muted mt8">Подарков: ${(p.gifts||[]).length} · куплено: ${(p.gifts||[]).filter(g=>g.bought).length}</div>
      <div class="row gap6 mt12"><button class="btn xs soft" data-x="gifts">${icon('gift')} Подарки</button>
       <button class="btn xs ghost" data-x="edit">${icon('pen')}</button>
       <button class="btn xs ghost" data-x="del">${icon('trash')}</button></div></div>`}).join('')
     :UI.empty('Списка нет','Добавьте близких — дни рождения появятся в календаре.','Человек')}</div>
   ${evs.length?`<h3 class="mt24" style="margin-bottom:10px">Семейные даты и годовщины</h3><div class="list">${evs.map(e=>
     `<div class="li"><span style="color:var(--primary);display:flex">${icon('calendar')}</span>
      <span class="grow small">${esc(e.title)}</span><span class="chip">${D.short(e.date)}</span>
      <button class="btn icon ghost" data-ev="${e.id}">${icon('trash')}</button></div>`).join('')}</div>`:''}`;
  el.querySelector('[data-a=add]').onclick=()=>openItemForm('people',null);
  el.querySelector('[data-a=ev]').onclick=()=>UI.form({title:'Семейная дата',fields:[
    {k:'title',label:'Название',required:true},{k:'date',label:'Дата',type:'date',required:true},
    {k:'type',label:'Тип',type:'select',options:[{v:'anniv',label:'Годовщина'},{v:'holiday',label:'Праздник'},{v:'other',label:'Другое'}]},
    {k:'note',label:'Заметка',type:'textarea',rows:2}],values:{type:'anniv'},
    submit:(v,c)=>{Store.add('events',v);c();UI.toast('Добавлено');App.refresh()}});
  el.querySelector('#fgrid').onclick=e=>{
    const host=e.target.closest('[data-id]'),id=host&&host.dataset.id;if(!id)return;
    const p=Store.find('people',id),x=e.target.closest('[data-x]');if(!p||!x)return;
    if(x.dataset.x==='edit')openItemForm('people',p);
    if(x.dataset.x==='gifts')giftsModal(p,()=>App.refresh());
    if(x.dataset.x==='del')UI.confirm('Удалить «'+p.name+'»?').then(ok=>{if(ok){Store.remove('people',id);App.refresh()}})};
  el.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>UI.confirm('Удалить дату?').then(ok=>{
    if(ok){Store.remove('events',b.dataset.ev);App.refresh()}}));
};