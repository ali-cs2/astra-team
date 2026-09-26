import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateForecasts,nextEvening,readingAt,distanceKm} from '../src/lib/observations.ts';
import {powerReduction} from '../src/lib/scenario.ts';
const snapshot=JSON.parse(await readFile(new URL('../public/data/weather-snapshot.json',import.meta.url)));
test('real saved provider response validates and preserves reported units',()=>{
  const data=validateForecasts(snapshot.data);
  const hour=data[0].hourly.time.find(t=>t.endsWith('T20:00'));
  const r=readingAt(data[0],hour);
  assert.equal(r.cloud,snapshot.data[0].hourly.cloud_cover[snapshot.data[0].hourly.time.indexOf(hour)]);
  assert.equal(r.elevation,snapshot.data[0].elevation);
  assert.equal(r.sunrise,data[0].daily.sunrise[1]);
});
test('missing and invalid readings remain missing, including expired forecast hours',()=>{
  const raw=structuredClone(snapshot.data);
  const i=raw[0].hourly.time.findIndex(t=>t.endsWith('T20:00'));
  raw[0].hourly.cloud_cover[i]=null;
  raw[0].hourly.visibility[i]=-1;
  const data=validateForecasts(raw);
  assert.equal(readingAt(data[0],data[0].hourly.time[i]).cloud,null);
  assert.equal(readingAt(data[0],data[0].hourly.time[i]).visibility,null);
  assert.equal(readingAt(data[0],'2099-01-01T20:00'),null);
});
test('normalized API packets survive local storage round-trip without losing unit metadata',()=>{
  const normalized=validateForecasts(snapshot.data);
  assert.deepEqual(validateForecasts(JSON.parse(JSON.stringify(normalized))),normalized);
});
test('error payloads, wrong units and wrong geographic ordering are rejected',()=>{
  assert.throws(()=>validateForecasts({error:true,reason:'unavailable'}));
  const raw=structuredClone(snapshot.data);raw[0].hourly_units.visibility='km';
  assert.throws(()=>validateForecasts(raw));
  assert.throws(()=>validateForecasts([...snapshot.data].reverse()));
});
test('next evening uses Oman UTC+4, including midnight and the 20:00 boundary',()=>{
  assert.equal(nextEvening(new Date('2026-09-26T15:59:00Z')),'2026-09-26T20:00');
  assert.equal(nextEvening(new Date('2026-09-26T16:00:00Z')),'2026-09-27T20:00');
  assert.equal(nextEvening(new Date('2026-09-26T21:00:00Z')),'2026-09-27T20:00');
});
test('geographic distances use kilometres and remain finite at antipodes',()=>{
  assert.equal(distanceKm([23,58],[23,58]),0);
  assert.ok(Math.abs(distanceKm([0,0],[0,90])-10007.5572)<.01);
  assert.ok(Number.isFinite(distanceKm([0,0],[0,180])));
});
test('fixture power change is 66.7%, never an extrapolated skyglow score',()=>{
  assert.equal(powerReduction(90,30),66.7);
  assert.equal(powerReduction(90,90),0);
  assert.throws(()=>powerReduction(0,30));
  assert.throws(()=>powerReduction(30,90));
});
