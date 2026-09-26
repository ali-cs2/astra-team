import { useEffect, useRef } from "react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin } from "@phosphor-icons/react";
import locations from "../data/locations.json";
import contributors from "../data/sourceContributions.json";
import { distanceKm } from "../lib/observations";
import "leaflet/dist/leaflet.css";
type Props = {
  selected: string;
  onSelect: (id: string) => void;
  ar: boolean;
  mode?: "pollution" | "sources";
  highlighted?: string;
  layer?: boolean;
};
export function NightMap({
  selected,
  onSelect,
  ar,
  mode = "pollution",
  highlighted,
  layer = true,
}: Props) {
  const container = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    overlays = useRef<L.LayerGroup | null>(null),
    select = useRef(onSelect);
  select.current = onSelect;
  useEffect(() => {
    if (!container.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const instance = L.map(container.current, {
      center: [23.3, 58.15],
      zoom: 8,
      minZoom: 6,
      maxZoom: 9,
      scrollWheelZoom: false,
      preferCanvas: false,
      zoomAnimation: !reduced,
      fadeAnimation: !reduced,
      maxBounds: [
        [19.8, 53.4],
        [26.7, 60.6],
      ],
      maxBoundsViscosity: 1,
    });
    L.tileLayer("/map-tiles-nasa/{z}/{x}/{y}.jpg", {
      minZoom: 6,
      maxZoom: 9,
      maxNativeZoom: 8,
      noWrap: true,
      className: "terrain-tile",
      bounds: [
        [19.5, 53],
        [27, 61],
      ],
      attribution:
        '<a href="https://www.earthdata.nasa.gov/data/tools/gibs">NASA GIBS</a> · Blue Marble',
    }).addTo(instance);
    instance.zoomControl.setPosition("topright");
    L.control
      .scale({ imperial: false, position: "bottomleft" })
      .addTo(instance);
    map.current = instance;
    overlays.current = L.layerGroup().addTo(instance);
    const observer = new ResizeObserver(() =>
      instance.invalidateSize({ pan: false }),
    );
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
      overlays.current = null;
    };
  }, []);
  useEffect(() => {
    const instance = map.current,
      group = overlays.current;
    if (!instance || !group) return;
    group.clearLayers();
    if (layer)
      L.tileLayer("/map-tiles-night/2016/{z}/{x}/{y}.png", {
        minZoom: 6,
        maxZoom: 9,
        maxNativeZoom: 8,
        noWrap: true,
        bounds: [
          [19.5, 53],
          [27, 61],
        ],
        attribution:
          '<a href="https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/">NASA / VIIRS Black Marble · 2016</a>',
      }).addTo(group);
    const site = locations.find((l) => l.id === selected)!;
    if (mode === "sources")
      for (const c of contributors) {
        const distance = distanceKm(site.coordinates, c.coordinates);
        L.polyline(
          [site.coordinates as L.LatLngTuple, c.coordinates as L.LatLngTuple],
          {
            color: c.color,
            weight: highlighted === c.id ? 4 : 1.5,
            opacity: highlighted && highlighted !== c.id ? 0.2 : 0.85,
            dashArray: highlighted === c.id ? undefined : "6 8",
          },
        ).addTo(group);
        L.circleMarker(c.coordinates as L.LatLngTuple, {
          radius: highlighted === c.id ? 9 : 6,
          color: c.color,
          fillColor: c.color,
          fillOpacity: 0.9,
          weight: 2,
        })
          .bindTooltip(`${c.name[ar ? 1 : 0]} · ${distance.toFixed(1)} km`, {
            direction: "top",
          })
          .addTo(group);
      }
    for (const location of locations) {
      const active = location.id === selected,
        color = location.id === "muscat" ? "#e8b46f" : "#9bc9db";
      const icon = L.divIcon({
        className: `site-marker ${active ? "selected" : ""}`,
        html: renderToStaticMarkup(
          <MapPin
            size={active ? 34 : 28}
            weight={active ? "fill" : "duotone"}
            color={color}
          />,
        ),
        iconSize: [34, 34],
        iconAnchor: [17, 30],
      });
      L.marker(location.coordinates as L.LatLngTuple, {
        icon,
        keyboard: true,
        title: location.name[ar ? 1 : 0],
        alt: location.name[ar ? 1 : 0],
      })
        .bindTooltip(location.short[ar ? 1 : 0], {
          permanent: true,
          direction: "top",
          offset: [0, -25],
          className: "place-label",
        })
        .on("click", () => select.current(location.id))
        .addTo(group);
    }
  }, [selected, ar, mode, highlighted, layer]);
  useEffect(() => {
    const site = locations.find((l) => l.id === selected)!;
    map.current?.panTo(site.coordinates as L.LatLngTuple, {
      animate: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      duration: 0.65,
    });
  }, [selected]);
  return (
    <div className="night-map" dir="ltr">
      <div
        ref={container}
        className="map-canvas"
        aria-label={
          ar ? "خريطة مواقع الرصد في عُمان" : "Oman observing locations map"
        }
      />
      <span className="map-context">
        {ar ? "عُمان · مواقع جغرافية حقيقية" : "OMAN · REAL LOCATIONS"}
      </span>
      {layer && (
        <div className="map-legend">
          <span>NASA / VIIRS · 2016</span>
          <div className="legend-labels">
            <span>
              {ar
                ? "صورة إنارة تاريخية · ليست قياس SQM"
                : "Historical night lights · not SQM"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
