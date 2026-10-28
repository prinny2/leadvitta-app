#!/usr/bin/env python3
"""Gera os HTMLs 1080×1350 das artes do calendário. O Chrome tira o PNG."""

from pathlib import Path

ROOT = Path("/tmp/leadvitta-social")
OUT = Path("/tmp/social-cards")
FONT_DIR = ROOT / "app" / "fonts"
SYMBOL = ROOT / "public" / "brand" / "lb-symbol-gold.png"

CARDS = [
    {
        "slug": "2026-10-29-secretaria",
        "eyebrow": "Clínicas de estética",
        "title": "A secretária que responde enquanto a cliente ainda está quente.",
        "gold": "ainda está quente.",
        "sub": "No tom da sua clínica. Sua equipe lê e envia.",
    },
    {
        "slug": "2026-10-31-espera",
        "eyebrow": "A espera",
        "title": "Cada minuto sem resposta é uma cliente esfriando.",
        "gold": "esfriando.",
        "sub": "Ela escreve a mensagem. Você manda no intervalo do procedimento.",
    },
    {
        "slug": "2026-11-02-depois",
        "eyebrow": "Depois da cadeira",
        "title": "Quem já fez o procedimento também precisa de cuidado.",
        "gold": "precisa de cuidado.",
        "sub": "O oi do dia seguinte. A manutenção. O retorno que a clínica esquece.",
    },
    {
        "slug": "2026-11-04-equipe",
        "eyebrow": "O cuidado",
        "title": "A secretária escreve. Sua equipe envia.",
        "gold": "Sua equipe envia.",
        "sub": "Preço, promessa e diagnóstico não saem sozinhos.",
    },
    {
        "slug": "2026-11-06-painel",
        "eyebrow": "O painel",
        "title": "Quem está esperando. Quem sumiu. Quem fez e não voltou.",
        "gold": "Quem fez e não voltou.",
        "sub": "O ticket alto aparece na fila, não num relatório vazio.",
    },
    {
        "slug": "2026-11-08-preco",
        "eyebrow": "Quanto custa?",
        "title": "Responder só o preço é o jeito mais rápido de perder.",
        "gold": "de perder.",
        "sub": "Três respostas no tom da casa: suave, consultiva e fechamento.",
    },
    {
        "slug": "2026-11-10-sumiu",
        "eyebrow": "O silêncio",
        "title": "“Vou ver e te falo” não é um não.",
        "gold": "não é um não.",
        "sub": "Um follow-up leve, com o próximo horário, traz a conversa de volta.",
    },
    {
        "slug": "2026-11-12-start",
        "eyebrow": "Start · R$ 97/mês",
        "title": "Uma conversa recuperada paga o mês.",
        "gold": "paga o mês.",
        "sub": "5 respostas grátis. Sem cartão.",
    },
]


def html(card: dict) -> str:
    title = card["title"].replace(card["gold"], f'<span class="gold">{card["gold"]}</span>')
    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<style>
  @font-face {{
    font-family: Fraunces;
    src: url("{FONT_DIR / "fraunces-latin-wght.woff2"}") format("woff2");
    font-weight: 100 900;
    font-display: block;
  }}
  @font-face {{
    font-family: Inter;
    src: url("{FONT_DIR / "inter-latin-wght.woff2"}") format("woff2");
    font-weight: 100 900;
    font-display: block;
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  html, body {{ width: 1080px; height: 1350px; overflow: hidden; background: #07101e; }}
  body {{
    font-family: Inter, sans-serif;
    color: #F4EFE6;
    padding: 88px 84px 72px;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(900px 520px at 90% -10%, rgba(201,160,96,0.22), transparent 60%),
      linear-gradient(165deg, #0c1830 0%, #07101e 48%, #050b14 100%);
  }}
  .eyebrow {{
    color: #C9A060;
    font-size: 26px;
    font-weight: 650;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }}
  h1 {{
    margin-top: 48px;
    font-family: Fraunces, Georgia, serif;
    font-weight: 560;
    font-size: 78px;
    line-height: 1.05;
    letter-spacing: -0.03em;
    max-width: 900px;
  }}
  .gold {{
    font-style: italic;
    font-weight: 560;
    background: linear-gradient(100deg, #E4A84D, #C9A060 55%, #D18A1F);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }}
  .sub {{
    margin-top: 40px;
    max-width: 820px;
    font-size: 34px;
    line-height: 1.35;
    color: rgba(244,239,230,0.74);
  }}
  .spacer {{ flex: 1; }}
  .rule {{
    height: 1px;
    background: linear-gradient(90deg, rgba(201,160,96,0.7), rgba(201,160,96,0));
    margin-bottom: 32px;
  }}
  footer {{
    display: flex;
    align-items: center;
    gap: 22px;
  }}
  footer img {{ width: 72px; height: 72px; }}
  .name {{
    font-family: Fraunces, Georgia, serif;
    font-size: 40px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }}
  .url {{
    margin-top: 2px;
    font-size: 24px;
    letter-spacing: 0.04em;
    color: rgba(244,239,230,0.55);
  }}
</style>
</head>
<body>
  <p class="eyebrow">{card["eyebrow"]}</p>
  <h1>{title}</h1>
  <p class="sub">{card["sub"]}</p>
  <div class="spacer"></div>
  <div class="rule"></div>
  <footer>
    <img src="{SYMBOL}" alt="" />
    <div>
      <div class="name">LeadBellus</div>
      <div class="url">leadbellus.com.br</div>
    </div>
  </footer>
</body>
</html>
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for card in CARDS:
        (OUT / f"{card['slug']}.html").write_text(html(card), encoding="utf-8")
    print(f"wrote {len(CARDS)} html files to {OUT}")


if __name__ == "__main__":
    main()
