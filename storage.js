'use strict';
const LS_KEY='lifeos.v1';
const ALL_KEYS=['habits','tasks','sports','goals','books','purchases','pantry','meals','people','events','finance','savings','subjects','homework','wishes','notes','diary','media','achievements'];

const uid=function(p){p=p||'x';return p+'_'+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4)};
const pad2=function(n){return String(n).padStart(2,'0')};
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MON_N=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DOW=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const DOW_S=['вс','пн','вт','ср','чт','пт','сб'];

const D={
  ymd:function(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())},
  today:function(){return this.ymd(new Date())},
  parse:function(s){var p=String(s||'').split('-');return new Date(+p[0]||2000,(+p[1]||1)-1,+p[2]||1)},
  add:function(s,n){var d=this.parse(s);d.setDate(d.getDate()+n);return this.ymd(d)},
  diff:function(a,b){return Math.round((this.parse(b)-this.parse(a))/864e5)},
  dow:function(s){return this.parse(s).getDay()},
  future:function(s){return this.diff(this.today(),s)>0},
  past:function(s){return this.diff(this.today(),s)<0},
  long:function(s){var d=this.parse(s);return d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear()},
  short:function(s){var d=this.parse(s);return pad2(d.getDate())+'.'+pad2(d.getMonth()+1)+'.'+d.getFullYear()},
  dowName:function(s,sh){var w=this.dow(s);return sh?DOW_S[w]:DOW[w]},
  mk:function(s){return String(s).slice(0,7)},
  monthName:function(k){return MON_N[+String(k).slice(5,7)-1]+' '+String(k).slice(0,4)},
  monthDays:function(k){var y=+k.slice(0,4),m=+k.slice(5,7),n=new Date(y,m,0).getDate();return Array.from({length:n},function(_,i){return k+'-'+pad2(i+1)})},
  week:function(s,ws){var d=this.parse(s),st=this.add(s,-((d.getDay()-ws+7)%7));return Array.from({length:7},function(_,i){return this.add(st,i)}.bind(this))},
  inRange:function(day,a,b){return day>=a&&day<=b}
};

