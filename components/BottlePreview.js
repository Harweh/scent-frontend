'use client'

/**
 * BottlePreview — visual representation of a bespoke blend.
 * Shows a layered "bottle" built from the matched fragrance note colors.
 * Used on the Bespoke Lab result step.
 *
 * Props:
 *   notes — array of { name, color, emoji, role, mlUsed }
 *   perfumeName — string
 */
export default function BottlePreview({ notes = [], perfumeName = '' }) {
    if (!notes.length) return null

    // Each layer height is proportional to mlUsed
    const total = notes.reduce((sum, n) => sum + (n.mlUsed || 1), 0)

    return (
        <div className="flex flex-col items-center gap-4">
        {/* Bottle SVG shape with coloured layers inside */}
        <div className="relative w-28 h-48">
            {/* Bottle neck */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-10 bg-white/5 border border-white/20 rounded-t-lg" />
            {/* Cap */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-4 bg-[#B8924A] rounded-sm" />

            {/* Bottle body — clipped with rounded bottom */}
            <div className="absolute bottom-0 left-0 right-0 top-8 overflow-hidden rounded-b-2xl border border-white/20">
            {/* Layers rendered bottom-up */}
            {[...notes].reverse().map((note, i) => {
                const heightPct = ((note.mlUsed || 1) / total) * 100
                return (
                <div
                    key={i}
                    style={{
                    height: `${heightPct}%`,
                    backgroundColor: note.color || '#1C1813',
                    opacity: 0.75,
                    }}
                    className="w-full transition-all duration-700"
                    title={`${note.name} — ${note.role} note`}
                />
                )
            })}

            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent pointer-events-none" />
            </div>
        </div>

        {/* Fragrance name label */}
        <div className="text-center">
            <p className="font-[family-name:var(--font-display)] italic text-lg text-[#B8924A]">
            {perfumeName}
            </p>
            {/* Note layer legend */}
            <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
            {notes.map((note, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[10px] text-[#F5EFE6]/40 uppercase tracking-[0.1em]">
                <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: note.color || '#B8924A' }}
                />
                {note.role}
                </span>
            ))}
            </div>
        </div>
        </div>
    )
}