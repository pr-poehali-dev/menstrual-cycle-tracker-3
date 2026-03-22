import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Tab = "cycle" | "conceive" | "pregnancy";

// ─── Темы ────────────────────────────────────────────────────────────────────
interface Theme {
  id: string;
  name: string;
  bg: string;
  pregBg: string;
  primary: string;
  primaryFg: string;
  cardBg: string;
  border: string;
  chipActive: string;
  tabActive: string;
  preview: string;
  emoji: string;
}

const THEMES: Theme[] = [
  {
    id: "rose",
    name: "Роза",
    emoji: "🌸",
    bg: "linear-gradient(135deg,hsl(350,60%,97%) 0%,hsl(320,50%,96%) 50%,hsl(355,60%,96%) 100%)",
    pregBg: "linear-gradient(135deg,hsl(270,40%,97%) 0%,hsl(350,60%,96%) 50%,hsl(40,60%,97%) 100%)",
    primary: "hsl(340,65%,68%)",
    primaryFg: "#fff",
    cardBg: "rgba(255,255,255,0.82)",
    border: "rgba(255,182,193,0.35)",
    chipActive: "linear-gradient(135deg,hsl(340,65%,68%),hsl(335,55%,60%))",
    tabActive: "linear-gradient(135deg,hsl(340,65%,68%),hsl(335,55%,60%))",
    preview: "from-pink-200 to-rose-200",
  },
  {
    id: "lavender",
    name: "Лаванда",
    emoji: "💜",
    bg: "linear-gradient(135deg,hsl(270,50%,97%) 0%,hsl(290,40%,96%) 50%,hsl(250,45%,96%) 100%)",
    pregBg: "linear-gradient(135deg,hsl(270,50%,96%) 0%,hsl(300,40%,96%) 100%)",
    primary: "hsl(270,55%,62%)",
    primaryFg: "#fff",
    cardBg: "rgba(255,255,255,0.85)",
    border: "rgba(200,170,240,0.35)",
    chipActive: "linear-gradient(135deg,hsl(270,55%,62%),hsl(280,50%,55%))",
    tabActive: "linear-gradient(135deg,hsl(270,55%,62%),hsl(280,50%,55%))",
    preview: "from-purple-200 to-violet-200",
  },
  {
    id: "peach",
    name: "Персик",
    emoji: "🍑",
    bg: "linear-gradient(135deg,hsl(25,80%,97%) 0%,hsl(15,70%,96%) 50%,hsl(35,75%,96%) 100%)",
    pregBg: "linear-gradient(135deg,hsl(25,80%,96%) 0%,hsl(350,60%,96%) 100%)",
    primary: "hsl(20,80%,62%)",
    primaryFg: "#fff",
    cardBg: "rgba(255,255,255,0.85)",
    border: "rgba(255,200,160,0.35)",
    chipActive: "linear-gradient(135deg,hsl(20,80%,62%),hsl(15,75%,55%))",
    tabActive: "linear-gradient(135deg,hsl(20,80%,62%),hsl(15,75%,55%))",
    preview: "from-orange-100 to-rose-200",
  },
  {
    id: "mint",
    name: "Мята",
    emoji: "🌿",
    bg: "linear-gradient(135deg,hsl(155,50%,96%) 0%,hsl(140,45%,95%) 50%,hsl(170,40%,96%) 100%)",
    pregBg: "linear-gradient(135deg,hsl(155,50%,96%) 0%,hsl(340,30%,96%) 100%)",
    primary: "hsl(155,50%,50%)",
    primaryFg: "#fff",
    cardBg: "rgba(255,255,255,0.85)",
    border: "rgba(150,220,190,0.35)",
    chipActive: "linear-gradient(135deg,hsl(155,50%,50%),hsl(145,48%,43%))",
    tabActive: "linear-gradient(135deg,hsl(155,50%,50%),hsl(145,48%,43%))",
    preview: "from-teal-100 to-green-200",
  },
  {
    id: "night",
    name: "Ночь",
    emoji: "🌙",
    bg: "linear-gradient(135deg,hsl(260,30%,10%) 0%,hsl(280,25%,12%) 50%,hsl(300,20%,10%) 100%)",
    pregBg: "linear-gradient(135deg,hsl(260,30%,10%) 0%,hsl(300,20%,12%) 100%)",
    primary: "hsl(310,60%,65%)",
    primaryFg: "#fff",
    cardBg: "rgba(40,25,50,0.85)",
    border: "rgba(180,100,200,0.25)",
    chipActive: "linear-gradient(135deg,hsl(310,60%,65%),hsl(290,55%,58%))",
    tabActive: "linear-gradient(135deg,hsl(310,60%,65%),hsl(290,55%,58%))",
    preview: "from-purple-900 to-slate-800",
  },
  {
    id: "cream",
    name: "Нежность",
    emoji: "🤍",
    bg: "linear-gradient(135deg,hsl(40,60%,98%) 0%,hsl(350,40%,97%) 50%,hsl(30,50%,97%) 100%)",
    pregBg: "linear-gradient(135deg,hsl(40,60%,97%) 0%,hsl(270,30%,97%) 100%)",
    primary: "hsl(340,50%,60%)",
    primaryFg: "#fff",
    cardBg: "rgba(255,255,255,0.88)",
    border: "rgba(240,200,200,0.4)",
    chipActive: "linear-gradient(135deg,hsl(340,50%,60%),hsl(330,45%,53%))",
    tabActive: "linear-gradient(135deg,hsl(340,50%,60%),hsl(330,45%,53%))",
    preview: "from-rose-50 to-amber-50",
  },
];

