import { useEffect, useRef, useState } from 'react'

interface HashScanLinkProps {
  id: string
  url: string
  label?: string
}

export function HashScanLink({ id, url, label }: HashScanLinkProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function copy() {
    void navigator.clipboard.writeText(id)
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1500)
  }

  const display = label ?? (id.length > 20 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id)

  return (
    <span className="inline-flex items-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs hover:underline"
        style={{ color: 'var(--accent)' }}
        title={id}
      >
        {display}
      </a>
      <button
        onClick={copy}
        className="label"
        style={{ fontSize: 10, cursor: 'pointer', color: copied ? 'var(--accent)' : 'var(--text-dim)', background: 'none', border: 'none' }}
      >
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </span>
  )
}
