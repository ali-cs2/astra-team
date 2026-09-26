export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=23.588,23.073,22.25&longitude=58.383,57.666,58.67&hourly=cloud_cover,relative_humidity_2m,visibility&daily=sunset,sunrise&forecast_days=3&timezone=Asia%2FMuscat";
export type Forecast = {
  timezone: "Asia/Muscat";
  hourly_units: {
    cloud_cover: "%";
    relative_humidity_2m: "%";
    visibility: "m";
  };
  latitude: number;
  longitude: number;
  elevation: number | null;
  hourly: {
    time: string[];
    cloud_cover: (number | null)[];
    relative_humidity_2m: (number | null)[];
    visibility: (number | null)[];
  };
  daily: { time: string[]; sunset: string[]; sunrise: string[] };
};
export type Reading = {
  time: string;
  cloud: number | null;
  humidity: number | null;
  visibility: number | null;
  elevation: number | null;
  sunset: string | null;
  sunrise: string | null;
  grid: [number, number];
};

function finite(
  value: unknown,
  min = -Infinity,
  max = Infinity,
): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
    ? value
    : null;
}
export function validateForecasts(value: unknown): Forecast[] {
  if (!Array.isArray(value) || value.length !== 3)
    throw new Error("Unexpected location response");
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error("Missing forecast");
    const v = raw as Record<string, any>;
    const expected = [
      [23.588, 58.383],
      [23.073, 57.666],
      [22.25, 58.67],
    ][index];
    if (
      v.timezone !== "Asia/Muscat" ||
      !Array.isArray(v.hourly?.time) ||
      !v.hourly.time.length ||
      v.hourly_units?.cloud_cover !== "%" ||
      v.hourly_units?.relative_humidity_2m !== "%" ||
      v.hourly_units?.visibility !== "m" ||
      !Array.isArray(v.daily?.time) ||
      !Array.isArray(v.daily?.sunrise) ||
      !Array.isArray(v.daily?.sunset) ||
      finite(v.latitude, -90, 90) === null ||
      finite(v.longitude, -180, 180) === null ||
      Math.abs(v.latitude - expected[0]) > 0.5 ||
      Math.abs(v.longitude - expected[1]) > 0.5
    )
      throw new Error("Invalid forecast, coordinates or units");
    const time = v.hourly.time as unknown[];
    if (
      !time.every(
        (t) =>
          typeof t === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t),
      )
    )
      throw new Error("Invalid forecast time");
    if (
      !v.daily.time.every(
        (t: unknown) => typeof t === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t),
      ) ||
      ![v.daily.sunrise, v.daily.sunset].every((list: unknown[]) =>
        list.every(
          (t) =>
            t === null ||
            (typeof t === "string" &&
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t)),
        ),
      )
    )
      throw new Error("Invalid sunrise/sunset response");
    return {
      timezone: "Asia/Muscat",
      hourly_units: {
        cloud_cover: "%",
        relative_humidity_2m: "%",
        visibility: "m",
      },
      latitude: v.latitude,
      longitude: v.longitude,
      elevation: finite(v.elevation),
      hourly: {
        time: time as string[],
        cloud_cover: time.map((_, i) =>
          finite(v.hourly.cloud_cover?.[i], 0, 100),
        ),
        relative_humidity_2m: time.map((_, i) =>
          finite(v.hourly.relative_humidity_2m?.[i], 0, 100),
        ),
        visibility: time.map((_, i) => finite(v.hourly.visibility?.[i], 0)),
      },
      daily: {
        time: v.daily.time,
        sunset: v.daily.sunset,
        sunrise: v.daily.sunrise,
      },
    };
  });
}
export function nextEvening(now = new Date()) {
  const local = new Date(now.getTime() + 4 * 3600_000);
  if (local.getUTCHours() >= 20) local.setUTCDate(local.getUTCDate() + 1);
  return `${local.toISOString().slice(0, 10)}T20:00`;
}
export function readingAt(
  forecast: Forecast | undefined,
  time: string,
): Reading | null {
  if (!forecast) return null;
  const i = forecast.hourly.time.indexOf(time);
  if (i < 0) return null;
  const day = forecast.daily.time.indexOf(time.slice(0, 10));
  // Sunrise following this evening is the end of this night's daylight-free window.
  return {
    time,
    cloud: forecast.hourly.cloud_cover[i],
    humidity: forecast.hourly.relative_humidity_2m[i],
    visibility: forecast.hourly.visibility[i],
    elevation: forecast.elevation,
    sunset: day >= 0 ? (forecast.daily.sunset[day] ?? null) : null,
    sunrise: day >= 0 ? (forecast.daily.sunrise[day + 1] ?? null) : null,
    grid: [forecast.latitude, forecast.longitude],
  };
}
export function distanceKm(a: readonly number[], b: readonly number[]) {
  const rad = Math.PI / 180;
  const dlat = (b[0] - a[0]) * rad,
    dlon = (b[1] - a[1]) * rad;
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dlon / 2) ** 2;
  return (
    6371.0088 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)))
  );
}