// ─── Статические данные ──────────────────────────────────────────────────────
const CYCLE_SYMPTOMS = [
  "Боль внизу живота","Головная боль","Вздутие","Усталость",
  "Перепады настроения","Тошнота","Боль в груди","Раздражительность",
  "Бессонница","Ломота в теле",
];
const PREGNANCY_SYMPTOMS = [
  "Тошнота","Усталость","Токсикоз","Изжога",
  "Боль в спине","Отёки","Частое мочеиспускание","Головокружение",
  "Перепады настроения","Тяга к еде",
];
const CYCLE_TIPS = [
  { phase: "Менструация",       tip: "Пейте больше воды и отдыхайте. Тепло поможет снять спазмы." },
  { phase: "Фолликулярная",     tip: "Отличное время для новых начинаний — энергия на подъёме!" },
  { phase: "Овуляция",          tip: "Пик фертильности. Обратите внимание на изменения выделений." },
  { phase: "Лютеиновая",        tip: "Больше магния поможет смягчить ПМС. Снизьте кофеин." },
];
const PREGNANCY_TIPS = [
  { week: "1–12 нед.",  tip: "Принимайте фолиевую кислоту и избегайте стресса." },
  { week: "13–26 нед.", tip: "Самый комфортный период. Начните курсы для беременных." },
  { week: "27–40 нед.", tip: "Готовьте сумку в роддом и следите за шевелениями малыша." },
];
const ARTICLES = [
  { title: "Как читать свой цикл",        tag: "Цикл",        emoji: "🌸" },
  { title: "Питание при ПМС",             tag: "Здоровье",    emoji: "🥗" },
  { title: "Признаки овуляции",           tag: "Фертильность",emoji: "🌿" },
  { title: "Первый триместр: что ожидать",tag: "Беременность",emoji: "👶" },
  { title: "Йога для беременных",         tag: "Активность",  emoji: "🧘" },
  { title: "Токсикоз: как справиться",    tag: "Симптомы",    emoji: "💊" },
];

const PREGNANCY_WEEK_DATA: Record<number, { emoji: string; fruit: string; weight: string; size: string; dev: string }> = {
  4:  { emoji:"🫐", fruit:"Черника",       weight:"< 1 г",  size:"1 мм",    dev:"Формируется нейронная трубка" },
  5:  { emoji:"🌱", fruit:"Семечко",       weight:"< 1 г",  size:"2 мм",    dev:"Начинает биться сердечко" },
  6:  { emoji:"🫘", fruit:"Горошина",      weight:"< 1 г",  size:"5 мм",    dev:"Закладываются ручки и ножки" },
  7:  { emoji:"🫐", fruit:"Черника",       weight:"< 1 г",  size:"8 мм",    dev:"Формируется мозг и лицо" },
  8:  { emoji:"🍇", fruit:"Виноград",      weight:"1 г",    size:"1.6 см",  dev:"Все органы заложены" },
  9:  { emoji:"🍒", fruit:"Вишня",         weight:"2 г",    size:"2.3 см",  dev:"Малыш двигает ручками" },
  10: { emoji:"🍓", fruit:"Клубника",      weight:"4 г",    size:"3 см",    dev:"Формируются зубки" },
  11: { emoji:"🍋", fruit:"Лайм",          weight:"7 г",    size:"4 см",    dev:"Почки начинают работать" },
  12: { emoji:"🌰", fruit:"Слива",         weight:"14 г",   size:"5.4 см",  dev:"Виден пол при УЗИ" },
  13: { emoji:"🍑", fruit:"Персик",        weight:"23 г",   size:"7.4 см",  dev:"Малыш умеет сосать" },
  14: { emoji:"🍋", fruit:"Лимон",         weight:"43 г",   size:"8.7 см",  dev:"Мимика лица" },
  16: { emoji:"🥑", fruit:"Авокадо",       weight:"100 г",  size:"11.6 см", dev:"Слышит голоса" },
  18: { emoji:"🌶️", fruit:"Перец",        weight:"190 г",  size:"14.2 см", dev:"Активно шевелится" },
  20: { emoji:"🍌", fruit:"Банан",         weight:"300 г",  size:"16.4 см", dev:"Половина пути!" },
  22: { emoji:"🌽", fruit:"Кукуруза",      weight:"430 г",  size:"27 см",   dev:"Реагирует на звуки" },
  24: { emoji:"🌽", fruit:"Кукуруза",      weight:"600 г",  size:"30 см",   dev:"Открывает глазки" },
  26: { emoji:"🥬", fruit:"Кочан салата",  weight:"760 г",  size:"35 см",   dev:"Дышит амниотической жидкостью" },
  28: { emoji:"🍆", fruit:"Баклажан",      weight:"1 кг",   size:"37 см",   dev:"Видит свет сквозь живот" },
  30: { emoji:"🥦", fruit:"Брокколи",      weight:"1.3 кг", size:"40 см",   dev:"Накапливает жир" },
  32: { emoji:"🥥", fruit:"Кокос",         weight:"1.7 кг", size:"42 см",   dev:"Мозг быстро развивается" },
  34: { emoji:"🍍", fruit:"Ананас",        weight:"2.1 кг", size:"45 см",   dev:"Лёгкие почти готовы" },
  36: { emoji:"🥬", fruit:"Кочан капусты", weight:"2.6 кг", size:"47 см",   dev:"Опускается в таз" },
  38: { emoji:"🎃", fruit:"Тыква",         weight:"3 кг",   size:"49 см",   dev:"Готов к появлению на свет!" },
  40: { emoji:"🎃", fruit:"Тыква",         weight:"3.4 кг", size:"51 см",   dev:"Ждём встречи! 👶" },
};

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
const MONTHS_FULL  = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const SHORT_DAYS   = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return (d + 6) % 7; // пн=0
}
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  d.setHours(0,0,0,0);
  return d;
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function getPregnancyWeekData(weeks: number) {
  const keys = Object.keys(PREGNANCY_WEEK_DATA).map(Number).sort((a,b)=>a-b);
  const key = keys.reduce((prev,cur) => (cur <= weeks ? cur : prev), keys[0]);
  return PREGNANCY_WEEK_DATA[key] ?? PREGNANCY_WEEK_DATA[4];
}
function getCyclePhaseInfo(day: number | null) {
  if (!day || day < 1) return null;
  if (day <= 5)  return { phase:"Менструация",       color:"text-rose-500",   bg:"bg-rose-50 border-rose-200",     prob:2,  probLabel:"Очень низкая", bar:"bg-rose-400" };
  if (day <= 9)  return { phase:"Фолликулярная",     color:"text-orange-500", bg:"bg-orange-50 border-orange-200", prob:10, probLabel:"Низкая",       bar:"bg-orange-400" };
  if (day <= 11) return { phase:"Пред-овуляция",     color:"text-amber-600",  bg:"bg-amber-50 border-amber-200",   prob:30, probLabel:"Средняя",      bar:"bg-amber-400" };
  if (day <= 16) return { phase:"Овуляция 🌿",       color:"text-green-600",  bg:"bg-green-50 border-green-200",   prob:85, probLabel:"Высокая!",     bar:"bg-green-500" };
  if (day <= 21) return { phase:"Лютеиновая",        color:"text-teal-600",   bg:"bg-teal-50 border-teal-200",     prob:15, probLabel:"Низкая",       bar:"bg-teal-400" };
  if (day <= 28) return { phase:"Предменструальная", color:"text-purple-600", bg:"bg-purple-50 border-purple-200", prob:5,  probLabel:"Очень низкая", bar:"bg-purple-400" };
  return                 { phase:"Новый цикл скоро", color:"text-pink-500",   bg:"bg-pink-50 border-pink-200",     prob:5,  probLabel:"Очень низкая", bar:"bg-pink-400" };
}

