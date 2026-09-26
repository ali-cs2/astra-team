import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useId,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  MapPin,
  ChartBar,
  Leaf,
  Presentation,
  X,
  CaretLeft,
  CaretRight,
  ArrowsOut,
  ArrowUpRight,
  SlidersHorizontal,
  ArrowCounterClockwise,
  List,
  SunDim,
  GlobeHemisphereEast,
  Broadcast,
} from "@phosphor-icons/react";
import locations from "./data/locations.json";
import contributors from "./data/sourceContributions.json";
import rules from "./data/simulationScenarios.json";
import science from "./data/science.json";
import research from "./data/research.json";
import caseStudy from "./data/caseStudy.json";
import { powerReduction } from "./lib/scenario";
import { distanceKm, WEATHER_URL } from "./lib/observations";
import { useObservations } from "./components/ObservationProvider";
import { NightMap } from "./components/NightMap";
import { LampHero } from "./components/LampHero";
import { SpaceBackground } from "./components/SpaceBackground";
import { CrescentFinder } from "./components/CrescentFinder";
import { ObservationPlanner } from "./components/ObservationPlanner";
const Language = createContext(false);
function useText() {
  const ar = useContext(Language);
  return (en: string, arabic: string) => (ar ? arabic : en);
}
const storyIds = [
  "hero",
  "problem",
  "impact",
  "growth",
  "solution",
  "crescent",
  "lighting",
  "map",
  "observe",
  "planner",
  "sources",
  "improve",
  "case-study",
  "science",
  "final",
];
const storyNames = [
  ["Introduction", "المقدمة"],
  ["The problem", "المشكلة"],
  ["Why it matters here", "لماذا يهمنا"],
  ["A changing night", "ليل يتغير"],
  ["The solution", "الحل"],
  ["See for yourself", "شاهد بنفسك"],
  ["Change the light", "غيّر الضوء"],
  ["Explore the night", "استكشف الليل"],
  ["Find a better sky", "اختر موقع الرصد"],
  ["Plan the night", "خطط للرصد"],
  ["Trace the light", "تتبّع الضوء"],
  ["Test a change", "اختبر التغيير"],
  ["A night over Muscat", "ليلة مبنية على الدليل"],
  ["The science", "الأساس العلمي"],
  ["Protect the sky", "احمِ السماء"],
];
const urbanImage = "/images/observations/muscat-2012.webp",
  darkImage = "/images/observations/muscat-2016.webp";
function go(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  });
}
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
function Heading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <Eyebrow>{label}</Eyebrow>
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}
function Count({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(() =>
    typeof window !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
      ? value
      : 0,
  );
  const element = useRef<HTMLSpanElement>(null);
  const last = useRef(0);
  const started = useRef(false);
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      last.current = value;
      started.current = true;
      return;
    }
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const animate = (from: number) => {
      const start = performance.now();
      const duration = 900;
      const scale = 10 ** decimals;
      const tick = (time: number) => {
        const progress = Math.min(1, (time - start) / duration);
        const eased = 1 - (1 - progress) ** 4;
        const next = from + (value - from) * eased;
        last.current = next;
        setDisplay(
          progress === 1 ? value : Math.round(next * scale) / scale,
        );
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    if (started.current) {
      animate(last.current);
    } else if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            started.current = true;
            observer?.disconnect();
            animate(0);
          }
        },
        { threshold: 0.25 },
      );
      observer.observe(node);
    } else {
      started.current = true;
      animate(0);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [value, decimals]);
  const formatted = (number: number) =>
    number.toLocaleString("en", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  return (
    <span
      className="count-up-value"
      ref={element}
      aria-live="off"
      aria-label={formatted(value)}
    >
      {formatted(display)}
    </span>
  );
}
function Comparison() {
  const t = useText();
  const [split, setSplit] = useState(50);
  return (
    <div className="comparison" dir="ltr">
      <img
        src="/images/observations/northern-oman-2016.webp"
        alt={t(
          "NASA VIIRS Black Marble view of northern Oman, 2016",
          "صورة NASA VIIRS Black Marble لشمال عُمان، 2016",
        )}
        loading="lazy"
        width="911"
        height="317"
      />
      <img
        className="comparison-before"
        src="/images/observations/northern-oman-2012.webp"
        alt=""
        loading="lazy"
        width="911"
        height="317"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      />
      <span className="comparison-label left">
        {t("NASA · 2012", "NASA · 2012")}
      </span>
      <span className="comparison-label right">
        {t("NASA · 2016", "NASA · 2016")}
      </span>
      <div className="comparison-divider" style={{ left: `${split}%` }}>
        <span>
          <CaretLeft />
          <CaretRight />
        </span>
      </div>
      <input
        type="range"
        min="4"
        max="96"
        value={split}
        onChange={(e) => setSplit(+e.target.value)}
        aria-label={t(
          "Compare NASA observations from 2012 and 2016",
          "قارن صور NASA من 2012 و2016",
        )}
        aria-valuetext={`${split}% ${t("2012 imagery", "صور 2012")}`}
      />
    </div>
  );
}

