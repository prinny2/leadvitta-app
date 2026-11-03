# Reels de demonstração — LeadBellus

Sete vídeos verticais (1080x1920, H.264, 30 fps, com faixa AAC em silêncio)
para Instagram Reels, Facebook e anúncios. Todos abrem com um gancho na tela
nos primeiros 1,5 s e terminam no mesmo cartão final: **LeadBellus · assistente de escrita
para o WhatsApp da clínica de estética · 5 respostas grátis, sem cartão ·
leadbellus.com.br**. Nos R5–R7, feitos para o perfil, a última linha vira
**Link na bio · leadbellus.com.br**.

| Reel | Arquivo | Duração | Capa |
|---|---|---|---|
| R1 · O preço da demora | `public/reels/r1-preco-da-demora.mp4` | 24,5 s | `r1-preco-da-demora-capa.png` |
| R2 · Resposta fraca × resposta do LeadBellus | `public/reels/r2-resposta-fraca.mp4` | 19,5 s | `r2-resposta-fraca-capa.png` |
| R3 · Ela sumiu depois do orçamento | `public/reels/r3-sumiu-orcamento.mp4` | 22 s | `r3-sumiu-orcamento-capa.png` |
| R4 · Tour do produto (site ao vivo) | `public/reels/r4-tour.mp4` | 23,6 s | `r4-tour-capa.png` |
| R5 · Você está na cadeira | `public/reels/r5-na-cadeira.mp4` | 21,6 s | `r5-na-cadeira-capa.png` |
| R6 · Tenho medo de ficar artificial | `public/reels/r6-medo-artificial.mp4` | 22,4 s | `r6-medo-artificial-capa.png` |
| R7 · Perguntou o preço e sumiu | `public/reels/r7-sumiu-retomada.mp4` | 21 s | `r7-sumiu-retomada-capa.png` |

R5–R7 são os Reels do perfil (nicho injetáveis: toxina, preenchimento,
harmonização), animados no mesmo padrão dos R1–R3. Ordem sugerida no perfil:
R5 → R6 → R7, um por semana, com o carrossel "Como funciona" entre eles.

**Fonte única:** este arquivo é a fonte das legendas, roteiros e horários de
todos os Reels. Ao mudar um vídeo em `scripts/reels/reels.mjs`, atualize a
seção dele aqui.

**Áudio:** cada vídeo leva uma faixa AAC em silêncio (a API de publicação de
Reels recusa vídeo sem faixa de áudio). Escolha um áudio em alta direto no app
(Instagram/Facebook) na hora de postar. As legendas já estão gravadas no vídeo,
então funcionam sem som.

**Regenerar:** `node scripts/reels/render-reels.mjs` (ou `... r1 r4` para só
alguns). Roteiros em `scripts/reels/reels.mjs`; precisa de Playwright +
Chromium e ffmpeg (veja o cabeçalho de `scripts/reels/render-reels.mjs`). O R4
grava o site ao vivo — regrave depois de mudanças na landing. O render sai
sem áudio; depois dele, adicione a faixa em silêncio a cada `.mp4` regravado:

```bash
ffmpeg -i in.mp4 -f lavfi -i anullsrc=r=48000:cl=stereo \
  -c:v copy -c:a aac -b:a 64k -shortest -movflags +faststart out.mp4
# depois substitua in.mp4 por out.mp4
```

## Regras de conteúdo (valem para legenda e vídeo)

- Sem promessa de resultado, sem estatística ou porcentagem inventada, sem
  alegação médica.
- Nenhum preço real de procedimento como se fosse o preço da clínica. A conta
  do R1 (R$ 1.200 × 3 = R$ 3.600/semana) é **exemplo hipotético** e aparece
  marcada assim no vídeo — mantenha "exemplo" também na legenda.
- O LeadBellus **prepara** as respostas; a equipe revisa e envia. Nunca dizer
  que ele envia sozinho, que agenda ou que se conecta ao WhatsApp.
- Nunca chamar o produto de "secretária": é o LeadBellus, o assistente de
  escrita.
- Os nomes de situação na tela batem com o app (`data/situacoes.ts`):
  "Perguntou o preço", "Tem medo do procedimento", "Sumiu / não respondeu".

---

## R1 · O preço da demora

- **Texto do primeiro quadro:** "O preço da demora — Quanto custa a sua demora?"
  sobre a conversa com "Oi! Quanto custa o botox?" às 21:14.
