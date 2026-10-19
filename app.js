'use strict';

const ICONS={
dot:'M12 12h.01',
home:'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
check:'m20 6-11 11-5-5',
flame:'M12 22c4 0 7-2.7 7-6.5 0-4.5-4-6-4-9 0 0-3 1.5-3 5 0-1.5-1-3-2.5-4C9 9 5 11 5 15.5 5 19.3 8 22 12 22Z',
dumbbell:'M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11',
target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-3.6a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z',
book:'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 21.5zM4 19.5A2.5 2.5 0 0 1 6.5 17H20',
cart:'M3 4h2l2.4 11.2A2 2 0 0 0 9.4 17h8.2a2 2 0 0 0 2-1.6L21 8H6M9.5 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M15 3.1a4 4 0 0 1 0 7.8',
wallet:'M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M21 10v4h-4a2 2 0 0 1 0-4z',
calendar:'M8 2v4M16 2v4M3 9.5h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
edu:'M22 10 12 5 2 10l10 5 10-5ZM6 12.2V17c0 1.2 2.7 3 6 3s6-1.8 6-3v-4.8',
star:'m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z',
pen:'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
film:'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM8 3v18M16 3v18M3 9h18M3 15h18',
chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
gear:'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1 2 2 0 1 1-4 0 1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7 2 2 0 1 1 0-4 1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10.5 3a2 2 0 1 1 4 0 1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7 2 2 0 1 1 0 4 1.6 1.6 0 0 0-1.5 1Z',
plus:'M12 5v14M5 12h14',
search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3',
bell:'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2',
x:'M18 6 6 18M6 6l12 12',
trash:'M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
left:'m15 18-6-6 6-6',
right:'m9 18 6-6-6-6',
sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-14v2m0 18v-2M5 12H3m18 0h-2M6 6 4.6 4.6M19.4 19.4 18 18M6 18l-1.4 1.4M19.4 4.6 18 6',
moon:'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
download:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
upload:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
refresh:'M21 12a9 9 0 1 1-3-6.7M21 3v6h-6',
play:'m7 4 13 8-13 8z',
pause:'M8 4h3v16H8zM14 4h3v16h-3z',
gift:'M20 12v9H4v-9M2 7.5h20V12H2zM12 21V7.5M12 7.5H7.8a2.7 2.7 0 1 1 0-5.4C11 2.1 12 7.5 12 7.5Zm0 0h4.2a2.7 2.7 0 1 0 0-5.4C13 2.1 12 7.5 12 7.5Z',
image:'M3 5h18v14H3zM3 15.5 8 10l4 4 3-3 6 6',
tag:'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01',
heart:'M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1Z',
menu:'M3 6h18M3 12h18M3 18h18',
alert:'M12 9v4m0 3.5h.01M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
eye:'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
grid:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
list:'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
arrow:'M5 12h14m-6-6 6 6-6 6',
dots:'M12 6h.01M12 12h.01M12 18h.01',
filter:'M21 4H3l7.2 8.5V19l3.6 2v-8.5z',
move:'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20'
};

function icon(n,cls){
  cls=cls||'';
  var d=ICONS[n]||ICONS.dot||'M12 12h.01';
  return '<svg class="'+cls+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>';
}

