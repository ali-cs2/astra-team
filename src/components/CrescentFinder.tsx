import { useMemo, useState } from "react";
import { ArrowRight, Compass, Crosshair, MapPin } from "@phosphor-icons/react";
import locations from "../data/locations.json";
import { distanceKm } from "../lib/observations";
import { nextCrescentDate, planNight } from "../lib/astronomy";
import { useObservations } from "./ObservationProvider";

type Origin = { coordinates: [number, number]; source: "example" | "manual" | "device" };
const pilotOrigin: Origin = { coordinates: [23.588, 58.383], source: "example" };

export function CrescentFinder({
  ar,
  onSelect,
  onMap,
}: {
  ar: boolean;
  onSelect: (id: string) => void;
  onMap: () => void;
}) {
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const data = useObservations();
  const [date, setDate] = useState(() => nextCrescentDate());
  const [origin, setOrigin] = useState<Origin>(pilotOrigin);
  const [latitude, setLatitude] = useState("23.588");
  const [longitude, setLongitude] = useState("58.383");
  const [choice, setChoice] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);

  const options = useMemo(
    () =>
      locations.map((site, index) => {
        const plan = planNight(date, site.coordinates, data.packet?.data[index]);
        return {
          site,
          plan,
          distance: distanceKm(origin.coordinates, site.coordinates),
          cloud: plan.crescent.weather?.cloud ?? null,
        };
      }),
    [date, origin, data.packet],
  );
  const ranked = useMemo(() => {
    const available = options.filter((item) => item.plan.crescent.time);
    const pool = available.length ? available : options;
    return [...pool].sort(
      (a, b) =>
        (a.cloud === null ? 1 : 0) - (b.cloud === null ? 1 : 0) ||
        (a.cloud ?? 0) - (b.cloud ?? 0) ||
        a.distance - b.distance,
    );
  }, [options]);
  const suggested = ranked[0];
  const current = options.find((item) => item.site.id === choice) ?? suggested;
  const c = current.plan.crescent;
  const hasLocalCoverage = current.distance <= 250;

  const clock = (value: Date | null) =>
    value
      ? new Intl.DateTimeFormat(ar ? "ar-OM" : "en-GB", {
          timeZone: "Asia/Muscat",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(value)
      : "—";
  const compassPoint = (bearing: number) => {
    const english = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const arabic = ["شمال", "شمال شرق", "شرق", "جنوب شرق", "جنوب", "جنوب غرب", "غرب", "شمال غرب"];
    const index = Math.round(bearing / 45) % 8;
    return ar ? arabic[index] : english[index];
  };
  const useCoordinates = (lat: number, lon: number, source: Origin["source"]) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      setLocationMessage(t("Enter a valid latitude and longitude.", "أدخل خط عرض وطول صالحين."));
      return;
    }
    setOrigin({ coordinates: [lat, lon], source });
    setLatitude(lat.toFixed(4));
    setLongitude(lon.toFixed(4));
    setChoice(null);
    setLocationMessage("");
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setLocationMessage(t("Location is unavailable in this browser. Enter coordinates instead.", "لا يتوفر تحديد الموقع في هذا المتصفح. أدخل الإحداثيات يدوياً."));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        useCoordinates(position.coords.latitude, position.coords.longitude, "device");
      },
      () => {
        setLocating(false);
        setLocationMessage(t("Location was not shared. You can enter coordinates below.", "لم يُشارك الموقع. يمكنك إدخال الإحداثيات أدناه."));
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
    );
  };
  const openMap = () => {
    onSelect(current.site.id);
    onMap();
  };

  return (
    <section className="section crescent-finder story-section" id="crescent" aria-labelledby="crescent-title">
      <div className="container">
        <div className="crescent-intro">
          <p className="eyebrow">{t("05 / SEE FOR YOURSELF", "02 / سؤال يعود كل شهر قمري")}</p>
          <h2 id="crescent-title">
            {t("Your place. Your evening. A direction to look.", "لا تكتفِ بخبر الرؤية. اعرف أين تنظر.")}
          </h2>
          <p>{t(
            "Try the Oman pilot now. Choose a date, use your location or enter coordinates, and compare three candidate sites. ASTRA calculates when and where to face the crescent; the sky makes the final call.",
            "عند اقتراب شهر هجري جديد، يختلف الناس حول إمكان رؤية الهلال. يساعدك ASTRA على التخطيط لمحاولة رصده بنفسك: اختر التاريخ، واعرف موقعاً مرشحاً، واتجه نحو موضعه المحسوب في الوقت المناسب.",
          )}</p>
          <span className="crescent-intro-note">{t("Oman pilot · three reference sites · no calendar ruling", "نموذج عُماني أولي · ثلاثة مواقع مرجعية · ليس حكماً لبداية الشهر")}</span>
        </div>

        <div className="crescent-workspace">
          <div className="crescent-inputs">
            <div className="crescent-panel-heading">
              <span>01</span>
              <div>
                <h3>{t("Start where you are", "ابدأ من موقعك")}</h3>
                <p>{t("Your coordinates stay in this browser; the pilot compares three sites in Oman.", "تبقى إحداثياتك في هذا المتصفح؛ يقارن النموذج ثلاثة مواقع في عُمان.")}</p>
              </div>
            </div>
            <button className="crescent-location-button" onClick={locate} disabled={locating}>
              <Crosshair size={20} />
              {locating ? t("Finding your location…", "جارٍ تحديد موقعك…") : t("Use my location", "استخدم موقعي")}
            </button>
            <div className="crescent-coordinate-fields">
              <label>{t("Latitude", "خط العرض")}
                <input type="number" min="-90" max="90" step="any" inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
              </label>
              <label>{t("Longitude", "خط الطول")}
                <input type="number" min="-180" max="180" step="any" inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
              </label>
            </div>
            <button className="crescent-apply" onClick={() => useCoordinates(latitude.trim() ? Number(latitude) : NaN, longitude.trim() ? Number(longitude) : NaN, "manual")}>{t("Apply coordinates", "طبّق الإحداثيات")}</button>
            <label className="crescent-date-label">
              {t("Evening to check · Oman time", "مساء الرصد · توقيت عُمان")}
              <input type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={(event) => event.target.value && event.target.validity.valid && setDate(event.target.value)} />
            </label>
            <button className="crescent-next-date" onClick={() => setDate(nextCrescentDate())}>{t("Use evening after next new moon", "اختر مساء اليوم التالي للمحاق القادم")}</button>
            {locationMessage && <p className="crescent-location-message" role="status">{locationMessage}</p>}
            <p className="crescent-origin-note">
              {origin.source === "example"
                ? t("Example starting point: Muscat. Share a location or enter coordinates to personalize the distances.", "نقطة بداية تجريبية: مسقط. شارك موقعك أو أدخل إحداثيات لتخصيص المسافات.")
                : t("Distances are straight-line distances from your coordinates, not travel distances.", "المسافات جوية من إحداثياتك، وليست مسافات الطريق.")}
            </p>
          </div>

          <div className="crescent-result" aria-live="polite">
            <div className="crescent-result-top">
              <span className="crescent-result-tag">{choice ? t("YOUR SELECTED SITE", "الموقع الذي اخترته") : t("SUGGESTED PILOT SITE", "الموقع التجريبي المقترح")}</span>
              <span className="crescent-result-date">{date}</span>
            </div>
            <h3>{current.site.name[ar ? 1 : 0]}</h3>
            <p className="crescent-result-subtitle">
              <MapPin size={16} />
              {Math.round(current.distance)} {t("km straight line from your point", "كم جواً من نقطتك")}
              {c.weather?.cloud != null && <> · {c.weather.cloud}% {t("forecast cloud", "سحب متوقعة")}</>}
            </p>
            {c.time && c.azimuth !== null && c.altitude !== null ? (
              <div className="crescent-direction-layout">
                <div className="crescent-dial" aria-label={t(`Moon bearing ${Math.round(c.azimuth)} degrees from north`, `اتجاه القمر ${Math.round(c.azimuth)} درجة من الشمال`)}>
                  <span className="north">N</span><span className="east">E</span><span className="south">S</span><span className="west">W</span>
                  <i style={{ transform: `rotate(${c.azimuth}deg)` }}><b /></i>
                  <span className="dial-center" />
                </div>
                <div className="crescent-bearing-copy">
                  <span>{t("AT THE CALCULATED ATTEMPT TIME", "وقت المحاولة المحسوب")}</span>
                  <strong>{clock(c.time)} <small>{t("GST · UTC+4", "توقيت عُمان · UTC+4")}</small></strong>
                  <p>{t("Face", "اتجه نحو")} <b>{compassPoint(c.azimuth)}</b> · <b dir="ltr">{Math.round(c.azimuth)}°</b> {t("clockwise from true north", "من الشمال الحقيقي باتجاه عقارب الساعة")}</p>
                  <p>{t("Look", "انظر")} <b dir="ltr">{c.altitude.toFixed(1)}°</b> {t("above a clear horizon", "فوق أفقٍ مكشوف")}</p>
                </div>
              </div>
            ) : (
              <div className="crescent-no-window">
                <Compass size={28} />
                <p>{t("No evening crescent attempt window was calculated for this date at this site. Try another evening or compare another site.", "لم تُحسب نافذة مسائية لمحاولة رصد الهلال في هذا التاريخ والموقع. جرّب مساءً آخر أو قارن موقعاً آخر.")}</p>
              </div>
            )}
            <div className="crescent-site-options">
              {options
                .slice()
                .sort((a, b) => a.distance - b.distance)
                .map((item) => (
                  <button key={item.site.id} className={current.site.id === item.site.id ? "active" : ""} onClick={() => setChoice(item.site.id)} aria-pressed={current.site.id === item.site.id}>
                    <span>{item.site.short[ar ? 1 : 0]}</span>
                    <small>{Math.round(item.distance)} {t("km", "كم")} · {item.cloud === null ? t("no cloud forecast", "لا توقع سحب") : `${item.cloud}% ${t("cloud", "سحب")}`}</small>
                  </button>
                ))}
            </div>
            {!hasLocalCoverage && <p className="crescent-outside">{t("Your point is more than 250 km from this pilot site. ASTRA cannot recommend a nearby site outside its Oman study area yet.", "تبعد نقطتك أكثر من 250 كم عن هذا الموقع التجريبي. لا يستطيع ASTRA بعد ترشيح موقع قريب خارج منطقة الدراسة العُمانية.")}</p>}
            <div className="crescent-result-footer">
              <p>{t("Suggestion order: an evening window, then lowest available forecast cloud cover, then shortest straight-line distance. Site access and western horizon are unverified. A calculated position never guarantees visibility or decides a Hijri month.", "ترتيب الترشيح: نافذة مسائية، ثم أقل سحب متوقعة متاحة، ثم أقصر مسافة جوية. الوصول إلى الموقع والأفق الغربي غير متحقق منهما. الموضع المحسوب لا يضمن الرؤية ولا يقرر بداية شهر هجري.")}</p>
              <button onClick={openMap}>{t("See site on the map", "اعرض الموقع على الخريطة")} <ArrowRight size={17} /></button>
            </div>
          </div>
        </div>
        <p className="crescent-source-note">{t("Moon position and timing: Astronomy Engine. Weather: Open-Meteo when the date falls within its forecast window.", "موضع القمر ووقته: Astronomy Engine. الطقس: Open-Meteo عندما يقع التاريخ ضمن فترة توقعاته.")} <a href="https://aa.usno.navy.mil/faq/crescent" target="_blank" rel="noreferrer">{t("Why visibility is uncertain ↗", "لماذا تبقى الرؤية غير مؤكدة ↗")}</a></p>
      </div>
    </section>
  );
}
