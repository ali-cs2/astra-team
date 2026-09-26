import {
  Body,
  Observer,
  Equator,
  Horizon,
  SearchRiseSet,
  SearchAltitude,
  MoonPhase,
  Illumination,
  SearchMoonPhase,
  AngleFromSun,
} from "astronomy-engine";
import type { Forecast } from "./observations";

export const astronomySource =
  "https://github.com/cosinekitty/astronomy/tree/master/source/js";
const minute = 60000;
export function omanDate(time: Date) {
  return new Date(time.getTime() + 4 * 3600000).toISOString().slice(0, 10);
}
export function localStamp(time: Date) {
  return new Date(time.getTime() + 4 * 3600000).toISOString().slice(0, 16);
}
export function altitude(body: Body, observer: Observer, time: Date) {
  const eq = Equator(body, time, observer, true, true);
  return Horizon(time, observer, eq.ra, eq.dec).altitude;
}
export function weatherAt(forecast: Forecast | undefined, time: Date) {
  // Use the nearest forecast hour, labelled as an hourly forecast in the UI.
  const rounded = new Date(Math.round(time.getTime() / 3600000) * 3600000);
  const i = forecast?.hourly.time.indexOf(localStamp(rounded)) ?? -1;
  return i < 0
    ? null
    : {
        time: forecast!.hourly.time[i],
        cloud: forecast!.hourly.cloud_cover[i],
        humidity: forecast!.hourly.relative_humidity_2m[i],
        visibility: forecast!.hourly.visibility[i],
      };
}
export function planNight(
  date: string,
  coordinates: readonly number[],
  forecast?: Forecast,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new Error("Invalid observing date");
  const noon = new Date(`${date}T12:00:00+04:00`);
  if (
    !Number.isFinite(noon.getTime()) ||
    omanDate(noon) !== date ||
    Number(date.slice(0, 4)) < 1900 ||
    Number(date.slice(0, 4)) > 2100
  )
    throw new Error("Invalid observing date");
  // Standard unobstructed horizon at zero elevation: model-grid height is not observer height.
  const observer = new Observer(coordinates[0], coordinates[1], 0);
  const sunset = SearchRiseSet(Body.Sun, observer, -1, noon, 1)?.date ?? null;
  const darkStart =
    SearchAltitude(Body.Sun, observer, -1, noon, 1, -18)?.date ?? null;
  const darkEnd = darkStart
    ? (SearchAltitude(Body.Sun, observer, 1, darkStart, 1, -18)?.date ?? null)
    : null;
  const at = sunset ?? noon;
  const phase = MoonPhase(at);
  const illuminated = Illumination(Body.Moon, at).phase_fraction * 100;
  const moonAtSunset = altitude(Body.Moon, observer, at);
  const moonset = sunset
    ? (SearchRiseSet(Body.Moon, observer, -1, sunset, 1)?.date ?? null)
    : null;
  const eveningCrescent = phase > 0 && phase < 90;
  const lag =
    sunset && moonset ? (moonset.getTime() - sunset.getTime()) / minute : null;
  const crescentTime =
    sunset && moonset && eveningCrescent && moonAtSunset > 0 && lag! < 360
      ? new Date(
          sunset.getTime() + ((moonset.getTime() - sunset.getTime()) * 4) / 9,
        )
      : null;
  const lastNewMoon =
    SearchMoonPhase(0, new Date(at.getTime() - 35 * 86400000), 35)?.date ??
    null;
  // Search may return the preceding lunation's conjunction; advance once if necessary.
  const laterNew = lastNewMoon
    ? SearchMoonPhase(0, new Date(lastNewMoon.getTime() + minute), 35)?.date
    : null;
  const conjunction = laterNew && laterNew <= at ? laterNew : lastNewMoon;
  const crescent = {
    time: crescentTime,
    sunset,
    moonset,
    eveningCrescent,
    lag: moonAtSunset > 0 ? lag : null,
    altitude: crescentTime ? altitude(Body.Moon, observer, crescentTime) : null,
    elongation: crescentTime ? AngleFromSun(Body.Moon, crescentTime) : null,
    age: conjunction ? (at.getTime() - conjunction.getTime()) / 3600000 : null,
    weather: crescentTime ? weatherAt(forecast, crescentTime) : null,
  };
  const slots: {
    start: Date;
    end: Date;
    moonFree: boolean;
    weather: ReturnType<typeof weatherAt>;
  }[] = [];
  if (darkStart && darkEnd) {
    // Full one-hour slots every 15 minutes. A Moon upper-limb rise/set inside a slot excludes it.
    for (
      let ms = darkStart.getTime();
      ms + 60 * minute <= darkEnd.getTime();
      ms += 15 * minute
    ) {
      const start = new Date(ms),
        end = new Date(ms + 60 * minute);
      const eq = Equator(Body.Moon, start, observer, true, true);
      const apparent = Horizon(
        start,
        observer,
        eq.ra,
        eq.dec,
        "normal",
      ).altitude;
      const rise = SearchRiseSet(Body.Moon, observer, 1, start, 1 / 24)?.date;
      const moonFree = apparent < -0.3 && !(rise && rise <= end);
      slots.push({
        start,
        end,
        moonFree,
        weather: weatherAt(forecast, new Date(ms + 30 * minute)),
      });
    }
  }
  const moonFree = slots.filter((s) => s.moonFree);
  const candidates = moonFree.length ? moonFree : slots;
  const covered = candidates.filter((s) => s.weather?.cloud != null);
  const best =
    (covered.length
      ? covered.sort(
          (a, b) =>
            a.weather!.cloud! - b.weather!.cloud! ||
            a.start.getTime() - b.start.getTime(),
        )
      : candidates)[0] ?? null;
  return {
    crescent,
    phase,
    illuminated,
    darkStart,
    darkEnd,
    best,
    weatherRanked: covered.length > 0,
  };
}
export function nextCrescentDate(now = new Date()) {
  const next = SearchMoonPhase(0, now, 35);
  return next
    ? omanDate(new Date(next.date.getTime() + 86400000))
    : omanDate(now);
}
