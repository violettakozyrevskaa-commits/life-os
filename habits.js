/* Привычки: трекер, история по датам, серии, статистика, архив */
'use strict';
function habitDueOn(h,day){
  if(h.archived)return false;
  const dw=D.dow(day);
  if(h.freq==='weekdays')return dw>=1&&dw<=5;
  if(h.freq==='custom')return (h.days||[]).map(Number).includes(dw);
  return true;
}
function habitStreak(h){
  let s=0,d=D.today();
  if(habitDueOn(h,d)&&!(h.log||{})[d])d=D.add(d,-1);
  for(let i=0;i<800;i++){
    if(habitDueOn(h,d)){ if((h.log||{})[d])s++; else break }
    d=D.add(d,-1);
  }
  return s;
}
function habitRate(h,from,to){
  let due=0,done=0;
  for(let d=from;D.diff(from,d)<=D.diff(from,to);d=D.add(d,1)){
    if(!habitDueOn(h,d))continue;due++;if((h.log||{})[d])done++}
  return{due,done,p:pct(done,due)};
}
Schemas.habits={
  name:'Привычки',desc:'Одно нажатие — и день засчитан.',
  add:'Новая привычка',emptyT:'Привычек пока нет',emptyD:'Создайте первую: чтение, вода, зарядка.',
  fields:[
    {k:'title',label:'Название',required:true},
    {k:'icon',label:'Иконка (эмодзи или символ)',ph:'📖'},
    {k:'color',label:'Цвет',type:'swatches',options:['#5aa9ff','#7b6cf6','#3ddc97','#ffbe55','#f0a6b8','#22b8cf','#a855f7','#8fb996']},
    {k:'freq',label:'Частота',type:'select',options:[{v:'daily',label:'Каждый день'},{v:'weekdays',label:'По будням'},{v:'custom',label:'Выбор дней'}]},
    {k:'days',label:'Дни недели',type:'days',full:true},
    {k:'note',label:'Заметка',type:'textarea',rows:2}
  ],
  defaults:{icon:'✨',color:'#5aa9ff',freq:'daily',days:[1,2,3,4,5,6,0],log:{}},
  filters:[{k:'freq',label:'Частота',options:[{v:'daily',label:'Каждый день'},{v:'weekdays',label:'Будни'},{v:'custom',label:'Свои дни'}]}],
  sorts:[{v:'new',l:'Сначала новые'},{v:'az',l:'По алфавиту'},{v:'streak',l:'По серии'}],
  sortFn:(a,b)=>habitStreak(b)-habitStreak(a),
  prepare:items=>items.filter(i=>!i.archived),
  card:h=>`<div class="card hover habit"><b>${esc(h.title)}</b></div>`,
  onAction(){}
};

