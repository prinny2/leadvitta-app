export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-navy-900">
      {/* Logo SVG inline */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <svg width="48" height="58" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 100 C20 80 10 55 20 30 C30 20 45 18 50 22" stroke="#C9A060" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <path d="M50 100 C80 80 90 55 80 30 C70 20 55 18 50 22" stroke="#C9A060" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <path d="M50 8 L70 35 L50 62 L30 35 Z" stroke="#C9A060" strokeWidth="3.5" strokeLinejoin="round" fill="none"/>
          <line x1="50" y1="40" x2="50" y2="100" stroke="#C9A060" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="50" cy="36" r="4" fill="#C9A060"/>
        </svg>
        <div className="text-center">
          <p className="font-serif text-2xl font-semibold text-champagne-300">
            Lead<span className="text-gold-500">Bellus</span>
          </p>
          <p className="text-xs text-navy-100 tracking-widest uppercase mt-0.5">Responda melhor. Agende mais.</p>
        </div>
      </div>
      {children}
    </div>
  );
}
