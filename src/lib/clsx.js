// Tiny classnames helper — accepts strings, arrays, and { class: bool } objects.
export function clsx(...args) {
  const out = []
  for (const a of args) {
    if (!a) continue
    if (typeof a === 'string' || typeof a === 'number') out.push(a)
    else if (Array.isArray(a)) out.push(clsx(...a))
    else if (typeof a === 'object') for (const k in a) if (a[k]) out.push(k)
  }
  return out.join(' ')
}
