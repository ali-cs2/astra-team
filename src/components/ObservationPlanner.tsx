import { useMemo, useState, useId } from "react";
import locations from "../data/locations.json";
import { useObservations } from "./ObservationProvider";
import {
  planNight,
  nextCrescentDate,
  astronomySource,
  omanDate,
} from "../lib/astronomy";
export function ObservationPlanner({
  selected,
  onSelect,
  ar,
}: {
  selected: string;
  onSelect: (id: string) => void;
  ar: boolean;
}) {
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const data = useObservations(),
    id = useId();
  const [date, setDate] = useState(data.time.slice(0, 10));
  const site = locations.find((s) => s.id === selected)!;
  const forecast =
    data.packet?.data[locations.findIndex((s) => s.id === selected)];
  const plan = useMemo(
    () => planNight(date, site.coordinates, forecast),
    [date, site, forecast],
  );
  const time = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat(ar ? "ar-OM" : "en-GB", {
          timeZone: "Asia/Muscat",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(d) +
        (omanDate(d) !== date ? ` ${t("next day", "اليوم التالي")}` : "")
      : "—";
  const weather = (v: typeof plan.crescent.weather) =>
    v?.cloud != null
      ? `${v.cloud}% ${t("forecast clouds", "سحب متوقعة")} · ${v.time.replace("T", " ")}`
      : t("No weather forecast for this hour", "لا يتوفر توقع طقس لهذه الساعة");
  const c = plan.crescent;
  return (
    <div className="observation-planner">
      <div className="planner-controls">
        <label htmlFor={`${id}-site`}>
          {t("Observation location", "موقع الرصد")}
        </label>
        <select
          id={`${id}-site`}
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          {locations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name[ar ? 1 : 0]}
            </option>
          ))}
        </select>
        <label htmlFor={`${id}-date`}>
          {t("Evening date · Oman UTC+4", "تاريخ المساء · توقيت عُمان UTC+4")}
        </label>
        <input
          id={`${id}-date`}
          type="date"
          min="1900-01-01"
          max="2100-12-31"
          value={date}
          onChange={(e) => {
            if (e.target.validity.valid && e.target.value)
              setDate(e.target.value);
          }}
        />
        <button
          className="button outline"
          onClick={() => setDate(nextCrescentDate())}
        >
          {t("Evening after next new moon", "مساء اليوم التالي للمحاق القادم")}
        </button>
        <span>
          {site.coordinates[0]}° N · {site.coordinates[1]}° E ·{" "}
          {t("standard horizon", "أفق قياسي")}
        </span>
      </div>
      <div className="planner-cards" aria-live="polite">
        <article className="planner-card crescent-card">
          <p className="eyebrow">
            {t(
              "CRESCENT · CALCULATED ATTEMPT TIME",
              "الهلال · وقت حسابي للمحاولة",
            )}
          </p>
          <h3>
            {c.time
              ? time(c.time)
              : t("No evening crescent window", "لا توجد نافذة هلال مسائي")}
          </h3>
          <p>
            {c.time
              ? t(
                  "Sunset + 4/9 of the interval to moonset (Yallop timing). Visibility has not been classified.",
                  "الغروب + 4/9 الفترة حتى غروب القمر، وفق توقيت يالوب. لم تُحسب فئة إمكانية الرؤية.",
                )
              : c.eveningCrescent
                ? t(
                    "The Moon is below the horizon at sunset, or no suitable moonset interval exists.",
                    "القمر تحت الأفق عند الغروب، أو لا توجد فترة مناسبة حتى غروبه.",
                  )
                : t(
                    "The Moon is not in its waxing crescent phase on this evening.",
                    "القمر ليس في طور الهلال المتزايد هذا المساء.",
                  )}
          </p>
          <dl>
            <div>
              <dt>{t("Sunset", "الغروب")}</dt>
              <dd>{time(c.sunset)}</dd>
            </div>
            <div>
              <dt>{t("Moonset", "غروب القمر")}</dt>
              <dd>{time(c.moonset)}</dd>
            </div>
            <div>
              <dt>{t("Moon age at sunset", "عمر القمر عند الغروب")}</dt>
              <dd dir="ltr">{c.age?.toFixed(1) ?? "—"} h</dd>
            </div>
            <div>
              <dt>{t("Moon illumination", "إضاءة القمر")}</dt>
              <dd dir="ltr">{plan.illuminated.toFixed(1)}%</dd>
            </div>
            <div>
              <dt>{t("Altitude at attempt", "الارتفاع وقت المحاولة")}</dt>
              <dd dir="ltr">{c.altitude?.toFixed(1) ?? "—"}°</dd>
            </div>
            <div>
              <dt>{t("Solar elongation", "الاستطالة عن الشمس")}</dt>
              <dd dir="ltr">{c.elongation?.toFixed(1) ?? "—"}°</dd>
            </div>
          </dl>
          <div className="planner-weather">{weather(c.weather)}</div>
          <small>
            {t(
              "A planning estimate, not a confirmed sighting or a lunar-calendar ruling. Haze, optics and the local horizon affect visibility.",
              "تقدير للتخطيط، وليس رصداً مؤكداً أو إثباتاً لبداية شهر قمري. الغبار والأداة والأفق المحلي تؤثر في الرؤية.",
            )}
          </small>
        </article>
        <article className="planner-card stars-card">
          <p className="eyebrow">
            {t("STARS · RECOMMENDED ONE-HOUR SLOT", "النجوم · ساعة رصد مقترحة")}
          </p>
          <h3 dir="ltr">
            {plan.best
              ? `${time(plan.best.start)} – ${time(plan.best.end)}`
              : "—"}
          </h3>
          <p>
            {plan.best
              ? plan.best.moonFree
                ? t(
                    "Moon below the horizon during astronomical darkness.",
                    "القمر تحت الأفق خلال الظلام الفلكي.",
                  )
                : t(
                    "Astronomical darkness, but moonlight remains. No full Moon-free hour this night.",
                    "ظلام فلكي مع وجود ضوء القمر. لا تتوفر ساعة كاملة بلا قمر هذه الليلة.",
                  )
              : t(
                  "No complete one-hour slot of astronomical darkness.",
                  "لا تتوفر ساعة كاملة من الظلام الفلكي.",
                )}
          </p>
          <dl>
            <div>
              <dt>{t("Astronomical dusk", "نهاية الشفق الفلكي")}</dt>
              <dd>{time(plan.darkStart)}</dd>
            </div>
            <div>
              <dt>
                {t(
                  "Astronomical dawn · next morning",
                  "بداية الشفق الفلكي · صباح اليوم التالي",
                )}
              </dt>
              <dd>{time(plan.darkEnd)}</dd>
            </div>
          </dl>
          <div className="planner-weather">
            {weather(plan.best?.weather ?? null)}
          </div>
          <small>
            {plan.weatherRanked
              ? t(
                  "Lowest forecast cloud cover among eligible one-hour slots (sampled every 15 minutes; hourly weather at the midpoint). Equal values favour the earlier slot.",
                  "أقل سحب متوقعة بين الساعات المؤهلة، بفحص كل 15 دقيقة وطقس ساعي قرب المنتصف. التعادل يختار الوقت الأبكر.",
                )
              : t(
                  "Geometry-only suggestion; cloud forecasts are unavailable. No weather score is invented.",
                  "اقتراح فلكي فقط لعدم توفر توقع السحب. لا توجد درجة طقس مختلقة.",
                )}
          </small>
        </article>
      </div>
      <div className="planner-sources">
        <p>
          {t(
            "All times are Oman UTC+4. Stars use Sun altitude below −18°. Calculations assume an unobstructed horizon at sea level; mountains and atmospheric refraction can shift observed times. This schedules general stargazing, not the visibility of individual stars.",
            "كل الأوقات بتوقيت عُمان UTC+4. النجوم تعتمد الشمس دون −18°. الحسابات تفترض أفقاً مفتوحاً عند مستوى البحر؛ الجبال والانكسار قد يغيّران الأوقات المرصودة. هذه خطة للرصد العام وليست لتحديد رؤية نجم بعينه.",
          )}
        </p>
        <a href={astronomySource} target="_blank" rel="noreferrer">
          Astronomy Engine 2.1.19 ↗
        </a>
        <a
          href="https://aa.usno.navy.mil/faq/RST_defs"
          target="_blank"
          rel="noreferrer"
        >
          {t("USNO · twilight definitions", "USNO · تعريف الشفق")} ↗
        </a>
        <a
          href="https://astronomycenter.net/pdf/robb_2107_paper.pdf"
          target="_blank"
          rel="noreferrer"
        >
          {t("Crescent timing · Yallop formula", "توقيت الهلال · معادلة يالوب")}{" "}
          ↗
        </a>
        <a
          href="https://open-meteo.com/en/docs"
          target="_blank"
          rel="noreferrer"
        >
          Open-Meteo · {data.status} ·{" "}
          {data.packet?.fetchedAt
            ? new Date(data.packet.fetchedAt).toLocaleString(
                ar ? "ar-OM" : "en-GB",
                { timeZone: "Asia/Muscat" },
              )
            : "—"}{" "}
          ↗
        </a>
      </div>
    </div>
  );
}
