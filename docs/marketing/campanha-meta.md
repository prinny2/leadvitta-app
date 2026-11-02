# Campanha Meta Ads — teste Belém (Tráfego → LP) · criativos por seção da LP

Objetivo: vender o **plano Start (R$97/mês)**, com a porta de entrada
**5 respostas grátis, sem cartão**. Um criativo por seção da landing
(`app/(marketing)/page.tsx`), cada um em dois formatos:

- `public/ads/NN-slug-1080.png` — feed (1080×1080)
- `public/ads/NN-slug-1920.png` — Stories/Reels (1080×1920, texto dentro da área segura central ~1080×1420)

Gerados por `scripts/ads/render-ads.mjs` (HTML/CSS em `scripts/ads/`, fontes
Inter + Fraunces de `app/fonts/`). Para regenerar:

```bash
node scripts/ads/render-ads.mjs            # todos
node scripts/ads/render-ads.mjs demo       # só um (por slug)
# Se o Playwright não estiver no projeto:
PLAYWRIGHT_MODULE=/caminho/para/node_modules/playwright node scripts/ads/render-ads.mjs
```

Complementa o plano anterior (`docs/marketing/campanha-meta-belem.md`, focado em
Click-to-WhatsApp). Este aqui é o teste barato de **Tráfego para a LP**.

---

## 1. Configuração da campanha

| Item | Valor |
|---|---|
| Objetivo | **Tráfego** → otimização para **visualizações da página de destino** |
| Orçamento | **R$20/dia por 5 dias = R$100** (orçamento da campanha, CBO) |
| Localização | **Belém-PA + 15 km** (pessoas que moram ou estão no local) |
| Idade | **25–55** |
| Gênero | Todos |
| Idioma | Português (Brasil) |
| Interesses (detalhado) | estética, clínica de estética, biomedicina estética, harmonização facial, dermatologia, esteticista |
| Posicionamentos | Advantage+ (feed usa o 1080, Stories/Reels usa o 1920 — subir os dois no mesmo anúncio) |
| URL do site | `https://www.leadbellus.com.br/?utm_source=meta&utm_medium=paid&utm_campaign=teste_belem&utm_content=<slug>` |
| Botão (padrão) | **Saiba mais** (ou **Cadastre-se**, ver por criativo) |

`<slug>` = o slug do criativo (`hero`, `como-funciona`, `piloto`, `para-quem`,
`demo`, `precos`, `faq`). Assim o GA4 separa o resultado de cada peça.

**Leitura em 5 dias (R$100):** é um teste de sinal, não de escala. Comparar por
criativo: CTR do link, custo por visualização da LP e — no GA4 — `cta_click` e
contas criadas por `utm_content`. Pausar quem estiver com custo por LPV > 2× a
média depois de ~R$15 gastos.

---

## 2. Textos por criativo

Limites: texto principal ≤ 125 caracteres, título ≤ 40 caracteres.
Regras de compliance em todos: sem promessa de resultado, sem preço de
procedimento (só o R$97 do plano), sem alegação médica, e nunca dizer que o
LeadBellus envia sozinho ou se conecta ao WhatsApp (exceto o criativo do piloto,
sempre como "em preparação / lista de espera").

### 01 · hero — "Responda enquanto ela ainda está quente"
- Arquivos: `public/ads/01-hero-1080.png`, `public/ads/01-hero-1920.png`
- **Texto principal:** A cliente perguntou o preço e você estava atendendo? Tenha 3 respostas prontas no tom da sua clínica.
- **Título:** Responda enquanto ela está quente
- **Descrição:** 5 respostas grátis, sem cartão.
- **Botão:** Saiba mais
- `utm_content=hero`

