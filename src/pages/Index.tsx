import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/79f91ec9-db04-4dd9-932f-888cef480e1c";

// ─── Device ID ────────────────────────────────────────────────────────────────
function getDeviceId(): string {
  let id = localStorage.getItem("luna_device_id");
  if (!id) {
    id = "d_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("luna_device_id", id);
  }
  return id;
}

async function apiCall(method: "GET" | "POST", action: string, body?: object) {
  const deviceId = getDeviceId();
  const url = method === "GET"
    ? `${API_URL}/?action=${action}`
    : `${API_URL}/`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "X-Device-Id": deviceId },
    body: method === "POST" ? JSON.stringify({ action, ...body }) : undefined,
  });
  return res.json();
}

type Tab = "cycle" | "conceive" | "pregnancy";

// ─── Темы ────────────────────────────────────────────────────────────────────
interface Theme {
  id: string; name: string; bg: string; pregBg: string;
  primary: string; primaryFg: string; cardBg: string; border: string;
  chipActive: string; tabActive: string; preview: string; emoji: string;
}
const THEMES: Theme[] = [
  { id:"rose",     name:"Роза",     emoji:"🌸", bg:"linear-gradient(135deg,hsl(350,60%,97%),hsl(320,50%,96%),hsl(355,60%,96%))", pregBg:"linear-gradient(135deg,hsl(270,40%,97%),hsl(350,60%,96%),hsl(40,60%,97%))", primary:"hsl(340,65%,68%)", primaryFg:"#fff", cardBg:"rgba(255,255,255,0.82)", border:"rgba(255,182,193,0.35)", chipActive:"linear-gradient(135deg,hsl(340,65%,68%),hsl(335,55%,60%))", tabActive:"linear-gradient(135deg,hsl(340,65%,68%),hsl(335,55%,60%))", preview:"from-pink-200 to-rose-200" },
  { id:"lavender", name:"Лаванда",  emoji:"💜", bg:"linear-gradient(135deg,hsl(270,50%,97%),hsl(290,40%,96%),hsl(250,45%,96%))", pregBg:"linear-gradient(135deg,hsl(270,50%,96%),hsl(300,40%,96%))", primary:"hsl(270,55%,62%)", primaryFg:"#fff", cardBg:"rgba(255,255,255,0.85)", border:"rgba(200,170,240,0.35)", chipActive:"linear-gradient(135deg,hsl(270,55%,62%),hsl(280,50%,55%))", tabActive:"linear-gradient(135deg,hsl(270,55%,62%),hsl(280,50%,55%))", preview:"from-purple-200 to-violet-200" },
  { id:"peach",    name:"Персик",   emoji:"🍑", bg:"linear-gradient(135deg,hsl(25,80%,97%),hsl(15,70%,96%),hsl(35,75%,96%))", pregBg:"linear-gradient(135deg,hsl(25,80%,96%),hsl(350,60%,96%))", primary:"hsl(20,80%,62%)", primaryFg:"#fff", cardBg:"rgba(255,255,255,0.85)", border:"rgba(255,200,160,0.35)", chipActive:"linear-gradient(135deg,hsl(20,80%,62%),hsl(15,75%,55%))", tabActive:"linear-gradient(135deg,hsl(20,80%,62%),hsl(15,75%,55%))", preview:"from-orange-100 to-rose-200" },
  { id:"mint",     name:"Мята",     emoji:"🌿", bg:"linear-gradient(135deg,hsl(155,50%,96%),hsl(140,45%,95%),hsl(170,40%,96%))", pregBg:"linear-gradient(135deg,hsl(155,50%,96%),hsl(340,30%,96%))", primary:"hsl(155,50%,50%)", primaryFg:"#fff", cardBg:"rgba(255,255,255,0.85)", border:"rgba(150,220,190,0.35)", chipActive:"linear-gradient(135deg,hsl(155,50%,50%),hsl(145,48%,43%))", tabActive:"linear-gradient(135deg,hsl(155,50%,50%),hsl(145,48%,43%))", preview:"from-teal-100 to-green-200" },
  { id:"night",    name:"Ночь",     emoji:"🌙", bg:"linear-gradient(135deg,hsl(260,30%,10%),hsl(280,25%,12%),hsl(300,20%,10%))", pregBg:"linear-gradient(135deg,hsl(260,30%,10%),hsl(300,20%,12%))", primary:"hsl(310,60%,65%)", primaryFg:"#fff", cardBg:"rgba(40,25,50,0.85)", border:"rgba(180,100,200,0.25)", chipActive:"linear-gradient(135deg,hsl(310,60%,65%),hsl(290,55%,58%))", tabActive:"linear-gradient(135deg,hsl(310,60%,65%),hsl(290,55%,58%))", preview:"from-purple-900 to-slate-800" },
  { id:"cream",    name:"Нежность", emoji:"🤍", bg:"linear-gradient(135deg,hsl(40,60%,98%),hsl(350,40%,97%),hsl(30,50%,97%))", pregBg:"linear-gradient(135deg,hsl(40,60%,97%),hsl(270,30%,97%))", primary:"hsl(340,50%,60%)", primaryFg:"#fff", cardBg:"rgba(255,255,255,0.88)", border:"rgba(240,200,200,0.4)", chipActive:"linear-gradient(135deg,hsl(340,50%,60%),hsl(330,45%,53%))", tabActive:"linear-gradient(135deg,hsl(340,50%,60%),hsl(330,45%,53%))", preview:"from-rose-50 to-amber-50" },
];

// ─── Статика ──────────────────────────────────────────────────────────────────
const CYCLE_SYMPTOMS = ["Боль внизу живота","Головная боль","Вздутие","Усталость","Перепады настроения","Тошнота","Боль в груди","Раздражительность","Бессонница","Ломота в теле"];
const PREGNANCY_SYMPTOMS = ["Тошнота","Усталость","Токсикоз","Изжога","Боль в спине","Отёки","Частое мочеиспускание","Головокружение","Перепады настроения","Тяга к еде"];
const CYCLE_TIPS = [
  { phase:"Менструация",     tip:"Пейте больше воды и отдыхайте. Тепло поможет снять спазмы." },
  { phase:"Фолликулярная",   tip:"Отличное время для новых начинаний — энергия на подъёме!" },
  { phase:"Овуляция",        tip:"Пик фертильности. Обратите внимание на изменения выделений." },
  { phase:"Лютеиновая",      tip:"Больше магния поможет смягчить ПМС. Снизьте кофеин." },
];
const PREGNANCY_TIPS = [
  { week:"1–12 нед.",  tip:"Принимайте фолиевую кислоту и избегайте стресса." },
  { week:"13–26 нед.", tip:"Самый комфортный период. Начните курсы для беременных." },
  { week:"27–40 нед.", tip:"Готовьте сумку в роддом и следите за шевелениями малыша." },
];
const ARTICLES = [
  { title:"Как читать свой цикл",         tag:"Цикл",         emoji:"🌸" },
  { title:"Питание при ПМС",              tag:"Здоровье",     emoji:"🥗" },
  { title:"Признаки овуляции",            tag:"Фертильность", emoji:"🌿" },
  { title:"Первый триместр: что ожидать", tag:"Беременность", emoji:"👶" },
  { title:"Йога для беременных",          tag:"Активность",   emoji:"🧘" },
  { title:"Токсикоз: как справиться",     tag:"Симптомы",     emoji:"💊" },
];