function number(value: number | null | undefined, digits = 0) {
  return value == null
    ? "—"
    : value.toLocaleString("en", { maximumFractionDigits: digits });
}
function DataCredit({ refresh = false }: { refresh?: boolean }) {
  const t = useText(),
    data = useObservations();
  return (
    <div className="data-credit" role="status">
      <span className={`data-status ${data.status}`} />
      <span>
        {data.status === "loading"
          ? t("Updating forecast…", "جارٍ تحديث التوقعات…")
          : data.status === "live"
            ? t("Forecast received from API", "توقعات مستلمة من API")
            : data.status === "cached"
              ? t(
                  "Saved API response · connection unavailable",
                  "استجابة API محفوظة · الاتصال غير متاح",
                )
              : t("Forecast unavailable", "التوقعات غير متاحة")}
        {data.packet && (
          <small>
            {t("Retrieved: ", "وقت الاستلام: ")}
            {new Date(data.packet.fetchedAt).toLocaleString("en-GB", {
              timeZone: "Asia/Muscat",
              dateStyle: "short",
              timeStyle: "short",
            })}{" "}
            GST
          </small>
        )}
        <small>
          {t("Forecast for ", "توقعات لـ ")}
          {data.time.replace("T", " · ")} GST (UTC+4)
        </small>
        {data.packet && !data.get("muscat") && (
          <small>
            {t(
              "Saved forecast does not cover this night; values unavailable.",
              "التوقعات المحفوظة لا تغطي هذه الليلة؛ القيم غير متاحة.",
            )}
          </small>
        )}
        <a
          href="https://open-meteo.com/en/docs"
          target="_blank"
          rel="noreferrer"
        >
          Open‑Meteo · CC BY 4.0 ↗
        </a>
      </span>
      {refresh && (
        <button
          className="button outline data-refresh"
          disabled={data.status === "loading"}
          onClick={data.refresh}
        >
          <ArrowCounterClockwise size={16} />
          {t("Refresh", "تحديث")}
        </button>
      )}
    </div>
  );
}
function LocationPanel({ selected }: { selected: string }) {
  const ar = useContext(Language),
    t = useText(),
    site = locations.find((l) => l.id === selected)!,
    data = useObservations(),
    r = data.get(selected);
  return (
    <div className="location-panel real-location">
      <Eyebrow>{t("SELECTED LOCATION", "الموقع المختار")}</Eyebrow>
      <h3>{site.name[ar ? 1 : 0]}</h3>
      <small className="coordinate-label" dir="ltr">
        {site.coordinates[0].toFixed(3)}° N · {site.coordinates[1].toFixed(3)}°
        E
      </small>
      <div className="large-score">
        {r?.cloud == null ? "—" : <Count value={Math.round(r.cloud)} />}
        <span>%</span>
      </div>
      <p className="muted">
        {t(
          "Forecast cloud cover · 20:00 GST",
          "توقعات الغطاء السحابي · 20:00 بتوقيت عُمان",
        )}
      </p>
      <dl>
        <div>
          <dt>{t("Relative humidity", "الرطوبة النسبية")}</dt>
          <dd dir="ltr">{number(r?.humidity)} %</dd>
        </div>
        <div>
          <dt>{t("Visibility", "مدى الرؤية")}</dt>
          <dd dir="ltr">
            {number(r?.visibility == null ? null : r.visibility / 1000, 1)} km
          </dd>
        </div>
        <div>
          <dt>{t("Model elevation", "ارتفاع خلية النموذج")}</dt>
          <dd dir="ltr">{number(r?.elevation)} m</dd>
        </div>
        <div>
          <dt>{t("Sunset / next sunrise", "الغروب / شروق اليوم التالي")}</dt>
          <dd dir="ltr">
            {r?.sunset?.slice(11) ?? "—"} / {r?.sunrise?.slice(11) ?? "—"}
          </dd>
        </div>
      </dl>
      <p className="location-source">
        {t("Ground sky brightness (SQM)", "سطوع السماء بقياس أرضي (SQM)")}
        <strong>
          {t("No local measurement connected", "لا يوجد قياس محلي مربوط")}
        </strong>
      </p>
      <DataCredit />
    </div>
  );
}
function Recommendations({
  selected,
  onSelect,
  compact = false,
}: {
  selected: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const ar = useContext(Language),
    t = useText(),
    data = useObservations(),
    r = data.get(selected);
  const ranked = [...locations].sort(
    (a, b) =>
      (data.get(a.id)?.cloud ?? Infinity) - (data.get(b.id)?.cloud ?? Infinity),
  );
  const fields = [
    [t("Cloud cover", "الغطاء السحابي"), number(r?.cloud), "%"],
    [t("Relative humidity", "الرطوبة النسبية"), number(r?.humidity), "%"],
    [
      t("Visibility", "مدى الرؤية"),
      number(r?.visibility == null ? null : r.visibility / 1000, 1),
      "km",
    ],
    [t("Model elevation", "ارتفاع خلية النموذج"), number(r?.elevation), "m"],
  ];
  return (
    <div className={`recommendations ${compact ? "compact" : ""}`}>
      <div className="site-list">
        {ranked.map((l, i) => (
          <button
            key={l.id}
            className={`site-row ${selected === l.id ? "active" : ""}`}
            onClick={() => onSelect(l.id)}
            aria-pressed={selected === l.id}
          >
            <span className="site-number">0{i + 1}</span>
            <span className="site-name">
              {l.short[ar ? 1 : 0]}
              <small>
                {t("Forecast cloud cover", "توقعات الغطاء السحابي")}
              </small>
            </span>
            <span className="site-score teal">
              {data.get(l.id)?.cloud == null ? (
                "—"
              ) : (
                <Count value={Math.round(data.get(l.id)!.cloud!)} />
              )}
              <small>%</small>
            </span>
            <ArrowUpRight size={20} />
          </button>
        ))}
      </div>
      <div className="factor-panel">
        <h4>{t("Conditions at this location", "الظروف في هذا الموقع")}</h4>
        <p>
          {t(
            "Sorted by lowest forecast cloud cover at 20:00. These are weather forecasts, not an overall observing score.",
            "الترتيب حسب أقل غطاء سحابي متوقع عند 20:00. هذه توقعات طقس وليست درجة شاملة لجودة الرصد.",
          )}
        </p>
        <dl className="real-factors">
          {fields.map(([label, value, unit]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd dir="ltr">
                {value} <small>{unit}</small>
              </dd>
            </div>
          ))}
        </dl>
        <small className="factor-note">
          {t(
            "Weather models use a nearby grid cell. Moonlight, seeing, local lights and access are not evaluated.",
            "تستخدم النماذج خلية شبكية قريبة. لا يشمل الترتيب القمر أو الاضطراب الجوي أو الإنارة المحلية أو إمكانية الوصول.",
          )}
        </small>
        <DataCredit />
      </div>
    </div>
  );
}
function Sources({
  selected,
  onSelect,
  highlighted,
  onHighlight,
}: {
  selected: string;
  onSelect: (id: string) => void;
  highlighted: string;
  onHighlight: (id: string) => void;
}) {
  const fieldId = useId(),
    ar = useContext(Language),
    t = useText(),
    site = locations.find((l) => l.id === selected)!;
  const places = [...contributors].sort(
    (a, b) =>
      distanceKm(site.coordinates, a.coordinates) -
      distanceKm(site.coordinates, b.coordinates),
  );
  const chosen = contributors.find((c) => c.id === highlighted);
  return (
    <div className="source-controls">
      <label className="field-label" htmlFor={fieldId}>
        {t("Observation location", "موقع الرصد")}
      </label>
      <select
        id={fieldId}
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
      >
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name[ar ? 1 : 0]}
          </option>
        ))}
      </select>
      <p className="muted small">
        {t(
          "Straight-line distance to mapped settlement points",
          "المسافة بخط مستقيم إلى نقاط المدن المرسومة",
        )}
      </p>
      <div className="contribution-list">
        {places.map((c) => (
          <button
            key={c.id}
            className={`contribution ${highlighted === c.id ? "active" : ""}`}
            onClick={() => onHighlight(c.id)}
            aria-pressed={highlighted === c.id}
          >
            <span className="source-color" style={{ background: c.color }} />
            <span>{c.name[ar ? 1 : 0]}</span>
            <strong dir="ltr">
              {distanceKm(site.coordinates, c.coordinates).toFixed(1)}
              <small>km</small>
            </strong>
          </button>
        ))}
      </div>
      <p className="muted small">
        {t(
          "Lines show geographic distance only. Satellite imagery does not establish each city's share of skyglow.",
          "الخطوط توضّح المسافة الجغرافية فقط. الصور الفضائية لا تحدد نسبة مساهمة كل مدينة في توهج السماء.",
        )}
      </p>
      <p className="source-links">
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          © OpenStreetMap contributors · ODbL ↗
        </a>
        {chosen && (
          <a href={chosen.url} target="_blank" rel="noreferrer">
            {t("View selected place source", "شاهد مصدر الموقع المختار")} ↗
          </a>
        )}
      </p>
    </div>
  );
}
function Simulator({
  compact = false,
  selected,
  onSelect,
}: {
  compact?: boolean;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const ar = useContext(Language),
    t = useText(),
    [choice, setChoice] = useState(0),
    [before, setBefore] = useState(rules.beforePowerPercent),
    [after, setAfter] = useState(rules.afterPowerPercent);
  const measurement = rules.measurementSites[choice];
  const data = useObservations(),
    reading = data.get(selected);
  const site = locations.find((l) => l.id === selected)!;
  const matchesStudy =
    before === rules.beforePowerPercent && after === rules.afterPowerPercent;
  const reduction = powerReduction(before, after);
  const id = useId();
  return (
    <div className={`simulator evidence-study ${compact ? "compact" : ""}`}>
      <div className="sim-controls">
        <div className="sim-controls-title">
          <h3>{t("Try a lighting change", "جرّب تغيير الإنارة")}</h3>
        </div>
        <label className="scenario-location" htmlFor={`${id}-location`}>
          {t(
            "Selected location · linked to the tools above",
            "الموقع المختار · مرتبط بالأدوات أعلاه",
          )}
        </label>
        <select
          id={`${id}-location`}
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name[ar ? 1 : 0]}
            </option>
          ))}
        </select>
        <p>
          {t(
            "Adjust fixture power to see the calculated reduction immediately. Compare with a published experiment.",
            "غيّر قدرة المصابيح وشاهد الانخفاض المحسوب مباشرة. وقارن مع تجربة منشورة.",
          )}
        </p>
        <div className="dimming-inputs">
          <label htmlFor={`${id}-before`}>
            {t("Before dimming", "قبل التخفيف")}{" "}
            <strong dir="ltr">{before}%</strong>
          </label>
          <input
            id={`${id}-before`}
            aria-label={t("Power before dimming", "القدرة قبل التخفيف")}
            type="range"
            min="1"
            max="100"
            value={before}
            onChange={(e) => {
              const n = Number(e.target.value);
              setBefore(n);
              setAfter((a) => Math.min(a, n));
            }}
          />
          <label htmlFor={`${id}-after`}>
            {t("After dimming", "بعد التخفيف")}{" "}
            <strong dir="ltr">{after}%</strong>
          </label>
          <input
            id={`${id}-after`}
            aria-label={t("Power after dimming", "القدرة بعد التخفيف")}
            type="range"
            min="0"
            max={before}
            value={after}
            onChange={(e) => setAfter(Number(e.target.value))}
          />
        </div>
        <fieldset className="temperature study-sites">
          <legend>
            {t("Tucson reference measurement", "القياس المرجعي من توسان")}
          </legend>
          {rules.measurementSites.map((m, i) => (
            <button
              key={m.id}
              className={choice === i ? "active" : ""}
              aria-pressed={choice === i}
              onClick={() => setChoice(i)}
            >
              {m.name[ar ? 1 : 0]}
            </button>
          ))}
        </fieldset>
        <button
          className="button primary simulate-button"
          onClick={() => {
            setBefore(rules.beforePowerPercent);
            setAfter(rules.afterPowerPercent);
            setChoice(0);
          }}
        >
          {t("Reset to published settings", "استرجع الإعدادات المنشورة")}
          <ArrowCounterClockwise size={19} />
        </button>
        <a
          className="study-source"
          href={rules.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Barentine et al. · 2020 ↗
        </a>
      </div>
      <div className="sim-output">
        <div className="scenario-weather" aria-live="polite">
          <div>
            <strong>{site.name[ar ? 1 : 0]}</strong>
            <small>
              {data.time.replace("T", " · ")} GST · Open-Meteo · {data.status}
            </small>
          </div>
          <span>
            {t("Clouds", "السحب")}{" "}
            <b>
              {reading?.cloud ?? "—"}
              {reading?.cloud != null ? "%" : ""}
            </b>
          </span>
          <span>
            {t("Humidity", "الرطوبة")}{" "}
            <b>
              {reading?.humidity ?? "—"}
              {reading?.humidity != null ? "%" : ""}
            </b>
          </span>
          <span>
            {t("Visibility", "الرؤية")}{" "}
            <b>
              {reading?.visibility != null
                ? `${(reading.visibility / 1000).toFixed(1)} km`
                : "—"}
            </b>
          </span>
        </div>
        <div className="experiment-bars">
          <Eyebrow>
            {matchesStudy
              ? t(
                  "PUBLISHED SETTINGS · TUCSON 2019",
                  "إعدادات منشورة · توسان 2019",
                )
              : t("YOUR INPUTS · POWER CALCULATION", "مدخلاتك · حساب القدرة")}
          </Eyebrow>
          {[before, after].map((v, i) => (
            <div key={i}>
              <span>
                {i === 0
                  ? t("Before", "قبل")
                  : t("After dimming", "بعد التخفيف")}
              </span>
              <div className="power-track">
                <i style={{ width: `${v}%` }} />
              </div>
              <strong dir="ltr">{v}%</strong>
            </div>
          ))}
          <small>
            {t(
              "Percent of the affected fixtures' full power draw",
              "نسبة من القدرة الكهربائية الكاملة للمصابيح المشمولة",
            )}
          </small>
        </div>
        <div className="measured-result" aria-live="polite">
          <span>
            {t(
              "Calculated reduction in affected fixtures’ power",
              "الانخفاض المحسوب في قدرة المصابيح المشمولة",
            )}
          </span>
          <strong className="teal" dir="ltr">
            {reduction}%
          </strong>
          <small>
            {t(
              "Updates as you move the sliders",
              "يتحدث مباشرة عند تحريك السلايدر",
            )}
          </small>
        </div>
        <div className="improvement-row">
          <div>
            <span>
              {t(
                "Measured sky brightness decrease · Tucson",
                "انخفاض سطوع السماء المقاس · توسان",
              )}
            </span>
            <strong className="teal" dir="ltr">
              −{measurement.skyBrightnessDecrease} ± {measurement.uncertainty}%
            </strong>
            <small>{measurement.name[ar ? 1 : 0]} · 90% → 30%</small>
          </div>
          <div>
            <span>{t("Experiment scale", "حجم التجربة")}</span>
            <strong dir="ltr">≈20,000</strong>
            <small>{t("roadway luminaires", "مصباح طريق")}</small>
          </div>
        </div>
        <p className="muted small sim-note">
          {t(
            "Local weather follows your selected location; dimming does not change the weather forecast. Power reduction = (before − after) / before. The Tucson sky measurement applies only to the published 90% → 30% experiment; no local sky-brightness prediction is available.",
            "الطقس يتبع الموقع المختار؛ تخفيف الإنارة لا يغير توقعات الطقس. انخفاض القدرة = (قبل − بعد) / قبل. قياس سماء توسان يخص تجربة 90% ← 30% المنشورة فقط؛ لا يتوفر توقع محلي لسطوع السماء.",
          )}
        </p>
      </div>
    </div>
  );
}
function Demo({
  onClose,
  selected,
  onSelect: setSelected,
}: {
  onClose: () => void;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const ar = useContext(Language),
    t = useText();
  const [tab, setTab] = useState(0),
    [highlighted, setHighlighted] = useState("center");
  const root = useRef<HTMLDivElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.current?.querySelector<HTMLButtonElement>(".demo-close")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const all = root.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"]),select,input,a[href],[tabindex="0"]',
        );
        if (!all?.length) return;
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="demo-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-title"
      ref={root}
    >
      <div className="demo-header">
        <div>
          <span className="wordmark">ASTRA</span>
          <span id="demo-title">{t("Explore the night", "استكشف الليل")}</span>
        </div>
        <button
          className="icon-button demo-close"
          onClick={onClose}
          aria-label={t("Close demo", "أغلق التجربة")}
        >
          <X size={25} />
        </button>
      </div>
      <div
        className="demo-tabs"
        role="tablist"
        aria-label={t("ASTRA tools", "أدوات ASTRA")}
      >
        {[
          ["Observe", "الرصد"],
          ["Sources", "المصادر"],
          ["Improve", "التحسين"],
        ].map((item, i) => (
          <button
            key={i}
            id={`demo-tab-${i}`}
            role="tab"
            aria-selected={tab === i}
            aria-controls="demo-panel"
            tabIndex={tab === i ? 0 : -1}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 2
                      : (tab + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                setTab(next);
                document.getElementById(`demo-tab-${next}`)?.focus();
              }
            }}
            className={tab === i ? "active" : ""}
            onClick={() => {
              setTab(i);
            }}
          >
            {`0${i + 1}`} {t(item[0], item[1])}
          </button>
        ))}
      </div>
      <div
        className="demo-body"
        id="demo-panel"
        role="tabpanel"
        aria-labelledby={`demo-tab-${tab}`}
      >
        <div className="demo-map">
          <NightMap
            selected={selected}
            onSelect={setSelected}
            ar={ar}
            mode={tab === 1 ? "sources" : "pollution"}
            highlighted={highlighted}
          />
          <div className="demo-location">
            <LocationPanel selected={selected} />
          </div>
        </div>
        <aside className="demo-sidebar">
          {tab === 0 ? (
            <Recommendations
              selected={selected}
              onSelect={setSelected}
              compact
            />
          ) : tab === 1 ? (
            <Sources
              selected={selected}
              onSelect={setSelected}
              highlighted={highlighted}
              onHighlight={setHighlighted}
            />
          ) : (
            <Simulator compact selected={selected} onSelect={setSelected} />
          )}
        </aside>
      </div>
      <div className="demo-bottom">
        {t(
          "Oman geography and weather · NASA historical night lights · Published Tucson lighting experiment.",
          "جغرافيا وطقس عُمان · إنارة NASA التاريخية · تجربة إنارة منشورة من توسان.",
        )}
      </div>
    </div>
  );
}
function CaseStudy() {
  const t = useText();
  const data = useObservations();
  const [step, setStep] = useState(0);
  const steps = caseStudy.map((s) => s.title),
    explanations = caseStudy.map((s) => s.description),
    labels = caseStudy.map((s) => s.label);
  return (
    <>
      <div
        className="case-tabs"
        role="tablist"
        aria-label={t(
          "Data and evidence story steps",
          "خطوات قصة البيانات والدليل",
        )}
      >
        {steps.map((s, i) => (
          <button
            key={i}
            id={`case-tab-${i}`}
            role="tab"
            tabIndex={step === i ? 0 : -1}
            aria-selected={step === i}
            aria-controls="case-panel"
            className={step === i ? "active" : ""}
            onClick={() => setStep(i)}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 4
                      : (step + (e.key === "ArrowRight" ? 1 : 4)) % 5;
                setStep(next);
                document.getElementById(`case-tab-${next}`)?.focus();
              }
            }}
          >
            <span>0{i + 1}</span>
            {t(s[0], s[1])}
          </button>
        ))}
      </div>
      <div
        className="case-stage"
        role="tabpanel"
        id="case-panel"
        aria-labelledby={`case-tab-${step}`}
      >
        {step < 3 && (
          <img
            src={darkImage}
            alt={t(
              "NASA historical night-light composite over northern Oman",
              "صورة NASA التاريخية للإنارة الليلية فوق شمال عُمان",
            )}
            loading="lazy"
          />
        )}
        <div className="case-copy" key={step}>
          <Eyebrow>
            {t(
              `STEP 0${step + 1} · ${step < 3 ? "OMAN" : "TUCSON, USA"}`,
              `الخطوة 0${step + 1} · ${step < 3 ? "عُمان" : "توسان، أمريكا"}`,
            )}
          </Eyebrow>
          <h3>{t(steps[step][0], steps[step][1])}</h3>
          <p>{t(explanations[step][0], explanations[step][1])}</p>
          {step === 1 && <DataCredit />}
        </div>
        <div className="case-metric" aria-live="polite">
          <strong dir="ltr" key={`metric-${step}`}>
            {step === 0 ? (
              <Count value={2016} />
            ) : step === 1 ? (
              data.get("muscat")?.cloud == null ? (
                "—%"
              ) : (
                <>
                  <Count value={Math.round(data.get("muscat")!.cloud!)} />%
                </>
              )
            ) : step === 2 ? (
              "OSM"
            ) : step === 3 ? (
              <>
                <Count value={rules.beforePowerPercent} /> →{" "}
                <Count value={rules.afterPowerPercent} />%
              </>
            ) : (
              <>
                <Count
                  value={rules.measurementSites[0].skyBrightnessDecrease}
                  decimals={1}
                />{" "}
                ±{" "}
                <Count
                  value={rules.measurementSites[0].uncertainty}
                  decimals={1}
                />%
              </>
            )}
          </strong>
          <span>{t(labels[step][0], labels[step][1])}</span>
          <a
            className="case-source"
            href={
              step === 0
                ? "https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/"
                : step === 1
                  ? WEATHER_URL
                  : step === 2
                    ? "https://www.openstreetmap.org/copyright"
                    : rules.sourceUrl
            }
            target="_blank"
            rel="noreferrer"
          >
            {t("Source", "المصدر")} ↗
          </a>
        </div>
      </div>
      <div className="case-navigation">
        <span>
          {t(
            "Traceable data. Published evidence.",
            "بيانات بمصادر واضحة. أدلة منشورة.",
          )}
        </span>
        <div>
          <button
            className="icon-button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            aria-label={t("Previous case study step", "الخطوة السابقة")}
          >
            <CaretLeft size={22} />
          </button>
          <span dir="ltr">{step + 1} / 5</span>
          <button
            className="icon-button"
            disabled={step === 4}
            onClick={() => setStep((s) => s + 1)}
            aria-label={t("Next case study step", "الخطوة التالية")}
          >
            <CaretRight size={22} />
          </button>
        </div>
      </div>
    </>
  );
}
export function App() {
  const ar = false;
  const [demo, setDemo] = useState(false),
    [present, setPresent] = useState(false),
    [active, setActive] = useState(0),
    [menu, setMenu] = useState(false),
    [selected, setSelected] = useState("muscat"),
    [highlighted, setHighlighted] = useState("center"),
    [layer, setLayer] = useState(true),
    [scrolled, setScrolled] = useState(false);
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    document.title = "ASTRA — See the Night. Protect the Sky.";
  }, []);
  useEffect(() => {
    const handle = () => {
      setScrolled(window.scrollY > 40);
      setActive(
        storyIds.reduce(
          (best, id, i) =>
            (document.getElementById(id)?.getBoundingClientRect().top ??
              Infinity) <=
            innerHeight * 0.35
              ? i
              : best,
          0,
        ),
      );
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!present || demo) return;
      const target = e.target as HTMLElement;
      if (e.key === "Escape") {
        setPresent(false);
        return;
      }
      if (
        target.closest('input,select,textarea,[role="tab"],.leaflet-container')
      )
        return;
      if (
        [
          "ArrowRight",
          "ArrowDown",
          "PageDown",
          "ArrowLeft",
          "ArrowUp",
          "PageUp",
        ].includes(e.key)
      ) {
        e.preventDefault();
        const forward = ["ArrowRight", "ArrowDown", "PageDown"].includes(e.key);
        go(
          storyIds[
            Math.max(
              0,
              Math.min(storyIds.length - 1, active + (forward ? 1 : -1)),
            )
          ],
        );
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [present, active, demo]);
  useLayoutEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Prepare targets before the browser paints, then reveal each exactly once.
    // The older whole-section reveal caused a second fade over these animations.
    const motionObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("motion-pending");
            entry.target.classList.add("motion-in");
            motionObserver.unobserve(entry.target);
          }
        }),
      { threshold: 0.13, rootMargin: "0px 0px -6% 0px" },
    );
    const motionTargets = [
      ".tool-strip",
      "#crescent .crescent-intro",
      "#crescent .crescent-workspace",
      ".section-heading",
      "#problem .pitch-impact-grid",
      "#impact .regional-story",
      "#growth .growth-evidence",
      "#solution .solution-flow",
      "#map .map-workspace",
      "#observe .observe-layout",
      "#planner .planner-controls",
      "#planner .planner-cards",
      "#sources .source-layout",
      "#improve .simulator",
      "#case-study .case-tabs",
      "#case-study .case-stage",
      "#science .science-grid",
      "#science .research-foundation",
      "#final",
    ].join(",");
    const targets = document.querySelectorAll(motionTargets);
    targets.forEach((node) => {
      if (!node.classList.contains("motion-in")) {
        node.classList.add("motion-pending");
        motionObserver.observe(node);
      }
    });
    return () => {
      motionObserver.disconnect();
      targets.forEach((node) => node.classList.remove("motion-pending"));
    };
  }, []);
  function startPresentation() {
    setMenu(false);
    setPresent(true);
    (document.activeElement as HTMLElement)?.blur();
    go("hero");
  }
  return (
    <Language.Provider value={ar}>
      <div className={`app ${present ? "presenting" : ""}`}>
        <a href="#problem" className="skip-link">
          {t("Skip to the story", "انتقل إلى القصة")}
        </a>
        <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
          <a href="#hero" className="wordmark" aria-label="ASTRA home">
            ASTRA
          </a>
          <nav
            className={menu ? "open" : ""}
            aria-label={t("Main navigation", "التنقّل الرئيسي")}
          >
            <a href="#problem" onClick={() => setMenu(false)}>
              {t("The problem", "المشكلة")}
            </a>
            <a href="#crescent" onClick={() => setMenu(false)}>
              {t("See for yourself", "شاهد بنفسك")}
            </a>
            <a href="#lighting" onClick={() => setMenu(false)}>
              {t("Change the light", "غيّر الضوء")}
            </a>
            <a href="#map" onClick={() => setMenu(false)}>
              {t("Explore", "استكشف")}
            </a>
            <a href="#planner" onClick={() => setMenu(false)}>
              {t("Plan observation", "وقت الرصد")}
            </a>
            <button
              onClick={() => {
                setDemo(true);
                setMenu(false);
              }}
            >
              {t("Demo", "التجربة")}
            </button>
            <a href="#science" onClick={() => setMenu(false)}>
              {t("Science", "العلوم")}
            </a>
            <a href="#about" onClick={() => setMenu(false)}>
              {t("About", "عن ASTRA")}
            </a>
          </nav>
          <div className="nav-actions">
            <button
              className="present-button"
              aria-label={t("Start presentation", "ابدأ العرض")}
              onClick={startPresentation}
            >
              <Presentation size={21} weight="light" />
              <span>{t("Present", "اعرض")}</span>
            </button>
            <button
              className="menu-button icon-button"
              aria-expanded={menu}
              aria-label={t("Toggle navigation", "فتح قائمة التنقّل")}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </header>
        <main>
          <section id="hero" className="hero pitch-hero story-section" aria-labelledby="pitch-title">
            <SpaceBackground alt="Illustration of Earth's horizon beneath a starry sky" />
            <div className="hero-shade" />
            <div className="hero-content">
              <Eyebrow>ASTRA / A CLEARER WAY TO SEE THE NIGHT</Eyebrow>
              <h1 id="pitch-title">The sky is still there.<br /><em>Can we see it?</em></h1>
              <p>Light pollution is changing what we can see after dark. ASTRA helps people find a better place and moment to look up.</p>
              <div className="hero-actions">
                <button className="button primary" onClick={() => go("problem")}>Explore the problem <ArrowRight size={20} /></button>
                <button className="button outline" onClick={() => go("crescent")}>Try ASTRA <ArrowUpRight size={18} /></button>
              </div>
            </div>
            <div className="hero-bottom"><span>LIGHT POLLUTION / CRESCENT SIGHTING / ASTRONOMY</span><button onClick={() => go("problem")}>SCROLL TO THE STORY <ArrowRight size={17} /></button></div>
          </section>
          <section id="problem" className="section story-section">
            <div className="container reveal">
              <Heading
                label={t("01 / THE PROBLEM", "01 / المشكلة")}
                title={t(
                  "We light the ground. We also light the sky.",
                  "الضوء الاصطناعي يحجب سماء الليل.",
                )}
                description={t(
                  "Light pollution is artificial light in the wrong place, at the wrong time, or brighter than needed. Light escaping upward and sideways adds skyglow and glare, making the night harder to see.",
                  "الإنارة المفرطة وغير الموجّهة تزيد سطوع السماء، فتحجب النجوم والأجرام الفلكية الخافتة.",
                )}
              />
              <div className="pitch-impact-grid">
                <article><span>01 / EVERYDAY LIFE</span><h3>Our shared view fades.</h3><p>The night sky is a public experience, even if you have never owned a telescope.</p></article>
                <article><span>02 / OBSERVATION</span><h3>Faint details disappear.</h3><p>Skyglow lowers contrast for stars, deep-sky objects and astronomical imaging.</p></article>
                <article><span>03 / LIGHTING</span><h3>Wasted light has a cost.</h3><p>Light sent above the horizon illuminates neither a path nor a street.</p></article>
              </div>
            </div>
          </section>
          <section id="impact" className="section regional-section story-section">
            <div className="container reveal">
              <Heading label="02 / WHY IT MATTERS HERE" title="A question that returns with every new month." description="Across Muslim communities, the beginning of a Hijri month brings a familiar question: can the young crescent be seen tonight?" />
              <div className="regional-story">
                <article className="regional-feature"><span className="regional-index">01 / THE CRESCENT</span><h3>Let people look for themselves.</h3><p>For Ramadan and other Hijri months, a calculated Moon position can help a person choose a place and face the right part of the horizon. Visibility still depends on twilight, weather, the horizon and the observer.</p><a href="https://aa.usno.navy.mil/faq/crescent" target="_blank" rel="noreferrer">Why a sighting cannot be guaranteed <ArrowUpRight size={16} /></a></article>
                <article className="regional-feature"><span className="regional-index">02 / THE WIDER SKY</span><h3>Give skywatchers a better chance.</h3><p>Astronomy enthusiasts can use the site map and weather forecasts to plan for a clearer view of stars and celestial events.</p></article>
              </div>
            </div>
          </section>
          <section id="growth" className="section growth-section story-section">
            <div className="container reveal">
              <Heading label="03 / THE CHANGING NIGHT" title="As cities expand, the night changes with them." description="Night-light imagery makes the spread and change of artificial lighting visible. Compare the same northern Oman region in two NASA historical composites." />
              <div className="growth-evidence">
                <Comparison />
                <div className="comparison-footer"><span><SlidersHorizontal size={17} /> Drag to compare 2012 and 2016</span><span>NASA VIIRS Black Marble · satellite light, not ground sky brightness</span></div>
                <p className="growth-context">In a separate global study, 51,351 citizen reports from 2011–2022 were consistent with visible sky brightness rising about 7–10% a year across sampled locations. This is a global finding, not a measured trend for Oman. <a href="https://www.gfz.de/presse/meldungen/detailansicht/citizen-scientists-report-global-rapid-reductions-in-the-visibility-of-stars-from-2011-to-2022" target="_blank" rel="noreferrer">Study summary ↗</a></p>
              </div>
            </div>
          </section>
          <section
            id="solution"
            className="section solution-section story-section"
          >
            <div className="container reveal">
              <Heading
                label={t(
                  "04 / OUR ANSWER",
                  "02 / افهم الإمكانات",
                )}
                title={t(
                  "Meet ASTRA.\nFind your own view of the sky.",
                  "من بيانات التلوث الضوئي\nإلى قرارات أفضل.",
                )}
                description={t(
                  "Tell ASTRA where you are and when you want to look. It compares the pilot sites, then gives you a candidate place, observing time and direction.",
                  "ASTRA يوضّح صورة الليل. شاهد ما يحدث، وافهم السبب، ثم اختر الخطوة التالية.",
                )}
              />
              <div className="solution-flow">
                {[
                  [
                    MapPin,
                    "Start where you are",
                    "الأقمار الصناعية والبيئة",
                    "Share a location or enter coordinates and choose an evening.",
                    "الضوء الليلي والارتفاع وظروف السماء.",
                  ],
                  [
                    GlobeHemisphereEast,
                    "Compare the options",
                    "تحليل ASTRA",
                    "Check an evening window, available cloud forecast and distance across three Oman sites.",
                    "اربط الجغرافيا بجودة السماء.",
                  ],
                  [
                    Broadcast,
                    "Look in the right direction",
                    "قرارات أفضل",
                    "Get a calculated time, compass bearing and height above a clear horizon.",
                    "مواقع الرصد ومصادر الضوء وسيناريوهات الإنارة.",
                  ],
                ].map(([Icon, name, nameAr, desc, descAr], i) => {
                  const Component = Icon as typeof MapPin;
                  return (
                    <div className="flow-step" key={i}>
                      <span className="flow-number">0{i + 1}</span>
                      <Component size={36} weight="light" />
                      <h3>{t(name as string, nameAr as string)}</h3>
                      <p>{t(desc as string, descAr as string)}</p>
                      {i < 2 && <ArrowRight className="flow-arrow" size={28} />}
                    </div>
                  );
                })}
              </div>
              <div className="story-verbs">
                <span>{t("LOCATE", "شاهد")}</span>
                <ArrowRight />
                <span>{t("COMPARE", "افهم")}</span>
                <ArrowRight />
                <span>{t("AIM", "قرّر")}</span>
                <ArrowRight />
                <span>{t("OBSERVE", "حسّن")}</span>
              </div>
            </div>
          </section>
          <CrescentFinder ar={ar} onSelect={setSelected} onMap={() => go("map")} />
          <LampHero ar={ar} onNext={() => go("map")} />
          <div className="tool-strip">
            {[
              [MapPin, "Explore the pilot map", "اختر سماء أفضل", "See the three Oman observing sites.", "استكشف مواقع رصد أكثر ظلمة.", "map"],
              [ChartBar, "Trace the light", "تتبّع الضوء", "Inspect the evidence behind the map.", "افهم مصادر توهج السماء.", "sources"],
              [Leaf, "Test a change", "اختبر التغيير", "Calculate what dimming does to fixture power.", "استكشف أثر قرارات الإنارة.", "improve"],
            ].map(([Icon, title, titleAr, desc, descAr, id]) => {
              const Component = Icon as typeof MapPin;
              return <button key={id as string} onClick={() => go(id as string)}><Component size={34} weight="light" /><span><strong>{t(title as string, titleAr as string)}</strong><small>{t(desc as string, descAr as string)}</small></span><ArrowUpRight className="strip-arrow" size={18} /></button>;
            })}
          </div>
          <section id="map" className="section map-section story-section">
            <div className="container reveal">
              <div className="heading-with-action">
                <Heading
                  label={t("07 / EXPLORE THE EVIDENCE", "03 / استكشف الليل")}
                  title={t("Explore the Night", "استكشف الليل")}
                  description={t(
                    "Start in Muscat. Follow the light, then look beyond it.",
                    "ابدأ من مسقط. تتبّع الضوء، ثم انظر إلى ما وراءه.",
                  )}
                />
                <button
                  className="button outline"
                  onClick={() => setDemo(true)}
                >
                  {t("Open interactive demo", "افتح التجربة التفاعلية")}
                  <ArrowsOut size={19} />
                </button>
              </div>
              <DataCredit refresh />
              <div className="map-workspace">
                <div className="map-main">
                  <NightMap
                    selected={selected}
                    onSelect={setSelected}
                    ar={ar}
                    layer={layer}
                  />
                  <button
                    className={`map-layer-toggle ${layer ? "active" : ""}`}
                    onClick={() => setLayer(!layer)}
                    aria-pressed={layer}
                  >
                    <SunDim size={17} />
                    {t("NASA night lights · 2016", "إنارة NASA الليلية · 2016")}
                  </button>
                </div>
                <LocationPanel selected={selected} />
              </div>
              <div className="location-pills">
                {locations.map((l) => (
                  <button
                    key={l.id}
                    className={selected === l.id ? "active" : ""}
                    aria-pressed={selected === l.id}
                    onClick={() => setSelected(l.id)}
                  >
                    <MapPin size={16} />
                    {l.name[ar ? 1 : 0]}
                  </button>
                ))}
              </div>
              <p className="case-note">
                {t(
                  "NASA night lights: 2016 composite. Weather: dated Open-Meteo forecasts. Satellite display pixels are not SQM measurements.",
                  "إنارة NASA: صورة مجمّعة لعام 2016. الطقس: توقعات Open-Meteo مؤرخة. بكسلات الصور ليست قياسات SQM.",
                )}
              </p>
            </div>
          </section>
          <section
            id="observe"
            className="section observe-section story-section"
          >
            <div className="container reveal">
              <Heading
                label={t("TOOL 01 / DECIDE", "الأداة 01 / قرّر")}
                title={t("Where should I observe?", "أين أرصد السماء؟")}
                description={t(
                  "A darker sky is only part of the picture. Compare locations using the conditions that matter.",
                  "السماء المظلمة جزء من الصورة. قارن المواقع وفق الظروف الأكثر أهمية للرصد.",
                )}
              />
              <div className="observe-layout">
                <div className="observe-landscape">
                  <img
                    src={darkImage}
                    alt={t(
                      "NASA nighttime lights in northern Oman, 2016",
                      "إنارة شمال عُمان الليلية من NASA، 2016",
                    )}
                    loading="lazy"
                  />
                  <div>
                    <Eyebrow>
                      {t("NASA / VIIRS · 2016", "NASA / VIIRS · 2016")}
                    </Eyebrow>
                    <h3>
                      {t(
                        "More sky.\nMore possibility.",
                        "سماء أوسع.\nفرص أكبر.",
                      )}
                    </h3>
                    <p>
                      {t(
                        "Compare real forecasts for three fixed locations.",
                        "قارن توقعات فعلية لثلاثة مواقع محددة.",
                      )}
                    </p>
                  </div>
                </div>
                <Recommendations selected={selected} onSelect={setSelected} />
              </div>
            </div>
          </section>
          <section
            id="planner"
            className="section planner-section story-section"
          >
            <div className="container reveal">
              <Heading
                label={t("PLAN / CRESCENT & STARS", "خطط / الهلال والنجوم")}
                title={t("When should I look up?", "متى أفضل وقت للرصد؟")}
                description={t(
                  "Calculated lunar geometry, astronomical darkness and real hourly weather for your selected location.",
                  "حسابات موقع القمر والظلام الفلكي وتوقعات طقس ساعية حقيقية لموقعك المختار.",
                )}
              />
              <ObservationPlanner
                selected={selected}
                onSelect={setSelected}
                ar={ar}
              />
            </div>
          </section>
          <section
            id="sources"
            className="section sources-section story-section"
          >
            <div className="container reveal">
              <Heading
                label={t("TOOL 02 / UNDERSTAND", "الأداة 02 / افهم")}
                title={t(
                  "Where is the light coming from?",
                  "من أين يأتي الضوء؟",
                )}
                description={t(
                  "Inspect real town locations alongside satellite-observed night lights. Distances are geographic, not source attribution.",
                  "استكشف مواقع المدن الحقيقية مع الإنارة المرصودة فضائياً. المسافات جغرافية وليست نسب مساهمة ضوئية.",
                )}
              />
              <div className="source-layout">
                <NightMap
                  selected={selected}
                  onSelect={setSelected}
                  ar={ar}
                  mode="sources"
                  highlighted={highlighted}
                />
                <Sources
                  selected={selected}
                  onSelect={setSelected}
                  highlighted={highlighted}
                  onHighlight={setHighlighted}
                />
              </div>
            </div>
          </section>
          <section
            id="improve"
            className="section improve-section story-section"
          >
            <div className="container reveal">
              <Heading
                label={t("TOOL 03 / IMPROVE", "الأداة 03 / حسّن")}
                title={t(
                  "What changes when we dim the lights?",
                  "شنو يتغيّر إذا خففنا الإنارة؟",
                )}
                description={t(
                  "Use your selected location, adjust fixture power, and compare with published measurements.",
                  "استخدم موقعك المختار، غيّر قدرة المصابيح وقارن مع قياسات منشورة.",
                )}
              />
              <Simulator selected={selected} onSelect={setSelected} />
            </div>
          </section>
          <section
            id="case-study"
            className="section case-section story-section"
          >
            <div className="container reveal">
              <Heading
                label={t("FROM DATA TO EVIDENCE", "دراسة الحالة العُمانية")}
                title={t(
                  "A Night Grounded in Evidence",
                  "ليلة مبنية على الدليل",
                )}
                description={t(
                  "Oman satellite imagery and forecasts, followed by a measured lighting intervention in Tucson. Five steps with traceable sources.",
                  "صور فضائية وتوقعات لعُمان، ثم تدخّل إنارة مقاس في توسان. خمس خطوات بمصادر قابلة للمراجعة.",
                )}
              />
              <CaseStudy />
            </div>
          </section>
          <section
            id="science"
            className="section science-section story-section"
          >
            <div className="container reveal">
              <Heading
                label={t("THE FOUNDATION", "الأساس العلمي")}
                title={t("Built on real science.", "أساسه علم حقيقي.")}
                description={t(
                  "Designed around established remote sensing, astronomical site selection, and responsible-lighting approaches.",
                  "مصمّم حول أساليب معروفة للاستشعار عن بُعد واختيار مواقع الرصد والإنارة المسؤولة.",
                )}
              />
              <div className="science-grid">
                {science.map((s, i) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noreferrer">
                    <span className="science-index">0{i + 1}</span>
                    <div>
                      <h3>{ar ? s.ar : s.name}</h3>
                      <p>{s.description[ar ? 1 : 0]}</p>
                    </div>
                    <ArrowUpRight size={21} />
                  </a>
                ))}
              </div>
              <details className="research-foundation">
                <summary>
                  {t("Research foundation", "المرجعيات البحثية")}
                  <span>{t("3 published studies", "3 دراسات منشورة")}</span>
                </summary>
                <div>
                  {research.map((r) => (
                    <a
                      key={r.doi}
                      href={
                        "url" in r && r.url ? r.url : `https://doi.org/${r.doi}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        {r.author} · {r.journal}
                      </span>
                      <h4 dir="ltr">{r.title}</h4>
                      <p>{r.concept[ar ? 1 : 0]}</p>
                      <small dir="ltr">
                        DOI: {r.doi}
                        <ArrowUpRight size={14} />
                      </small>
                    </a>
                  ))}
                </div>
              </details>
              <p className="science-note">
                {t(
                  "Every displayed dataset and experiment has a source. Satellite imagery, weather forecasts and ground measurements answer different questions.",
                  "توجّه الأبحاث المنهجية المستقبلية. تعرض دراسة الحالة تجربة المنتج.",
                )}
              </p>
            </div>
          </section>
          <section id="final" className="final-section story-section">
            <img src={darkImage} alt="" loading="lazy" />
            <div className="final-shade" />
            <div className="container">
              <Eyebrow>{t("TAKE THE SKY BACK", "الليل يستحق الحماية")}</Eyebrow>
              <h2>
                {t("Know where to go.", "شاهد المشكلة.")}
                <br />
                {t("Know when to look.", "اختر سماء أفضل.")}
                <br />
                <span>{t("See for yourself.", "اختبر الحل.")}</span>
              </h2>
              <p>{t("A clearer night starts with a better decision.", "قِس. قرّر. احمِ.")}</p>
              <button className="button primary" onClick={() => go("crescent")}>
                {t("Plan your observation", "استكشف ASTRA")}
                <ArrowRight size={21} />
              </button>
            </div>
          </section>
        </main>
        <footer id="about">
          <a className="wordmark" href="#hero">
            ASTRA
          </a>
          <p>
            {t(
              "A clearer view of the night. Better decisions for the sky.",
              "رؤية أوضح لليل. قرارات أفضل للسماء.",
            )}
          </p>
          <span>
            {t(
              "Light pollution & astronomical observation",
              "التلوث الضوئي والرصد الفلكي",
            )}
          </span>
          <button className="text-button" onClick={startPresentation}>
            <Presentation size={18} />
            {t("Start presentation", "ابدأ العرض")}
          </button>
        </footer>
        {present && (
          <div
            className="presentation-bar"
            dir="ltr"
            role="toolbar"
            aria-label={t("Presentation navigation", "التنقّل في العرض")}
          >
            <button
              className="icon-button"
              disabled={active === 0}
              onClick={() => go(storyIds[Math.max(0, active - 1)])}
              aria-label={t("Previous section", "القسم السابق")}
            >
              <CaretLeft size={21} />
            </button>
            <div>
              <span>{storyNames[active][ar ? 1 : 0]}</span>
              <small>
                {String(active + 1).padStart(2, "0")} / {storyIds.length}
              </small>
            </div>
            <button
              className="icon-button"
              disabled={active === storyIds.length - 1}
              onClick={() =>
                go(storyIds[Math.min(storyIds.length - 1, active + 1)])
              }
              aria-label={t("Next section", "القسم التالي")}
            >
              <CaretRight size={21} />
            </button>
            <span className="keyboard-hint">← →</span>
            <button
              className="icon-button exit-presentation"
              onClick={() => setPresent(false)}
              aria-label={t("Exit presentation", "اخرج من العرض")}
            >
              <X size={20} />
            </button>
          </div>
        )}
        {demo && (
          <Demo
            selected={selected}
            onSelect={setSelected}
            onClose={() => setDemo(false)}
          />
        )}
      </div>
    </Language.Provider>
  );
}
