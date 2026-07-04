# Campanha Meta Ads + Orgânico + Prospecção — Belém (julho/2026)

Plano operacional de aquisição do LeadBellus para o piloto regional em Belém-PA.
Produto: Start R$97/mês, teste grátis sem cartão. LP: https://www.leadbellus.com.br

---

## 1. Escolha de canal (análise)

A LP vende um fluxo "colou a mensagem → 3 respostas prontas pro WhatsApp".
O comprador (dona/dono de clínica de estética, esteticista, biomédica) vive no
**Instagram** e fecha negócio no **WhatsApp**. Isso define o ranking:

| Canal | Papel | Por quê |
|---|---|---|
| **Meta Ads — Click-to-WhatsApp (CTWA)** | **Canal principal** | Não depende de Pixel (ainda sem `NEXT_PUBLIC_META_PIXEL_ID` em produção); otimiza por conversa iniciada; a venda acontece no mesmo canal que o produto resolve — dá pra **demonstrar ao vivo** gerando 3 respostas na hora. |
| Meta Ads — Tráfego/Conversão → LP | Secundário (ativar após Pixel) | A LP tem demo grátis e trial sem cartão; com Pixel + evento `Lead` vira máquina de conversão mensurável. |
| Orgânico IG/FB | Sustentação | Prova social + remarketing barato (envolvimento com perfil). Automatizado pelo cron (`data/social-posts.ts`). |
| Canal do WhatsApp | Nutrição | Broadcast para quem já segue; custo zero. |
| Prospecção 1:1 Belém | Outbound cirúrgico | Belém tem mercado de estética denso e pouco disputado por SaaS; contato direto tem taxa de resposta alta. |

**Decisão:** começar com **CTWA geolocalizada em Belém** + prospecção 1:1 +
orgânico automatizado. Ligar a campanha de conversão pra LP na semana 2, depois
de configurar o Pixel (var já suportada no código — só falta o ID na Vercel).

### Pré-requisitos antes de ligar a campanha
1. Criar/confirmar o **Pixel da Meta** e setar `NEXT_PUBLIC_META_PIXEL_ID` na
   Vercel (**rebuild obrigatório** — var de build). O código já dispara
   `PageView`, `Contact` (botão WhatsApp) e `cta_click`.
2. Conectar o WhatsApp comercial à Página do Facebook (exigência do CTWA).
3. Setar `NEXT_PUBLIC_WHATSAPP_NUMBER` na Vercel pro botão flutuante da LP.
4. Conectar a conta Meta Ads no Windsor (link na thread) para gestão/relatórios.

---

## 2. Campanha 1 — CTWA "Belém Piloto" (principal)

- **Objetivo:** Engajamento → Conversas via WhatsApp
- **Orçamento:** R$40/dia (CBO). Piso de teste: R$30/dia por 7 dias antes de julgar.
- **Geo:** Belém-PA + raio 40 km (pega Ananindeua, Marituba, Benevides, Santa Bárbara).
- **Idade/gênero:** 22–50, todos (a criativa qualifica; estética em Belém é ~80% público feminino profissional).
- **Posicionamentos:** Advantage+ (deixa a Meta distribuir; Reels/Stories dominam).

### Conjuntos (2, para teste de público)
1. **Interesses estética:** Estética facial, Clínica de estética, Harmonização
   facial, Botox, Micropigmentação, Design de sobrancelhas, Depilação a laser,
   Biomedicina + comportamento "Administradores de página de empresa".
2. **Aberto qualificado pela criativa:** sem interesses (broad), mesma geo.
   Frequentemente ganha do detalhado em cidade média — deixar a copy filtrar.

### Anúncios (3 criativos × mesma oferta)
- **Criativo A — vídeo 15s (Reels):** tela do produto: mensagem "quanto custa o
  botox? 😬" colada → 3 respostas aparecem → copiar → colar no WhatsApp.
  Texto na tela: "Sua clínica respondendo em 30 segundos".
- **Criativo B — print de conversa** (mesma estética do ChatProof da LP):
  pergunta de preço + resposta pronta + selos Suave/Consultiva/Fechamento.
- **Criativo C — carrossel 4 cards:** "As 3 mensagens que fazem sua clínica
  perder venda" → preço seco / "achou caro" / cliente sumiu → card final CTA.

### Copies (primárias)
**Copy 1 (dor direta):**
> Cliente pergunta "quanto custa?" no WhatsApp da sua clínica e a conversa
> morre aí? 😬 O LeadBellus escreve 3 respostas prontas — no tom da SUA
> clínica — pra você colar e fechar a avaliação. Feito pra estética, dentro
> das regras (sem prometer milagre). Chama no WhatsApp e veja com uma mensagem
> REAL da sua clínica. 👇

**Copy 2 (prova/demo):**
> Me manda uma mensagem que você recebeu essa semana na sua clínica de
> estética. Eu te devolvo 3 respostas prontas em 30 segundos — uma suave, uma
> consultiva e uma de fechamento. Se gostar, teste grátis, sem cartão. R$97/mês
> só se fizer sentido. 💬

**Copy 3 (regional):**
> Clínicas de estética de Belém: quantas clientes perguntaram preço essa semana
> e sumiram? 👻 Não é falta de talento — é falta da resposta certa na hora
> certa. O LeadBellus responde com você, no seu tom. Teste grátis. 👇

