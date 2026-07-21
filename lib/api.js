const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function apiFetch(path, options = {}) {
    try {
        const res = await fetch(`${BASE}${path}`, options)
        if (!res.ok) {
            // Try to get error message from response, otherwise use status text
            let errorMsg = `HTTP error! status: ${res.status}`
            try {
                const errorData = await res.json()
                errorMsg = errorData.message || errorMsg
            } catch {
                // Ignore if json parsing fails
            }
            throw new Error(errorMsg)
        }
        return res.json()
    } catch (error) {
        console.error('API fetch error:', error)
        throw error
    }
}


// async function apiFetch(path, options = {}, retries = 2) {
//     try {
//         const res = await fetch(`${BASE}${path}`, options)
//         if (!res.ok) {
//         let errorMsg = `HTTP error! status: ${res.status}`
//         const contentType = res.headers.get("content-type")
//         if (contentType?.includes("application/json")) {
//             const errorData = await res.json()
//             errorMsg = errorData.message || errorMsg
//         }
//         throw new Error(errorMsg)
//         }
//         return res.json()
//     } catch (error) {
//         if (retries > 0) {
//         console.warn(`Retrying... attempts left: ${retries}`)
//         return apiFetch(path, options, retries - 1)
//         }
//         console.error('API fetch error:', error)
//         throw error
//     }
// }