const UI={
  toast:function(msg,type,ms,action){
    type=type||'ok'; ms=ms||2600;
    var r=document.getElementById('toastRoot');
    if(!r)return;
    var el=document.createElement('div');
    el.className='toast '+type;
    el.textContent=msg;
    if(action&&action.label){
      var btn=document.createElement('button');
      btn.className='btn xs soft';
      btn.style.marginLeft='10px';
      btn.textContent=action.label;
      btn.onclick=function(){try{action.onClick()}finally{el.remove()}};
      el.appendChild(btn);
    }
    r.appendChild(el);
    setTimeout(function(){
      el.style.opacity='0';
      el.style.transform='translateX(16px)';
      setTimeout(function(){el.remove()},250);
    },ms);
  },

  modal:function(opts){
    var title=opts.title, body=opts.body, width=opts.width||620, onMount=opts.onMount, footer=opts.footer;
    var root=document.getElementById('modalRoot');
    root.innerHTML='<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" style="max-width:'+width+'px">'+
      '<div class="modal-h"><h3>'+esc(title)+'</h3><button class="btn icon ghost" data-x="close" aria-label="Закрыть">'+icon('x')+'</button></div>'+
      '<div class="modal-b">'+body+'</div>'+(footer?'<div class="modal-f">'+footer+'</div>':'')+
      '</div></div>';
    function close(){root.innerHTML='';document.removeEventListener('keydown',onKey)}
    function onKey(e){if(e.key==='Escape')close()}
    document.addEventListener('keydown',onKey);
    root.querySelector('[data-x=close]').onclick=close;
    root.querySelector('.modal-back').addEventListener('mousedown',function(e){if(e.target.classList.contains('modal-back'))close()});
    if(onMount)onMount(root,close);
    return close;
  },

  confirm:function(text,title,okText){
    title=title||'Подтверждение';
    okText=okText||'Удалить';
    return new Promise(function(res){
      var c=UI.modal({title:title,width:440,
        body:'<p style="font-size:14.5px">'+esc(text)+'</p>',
        footer:'<button class="btn ghost" data-x="no">Отмена</button><button class="btn danger" data-x="yes">'+esc(okText)+'</button>',
        onMount:function(root,close){
          root.querySelector('[data-x=no]').onclick=function(){close();res(false)};
          root.querySelector('[data-x=yes]').onclick=function(){close();res(true)};
        }
      });
    });
  },

  fieldHTML:function(f,v){
    var val=v==null?'':v;
    var id='f_'+f.k;
    function wrap(inner){
      var fullCls=(f.full===false)?'':'full';
      var req=f.required?' *':'';
      var hint=f.hint?'<div class="hint">'+esc(f.hint)+'</div>':'';
      return '<div class="field '+fullCls+'" data-f="'+f.k+'"><label for="'+id+'">'+esc(f.label)+req+'</label>'+inner+hint+'</div>';
    }
    if(f.type==='textarea'){
      return wrap('<textarea class="inp" id="'+id+'" name="'+f.k+'" rows="'+(f.rows||4)+'" placeholder="'+esc(f.ph||'')+'">'+esc(val)+'</textarea>');
    }
    if(f.type==='select'){
      var opts=(f.options||[]).map(function(o){
        var sel=String(val)===String(o.v)?'selected':'';
        return '<option value="'+esc(o.v)+'" '+sel+'>'+esc(o.label)+'</option>';
      }).join('');
      return wrap('<select class="inp" id="'+id+'" name="'+f.k+'">'+opts+'</select>');
    }
    if(f.type==='number'){
      return wrap('<input class="inp num" id="'+id+'" type="number" step="'+(f.step||'1')+'" name="'+f.k+'" value="'+esc(val)+'" placeholder="'+esc(f.ph||'')+'">');
    }
    if(f.type==='date'){
      return wrap('<input class="inp" id="'+id+'" type="date" name="'+f.k+'" value="'+esc(val)+'">');
    }
    if(f.type==='time'){
      return wrap('<input class="inp" id="'+id+'" type="time" name="'+f.k+'" value="'+esc(val)+'">');
    }
    if(f.type==='color'){
      return wrap('<input class="inp" id="'+id+'" type="color" name="'+f.k+'" value="'+esc(val||f.def||'#5aa9ff')+'">');
    }
    if(f.type==='checkbox'){
      var chk=val?'checked':'';
      return '<div class="field full"><label class="chk"><input type="checkbox" id="'+id+'" name="'+f.k+'" '+chk+'> '+esc(f.label)+'</label></div>';
    }
    if(f.type==='days'){
      var arr=[1,2,3,4,5,6,0];
      var daysHtml=arr.map(function(d){
        var checked=(val||[]).map(Number).indexOf(d)!==-1?'checked':'';
        return '<label><input type="checkbox" name="'+f.k+'" value="'+d+'" '+checked+'><span>'+DOW_S[d]+'</span></label>';
      }).join('');
      return wrap('<div class="days-pick">'+daysHtml+'</div>');
    }
    if(f.type==='swatches'){
      var sw=(f.options||[]).map(function(c){
        var on=val===c?'on':'';
        return '<i class="sw '+on+'" data-v="'+c+'" style="background:'+c+'"></i>';
      }).join('');
      var defVal=esc(val||f.options[0]);
      return wrap('<div class="swatches" data-sw="'+f.k+'">'+sw+'</div><input type="hidden" name="'+f.k+'" value="'+defVal+'">');
    }
    if(f.type==='image'){
      var prevCls=val?'':'hidden';
      return wrap('<div class="row gap8 wrap"><input class="inp grow" id="'+id+'" name="'+f.k+'" value="'+esc(val)+'" placeholder="Ссылка на изображение"><label class="btn sm">'+icon('image')+' Файл<input type="file" accept="image/*" hidden data-img="'+f.k+'"></label></div><div class="img-prev mt8 '+prevCls+'" style="height:110px;border-radius:12px;background:center/cover no-repeat;background-image:url(\''+esc(val)+'\')"></div>');
    }
    if(f.type==='stars'){
      var stars=[1,2,3,4,5].map(function(i){
        var on=i<=+val?'on':'';
        return '<button type="button" data-v="'+i+'" class="'+on+'">'+icon('star')+'</button>';
      }).join('');
      return wrap('<div class="stars" data-stars="'+f.k+'">'+stars+'</div><input type="hidden" name="'+f.k+'" value="'+esc(val||0)+'">');
    }
    return wrap('<input class="inp" id="'+id+'" name="'+f.k+'" value="'+esc(val)+'" placeholder="'+esc(f.ph||'')+'">');
  },

  form:function(opts){
    var title=opts.title, fields=opts.fields, values=opts.values||{}, submit=opts.submit, width=opts.width||620, submitText=opts.submitText||'Сохранить';
    var bodyHtml='<form class="form" id="fform">';
    fields.forEach(function(f){
      bodyHtml+=UI.fieldHTML(f,values[f.k]);
    });
    bodyHtml+='</form>';
    var footerHtml='<button class="btn ghost" data-x="c">Отмена</button><button class="btn primary" form="fform" type="submit">'+esc(submitText)+'</button>';
    UI.modal({title:title,width:width,body:bodyHtml,footer:footerHtml,
      onMount:function(root,close){
        var form=root.querySelector('#fform');
        root.querySelector('[data-x=c]').onclick=close;
        var submitBtn=form.querySelector('[type=submit]');
        submitBtn.onclick=function(e){e.preventDefault();if(form.requestSubmit)form.requestSubmit();else form.dispatchEvent(new Event('submit'))};
        root.querySelectorAll('[data-sw]').forEach(function(box){
          box.addEventListener('click',function(e){
            var s=e.target.closest('.sw');
            if(!s)return;
            box.querySelectorAll('.sw').forEach(function(x){x.classList.remove('on')});
            s.classList.add('on');
            box.parentElement.querySelector('input[type=hidden]').value=s.dataset.v;
          });
        });
        root.querySelectorAll('[data-stars]').forEach(function(box){
          box.addEventListener('click',function(e){
            var b=e.target.closest('button');
            if(!b)return;
            var v=+b.dataset.v;
            box.querySelectorAll('button').forEach(function(x,i){x.classList.toggle('on',i<v)});
            box.parentElement.querySelector('input[type=hidden]').value=v;
          });
        });
        root.querySelectorAll('[data-img]').forEach(function(inp){
          inp.addEventListener('change',function(e){
            var f=e.target.files[0];
            if(!f)return;
            App.imgToDataURL(f,520).then(function(url){
              form.querySelector('[name='+inp.dataset.img+']').value=url;
              var p=inp.closest('.field').querySelector('.img-prev');
              p.style.backgroundImage="url('"+url+"')";
              p.classList.remove('hidden');
            }).catch(function(){UI.toast('Не удалось обработать изображение','err')});
          });
        });
        form.addEventListener('submit',function(e){
          e.preventDefault();
          var out={};
          var ok=true;
          fields.forEach(function(f){
            if(f.type==='days'){
              var checked=[].slice.call(form.querySelectorAll('[name="'+f.k+'"]:checked')).map(function(x){return +x.value});
              out[f.k]=checked;
              if(f.required&&!checked.length){ok=false;form.querySelector('[data-f="'+f.k+'"]').classList.add('err')}
              return;
            }
            var el=form.querySelector('[name="'+f.k+'"]');
            if(!el)return;
            var v=f.type==='checkbox'?el.checked:el.value;
            if(f.type==='tags')v=String(v).split(',').map(function(s){return s.trim()}).filter(Boolean);
            if(f.type==='number')v=v===''?0:Number(v);
            if(f.required&&(v===''||v==null||(Array.isArray(v)&&!v.length))){
              ok=false;
              var w=el.closest('.field');
              if(w)w.classList.add('err');
            }
            out[f.k]=v;
          });
          if(!ok){UI.toast('Заполните обязательные поля','err');return}
          submit(out,close);
        });
        setTimeout(function(){var t=form.querySelector('input,textarea,select');if(t)t.focus()},60);
      }
    });
  },

  empty:function(title,text,btn){
    var btnHtml=btn?'<button class="btn soft mt8" data-act="add">'+icon('plus')+' '+esc(btn)+'</button>':'';
    return '<div class="empty">'+icon('grid')+'<b>'+esc(title)+'</b><span class="small">'+esc(text||'')+'</span>'+btnHtml+'</div>';
  },

  bar:function(p,cls){
    cls=cls||'';
    var w=Math.max(0,Math.min(100,p));
    return '<div class="bar '+cls+'"><i style="width:'+w+'%"></i></div>';
  }
};