**Mensagem de boas-vindas do CTWA:**
> Oi! 😊 Que bom que chegou. Me conta: qual mensagem de cliente mais te trava
> no WhatsApp — preço, "achou caro" ou cliente que some? Me manda um exemplo
> real que eu te mostro o LeadBellus respondendo na hora.

### Metas da semana 1 (piloto R$280)
- Custo por conversa iniciada ≤ R$12 (Belém tende a ficar bem abaixo).
- ≥ 25 conversas · ≥ 8 demos ao vivo · ≥ 3 trials · 1 assinatura já paga o teste.

## 3. Campanha 2 — Conversão → LP (semana 2, após Pixel)

- Objetivo: Vendas/Conversão, evento **Lead** (`sign_up` já mapeado no código).
- R$30/dia, mesma geo, remarketing: envolvidos com perfil/anúncio 30d + visitantes da LP.
- Criativo: vídeo A + depoimento real assim que existir (a seção `DEPOIMENTOS`
  da LP está pronta para receber).
- UTM padrão: `utm_source=facebook&utm_medium=cpc&utm_campaign=belem_conversao`.

---

## 4. Orgânico (automatizado)

O cron da Vercel (`vercel.json` → `/api/marketing/social-post`, diário 11h
Belém) publica o calendário de `data/social-posts.ts` na Página do Facebook e
no Instagram (quando o post tem arte). 8 posts já agendados para julho
(temas: preço, "achou caro", follow-up, público masculino, compliance, 3
respostas, demo, rotina).

**Operação:** criar as artes (Canva/Express, 1080×1350, paleta navy/dourado da
LP), subir em URL pública e preencher `imagemUrl` + canal `instagram` nos
posts. Sem arte, o post sai só no Facebook (o código já trata).

## 5. Canal do WhatsApp (principal)

2 mensagens/semana, sempre com 1 utilidade + 1 CTA leve:

**Post 1 (lançamento da campanha):**
> 🟢 Dica de hoje: quando a cliente pergunta o preço do botox, NUNCA responda
> só o valor. Responda valor + segurança + convite: "depende da avaliação, o
> resultado é natural quando bem indicado — quer que eu veja um horário essa
> semana?". Quer 3 respostas assim, prontas, pra qualquer mensagem? Teste
> grátis: leadbellus.com.br

**Post 2 (prova):**
> 👻 Cliente sumiu depois do orçamento? Manda essa: "Oi, [nome]! Passando pra
> saber se ficou alguma dúvida sobre a avaliação 😊 Essa semana ainda tenho
> [dia] e [dia] livres — te encaixo?" — follow-up leve, com próximo passo.
> Gerado pelo LeadBellus em 10 segundos.

---

## 6. Prospecção 1:1 — clínicas de Belém

⚠️ **Regras pra não queimar o número:** nada de disparo em massa via Z-API
(risco real de ban + LGPD). Prospecção **manual, personalizada, ≤20/dia**, do
número comercial, sempre citando algo específico da clínica. Parar no primeiro
"não tenho interesse".

**Montagem da lista (meta: 100 clínicas):** Google Maps ("clínica de estética
Belém", Umarizal, Batista Campos, Nazaré, Marco, Pedreira + Ananindeua),
Instagram por hashtag/local (#esteticabelem, #harmonizacaobelem,
#sobrancelhasbelem) — priorizar perfis ativos com WhatsApp no bio.

**Mensagem 1 (abertura, personalizar o [gancho]):**
> Oi, [nome/clínica]! Vi o trabalho de vocês no Instagram — [gancho: ex. "os
> resultados de harmonização são lindos"]. 👏 Trabalho com clínicas de estética
> e criei uma ferramenta que escreve as respostas do WhatsApp de vocês (preço,
> "achou caro", cliente que some) em 30 segundos, no tom da clínica. Posso te
> mostrar com uma mensagem real que vocês receberam essa semana? É rapidinho e
> sem compromisso 😊

**Se responder:** pedir uma mensagem real → devolver as 3 respostas geradas →
"gostou? o teste é grátis, sem cartão — te mando o link". Link com UTM:
`leadbellus.com.br/?utm_source=whatsapp&utm_medium=outbound&utm_campaign=belem_prospeccao`

**Follow-up único (48–72h depois, se não responder):**
> Oi de novo! 😊 Só pra não ficar no vácuo: se fizer sentido, me manda UMA
> mensagem de cliente que travou vocês essa semana que eu devolvo 3 respostas
> prontas, de graça, pra você ver na prática. Se não for o momento, sem
> problema — sucesso aí com a clínica! 🙌

**Cadência sugerida:** 20 contatos/dia útil → 100/semana; esperado 20–30%
resposta, 10 demos, 3–5 trials/semana.

---

## 7. Rotina de acompanhamento

- Diário: responder conversas do CTWA em <1h (velocidade define custo).
- Toda segunda: CPM, custo/conversa, trials por fonte (GA4 + UTMs; Meta Ads via
  Windsor depois de conectar).
- Regra de corte: anúncio com custo/conversa > 2× a média após R$60 gastos → pausa.
