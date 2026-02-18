interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  className?: string
}

export function Sparkline({ values, width = 120, height = 32, className = '' }: SparklineProps) {
  if (values.length < 2) return null

  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * height * 0.85 - height * 0.075
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`
  const fadeStart = width * 0.75

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="sparklFade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset={`${(fadeStart / width) * 100}%`} stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="sparklMask">
          <rect width={width} height={height} fill="url(#sparklFade)" />
        </mask>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        mask="url(#sparklMask)"
      />
    </svg>
  )
}