function money(n){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(n)||0))+' ₽'}
function num(n){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(n)||0))}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function pct(a,b){return b>0?Math.round(a/b*100):0}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function cssVar(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#888'}

const Store={
  data:null,
  _timer:null,

  defaults:function(){
    return {
      version:1,demo:false,created:D.today(),
      settings:{
        name:'Пользователь',avatar:'',
        theme:'midnight',mode:'dark',colors:{primary:'',accent:'',bg:'',card:'',text:''},
        radius:16,size:'md',density:'cozy',font:'system',animations:true,
        timeFormat:'24h',weekStart:1,workStart:9,workEnd:19,
        hidden:[],order:[],homeOrder:['day','habits','goals','finance','sport','books','events','notes'],homeHidden:[],
        pomodoro:{work:25,short:5,long:15,cycles:4},
        budget:{month:0,limits:{}},sportGoal:3,readGoalYear:12,foodBudget:0
      },
      balance:{Карьера:6,Здоровье:6,Отношения:6,Финансы:5,Развитие:6,Отдых:5,Окружение:5,Духовность:5}
    };
  },

  _ensure:function(){
    if(!this.data || typeof this.data!=='object') this.data=this.defaults();
    if(!this.data.settings) this.data.settings=this.defaults().settings;
    if(!this.data.balance) this.data.balance=this.defaults().balance;
    for(var i=0;i<ALL_KEYS.length;i++){
      var k=ALL_KEYS[i];
      if(!Array.isArray(this.data[k])) this.data[k]=[];
    }
  },

  load:function(){
    var self=this;
    var raw=null;
    try{ raw=localStorage.getItem(LS_KEY); }catch(e){ console.error('localStorage недоступен',e); }

    self.data=self.defaults();

    if(raw){
      try{
        var p=JSON.parse(raw);
        if(p && typeof p==='object'){
          ALL_KEYS.forEach(function(k){ if(Array.isArray(p[k])) self.data[k]=p[k]; });
          if(p.balance) self.data.balance=Object.assign(self.data.balance,p.balance);
          if(p.settings){
            self.data.settings=Object.assign(self.data.settings,p.settings);
            self.data.settings.colors=Object.assign({primary:'',accent:'',bg:'',card:'',text:''},p.settings.colors||{});
          }
          self.data.demo=!!p.demo;
          self.data.version=p.version||1;
        }
      }catch(e){
        console.error('Ошибка разбора данных:',e);
        self.data=self.defaults();
        if(typeof UI!=='undefined') UI.toast('Данные повреждены — загружены настройки по умолчанию','err');
      }
    }

    self._ensure();

    if(!raw){
      try{ self.seedDemo(); self.flush(); }catch(e){ console.error('seedDemo error',e); }
    }
  },

  save:function(){
    if(this._timer) clearTimeout(this._timer);
    var self=this;
    this._timer=setTimeout(function(){self.flush()},250);
  },

  flush:function(){
    if(this._timer){clearTimeout(this._timer);this._timer=null;}
    try{
      this._ensure();
      localStorage.setItem(LS_KEY,JSON.stringify(this.data));
    }catch(e){
      console.error(e);
      if(typeof UI!=='undefined') UI.toast('Не удалось сохранить: хранилище переполнено','err');
    }
  },

  get:function(k){
    if(!this.data) this.data=this.defaults();
    if(!Array.isArray(this.data[k])) this.data[k]=[];
    return this.data[k];
  },

  set:function(k,v){ if(!this.data)this.data=this.defaults(); this.data[k]=v; this.save(); },

  find:function(k,id){ return this.get(k).find(function(x){return x.id===id}); },

  add:function(k,obj){
    var it=Object.assign({id:uid(k.slice(0,3)),created:D.today()},obj);
    this.get(k).unshift(it);
    this.save();
    return it;
  },

  update:function(k,id,patch){
    var arr=this.get(k);
    var i=arr.findIndex(function(x){return x.id===id});
    if(i<0)return null;
    arr[i]=Object.assign({},arr[i],patch);
    this.save();
    return arr[i];
  },

  remove:function(k,id){
    this.data[k]=this.get(k).filter(function(x){return x.id!==id});
    this.save();
  },

  st:function(){ if(!this.data)this.data=this.defaults(); return this.data.settings; },

  seedDemo:function(){
    var self=this;
    self._ensure();
    var t=D.today();
    var H=[{title:'Читать каждый день',icon:'📖',color:'#7b6cf6',freq:'daily'},
           {title:'Пить 2 литра воды',icon:'💧',color:'#22b8cf',freq:'daily'},
           {title:'Делать зарядку',icon:'🤸',color:'#3ddc97',freq:'weekdays'}];
    H.forEach(function(h,i){
      var log={};
      for(var k=1;k<=6;k++){ if(!(i===2&&k===2)) log[D.add(t,-k)]=true; }
      if(i===0) log[t]=true;
      self.add('habits',Object.assign({log:log,demo:true},h));
    });
    var taskData=[
      ['Утренняя планёрка','Рабочие вопросы дня','work','high',0,'09:30','10:00'],
      ['Прочитать главу учебника','Английский, unit 5','study','med',0,'18:00','19:00'],
      ['Купить продукты','Молоко, хлеб, овощи','home','low',1,'',''],
      ['Созвон с семьёй','','Семья','med',2,'20:00','20:30']
    ];
    taskData.forEach(function(x){
      self.add('tasks',{title:x[0],desc:x[1],category:x[2],priority:x[3],date:D.add(t,x[4]),time:x[5],timeEnd:x[6],repeat:'none',done:false,main:x[4]===0,demo:true});
    });
    self.add('sports',{date:D.add(t,-2),type:'Бег',title:'Лёгкий кросс',duration:32,distance:5,sets:[],notes:'Пульс спокойный',demo:true});
    self.add('sports',{date:D.add(t,-1),type:'Силовая',title:'Верх тела',duration:45,distance:0,sets:[{ex:'Жим лёжа',reps:'4×8',weight:'60 кг'},{ex:'Тяга блока',reps:'3×12',weight:'45 кг'}],notes:'',demo:true});
    self.add('goals',{title:'Выучить английский до B2',category:'Образование',deadline:D.add(t,180),priority:'high',status:'process',progress:35,budget:0,color:'#7b6cf6',demo:true,desc:'Регулярная практика.',stages:[{id:uid('s'),title:'Повторить времена',done:true},{id:uid('s'),title:'500 новых слов',done:false}]});
    self.add('goals',{title:'Пробежать полумарафон',category:'Спорт',deadline:D.add(t,120),priority:'med',status:'process',progress:20,color:'#3ddc97',demo:true,desc:'План 3 раза в неделю.',stages:[{id:uid('s'),title:'Пробежать 10 км',done:true}]});
    self.add('goals',{title:'Отложить на отпуск',category:'Финансы',deadline:D.add(t,240),priority:'med',status:'plan',progress:0,budget:120000,color:'#ffbe55',demo:true,desc:'По 10 000 в месяц.',stages:[]});
    self.add('books',{title:'Атомные привычки',author:'Джеймс Клир',genre:'Саморазвитие',pages:320,read:198,status:'reading',start:D.add(t,-12),rating:0,review:'',quotes:'Вы не поднимаетесь до уровня целей — вы опускаетесь до уровня систем.',cover:'',demo:true});
    self.add('books',{title:'Мастер и Маргарита',author:'М. Булгаков',genre:'Классика',pages:480,read:480,status:'read',finish:D.add(t,-52),rating:5,review:'Вечная книга.',quotes:'',cover:'',demo:true});
    self.add('books',{title:'Думай медленно… решай быстро',author:'Даниэль Канеман',genre:'Психология',pages:608,read:0,status:'want',rating:0,review:'',quotes:'',cover:'',demo:true});
    self.add('books',{title:'Гибкое сознание',author:'Кэрол Дуэк',genre:'Психология',pages:288,read:288,status:'read',finish:D.add(t,-20),rating:4,review:'',quotes:'',cover:'',demo:true});
    [['Молоко','2','л',120,'Продукты'],['Хлеб','1','шт',55,'Продукты'],['Яблоки','1','кг',180,'Продукты'],['Стиральный порошок','1','шт',340,'Быт'],['Кофе','1','уп',520,'Продукты']].forEach(function(x){
      self.add('purchases',{name:x[0],qty:x[1],unit:x[2],price:x[3],category:x[4],shop:'Пятёрочка',status:'plan',demo:true});
    });
    self.add('pantry',{name:'Гречка',qty:2,unit:'кг',expiry:D.add(t,120),category:'Крупы',demo:true});
    self.add('pantry',{name:'Йогурт',qty:4,unit:'шт',expiry:D.add(t,4),category:'Молочное',demo:true});
    self.add('people',{name:'Мама',relation:'Мама',birth:D.add(t,9).replace(/^\d{4}/,String(new Date().getFullYear()-32)),interests:['Садоводство','Книги'],contact:'',notes:'',demo:true,gifts:[{id:uid('g'),title:'Плед и книга',budget:3000,bought:false}]});
    self.add('people',{name:'Брат',relation:'Брат',birth:'1996-'+D.add(t,41).slice(5),interests:['Велоспорт','Игры'],gifts:[{id:uid('g'),title:'Велофара',budget:2500,bought:false}],demo:true});
    self.add('people',{name:'Бабушка',relation:'Бабушка',birth:D.add(t,-15).replace(/^\d{4}/,'1948'),interests:['Вязание'],gifts:[],demo:true});
    self.add('events',{title:'Годовщина родителей',date:D.add(t,25),type:'anniv',note:'Забронировать столик',demo:true});
    self.add('finance',{type:'income',title:'Зарплата',amount:85000,category:'Зарплата',date:D.add(t,-3),account:'Основной',comment:'',demo:true});
    self.add('finance',{type:'expense',title:'Продукты',amount:6400,category:'Продукты',date:D.add(t,-2),account:'Основной',comment:'',demo:true});
    self.add('finance',{type:'expense',title:'Проездной',amount:2800,category:'Транспорт',date:D.add(t,-5),account:'Основной',comment:'',demo:true});
    self.add('finance',{type:'expense',title:'Подписка',amount:399,category:'Подписки',date:D.add(t,-8),account:'Основной',comment:'',demo:true});
    self.add('finance',{type:'income',title:'Подработка',amount:12000,category:'Подработка',date:D.add(t,-9),account:'Основной',comment:'',demo:true});
    self.add('savings',{title:'Подушка безопасности',target:150000,saved:42000,deadline:D.add(t,300),demo:true});
    self.add('subjects',{title:'Английский язык',color:'#7b6cf6',demo:true});
    self.add('subjects',{title:'Математика',color:'#ffbe55',demo:true});
    var subs=self.get('subjects');
    self.add('homework',{subjectId:subs[0].id,title:'Эссе (150 слов)',type:'hw',due:D.add(t,3),done:false,demo:true});
    self.add('homework',{subjectId:subs[1].id,title:'Контрольная: производные',type:'exam',due:D.add(t,10),done:false,demo:true});
    self.add('wishes',{title:'Механическая клавиатура',price:9500,priority:'med',category:'Техника',status:'want',link:'',date:'',desc:'',img:'',demo:true});
    self.add('notes',{title:'Идея: утренний ритуал',body:'<p>30 минут без телефона, вода, план дня на бумаге.</p>',tags:['идеи'],cat:'Идеи',favorite:true,pinned:true,demo:true});
    self.add('notes',{title:'Книжный список на год',body:'<ul><li>Канеман</li><li>Франкл</li><li>Толстой</li></ul>',tags:['книги'],cat:'Чтение',favorite:false,pinned:false,demo:true});
    self.add('media',{title:'Начало (Inception)',type:'movie',genre:'Фантастика',status:'watched',rating:5,review:'',notes:'',demo:true});
    self.add('media',{title:'Хабит-подкаст',type:'podcast',genre:'Саморазвитие',status:'watching',rating:0,review:'',notes:'',demo:true});
    self.data.demo=true;
  },

  clearDemo:function(){
    var self=this,n=0;
    ALL_KEYS.forEach(function(k){
      var before=self.get(k).length;
      self.data[k]=self.get(k).filter(function(x){return !x.demo});
      n+=before-self.data[k].length;
    });
    self.data.demo=false;
    self.flush();
    return n;
  },

  download:function(name,content,type){
    type=type||'text/plain;charset=utf-8';
    var b=content instanceof Blob?content:new Blob([content],{type:type});
    var u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download=name;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(u)},1500);
  },
  exportJSON:function(){this.flush();this.download('life-os-backup-'+D.today()+'.json',JSON.stringify(this.data,null,2),'application/json')},
  importJSON:function(file){
    var self=this;
    return new Promise(function(res,rej){
      var r=new FileReader();
      r.onload=function(){
        try{
          var p=JSON.parse(r.result);
          if(typeof p!=='object'||!p)throw 0;
          var d=self.defaults();
          ALL_KEYS.forEach(function(k){ if(Array.isArray(p[k])) d[k]=p[k]; });
          if(p.balance)d.balance=Object.assign(d.balance,p.balance);
          if(p.settings)d.settings=Object.assign(d.settings,p.settings);
          d.demo=!!p.demo;
          self.data=d;
          self._ensure();
          self.flush();
          res(true);
        }catch(e){rej(e)}
      };
      r.onerror=function(){rej(r.error)};
      r.readAsText(file);
    });
  },
  toCSV:function(key){
    var rows=this.get(key);
    if(!rows.length)return'';
    var cols=[...new Set(rows.flatMap(function(r){return Object.keys(r)}))];
    function cell(v){
      v=v==null?'':(typeof v==='object'?JSON.stringify(v):v);
      return '"'+String(v).replace(/"/g,'""')+'"';
    }
    return '\ufeff'+[cols.join(';')].concat(rows.map(function(r){return cols.map(function(c){return cell(r[c])}).join(';')})).join('\n');
  }
};