// ─── Эмбрионы по неделям ─────────────────────────────────────────────────────
const EMBRYO_BY_WEEK: Record<number, string> = {
  4:"🫧", 5:"🫧", 6:"🫘", 7:"🐛", 8:"🐛", 9:"🦐", 10:"🦐",
  11:"🐟", 12:"🐟", 13:"🐸", 14:"🐸", 15:"🐣", 16:"🐣",
  17:"🐥", 18:"🐥", 19:"🐤", 20:"🐤", 21:"🐤", 22:"🍼",
  23:"🍼", 24:"🍼", 25:"👶", 26:"👶", 27:"👶", 28:"👶",
  29:"🧒", 30:"🧒", 31:"🧒", 32:"🧒", 33:"🧒", 34:"🧒",
  35:"👼", 36:"👼", 37:"👼", 38:"👼", 39:"👼", 40:"👶",
};

const PREGNANCY_WEEK_DATA: Record<number, { fruit: string; weight: string; size: string; dev: string }> = {
  4:  { fruit:"Черника",       weight:"< 1 г",  size:"1 мм",    dev:"Формируется нейронная трубка" },
  5:  { fruit:"Семечко",       weight:"< 1 г",  size:"2 мм",    dev:"Начинает биться сердечко" },
  6:  { fruit:"Горошина",      weight:"< 1 г",  size:"5 мм",    dev:"Закладываются ручки и ножки" },
  7:  { fruit:"Черника",       weight:"< 1 г",  size:"8 мм",    dev:"Формируется мозг и лицо" },
  8:  { fruit:"Виноград",      weight:"1 г",    size:"1.6 см",  dev:"Все органы заложены" },
  9:  { fruit:"Вишня",         weight:"2 г",    size:"2.3 см",  dev:"Малыш двигает ручками" },
  10: { fruit:"Клубника",      weight:"4 г",    size:"3 см",    dev:"Формируются зубки" },
  11: { fruit:"Лайм",          weight:"7 г",    size:"4 см",    dev:"Почки начинают работать" },
  12: { fruit:"Слива",         weight:"14 г",   size:"5.4 см",  dev:"Виден пол при УЗИ" },
  13: { fruit:"Персик",        weight:"23 г",   size:"7.4 см",  dev:"Малыш умеет сосать" },
  14: { fruit:"Лимон",         weight:"43 г",   size:"8.7 см",  dev:"Мимика лица" },
  16: { fruit:"Авокадо",       weight:"100 г",  size:"11.6 см", dev:"Слышит голоса" },
  18: { fruit:"Перец",         weight:"190 г",  size:"14.2 см", dev:"Активно шевелится" },
  20: { fruit:"Банан",         weight:"300 г",  size:"16.4 см", dev:"Половина пути!" },
  22: { fruit:"Кукуруза",      weight:"430 г",  size:"27 см",   dev:"Реагирует на звуки" },
  24: { fruit:"Кукуруза",      weight:"600 г",  size:"30 см",   dev:"Открывает глазки" },
  26: { fruit:"Кочан салата",  weight:"760 г",  size:"35 см",   dev:"Дышит амниотической жидкостью" },
  28: { fruit:"Баклажан",      weight:"1 кг",   size:"37 см",   dev:"Видит свет сквозь живот" },
  30: { fruit:"Брокколи",      weight:"1.3 кг", size:"40 см",   dev:"Накапливает жир" },
  32: { fruit:"Кокос",         weight:"1.7 кг", size:"42 см",   dev:"Мозг быстро развивается" },
  34: { fruit:"Ананас",        weight:"2.1 кг", size:"45 см",   dev:"Лёгкие почти готовы" },
  36: { fruit:"Кочан капусты", weight:"2.6 кг", size:"47 см",   dev:"Опускается в таз" },
  38: { fruit:"Тыква",         weight:"3 кг",   size:"49 см",   dev:"Готов к появлению на свет!" },
  40: { fruit:"Тыква",         weight:"3.4 кг", size:"51 см",   dev:"Ждём встречи! 👶" },
};

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
const MONTHS_FULL  = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const SHORT_DAYS   = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isSameDay(a: Date, b: Date) {
  return a.getDate()===b.getDate() && a.getMonth()===b.getMonth() && a.getFullYear()===b.getFullYear();
}
function getDaysInMonth(y: number, m: number) { return new Date(y, m+1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { const d=new Date(y,m,1).getDay(); return (d+6)%7; }
function getMondayOfWeek(date: Date): Date {
  const d=new Date(date); const day=d.getDay(); d.setDate(d.getDate()-((day+6)%7)); d.setHours(0,0,0,0); return d;
}
function addDays(date: Date, n: number): Date { const d=new Date(date); d.setDate(d.getDate()+n); return d; }
function getPregnancyWeekData(weeks: number) {
  const keys=Object.keys(PREGNANCY_WEEK_DATA).map(Number).sort((a,b)=>a-b);
  const key=keys.reduce((prev,cur)=>(cur<=weeks?cur:prev), keys[0]);
  return PREGNANCY_WEEK_DATA[key] ?? PREGNANCY_WEEK_DATA[4];
}
function getEmbryoEmoji(weeks: number): string {
  const keys=Object.keys(EMBRYO_BY_WEEK).map(Number).sort((a,b)=>a-b);
  const key=keys.reduce((prev,cur)=>(cur<=weeks?cur:prev), keys[0]);
  return EMBRYO_BY_WEEK[key] ?? "🫧";
}
function getCyclePhaseInfo(day: number|null) {
  if (!day||day<1) return null;
  if (day<=5)  return { phase:"Менструация",       color:"text-rose-500",   bg:"bg-rose-50 border-rose-200",     prob:2,  probLabel:"Очень низкая", bar:"bg-rose-400" };
  if (day<=9)  return { phase:"Фолликулярная",     color:"text-orange-500", bg:"bg-orange-50 border-orange-200", prob:10, probLabel:"Низкая",       bar:"bg-orange-400" };
  if (day<=11) return { phase:"Пред-овуляция",     color:"text-amber-600",  bg:"bg-amber-50 border-amber-200",   prob:30, probLabel:"Средняя",      bar:"bg-amber-400" };
  if (day<=16) return { phase:"Овуляция 🌿",       color:"text-green-600",  bg:"bg-green-50 border-green-200",   prob:85, probLabel:"Высокая!",     bar:"bg-green-500" };
  if (day<=21) return { phase:"Лютеиновая",        color:"text-teal-600",   bg:"bg-teal-50 border-teal-200",     prob:15, probLabel:"Низкая",       bar:"bg-teal-400" };
  if (day<=28) return { phase:"Предменструальная", color:"text-purple-600", bg:"bg-purple-50 border-purple-200", prob:5,  probLabel:"Очень низкая", bar:"bg-purple-400" };
  return               { phase:"Новый цикл скоро", color:"text-pink-500",   bg:"bg-pink-50 border-pink-200",     prob:5,  probLabel:"Очень низкая", bar:"bg-pink-400" };
}

// ─── Компонент ────────────────────────────────────────────────────────────────
export default function Index() {
  const today = new Date();

  // — Тема —
  const [themeId, setThemeId] = useState(() => localStorage.getItem("luna_theme") || "rose");
  const theme = THEMES.find(t=>t.id===themeId) ?? THEMES[0];

  // — Вкладки —
  const [activeTab, setActiveTab] = useState<Tab>("cycle");

  // — Меню —
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPartner, setShowPartner] = useState(false);

  // — Календарь-модал —
  const [calOpen, setCalOpen] = useState(false);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number|null>(null);
  const [calEvents, setCalEvents] = useState<Record<string, string>>({});
  const [newEvent, setNewEvent] = useState("");

  // — Неделя + свайп —
  const [weekOffset, setWeekOffset] = useState(0);
  const swipeStartX = useRef<number|null>(null);
  const swipeStartY = useRef<number|null>(null);

  // — Данные цикла —
  const [cycleStart, setCycleStart] = useState("");
  const [cycleEnd,   setCycleEnd]   = useState("");
  const [activeSymptoms, setActiveSymptoms] = useState<string[]>([]);
  const [note,       setNote]       = useState("");
  const [savedNote,  setSavedNote]  = useState("");
  const [showTips,   setShowTips]   = useState(false);
  const [showArticles, setShowArticles] = useState(false);
  const [cycleSaving, setCycleSaving] = useState(false);

  // — Данные беременности —
  const [lastPeriod, setLastPeriod] = useState("");
  const [dueDate,    setDueDate]    = useState("");
  const [pregSymptoms, setPregSymptoms] = useState<string[]>([]);
  const [pregNote,   setPregNote]   = useState("");
  const [savedPregNote, setSavedPregNote] = useState("");
  const [showPregTips,  setShowPregTips]  = useState(false);
  const [showPregArticles, setShowPregArticles] = useState(false);
  const [pregSaving, setPregSaving] = useState(false);

  // — Партнёр —
  const [partnerStatus, setPartnerStatus] = useState<"none"|"pending"|"active">("none");
  const [partnerInviteCode, setPartnerInviteCode] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerMsg, setPartnerMsg] = useState("");

  // — Инициализация —
  useEffect(() => {
    // регистрируем пользователя при первом открытии
    apiCall("POST", "user_save", {}).catch(()=>{});

    // загружаем данные цикла
    apiCall("GET", "cycle_get").then(d => {
      if (d.exists) {
        if (d.cycle_start) setCycleStart(d.cycle_start);
        if (d.cycle_end)   setCycleEnd(d.cycle_end);
        if (d.symptoms)    setActiveSymptoms(d.symptoms);
        if (d.note)        setSavedNote(d.note);
      }
    }).catch(()=>{});

    // загружаем данные беременности
    apiCall("GET", "pregnancy_get").then(d => {
      if (d.exists) {
        if (d.last_period) setLastPeriod(d.last_period);
        if (d.due_date)    setDueDate(d.due_date);
        if (d.symptoms)    setPregSymptoms(d.symptoms);
        if (d.note)        setSavedPregNote(d.note);
      }
    }).catch(()=>{});

    // загружаем события календаря
    apiCall("GET", "events_get").then(d => {
      if (d.events) {
        const ev: Record<string,string> = {};
        d.events.forEach((e: {date:string; title:string}) => { ev[e.date] = e.title; });
        setCalEvents(ev);
      }
    }).catch(()=>{});

    // загружаем статус партнёра
    apiCall("GET", "partner_status").then(d => {
      if (d.has_partner) {
        setPartnerStatus("active");
        setPartnerName(d.partner_name || "Партнёр");
      } else if (d.status === "pending") {
        setPartnerStatus("pending");
        setPartnerInviteCode(d.invite_code || "");
      }
    }).catch(()=>{});
  }, []);

  // — Сохранение темы —
  useEffect(() => {
    localStorage.setItem("luna_theme", themeId);
    apiCall("POST", "settings_save", { theme_id: themeId, mode: activeTab }).catch(()=>{});
  }, [themeId]);

  // ── Расчёты ──────────────────────────────────────────────────────────────────
  const cycleDuration = cycleStart && cycleEnd
    ? Math.round((new Date(cycleEnd).getTime()-new Date(cycleStart).getTime())/(86400000))+1
    : null;

  const cycleDay = cycleStart
    ? Math.round((today.getTime()-new Date(cycleStart).getTime())/(86400000))+1
    : null;

  const phaseInfo = getCyclePhaseInfo(cycleDay);

  const weeksPregnant = lastPeriod
    ? Math.floor((today.getTime()-new Date(lastPeriod).getTime())/(7*86400000))
    : null;

  const daysPregnant = lastPeriod
    ? Math.floor((today.getTime()-new Date(lastPeriod).getTime())/86400000)
    : null;

  // ── Неделя + свайп ────────────────────────────────────────────────────────────
  const weekMonday = getMondayOfWeek(addDays(today, weekOffset*7));
  const weekDays7  = Array.from({length:7}, (_,i) => addDays(weekMonday, i));

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      setWeekOffset(o => o + (dx < 0 ? 1 : -1));
    }
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  // ── Метки дней ────────────────────────────────────────────────────────────────
  const getDayMark = (dt: Date, mode: Tab) => {
    if (mode==="pregnancy") {
      if (dueDate && isSameDay(dt, new Date(dueDate))) return "due";
      if (lastPeriod) {
        const s=new Date(lastPeriod), diff=Math.floor((dt.getTime()-s.getTime())/86400000);
        if (diff>=0 && diff<280) return "pregnant";
      }
      return null;
    }
    if (cycleStart && cycleEnd) {
      const s=new Date(cycleStart), e=new Date(cycleEnd);
      if (dt>=s && dt<=e) return "period";
    }
    if (cycleStart) {
      const s=new Date(cycleStart);
      const day=Math.floor((dt.getTime()-s.getTime())/86400000)+1;
      if (day>=12 && day<=17) return "ovulation";
    }
    return null;
  };

  // ── Календарь (полный) ───────────────────────────────────────────────────────
  const buildCalCells = () => {
    const cells: (number|null)[] = [];
    const first=getFirstDayOfMonth(calYear, calMonth);
    const days=getDaysInMonth(calYear, calMonth);
    for (let i=0;i<first;i++) cells.push(null);
    for (let d=1;d<=days;d++) cells.push(d);
    return cells;
  };
  const isCalToday=(d:number)=>d===today.getDate()&&calMonth===today.getMonth()&&calYear===today.getFullYear();
  const calKey=(d:number)=>`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const prevCalMonth=()=>{ if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11);}else setCalMonth(m=>m-1); };
  const nextCalMonth=()=>{ if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0);}else setCalMonth(m=>m+1); };

  // ── Helpers UI ───────────────────────────────────────────────────────────────
  const toggleSymptom=(s:string, isPreg=false)=>{
    if(isPreg) setPregSymptoms(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
    else       setActiveSymptoms(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  };
  const cycleArticles=ARTICLES.filter(a=>a.tag!=="Беременность");
  const pregArticles=ARTICLES.filter(a=>["Беременность","Симптомы","Активность"].includes(a.tag));

  // ── Стили ────────────────────────────────────────────────────────────────────
  const isDark = themeId === "night";
  const bgStyle = { background: activeTab==="pregnancy" ? theme.pregBg : theme.bg };
  const cardStyle: React.CSSProperties = {
    background: theme.cardBg,
    backdropFilter:"blur(12px)",
    border:`1px solid ${theme.border}`,
    boxShadow:"0 4px 24px rgba(0,0,0,0.06)",
  };
  const btnPrimary: React.CSSProperties = {
    background: theme.chipActive, color: theme.primaryFg,
    borderRadius:"50px", boxShadow:"0 4px 16px rgba(0,0,0,0.15)", transition:"all .3s ease",
  };
  const tabActiveStyle: React.CSSProperties = {
    background: theme.tabActive, color: theme.primaryFg,
    boxShadow:"0 4px 16px rgba(0,0,0,0.15)",
  };
  const textCol = isDark ? "text-gray-100" : "text-foreground";
  const mutedCol = isDark ? "text-gray-400" : "text-muted-foreground";

  // ── Сохранение цикла ─────────────────────────────────────────────────────────
  const saveCycle = async () => {
    setCycleSaving(true);
    try {
      await apiCall("POST", "cycle_save", { cycle_start: cycleStart, cycle_end: cycleEnd, symptoms: activeSymptoms, note: savedNote });
    } finally { setCycleSaving(false); }
  };

  const savePregnancy = async () => {
    setPregSaving(true);
    try {
      await apiCall("POST", "pregnancy_save", { last_period: lastPeriod, due_date: dueDate, symptoms: pregSymptoms, note: savedPregNote });
    } finally { setPregSaving(false); }
  };

  // ── Партнёр ──────────────────────────────────────────────────────────────────
  const createInvite = async () => {
    setPartnerLoading(true); setPartnerMsg("");
    try {
      const d = await apiCall("POST", "partner_invite", {});
      if (d.invite_code) { setPartnerInviteCode(d.invite_code); setPartnerStatus("pending"); }
    } finally { setPartnerLoading(false); }
  };

  const joinPartner = async () => {
    if (!joinCode.trim()) return;
    setPartnerLoading(true); setPartnerMsg("");
    try {
      const d = await apiCall("POST", "partner_join", { invite_code: joinCode.trim() });
      if (d.ok) { setPartnerStatus("active"); setPartnerMsg("Партнёр успешно подключён! 💕"); }
      else if (d.error) setPartnerMsg(d.error);
    } finally { setPartnerLoading(false); }
  };

  // ── Добавление события в календарь ──────────────────────────────────────────
  const addCalEvent = async () => {
    if (!newEvent.trim() || !selectedDay) return;
    const key = calKey(selectedDay);
    setCalEvents(ev=>({...ev, [key]: newEvent.trim()}));
    await apiCall("POST", "event_add", { date: key, title: newEvent.trim() }).catch(()=>{});
    setNewEvent("");
  };

  // ── WeekStrip ────────────────────────────────────────────────────────────────
  const WeekStrip = ({ mode }: { mode: Tab }) => {
    const pregWD = (mode==="pregnancy" && weeksPregnant && weeksPregnant>=4)
      ? getPregnancyWeekData(weeksPregnant) : null;
    const embryoEmoji = (mode==="pregnancy" && weeksPregnant && weeksPregnant>=4)
      ? getEmbryoEmoji(weeksPregnant) : null;
    const isCurrentWeek = weekOffset===0;

    return (
      <div
        className="rounded-3xl p-4 space-y-4"
        style={cardStyle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Шапка с кнопкой календаря и датой */}
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:`${theme.primary}22` }}>
            <Icon name="CalendarRange" size={14} style={{ color: theme.primary }} />
          </span>
          <span className={`font-display text-base ${textCol}`}>
            {isCurrentWeek ? "Эта неделя" : weekOffset<0 ? "Прошлая неделя" : "Следующая неделя"}
          </span>
          <span className={`ml-auto text-xs ${mutedCol} font-body`}>
            {weekDays7[0].getDate()} – {weekDays7[6].getDate()} {MONTHS_SHORT[weekDays7[0].getMonth()]}
          </span>
          {/* Кнопка открыть полный календарь */}
          <button
            onClick={() => setCalOpen(true)}
            className="w-7 h-7 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0 ml-1"
            style={{ background:`${theme.primary}22` }}
          >
            <Icon name="CalendarDays" size={13} style={{ color: theme.primary }} />
          </button>
        </div>

        {/* 7 дней + стрелки */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset(o=>o-1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ background:`${theme.primary}18` }}
          >
            <Icon name="ChevronLeft" size={14} style={{ color: theme.primary }} />
          </button>
          <div className="grid grid-cols-7 gap-1 flex-1">
            {weekDays7.map((dt, i) => {
              const isNow=isSameDay(dt, today);
              const mark=getDayMark(dt, mode);
              const isPeriod=mark==="period"; const isOvul=mark==="ovulation";
              const isDue=mark==="due"; const isPreg=mark==="pregnant";
              let bg="rgba(255,255,255,0.55)", color="inherit", borderColor="rgba(200,150,170,0.2)";
              if (isDark && !isNow) { bg="rgba(255,255,255,0.08)"; color="#ccc"; borderColor="rgba(255,255,255,0.1)"; }
              if (isNow)     { bg=theme.primary; color=theme.primaryFg; borderColor=theme.primary; }
              else if (isPeriod)  { bg="rgba(244,63,94,0.12)"; color="#e11d48"; borderColor="rgba(244,63,94,0.3)"; }
              else if (isOvul)    { bg="rgba(34,197,94,0.12)"; color="#16a34a"; borderColor="rgba(34,197,94,0.3)"; }
              else if (isDue)     { bg="#a855f7"; color="#fff"; borderColor="#a855f7"; }
              else if (isPreg)    { bg="rgba(168,85,247,0.12)"; color="#7c3aed"; borderColor="rgba(168,85,247,0.3)"; }
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className={`text-xs ${mutedCol} font-body`}>{SHORT_DAYS[i]}</span>
                  <div className="w-full h-10 rounded-2xl flex items-center justify-center border transition-all"
                    style={{ background:bg, color, borderColor }}>
                    <span className="text-sm font-medium font-body leading-none">{dt.getDate()}</span>
                  </div>
                  <span style={{ fontSize:"10px", minHeight:"14px", display:"block", textAlign:"center" }}>
                    {isPeriod?"🩸":isOvul?"🌿":isDue?"👶":isPreg?"🤰":""}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setWeekOffset(o=>o+1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ background:`${theme.primary}18` }}
          >
            <Icon name="ChevronRight" size={14} style={{ color: theme.primary }} />
          </button>
        </div>

        {/* Кнопка «К сегодня» */}
        {weekOffset!==0 && (
          <button
            onClick={() => setWeekOffset(0)}
            className={`text-xs font-body px-3 py-1.5 rounded-full border transition-all`}
            style={{ borderColor:theme.primary, color:theme.primary, background:`${theme.primary}10` }}
          >
            К сегодняшней неделе
          </button>
        )}

        {/* Блок дня цикла / беременности */}
        {mode!=="pregnancy" && (
          cycleDay && phaseInfo ? (
            <div className={`rounded-2xl border px-4 py-3 ${phaseInfo.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground font-body">День цикла</p>
                  <p className={`text-2xl font-display font-semibold ${phaseInfo.color}`}>{cycleDay}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-body">Фаза</p>
                  <p className={`text-sm font-semibold font-body ${phaseInfo.color}`}>{phaseInfo.phase}</p>
                </div>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground font-body">Вероятность забеременеть</span>
                <span className={`text-xs font-semibold font-body ${phaseInfo.color}`}>{phaseInfo.probLabel}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/60">
                <div className={`h-2 rounded-full transition-all duration-700 ${phaseInfo.bar}`} style={{ width:`${phaseInfo.prob}%` }} />
              </div>
              <p className="text-right text-xs text-muted-foreground font-body mt-0.5">{phaseInfo.prob}%</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-sm text-muted-foreground font-body text-center">
              Укажите дату начала цикла, чтобы увидеть фазу
            </div>
          )
        )}

        {/* Блок эмбриона + данных плода */}
        {mode==="pregnancy" && (
          embryoEmoji && pregWD && weeksPregnant ? (
            <div className="rounded-2xl px-4 py-4 border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              {/* Эмбрион + неделя */}
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.1))", border:"2px solid rgba(168,85,247,0.2)" }}>
                  <span style={{ fontSize:"44px", lineHeight:1 }}>{embryoEmoji}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${mutedCol} font-body`}>Неделя беременности</p>
                  <p className="text-3xl font-display text-purple-600 font-semibold leading-tight">{weeksPregnant}</p>
                  <p className="text-xs text-purple-500 font-body mt-0.5">{pregWD.dev}</p>
                  {daysPregnant !== null && (
                    <p className="text-xs text-purple-400 font-body mt-0.5">День {daysPregnant}</p>
                  )}
                </div>
              </div>
              {/* Параметры */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:"Размер", value:pregWD.size },
                  { label:"Вес",    value:pregWD.weight },
                  { label:"Похож на", value:pregWD.fruit },
                ].map((item,j) => (
                  <div key={j} className="rounded-xl px-2 py-2 text-center" style={{ background:"rgba(168,85,247,0.08)" }}>
                    <p className="text-xs text-purple-400 font-body">{item.label}</p>
                    <p className="text-xs font-semibold text-purple-700 font-body">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 px-4 py-3 text-sm text-purple-400 font-body text-center">
              Укажите дату последней менструации, чтобы отслеживать развитие малыша
            </div>
          )
        )}
      </div>
    );
  };

  // ── Полный календарь ─────────────────────────────────────────────────────────
  const CalendarModal = () => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
      style={{ background:"rgba(0,0,0,0.35)", backdropFilter:"blur(6px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) setCalOpen(false); }}>
      <div className="w-full max-w-sm rounded-3xl p-5 space-y-4" style={{ ...cardStyle, background:isDark?"rgba(30,15,40,0.98)":"rgba(255,255,255,0.98)" }}>
        <div className="flex items-center justify-between">
          <button onClick={prevCalMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70" style={{ background:`${theme.primary}18` }}>
            <Icon name="ChevronLeft" size={16} style={{ color:theme.primary }} />
          </button>
          <h3 className={`font-display text-lg ${textCol}`}>{MONTHS_FULL[calMonth]} {calYear}</h3>
          <button onClick={nextCalMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70" style={{ background:`${theme.primary}18` }}>
            <Icon name="ChevronRight" size={16} style={{ color:theme.primary }} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {SHORT_DAYS.map(d=>(
            <div key={d} className={`text-center text-xs py-1 font-body font-semibold ${mutedCol}`}>{d}</div>
          ))}
          {buildCalCells().map((d,i)=>{
            const isT=d?isCalToday(d):false;
            const hasEv=d?!!calEvents[calKey(d)]:false;
            const isSel=d===selectedDay;
            return (
              <div key={i} onClick={()=>d&&setSelectedDay(d)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-body cursor-pointer transition-all relative ${d?"hover:opacity-80":""}`}
                style={isT?{background:theme.primary,color:theme.primaryFg}:isSel?{background:`${theme.primary}25`,color:theme.primary}:{background:"transparent",color:isDark?"#ccc":"inherit"}}>
                {d || ""}
                {hasEv && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background:theme.primary }} />}
              </div>
            );
          })}
        </div>
        {selectedDay && (
          <div className="space-y-3">
            <p className={`text-xs ${mutedCol} font-body font-semibold uppercase tracking-wide`}>
              {selectedDay} {MONTHS_SHORT[calMonth]} {calYear}
            </p>
            {calEvents[calKey(selectedDay)] && (
              <div className="rounded-2xl px-3 py-2 text-sm font-body" style={{ background:`${theme.primary}12`, color:theme.primary }}>
                📌 {calEvents[calKey(selectedDay)]}
              </div>
            )}
            <div className="flex gap-2">
              <input value={newEvent} onChange={e=>setNewEvent(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addCalEvent()}
                placeholder="Добавить заметку..."
                className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-body focus:outline-none ${isDark?"bg-white/10 text-gray-100 border-white/20":"bg-pink-50/60 border-pink-200 text-foreground"}`} />
              <button onClick={addCalEvent}
                className="px-4 py-2 rounded-2xl text-sm font-body font-medium transition-all"
                style={btnPrimary}>+</button>
            </div>
          </div>
        )}
        {Object.keys(calEvents).length>0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <p className={`text-xs ${mutedCol} font-body font-semibold uppercase tracking-wide`}>Все события</p>
            {Object.entries(calEvents).map(([k,v])=>(
              <div key={k} className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-body"
                style={{ background:`${theme.primary}0E`, border:`1px solid ${theme.primary}22` }}>
                <span className={mutedCol}>{k}</span>
                <span style={{ color:theme.primary }}>{v}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={()=>setCalOpen(false)} className="w-full py-2 rounded-2xl text-sm font-body transition-all"
          style={{ background:`${theme.primary}18`, color:theme.primary }}>Закрыть</button>
      </div>
    </div>
  );

  // ── Модал выбора темы ────────────────────────────────────────────────────────
  const ThemeModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.25)", backdropFilter:"blur(6px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) setShowTheme(false); }}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ ...cardStyle, background:"rgba(255,255,255,0.97)" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-foreground">Тема оформления</h3>
          <button onClick={()=>setShowTheme(false)} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
            <Icon name="X" size={16} className="text-rose-500" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(t=>(
            <button key={t.id} onClick={()=>{ setThemeId(t.id); setShowTheme(false); }}
              className={`rounded-2xl overflow-hidden transition-all ${themeId===t.id?"ring-2 ring-offset-2":"hover:scale-[1.02]"}`}
              style={themeId===t.id?{ outline:`2px solid ${t.primary}` }:{}}>
              <div className={`h-14 bg-gradient-to-br ${t.preview}`} />
              <div className="bg-white/90 py-2 px-3 flex items-center gap-2">
                <span className="text-base">{t.emoji}</span>
                <span className="text-sm font-body font-medium text-foreground">{t.name}</span>
                {themeId===t.id && <Icon name="Check" size={14} className="ml-auto text-green-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Модал настроек (режим + кнопки «Забеременеть» / «Беременность») ──────────
  const SettingsModal = () => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.25)", backdropFilter:"blur(6px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) setShowSettings(false); }}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ ...cardStyle, background:isDark?"rgba(30,15,40,0.98)":"rgba(255,255,255,0.97)" }}>
        <div className="flex items-center justify-between">
          <h3 className={`font-display text-xl ${textCol}`}>Настройки</h3>
          <button onClick={()=>setShowSettings(false)} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
            <Icon name="X" size={16} className="text-rose-500" />
          </button>
        </div>

        <p className={`text-xs ${mutedCol} font-body font-semibold uppercase tracking-wide`}>Режим приложения</p>
        <div className="space-y-2">
          {([
            { id:"cycle",     label:"Отслеживание цикла", icon:"Moon", desc:"Следите за менструальным циклом и здоровьем" },
            { id:"conceive",  label:"Планирование беременности", icon:"Leaf", desc:"Отслеживайте овуляцию для зачатия" },
            { id:"pregnancy", label:"Беременность", icon:"Baby", desc:"Отслеживайте развитие малыша" },
          ] as { id:Tab; label:string; icon:string; desc:string }[]).map(m=>(
            <button key={m.id} onClick={()=>{ setActiveTab(m.id); setShowSettings(false); }}
              className="w-full rounded-2xl px-4 py-3 text-left flex items-center gap-3 transition-all hover:opacity-80"
              style={activeTab===m.id?{...btnPrimary, borderRadius:"16px"}:{background:`${theme.primary}0A`, border:`1px solid ${theme.primary}20`}}>
              <Icon name={m.icon} size={18} style={{ color:activeTab===m.id?theme.primaryFg:theme.primary }} />
              <div>
                <p className={`text-sm font-medium font-body ${activeTab===m.id?"text-white":textCol}`}>{m.label}</p>
                <p className={`text-xs font-body ${activeTab===m.id?"text-white/70":mutedCol}`}>{m.desc}</p>
              </div>
              {activeTab===m.id && <Icon name="Check" size={16} className="ml-auto" style={{ color:theme.primaryFg }} />}
            </button>
          ))}
        </div>

        <div className="pt-2">
          <p className={`text-xs ${mutedCol} font-body font-semibold uppercase tracking-wide mb-2`}>Другое</p>
          <button onClick={()=>{ setShowPartner(true); setShowSettings(false); }}
            className="w-full rounded-2xl px-4 py-3 flex items-center gap-3 text-left transition-all hover:opacity-80"
            style={{ background:`${theme.primary}0A`, border:`1px solid ${theme.primary}20` }}>
            <Icon name="Heart" size={18} style={{ color:theme.primary }} />
            <div>
              <p className={`text-sm font-medium font-body ${textCol}`}>Партнёрский доступ</p>
              <p className={`text-xs font-body ${mutedCol}`}>
                {partnerStatus==="active"?"Партнёр подключён 💕":partnerStatus==="pending"?"Ожидание партнёра...":"Пригласить партнёра"}
              </p>
            </div>
            <Icon name="ChevronRight" size={16} className="ml-auto" style={{ color:theme.primary }} />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Модал партнёра ───────────────────────────────────────────────────────────
  const PartnerModal = () => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.25)", backdropFilter:"blur(6px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) setShowPartner(false); }}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ ...cardStyle, background:isDark?"rgba(30,15,40,0.98)":"rgba(255,255,255,0.97)" }}>
        <div className="flex items-center justify-between">
          <h3 className={`font-display text-xl ${textCol}`}>Партнёрский доступ 💕</h3>
          <button onClick={()=>setShowPartner(false)} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
            <Icon name="X" size={16} className="text-rose-500" />
          </button>
        </div>

        {partnerStatus==="active" ? (
          <div className="rounded-2xl px-4 py-4 text-center bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
            <p className="text-3xl mb-2">💕</p>
            <p className={`font-display text-xl ${textCol}`}>Партнёр подключён!</p>
            <p className={`text-sm font-body ${mutedCol} mt-1`}>{partnerName || "Ваш партнёр"} видит ваши данные</p>
          </div>
        ) : (
          <>
            {/* Создать приглашение */}
            <div className="space-y-2">
              <p className={`text-sm font-semibold font-body ${textCol}`}>Пригласить партнёра</p>
              <p className={`text-xs font-body ${mutedCol}`}>Создайте код и отправьте партнёру — он введёт его у себя в приложении</p>
              {partnerStatus==="pending" && partnerInviteCode ? (
                <div className="rounded-2xl px-4 py-3 text-center" style={{ background:`${theme.primary}12`, border:`1px solid ${theme.primary}30` }}>
                  <p className={`text-xs ${mutedCol} font-body mb-1`}>Ваш код приглашения</p>
                  <p className="text-2xl font-display tracking-widest" style={{ color:theme.primary }}>{partnerInviteCode}</p>
                  <p className={`text-xs ${mutedCol} font-body mt-1`}>Ожидание подключения...</p>
                </div>
              ) : (
                <button onClick={createInvite} disabled={partnerLoading}
                  className="w-full py-3 font-body font-medium text-sm rounded-full transition-all hover:opacity-90 disabled:opacity-50"
                  style={btnPrimary}>
                  {partnerLoading?"Создаём...":"Создать код приглашения"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background:`${theme.primary}30` }} />
              <span className={`text-xs ${mutedCol} font-body`}>или</span>
              <div className="flex-1 h-px" style={{ background:`${theme.primary}30` }} />
            </div>

            {/* Ввести код */}
            <div className="space-y-2">
              <p className={`text-sm font-semibold font-body ${textCol}`}>Ввести код партнёра</p>
              <div className="flex gap-2">
                <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  className={`flex-1 rounded-2xl border px-4 py-2.5 text-center text-lg font-display tracking-widest focus:outline-none ${isDark?"bg-white/10 text-gray-100 border-white/20 placeholder:text-gray-500":"bg-pink-50/60 border-pink-200 text-foreground placeholder:text-muted-foreground/40"}`} />
                <button onClick={joinPartner} disabled={partnerLoading || !joinCode.trim()}
                  className="px-4 py-2 rounded-2xl text-sm font-body font-medium transition-all disabled:opacity-50"
                  style={btnPrimary}>
                  {partnerLoading?"...":"Войти"}
                </button>
              </div>
            </div>

            {partnerMsg && (
              <div className="rounded-2xl px-3 py-2 text-sm font-body text-center"
                style={{ background:`${theme.primary}12`, color:theme.primary }}>
                {partnerMsg}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ── Боковое меню ─────────────────────────────────────────────────────────────
  const MENU_ITEMS = [
    { id:"settings", label:"Настройки",           icon:"Settings",   action:()=>{ setShowSettings(true); setMenuOpen(false); } },
    { id:"theme",    label:"Тема оформления",      icon:"Palette",    action:()=>{ setShowTheme(true); setMenuOpen(false); } },
    { id:"partner",  label:"Партнёрский доступ",   icon:"Heart",      action:()=>{ setShowPartner(true); setMenuOpen(false); } },
    { id:"cal",      label:"Полный календарь",     icon:"CalendarDays",action:()=>{ setCalOpen(true); setMenuOpen(false); } },
    { id:"tips-m",   label:"Персональные советы",  icon:"Sparkles",   action:()=>{ setShowTips(true); setShowPregTips(true); setMenuOpen(false); } },
    { id:"articles-m",label:"Библиотека статей",  icon:"BookOpen",   action:()=>{ setShowArticles(true); setShowPregArticles(true); setMenuOpen(false); } },
  ];

  // ── Карточки-утилиты ─────────────────────────────────────────────────────────
  const Card=({ children, className="", style: s }: { children: React.ReactNode; className?: string; style?: React.CSSProperties })=>(
    <div className={`rounded-3xl p-5 ${className}`} style={{ ...cardStyle, ...s }}>{children}</div>
  );
  const CardHeader=({ icon, title, action }: { icon:string; title:string; action?: React.ReactNode })=>(
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${theme.primary}1A` }}>
          <Icon name={icon} size={16} style={{ color:theme.primary }} />
        </span>
        <h2 className={`font-display text-lg ${textCol}`}>{title}</h2>
      </div>
      {action}
    </div>
  );
  const Btn=({ onClick, children, className="", style: s={}, disabled=false }: { onClick?: ()=>void; children: React.ReactNode; className?: string; style?: React.CSSProperties; disabled?: boolean })=>(
    <button onClick={onClick} disabled={disabled}
      className={`w-full py-3 font-body font-medium text-sm rounded-full transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 ${className}`}
      style={{ ...btnPrimary, ...s }}>{children}</button>
  );
  const BtnGhost=({ onClick, children }: { onClick?: ()=>void; children: React.ReactNode })=>(
    <button onClick={onClick} className={`text-xs px-3 py-1.5 font-body rounded-full border transition-all hover:opacity-80`}
      style={{ borderColor:theme.primary, color:theme.primary, background:`${theme.primary}10` }}>{children}</button>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden" style={bgStyle}>
      {/* Декор */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-[50%_30%_50%_30%] opacity-50"
        style={{ background:`linear-gradient(135deg,${theme.primary}22,${theme.primary}0A)`, transform:"rotate(45deg)" }} />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 rounded-[50%_30%_50%_30%] opacity-30"
        style={{ background:`linear-gradient(135deg,${theme.primary}18,${theme.primary}06)`, transform:"rotate(-12deg)" }} />

      {/* Модалы */}
      {calOpen    && <CalendarModal />}
      {showTheme  && <ThemeModal />}
      {showSettings && <SettingsModal />}
      {showPartner  && <PartnerModal />}

      {/* Боковое меню */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={()=>setMenuOpen(false)} />
          <div className="relative z-10 w-72 h-full backdrop-blur-xl shadow-2xl flex flex-col"
            style={{ background:isDark?"rgba(20,10,30,0.98)":"rgba(255,255,255,0.97)" }}>
            <div className="p-6 border-b border-pink-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-2xl" style={{ color:theme.primary }}>Луна 🌙</span>
                <button onClick={()=>setMenuOpen(false)} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
                  <Icon name="X" size={16} className="text-rose-500" />
                </button>
              </div>
              <p className={`text-xs ${mutedCol} font-body`}>Трекер цикла и беременности</p>
              {partnerStatus==="active" && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-xs">💕</span>
                  <span className={`text-xs ${mutedCol} font-body`}>Партнёр: {partnerName}</span>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {MENU_ITEMS.map(item=>(
                <button key={item.id} onClick={item.action}
                  className={`w-full flex items-center gap-3 px-6 py-3.5 transition-colors text-left group ${isDark?"hover:bg-white/5":"hover:bg-pink-50"}`}>
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors group-hover:opacity-80"
                    style={{ background:`${theme.primary}18` }}>
                    <Icon name={item.icon} size={15} style={{ color:theme.primary }} />
                  </span>
                  <span className={`font-body text-sm ${textCol}`}>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-pink-100">
              <p className={`text-xs ${mutedCol} text-center font-body`}>Луна v2.0 • 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* Шапка */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-pink-100"
        style={{ background:isDark?"rgba(20,10,30,0.8)":"rgba(255,255,255,0.7)" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={()=>setMenuOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors hover:opacity-80"
            style={{ background:`${theme.primary}1A` }}>
            <Icon name="Menu" size={20} style={{ color:theme.primary }} />
          </button>
          <div className="text-center">
            <h1 className="font-display text-2xl leading-none" style={{ color:theme.primary }}>Луна</h1>
            <p className={`text-xs ${mutedCol} font-body mt-0.5`}>
              {activeTab==="pregnancy" ? "Поддержка во время беременности" : "Здоровье и планирование"}
            </p>
          </div>
          <button onClick={()=>setShowSettings(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ background:`${theme.primary}1A` }}>
            <Icon name="Settings" size={18} style={{ color:theme.primary }} />
          </button>
        </div>
      </header>

      {/* Навигационные вкладки */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-2 p-1.5 rounded-3xl backdrop-blur border border-pink-100"
          style={{ background:isDark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.6)" }}>
          {([
            { id:"cycle",     label:"Мой цикл",    icon:"Moon" },
            { id:"conceive",  label:"Планирование", icon:"Leaf" },
            { id:"pregnancy", label:"Беременность", icon:"Baby" },
          ] as { id:Tab; label:string; icon:string }[]).map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-medium font-body transition-all duration-300"
              style={activeTab===t.id?tabActiveStyle:{ background:"rgba(255,255,255,0.5)", color:"hsl(335,30%,50%)" }}>
              <Icon name={t.icon} size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-14">

        {/* ===== МОЙ ЦИКЛ ===== */}
        {activeTab==="cycle" && (
          <>
            <WeekStrip mode="cycle" />

            <Card>
              <CardHeader icon="CalendarHeart" title="Даты цикла" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={`text-xs ${mutedCol} font-body mb-1 block`}>Начало</label>
                  <input type="date" value={cycleStart} onChange={e=>setCycleStart(e.target.value)}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm font-body focus:outline-none ${isDark?"bg-white/10 text-gray-100 border-white/20":"bg-pink-50/50 border-pink-200 text-foreground"}`} />
                </div>
                <div>
                  <label className={`text-xs ${mutedCol} font-body mb-1 block`}>Окончание</label>
                  <input type="date" value={cycleEnd} onChange={e=>setCycleEnd(e.target.value)}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm font-body focus:outline-none ${isDark?"bg-white/10 text-gray-100 border-white/20":"bg-pink-50/50 border-pink-200 text-foreground"}`} />
                </div>
              </div>
              {cycleDuration!==null && (
                <div className="rounded-2xl px-4 py-2 mb-3 text-sm font-body" style={{ background:`${theme.primary}0E`, color:theme.primary }}>
                  Длительность: <strong>{cycleDuration} дней</strong>
                </div>
              )}
              <Btn onClick={saveCycle} disabled={cycleSaving}>
                {cycleSaving?"Сохраняем...":"Сохранить"}
              </Btn>
            </Card>

            <Card>
              <CardHeader icon="HeartPulse" title="Симптомы" action={<BtnGhost>+ Добавить</BtnGhost>} />
              <div className="flex flex-wrap gap-2">
                {CYCLE_SYMPTOMS.map(s=>(
                  <button key={s} onClick={()=>toggleSymptom(s)}
                    className="px-4 py-1.5 rounded-full text-sm font-body border transition-all"
                    style={activeSymptoms.includes(s)
                      ?{ background:theme.chipActive, color:"#fff", borderColor:"transparent" }
                      :{ background:"rgba(255,255,255,0.7)", color:"hsl(335,35%,45%)", borderColor:`${theme.primary}50` }}>
                    {s}
                  </button>
                ))}
              </div>
              {activeSymptoms.length>0 && (
                <div className="mt-3 flex items-center justify-between">
                  <p className={`text-xs ${mutedCol} font-body`}>Выбрано: {activeSymptoms.length}</p>
                  <BtnGhost onClick={()=>{ setActiveSymptoms([]); }}>Очистить</BtnGhost>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader icon="PenLine" title="Заметки" />
              <textarea value={note} onChange={e=>setNote(e.target.value)}
                placeholder="Как вы себя чувствуете сегодня?" rows={3}
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none resize-none mb-3 ${isDark?"bg-white/10 text-gray-100 border-white/20":"bg-pink-50/50 border-pink-200 text-foreground"}`} />
              {savedNote && (
                <div className="rounded-2xl px-4 py-2 mb-3 text-sm font-body" style={{ background:`${theme.primary}0E`, color:theme.primary }}>
                  💾 {savedNote}
                </div>
              )}
              <Btn onClick={async ()=>{ setSavedNote(note); setNote(""); await saveCycle(); }}>
                Сохранить заметку
              </Btn>
            </Card>

            <Card>
              <CardHeader icon="Sparkles" title="Советы по здоровью" />
              {showTips?(
                <div className="space-y-3">
                  {CYCLE_TIPS.map((t,i)=>(
                    <div key={i} className="rounded-2xl px-4 py-3 border" style={{ background:`${theme.primary}08`, borderColor:`${theme.primary}25` }}>
                      <p className="text-xs font-semibold mb-1 font-body" style={{ color:theme.primary }}>{t.phase}</p>
                      <p className={`text-sm ${isDark?"text-gray-300":"text-rose-700"} font-body`}>{t.tip}</p>
                    </div>
                  ))}
                </div>
              ):<Btn onClick={()=>setShowTips(true)}>Получить советы</Btn>}
            </Card>

            <Card>
              <CardHeader icon="BookOpen" title="Статьи" />
              {showArticles?(
                <div className="space-y-3">
                  {cycleArticles.map((a,i)=>(
                    <div key={i} className="rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer border transition-colors hover:opacity-80"
                      style={{ background:`${theme.primary}06`, borderColor:`${theme.primary}22` }}>
                      <span className="text-xl">{a.emoji}</span>
                      <div>
                        <p className={`text-sm font-medium ${textCol} font-body`}>{a.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-body" style={{ background:`${theme.primary}15`, color:theme.primary }}>{a.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ):<Btn onClick={()=>setShowArticles(true)}>Читать статьи</Btn>}
            </Card>
          </>
        )}

        {/* ===== ПЛАНИРОВАНИЕ ===== */}
        {activeTab==="conceive" && (
          <>
            <WeekStrip mode="conceive" />

            <Card>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background:`linear-gradient(135deg,${theme.primary}30,${theme.primary}18)` }}>
                <Icon name="Leaf" size={28} style={{ color:theme.primary }} />
              </div>
              <h2 className={`font-display text-2xl ${textCol} mb-2 text-center`}>Планирование беременности</h2>
              <p className={`text-sm ${mutedCol} font-body mb-5 text-center`}>Отслеживайте овуляцию и повышайте шансы на зачатие</p>
              <div className="space-y-3">
                {[
                  { label:"Окно овуляции",       value:"14–16 день цикла", icon:"Target" },
                  { label:"Фертильные дни",       value:"12–17 день",       icon:"Star" },
                  { label:"Следующая менструация",
                    value:cycleStart
                      ?`~${new Date(new Date(cycleStart).getTime()+28*86400000).toLocaleDateString("ru-RU")}`
                      :"Укажите даты",
                    icon:"Calendar" },
                ].map((item,i)=>(
                  <div key={i} className="rounded-2xl px-4 py-3 flex items-center justify-between border"
                    style={{ background:`${theme.primary}08`, borderColor:`${theme.primary}22` }}>
                    <div className="flex items-center gap-2">
                      <Icon name={item.icon} size={15} style={{ color:theme.primary }} />
                      <span className={`text-sm ${textCol} font-body`}>{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold font-body" style={{ color:theme.primary }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader icon="Sparkles" title="Советы для зачатия" />
              <div className="space-y-3">
                {[
                  "🥦 Принимайте фолиевую кислоту за 3 месяца до планирования",
                  "🌡️ Измеряйте базальную температуру каждое утро",
                  "💧 Пейте не менее 2 литров воды в день",
                  "🧘 Снижайте уровень стресса — он влияет на овуляцию",
                ].map((tip,i)=>(
                  <div key={i} className="rounded-2xl px-4 py-3 text-sm font-body border"
                    style={{ background:`${theme.primary}06`, borderColor:`${theme.primary}18`, color:isDark?"#d1c4e9":"#b45309" }}>
                    {tip}
                  </div>
                ))}
              </div>
            </Card>

            {/* Перейти в беременность - ссылка */}
            <div className="rounded-2xl px-4 py-4 text-center border" style={{ background:`${theme.primary}06`, borderColor:`${theme.primary}20` }}>
              <p className={`text-sm ${mutedCol} font-body mb-2`}>Уже беременны?</p>
              <button onClick={()=>setActiveTab("pregnancy")}
                className="text-sm font-body font-medium hover:opacity-80 transition-opacity"
                style={{ color:theme.primary }}>
                Перейти в режим «Беременность» →
              </button>
            </div>
          </>
        )}

        {/* ===== БЕРЕМЕННОСТЬ ===== */}
        {activeTab==="pregnancy" && (
          <>
            <WeekStrip mode="pregnancy" />

            <Card style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.9),rgba(240,220,255,0.4))" }}>
              <CardHeader icon="Baby" title="Даты беременности" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={`text-xs ${mutedCol} font-body mb-1 block`}>Последняя менструация</label>
                  <input type="date" value={lastPeriod} onChange={e=>setLastPeriod(e.target.value)}
                    className="w-full rounded-2xl border border-purple-200 bg-purple-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className={`text-xs ${mutedCol} font-body mb-1 block`}>Предполагаемые роды</label>
                  <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}
                    className="w-full rounded-2xl border border-purple-200 bg-purple-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none" />
                </div>
              </div>
              {weeksPregnant!==null && weeksPregnant>0 && (
                <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 px-4 py-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-display text-purple-600">{weeksPregnant} нед.</p>
                      <p className={`text-xs ${mutedCol} font-body`}>срок беременности</p>
                    </div>
                    {daysPregnant!==null && (
                      <div className="text-right">
                        <p className="text-lg font-display text-purple-400">{daysPregnant} дн.</p>
                        <p className={`text-xs ${mutedCol} font-body`}>всего дней</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <Btn onClick={savePregnancy} disabled={pregSaving}
                style={{ background:"linear-gradient(135deg,hsl(270,60%,65%),hsl(300,50%,60%))" }}>
                {pregSaving?"Сохраняем...":"Сохранить"}
              </Btn>
            </Card>

            <Card>
              <CardHeader icon="HeartPulse" title="Симптомы" action={<BtnGhost>+ Добавить</BtnGhost>} />
              <div className="flex flex-wrap gap-2">
                {PREGNANCY_SYMPTOMS.map(s=>(
                  <button key={s} onClick={()=>toggleSymptom(s,true)}
                    className="px-4 py-1.5 rounded-full text-sm font-body border transition-all"
                    style={pregSymptoms.includes(s)
                      ?{ background:theme.chipActive, color:"#fff", borderColor:"transparent" }
                      :{ background:"rgba(255,255,255,0.7)", color:"hsl(335,35%,45%)", borderColor:`${theme.primary}50` }}>
                    {s}
                  </button>
                ))}
              </div>
              {pregSymptoms.length>0 && (
                <div className="mt-3 flex items-center justify-between">
                  <p className={`text-xs ${mutedCol} font-body`}>Отмечено: {pregSymptoms.length}</p>
                  <BtnGhost onClick={()=>setPregSymptoms([])}>Очистить</BtnGhost>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader icon="PenLine" title="Заметки" />
              <textarea value={pregNote} onChange={e=>setPregNote(e.target.value)}
                placeholder="Запишите ощущения, вопросы для врача..." rows={3}
                className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none mb-3" />
              {savedPregNote && (
                <div className="rounded-2xl px-4 py-2 mb-3 text-sm font-body" style={{ background:`${theme.primary}0E`, color:theme.primary }}>
                  💾 {savedPregNote}
                </div>
              )}
              <Btn onClick={async()=>{ setSavedPregNote(pregNote); setPregNote(""); await savePregnancy(); }}
                style={{ background:"linear-gradient(135deg,hsl(270,60%,65%),hsl(300,50%,60%))" }}>
                Сохранить заметку
              </Btn>
            </Card>

            <Card>
              <CardHeader icon="Sparkles" title="Советы по беременности" />
              {showPregTips?(
                <div className="space-y-3">
                  {PREGNANCY_TIPS.map((t,i)=>(
                    <div key={i} className="rounded-2xl px-4 py-3 border bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
                      <p className="text-xs font-semibold text-purple-500 mb-1 font-body">{t.week}</p>
                      <p className="text-sm text-rose-700 font-body">{t.tip}</p>
                    </div>
                  ))}
                </div>
              ):<Btn onClick={()=>setShowPregTips(true)} style={{ background:"linear-gradient(135deg,hsl(270,60%,65%),hsl(300,50%,60%))" }}>Получить советы</Btn>}
            </Card>

            <Card>
              <CardHeader icon="BookOpen" title="Статьи" />
              {showPregArticles?(
                <div className="space-y-3">
                  {pregArticles.map((a,i)=>(
                    <div key={i} className="rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer border transition-colors hover:opacity-80"
                      style={{ background:"rgba(168,85,247,0.06)", borderColor:"rgba(168,85,247,0.22)" }}>
                      <span className="text-xl">{a.emoji}</span>
                      <div>
                        <p className={`text-sm font-medium ${textCol} font-body`}>{a.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-body bg-purple-100 text-purple-500">{a.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ):<Btn onClick={()=>setShowPregArticles(true)} style={{ background:"linear-gradient(135deg,hsl(270,60%,65%),hsl(300,50%,60%))" }}>Читать статьи</Btn>}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}