// ─── Компонент ───────────────────────────────────────────────────────────────
export default function Index() {
  const today = new Date();

  // — Тема —
  const [themeId, setThemeId] = useState("rose");
  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  // — Вкладки —
  const [activeTab, setActiveTab] = useState<Tab>("cycle");

  // — Меню —
  const [menuOpen, setMenuOpen] = useState(false);

  // — Календарь-модал (полный) —
  const [calOpen, setCalOpen] = useState(false);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [calEvents, setCalEvents] = useState<Record<string, string>>({});
  const [newEvent, setNewEvent] = useState("");

  // — Мини-полоска: отступ недели (0 = текущая, -1 = прошлая, +1 = следующая) —
  const [weekOffset, setWeekOffset] = useState(0);

  // — Данные цикла —
  const [cycleStart, setCycleStart] = useState("");
  const [cycleEnd,   setCycleEnd]   = useState("");
  const [activeSymptoms, setActiveSymptoms] = useState<string[]>([]);
  const [note,       setNote]       = useState("");
  const [savedNote,  setSavedNote]  = useState("");
  const [showTips,   setShowTips]   = useState(false);
  const [showArticles, setShowArticles] = useState(false);

  // — Данные беременности —
  const [lastPeriod, setLastPeriod] = useState("");
  const [dueDate,    setDueDate]    = useState("");
  const [pregSymptoms, setPregSymptoms] = useState<string[]>([]);
  const [pregNote,   setPregNote]   = useState("");
  const [savedPregNote, setSavedPregNote] = useState("");
  const [showPregTips,  setShowPregTips]  = useState(false);
  const [showPregArticles, setShowPregArticles] = useState(false);

  // — Тема: применяем CSS-переменную через style на root —
  useEffect(() => {
    document.documentElement.style.setProperty("--app-primary", theme.primary);
  }, [theme]);

  // ── Вычисления ──────────────────────────────────────────────────────────────
  const weeksPregnant = lastPeriod
    ? Math.max(0, Math.floor((today.getTime() - new Date(lastPeriod).getTime()) / (7 * 86400000)))
    : null;

  const cycleDuration = cycleStart && cycleEnd
    ? Math.max(1, Math.ceil((new Date(cycleEnd).getTime() - new Date(cycleStart).getTime()) / 86400000))
    : null;

  const cycleDay = cycleStart
    ? Math.floor((today.getTime() - new Date(cycleStart).getTime()) / 86400000) + 1
    : null;

  const phaseInfo = getCyclePhaseInfo(cycleDay);

  // ── Неделя-полоска ──────────────────────────────────────────────────────────
  const weekBaseMonday = getMondayOfWeek(today);
  const weekStart = addDays(weekBaseMonday, weekOffset * 7);
  const weekDays7 = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // метки для дней
  const getDayMark = (dt: Date, mode: "cycle" | "conceive" | "pregnancy") => {
    if (mode !== "pregnancy" && cycleStart) {
      const s = new Date(cycleStart);
      const e = cycleEnd ? new Date(cycleEnd) : null;
      if (e && dt >= s && dt <= e) return "period";
      const ov = addDays(s, 14);
      if (isSameDay(dt, ov)) return "ovulation";
    }
    if (mode === "pregnancy" && lastPeriod) {
      const s = new Date(lastPeriod);
      const due = dueDate ? new Date(dueDate) : null;
      if (due && isSameDay(dt, due)) return "due";
      if (dt >= s && (!due || dt <= due)) return "pregnant";
    }
    return null;
  };

  // ── Полный календарь ────────────────────────────────────────────────────────
  const calCells = (): (number | null)[] => {
    const days = getDaysInMonth(calYear, calMonth);
    const first = getFirstDayOfMonth(calYear, calMonth);
    const cells: (number | null)[] = Array(first).fill(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    return cells;
  };
  const isCalToday = (d: number) =>
    d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

  const calKey = (d: number) => `${calYear}-${calMonth+1}-${d}`;

  const prevCalMonth = () => {
    if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11); }
    else setCalMonth(m => m-1);
  };
  const nextCalMonth = () => {
    if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0); }
    else setCalMonth(m => m+1);
  };

  // ── Helpers UI ───────────────────────────────────────────────────────────────
  const toggleSymptom = (s: string, isPreg = false) => {
    if (isPreg) setPregSymptoms(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);
    else        setActiveSymptoms(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);
  };

  const cycleArticles = ARTICLES.filter(a => a.tag !== "Беременность");
  const pregArticles  = ARTICLES.filter(a => ["Беременность","Симптомы","Активность"].includes(a.tag));

  // ── Стили темы (inline) ──────────────────────────────────────────────────────
  const bgStyle = { background: activeTab === "pregnancy" ? theme.pregBg : theme.bg };
  const cardStyle: React.CSSProperties = {
    background: theme.cardBg,
    backdropFilter: "blur(12px)",
    border: `1px solid ${theme.border}`,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  };
  const btnPrimary: React.CSSProperties = {
    background: theme.chipActive,
    color: theme.primaryFg,
    borderRadius: "50px",
    boxShadow: `0 4px 16px rgba(0,0,0,0.15)`,
    transition: "all .3s ease",
  };
  const tabActiveStyle: React.CSSProperties = {
    background: theme.tabActive,
    color: theme.primaryFg,
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  };

  // ── WeekStrip ────────────────────────────────────────────────────────────────
  const WeekStrip = ({ mode }: { mode: Tab }) => {
    const pregWeekData = (mode === "pregnancy" && weeksPregnant && weeksPregnant >= 4)
      ? getPregnancyWeekData(weeksPregnant) : null;

    const isCurrentWeek = weekOffset === 0;

    return (
      <div className="rounded-3xl p-4 space-y-4" style={cardStyle}>
        {/* Шапка */}
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${theme.primary}22` }}>
            <Icon name="CalendarRange" size={14} style={{ color: theme.primary }} />
          </span>
          <span className="font-display text-base text-foreground">
            {isCurrentWeek ? "Эта неделя" : weekOffset < 0 ? "Прошлая неделя" : "Следующая неделя"}
          </span>
          <span className="ml-auto text-xs text-muted-foreground font-body">
            {weekDays7[0].getDate()} – {weekDays7[6].getDate()} {MONTHS_SHORT[weekDays7[0].getMonth()]}
          </span>
        </div>

        {/* 7 дней + стрелки */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset(o => o-1)}
            className="w-7 h-7 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ background: `${theme.primary}18` }}
          >
            <Icon name="ChevronLeft" size={14} style={{ color: theme.primary }} />
          </button>
          <div className="grid grid-cols-7 gap-1 flex-1">
            {weekDays7.map((dt, i) => {
              const isNow  = isSameDay(dt, today);
              const mark   = getDayMark(dt, mode);
              const isPeriod   = mark === "period";
              const isOvul     = mark === "ovulation";
              const isDue      = mark === "due";
              const isPreg     = mark === "pregnant";

              let bg = "rgba(255,255,255,0.55)";
              let color = "inherit";
              let borderColor = "rgba(200,150,170,0.2)";
              if (isNow)     { bg = theme.primary; color = theme.primaryFg; borderColor = theme.primary; }
              else if (isPeriod)  { bg = "rgba(244,63,94,0.12)"; color = "#e11d48"; borderColor = "rgba(244,63,94,0.3)"; }
              else if (isOvul)    { bg = "rgba(34,197,94,0.12)"; color = "#16a34a"; borderColor = "rgba(34,197,94,0.3)"; }
              else if (isDue)     { bg = "#a855f7"; color = "#fff"; borderColor = "#a855f7"; }
              else if (isPreg)    { bg = "rgba(168,85,247,0.12)"; color = "#7c3aed"; borderColor = "rgba(168,85,247,0.3)"; }

              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-xs text-muted-foreground font-body">{SHORT_DAYS[i]}</span>
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center border transition-all"
                    style={{ background: bg, color, borderColor }}
                  >
                    <span className="text-sm font-medium font-body leading-none">{dt.getDate()}</span>
                  </div>
                  <span style={{ fontSize:"10px", minHeight:"14px", display:"block", textAlign:"center" }}>
                    {isPeriod ? "🩸" : isOvul ? "🌿" : isDue ? "👶" : isPreg ? "🤰" : ""}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setWeekOffset(o => o+1)}
            className="w-7 h-7 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ background: `${theme.primary}18` }}
          >
            <Icon name="ChevronRight" size={14} style={{ color: theme.primary }} />
          </button>
        </div>

        {/* Кнопка «К сегодня» если офсет != 0 */}
        {weekOffset !== 0 && (
          <button
            onClick={() => setWeekOffset(0)}
            className="text-xs font-body px-3 py-1.5 rounded-full border transition-all"
            style={{ borderColor: theme.primary, color: theme.primary, background: `${theme.primary}10` }}
          >
            К сегодняшней неделе
          </button>
        )}

        {/* Блок: день цикла + фаза + вероятность */}
        {mode !== "pregnancy" && (
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
                <div className={`h-2 rounded-full transition-all duration-700 ${phaseInfo.bar}`} style={{ width: `${phaseInfo.prob}%` }} />
              </div>
              <p className="text-right text-xs text-muted-foreground font-body mt-0.5">{phaseInfo.prob}%</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-sm text-muted-foreground font-body text-center">
              Укажите дату начала цикла, чтобы увидеть фазу и вероятность зачатия
            </div>
          )
        )}

        {/* Блок: данные плода */}
        {mode === "pregnancy" && (
          pregWeekData && weeksPregnant ? (
            <div className="rounded-2xl px-4 py-3 border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{pregWeekData.emoji}</span>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Неделя беременности</p>
                  <p className="text-2xl font-display text-purple-600 font-semibold">{weeksPregnant} нед.</p>
                  <p className="text-xs text-purple-500 font-body">{pregWeekData.dev}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:"Размер", value: pregWeekData.size },
                  { label:"Вес",    value: pregWeekData.weight },
                  { label:"Как",    value: pregWeekData.fruit },
                ].map(c => (
                  <div key={c.label} className="rounded-xl bg-white/70 px-2 py-2 text-center">
                    <p className="text-xs text-muted-foreground font-body">{c.label}</p>
                    <p className="text-sm font-semibold text-purple-600 font-body">{c.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 px-4 py-3 text-sm text-muted-foreground font-body text-center">
              Укажите дату последней менструации, чтобы увидеть данные о малыше
            </div>
          )
        )}

        {/* Легенда */}
        <div className="flex gap-3 flex-wrap">
          {mode !== "pregnancy" && <>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-body"><span className="w-2 h-2 rounded-full bg-rose-400 block"/>Менструация</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-body"><span className="w-2 h-2 rounded-full bg-green-400 block"/>Овуляция</span>
          </>}
          {mode === "pregnancy" && <>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-body"><span className="w-2 h-2 rounded-full bg-purple-400 block"/>Беременность</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-body"><span className="w-2 h-2 rounded-full bg-purple-600 block"/>Дата родов</span>
          </>}
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
            <span className="w-2 h-2 rounded-full block" style={{ background: theme.primary }} />Сегодня
          </span>
        </div>
      </div>
    );
  };

  // ── Полный Календарь (модал) ─────────────────────────────────────────────────
  const CalendarModal = () => {
    const cells = calCells();
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto" style={{ background:"rgba(0,0,0,0.25)", backdropFilter:"blur(6px)" }}>
        <div className="w-full max-w-sm rounded-3xl p-5 animate-slide-up space-y-4" style={{ ...cardStyle, background:"rgba(255,255,255,0.97)" }}>
          {/* Шапка */}
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-foreground">Календарь</h3>
            <button onClick={() => setCalOpen(false)} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
              <Icon name="X" size={16} className="text-rose-500" />
            </button>
          </div>

          {/* Навигация по месяцу */}
          <div className="flex items-center justify-between">
            <button onClick={prevCalMonth} className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
              <Icon name="ChevronLeft" size={16} style={{ color: theme.primary }} />
            </button>
            <span className="font-display text-base text-foreground">{MONTHS_FULL[calMonth]} {calYear}</span>
            <button onClick={nextCalMonth} className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
              <Icon name="ChevronRight" size={16} style={{ color: theme.primary }} />
            </button>
          </div>

          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-1">
            {SHORT_DAYS.map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground font-body py-1">{d}</div>
            ))}
          </div>

          {/* Ячейки */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const key = calKey(d);
              const hasEvent = !!calEvents[key];
              const isTd = isCalToday(d);
              const isSel = selectedDay === d;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(prev => prev === d ? null : d)}
                  className="aspect-square rounded-xl text-sm font-body transition-all relative flex flex-col items-center justify-center"
                  style={
                    isTd  ? { background: theme.primary, color: theme.primaryFg, fontWeight:600 } :
                    isSel ? { background: `${theme.primary}22`, color: theme.primary, fontWeight:500 } :
                            { background:"transparent" }
                  }
                >
                  {d}
                  {hasEvent && <span className="w-1 h-1 rounded-full absolute bottom-1" style={{ background: theme.primary }} />}
                </button>
              );
            })}
          </div>

          {/* Выбранный день — добавление события */}
          {selectedDay && (
            <div className="space-y-2">
              <p className="text-sm font-medium font-body text-foreground">
                {selectedDay} {MONTHS_FULL[calMonth]}
              </p>
              {calEvents[calKey(selectedDay)] && (
                <div className="rounded-2xl px-3 py-2 text-sm font-body flex items-center justify-between"
                  style={{ background:`${theme.primary}12`, color: theme.primary, border:`1px solid ${theme.primary}30` }}>
                  <span>{calEvents[calKey(selectedDay)]}</span>
                  <button onClick={() => {
                    const k = calKey(selectedDay);
                    setCalEvents(ev => { const n={...ev}; delete n[k]; return n; });
                  }}>
                    <Icon name="X" size={12} style={{ color: theme.primary }} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={newEvent}
                  onChange={e => setNewEvent(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && newEvent.trim()) {
                      setCalEvents(ev => ({ ...ev, [calKey(selectedDay)]: newEvent.trim() }));
                      setNewEvent("");
                    }
                  }}
                  placeholder="Добавить событие..."
                  className="flex-1 rounded-2xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-sm font-body focus:outline-none focus:ring-2"
                  style={{ focusRingColor: theme.primary } as React.CSSProperties}
                />
                <button
                  onClick={() => {
                    if (newEvent.trim()) {
                      setCalEvents(ev => ({ ...ev, [calKey(selectedDay)]: newEvent.trim() }));
                      setNewEvent("");
                    }
                  }}
                  className="px-4 py-2 rounded-2xl text-sm font-body font-medium transition-all"
                  style={btnPrimary}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Все события */}
          {Object.keys(calEvents).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-body font-semibold uppercase tracking-wide">Все события</p>
              {Object.entries(calEvents).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-body"
                  style={{ background:`${theme.primary}0E`, border:`1px solid ${theme.primary}22` }}>
                  <span className="text-muted-foreground">{k}</span>
                  <span style={{ color: theme.primary }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Секция меню: темы ────────────────────────────────────────────────────────
  const ThemeSection = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.25)", backdropFilter:"blur(6px)" }}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ ...cardStyle, background:"rgba(255,255,255,0.97)" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-foreground">Тема оформления</h3>
          <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
            <Icon name="X" size={16} className="text-rose-500" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => { setThemeId(t.id); setMenuOpen(false); }}
              className={`rounded-2xl overflow-hidden transition-all ${themeId === t.id ? "ring-2 ring-offset-2" : "hover:scale-[1.02]"}`}
              style={themeId === t.id ? { ringColor: t.primary } : {}}
            >
              <div className={`h-14 bg-gradient-to-br ${t.preview}`} />
              <div className="bg-white/90 py-2 px-3 flex items-center gap-2">
                <span className="text-base">{t.emoji}</span>
                <span className="text-sm font-body font-medium text-foreground">{t.name}</span>
                {themeId === t.id && <Icon name="Check" size={14} className="ml-auto text-green-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Боковое меню ─────────────────────────────────────────────────────────────
  const MENU_ITEMS = [
    { id:"cal",      label:"Календарь",           icon:"CalendarDays", action: () => { setCalOpen(true); setMenuOpen(false); } },
    { id:"theme",    label:"Тема оформления",      icon:"Palette",      action: () => { setShowTheme(true); setMenuOpen(false); } },
    { id:"tips-m",   label:"Персональные советы",  icon:"Sparkles",     action: () => { setShowTips(true); setShowPregTips(true); setMenuOpen(false); } },
    { id:"articles-m",label:"Библиотека статей",  icon:"BookOpen",     action: () => { setShowArticles(true); setShowPregArticles(true); setMenuOpen(false); } },
    { id:"remind",   label:"Напоминания",          icon:"Bell",         action: () => setMenuOpen(false) },
    { id:"settings", label:"Настройки",            icon:"Settings",     action: () => setMenuOpen(false) },
    { id:"privacy",  label:"Конфиденциальность",   icon:"Shield",       action: () => setMenuOpen(false) },
    { id:"access",   label:"Код доступа",          icon:"Lock",         action: () => setMenuOpen(false) },
    { id:"help",     label:"Помощь",               icon:"HelpCircle",   action: () => setMenuOpen(false) },
  ];

  const [showTheme, setShowTheme] = useState(false);

  // ── Карточки-утилиты ─────────────────────────────────────────────────────────
  const Card = ({ children, className = "", style: overrideStyle }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <div className={`rounded-3xl p-5 ${className}`} style={{ ...cardStyle, ...overrideStyle }}>{children}</div>
  );

  const CardHeader = ({ icon, title, action }: { icon: string; title: string; action?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${theme.primary}1A` }}>
          <Icon name={icon} size={16} style={{ color: theme.primary }} />
        </span>
        <h2 className="font-display text-lg text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );

  const Btn = ({ onClick, children, className = "", style: s = {} }: { onClick?: () => void; children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <button onClick={onClick} className={`w-full py-3 font-body font-medium text-sm rounded-full transition-all hover:opacity-90 active:scale-[0.98] ${className}`} style={{ ...btnPrimary, ...s }}>
      {children}
    </button>
  );

  const BtnGhost = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className="text-xs px-3 py-1.5 font-body rounded-full border transition-all hover:opacity-80"
      style={{ borderColor: theme.primary, color: theme.primary, background: `${theme.primary}10` }}>
      {children}
    </button>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden" style={bgStyle}>
      {/* декоративные лепестки */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-[50%_30%_50%_30%] opacity-50"
        style={{ background: `linear-gradient(135deg,${theme.primary}22,${theme.primary}0A)`, transform:"rotate(45deg)" }} />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 rounded-[50%_30%_50%_30%] opacity-30"
        style={{ background: `linear-gradient(135deg,${theme.primary}18,${theme.primary}06)`, transform:"rotate(-12deg)" }} />

      {/* Модалы */}
      {calOpen   && <CalendarModal />}
      {showTheme && <ThemeSection />}

      {/* Боковое меню */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="relative z-10 w-72 h-full bg-white/97 backdrop-blur-xl shadow-2xl flex flex-col">
            <div className="p-6 border-b border-pink-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-2xl" style={{ color: theme.primary }}>Луна 🌙</span>
                <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
                  <Icon name="X" size={16} className="text-rose-500" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-body">Трекер цикла и беременности</p>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {MENU_ITEMS.map(item => (
                <button key={item.id} onClick={item.action}
                  className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-pink-50 transition-colors text-left group">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors group-hover:opacity-80"
                    style={{ background: `${theme.primary}18` }}>
                    <Icon name={item.icon} size={15} style={{ color: theme.primary }} />
                  </span>
                  <span className="font-body text-sm text-foreground">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-pink-100">
              <p className="text-xs text-muted-foreground text-center font-body">Луна v1.0 • 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* Шапка */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-pink-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors hover:opacity-80"
            style={{ background:`${theme.primary}1A` }}>
            <Icon name="Menu" size={20} style={{ color: theme.primary }} />
          </button>
          <div className="text-center">
            <h1 className="font-display text-2xl leading-none" style={{ color: theme.primary }}>Луна</h1>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              {activeTab === "pregnancy" ? "Поддержка здоровья во время беременности" : "Поддержка здоровья и планирование"}
            </p>
          </div>
          {/* Кнопка-календарь справа */}
          <button
            onClick={() => setCalOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ background:`${theme.primary}1A` }}
          >
            <Icon name="CalendarDays" size={18} style={{ color: theme.primary }} />
          </button>
        </div>
      </header>

      {/* Табы */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-2 p-1.5 rounded-3xl bg-white/60 backdrop-blur border border-pink-100">
          {([
            { id:"cycle",     label:"Мой цикл",   icon:"Moon" },
            { id:"conceive",  label:"Забеременеть",icon:"Leaf" },
            { id:"pregnancy", label:"Беременность",icon:"Baby" },
          ] as { id:Tab; label:string; icon:string }[]).map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-medium font-body transition-all duration-300"
              style={activeTab === t.id ? tabActiveStyle : { background:"rgba(255,255,255,0.5)", color:"hsl(335,30%,50%)" }}>
              <Icon name={t.icon} size={13} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 animate-fade-in pb-14">

        {/* ===== МОЙ ЦИКЛ ===== */}
        {activeTab === "cycle" && (
          <>
            <WeekStrip mode="cycle" />

            <Card>
              <CardHeader icon="CalendarHeart" title="Даты цикла" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Начало</label>
                  <input type="date" value={cycleStart} onChange={e => setCycleStart(e.target.value)}
                    className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Окончание</label>
                  <input type="date" value={cycleEnd} onChange={e => setCycleEnd(e.target.value)}
                    className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none" />
                </div>
              </div>
              {cycleDuration !== null && (
                <div className="rounded-2xl px-4 py-2 mb-3 text-sm font-body" style={{ background:`${theme.primary}0E`, color: theme.primary }}>
                  Длительность: <strong>{cycleDuration} дней</strong>
                </div>
              )}
              <Btn>Сохранить</Btn>
            </Card>

            <Card>
              <CardHeader icon="HeartPulse" title="Симптомы"
                action={<BtnGhost>+ Добавить</BtnGhost>} />
              <div className="flex flex-wrap gap-2">
                {CYCLE_SYMPTOMS.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className="px-4 py-1.5 rounded-full text-sm font-body border transition-all"
                    style={activeSymptoms.includes(s)
                      ? { background: theme.chipActive, color:"#fff", borderColor:"transparent" }
                      : { background:"rgba(255,255,255,0.7)", color:"hsl(335,35%,45%)", borderColor:`${theme.primary}50` }
                    }>
                    {s}
                  </button>
                ))}
              </div>
              {activeSymptoms.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3 font-body">Выбрано: {activeSymptoms.length}</p>
              )}
            </Card>

            <Card>
              <CardHeader icon="PenLine" title="Заметки" />
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Как вы себя чувствуете сегодня?" rows={3}
                className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none mb-3" />
              {savedNote && (
                <div className="rounded-2xl px-4 py-2 mb-3 text-sm font-body" style={{ background:`${theme.primary}0E`, color: theme.primary }}>
                  💾 {savedNote}
                </div>
              )}
              <Btn onClick={() => { setSavedNote(note); setNote(""); }}>Сохранить заметку</Btn>
            </Card>

            <Card>
              <CardHeader icon="Sparkles" title="Советы по здоровью" />
              {showTips ? (
                <div className="space-y-3">
                  {CYCLE_TIPS.map((t, i) => (
                    <div key={i} className="rounded-2xl px-4 py-3 border" style={{ background:`${theme.primary}08`, borderColor:`${theme.primary}25` }}>
                      <p className="text-xs font-semibold mb-1 font-body" style={{ color: theme.primary }}>{t.phase}</p>
                      <p className="text-sm text-rose-700 font-body">{t.tip}</p>
                    </div>
                  ))}
                </div>
              ) : <Btn onClick={() => setShowTips(true)}>Получить советы</Btn>}
            </Card>

            <Card>
              <CardHeader icon="BookOpen" title="Статьи" />
              {showArticles ? (
                <div className="space-y-3">
                  {cycleArticles.map((a, i) => (
                    <div key={i} className="rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer border transition-colors hover:opacity-80"
                      style={{ background:`${theme.primary}06`, borderColor:`${theme.primary}22` }}>
                      <span className="text-xl">{a.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground font-body">{a.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-body" style={{ background:`${theme.primary}15`, color: theme.primary }}>{a.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <Btn onClick={() => setShowArticles(true)}>Читать статьи</Btn>}
            </Card>
          </>
        )}

        {/* ===== ЗАБЕРЕМЕНЕТЬ ===== */}
        {activeTab === "conceive" && (
          <>
            <WeekStrip mode="conceive" />

            <Card className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background:`linear-gradient(135deg,${theme.primary}30,${theme.primary}18)` }}>
                <Icon name="Leaf" size={28} style={{ color: theme.primary }} />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-2">Планирование беременности</h2>
              <p className="text-sm text-muted-foreground font-body mb-5">Отслеживайте овуляцию и повышайте шансы на зачатие</p>
              <div className="space-y-3 text-left">
                {[
                  { label:"Окно овуляции",       value:"14–16 день цикла", icon:"Target" },
                  { label:"Фертильные дни",       value:"12–17 день",       icon:"Star" },
                  { label:"Следующая менструация",
                    value: cycleStart
                      ? `~${new Date(new Date(cycleStart).getTime()+28*86400000).toLocaleDateString("ru-RU")}`
                      : "Укажите даты",
                    icon:"Calendar" },
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl px-4 py-3 flex items-center justify-between border"
                    style={{ background:`${theme.primary}08`, borderColor:`${theme.primary}22` }}>
                    <div className="flex items-center gap-2">
                      <Icon name={item.icon} size={15} style={{ color: theme.primary }} />
                      <span className="text-sm text-foreground font-body">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold font-body" style={{ color: theme.primary }}>{item.value}</span>
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
                ].map((tip, i) => (
                  <div key={i} className="rounded-2xl px-4 py-3 text-sm text-rose-700 font-body border"
                    style={{ background:`${theme.primary}06`, borderColor:`${theme.primary}18` }}>
                    {tip}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ===== БЕРЕМЕННОСТЬ ===== */}
        {activeTab === "pregnancy" && (
          <>
            <WeekStrip mode="pregnancy" />

            <Card style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.9),rgba(240,220,255,0.4))" }}>
              <CardHeader icon="Baby" title="Даты беременности" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Последняя менструация</label>
                  <input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)}
                    className="w-full rounded-2xl border border-purple-200 bg-purple-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Предполагаемые роды</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full rounded-2xl border border-purple-200 bg-purple-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none" />
                </div>
              </div>
              {weeksPregnant !== null && weeksPregnant > 0 && (
                <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 px-4 py-3 mb-3 text-center">
                  <p className="text-2xl font-display text-purple-600">{weeksPregnant} недель</p>
                  <p className="text-xs text-muted-foreground font-body">срок беременности</p>
                </div>
              )}
              <Btn style={{ background:"linear-gradient(135deg,hsl(270,60%,65%),hsl(300,50%,60%))" }}>Сохранить</Btn>
            </Card>

            <Card>
              <CardHeader icon="HeartPulse" title="Симптомы" action={<BtnGhost>+ Добавить</BtnGhost>} />
              <div className="flex flex-wrap gap-2">
                {PREGNANCY_SYMPTOMS.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s, true)}
                    className="px-4 py-1.5 rounded-full text-sm font-body border transition-all"
                    style={pregSymptoms.includes(s)
                      ? { background: theme.chipActive, color:"#fff", borderColor:"transparent" }
                      : { background:"rgba(255,255,255,0.7)", color:"hsl(335,35%,45%)", borderColor:`${theme.primary}50` }
                    }>
                    {s}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader icon="PenLine" title="Заметки" />
              <textarea value={pregNote} onChange={e => setPregNote(e.target.value)}
                placeholder="Запишите ощущения, вопросы для врача..." rows={3}
                className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none mb-3" />
              {savedPregNote && (
                <div className="rounded-2xl px-4 py-2 mb-3 text-sm font-body" style={{ background:`${theme.primary}0E`, color: theme.primary }}>
                  💾 {savedPregNote}
                </div>
              )}
              <Btn onClick={() => { setSavedPregNote(pregNote); setPregNote(""); }}>Сохранить заметку</Btn>
            </Card>

            <Card>
              <CardHeader icon="Sparkles" title="Советы по беременности" />
              {showPregTips ? (
                <div className="space-y-3">
                  {PREGNANCY_TIPS.map((t, i) => (
                    <div key={i} className="rounded-2xl px-4 py-3 border bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
                      <p className="text-xs font-semibold text-purple-500 mb-1 font-body">{t.week}</p>
                      <p className="text-sm text-rose-700 font-body">{t.tip}</p>
                    </div>
                  ))}
                </div>
              ) : <Btn onClick={() => setShowPregTips(true)}>Получить советы</Btn>}
            </Card>

            <Card>
              <CardHeader icon="BookOpen" title="Статьи" />
              {showPregArticles ? (
                <div className="space-y-3">
                  {pregArticles.map((a, i) => (
                    <div key={i} className="rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer border transition-colors hover:opacity-80"
                      style={{ background:"rgba(168,85,247,0.06)", borderColor:"rgba(168,85,247,0.22)" }}>
                      <span className="text-xl">{a.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground font-body">{a.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-body bg-purple-100 text-purple-500">{a.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <Btn onClick={() => setShowPregArticles(true)}>Читать статьи</Btn>}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}