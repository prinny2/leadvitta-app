"use client";

import dynamic from "next/dynamic";

/**
 * Ponte Clerk→Firebase carregada sob demanda.
 *
 * Importada direto no app/layout.tsx, ela colocava o SDK do Firebase (Auth +
 * Firestore, ~110 KB gzip) no JS inicial de TODAS as páginas, inclusive a
 * landing — mesmo com Clerk desligado, quando nem chega a renderizar. Com o
 * import dinâmico o chunk só é pedido quando `isClerkClientConfigured` liga a
 * ponte. O componente em si (components/firebase-session-sync.tsx) não muda:
 * continua dentro do <ClerkProvider> e só roda efeitos no cliente.
 */
const FirebaseSessionSync = dynamic(
  () =>
    import("@/components/firebase-session-sync").then(
      (mod) => mod.FirebaseSessionSync
    ),
  { ssr: false }
);

export function LazyFirebaseSessionSync() {
  return <FirebaseSessionSync />;
}
