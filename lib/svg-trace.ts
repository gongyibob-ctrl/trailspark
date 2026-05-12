// Convert a GPS coordinate array to an SVG path string, normalized to a
// viewBox of `vb × vb` (default 100). Used by TrailCard to render the trail
// trace as a glowing line per Style F.
//
// - Coords are [lng, lat] pairs.
// - Y is flipped (SVG Y goes down, lat goes up).
// - The trace is centered within the viewBox; aspect is preserved (we never
//   stretch a long ridge into a square).
export function pathFromCoords(
  coords: number[][],
  vb = 100,
  pad = 6,
): string {
  if (!coords || coords.length < 2) return "";

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const avail = vb - pad * 2;
  const scale = Math.min(avail / w, avail / h);
  const offsetX = (vb - w * scale) / 2;
  const offsetY = (vb - h * scale) / 2;

  const cmds: string[] = [];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    const px = (x - minX) * scale + offsetX;
    const py = vb - ((y - minY) * scale + offsetY); // flip Y
    cmds.push(`${i === 0 ? "M" : "L"}${px.toFixed(2)} ${py.toFixed(2)}`);
  }
  return cmds.join("");
}
