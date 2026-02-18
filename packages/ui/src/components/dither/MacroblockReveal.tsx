import { useEffect, useRef } from 'react'
import { drawDitherTile, type DitherPattern } from '../../lib/dither'

const PATTERNS: DitherPattern[] = ['bayer4', 'checker', 'diamond', 'hatch']

interface Block {
  x: number
  y: number
  size: number
  pattern: DitherPattern
  intensity: number
  tearOffset: number
}

interface MacroblockRevealProps {
  active: boolean
  onDone?: () => void
  className?: string
}

export function MacroblockReveal({ active, onDone, className = '' }: MacroblockRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    const T_SNAP    = 150
    const T_SUBDIV  = 350
    const T_DISSOLVE = 450

    const startTime = performance.now()

    function buildBlocks(blockSize: number): Block[] {
      const blocks: Block[] = []
      for (let y = 0; y < H; y += blockSize) {
        for (let x = 0; x < W; x += blockSize) {
          blocks.push({
            x,
            y,
            size: blockSize,
            pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)],
            intensity: 0.2 + Math.random() * 0.7,
            tearOffset: Math.random() < 0.08 ? (Math.random() * 20 - 10) : 0,
          })
        }
      }
      return blocks
    }

    function drawBlocks(blocks: Block[], alpha: number, tearProgress: number) {
      ctx.clearRect(0, 0, W, H)
      ctx.globalAlpha = alpha
      for (const b of blocks) {
        const tx = b.x + b.tearOffset * tearProgress
        ctx.save()
        ctx.beginPath()
        ctx.rect(tx, b.y, b.size, b.size)
        ctx.clip()
        drawDitherTile(ctx, tx, b.y, b.size, b.pattern, b.intensity)
        ctx.restore()
      }
      ctx.globalAlpha = 1
    }

    let blocks24 = buildBlocks(24)
    let blocks12: Block[] | null = null
    let blocks6: Block[] | null = null

    function frame(now: number) {
      const elapsed = now - startTime

      if (elapsed < T_SNAP) {
        drawBlocks(blocks24, 1, 0)
      } else if (elapsed < T_SUBDIV) {
        const progress = (elapsed - T_SNAP) / (T_SUBDIV - T_SNAP)
        if (progress > 0.5 && !blocks12) blocks12 = buildBlocks(12)
        if (progress > 0.85 && !blocks6) blocks6 = buildBlocks(6)
        const current = blocks6 ?? blocks12 ?? blocks24
        drawBlocks(current, 1, Math.min(progress * 2, 1))
      } else if (elapsed < T_DISSOLVE) {
        const progress = (elapsed - T_SUBDIV) / (T_DISSOLVE - T_SUBDIV)
        const alpha = 1 - progress
        const current = blocks6 ?? blocks12 ?? blocks24
        drawBlocks(current, alpha, 1)
      } else {
        ctx.clearRect(0, 0, W, H)
        cancelAnimationFrame(rafRef.current)
        onDone?.()
        return
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, onDone])

  return (
    <canvas
      ref={canvasRef}
      width={typeof window !== 'undefined' ? window.innerWidth : 1440}
      height={typeof window !== 'undefined' ? window.innerHeight : 900}
      className={`pointer-events-none absolute inset-0 z-50 ${className}`}
      style={{ display: active ? 'block' : 'none' }}
    />
  )
}
