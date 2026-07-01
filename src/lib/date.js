// Human-readable date helpers. Input is an ISO 'YYYY-MM-DD' string.
// Both are defensive: if the input isn't a parseable date they return it
// unchanged, so they're safe to apply anywhere.

export function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtRange(startIso, endIso) {
  if (!startIso) return ''
  if (!endIso || startIso === endIso) return fmtDate(startIso)
  const s = new Date(`${startIso}T00:00:00`)
  const e = new Date(`${endIso}T00:00:00`)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return `${startIso} → ${endIso}`

  const sameMonth = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()
  const sameYear = s.getFullYear() === e.getFullYear()
  const month = (d) => d.toLocaleDateString('en-GB', { month: 'short' })

  // e.g. "17–26 Aug 2026"
  if (sameMonth) return `${s.getDate()}–${e.getDate()} ${month(e)} ${e.getFullYear()}`
  // e.g. "27 Jan – 2 Feb 2026"
  if (sameYear) return `${s.getDate()} ${month(s)} – ${e.getDate()} ${month(e)} ${e.getFullYear()}`
  // e.g. "27 Dec 2025 – 3 Jan 2026"
  return `${fmtDate(startIso)} – ${fmtDate(endIso)}`
}
