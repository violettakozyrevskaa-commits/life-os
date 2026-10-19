'use strict';
Schemas.books={
  name:'Книги',desc:'Библиотека, прогресс чтения, цитаты и оценки.',add:'Книгу',
  fields:[{k:'title',label:'Название',required:true},{k:'author',label:'Автор'},
    {k:'cover',label:'Обложка',type:'image'},{k:'genre',label:'Жанр'},
    {k:'pages',label:'Всего страниц',type:'number'},{k:'read',label:'Прочитано страниц',type:'number'},
    {k:'status',label:'Статус',type:'select',options:Object.keys(BOOK_STATUS).map(function(k){return {v:k,label:BOOK_STATUS[k]}})},
    {k:'start',label:'Дата начала',type:'date'},{k:'finish',label:'Дата завершения',type:'date'},
    {k:'rating',label:'Оценка',type:'stars'},{k:'review',label:'Отзыв',type:'textarea',rows:2},
    {k:'quotes',label:'Цитаты и заметки',type:'textarea',rows:3}],
  defaults:{status:'want',pages:0,read:0,rating:0},
  filters:[{k:'status',label:'Статус',options:Object.keys(BOOK_STATUS).map(function(k){return {v:k,label:BOOK_STATUS[k]}})},
    {k:'genre',label:'Жанр',options:[...new Set(Store.get('books').map(function(b){return b.genre}).filter(Boolean))].map(function(g){return {v:g,label:g}})}],
  sorts:[{v:'new',l:'Сначала добавленные'},{v:'az',l:'По названию'},{v:'rating',l:'По оценке'},{v:'prog',l:'По прогрессу'}],
  sortFn:function(a,b){return pct(b.read,b.pages)-pct(a.read,a.pages)},
  card:function(b){
    var p=pct(b.read||0,b.pages||1);
    var bg=b.cover?('background-image:url(\''+b.cover+'\')'):'';
    var statusCls=b.status==='read'?'ok':(b.status==='reading'?'p':'');
    var readingHtml='';
    if(b.status==='reading'){
      readingHtml='<div class="mt12">'+UI.bar(p)+'<div class="tiny muted mt8">'+(b.read||0)+'/'+(b.pages||0)+' стр. · '+p+'%</div></div>'+
        '<div class="row gap6 mt8"><button class="btn xs" data-x="+10">+10 стр.</button><button class="btn xs" data-x="+25">+25</button><button class="btn xs soft" data-x="finish">Прочитано</button></div>';
    }
    var ratingHtml=b.rating?('<div class="mt8" style="color:var(--warn)">'+'★'.repeat(b.rating)+'☆'.repeat(5-b.rating)+'</div>'):'';
    var quotesText=String(b.quotes||'');
    var quotesHtml=quotesText?('<div class="tiny muted mt8">«'+esc(quotesText.slice(0,90))+(quotesText.length>90?'…':'')+'»</div>'):'';
    return '<div class="card hover" style="padding:0;overflow:hidden"><div class="img-cover" style="height:132px;margin:0;border-radius:0;'+bg+'">'+(b.cover?'':'📕')+'</div><div style="padding:14px"><div class="row spread"><div class="grow"><b class="small ell">'+esc(b.title)+'</b><div class="tiny muted">'+esc(b.author||'—')+'</div></div><span class="chip '+statusCls+'">'+BOOK_STATUS[b.status]+'</span></div>'+readingHtml+ratingHtml+quotesHtml+'<div class="row gap6 mt12"><button class="btn xs ghost" data-act="edit">'+icon('pen')+'</button><button class="btn xs ghost" data-x="quote">'+icon('pen')+' цитата</button><button class="btn xs ghost" data-act="del">'+icon('trash')+'</button></div></div></div>';
  },
  onAction:function(act,b,draw,e){
    if(act==='edit')return openItemForm('books',b,draw);
    var x=e.target.closest('[data-x]');
    if(!x)return;
    if(x.dataset.x==='+10'||x.dataset.x==='+25'){
      var n=+x.dataset.x.slice(1);
      var r=Math.min(b.pages||((b.read||0)+n),(b.read||0)+n);
      Store.update('books',b.id,{read:r,start:b.start||D.today()});
      UI.toast('+'+n+' стр.');App.refresh();return;
    }
    if(x.dataset.x==='finish'){Store.update('books',b.id,{status:'read',read:b.pages,finish:D.today()});UI.toast('Книга прочитана 📚');achieve('Книга прочитана: '+b.title,'book');App.refresh();return}
    if(x.dataset.x==='quote'){
      UI.form({title:'Цитаты и заметки',width:520,fields:[{k:'quotes',label:'Цитаты, мысли, заметки',type:'textarea',rows:6}],values:b,
        submit:function(v,c){Store.update('books',b.id,v);c();UI.toast('Сохранено');App.refresh()}});
    }
  }
};
Views.books=function(el){
  collectionView('books',el);
  var t=D.today(),all=Store.get('books');
  var year=all.filter(function(b){return b.status==='read'&&b.finish&&b.finish.startsWith(String(new Date().getFullYear()))}).length;
  var pages=all.reduce(function(a,b){return a+(+b.read||0)},0);
  var goal=Store.st().readGoalYear||12;
  var box=document.createElement('div');
  box.className='card flat';box.style.marginBottom='16px';
  box.innerHTML='<div class="row gap16 wrap spread"><div class="row gap16 wrap"><div class="kpi"><b>'+all.filter(function(b){return b.status==='reading'}).length+'</b><span>читаю сейчас</span></div><div class="kpi"><b>'+year+'</b><span>прочитано в этом году</span></div><div class="kpi"><b>'+num(pages)+'</b><span>страниц всего</span></div><div class="kpi"><b>'+goal+'</b><span>цель на год</span></div></div><div style="min-width:180px;flex:1"><div class="tiny muted">Прогресс годовой цели · '+pct(year,goal)+'%</div>'+UI.bar(pct(year,goal))+'</div></div>';
  el.querySelector('#cgrid').before(box);
};

