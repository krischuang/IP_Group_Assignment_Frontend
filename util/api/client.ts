const raw = (process.env.NEXT_PUBLIC_API_URL ?? 'https://utsipgroup.duckdns.org/api').trim()
/** No trailing slash — join paths as `${API_BASE}/articles/` */
export const API_BASE = raw.replace(/\/+$/, '')
