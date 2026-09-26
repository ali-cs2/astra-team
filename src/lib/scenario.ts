/** Affected fixtures' power draw; not a citywide energy or skyglow prediction. */
export function powerReduction(before: number, after: number) {
  if (
    !Number.isFinite(before) ||
    !Number.isFinite(after) ||
    before <= 0 ||
    after < 0 ||
    after > before
  )
    throw new Error("Invalid dimming settings");
  return Math.round((1 - after / before) * 1000) / 10;
}