/* ---------- Медиатека ---------- */
Schemas.media={
  name:'Медиатека',desc:'Фильмы, сериалы, подкасты и видео: статусы, оценки, отзывы.',add:'Запись',
  fields:[{k:'title',label:'Название',required:true},{k:'type',label:'Тип',type:'select',
      options:[{v:'movie',label:'Фильм'},{v:'series',label:'Сериал'},{v:'podcast',label:'Подкаст'},{v:'video',label:'Видео'}]},
    {k:'cover',label:'Обложка',type:'image'},{k:'genre',label:'Жанр'},
    {k:'status',label:'Статус',type:'select',options:Object.keys(MEDIA_STATUS).map(function(k){return {v:k,label:MEDIA_STATUS[k]}})},
    {k:'rating',label:'Оценка',type:'stars'},{k:'review',label:'Отзыв',type:'textarea',rows:2},{k:'notes',label:'Заметки',type:'textarea',rows:2}],
  defaults:{status:'want',type:'movie',rating:0},
  filters:[{k:'type',label:'Тип',options:[{v:'movie',label:'Фильм'},{v:'series',label:'Сериал'},{v:'podcast',label:'Подкаст'},{v:'video',label:'Видео'}]},
    {k:'status',label:'Статус',options:Object.keys(MEDIA_STATUS).map(function(k){return {v:k,label:MEDIA_STATUS[k]}})}],
  sorts:[{v:'new',l:'Сначала новые'},{v:'az',l:'По названию'},{v:'rating',l:'По оценке'}],
  card:function(m){
    var bg=m.cover?('background-image:url(\''+m.cover+'\')'):'';
    var statusCls=m.status==='watched'?'ok':'';
    var typeLabel={movie:'Фильм',series:'Сериал',podcast:'Подкаст',video:'Видео'}[m.type];
    var ratingHtml=m.rating?('<div style="color:var(--warn)" class="mt8">'+'★'.repeat(m.rating)+'☆'.repeat(5-m.rating)+'</div>'):'';
    var reviewHtml=m.review?('<div class="small muted mt8 ell">'+esc(m.review)+'</div>'):'';
    return '<div class="card hover" style="padding:0;overflow:hidden"><div class="img-cover" style="height:150px;margin:0;border-radius:0;'+bg+'">'+(m.cover?'':'🎬')+'</div><div style="padding:14px"><div class="row spread"><b class="small ell">'+esc(m.title)+'</b><span class="chip '+statusCls+'">'+MEDIA_STATUS[m.status]+'</span></div><div class="tiny muted mt8">'+typeLabel+(m.genre?(' · '+esc(m.genre)):'')+'</div>'+ratingHtml+reviewHtml+'<div class="row gap6 mt12"><button class="btn xs ghost" data-act="edit">'+icon('pen')+'</button><button class="btn xs ghost" data-act="del">'+icon('trash')+'</button></div></div></div>';
  }
};
Views.media=function(el){collectionView('media',el)};