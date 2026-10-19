/* Настройки: темы, персонализация, разделы, данные и бэкап */
'use strict';
const THEMES=[
 {id:'midnight',name:'Midnight',mode:'dark',bg:'#0b1020',card:'#141c33',p:'#5aa9ff',a:'#7c6cff'},
 {id:'minimal',name:'Minimal White',mode:'light',bg:'#fbfbfd',card:'#ffffff',p:'#171922',a:'#5b5bd6'},
 {id:'lavender',name:'Lavender',mode:'light',bg:'#f7f5ff',card:'#ffffff',p:'#7b6cf6',a:'#b794f6'},
 {id:'sage',name:'Sage',mode:'light',bg:'#f1f5f0',card:'#ffffff',p:'#4f7a52',a:'#8fb996'},
 {id:'rose',name:'Rose',mode:'light',bg:'#fdf5f6',card:'#ffffff',p:'#d16a86',a:'#f0a6b8'},
 {id:'mocha',name:'Mocha',mode:'light',bg:'#f7f2ec',card:'#fffdf9',p:'#8a5a3b',a:'#c8a27a'},
 {id:'ocean',name:'Ocean',mode:'light',bg:'#eff7fa',card:'#ffffff',p:'#0e7c9c',a:'#22b8cf'},
 {id:'cyber',name:'Cyber',mode:'dark',bg:'#08080f',card:'#15152a',p:'#a855f7',a:'#22d3ee'}
];
Views.settings=el=>{
  const s=Store.st();
  el.innerHTML=`<div class="page-head"><div class="grow"><h2>Настройки</h2><p>Оформление, персонализация и данные</p></div></div>
  <div class="col gap16">
   <div class="card"><h3>Профиль</h3>
     <div class="form mt12">
      <div class="field"><label>Имя пользователя</label><input class="inp" id="sName" value="${esc(s.name)}"></div>
      <div class="field"><label>Аватар (файл или ссылка)</label><div class="row gap8">
        <input class="inp grow" id="sAv" value="${esc(s.avatar)}" placeholder="https://…"><label class="btn sm">Файл<input type="file" accept="image/*" id="sAvF" hidden></label></div></div>
      <div class="field"><label>Формат времени</label><select class="inp" id="sTime">
        <option value="24h" ${s.timeFormat==='24h'?'selected':''}>24 часа</option><option value="12h" ${s.timeFormat==='12h'?'selected':''}>12 часов</option></select></div>
      <div class="field"><label>Первый день недели</label><select class="inp" id="sWs">
        ${[1,0].map(d=>`<option value="${d}" ${s.weekStart===d?'selected':''}>${d===1?'Понедельник':'Воскресенье'}</option>`).join('')}</select></div>
      <div class="field"><label>Начало рабочего дня</label><input class="inp" type="number" min="0" max="23" id="sWs1" value="${s.workStart}"></div>
      <div class="field"><label>Конец рабочего дня</label><input class="inp" type="number" min="0" max="23" id="sWs2" value="${s.workEnd}"></div>
     </div>
     <div class="row gap8 mt16"><button class="btn primary" id="sSaveP">Сохранить профиль</button></div></div>

   <div class="card"><h3>Оформление · темы</h3>
     <div class="grid mt12" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
      ${THEMES.map(t=>`<div class="theme-card ${s.theme===t.id?'on':''}" data-th="${t.id}">
        <div class="tc-prev" style="background:${t.bg}"><i style="flex:1;height:38px;background:${t.card};border:1px solid rgba(128,128,128,.25)"></i>
        <i style="width:22px;height:22px;background:${t.p}"></i><i style="width:22px;height:22px;background:${t.a}"></i></div>
        <div class="tc-name">${t.name}</div></div>`).join('')}</div>
     <div class="form mt16">
      <div class="field"><label>Режим</label><select class="inp" id="sMode">
        <option value="dark" ${s.mode==='dark'?'selected':''}>Тёмный</option><option value="light" ${s.mode==='light'?'selected':''}>Светлый</option></select></div>
      <div class="field"><label>Основной цвет</label><input class="inp" type="color" id="cP" value="${s.colors.primary||THEMES.find(t=>t.id===s.theme).p}"></div>
      <div class="field"><label>Цвет акцента</label><input class="inp" type="color" id="cA" value="${s.colors.accent||THEMES.find(t=>t.id===s.theme).a}"></div>
      <div class="field"><label>Цвет фона</label><input class="inp" type="color" id="cBg" value="${s.colors.bg||THEMES.find(t=>t.id===s.theme).bg}"></div>
      <div class="field"><label>Цвет карточек</label><input class="inp" type="color" id="cC" value="${s.colors.card||THEMES.find(t=>t.id===s.theme).card}"></div>
      <div class="field"><label>Цвет текста</label><input class="inp" type="color" id="cT" value="${s.colors.text||'#e8ecf7'}"></div>
      <div class="field"><label>Скругление: <span id="rVal">${s.radius}</span> px</label><input type="range" min="0" max="28" id="sR" value="${s.radius}"></div>
      <div class="field"><label>Размер элементов</label><select class="inp" id="sSize">
        <option value="sm" ${s.size==='sm'?'selected':''}>Компактный</option><option value="md" ${s.size==='md'?'selected':''}>Обычный</option>
        <option value="lg" ${s.size==='lg'?'selected':''}>Крупный</option></select></div>
      <div class="field"><label>Плотность интерфейса</label><select class="inp" id="sDen">
        <option value="cozy" ${s.density==='cozy'?'selected':''}>Свободная</option><option value="compact" ${s.density==='compact'?'selected':''}>Плотная</option></select></div>
      <div class="field"><label>Шрифт</label><select class="inp" id="sFont">
        <option value="system" ${s.font==='system'?'selected':''}>Системный</option><option value="round" ${s.font==='round'?'selected':''}>Округлый</option>
        <option value="serif" ${s.font==='serif'?'selected':''}>С засечками</option><option value="mono" ${s.font==='mono'?'selected':''}>Моноширинный</option></select></div>
      <div class="field"><label class="chk"><input type="checkbox" id="sAnim" ${s.animations?'checked':''}> Анимации интерфейса</label></div>
     </div>
     <div class="row gap8 mt16"><button class="btn primary" id="sSaveT">Применить</button>
       <button class="btn ghost" id="sReset">Сбросить оформление</button></div></div>

   <div class="card"><h3>Разделы меню · порядок и видимость</h3><div class="col gap8 mt12" id="secList"></div></div>
   <div class="card"><h3>Главная страница</h3><div class="col gap8 mt12" id="homeList"></div></div>
   <div class="card"><h3>Цели и таймер</h3><div class="form mt12">
      <div class="field"><label>Тренировок в неделю (цель)</label><input class="inp num" type="number" id="gSport" value="${s.sportGoal}"></div>
      <div class="field"><label>Книг в год (цель)</label><input class="inp num" type="number" id="gRead" value="${s.readGoalYear}"></div>
      <div class="field"><label>Помидоро: работа, мин</label><input class="inp num" type="number" id="pW" value="${s.pomodoro.work}"></div>
      <div class="field"><label>Помидоро: перерыв, мин</label><input class="inp num" type="number" id="pS" value="${s.pomodoro.short}"></div></div>
     <div class="row gap8 mt16"><button class="btn primary" id="sSaveG">Сохранить</button></div></div>

   <div class="card"><h3>Данные и резервные копии</h3>
     <p class="small muted mt8">Всё хранится локально в вашем браузере (LocalStorage) и никуда не отправляется.
     Локальное хранение не заменяет полноценную защиту конфиденциальных данных — делайте выгрузки регулярно.</p>
     <div class="row gap8 wrap mt16">
       <button class="btn" id="bExp">${icon('download')} Экспорт JSON</button>
       <label class="btn">${icon('upload')} Импорт JSON<input type="file" accept="application/json" id="bImp" hidden></label>
       <button class="btn" id="bCsv">${icon('download')} Все таблицы в CSV</button>
       <button class="btn ghost" id="bDemo">${icon('trash')} Удалить демо-данные</button>
       <button class="btn danger" id="bClear">${icon('alert')} Очистить всё</button></div>
     <div class="divider"></div>
     <div class="small muted">Записей: ${ALL_KEYS.map(k=>k+' — '+Store.get(k).length).join(' · ')}</div></div>

   <div class="card"><h3>О системе</h3><p class="small muted mt8">LIFE OS — «Моя система жизни». Один экран для дня, привычек,
     целей, спорта, книг, семьи, финансов, учёбы и развития. Данные связаны между собой: задачи и тренировки попадают в календарь,
     цели распадаются на этапы и задачи, блюда — в список покупок, расходы — в бюджет.</p></div>
  </div>`;
  /* профиль */
  el.querySelector('#sSaveP').onclick=()=>{
    const st=Store.st();st.name=el.querySelector('#sName').value.trim()||'Пользователь';
    st.avatar=el.querySelector('#sAv').value.trim();st.timeFormat=el.querySelector('#sTime').value;
    st.weekStart=+el.querySelector('#sWs').value;st.workStart=+el.querySelector('#sWs1').value;
    st.workEnd=+el.querySelector('#sWs2').value;Store.save();App.avatar();UI.toast('Профиль сохранён');App.refresh()};
  el.querySelector('#sAvF').onchange=async e=>{const f=e.target.files[0];if(!f)return;
    try{el.querySelector('#sAv').value=await App.imgToDataURL(f,320);UI.toast('Фото загружено')}catch(err){UI.toast('Ошибка файла','err')}};
  /* темы */
  el.querySelectorAll('[data-th]').forEach(c=>c.onclick=()=>{
    const th=THEMES.find(t=>t.id===c.dataset.th),st=Store.st();
    st.theme=th.id;st.mode=th.mode;st.colors={primary:'',accent:'',bg:'',card:'',text:''};
    Store.save();App.applySettings();UI.toast('Тема: '+th.name);Views.settings(el)});
  el.querySelector('#sR').oninput=e=>{el.querySelector('#rVal').textContent=e.target.value};
  el.querySelector('#sSaveT').onclick=()=>{
    const st=Store.st();
    st.mode=el.querySelector('#sMode').value;st.radius=+el.querySelector('#sR').value;
    st.size=el.querySelector('#sSize').value;st.density=el.querySelector('#sDen').value;
    st.font=el.querySelector('#sFont').value;st.animations=el.querySelector('#sAnim').checked;
    st.colors={primary:el.querySelector('#cP').value,accent:el.querySelector('#cA').value,
      bg:el.querySelector('#cBg').value,card:el.querySelector('#cC').value,text:el.querySelector('#cT').value};
    Store.save();App.applySettings();UI.toast('Оформление применено')};
  el.querySelector('#sReset').onclick=()=>UI.confirm('Вернуть стандартные настройки оформления?','Сброс','Сбросить').then(ok=>{
    if(!ok)return;const st=Store.st();
    st.theme='midnight';st.mode='dark';st.radius=16;st.size='md';st.density='cozy';st.font='system';
    st.animations=true;st.colors={primary:'',accent:'',bg:'',card:'',text:''};
    Store.save();App.applySettings();UI.toast('Сброшено');Views.settings(el)});
  /* разделы */
  const secList=el.querySelector('#secList');
  const drawSec=()=>{const list=visibleSections(),hid=s.hidden||[];
    secList.innerHTML=SECTIONS.map(sec=>{
      const i=list.findIndex(x=>x.id===sec.id);
      return `<div class="reorder-i"><label class="chk"><input type="checkbox" data-vis="${sec.id}" ${!hid.includes(sec.id)?'checked':''}></label>
        <span class="grow row gap8">${icon(sec.icon)} ${esc(sec.label)}</span>
        <button class="btn xs ghost" data-up="${sec.id}" ${i<=0?'disabled':''}>${icon('left')}</button>
        <button class="btn xs ghost" data-dn="${sec.id}" ${i<0||i>=list.length-1?'disabled':''}>${icon('right')}</button></div>`}).join('')};
  drawSec();
  secList.onclick=e=>{
    const up=e.target.closest('[data-up]'),dn=e.target.closest('[data-dn]');
    if(!up&&!dn)return;
    const list=visibleSections().map(x=>x.id),id=(up||dn).dataset.up||(up||dn).dataset.dn;
    let i=list.indexOf(id);if(i<0){list.push(id);i=list.length-1}
    const j=up?i-1:i+1;if(j<0||j>=list.length)return;
    [list[i],list[j]]=[list[j],list[i]];
    const st=Store.st();st.order=SECTIONS.map(x=>x.id).filter(x=>list.includes(x)).sort((a,b)=>list.indexOf(a)-list.indexOf(b));
    st.order=list.slice();Store.save();renderNav();Views.settings(el)};
  secList.onchange=e=>{const c=e.target.closest('[data-vis]');if(!c)return;
    const st=Store.st();const h=new Set(st.hidden||[]);
    c.checked?h.delete(c.dataset.vis):h.add(c.dataset.vis);
    if(c.dataset.vis==='settings')return UI.toast('Настройки нельзя скрыть','warn');
    st.hidden=[...h];Store.save();renderNav();UI.toast('Меню обновлено')};
  /* главная */
  const hl=el.querySelector('#homeList');
  hl.innerHTML=HOME_BLOCKS.map(b=>`<div class="reorder-i"><label class="chk"><input type="checkbox" data-hb="${b.id}"
    ${!(s.homeHidden||[]).includes(b.id)?'checked':''}></label><span class="grow row gap8">${icon(b.icon)} ${b.label}</span></div>`).join('');
  hl.onchange=e=>{const c=e.target.closest('[data-hb]');if(!c)return;
    const st=Store.st();const h=new Set(st.homeHidden||[]);
    c.checked?h.delete(c.dataset.hb):h.add(c.dataset.hb);st.homeHidden=[...h];Store.save();UI.toast('Главная обновлена')};
  /* цели */
  el.querySelector('#sSaveG').onclick=()=>{const st=Store.st();
    st.sportGoal=+el.querySelector('#gSport').value||0;st.readGoalYear=+el.querySelector('#gRead').value||0;
    st.pomodoro=Object.assign({},st.pomodoro,{work:+el.querySelector('#pW').value||25,short:+el.querySelector('#pS').value||5});
    Store.save();UI.toast('Сохранено');App.refresh()};
  /* данные */
  el.querySelector('#bExp').onclick=()=>{Store.exportJSON();UI.toast('Резервная копия скачана')};
  el.querySelector('#bImp').onchange=async e=>{const f=e.target.files[0];if(!f)return;
    try{await Store.importJSON(f);UI.toast('Данные восстановлены');setTimeout(()=>location.reload(),700)}
    catch(err){UI.toast('Некорректный файл резервной копии','err')}};
  el.querySelector('#bCsv').onclick=()=>{let n=0;
    ALL_KEYS.forEach(k=>{const c=Store.toCSV(k);if(c){Store.download('life-os-'+k+'.csv',c,'text/csv');n++}});
    UI.toast(n?('Выгружено таблиц: '+n):'Нет данных для экспорта',n?'ok':'warn')};
  el.querySelector('#bDemo').onclick=()=>UI.confirm('Удалить все демонстрационные записи? Ваши данные останутся.','Демо','Удалить').then(ok=>{
    if(!ok)return;const n=Store.clearDemo();UI.toast('Удалено демо-записей: '+n);App.refresh()});
  el.querySelector('#bClear').onclick=()=>UI.confirm('Будут удалены ВСЕ данные без возможности восстановления. Продолжить?','Осторожно','Удалить всё').then(ok=>{
    if(!ok)return;localStorage.removeItem(LS_KEY);location.reload()});
};