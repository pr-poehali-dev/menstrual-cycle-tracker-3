import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "cycle" | "conceive" | "pregnancy";
type MenuSection =
  | "cycle-ovulation"
  | "charts"
  | "calendar"
  | "symptoms"
  | "tips"
  | "articles"
  | "reminders"
  | "settings"
  | "privacy"
  | "access"
  | "help"
  | "theme"
  | null;

const CYCLE_SYMPTOMS = [
  "Боль внизу живота", "Головная боль", "Вздутие", "Усталость",
  "Перепады настроения", "Тошнота", "Боль в груди", "Раздражительность",
  "Бессонница", "Ломота в теле",
];

const PREGNANCY_SYMPTOMS = [
  "Тошнота", "Усталость", "Токсикоз", "Изжога",
  "Боль в спине", "Отёки", "Частое мочеиспускание", "Головокружение",
  "Перепады настроения", "Тяга к еде",
];

const CYCLE_TIPS = [
  { phase: "Менструация", tip: "Пейте больше воды и отдыхайте. Тепло поможет снять спазмы." },
  { phase: "Фолликулярная", tip: "Отличное время для новых начинаний — энергия на подъёме!" },
  { phase: "Овуляция", tip: "Пик фертильности. Обратите внимание на изменения выделений." },
  { phase: "Лютеиновая", tip: "Больше магния поможет смягчить ПМС. Снизьте кофеин." },
];

const PREGNANCY_TIPS = [
  { week: "1–12 нед.", tip: "Принимайте фолиевую кислоту и избегайте стресса." },
  { week: "13–26 нед.", tip: "Самый комфортный период. Начните курсы для беременных." },
  { week: "27–40 нед.", tip: "Готовьте сумку в роддом и следите за шевелениями малыша." },
];

const ARTICLES = [
  { title: "Как читать свой цикл", tag: "Цикл", emoji: "🌸" },
  { title: "Питание при ПМС", tag: "Здоровье", emoji: "🥗" },
  { title: "Признаки овуляции", tag: "Фертильность", emoji: "🌿" },
  { title: "Первый триместр: что ожидать", tag: "Беременность", emoji: "👶" },
  { title: "Йога для беременных", tag: "Активность", emoji: "🧘" },
  { title: "Токсикоз: как справиться", tag: "Симптомы", emoji: "💊" },
];

