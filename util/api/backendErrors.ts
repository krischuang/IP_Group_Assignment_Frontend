/** Map FastAPI / Starlette `{ detail }` payloads to a string. */
export function messageFromApiError(body: unknown): string {
    if (!body || typeof body !== 'object') return 'Request failed.'
    const d = (body as { detail?: unknown }).detail
    if (typeof d === 'string') return d
    if (Array.isArray(d))
        return d
            .map((x: unknown) => {
                if (x && typeof x === 'object' && 'msg' in x)
                    return String((x as { msg?: unknown }).msg ?? '')
                try {
                    return JSON.stringify(x)
                } catch {
                    return ''
                }
            })
            .filter(Boolean)
            .join(' ')
            .trim()
    try {
        return JSON.stringify(body)
    } catch {
        return 'Request failed.'
    }
}
