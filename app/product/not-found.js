/* eslint-disable react/no-unescaped-entities */
    import Link from 'next/link'

    export default function NotFound() {
    return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6] flex items-center justify-center px-6">
        <div className="text-center max-w-md">

            {/* Decorative number */}
            <p className="font-[family-name:var(--font-display)] text-[120px] sm:text-[160px] leading-none text-white/5 select-none mb-0">
            404
            </p>

            <div className="-mt-8 sm:-mt-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B8924A] mb-3">
                Page Not Found
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl mb-4">
                This scent doesn't exist
            </h1>
            <p className="text-sm text-[#F5EFE6]/40 leading-relaxed mb-10">
                The page you're looking for may have been moved, deleted, or never existed. 
                Let us guide you back to something beautiful.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 bg-[#B8924A] text-[#100E0B] px-8 py-3.5 text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#C9A45A] transition-colors"
                >
                Browse Collection
                </Link>
                <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-white/15 px-8 py-3.5 text-xs uppercase tracking-[0.15em] hover:border-[#B8924A] hover:text-[#B8924A] transition-colors"
                >
                Go Home
                </Link>
            </div>
            </div>

        </div>
        </main>
    )
    }