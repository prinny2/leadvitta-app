# Kit social — peças fixas da marca

Peças que o calendário orgânico (`data/social-posts.ts` → `public/social/auto/`)
não cobre: carrossel, card do canal do WhatsApp, capa do Facebook e 2 Stories.
Mesma linguagem visual do feed (navy + dourado + creme, Fraunces + Inter).

Gerador: `scripts/social/render-kit.mjs` (usa `social.css` + `kit.css` e os
helpers de `scripts/social/lib.mjs`). Ele falha se algum texto sair da área
segura ou se um PNG passar de 1 MB.

```bash
PLAYWRIGHT_MODULE=/caminho/para/node_modules/playwright node scripts/social/render-kit.mjs
PLAYWRIGHT_MODULE=... node scripts/social/render-kit.mjs capa-facebook   # só uma peça (por slug)
```

## Peças

| Arquivo (`public/social/kit/`) | Tamanho | Para quê | Onde postar |
|---|---|---|---|
| `carrossel-01-capa.png` … `carrossel-05-cta.png` | 1080×1350 (4:5) | Carrossel “5 mensagens que fazem sua clínica perder cliente no WhatsApp”: a capa lista as 5 respostas fracas; os cards 2–4 mostram cada situação (preço, “vou pensar”, sumiu depois do orçamento) com a resposta fraca e uma melhor; o card 5 é o CTA. | Feed do Instagram (pode compartilhar no Facebook junto). Bom para fixar no perfil. |
| `canal-whatsapp.png` | 1080×1080 | Anuncia o canal do WhatsApp da LeadBellus, com dicas de atendimento para clínicas. | Feed/Stories do Instagram, Página do Facebook, status do WhatsApp. Só publique depois que o canal existir e o link estiver na bio. |
| `capa-facebook.png` | 1640×624 | Capa da Página do Facebook: marca, frase da marca, subtítulo e “Teste grátis”. O conteúdo fica no centro (1200×464), que aparece também no celular. | Página do Facebook → foto de capa. |
| `story-esperou-demais.png` | 1080×1920 | Story “Quanto custa uma cliente que esperou demais?”, que leva ao site. Tem um espaço livre embaixo do “Toque no link” para o sticker de link. | Stories do Instagram/Facebook. |
| `story-enquete.png` | 1080×1920 | Story de enquete “Qual mensagem mais trava seu WhatsApp?”. O quadro tracejado é o lugar do sticker de enquete. | Stories do Instagram. Poste junto com o carrossel (ele responde as três opções). |

Todo o conteúdo fica dentro das áreas seguras: carrossel e card com 80 px de
margem; capa no centro 1200×464; Stories entre y 250 e 1600 (fora da área da
foto de perfil e da caixa de resposta).

## Legenda do carrossel (PT-BR)

```
5 mensagens que fazem sua clínica perder cliente no WhatsApp.

Preço, “vou pensar” e a cliente que sumiu depois do orçamento: são os três momentos em que uma resposta apressada esfria a conversa. Arraste para ver a resposta fraca e uma versão melhor para cada situação.

Salve para usar na próxima conversa e mande para quem cuida do WhatsApp da clínica.

Quer 3 respostas no tom da sua clínica em segundos? O LeadBellus sugere, sua equipe revisa e envia. 5 respostas grátis, sem cartão: link na bio.

#clinicadeestetica #esteticafacial #biomedicinaestetica #harmonizacaofacial #esteticista #esteticaavancada #recepcaodeclinica #gestaodeclinicas #atendimentoaocliente #marketingparaestetica
```

Texto alternativo (Configurações avançadas → Escrever texto alternativo), um por
card: “Card N de 5: <título do card>. Resposta fraca riscada e resposta melhor
para a cliente.”

## Passo a passo

### Capa da Página do Facebook

1. Abra a Página da LeadBellus no Facebook (computador é mais fácil).
2. Clique em **Editar** sobre a capa → **Carregar foto** → escolha `capa-facebook.png`.
3. Não arraste a imagem (ela já está em 1640×624). Clique em **Salvar alterações**.
4. Abra a foto da capa e edite a descrição: `Teste grátis: https://www.leadbellus.com.br`.
5. Confira no app do celular: título, subtítulo e o botão “Teste grátis” devem
   aparecer inteiros (as laterais podem ser cortadas — é esperado).

### Carrossel no Instagram

1. No app: **+** → **Publicação** → toque no ícone de **selecionar vários**.
2. Escolha os 5 arquivos **na ordem**: `carrossel-01-capa` → `02-preco` →
   `03-vou-pensar` → `04-sumiu` → `05-cta`.
3. Toque no ícone de proporção e escolha **4:5** (para não cortar em quadrado).
4. **Avançar** → sem filtro → **Avançar**.
5. Cole a legenda acima. Em **Configurações avançadas**, preencha o texto alternativo.
6. Opcional: ative **Compartilhar no Facebook**.
7. **Compartilhar**. Depois, fixe a publicação no perfil (… → **Fixar no perfil**).
8. No mesmo dia, poste o `story-enquete.png` e, ao fim, compartilhe o carrossel
   nos Stories.

Pelo computador: Meta Business Suite → **Criar publicação** → Instagram (e
Facebook) → **Adicionar foto** com os 5 arquivos na ordem → mesma legenda.

### Stories

- **`story-esperou-demais.png`**: suba o Story → sticker **Link** →
  `https://www.leadbellus.com.br/?utm_source=instagram&utm_medium=story&utm_campaign=kit_social`
  (texto do sticker: “Teste grátis”) → posicione no espaço livre abaixo de
  “Toque no link”.
- **`story-enquete.png`**: suba o Story → sticker **Enquete** → pergunta em
  branco ou “Qual mais trava?” → opções **Preço**, **Vou pensar**, **Sumiu** →
  posicione dentro do quadro tracejado.

### Card do canal do WhatsApp

1. Crie o canal antes (WhatsApp → **Atualizações** → **+** → **Criar canal**,
   nome “LeadBellus”, descrição “Dicas de atendimento no WhatsApp para clínicas
   de estética”) e copie o link do canal.
2. Coloque o link do canal na bio do Instagram (Linktree ou links da bio).
3. Publique `canal-whatsapp.png` no feed/Stories (com sticker de link para o
   canal) e no status do WhatsApp.

## Compliance (vale para qualquer ajuste de texto)

- Sem promessa de resultado, sem preço de procedimento, sem alegação médica e
  sem estatística inventada (os “3 dias” e “3 horas” são cenas ilustrativas).
- Nunca dizer que o LeadBellus envia sozinho ou se conecta ao WhatsApp: ele
  **sugere 3 respostas** e **a equipe revisa e envia**.
- O canal do WhatsApp é o canal de conteúdo da LeadBellus — não uma integração
  do produto.
