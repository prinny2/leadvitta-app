import Link from "next/link";

type LegalConsentLinksProps = {
  tone?: "dark" | "light";
  className?: string;
};

export function LegalConsentLinks({
  tone = "dark",
  className = "",
}: LegalConsentLinksProps) {
  const textColor =
    tone === "light" ? "rgba(255,255,255,0.45)" : "rgba(7,16,30,0.55)";
  const linkColor = tone === "light" ? "#D9B66D" : "#7A5108";

  return (
    <p
      className={className}
      style={{
        color: textColor,
        fontSize: "11px",
        lineHeight: 1.65,
        textAlign: "center",
      }}
    >
      Ao continuar, você concorda com os{" "}
      <Link
        href="/termos"
        style={{
          color: linkColor,
          fontWeight: 700,
          textDecoration: "underline",
        }}
      >
        Termos de Serviço
      </Link>
      ,{" "}
      <Link
        href="/privacidade"
        style={{
          color: linkColor,
          fontWeight: 700,
          textDecoration: "underline",
        }}
      >
        Privacidade
      </Link>{" "}
      e{" "}
      <Link
        href="/reembolso"
        style={{
          color: linkColor,
          fontWeight: 700,
          textDecoration: "underline",
        }}
      >
        Reembolso
      </Link>
      .
    </p>
  );
}