const MENU_ITEMS = [
  { id: "cycle-ovulation", label: "Цикл и овуляция", icon: "Moon" },
  { id: "charts", label: "Графики и отчёты", icon: "BarChart2" },
  { id: "calendar", label: "Интерактивный календарь", icon: "CalendarDays" },
  { id: "symptoms", label: "Отслеживание симптомов", icon: "Heart" },
  { id: "tips", label: "Персональные советы", icon: "Sparkles" },
  { id: "articles", label: "Библиотека статей", icon: "BookOpen" },
  { id: "reminders", label: "Система напоминаний", icon: "Bell" },
  { id: "settings", label: "Настройки приложения", icon: "Settings" },
  { id: "privacy", label: "Конфиденциальность", icon: "Shield" },
  { id: "access", label: "Код доступа", icon: "Lock" },
  { id: "help", label: "Помощь", icon: "HelpCircle" },
  { id: "theme", label: "Сменить тему", icon: "Palette" },
];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("cycle");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>(null);

  const [cycleStart, setCycleStart] = useState("");
  const [cycleEnd, setCycleEnd] = useState("");
  const [activeSymptoms, setActiveSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [showArticles, setShowArticles] = useState(false);

  const [lastPeriod, setLastPeriod] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pregSymptoms, setPregSymptoms] = useState<string[]>([]);
  const [pregNote, setPregNote] = useState("");
  const [savedPregNote, setSavedPregNote] = useState("");
  const [showPregTips, setShowPregTips] = useState(false);
  const [showPregArticles, setShowPregArticles] = useState(false);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const monthNames = [
    "Январь","Февраль","Март","Апрель","Май","Июнь",
    "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
  ];
  const weekDays = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];

  const toggleSymptom = (s: string, isPreg = false) => {
    if (isPreg) {
      setPregSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
    } else {
      setActiveSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    return cells;
  };

  const isToday = (d: number) =>
    d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

  const weeksPregnant = lastPeriod
    ? Math.floor((new Date().getTime() - new Date(lastPeriod).getTime()) / (1000 * 60 * 60 * 24 * 7))
    : null;

  const cycleDays =
    cycleStart && cycleEnd
      ? Math.ceil((new Date(cycleEnd).getTime() - new Date(cycleStart).getTime()) / 86400000)
      : null;

  const renderSectionModal = () => {
    if (!activeSection) return null;

    const sectionContent: Record<string, { title: string; body: React.ReactNode }> = {
      "cycle-ovulation": {
        title: "Цикл и овуляция",
        body: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Средняя длина цикла: <span className="font-semibold text-primary">28 дней</span></p>
            <p className="text-sm text-muted-foreground">Овуляция обычно происходит за 14 дней до следующего цикла.</p>
            <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4 text-sm text-rose-700">
              💡 Отмечайте даты менструаций, чтобы точнее предсказывать овуляцию.
            </div>
          </div>
        ),
      },
      charts: {
        title: "Графики и отчёты",
        body: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Добавляйте данные о цикле — графики появятся автоматически.</p>
            <div className="flex gap-2 flex-wrap">
              {["Длина цикла","Симптомы","Температура","Настроение"].map(l => (
                <span key={l} className="symptom-chip">{l}</span>
              ))}
            </div>
          </div>
        ),
      },
      reminders: {
        title: "Напоминания",
        body: (
          <div className="space-y-3">
            {["Начало цикла","Овуляция","Приём витаминов","Визит к врачу"].map(r => (
              <div key={r} className="flex items-center justify-between rounded-2xl bg-pink-50 border border-pink-100 px-4 py-3">
                <span className="text-sm text-rose-800 font-body">{r}</span>
                <div className="w-10 h-5 rounded-full bg-pink-300 cursor-pointer relative flex-shrink-0">
                  <div className="absolute right-1 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        ),
      },
      settings: {
        title: "Настройки",
        body: (
          <div className="space-y-3">
            {["Язык: Русский","Единицы: Метрические","Первый день недели: Пн"].map(s => (
              <div key={s} className="rounded-2xl bg-pink-50 border border-pink-100 px-4 py-3 text-sm text-rose-800 font-body">{s}</div>
            ))}
          </div>
        ),
      },
      privacy: {
        title: "Конфиденциальность",
        body: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-body">Ваши данные хранятся только на устройстве. Мы не передаём их третьим лицам.</p>
            <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4 text-sm text-rose-700 font-body">🔒 Сквозное шифрование включено</div>
          </div>
        ),
      },
      access: {
        title: "Код доступа",
        body: (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">Защитите приложение 4-значным PIN-кодом.</p>
            <div className="flex gap-3 justify-center">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-12 h-12 rounded-2xl border-2 border-pink-200 bg-pink-50 flex items-center justify-center text-2xl text-primary">•</div>
              ))}
            </div>
          </div>
        ),
      },
      help: {
        title: "Помощь",
        body: (
          <div className="space-y-2">
            {["Как добавить симптомы?","Как настроить цикл?","Как читать график?","Связаться с поддержкой"].map(q => (
              <div key={q} className="rounded-2xl bg-pink-50 border border-pink-100 px-4 py-3 text-sm text-rose-800 font-body cursor-pointer hover:bg-pink-100 transition-colors">{q} →</div>
            ))}
          </div>
        ),
      },
      theme: {
        title: "Сменить тему",
        body: (
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "Роза", bg: "from-pink-200 to-rose-200" },
              { name: "Лаванда", bg: "from-purple-200 to-pink-200" },
              { name: "Персик", bg: "from-orange-100 to-pink-200" },
              { name: "Мята", bg: "from-teal-100 to-green-100" },
              { name: "Ночь", bg: "from-gray-800 to-slate-700" },
              { name: "Нежность", bg: "from-pink-100 to-white" },
            ].map(t => (
              <div key={t.name} className={`rounded-2xl h-16 bg-gradient-to-br ${t.bg} cursor-pointer border-2 border-transparent hover:border-primary transition-all flex items-end p-2`}>
                <span className="text-xs text-gray-700 font-body font-medium">{t.name}</span>
              </div>
            ))}
          </div>
        ),
      },
    };

    const section = sectionContent[activeSection] || {
      title: "Раздел",
      body: <p className="text-sm text-muted-foreground font-body">В разработке</p>,
    };

    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ background: "rgba(180,80,120,0.15)", backdropFilter: "blur(4px)" }}
      >
        <div className="card-soft rounded-3xl w-full max-w-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl text-foreground">{section.title}</h3>
            <button
              onClick={() => setActiveSection(null)}
              className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors"
            >
              <Icon name="X" size={16} className="text-rose-500" />
            </button>
          </div>
          {section.body}
        </div>
      </div>
    );
  };

  const CalendarBlock = () => (
    <div className="card-soft rounded-3xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
          <Icon name="CalendarDays" size={16} className="text-primary" />
        </span>
        <h2 className="font-display text-lg text-foreground">Календарь</h2>
      </div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
          <Icon name="ChevronLeft" size={16} className="text-rose-500" />
        </button>
        <span className="font-display text-base text-foreground">{monthNames[calMonth]} {calYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
          <Icon name="ChevronRight" size={16} className="text-rose-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground font-body py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar().map((d, i) => (
          <button
            key={i}
            onClick={() => d && setSelectedDay(d)}
            className={`aspect-square rounded-xl text-sm font-body transition-all ${
              !d ? "invisible" :
              isToday(d) ? "bg-primary text-white font-semibold shadow-sm" :
              selectedDay === d ? "bg-pink-200 text-rose-700 font-medium" :
              "hover:bg-pink-50 text-foreground"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      {selectedDay && (
        <div className="mt-3 rounded-2xl bg-pink-50 border border-pink-100 px-4 py-2 text-sm text-rose-700 font-body">
          {selectedDay} {monthNames[calMonth]} — нет событий
        </div>
      )}
    </div>
  );

  const cycleArticles = ARTICLES.filter(a => a.tag !== "Беременность");
  const pregArticles = ARTICLES.filter(a => ["Беременность","Симптомы","Активность"].includes(a.tag));

  return (
    <div className={`min-h-screen relative overflow-hidden ${activeTab === "pregnancy" ? "bg-pregnancy-gradient" : "bg-pink-gradient"}`}>
      <div className="petal-decoration -top-16 -right-16 rotate-45 opacity-60" />
      <div
        className="petal-decoration -bottom-20 -left-20 -rotate-12 opacity-40"
        style={{ background: "linear-gradient(135deg, rgba(200,130,220,0.15), rgba(255,182,193,0.1))" }}
      />

      {/* Sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div
            className="relative z-10 w-72 h-full bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col"
            style={{ animation: "slideUp 0.3s ease" }}
          >
            <div className="p-6 border-b border-pink-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-2xl text-primary">Луна 🌙</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors"
                >
                  <Icon name="X" size={16} className="text-rose-500" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-body">Трекер цикла и беременности</p>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {MENU_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id as MenuSection); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-pink-50 transition-colors text-left group"
                >
                  <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Icon name={item.icon} size={15} className="text-primary group-hover:text-white transition-colors" />
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

      {activeSection && renderSectionModal()}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-pink-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors"
          >
            <Icon name="Menu" size={20} className="text-rose-500" />
          </button>
          <div className="text-center">
            <h1 className="font-display text-2xl text-primary leading-none">Луна</h1>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              {activeTab === "pregnancy"
                ? "Поддержка здоровья во время беременности"
                : "Поддержка здоровья и планирование"}
            </p>
          </div>
          <button className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
            <Icon name="Bell" size={18} className="text-rose-400" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-2 p-1.5 rounded-3xl bg-white/60 backdrop-blur border border-pink-100">
          {(
            [
              { id: "cycle", label: "Мой цикл", icon: "Moon" },
              { id: "conceive", label: "Забеременеть", icon: "Leaf" },
              { id: "pregnancy", label: "Беременность", icon: "Baby" },
            ] as { id: Tab; label: string; icon: string }[]
          ).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-medium font-body transition-all duration-300 ${
                activeTab === t.id ? "tab-active" : "tab-inactive hover:bg-pink-50"
              }`}
            >
              <Icon name={t.icon} size={13} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 animate-fade-in pb-12">

        {/* === CYCLE === */}
        {activeTab === "cycle" && (
          <>
            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Icon name="CalendarHeart" size={16} className="text-primary" />
                </span>
                <h2 className="font-display text-lg text-foreground">Даты цикла</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Начало</label>
                  <input
                    type="date"
                    value={cycleStart}
                    onChange={e => setCycleStart(e.target.value)}
                    className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Окончание</label>
                  <input
                    type="date"
                    value={cycleEnd}
                    onChange={e => setCycleEnd(e.target.value)}
                    className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              {cycleDays !== null && (
                <div className="rounded-2xl bg-pink-50 border border-pink-100 px-4 py-2 mb-3 text-sm text-rose-700 font-body">
                  Длительность: <strong>{cycleDays} дней</strong>
                </div>
              )}
              <button className="btn-primary w-full py-3 font-body font-medium text-sm">
                Сохранить
              </button>
            </div>

            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Icon name="HeartPulse" size={16} className="text-primary" />
                  </span>
                  <h2 className="font-display text-lg text-foreground">Симптомы</h2>
                </div>
                <button className="btn-ghost-pink text-xs px-3 py-1.5 font-body">+ Добавить</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {CYCLE_SYMPTOMS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`symptom-chip ${activeSymptoms.includes(s) ? "active" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {activeSymptoms.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3 font-body">Выбрано: {activeSymptoms.length}</p>
              )}
            </div>

            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Icon name="PenLine" size={16} className="text-primary" />
                </span>
                <h2 className="font-display text-lg text-foreground">Заметки</h2>
              </div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Как вы себя чувствуете сегодня?"
                rows={3}
                className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-3"
              />
              {savedNote && (
                <div className="rounded-2xl bg-pink-50 border border-pink-100 px-4 py-2 mb-3 text-sm text-rose-700 font-body">
                  💾 {savedNote}
                </div>
              )}
              <button
                onClick={() => { setSavedNote(note); setNote(""); }}
                className="btn-primary w-full py-3 font-body font-medium text-sm"
              >
                Сохранить заметку
              </button>
            </div>

            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Icon name="Sparkles" size={16} className="text-primary" />
                </span>
                <h2 className="font-display text-lg text-foreground">Советы по здоровью</h2>
              </div>
              {showTips ? (
                <div className="space-y-3">
                  {CYCLE_TIPS.map((t, i) => (
                    <div key={i} className="rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 px-4 py-3">
                      <p className="text-xs font-semibold text-primary mb-1 font-body">{t.phase}</p>
                      <p className="text-sm text-rose-700 font-body">{t.tip}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={() => setShowTips(true)} className="btn-primary w-full py-3 font-body font-medium text-sm">
                  Получить советы
                </button>
              )}
            </div>

            <CalendarBlock />

            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Icon name="BookOpen" size={16} className="text-primary" />
                </span>
                <h2 className="font-display text-lg text-foreground">Статьи</h2>
              </div>
              {showArticles ? (
                <div className="space-y-3">
                  {cycleArticles.map((a, i) => (
                    <div key={i} className="rounded-2xl bg-gradient-to-r from-pink-50 to-white border border-pink-100 px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-pink-300 transition-colors">
                      <span className="text-xl">{a.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground font-body">{a.title}</p>
                        <span className="text-xs text-primary bg-pink-100 px-2 py-0.5 rounded-full font-body">{a.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={() => setShowArticles(true)} className="btn-primary w-full py-3 font-body font-medium text-sm">
                  Читать статьи
                </button>
              )}
            </div>
          </>
        )}

        {/* === CONCEIVE === */}
        {activeTab === "conceive" && (
          <>
            <div className="card-soft rounded-3xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center mx-auto mb-4">
                <Icon name="Leaf" size={28} className="text-primary" />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-2">Планирование беременности</h2>
              <p className="text-sm text-muted-foreground font-body mb-5">Отслеживайте овуляцию и повышайте шансы на зачатие</p>
              <div className="space-y-3 text-left">
                {[
                  { label: "Окно овуляции", value: "14–16 день цикла", icon: "Target" },
                  { label: "Фертильные дни", value: "12–17 день", icon: "Star" },
                  { label: "Следующая менструация", value: cycleStart ? `~${new Date(new Date(cycleStart).getTime() + 28 * 86400000).toLocaleDateString("ru-RU")}` : "Укажите даты", icon: "Calendar" },
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl bg-pink-50 border border-pink-100 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name={item.icon} size={15} className="text-primary" />
                      <span className="text-sm text-foreground font-body">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-rose-600 font-body">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Icon name="Sparkles" size={16} className="text-primary" />
                </span>
                <h2 className="font-display text-lg text-foreground">Советы для зачатия</h2>
              </div>
              <div className="space-y-3">
                {[
                  "🥦 Принимайте фолиевую кислоту за 3 месяца до планирования",
                  "🌡️ Измеряйте базальную температуру каждое утро",
                  "💧 Пейте не менее 2 литров воды в день",
                  "🧘 Снижайте уровень стресса — он влияет на овуляцию",
                ].map((tip, i) => (
                  <div key={i} className="rounded-2xl bg-gradient-to-r from-pink-50 to-white border border-pink-100 px-4 py-3 text-sm text-rose-700 font-body">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
            <CalendarBlock />
          </>
        )}

        {/* === PREGNANCY === */}
        {activeTab === "pregnancy" && (
          <>
            <div className="card-soft rounded-3xl p-5" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,220,255,0.4))" }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Icon name="Baby" size={16} className="text-purple-500" />
                </span>
                <h2 className="font-display text-lg text-foreground">Даты беременности</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Последняя менструация</label>
                  <input
                    type="date"
                    value={lastPeriod}
                    onChange={e => setLastPeriod(e.target.value)}
                    className="w-full rounded-2xl border border-purple-200 bg-purple-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-purple-300/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Предполагаемые роды</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full rounded-2xl border border-purple-200 bg-purple-50/50 px-3 py-2.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-purple-300/40"
                  />
                </div>
              </div>
              {weeksPregnant !== null && weeksPregnant > 0 && (
                <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 px-4 py-3 mb-3 text-center">
                  <p className="text-2xl font-display text-purple-600">{weeksPregnant} недель</p>
                  <p className="text-xs text-muted-foreground font-body">срок беременности</p>
                </div>
              )}
              <button
                className="btn-primary w-full py-3 font-body font-medium text-sm"
                style={{ background: "linear-gradient(135deg, hsl(270,60%,65%), hsl(300,50%,60%))" }}
              >
                Сохранить
              </button>
            </div>

            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Icon name="HeartPulse" size={16} className="text-primary" />
                  </span>
                  <h2 className="font-display text-lg text-foreground">Симптомы</h2>
                </div>
                <button className="btn-ghost-pink text-xs px-3 py-1.5 font-body">+ Добавить</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {PREGNANCY_SYMPTOMS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s, true)}
                    className={`symptom-chip ${pregSymptoms.includes(s) ? "active" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Icon name="PenLine" size={16} className="text-primary" />
                </span>
                <h2 className="font-display text-lg text-foreground">Заметки</h2>
              </div>
              <textarea
                value={pregNote}
                onChange={e => setPregNote(e.target.value)}
                placeholder="Запишите ощущения, вопросы для врача..."
                rows={3}
                className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-3"
              />
              {savedPregNote && (
                <div className="rounded-2xl bg-pink-50 border border-pink-100 px-4 py-2 mb-3 text-sm text-rose-700 font-body">
                  💾 {savedPregNote}
                </div>
              )}
              <button
                onClick={() => { setSavedPregNote(pregNote); setPregNote(""); }}
                className="btn-primary w-full py-3 font-body font-medium text-sm"
              >
                Сохранить заметку
              </button>
            </div>

            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Icon name="Sparkles" size={16} className="text-purple-500" />
                </span>
                <h2 className="font-display text-lg text-foreground">Советы по беременности</h2>
              </div>
              {showPregTips ? (
                <div className="space-y-3">
                  {PREGNANCY_TIPS.map((t, i) => (
                    <div key={i} className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 px-4 py-3">
                      <p className="text-xs font-semibold text-purple-500 mb-1 font-body">{t.week}</p>
                      <p className="text-sm text-rose-700 font-body">{t.tip}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={() => setShowPregTips(true)} className="btn-primary w-full py-3 font-body font-medium text-sm">
                  Получить советы
                </button>
              )}
            </div>

            <CalendarBlock />

            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Icon name="BookOpen" size={16} className="text-primary" />
                </span>
                <h2 className="font-display text-lg text-foreground">Статьи</h2>
              </div>
              {showPregArticles ? (
                <div className="space-y-3">
                  {pregArticles.map((a, i) => (
                    <div key={i} className="rounded-2xl bg-gradient-to-r from-purple-50 to-white border border-purple-100 px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-purple-300 transition-colors">
                      <span className="text-xl">{a.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground font-body">{a.title}</p>
                        <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full font-body">{a.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={() => setShowPregArticles(true)} className="btn-primary w-full py-3 font-body font-medium text-sm">
                  Читать статьи
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