const Views={},Schemas={},viewState={};
const CATS=['Учёба','Работа','Здоровье','Дом','Семья','Спорт','Саморазвитие','Отдых','Другое'];
const catColor={'Учёба':'#7b6cf6','Работа':'#5aa9ff','Здоровье':'#3ddc97','Дом':'#ffbe55','Семья':'#f0a6b8','Спорт':'#22b8cf','Саморазвитие':'#a855f7','Отдых':'#8fb996','Другое':'#8b96b5'};
const PRIO={high:{l:'Высокий',c:'var(--danger)'},med:{l:'Средний',c:'var(--warn)'},low:{l:'Низкий',c:'var(--ok)'}};
const GOAL_STATUS={someday:'Когда-нибудь',plan:'Запланировано',process:'В процессе',pause:'Приостановлено',done:'Выполнено'};
const BOOK_STATUS={want:'Хочу прочитать',reading:'Читаю',read:'Прочитано',paused:'Отложено',fav:'Избранное'};
const MEDIA_STATUS={want:'Хочу посмотреть',watching:'Смотрю',watched:'Просмотрено',fav:'Избранное'};

const FORM_OVERRIDES={};

function collectionView(key,el){
  var s=Schemas[key];
  var st=viewState[key]||(viewState[key]={q:'',f:{},sort:'new'});
  var toolsHtml=(s.tools||[]).map(function(t){
    return '<button class="btn ghost" data-tool="'+t.id+'">'+icon(t.icon)+' '+esc(t.label)+'</button>';
  }).join('');
  var filtersHtml=(s.filters||[]).map(function(f){
    var opts=f.options.map(function(o){
      var sel=String(st.f[f.k])===String(o.v)?'selected':'';
      return '<option value="'+esc(o.v)+'" '+sel+'>'+esc(o.label)+'</option>';
    }).join('');
    return '<select class="inp sm" data-f="'+f.k+'"><option value="">'+esc(f.label)+': все</option>'+opts+'</select>';
  }).join('');
  var sorts=(s.sorts||[{v:'new',l:'Сначала новые'},{v:'old',l:'Сначала старые'}]);
  var sortHtml=sorts.map(function(o){
    var sel=st.sort===o.v?'selected':'';
    return '<option value="'+o.v+'" '+sel+'>'+esc(o.l)+'</option>';
  }).join('');
  el.innerHTML='<div class="page-head"><div class="grow"><h2>'+esc(s.name)+'</h2><p>'+esc(s.desc||'')+'</p></div><div class="row gap8 wrap">'+toolsHtml+'<button class="btn primary" data-act="add">'+icon('plus')+' '+esc(s.add||'Добавить')+'</button></div></div><div class="toolbar"><input class="inp sm grow" id="cq" placeholder="Поиск…" value="'+esc(st.q)+'" style="min-width:150px">'+filtersHtml+'<select class="inp sm" id="csort">'+sortHtml+'</select></div><div class="'+(s.layout||'grid')+'" id="cgrid"></div>';
  var grid=el.querySelector('#cgrid');
  function draw(){
    var items=Store.get(key).slice();
    if(st.q){
      var q=st.q.toLowerCase();
      items=items.filter(function(i){
        return Object.values(i).some(function(v){return typeof v==='string'&&v.toLowerCase().indexOf(q)!==-1});
      });
    }
    (s.filters||[]).forEach(function(f){
      if(st.f[f.k])items=items.filter(function(i){return String(i[f.k])===String(st.f[f.k])});
    });
    var S=st.sort;
    items.sort(function(a,b){
      if(S==='new')return (b.created||'').localeCompare(a.created||'');
      if(S==='old')return (a.created||'').localeCompare(b.created||'');
      if(S==='az')return String(a.title||a.name||'').localeCompare(String(b.title||b.name||''));
      if(S==='date')return String(a.date||a.due||a.deadline||'').localeCompare(String(b.date||b.due||b.deadline||''));
      if(typeof s.sortFn==='function')return s.sortFn(a,b);
      return 0;
    });
    if(s.prepare)items=s.prepare(items);
    if(items.length){
      grid.innerHTML=items.map(function(i){return '<div data-id="'+i.id+'">'+s.card(i)+'</div>'}).join('');
    }else{
      grid.innerHTML=UI.empty(s.emptyT||'Пока пусто',s.emptyD||'Добавьте первую запись.',s.add||'Добавить');
    }
  }
  draw();
  el.querySelector('#cq').oninput=function(e){st.q=e.target.value;draw()};
  el.querySelector('#csort').onchange=function(e){st.sort=e.target.value;draw()};
  el.querySelectorAll('[data-f]').forEach(function(sel){sel.onchange=function(e){st.f[sel.dataset.f]=e.target.value;draw()}});
  (s.tools||[]).forEach(function(t){
    var b=el.querySelector('[data-tool="'+t.id+'"]');
    if(b&&t.onClick)b.onclick=function(){t.onClick(el,draw)};
  });
  el.addEventListener('click',function(e){
    var b=e.target.closest('[data-act]');
    if(!b)return;
    var host=e.target.closest('[data-id]');
    var id=host&&host.dataset.id;
    var act=b.dataset.act;
    if(act==='add'){openItemForm(key,null,draw);return}
    var item=Store.find(key,id);
    if(!item)return;
    if(act==='edit'){openItemForm(key,item,draw);return}
    if(act==='del'){
      var itemName=item.title||item.name||'запись';
      UI.confirm('Удалить «'+itemName+'»? Действие нельзя отменить.').then(function(ok){
        if(ok){
          var backup=JSON.parse(JSON.stringify(item));
          Store.remove(key,id);
          UI.toast('Удалено','ok',5000,{label:'Отменить',onClick:function(){
            Store.add(key,backup);App.refresh();
          }});
        }
      });
      return;
    }
    if(s.onAction)s.onAction(act,item,draw,e);
  });
  return draw;
}

