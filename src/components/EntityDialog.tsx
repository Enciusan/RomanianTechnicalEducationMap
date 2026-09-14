import { ExternalLink, Globe, Mail, MapPin, Phone, User } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BY_ID, CATEGORY, DATA, JUDET_NAME, type Entity } from '@/lib/entities'

interface Props {
  entity: Entity | null
  onClose: () => void
  onEntity: (e: Entity) => void
}

function Row({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</div>
        <div className="mt-0.5 text-sm break-words">{children}</div>
      </div>
    </div>
  )
}

const link = 'cursor-pointer underline decoration-white/25 underline-offset-4 hover:decoration-white'

export function EntityDialog({ entity: e, onClose, onEntity }: Props) {
  const parent = e?.parent_id ? BY_ID.get(e.parent_id) : undefined
  const children = e ? DATA.filter((x) => x.parent_id === e.id) : []
  return (
    <Dialog open={!!e} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-2xl border-0 p-0 sm:w-full" showCloseButton>
        {e && (
          <div className="p-5 sm:p-6">
            <DialogHeader className="mb-3 gap-2 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium">
                  <span className="size-1.5 rounded-full" style={{ background: CATEGORY[e.category].color }} aria-hidden />
                  {CATEGORY[e.category].label}
                </span>
                {e.rank != null && <span className="glass-pill tabular rounded-full px-2.5 py-1 text-[11px] font-medium">#{e.rank}{e.score != null && ` · ${e.score}`}</span>}
                {e.tags?.filter((t) => !['ftc', 'mate-info', 'registru-ong'].includes(t)).map((t) => (
                  <span key={t} className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>
                ))}
              </div>
              <DialogTitle className="text-lg leading-snug font-semibold tracking-tight">{e.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1.5 text-sm">
                <MapPin className="size-3.5" aria-hidden />
                {[e.city, JUDET_NAME.get(e.judet)].filter(Boolean).join(', ')}
              </DialogDescription>
            </DialogHeader>

            <div className="divide-y divide-white/8">
              {e.email && <Row icon={Mail} label="Email"><a className={link} href={`mailto:${e.email}`}>{e.email}</a></Row>}
              {e.phone && <Row icon={Phone} label="Telefon"><a className={link} href={`tel:${e.phone.replace(/[^\d+]/g, '')}`}>{e.phone}</a></Row>}
              {e.contact_name && <Row icon={User} label="Contact">{e.contact_name}</Row>}
              {e.url && (
                <Row icon={Globe} label="Site">
                  <a className={`${link} inline-flex items-center gap-1`} href={e.url} target="_blank" rel="noreferrer">
                    {e.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} <ExternalLink className="size-3" aria-hidden />
                  </a>
                </Row>
              )}
              {e.notes && <div className="py-3 text-sm leading-relaxed text-muted-foreground">{e.notes}</div>}
              {parent && (
                <div className="py-3 text-sm">
                  <span className="text-muted-foreground">Parte din </span>
                  <button className={link} onClick={() => onEntity(parent)}>{parent.name}</button>
                </div>
              )}
              {children.length > 0 && (
                <div className="py-3">
                  <div className="mb-1.5 text-[11px] tracking-wide text-muted-foreground uppercase">Legate</div>
                  <ul className="space-y-1">
                    {children.map((c) => (
                      <li key={c.id}>
                        <button className={`${link} text-left text-sm`} onClick={() => onEntity(c)}>{c.name}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
              <a href={e.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                sursă <ExternalLink className="size-3" aria-hidden />
              </a>
              <span className="tabular">{e.id} · {e.scraped_at.slice(0, 10)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
