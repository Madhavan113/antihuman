'use client'

import { useEffect, useRef } from 'react'

export function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Small canvas for the grain texture, tiled via CSS
    canvas.width = 256
    canvas.height = 256

    let frame: number

    function renderGrain() {
      if (!ctx) return
      const imageData = ctx.createImageData(256, 256)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 18 // very subtle
      }

      ctx.putImageData(imageData, 0, 0)
      frame = requestAnimationFrame(renderGrain)
    }

    renderGrain()

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
        opacity: 0.6,
        mixBlendMode: 'overlay',
      }}
    />
  )
}