function openItemForm(key,item,after){
  if(FORM_OVERRIDES[key]) return FORM_OVERRIDES[key](item,after);
  var s=Schemas[key];
  var title=(item?'Редактировать':'Добавить')+' — '+s.name.toLowerCase();
  UI.form({title:title,fields:s.fields,width:s.width||620,values:item||s.defaults||{},
    submit:function(v,close){
      if(item)Store.update(key,item.id,v);else Store.add(key,v);
      close();UI.toast(item?'Сохранено':'Добавлено');App.refresh();
      if(after)after();
      if(s.after)s.after(item||Store.get(key)[0],v);
    }
  });
}

const App={
  current:'',
  boot:function(){
    Store.load();
    this.applySettings();
    this.buildChrome();
    this.bindGlobal();
    var hash=location.hash.replace('#/','')||'home';
    this.go(hash);
    var self=this;
    setInterval(function(){self.tickClock()},1000);
    this.tickClock();
    window.addEventListener('hashchange',function(){
      self.go(location.hash.replace('#/','')||'home');
    });
    window.addEventListener('beforeunload',function(){Store.flush()});
  },
  applySettings:function(){
    var s=Store.st(),r=document.documentElement;
    r.dataset.theme=s.theme;
    r.dataset.mode=s.mode;
    r.dataset.size=s.size;
    r.dataset.density=s.density;
    r.dataset.font=s.font;
    r.dataset.anim=s.animations?'on':'off';
    r.style.setProperty('--radius',(s.radius||16)+'px');
    r.style.setProperty('--r-sm',Math.round((s.radius||16)*.62)+'px');
    var c=s.colors||{};
    [['--primary',c.primary],['--accent',c.accent],['--bg',c.bg],['--card',c.card],['--text',c.text]].forEach(function(pair){
      var k=pair[0],v=pair[1];
      if(v)r.style.setProperty(k,v);else r.style.removeProperty(k);
    });
    if(c.primary)r.style.setProperty('--primary-soft',c.primary+'22');
    document.body.dataset.ready='1';
  },
  go:function(id){
    if(!Views[id])id='home';
    if(this.current===id && location.hash==='#/'+id) return;
    this.current=id;
    if(location.hash!=='#/'+id) history.replaceState(null,'','#/'+id);
    var sec=SECTIONS.find(function(x){return x.id===id});
    document.getElementById('viewTitle').textContent=sec?sec.label:'LIFE OS';
    document.getElementById('viewSub').textContent=(sec&&sec.sub)?sec.sub:'';
    document.querySelectorAll('.nav-i').forEach(function(b){b.classList.toggle('active',b.dataset.id===id)});
    document.querySelectorAll('.mnav button').forEach(function(b){b.classList.toggle('on',b.dataset.id===id)});
    var v=document.getElementById('view');
    v.innerHTML='';
    try{Views[id](v)}catch(e){console.error(e);v.innerHTML=UI.empty('Не удалось открыть раздел',String(e.message||e))}
    window.scrollTo({top:0,behavior:'auto'});
    document.getElementById('sidebar').classList.remove('open');
  },
  refresh:function(){
    var id=this.current||'home';
    this.current='';
    this.go(id);
    this.badges();
    if(typeof renderNav==='function')renderNav();
  },
  saveRefresh:function(){Store.save();this.refresh()},
  tickClock:function(){
    var d=new Date(),s=Store.st();
    var hh=d.getHours();
    var am=hh<12;
    if(s.timeFormat==='12h')hh=((hh+11)%12)+1;
    var t=pad2(hh)+':'+pad2(d.getMinutes())+(s.timeFormat==='12h'?(am?' ДП':' ПП'):'')+':'+pad2(d.getSeconds());
    var c=document.getElementById('clock');
    if(c)c.textContent=t+' · '+D.dowName(D.today())+', '+D.long(D.today());
  },
  buildChrome:function(){
    renderNav();
    this.buildMobile();
    document.getElementById('bellBtn').innerHTML=icon('bell')+'<span class="dot badge-n hidden" id="bellDot"></span>';
    document.getElementById('menuBtn').innerHTML=icon('menu');
    document.getElementById('pomoBtn').innerHTML=icon('clock')+' Таймер концентрации';
    document.getElementById('themeQuick').innerHTML=icon('sun')+' Сменить тему';
    document.querySelector('.search .s-ico').innerHTML=icon('search');
    this.avatar();
    this.badges();
  },
  avatar:function(){
    var s=Store.st(),b=document.getElementById('avatarBtn');
    var ini=s.name.trim().split(/\s+/).map(function(w){return w[0]}).slice(0,2).join('').toUpperCase()||'Я';
    b.innerHTML=s.avatar?'<img src="'+s.avatar+'" alt="">':ini;
  },
  buildMobile:function(){
    var m=document.getElementById('mnav');
    var pick=['home','tasks','habits','calendar'];
    var html=pick.map(function(id){
      var s=SECTIONS.find(function(x){return x.id===id});
      return '<button data-id="'+id+'">'+icon(s.icon)+'<span>'+(s.short||s.label)+'</span></button>';
    }).join('')+'<button data-id="__more">'+icon('menu')+'<span>Ещё</span></button>';
    m.innerHTML=html;
    m.onclick=function(e){
      var b=e.target.closest('button');
      if(!b)return;
      if(b.dataset.id==='__more'){document.getElementById('sidebar').classList.add('open');return}
      App.go(b.dataset.id);
    };
  },
  bindGlobal:function(){
    document.getElementById('menuBtn').onclick=function(){document.getElementById('sidebar').classList.toggle('open')};
    document.getElementById('avatarBtn').onclick=function(){App.go('settings')};
    document.getElementById('themeQuick').onclick=function(){App.go('settings')};
    document.getElementById('pomoBtn').onclick=function(){Pomo.toggle()};
    document.getElementById('bellBtn').onclick=function(e){e.stopPropagation();Notif.toggle()};
    document.getElementById('qaBtn').onclick=function(){QuickAdd.open()};
    document.addEventListener('click',function(e){
      var p=document.getElementById('notifPanel');
      if(!p.classList.contains('hidden')&&!p.contains(e.target)&&!e.target.closest('#bellBtn'))p.classList.add('hidden');
    });
    var g=document.getElementById('gsearch'),res=document.getElementById('gres');
    g.oninput=function(){
      var q=g.value.trim();
      if(q.length<2){res.classList.add('hidden');return}
      var out=App.search(q);
      if(out.length){
        res.innerHTML=out.slice(0,14).map(function(r){
          return '<div class="gres-i" data-go="'+r.go+'" data-id="'+r.id+'">'+icon(r.icon)+'<span class="ell grow">'+esc(r.title)+'</span><small>'+esc(r.where)+'</small></div>';
        }).join('');
      }else{
        res.innerHTML='<div class="gres-i muted">Ничего не найдено</div>';
      }
      res.classList.remove('hidden');
    };
    res.onclick=function(e){
      var i=e.target.closest('.gres-i');
      if(!i||!i.dataset.go)return;
      res.classList.add('hidden');
      g.value='';
      App.go(i.dataset.go);
    };
    document.addEventListener('click',function(e){if(!e.target.closest('.search'))res.classList.add('hidden')});
  },
  search:function(q){
    q=q.toLowerCase();
    var out=[];
    function push(key,where,go,ic,tf){
      Store.get(key).forEach(function(i){
        var t=tf?tf(i):(i.title||i.name||'');
        if(t&&String(t).toLowerCase().indexOf(q)!==-1)out.push({title:t,where:where,go:go,id:i.id,icon:ic});
      });
    }
    push('tasks','Задачи','tasks','check',function(i){return i.title+' '+(i.desc||'')});
    push('notes','Заметки','notes','pen',function(i){return i.title+' '+(i.body||'').replace(/<[^>]+>/g,' ')});
    push('books','Книги','books','book',function(i){return i.title+' — '+i.author+' '+(i.quotes||'')});
    push('goals','Цели','goals','target',function(i){return i.title+' '+(i.desc||'')});
    push('habits','Привычки','habits','flame');
    push('media','Медиатека','media','film');
    push('wishes','Желания','wishes','star');
    push('people','Семья','family','users');
    push('sports','Тренировки','sport','dumbbell',function(i){return i.title+' · '+i.type+' '+(i.notes||'')});
    push('finance','Финансы','finance','wallet',function(i){return i.title+' · '+money(i.amount)});
    push('homework','Учёба','edu','edu');
    push('purchases','Покупки','shopping','cart');
    return out;
  },
  imgToDataURL:function(file,max){
    return new Promise(function(res,rej){
      var r=new FileReader();
      r.onload=function(){
        var img=new Image();
        img.onload=function(){
          var k=Math.min(1,max/Math.max(img.width,img.height));
          var c=document.createElement('canvas');
          c.width=Math.round(img.width*k);
          c.height=Math.round(img.height*k);
          c.getContext('2d').drawImage(img,0,0,c.width,c.height);
          res(c.toDataURL('image/jpeg',.82));
        };
        img.onerror=rej;
        img.src=r.result;
      };
      r.onerror=rej;
      r.readAsDataURL(file);
    });
  },
  notifications:function(){
    var t=D.today(),out=[];
    Store.get('tasks').forEach(function(x){
      if(taskDone(x,t))return;
      if(taskActiveOn(x,t))out.push({t:'Сегодня: '+x.title,go:'tasks',ic:'check',c:'var(--primary)'});
      else if(x.date&&x.date<t&&x.repeat==='none')out.push({t:'Просрочено: '+x.title,go:'tasks',ic:'alert',c:'var(--danger)'});
    });
    Store.get('habits').filter(function(h){return !h.archived}).forEach(function(h){
      if(habitDueOn(h,t)&&!((h.log||{})[t]))out.push({t:'Привычка не отмечена: '+h.title,go:'habits',ic:'flame',c:'var(--warn)'});
    });
    Store.get('people').forEach(function(p){
      var nx=nextBirthday(p.birth);
      if(nx){var dl=D.diff(t,nx);if(dl>=0&&dl<=14)out.push({t:'День рождения: '+p.name+' — через '+dl+' дн.',go:'family',ic:'gift',c:'var(--accent)'})}
    });
    Store.get('goals').forEach(function(g){
      if(g.deadline&&g.status!=='done'){var dl=D.diff(t,g.deadline);if(dl>=0&&dl<=14)out.push({t:'Дедлайн цели: '+g.title+' — '+dl+' дн.',go:'goals',ic:'target',c:'var(--warn)'})}
    });
    Store.get('pantry').forEach(function(p){
      if(p.expiry){var dl=D.diff(t,p.expiry);if(dl>=0&&dl<=5)out.push({t:'Заканчивается срок: '+p.name+' ('+dl+' дн.)',go:'shopping',ic:'alert',c:'var(--danger)'})}
    });
    Store.get('homework').forEach(function(h){
      if(!h.done&&h.due){var dl=D.diff(t,h.due);if(dl>=0&&dl<=3)out.push({t:(h.type==='exam'?'Экзамен':'Задание')+': '+h.title+' — '+dl+' дн.',go:'edu',ic:'edu',c:'var(--warn)'})}
    });
    var lim=(Store.st().budget&&Store.st().budget.limits)||{};
    Object.keys(lim).forEach(function(c){
      var sp=monthSpend(c);
      if(lim[c]>0&&sp>=lim[c]*.8)out.push({t:'Лимит «'+c+'» почти выбран: '+money(sp)+' из '+money(lim[c]),go:'finance',ic:'wallet',c:'var(--danger)'});
    });
    return out;
  },
  badges:function(){
    var n=this.notifications().length;
    var d=document.getElementById('bellDot');
    if(d){d.classList.toggle('hidden',!n);d.textContent=n>9?'9+':n}
  }
};

