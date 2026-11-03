# Revisão de conversão da landing — 03/11/2026 (Codex, só leitura)

> Visitante: dona de clínica de injetáveis vindo de Reels/Stories no celular.

## 1. Cinco maiores bloqueios de conversão

1. **O CTA principal tira a visitante da experiência prometida.** Em [`page.tsx:329–377`](app/(marketing)/page.tsx:329), a promessa fala em colar mensagem e receber três sugestões, mas “Testar grátis” leva a `/onboarding`; “Ver demo” é o caminho secundário. A demo fica mais abaixo na página. **Correção:** faça do CTA principal um link para `#demo` com o texto exato **“Colar mensagem e ver 3 respostas grátis”**; deixe cadastro depois de mostrar o resultado.

2. **O onboarding pede configuração antes de entregar o valor do anúncio.** Em [`onboarding/page.tsx:426–460`](app/(marketing)/onboarding/page.tsx:426), o nome da clínica é obrigatório e cidade e procedimentos aparecem antes da resposta; há ainda escolhas de tom e CTA. Em [`onboarding/page.tsx:628–692`](app/(marketing)/onboarding/page.tsx:628), o exemplo gera uma resposta, não três. Isso quebra a expectativa e aumenta o esforço. **Correção:** primeira tela deve pedir só a mensagem; exiba as três respostas e deixe “Personalizar com o nome e tom da clínica” opcional depois.

3. **A demo mobile exige escolhas demais e põe “Gerar” antes da mensagem.** [`landing-whatsapp-demo.tsx:363–469`](components/landing-whatsapp-demo.tsx:363) exibe vários campos opcionais; em [`landing-whatsapp-demo.tsx:471–510`](components/landing-whatsapp-demo.tsx:471), o botão aparece antes do campo para colar. **Correção:** primeira tela com uma única caixa, texto **“Cole aqui a mensagem da cliente”**, e botão logo abaixo: **“Ver minhas 3 respostas”**. Mova as personalizações para depois.

4. **“Secretária” pode sugerir atendimento humano ou automação.** Aparece em [`page.tsx:449–450, 549–556, 692`](app/(marketing)/page.tsx:449) e no CTA flutuante em [`whatsapp-cta.tsx:12–13`](components/whatsapp-cta.tsx:12). Apesar das ressalvas de envio manual, esse rótulo cria ambiguidade. **Correção:** substituir por **“assistente de escrita”** e explicitar junto ao CTA: **“A ferramenta escreve; sua equipe revisa e envia.”**

5. **Há frases que sugerem resultado ou agendamento.** [`page.tsx:446`](app/(marketing)/page.tsx:446) diz que “a clínica que responde primeiro leva”; [`onboarding/page.tsx:650–651`](app/(marketing)/onboarding/page.tsx:650) prevê a cliente sumindo; o rodapé do onboarding diz “Agende mais” em [`onboarding/page.tsx:845–846`](app/(marketing)/onboarding/page.tsx:845). **Correção:** usar **“Sugestões para responder com mais clareza, no tom da clínica. A equipe decide o próximo passo.”**

## 2. Toques e campos até a primeira resposta

- **CTA principal atual:** depois do clique no anúncio, toque em “Testar grátis” → preencha o nome da clínica → toque em “Quero ver minha resposta”. **2 toques na página + 1 campo obrigatório**; aparece uma resposta, não as três prometidas.
- **Caminho da demo:** toque em “Ver demo” → a página rola até a demo → o exemplo já vem preenchido → toque em “Gerar”. **2 toques na página, zero campos** para o exemplo; para testar a mensagem real, **1 campo de texto**. A resposta aparece após gerar.

## 3. Textos fora do nicho ou desalinhados

- **Corporal e capilar:** [`page.tsx:620, 634–637`](app/(marketing)/page.tsx:620) inclui drenagem, gordura localizada, depilação a laser, queda capilar e barba; foge do público deste anúncio.
- **Agendamento:** [`landing-whatsapp-demo.tsx:65–66, 380`](components/landing-whatsapp-demo.tsx:65) fala em “Puxa pro agendamento” e sugere “agendar uma avaliação”; o exemplo em [`page.tsx:265–273`](app/(marketing)/page.tsx:265) pergunta se deve ver horário. Pode dar a entender que o produto agenda.
- **Promessa de resultado:** “Uma cliente recuperada já paga o mês inteiro”, em [`onboarding/page.tsx:746–750`](app/(marketing)/onboarding/page.tsx:746), e “Responda melhor. Agende mais” extrapolam a promessa permitida.
- **Preço fixo de procedimento no exemplo:** “Botox é R$900” em [`onboarding/page.tsx:643–651`](app/(marketing)/onboarding/page.tsx:643) contradiz a orientação de não mostrar preço de procedimento.

Start está coerente em [`lib/billing.ts:34–49`](lib/billing.ts:34): R$97/mês. A oferta de cinco respostas grátis sem cartão também aparece na landing.

