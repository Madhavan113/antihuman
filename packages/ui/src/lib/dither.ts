export type DitherPattern = 'bayer4' | 'checker' | 'diamond' | 'hatch' | 'plus' | 'stair'

// 4x4 Bayer matrix, values 0-15
const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
]

/**
 * Draw a single dither tile onto a canvas context at (x, y).
 * intensity: 0 = all loColor, 1 = all hiColor
 */
export function drawDitherTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  pattern: DitherPattern,
  intensity: number,
  hiHex = '#E8E4DF',
  loHex = '#1E1C1A',
): void {
  const threshold = 1 - intensity

  ctx.fillStyle = loHex
  ctx.fillRect(x, y, tileSize, tileSize)

  for (let py = 0; py < tileSize; py++) {
    for (let px = 0; px < tileSize; px++) {
      let on = false

      if (pattern === 'bayer4') {
        const bv = BAYER4[py % 4][px % 4] / 15
        on = bv >= threshold
      } else if (pattern === 'checker') {
        on = (px + py) % 2 === 0 ? intensity > 0.25 : intensity > 0.75
      } else if (pattern === 'diamond') {
        const cx = tileSize / 2, cy = tileSize / 2
        const d = (Math.abs(px - cx) + Math.abs(py - cy)) / tileSize
        on = d < intensity * 0.7
      } else if (pattern === 'hatch') {
        on = (px + py) % 4 < Math.round(intensity * 4)
      } else if (pattern === 'plus') {
        const mx = px % 4, my = py % 4
        on = (mx === 2 || my === 2) && intensity > 0.3
      } else if (pattern === 'stair') {
        const step = Math.floor(px / (tileSize / 4))
        on = py > tileSize - (step + 1) * (tileSize / 4) * intensity
      }

      if (on) {
        ctx.fillStyle = hiHex
        ctx.fillRect(x + px, y + py, 1, 1)
      }
    }
  }
}

/**
 * Fill an entire canvas with a dither mosaic of tileSize x tileSize blocks.
 */
export function fillDitherMosaic(
  canvas: HTMLCanvasElement,
  pattern: DitherPattern,
  intensity: number,
  tileSize = 8,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let y = 0; y < canvas.height; y += tileSize) {
    for (let x = 0; x < canvas.width; x += tileSize) {
      drawDitherTile(ctx, x, y, Math.min(tileSize, canvas.width - x), pattern, intensity)
    }
  }
}

/**
 * Map a 0-1 data value to a DitherPattern + intensity pair.
 * Used for encoding volume (market cards) and reputation (agent cards).
 */
export function dataToPattern(value: number): { pattern: DitherPattern; intensity: number } {
  const clamped = Math.max(0, Math.min(1, value))
  if (clamped < 0.2) return { pattern: 'diamond',  intensity: 0.2 + clamped }
  if (clamped < 0.5) return { pattern: 'bayer4',   intensity: 0.3 + clamped * 0.8 }
  if (clamped < 0.8) return { pattern: 'checker',  intensity: 0.4 + clamped * 0.6 }
  return                     { pattern: 'checker',  intensity: 0.9 }
}