const Notif={
  toggle:function(){
    var p=document.getElementById('notifPanel');
    if(p.classList.contains('hidden')){this.render();p.classList.remove('hidden')}else p.classList.add('hidden');
  },
  render:function(){
    var p=document.getElementById('notifPanel');
    var list=App.notifications();
    var listHtml;
    if(list.length){
      listHtml='<div class="list">'+list.map(function(n){
        return '<div class="li" data-go="'+n.go+'" style="cursor:pointer"><span style="color:'+n.c+';display:flex">'+icon(n.ic)+'</span><span class="grow small">'+esc(n.t)+'</span>'+icon('arrow')+'</div>';
      }).join('')+'</div>';
    }else{
      listHtml=UI.empty('Всё спокойно','Нет напоминаний и дедлайнов.');
    }
    p.innerHTML='<h4>Уведомления</h4>'+listHtml;
    p.onclick=function(e){
      var i=e.target.closest('[data-go]');
      if(!i)return;
      p.classList.add('hidden');
      App.go(i.dataset.go);
    };
  }
};

const QuickAdd={
  open:function(){
    var items=[['task','Задача','check'],['habit','Отметить привычку','flame'],['note','Заметка','pen'],['sport','Тренировка','dumbbell'],['expense','Расход','wallet'],['income','Доход','wallet'],['event','Событие','calendar']];
    var menuHtml=items.map(function(i){
      return '<button data-q="'+i[0]+'">'+icon(i[2])+' '+i[1]+'</button>';
    }).join('');
    UI.modal({title:'Быстрое добавление',width:420,
      body:'<div class="qa-menu">'+menuHtml+'</div>',
      onMount:function(root,close){
        root.querySelector('.qa-menu').onclick=function(e){
          var b=e.target.closest('[data-q]');
          if(!b)return;
          close();
          var k=b.dataset.q;
          var t=D.today();
          if(k==='task')openItemForm('tasks',null);
          if(k==='note')openItemForm('notes',null);
          if(k==='sport')openItemForm('sports',null);
          if(k==='event')openItemForm('events',null);
          if(k==='expense')openItemForm('finance',{type:'expense',date:t});
          if(k==='income')openItemForm('finance',{type:'income',date:t});
          if(k==='habit'){
            var hs=Store.get('habits').filter(function(h){return !h.archived});
            if(!hs.length)return UI.toast('Сначала создайте привычку','warn');
            var opts=hs.map(function(h){return {v:h.id,label:h.icon+' '+h.title}});
            UI.form({title:'Отметить привычку',width:420,submitText:'Отметить',
              fields:[{k:'hid',label:'Привычка',type:'select',required:true,options:opts},{k:'date',label:'Дата',type:'date',required:true}],
              values:{date:t,hid:hs[0].id},
              submit:function(v,c){
                var h=Store.find('habits',v.hid);
                if(!h)return c();
                if(D.future(v.date))return UI.toast('Нельзя отметить будущую дату','err');
                h.log=Object.assign({},h.log);
                h.log[v.date]=true;
                Store.update('habits',h.id,{log:h.log});
                c();UI.toast('Отмечено!');App.refresh();
              }
            });
          }
        };
      }
    });
  }
};