- **Roteiro:** pergunta às 21:14 → relógio avança até 09:02 → a clínica responde
  → "já agendei em outro lugar" → conta de **exemplo** → cole a mensagem → 3
  respostas em segundos → sua equipe revisa e envia → cartão final.
- **Áudio sugerido:** tensão que vira alívio — batida de suspense/tique-taque
  no começo e virada mais leve no "3 respostas em segundos".
- **Melhor horário:** terça a quinta, 12h–13h ou 20h–21h (quem gerencia a
  clínica olha o celular no almoço e depois do expediente).

**Legenda:**

> A cliente perguntou às 21:14. A clínica respondeu às 09:02. Ela já tinha
> agendado em outro lugar. 😶
>
> Faça a conta com o seu ticket. No vídeo usamos só um exemplo: R$ 1.200 × 3
> clientes por semana. Qual seria o número da sua clínica?
>
> O LeadBellus é o assistente de escrita para o WhatsApp da clínica de
> estética: você cola a mensagem da cliente, recebe 3 respostas no tom da
> clínica em segundos, e a sua equipe revisa e envia.
>
> 5 respostas grátis, sem cartão → leadbellus.com.br
>
> Quanto tempo a sua clínica leva para responder hoje? 👇
>
> #clinicadeestetica #esteticafacial #harmonizacaofacial #biomedicinaestetica
> #esteticista #gestaodeclinicas #atendimentowhatsapp #marketingparaestetica

## R2 · Resposta fraca × resposta do LeadBellus

- **Texto do primeiro quadro:** "Ela disse 'tá caro' — E a clínica respondeu
  isso:" com a mensagem "Tá caro…" na tela.
- **Roteiro:** "Tá caro…" → "É o valor, amiga." → "Ok, vou pensar." → visualizou
  e sumiu → mesma mensagem com a resposta Consultiva do LeadBellus → a cliente
  pergunta como funciona a avaliação → cartão final.
- **Áudio sugerido:** trend de "antes × depois" — virada marcada exatamente na
  troca para a resposta do LeadBellus (≈ 7 s).
- **Melhor horário:** segunda a quarta, 19h–21h.

**Legenda:**

> "Tá caro." Duas respostas, duas conversas diferentes. 👀
>
> ❌ "É o valor, amiga." → "Ok, vou pensar." (e sumiu)
> ✅ Consultiva: acolhe, explica o que está incluso e as formas de pagamento —
> e a conversa continua.
>
> O LeadBellus sugere 3 respostas (Suave, Consultiva e Fechamento) no tom da sua
> clínica. Quem escolhe, ajusta e envia é a sua equipe.
>
> Teste com 5 respostas grátis, sem cartão: leadbellus.com.br
>
> Como a sua equipe responde quando a cliente diz "tá caro"?
>
> #clinicadeestetica #objecoesdevenda #atendimentoaocliente #esteticafacial
> #harmonizacaofacial #biomedicinaestetica #atendimentonaestetica #whatsappbusiness

## R3 · Ela sumiu depois do orçamento

- **Texto do primeiro quadro:** "Acontece todo dia — Ela sumiu depois do
  orçamento?" com o orçamento visualizado e sem resposta.
- **Roteiro:** orçamento enviado → visualizado → 1 dia, 3 dias → conversa parada
  → follow-up gerado pelo LeadBellus: D+1 (leve), D+3 (tira-dúvidas), D+7
  (porta aberta) → "você revisa e envia" → "Quantas conversas paradas você tem
  hoje?" → cartão final.
- **Áudio sugerido:** algo calmo e "organizado" (lo-fi, piano leve) — o tom é de
  retomar sem pressionar.
- **Melhor horário:** segunda-feira, 8h–9h ou 12h (começo de semana, hora de
  revisar conversas paradas).

**Legenda:**

> Mandou o orçamento, ela visualizou… e silêncio. 🤐
>
> Retomar sem parecer insistente:
> D+1 → retome com leveza
> D+3 → ofereça tirar uma dúvida
> D+7 → deixe a porta aberta
>
> O LeadBellus prepara cada follow-up no tom da sua clínica. Sua equipe revisa e
> envia quando fizer sentido.
>
> Quantas conversas paradas você tem hoje? Comenta aqui 👇
> 5 respostas grátis, sem cartão: leadbellus.com.br
>
> #clinicadeestetica #followup #gestaodeclinicas #esteticista
> #harmonizacaofacial #biomedicinaestetica #atendimentowhatsapp #vendasnaestetica

