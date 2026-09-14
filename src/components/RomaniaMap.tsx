import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { geoMercator, geoPath } from 'd3-geo'
import type { FeatureCollection, Geometry } from 'geojson'
import geo from '@/data/judete.json'
import { CATEGORIES, CATEGORY, type Entity } from '@/lib/entities'

const W = 1000
const H = 640
const PAD = 0.88

type JudetProps = { code: string; name: string }
const FC = geo as FeatureCollection<Geometry, JudetProps>

const projection = geoMercator().fitSize([W, H], FC)
const path = geoPath(projection)

const SHAPES = FC.features.map((f) => ({
  code: f.properties.code,
  name: f.properties.name,
  d: path(f) ?? '',
  centroid: path.centroid(f),
  bounds: path.bounds(f),
}))

// Nudge labels for județe whose centroid collides with a neighbour (Ilfov wraps București).
const LABEL_OFFSET: Record<string, [number, number]> = { B: [0, 2], IF: [30, -22] }

function viewFor(code: string | null) {
  if (!code) return { k: 1, x: 0, y: 0 }
  const s = SHAPES.find((s) => s.code === code)
  if (!s) return { k: 1, x: 0, y: 0 }
  const [[x0, y0], [x1, y1]] = s.bounds
  const bw = x1 - x0, bh = y1 - y0
  const k = Math.min(W / bw, H / bh) * PAD
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  return { k, x: W / 2 - cx * k, y: H / 2 - cy * k }
}

/** Spread entities sharing the same coordinate on a small golden-angle spiral (projected px). */
function layout(entities: Entity[]) {
  const groups = new Map<string, Entity[]>()
  const pts: { e: Entity; x: number; y: number }[] = []
  for (const e of entities) {
    if (e.lat == null || e.lng == null) continue
    const key = `${e.lat.toFixed(3)},${e.lng.toFixed(3)}`
    const g = groups.get(key) ?? []
    g.push(e)
    groups.set(key, g)
  }
  for (const g of groups.values()) {
    const p = projection([g[0].lng!, g[0].lat!])
    if (!p) continue
    g.forEach((e, i) => {
      const r = i === 0 ? 0 : 0.9 * Math.sqrt(i)
      const a = i * 2.39996
      pts.push({ e, x: p[0] + r * Math.cos(a), y: p[1] + r * Math.sin(a) })
    })
  }
  return pts
}

interface Props {
  entities: Entity[]
  counts: Map<string, number>
  catCounts: Map<string, Partial<Record<Entity['category'], number>>>
  judet: string | null
  selectedId: string | null
  onJudet: (code: string | null) => void
  onEntity: (e: Entity) => void
}

