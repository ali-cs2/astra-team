import { useEffect, useRef, useState } from "react";

export function SpaceBackground({ alt }: { alt: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () =>
      setRunning(visible && !document.hidden && !reduced.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  return (
    <div
      ref={root}
      className={`space-background ${running ? "is-moving" : ""}`}
    >
      <div className="space-orbit">
        <img
          className="space-image"
          src="/images/hero/earth-orbit.webp"
          alt={alt}
          fetchPriority="high"
          width="1672"
          height="941"
        />
        <img
          className="space-image space-starlight"
          src="/images/hero/earth-orbit.webp"
          alt=""
          aria-hidden="true"
          width="1672"
          height="941"
        />
      </div>
    </div>
  );
}
