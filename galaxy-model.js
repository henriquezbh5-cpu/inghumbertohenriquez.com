/* Deterministic, normalized galaxy shapes. Artistic geometry, not a physics model. */
export const GALAXY_TYPES = Object.freeze([
  "spiral",
  "andromeda",
  "barred",
  "elliptical",
  "irregular",
]);

export function randomSource(seed = 260930) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function createGalaxy(type, count, seed = 260930) {
  if (!GALAXY_TYPES.includes(type) || !Number.isInteger(count) || count < 1) {
    throw new RangeError(
      "A supported galaxy type and positive integer count are required.",
    );
  }
  const random = randomSource(seed);
  const normal = () =>
    Math.sqrt(-2 * Math.log(Math.max(0.000001, random()))) *
    Math.cos(random() * Math.PI * 2);
  const position = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const tone = new Float32Array(count);
  const phase = new Float32Array(count);
  const cloud = new Float32Array(count);
  const clusters = [
    [-0.36, 0.15],
    [0.25, 0.34],
    [0.2, -0.22],
    [-0.5, -0.32],
    [0.52, -0.06],
  ];
  for (let i = 0; i < count; i++) {
    const dust = random() < 0.16;
    const bulge = random() < (type === "andromeda" ? 0.28 : 0.18);
    let x, y, z, radius;
    if (type === "elliptical" || bulge) {
      const extent = type === "elliptical" ? 0.29 : 0.075;
      x = normal() * extent;
      y = normal() * extent * (type === "elliptical" ? 0.65 : 0.82);
      z = normal() * extent * 0.6;
      radius = Math.hypot(x, y);
    } else if (type === "irregular") {
      const cluster = clusters[i % clusters.length];
      x = cluster[0] + normal() * 0.16;
      y = cluster[1] + normal() * 0.15;
      z = normal() * 0.11;
      radius = Math.hypot(x, y);
    } else if (type === "barred" && random() < 0.27) {
      x = (random() - 0.5) * 0.92;
      y = normal() * 0.042;
      z = normal() * 0.027;
      radius = Math.hypot(x, y);
    } else {
      radius = 0.08 + Math.pow(random(), 0.7) * 0.93;
      const arms = type === "spiral" ? 3 : 2;
      const arm = ((i % arms) * Math.PI * 2) / arms;
      const winding =
        type === "barred"
          ? Math.max(0, radius - 0.35) * 5.5
          : Math.log(1 + radius * 13) * 2.35;
      const spread = dust ? 0.12 : random() < 0.78 ? 0.14 : 0.63;
      const angle = arm + winding + normal() * spread;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      z = normal() * (0.009 + radius * 0.016);
    }
    position.set([x, y, z], i * 3);
    size[i] = dust ? 9 + random() * 17 : 0.55 + Math.pow(random(), 5) * 1.85;
    tone[i] =
      type === "elliptical"
        ? Math.min(0.25, radius * 0.3)
        : Math.min(1, radius * 1.22);
    phase[i] = random() * Math.PI * 2;
    cloud[i] = dust ? 1 : 0;
  }
  return { position, size, tone, phase, cloud };
}

export function encounterEnvelope(time, duration = 48) {
  const progress = (((time % duration) + duration) % duration) / duration;
  // Close approach, a shared orbit and a long, soft return into the next encounter.
  const smooth = (value) => value * value * (3 - 2 * value);
  return progress < 0.58
    ? smooth(progress / 0.58)
    : 1 - smooth((progress - 0.58) / 0.42);
}
