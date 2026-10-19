/* Учёба и развитие: предметы, задания, экзамены, конспекты */
'use strict';
const _of4=openItemForm;
openItemForm=function(key,item,after){
  if(key==='homework'){
    const subs=Store.get('subjects');
    const v=Object.assign({type:'hw',due:D.today(),done:false},item||{});
    return UI.form({title:item?'Задание':'Новое задание',fields:[
      {k:'title',label:'Название',required:true},
      {k:'subjectId',label:'Предмет',type:'select',options:subs.map(s=>({v:s.id,label:s.title}))},
      {k:'type',label:'Тип',type:'select',options:[{v:'hw',label:'Домашнее задание'},{v:'exam',label:'Экзамен'},{v:'test',label:'Зачёт'},{v:'project',label:'Проект'}]},
      {k:'due',label:'Дедлайн',type:'date'},{k:'score',label:'Оценка (по желанию)'},
      {k:'notes',label:'Конспект / материалы',type:'textarea',rows:5}],values:v,
      submit:(val,c)=>{item?Store.update('homework',item.id,val):Store.add('homework',val);
        c();UI.toast('Сохранено');App.refresh();if(after)after()}});
  }
  return _of4(key,item,after);
};
Views.edu=el=>{
  const subs=Store.get('subjects'),hw=Store.get('homework'),t=D.today();
  const done=hw.filter(h=>h.done).length;
  el.innerHTML=`<div class="page-head"><div class="grow"><h2>Учёба и развитие</h2>
     <p>Предметы, задания, экзамены и конспекты · выполнено ${done} из ${hw.length}</p></div>
     <div class="row gap8"><button class="btn ghost" data-a="sub">${icon('plus')} Предмет</button>
     <button class="btn primary" data-a="hw">${icon('plus')} Задание</button></div></div>
   <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-bottom:16px">
     ${subs.length?subs.map(s=>{const list=hw.filter(h=>h.subjectId===s.id);
       return `<div class="card" style="border-top:3px solid ${s.color||'var(--primary)'}"><b class="small">${esc(s.title)}</b>
       <div class="tiny muted mt8">Заданий: ${list.length} · выполнено ${list.filter(h=>h.done).length}</div>
       ${UI.bar(pct(list.filter(h=>h.done).length,list.length||1),'thin mt8')}
       <div class="row gap6 mt12"><button class="btn xs ghost" data-sedit="${s.id}">${icon('pen')}</button>
       <button class="btn xs ghost" data-sdel="${s.id}">${icon('trash')}</button></div></div>`}).join('')
      :`<div class="card"><span class="small muted">Предметов нет — добавьте первый.</span></div>`}</div>
   <h3 style="margin-bottom:10px">Задания и экзамены</h3>
   <div class="list">${hw.length?hw.slice().sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')).map(h=>{
     const s=subs.find(x=>x.id===h.subjectId),dl=h.due?D.diff(t,h.due):null;
     return `<div class="li ${h.done?'done':''}" data-id="${h.id}">
      <button class="check ${h.done?'on':''}" data-x="done">${icon('check')}</button>
      <span class="prio ${h.type==='exam'?'high':'med'}"></span>
      <div class="grow"><b class="small">${esc(h.title)}</b><div class="tiny muted">${esc(s?s.title:'—')} · ${{hw:'ДЗ',exam:'Экзамен',test:'Зачёт',project:'Проект'}[h.type]||''}
        ${h.due?` · ${D.short(h.due)}${dl!=null?` (${dl>=0?dl+' дн.':'просрочено'})`:''}`:''}${h.score?` · оценка ${esc(h.score)}`:''}</div>
        ${h.notes?`<div class="tiny muted ell" style="max-width:460px">${esc(h.notes)}</div>`:''}</div>
      <button class="btn xs ghost" data-x="plan">${icon('check')} в план</button>
      <button class="btn xs ghost" data-x="edit">${icon('pen')}</button>
      <button class="btn xs ghost" data-x="del">${icon('trash')}</button></div>`}).join('')
     :UI.empty('Заданий нет','Добавьте дедлайн — он появится в календаре и уведомлениях.','Задание')}</div>`;
  el.querySelector('[data-a=hw]').onclick=()=>openItemForm('homework',null);
  el.querySelector('[data-a=sub]').onclick=()=>UI.form({title:'Предмет',width:420,
    fields:[{k:'title',label:'Название',required:true},{k:'color',label:'Цвет',type:'swatches',
      options:['#5aa9ff','#7b6cf6','#3ddc97','#ffbe55','#f0a6b8','#22b8cf','#a855f7']}],values:{color:'#7b6cf6'},
    submit:(v,c)=>{Store.add('subjects',v);c();UI.toast('Добавлено');App.refresh()}});
  el.onclick=e=>{
    const se=e.target.closest('[data-sedit]');
    if(se){const s=Store.find('subjects',se.dataset.sedit);
      return UI.form({title:'Предмет',width:420,fields:[{k:'title',label:'Название',required:true},
        {k:'color',label:'Цвет',type:'swatches',options:['#5aa9ff','#7b6cf6','#3ddc97','#ffbe55','#f0a6b8','#22b8cf','#a855f7']}],
        values:s,submit:(v,c)=>{Store.update('subjects',s.id,v);c();App.refresh()}})}
    const sd=e.target.closest('[data-sdel]');
    if(sd)return UI.confirm('Удалить предмет? Задания останутся.').then(ok=>{if(ok){Store.remove('subjects',sd.dataset.sdel);App.refresh()}});
    const host=e.target.closest('[data-id]'),id=host&&host.dataset.id;if(!id)return;
    const h=Store.find('homework',id),x=e.target.closest('[data-x]');if(!h||!x)return;
    if(x.dataset.x==='done'){Store.update('homework',id,{done:!h.done});UI.toast(h.done?'Снято':'Выполнено');App.refresh()}
    if(x.dataset.x==='edit')openItemForm('homework',h);
    if(x.dataset.x==='plan'){Store.add('tasks',{title:h.title,desc:'Учёба: '+(h.type||''),date:h.due||D.today(),
      category:'Учёба',priority:h.type==='exam'?'high':'med',repeat:'none',done:false});UI.toast('Добавлено в план на день');App.refresh()}
    if(x.dataset.x==='del')UI.confirm('Удалить задание?').then(ok=>{if(ok){Store.remove('homework',id);App.refresh()}})};
};