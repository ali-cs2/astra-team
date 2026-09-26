import { useEffect, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, ArrowCounterClockwise } from "@phosphor-icons/react";

const starOpacity = [0.012, 0.13, 0.29, 0.47, 0.72];
const stars = (() => {
  let seed = 72349;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length: 105 }, (_, i) => ({
    left: `${2 + random() * 96}%`,
    top: `${1 + random() * 77}%`,
    size: `${i % 17 === 0 ? 3 : 1 + random() * 1.4}px`,
    bright: i % 11 === 0,
  }));
})();

const steps = [
  ["Shield the lamp", "وجّه الضوء"],
  ["Dim the output", "خفّض الشدة"],
  ["Choose warm light", "اختر الدفء"],
  ["Set an off time", "اضبط الوقت"],
];
const explanations = [
  ["An illustration of responsible lighting, not a sky measurement.", "مشهد توضيحي للإنارة المسؤولة، وليس قياساً للسماء."],
  ["A shield limits direct upward light while the ground stays lit.", "يحجب الغطاء الضوء المباشر الصاعد، وتبقى الأرض مضاءة."],
  ["Less output can reduce glare and electricity use.", "قد يخفف خفض الشدة الوهج واستهلاك الكهرباء."],
  ["Warmer light changes the spectrum; this is not a certified product.", "يتغير طيف الضوء إلى الأدفأ؛ هذا ليس منتجاً معتمداً بعينه."],
  ["Unneeded light is off during quiet hours. The stars remain illustrative.", "تنطفئ الإنارة غير الضرورية في ساعات الخمول. النجوم هنا توضيحية."],
];

export function LampHero({ ar, onNext }: { ar: boolean; onNext: () => void }) {
  const [stage, setStage] = useState(0);
  const t = (en: string, arabic: string) => (ar ? arabic : en);

  useEffect(() => {
    void import("../lamp/lamp-scene").catch(() => {
      document.querySelector(".lamp-hero")?.classList.add("no-webgl");
    });
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("lampstage", { detail: stage }));
  }, [stage]);

  return (
    <section
      className="hero lamp-hero story-section"
      id="lighting"
      data-stage={stage}
      style={{ "--stars": starOpacity[stage] } as CSSProperties}
      aria-labelledby="lamp-hero-title"
    >
      <div className="lamp-hero-background" aria-hidden="true" />
      <div className="lamp-hero-stars" aria-hidden="true">
        {stars.map((star, i) => (
          <i
            key={i}
            className={star.bright ? "bright" : ""}
            style={{ left: star.left, top: star.top, "--size": star.size } as CSSProperties}
          />
        ))}
      </div>
      <div className="lamp-hero-haze" aria-hidden="true" />
      <canvas id="lamp-canvas" aria-hidden="true" />
      <img className="lamp-hero-fallback" src="/lamp/assets/bare-lamp.webp" alt="" aria-hidden="true" />
      <div className="lamp-hero-copy">
        <span className="lamp-hero-kicker">{t("06 / WHAT CAN WE CHANGE?", "تجربة بين الضوء والرؤية")}</span>
        <h2 id="lamp-hero-title">
          {t("Light the ground.", "هل ترى الهلال؟")}
          <br />
          <em>{t("Give the sky room.", "اعرف أين تنظر.")}</em>
        </h2>
        <p>{t("Try four responsible lighting choices. Watch the illustration change, then explore the real evidence and power calculation below.", "غيّر الإنارة، ثم اعرف أقرب موقع ووقت واتجاه لمحاولة رؤية الهلال بنفسك.")}</p>
        <button className="button primary" onClick={onNext}>
          {t("Explore the evidence", "خطط لرصد الهلال")}
          <ArrowRight size={20} />
        </button>
      </div>
      <div className="lamp-hero-meteor" aria-hidden="true" />
      <div className="lamp-hero-experience">
        <div className="lamp-hero-caption">
          <small>{t("ILLUSTRATIVE SCENE / KUWAIT WATERFRONT", "المشهد / 01")}</small>
          <h2>{t("Light for the ground. Room for the sky.", "ضوءٌ للأرض. ومساحةٌ للسماء.")}</h2>
        </div>
        <div className="lamp-hero-controls">
          <div className="lamp-hero-controls-head">
            <span>{t("Try four lighting choices", "جرّب أربع قرارات")}</span>
            <button onClick={() => setStage(0)}>
              {t("Reset", "إعادة المشهد")} <ArrowCounterClockwise size={15} />
            </button>
          </div>
          <div className="lamp-hero-steps" role="group" aria-label={t("Responsible lighting steps", "خطوات الإنارة المسؤولة")}>
            {steps.map(([en, arabic], i) => (
              <button
                key={en}
                className={stage === i + 1 ? "active" : stage > i + 1 ? "completed" : ""}
                aria-pressed={stage === i + 1}
                onClick={() => setStage(i + 1)}
              >
                <small>{String(i + 1).padStart(2, "0")}</small>
                {t(en, arabic)}
              </button>
            ))}
          </div>
          <p aria-live="polite">{t(...(explanations[stage] as [string, string]))}</p>
        </div>
      </div>
      <button className="lamp-hero-next" onClick={onNext}>
        {t("EXPLORE THE EVIDENCE", "سؤال الهلال")}
        <ArrowDown size={17} />
      </button>
    </section>
  );
}
