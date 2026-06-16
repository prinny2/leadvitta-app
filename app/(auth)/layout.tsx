export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-navy-900">
      {/* Logo SVG inline */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <svg width="52" height="52" viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 4 L76 40 L40 76 L4 40 Z" stroke="#C9A060" strokeWidth="3" strokeLinejoin="round" fill="none"/>
          <path d="M40 76 C22 68 10 54 16 40" stroke="#C9A060" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          <path d="M40 76 C58 68 70 54 64 40" stroke="#C9A060" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          <line x1="40" y1="30" x2="40" y2="76" stroke="#C9A060" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="40" cy="27" r="5" fill="#C9A060"/>
        </svg>
        <p className="font-serif text-2xl font-semibold text-champagne-300">
          Lead<span className="text-gold-500">Bellus</span>
        </p>
      </div>
      {children}
    </div>
  );
}
