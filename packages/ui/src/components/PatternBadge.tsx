import { useEffect, useRef } from 'react'
import { BAYER4 as B } from '../lib/dither'

type PFn = (x: number, y: number) => boolean

const PATTERNS: PFn[] = [
  (x, y) => (x + y) % 4 === 0 || ((x - y) % 4 + 4) % 4 === 0,
  (x, y) => !!((x >> 1 ^ y >> 1) & 1),
  (x, y) => (Math.abs(x % 8 - 4) + Math.abs(y % 8 - 4)) < 4,
  (x, y) => { const a = (x % 6) - 3, b = (y % 6) - 3; return a * a + b * b < 5 },
  (x, y) => B[y & 3][x & 3] > 6,
  (_x, y) => (y & 3) < 2,
]

export function PatternBadge({
  idx,
  size = 32,
  fg = '#fff',
  bg = '#000',
}: {
  idx: number
  size?: number
  fg?: string
  bg?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const fn = PATTERNS[idx % PATTERNS.length]
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        ctx.fillStyle = fn(x, y) ? fg : bg
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }, [idx, size, fg, bg])

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        border: '1px solid var(--border)',
        flexShrink: 0,
      }}
    />
  )
}