### 02 · como-funciona — "Cole a mensagem. Receba 3 respostas."
- Arquivos: `public/ads/02-como-funciona-1080.png`, `public/ads/02-como-funciona-1920.png`
- **Texto principal:** Cole a mensagem da cliente, receba 3 respostas no tom da clínica e sua equipe revisa e envia. Simples assim.
- **Título:** Cole. Escolha. Envie.
- **Descrição:** Teste grátis, sem cartão.
- **Botão:** Cadastre-se
- `utm_content=como-funciona`

### 03 · piloto — "Piloto em preparação. Entre na lista."
- Arquivos: `public/ads/03-piloto-1080.png`, `public/ads/03-piloto-1920.png`
- **Texto principal:** Estamos preparando um piloto com o WhatsApp da clínica. Entre na lista de espera e teste grátis a versão atual.
- **Título:** Piloto: entre na lista de espera
- **Descrição:** Hoje: 5 respostas grátis, sem cartão.
- **Botão:** Saiba mais
- `utm_content=piloto`
- Atenção: não prometer data nem que a conexão existe. A LP tem o formulário na seção `#piloto`.

### 04 · para-quem — "Feito para clínicas de estética"
- Arquivos: `public/ads/04-para-quem-1080.png`, `public/ads/04-para-quem-1920.png`
- **Texto principal:** Harmonização, biomedicina estética, injetáveis, corporal: respostas de WhatsApp que entendem cada procedimento.
- **Título:** Feito para clínicas de estética
- **Descrição:** Start R$97/mês · 5 respostas grátis.
- **Botão:** Saiba mais
- `utm_content=para-quem`

### 05 · demo — "Uma pergunta. Três respostas."
- Arquivos: `public/ads/05-demo-1080.png`, `public/ads/05-demo-1920.png`
- **Texto principal:** "Quanto custa o botox?" Veja 3 jeitos de responder: Suave, Consultiva e Fechamento. Você escolhe e envia.
- **Título:** Veja a demo grátis no site
- **Descrição:** Sem cartão para testar.
- **Botão:** Saiba mais
- `utm_content=demo`

### 06 · precos — "Sua secretária de WhatsApp por R$97/mês"
- Arquivos: `public/ads/06-precos-1080.png`, `public/ads/06-precos-1920.png`
- **Texto principal:** Sua secretária de WhatsApp por R$97/mês. Comece com 5 respostas grátis, sem cartão. Cancele quando quiser.
- **Título:** 5 respostas grátis, sem cartão
- **Descrição:** Plano Start R$97/mês. Cancele quando quiser.
- **Botão:** Cadastre-se
- `utm_content=precos`

### 07 · faq — "Ela não envia sozinha"
- Arquivos: `public/ads/07-faq-1080.png`, `public/ads/07-faq-1920.png`
- **Texto principal:** Medo de mensagem automática? A LeadBellus só escreve. Sua equipe revisa, ajusta e decide o que enviar.
- **Título:** Ela escreve. Sua equipe decide.
- **Descrição:** Teste grátis, sem cartão.
- **Botão:** Saiba mais
- `utm_content=faq`

---

## 3. Quais 3 rodar primeiro

Com R$100 em 5 dias, rodar **só 3 anúncios** no mesmo conjunto (mais que isso
pulveriza o orçamento e ninguém sai da fase de aprendizado):

1. **05 · demo** — mostra o produto funcionando com a pergunta mais comum do
   segmento ("quanto custa o botox?"). É o criativo que mais "explica sem
   explicar" e combina com a demo interativa da LP.
2. **01 · hero** — dor imediata (cliente esfriando no WhatsApp) + prova visual
   da resposta pronta. Melhor ângulo de topo de funil.
3. **06 · precos** — oferta explícita (R$97, 5 grátis, sem cartão). Atrai quem
   já está pronto para testar e qualifica pelo preço.

Reserva para a 2ª rodada: **07 · faq** (objeção "vai mandar sozinho?") como
remarketing para quem visitou a LP, e **02 · como-funciona** se o hero cansar.
**03 · piloto** só quando houver capacidade de atender a lista de espera.
