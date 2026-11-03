# Ideias de produto — avaliação contra o código (03/11/2026)

Base: `leadbellus-ideias.md` (8 ideias). Regra que vale para todas: a equipe
revisa e envia; nada sai sozinho.

| # | Ideia | O que já existe | Esforço | Decisão |
|---|---|---|---|---|
| 1 | Retorno por procedimento | Só o gatilho genérico "Fez procedimento e não voltou" em `/follow-up` | 1–2 dias | **Fazendo agora** (branch `feat/retornos`) |
| 2 | Retomada com contexto | `/follow-up` já tem "sumiu 1h/1d/3d/7d", "orçou e não fechou" e campo de contexto livre | ½ dia | Próximo: botão "Gerar retomada" no Histórico, já preenchendo a mensagem original |
| 3 | Biblioteca de objeções da clínica | `/objecoes` usa uma lista genérica (`data/objecoes.ts`) | 1–2 dias | Depois do 1: objeções e resposta-base no doc da clínica, entram no prompt |
| 4 | Modo "estou na cadeira" | A caixa de entrada (`/conversas`) existe, mas depende do WhatsApp integrado (Z-API cancelada) | — | **Parar** até ligar a Cloud API. Sem mensagens chegando sozinhas, a fila não tem o que mostrar. Continua como ângulo de anúncio |
| 5 | Follow-up de avaliação | "Orçou e não fechou" é parecido, mas não tem 48h/7d | 1 h | **Fazendo agora** (2 gatilhos novos na mesma branch) |
| 6 | Relatório semanal de conversas perdidas | Nada | — | **Parar.** Sem WhatsApp integrado não dá para saber quem ficou 2 h sem resposta. Versão possível depois: e-mail semanal (Resend já está ligado) com retornos e retomadas pendentes |
| 7 | Onboarding personalizado | Nada (é serviço) | 0 código | **Vender já, à mão**: configurar tom, protocolos e objeções numa call. Cobrar o setup por link de pagamento do Stripe |
| 8 | Foto de evolução com consentimento | Nada | junto com o 1 | Entra no retorno de 30 dias da harmonização. O texto pede a foto **só para acompanhar**. Usar em divulgação exige termo escrito (CFBM 330/2020 e CFO 196/2019), não um "pode?" no WhatsApp |

## MVP do retorno por procedimento (em construção)

- Cadastro: primeiro nome ou apelido da cliente, procedimento e data. Sem
  telefone. Nome + procedimento estético conta como **dado de saúde** na LGPD
  (art. 11), então a tela orienta a não pôr mais nada.
- Protocolo padrão editável por clínica:
  - Toxina: dia 14
  - Preenchimento: dias 7 e 21
  - Harmonização: dia 30, com foto
  - Bioestimulador: dia 45
  - Skinbooster: dia 30
- Tela "Retornos": Atrasados · Hoje · Próximos 7 dias → "Gerar 3 mensagens"
  (usa `/api/follow-up`) → copiar → "Marcar como enviado".
- Dados em `retornos/{id}`, com o mesmo isolamento por dono do `historico`.

**Atenção para ir para produção:** as regras do Firestore **não sobem no
deploy da VPS**. Depois do merge, rodar uma vez (precisa do seu login no
Firebase):

```bash
npx firebase-tools login
```
```bash
npx firebase-tools deploy --only firestore:rules --project leadvitta-app
```

Sem isso, a tela abre mas não salva no modo real (o modo demo funciona).

## Ordem

1. Agora, antes do anúncio: MVP 1 + 5 + correções da landing (`docs/marketing/revisao-lp.md`).
2. Vender a ideia 7 para as primeiras clínicas que testarem.
3. Depois: ideias 3 e 2.
4. Só com WhatsApp integrado: ideias 4 e 6.
