// const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://feldiva-backend.onrender.com'

// export async function apiFetch(path, options = {}) {
//     const res = await fetch(`${BASE}${path}`, options)
//     return res.json()
// }

// lib/api.js — replace your entire file with this
const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://feldiva-backend.onrender.com'

export async function apiFetch(path, options = {}) {
    const url = `${BASE}${path}`
    const res  = await apiFetch(url, options)
    
    // Never crash on empty body
    const text = await res.text()
    if (!text) return { success: res.ok }
    
    try {
        return JSON.parse(text)
    } catch {
        return { success: false, message: text }
    }
}