## R4 · Tour do produto

- **Texto do primeiro quadro:** "Tour rápido — Responda antes dela desistir."
  sobre o topo do site.
- **Roteiro (site ao vivo, celular):** segue o caminho do CTA principal do
  hero. Topo do site → botão **"Colar mensagem e ver 3 respostas grátis"**
  (contornado em dourado: "Toque em 'Colar mensagem'") → corte seco para o
  simulador da demo (#demo), como o salto do botão → campo "Situação" →
  "Mensagem da cliente" e prévia do WhatsApp com as 3 abas (legenda "3 abas:
  Suave, Explica e Fechamento · você revisa e envia") → plano Start R$ 97/mês
  → 5 respostas grátis, sem cartão → cartão final. Os rótulos das abas são os
  da demo da landing (`components/landing-whatsapp-demo.tsx`: Suave / Explica /
  Fechamento); no app, a do meio se chama Consultiva. Só rolagem e o
  contorno: nada é clicado, enviado ou logado.
- **Áudio sugerido:** trend instrumental animado/"tutorial", batidas nos cortes
  de legenda (≈ a cada 2,5–3 s).
- **Melhor horário:** quinta ou sexta, 18h–20h; também bom como anúncio de
  remarketing para quem visitou o site.

**Legenda:**

> Um tour rápido pelo LeadBellus 👇
>
> 1. No site, toque em "Colar mensagem e ver 3 respostas grátis"
> 2. Escolha a situação e cole a mensagem da cliente
> 3. Veja 3 sugestões no tom da sua clínica (Suave, Explica e Fechamento): sua
>    equipe revisa e envia pelo WhatsApp
>
> Dá para testar ali mesmo, sem criar conta. Plano Start R$ 97/mês, depois de
> 5 respostas grátis — sem cartão para testar.
> leadbellus.com.br (link na bio)
>
> Qual situação do WhatsApp você quer testar primeiro: preço, "tá caro" ou
> cliente que sumiu?
>
> #clinicadeestetica #softwareparaclinicas #gestaodeclinicas #esteticafacial
> #harmonizacaofacial #biomedicinaestetica #atendimentowhatsapp #inteligenciaartificial

---

## R5–R7 · Reels do perfil (nicho injetáveis)

Mesma estrutura nos três: **gancho (dor) → no app: cola a mensagem → escolhe a
situação com o nome real do app → "Gerar 3 respostas" → Suave / Consultiva /
Fechamento → a equipe copia, revisa e envia no WhatsApp → cartão final com
"5 respostas grátis, sem cartão · Link na bio"**. As respostas na tela
acolhem, não citam preço de procedimento e não prometem resultado.

Antes de postar, gere a mesma mensagem no app e confira se o tom bate com o do
vídeo (o vídeo mostra o tom esperado, não um print do app). Na legenda, o link
é o da bio (`https://www.leadbellus.com.br/?utm_source=instagram&utm_medium=bio&utm_campaign=perfil`);
nos Stories, use `utm_medium=stories` e `utm_content=r5` / `r6` / `r7`.

## R5 · Você está na cadeira

- **Capa:** `public/reels/r5-na-cadeira-capa.png` — "Ela perguntou o preço · E
  você estava aplicando." sobre o cartão "Em procedimento" e a mensagem
  "Oi! Quanto custa o botox?" às 14:06. Use também como capa da grade.
- **Roteiro (21,6 s):**

| Tempo | Na tela | Legenda queimada |
|---|---|---|
| 0–2,6 s | Cartão "Em procedimento · toxina · sala 1" + mensagem chegando às 14:06 | Ela perguntou o preço / E você estava aplicando. |
| 2,6–4,6 s | "1 mensagem não lida" | Sem como pegar o celular. |
| 4,6–6,4 s | Relógio do procedimento vai de 14:06 a 14:46 | 40 minutos depois… |
| 6,4–8,2 s | "Já vi em outra clínica, obrigada!" + selo "Ela esfriou" | …ela já perguntou em outra clínica. |
| 8,2–10 s | App: cola "Oi! Quanto custa o botox?" | Cole a mensagem. |
| 10–12,2 s | Situação **Perguntou o preço** → Gerar 3 respostas | Escolha: Perguntou o preço |
| 12,2–14,8 s | Suave / Consultiva / Fechamento; a equipe escolhe a Consultiva | 3 respostas no tom da clínica. |
| 14,8–18,4 s | Chip "☕ Intervalo · 14:08" → "Consultiva copiada" → enviada às 14:09 → cliente responde às 14:11 | Revise, copie e envie. / Na pausa entre clientes. |
| 18,4–21,6 s | Cartão final | 5 respostas grátis, sem cartão · Link na bio |

- **Respostas na tela:** Suave "Oi! Que bom que você chamou 😊 O valor depende
  da avaliação. Posso te explicar como funciona?" · Consultiva "Cada rosto pede
  uma quantidade diferente, então o valor sai na avaliação. O que você quer
  suavizar?" · Fechamento "Tenho horários de avaliação esta semana. Prefere
  manhã ou tarde?"
- **Áudio sugerido:** tique-taque/tensão leve até o "40 minutos depois" e virada
  mais leve quando o app aparece (≈ 8 s).
- **Melhor horário:** terça a quinta, 12h–13h (intervalo entre atendimentos —
  exatamente a cena do vídeo).

**Legenda:**

> Quem aplica e responde o WhatsApp ao mesmo tempo conhece essa cena: a cliente
> pergunta o preço bem na hora do procedimento. Quando você consegue pegar o
> celular, ela já esfriou. 💉⏳
>
> Com o LeadBellus, na pausa entre uma cliente e outra: cola a mensagem,
> escolhe "Perguntou o preço" e recebe 3 respostas no tom da sua clínica —
> Suave, Consultiva e Fechamento. Você revisa, ajusta se quiser e envia. Ele
> não manda nada sozinho.
>
> Teste com uma mensagem real: 5 respostas grátis, sem cartão. Link na bio.
>
> Quanto tempo uma mensagem fica sem resposta aí enquanto você atende? 👇
>
> #harmonizacaofacial #toxinabotulinica #botox #preenchimentolabial
> #clinicadeestetica #biomedicinaestetica #injetaveis #esteticafacial
> #atendimentowhatsapp

## R6 · Tenho medo de ficar artificial

- **Capa:** `public/reels/r6-medo-artificial-capa.png` — "O que você responde?
  · 'Tenho medo de ficar artificial.'" sobre a mensagem da cliente.
- **Roteiro (22,4 s):**

| Tempo | Na tela | Legenda queimada |
|---|---|---|
| 0–2,8 s | "Oi! Tenho medo de ficar artificial 😬" | O que você responde? / "Tenho medo de ficar artificial." |
| 2,8–5,6 s | Rascunho sendo digitado: "kkk relaxa, fica super natural, garanto!" | A resposta que assusta mais: |
| 5,6–8,6 s | O rascunho é riscado + "✕ Promete resultado · não envie" | Prometer resultado é problema. |
| 8,6–10,4 s | App: cola a mesma mensagem, com o 😬 | Cole a mensagem. |
| 10,4–12,6 s | Situação **Tem medo do procedimento** → Gerar 3 respostas | Escolha: Tem medo do procedimento |
| 12,6–15,4 s | Suave / Consultiva / Fechamento; a equipe escolhe a Consultiva | 3 respostas que acolhem o medo. |
| 15,4–19,2 s | "Consultiva copiada" → enviada exatamente como a Consultiva → "Como marco a avaliação?" | Ela leva para a avaliação. / Sem promessa. Você revisa e envia. |
| 19,2–22,4 s | Cartão final | 5 respostas grátis, sem cartão · Link na bio |

- **Respostas na tela:** Suave "Faz todo sentido ter esse receio 💛 Aqui a
  gente vai com calma e tira todas as suas dúvidas antes." · Consultiva
  "Começamos pela avaliação: olho seus traços, entendo o que te incomoda e
  decidimos juntas se e como fazer." · Fechamento "Quer marcar uma avaliação
  para conversarmos com calma, sem compromisso? Tenho horários esta semana."
- **Áudio sugerido:** algo calmo e acolhedor (piano/lo-fi); um "erro"/scratch
  no momento em que o rascunho é riscado (≈ 5,8 s).
- **Melhor horário:** segunda a quarta, 19h–21h (quando a cliente indecisa
  também está no celular — bom para compartilhamento entre profissionais).

**Legenda:**

> "Tenho medo de ficar artificial" é uma objeção comum antes de toxina e
> preenchimento. Responder "relaxa, fica natural, garanto" é prometer
> resultado — e a cliente sente.
>
> No LeadBellus você escolhe "Tem medo do procedimento" e recebe 3 respostas
> que acolhem o medo e levam para a avaliação: sem promessa, sem preço fixo,
> sem diagnóstico. Sua equipe revisa e envia.
>
> Cole a mensagem real da sua cliente: 5 respostas grátis, sem cartão. Link na
> bio.
>
> Como você responde hoje quando a cliente fala de medo? 👇
>
> #harmonizacaofacial #toxinabotulinica #preenchimento #preenchimentolabial
> #clinicadeestetica #biomedicinaestetica #injetaveis #esteticafacial
> #atendimentoaocliente

## R7 · Perguntou o preço e sumiu

- **Capa:** `public/reels/r7-sumiu-retomada-capa.png` — "Perguntou o preço e
  sumiu · Quantas estão paradas aí?" sobre a lista de conversas (nomes
  borrados).
- **Roteiro (21 s):**

| Tempo | Na tela | Legenda queimada |
|---|---|---|
| 0–2,8 s | Lista de conversas: a clínica respondeu, a cliente visualizou (nomes borrados) | Perguntou o preço e sumiu / Quantas estão paradas aí? |
| 2,8–5 s | "Visualizadas · sem resposta" | Pediu o valor. Visualizou. Sumiu. |
| 5–7,4 s | Uma conversa em destaque | E você não sabe o que mandar. |
| 7,4–9,2 s | App: cola "Oi! Quanto fica o preenchimento labial?" | Cole a mensagem dela. |
| 9,2–11,4 s | Situação **Sumiu / não respondeu** → Gerar 3 respostas | Escolha: Sumiu / não respondeu |
| 11,4–14 s | Suave / Consultiva / Fechamento; a equipe escolhe a Suave | 3 jeitos leves de retomar. |
| 14–17,8 s | Pergunta dela (seg · 10:12) → resposta da clínica "O valor depende da avaliação 😊 Posso te explicar como funciona?" (seg · 10:15, ✓✓ azul) → "3 dias depois" → "Suave copiada" → enviada às 09:30 → a cliente volta a perguntar | Sem cobrança. Sem culpa. / Com um próximo passo. |
| 17,8–21 s | Cartão final | 5 respostas grátis, sem cartão · Link na bio |

- **Respostas na tela:** Suave "Oi, Ana! Passando só pra saber se ficou alguma
  dúvida sobre o preenchimento 😊 Estou por aqui." · Consultiva "Ana, quer que
  eu te explique como funciona a avaliação? Assim você decide com calma, no seu
  tempo." · Fechamento "Tenho horários de avaliação esta semana. Quer que eu
  veja um que encaixe na sua rotina?"
- **Diferença para o R3:** o R3 mostra a sequência de follow-up (D+1, D+3,
  D+7); o R7 mostra o gerador com a situação "Sumiu / não respondeu" e as 3
  variações para a primeira retomada.
- **Áudio sugerido:** trend leve/"organizando a vida", batida no corte para o
  app (≈ 7,4 s).
- **Melhor horário:** segunda-feira, 8h–9h ou 12h (começo de semana, hora de
  revisar conversas paradas).

**Legenda:**

> Toda clínica tem uma lista de "pediu o valor e sumiu". Muitas vezes a
> segunda mensagem nunca sai, porque ninguém sabe o que mandar sem parecer
> insistente. 🙈
>
> No LeadBellus você cola a mensagem dela, escolhe "Sumiu / não respondeu" e
> recebe 3 retomadas leves no tom da sua clínica: sem cobrança, sem culpa, com
> um próximo passo. Você copia, revisa e envia quando quiser.
>
> Teste hoje com uma conversa parada: 5 respostas grátis, sem cartão. Link na
> bio.
>
> Quantas conversas paradas você tem hoje? Comenta aqui 👇
>
> #clinicadeestetica #harmonizacaofacial #toxinabotulinica #preenchimentolabial
> #biomedicinaestetica #injetaveis #atendimentoaocliente #gestaodeclinicas
> #followup