Views.habits=el=>{
  const t=D.today(),all=Store.get('habits');
  const act=all.filter(h=>!h.archived);
  const arch=all.filter(h=>h.archived);
  const due=act.filter(h=>habitDueOn(h,t));
  const done=due.filter(h=>(h.log||{})[t]);

  const st=viewState.habits||(viewState.habits={m:D.mk(t)});
  const month=st.m;
  const days=D.monthDays(month);
  const [year,mon]=month.split('-').map(Number);

  const firstDay=D.parse(days[0]);
  const lead=(firstDay.getDay()-Store.st().weekStart+7)%7;
  const weeks=[];
  let curWeek=[];
  for(let i=0;i<lead;i++)curWeek.push(null);
  days.forEach(d=>{
    curWeek.push(d);
    if(curWeek.length===7){weeks.push(curWeek);curWeek=[]}
  });
  if(curWeek.length){while(curWeek.length<7)curWeek.push(null);weeks.push(curWeek)}

  el.innerHTML=`<div class="page-head"><div class="grow"><h2>Привычки</h2>
      <p>Сегодня выполнено ${done.length} из ${due.length} · ${pct(done.length,due.length)}% · всего привычек: ${act.length}</p></div>
      <div class="row gap8">
        <select class="inp sm" id="hMonth">${[...Array(12)].map((_,i)=>{
          const mm=year+'-'+pad2(i+1);
          return `<option value="${mm}" ${mm===month?'selected':''}>${MON_N[i]} ${year}</option>`;
        }).join('')}</select>
        <button class="btn ghost" id="archBtn">${icon('download')} Архив (${arch.length})</button>
        <button class="btn primary" id="addH">${icon('plus')} Новая привычка</button>
      </div></div>

    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:16px">
      <div class="card"><div class="kpi"><b>${done.length}/${due.length}</b><span>отмечено на сегодня</span></div></div>
      <div class="card"><div class="kpi"><b>${pct(done.length,due.length)}%</b><span>общий прогресс</span></div></div>
      <div class="card"><div class="kpi"><b>${act.length}</b><span>привычек</span></div></div>
    </div>

    <div class="card flat" style="padding:0;overflow:auto">
      <table class="htbl">
        <thead>
          <tr>
            <th class="htbl-name" rowspan="2">Привычка</th>
            ${weeks.map((w,i)=>`<th colspan="7" class="htbl-week">Неделя ${i+1}</th>`).join('')}
          </tr>
          <tr>
            ${weeks.map(w=>w.map(d=>`<th class="htbl-day ${d===t?'today':''}">${d?D.parse(d).getDate():''}</th>`).join('')).join('')}
          </tr>
        </thead>
        <tbody>
          ${act.length?act.map(h=>`
            <tr data-id="${h.id}">
              <td class="htbl-name">
                <span class="tag-i" style="background:${h.color}22;color:${h.color};width:26px;height:26px;font-size:14px">${h.icon||'✨'}</span>
                <span class="grow ell">${esc(h.title)}</span>
                <button class="btn icon ghost xs" data-act="edit" title="Редактировать">${icon('pen')}</button>
                <button class="btn icon ghost xs" data-act="del" title="Удалить">${icon('trash')}</button>
              </td>
              ${weeks.map(w=>w.map(d=>{
                if(!d)return '<td class="htbl-cell empty"></td>';
                const on=!!(h.log||{})[d];
                const dueD=habitDueOn(h,d);
                const fut=D.future(d);
                return `<td class="htbl-cell"><button class="hcell ${on?'on':''} ${fut?'off':''} ${d===t?'today':''}" 
                  data-x="day" data-id="${h.id}" data-date="${d}" ${fut||!dueD?'disabled':''}></button></td>`;
              }).join('')).join('')}
            </tr>
          `).join(''):`<tr><td colspan="${weeks.length*7+1}">${UI.empty('Привычек нет','Создайте первую — например «Читать каждый день».','Новая привычка')}</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="row gap8 mt16 center">
      <button class="btn primary" id="addH2">${icon('plus')} Добавить привычку</button>
    </div>`;

  el.querySelector('#addH').onclick=()=>openItemForm('habits',null);
  el.querySelector('#addH2').onclick=()=>openItemForm('habits',null);
  el.querySelector('#hMonth').onchange=e=>{st.m=e.target.value;Views.habits(el)};
  el.querySelector('#archBtn').onclick=()=>{
    if(!arch.length)return UI.toast('Архив пуст','warn');
    UI.modal({title:'Архив привычек',width:520,body:`<div class="list">${arch.map(h=>
      `<div class="li"><span class="tag-i" style="background:${h.color}22;color:${h.color}">${h.icon}</span><span class="grow">${esc(h.title)}</span>
       <button class="btn xs" data-back="${h.id}">Вернуть</button></div>`).join('')}</div>`,
      onMount:(r)=>{r.onclick=e=>{const b=e.target.closest('[data-back]');if(!b)return;
        Store.update('habits',b.dataset.back,{archived:false});UI.toast('Возвращено');App.refresh()}}})};

  el.addEventListener('click',e=>{
    const cell=e.target.closest('[data-x=day]');
    if(cell){
      const h=Store.find('habits',cell.dataset.id);
      const d=cell.dataset.date;
      if(!h||D.future(d))return;
      const before=habitStreak(h);
      h.log=Object.assign({},h.log);
      h.log[d]?delete h.log[d]:h.log[d]=true;
      Store.update('habits',h.id,{log:h.log});
      const after=habitStreak(h);
      if(before<7 && after>=7)achieve('Неделя без пропусков: '+h.title,'flame');
      if(before<30 && after>=30)achieve('30 дней подряд: '+h.title,'flame');
      Views.habits(el);
      return;
    }
    const host=e.target.closest('[data-id]');
    const a=e.target.closest('[data-act]');
    if(host&&a){
      const h=Store.find('habits',host.dataset.id);
      if(!h)return;
      if(a.dataset.act==='edit')openItemForm('habits',h);
      if(a.dataset.act==='del')UI.confirm('Удалить привычку «'+h.title+'»? История будет потеряна.').then(ok=>{
        if(ok){Store.remove('habits',h.id);UI.toast('Удалено');App.refresh()}});
    }
  });
};