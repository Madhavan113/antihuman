// packages/ui/lib/shapes.ts

export function humanSilhouette(
  count: number,
  cx: number, cy: number, cz: number,
  scale: number
): Float32Array {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = Math.random()
    let x = 0, y = 0, z = 0
    const noise = () => (Math.random() - 0.5) * 0.06 * scale

    if (r < 0.12) {
      // Head: sphere at top
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const hr = 0.16 * scale
      x = hr * Math.sin(phi) * Math.cos(theta)
      y = 0.68 * scale + hr * Math.cos(phi)
      z = hr * 0.6 * Math.sin(phi) * Math.sin(theta)
    } else if (r < 0.45) {
      // Torso: wider at shoulders, narrower at waist
      const t = Math.random()
      const width = (0.28 - t * 0.08) * scale
      x = (Math.random() - 0.5) * 2 * width
      y = (0.3 - t * 0.5) * scale
      z = (Math.random() - 0.5) * 0.12 * scale
    } else if (r < 0.65) {
      // Arms
      const side = Math.random() < 0.5 ? 1 : -1
      const t = Math.random()
      if (t < 0.5) {
        x = side * (0.3 + t * 0.15) * scale
        y = (0.25 - t * 0.3) * scale
      } else {
        const ft = (t - 0.5) * 2
        x = side * (0.45 - ft * 0.1) * scale
        y = (-0.05 - ft * 0.25) * scale
      }
      z = (Math.random() - 0.5) * 0.08 * scale
    } else if (r < 0.72) {
      // Hips
      x = (Math.random() - 0.5) * 0.36 * scale
      y = (-0.22 + (Math.random() - 0.5) * 0.06) * scale
      z = (Math.random() - 0.5) * 0.12 * scale
    } else {
      // Legs
      const side = Math.random() < 0.5 ? 1 : -1
      const t = Math.random()
      if (t < 0.5) {
        x = side * (0.1 + t * 0.02) * scale
        y = (-0.22 - t * 0.4) * scale
      } else {
        const lt = (t - 0.5) * 2
        x = side * (0.12 - lt * 0.02) * scale
        y = (-0.42 - lt * 0.35) * scale
      }
      z = (Math.random() - 0.5) * 0.08 * scale
    }

    pos[i * 3]     = cx + x + noise()
    pos[i * 3 + 1] = cy + y + noise()
    pos[i * 3 + 2] = cz + z + noise() * 0.5
  }
  return pos
}

export function dnaHelix(
  count: number,
  cx: number, cy: number, cz: number,
  scale: number
): Float32Array {
  const pos = new Float32Array(count * 3)
  const R = 0.28 * scale
  const height = 1.9 * scale
  const turns = 3.5

  for (let i = 0; i < count; i++) {
    const t = Math.random()
    const angle = t * turns * Math.PI * 2
    const y = t * height - height / 2
    const rnd = Math.random()
    const n = (v: number) => v + (Math.random() - 0.5) * 0.04 * scale

    if (rnd < 0.44) {
      // Strand A
      pos[i * 3]     = n(cx + R * Math.cos(angle))
      pos[i * 3 + 1] = n(cy + y)
      pos[i * 3 + 2] = n(cz + R * Math.sin(angle))
    } else if (rnd < 0.88) {
      // Strand B (offset π)
      pos[i * 3]     = n(cx + R * Math.cos(angle + Math.PI))
      pos[i * 3 + 1] = n(cy + y)
      pos[i * 3 + 2] = n(cz + R * Math.sin(angle + Math.PI))
    } else {
      // Crossbars
      const step = Math.round(t * turns * 2)
      const crossAngle = step * Math.PI
      const crossT = Math.random()
      pos[i * 3]     = cx + R * (2 * crossT - 1) * Math.cos(crossAngle)
      pos[i * 3 + 1] = cy + (step / (turns * 2)) * height - height / 2
      pos[i * 3 + 2] = cz + R * (2 * crossT - 1) * Math.sin(crossAngle)
    }
  }
  return pos
}

export function chainLinks(
  count: number,
  cx: number, cy: number, cz: number,
  scale: number
): Float32Array {
  const pos = new Float32Array(count * 3)
  const numLinks = 6
  const R = 0.22 * scale   // ring radius
  const r = 0.055 * scale  // tube radius
  const spacing = R * 1.55

  for (let i = 0; i < count; i++) {
    const linkIdx = Math.floor(Math.random() * numLinks)
    const horizontal = linkIdx % 2 === 0
    const u = Math.random() * Math.PI * 2
    const v = Math.random() * Math.PI * 2
    const tx = (R + r * Math.cos(v)) * Math.cos(u)
    const ty = r * Math.sin(v)
    const tz = (R + r * Math.cos(v)) * Math.sin(u)
    const offset = (linkIdx - (numLinks - 1) / 2) * spacing

    if (horizontal) {
      pos[i * 3]     = cx + offset * 0.7 + tx
      pos[i * 3 + 1] = cy + offset * 0.7 + ty
      pos[i * 3 + 2] = cz + tz
    } else {
      pos[i * 3]     = cx + offset * 0.7 + ty
      pos[i * 3 + 1] = cy + offset * 0.7 + tx
      pos[i * 3 + 2] = cz + tz
    }
  }
  return pos
}
