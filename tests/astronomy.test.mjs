import test from "node:test";
import assert from "node:assert/strict";
import {
  planNight,
  altitude,
  weatherAt,
  localStamp,
  nextCrescentDate,
} from "../src/lib/astronomy.ts";
import { Body, Observer } from "astronomy-engine";
const muscat = [23.588, 58.383];
test("full Moon evening is never presented as a young crescent", () => {
  const p = planNight("2026-09-26", muscat);
  assert.ok(p.illuminated > 99);
  assert.equal(p.crescent.time, null);
  assert.equal(p.best.moonFree, false);
});
test("crescent attempt lies strictly between local sunset and moonset", () => {
  const p = planNight("2026-10-12", muscat);
  assert.ok(
    p.crescent.time > p.crescent.sunset && p.crescent.time < p.crescent.moonset,
  );
  assert.ok(p.crescent.altitude > 0);
  assert.ok(p.crescent.age > 24 && p.crescent.age < 72);
  assert.equal(p.crescent.weather, null);
});
test("star slot is a full hour in astronomical darkness with Moon below the horizon", () => {
  const p = planNight("2026-10-13", muscat),
    o = new Observer(...muscat, 0);
  assert.equal(p.best.end - p.best.start, 3600000);
  assert.ok(p.best.start >= p.darkStart && p.best.end <= p.darkEnd);
  assert.equal(p.best.moonFree, true);
  for (const t of [
    p.best.start,
    new Date((+p.best.start + +p.best.end) / 2),
    p.best.end,
  ]) {
    assert.ok(altitude(Body.Sun, o, t) < -17.99);
    assert.ok(altitude(Body.Moon, o, t) < 0);
  }
});
test("hourly forecast ranking chooses a clearer eligible hour and stale dates remain unavailable", () => {
  const times = Array.from({ length: 12 }, (_, i) =>
    localStamp(new Date(Date.UTC(2026, 9, 13, 15 + i))),
  );
  const f = {
    hourly: {
      time: times,
      cloud_cover: times.map((_, i) => (i === 4 ? 0 : 80)),
      relative_humidity_2m: times.map(() => 50),
      visibility: times.map(() => 20000),
    },
  };
  const p = planNight("2026-10-13", muscat, f);
  assert.equal(p.weatherRanked, true);
  assert.equal(p.best.weather.cloud, 0);
  assert.equal(weatherAt(f, new Date("2026-11-01T00:00:00Z")), null);
  assert.equal(planNight("2026-11-01", muscat, f).weatherRanked, false);
});
test("Oman date handling and impossible dates are explicit", () => {
  assert.equal(
    nextCrescentDate(new Date("2026-09-26T10:00:00Z")),
    "2026-10-11",
  );
  assert.throws(() => planNight("2026-02-30", muscat));
  assert.throws(() => planNight("bad", muscat));
  const a = planNight("2026-10-12", muscat),
    b = planNight("2026-10-12", [22.25, 58.67]);
  assert.notEqual(a.crescent.sunset.getTime(), b.crescent.sunset.getTime());
});
