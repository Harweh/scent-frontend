const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://feldiva-backend.onrender.com'

export async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, options)
    return res.json()
}