export function RomaniaMap({ entities, counts, catCounts, judet, selectedId, onJudet, onEntity }: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const [hoverJudet, setHoverJudet] = useState<{ code: string; x: number; y: number } | null>(null)
  // Aceternity-style: tooltip tilts/slides with cursor position inside the hovered shape.
  const mx = useMotionValue(0.5)
  const spring = { stiffness: 120, damping: 14 }
  const rotate = useSpring(useTransform(mx, [0, 1], [-12, 12]), spring)
  const translateX = useSpring(useTransform(mx, [0, 1], [-28, 28]), spring)
  const view = useMemo(() => viewFor(judet), [judet])
  const pts = useMemo(() => (judet ? layout(entities.filter((e) => e.judet === judet)) : []), [entities, judet])
  const max = Math.max(1, ...counts.values())
  const inv = 1 / view.k
  const hovered = hover ? pts.find((p) => p.e.id === hover) : undefined

  const hj = hoverJudet ? SHAPES.find((s) => s.code === hoverJudet.code) : undefined
  const hjCats = hoverJudet ? catCounts.get(hoverJudet.code) ?? {} : {}

  return (
    <div className="relative h-full w-full">
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full select-none"
      role="img"
      aria-label="Harta României pe județe"
      onClick={(ev) => { if (ev.target === ev.currentTarget && judet) onJudet(null) }}
    >
      <g
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
          transformOrigin: '0 0',
          transition: 'transform 560ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {SHAPES.map((s) => {
          const n = counts.get(s.code) ?? 0
          const heat = judet ? undefined : `oklch(${0.2 + 0.14 * Math.sqrt(n / max)} ${0.01 + 0.03 * (n / max)} 260)`
          return (
            <path
              key={s.code}
              d={s.d}
              className="map-judet"
              style={heat ? { fill: heat } : undefined}
              data-active={judet === s.code}
              data-dim={judet != null && judet !== s.code}
              data-hover={hoverJudet?.code === s.code}
              onMouseEnter={(ev) => {
                if (judet) return
                const r = (ev.currentTarget as SVGPathElement).getBoundingClientRect()
                setHoverJudet({ code: s.code, x: r.left + r.width / 2, y: r.top })
              }}
              onMouseMove={(ev) => {
                if (judet) return
                const r = (ev.currentTarget as SVGPathElement).getBoundingClientRect()
                mx.set(r.width ? (ev.clientX - r.left) / r.width : 0.5)
              }}
              onMouseLeave={() => setHoverJudet(null)}
              onClick={(ev) => { ev.stopPropagation(); setHoverJudet(null); onJudet(judet === s.code ? null : s.code) }}
            />
          )
        })}

        {!judet &&
          SHAPES.map((s) => {
            const n = counts.get(s.code) ?? 0
            const [ox, oy] = LABEL_OFFSET[s.code] ?? [0, 0]
            const x = s.centroid[0] + ox, y = s.centroid[1] + oy
            return (
              <g key={`t-${s.code}`} className="pointer-events-none" style={{ opacity: n ? 1 : 0.4 }}>
                <text x={x} y={y - 6} textAnchor="middle" dominantBaseline="central" className="fill-white/55"
                  style={{ fontSize: 7.5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {s.name}
                </text>
                <text x={x} y={y + 6} textAnchor="middle" dominantBaseline="central" className="tabular fill-white/85"
                  style={{ fontSize: 12, fontWeight: 600 }}>
                  {n}
                </text>
              </g>
            )
          })}

        {pts.map(({ e, x, y }) => {
          const sel = e.id === selectedId
          const c = CATEGORY[e.category].color
          return (
            <circle
              key={e.id}
              cx={x}
              cy={y}
              r={(sel ? 6 : 4) * inv}
              fill={c}
              stroke={sel ? 'white' : 'oklch(0 0 0 / 55%)'}
              strokeWidth={(sel ? 1.6 : 0.8) * inv}
              opacity={hover && hover !== e.id ? 0.55 : 1}
              className="cursor-pointer"
              style={{ transition: 'opacity 150ms ease, r 150ms ease' }}
              onMouseEnter={() => setHover(e.id)}
              onMouseLeave={() => setHover(null)}
              onClick={(ev) => { ev.stopPropagation(); onEntity(e) }}
            />
          )
        })}

        {hovered && (
          <g transform={`translate(${hovered.x}, ${hovered.y}) scale(${inv})`} className="pointer-events-none">
            <foreignObject x={10} y={-14} width={280} height={40}>
              <div className="glass inline-block max-w-[270px] truncate rounded-lg px-2.5 py-1 text-[12px] leading-tight text-white">
                {hovered.e.name}
              </div>
            </foreignObject>
          </g>
        )}
      </g>
    </svg>

    <AnimatePresence>
      {hoverJudet && hj && !judet && (
        <motion.div
          key={hj.code}
          initial={{ opacity: 0, y: 12, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 12 } }}
          exit={{ opacity: 0, y: 12, scale: 0.6, transition: { duration: 0.15 } }}
          style={{ translateX, rotate, left: hoverJudet.x, top: hoverJudet.y - 8 }}
          className="pointer-events-none fixed z-30"
        >
          <div className="relative flex w-max max-w-[220px] -translate-x-1/2 -translate-y-full flex-col items-center rounded-xl bg-black/90 px-3.5 py-2 text-center shadow-2xl ring-1 ring-white/10">
            <div className="absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            <div className="absolute inset-x-12 -bottom-px h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
            <div className="text-[13px] font-semibold tracking-tight text-white">{hj.name}</div>
            <div className="tabular text-[11px] text-white/60">{counts.get(hj.code) ?? 0} entități</div>
            <div className="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-0.5">
              {CATEGORIES.filter((c) => hjCats[c]).map((c) => (
                <span key={c} className="tabular flex items-center gap-1 text-[10px] text-white/75">
                  <span className="size-1.5 rounded-full" style={{ background: CATEGORY[c].color }} />
                  {hjCats[c]} {CATEGORY[c].short}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  )
}