const Pomo={
  t:0,run:false,timer:null,mode:'work',
  cfg:function(){return Store.st().pomodoro||{work:25,short:5,long:15,cycles:4}},
  toggle:function(){
    var el=document.getElementById('pomo');
    if(el.classList.contains('hidden')){this.render();el.classList.remove('hidden')}else{el.classList.add('hidden');this.stop()}
  },
  total:function(){return (this.mode==='work'?this.cfg().work:this.cfg().short)*60},
  render:function(){
    var el=document.getElementById('pomo');
    var modeLabel=this.mode==='work'?'Фокус':'Перерыв';
    var dash=2*Math.PI*58;
    el.innerHTML='<div class="row spread"><b>'+modeLabel+'</b><button class="btn icon ghost" data-x="close">'+icon('x')+'</button></div>'+
      '<div class="pomo-ring"><svg width="132" height="132"><circle cx="66" cy="66" r="58" fill="none" stroke="var(--hover)" stroke-width="9"/><circle id="pring" cx="66" cy="66" r="58" fill="none" stroke="var(--primary)" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+dash+'" stroke-dashoffset="0"/></svg><div class="pomo-t" id="ptext">00:00</div></div>'+
      '<div class="row gap8 center"><button class="btn primary" data-x="toggle">'+icon(this.run?'pause':'play')+' '+(this.run?'Пауза':'Старт')+'</button><button class="btn ghost" data-x="reset">'+icon('refresh')+'</button></div>'+
      '<div class="tiny muted mt8" style="text-align:center">Настройка интервалов — в разделе «Настройки»</div>';
    el.querySelector('[data-x=close]').onclick=function(){this.toggle()}.bind(this);
    el.querySelector('[data-x=toggle]').onclick=function(){this.run?this.pause():this.start()}.bind(this);
    el.querySelector('[data-x=reset]').onclick=function(){this.stop();this.t=this.total();this.paint();this.render()}.bind(this);
    if(!this.t)this.t=this.total();
    this.paint();
  },
  start:function(){
    if(this.run)return;
    this.run=true;
    var self=this;
    this.timer=setInterval(function(){self.t--;if(self.t<=0){self.t=0;self.next()}self.paint()},1000);
    this.render();
  },
  pause:function(){this.run=false;clearInterval(this.timer);this.render()},
  stop:function(){this.run=false;clearInterval(this.timer)},
  next:function(){
    this.stop();
    var c=this.cfg();
    this.mode=this.mode==='work'?'short':'work';
    this.t=(this.mode==='work'?c.work:c.short)*60;
    UI.toast(this.mode==='work'?'Время работать!':'Перерыв — отдохни','ok',4000);
    this.render();
  },
  paint:function(){
    var p=document.getElementById('ptext'),r=document.getElementById('pring');
    if(!p)return;
    var m=Math.floor(this.t/60),s=this.t%60;
    p.textContent=pad2(m)+':'+pad2(s);
    if(r){var C=2*Math.PI*58;r.setAttribute('stroke-dashoffset',C*(1-this.t/this.total()))}
  }
};

document.addEventListener('DOMContentLoaded',function(){App.boot()});