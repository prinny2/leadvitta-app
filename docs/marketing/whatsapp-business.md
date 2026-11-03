# WhatsApp Business — +55 91 99113-4515

Link pronto: **https://wa.me/5591991134515?text=Oi%21%20Quero%20testar%20o%20LeadBellus%20na%20minha%20cl%C3%ADnica.**
QR code (1024 px, testado): `docs/marketing/whatsapp-qr.png`.

O botão de WhatsApp do site já usa esse número (GitHub Variable
`NEXT_PUBLIC_WHATSAPP_NUMBER = 5591991134515`). Enquanto o número não estiver
ativo no WhatsApp, quem clica lá cai em "número não está no WhatsApp".

## Qual caminho: app ou Cloud API

**Use o app WhatsApp Business no celular.** É grátis, a pessoa responde à mão
(igual ao produto: escreve, revisa e envia) e dá para ligar ao Instagram e ao
Facebook para anúncios "Enviar mensagem".
A Cloud API só faz sentido com automação (Z-API está cancelada): exige o número
fora do app (ou o modo coexistência), verificação da empresa e cobra por
conversa de marketing. Fica para depois.

## 1. O número já está no WhatsApp?

Não dá para confirmar pelo navegador sem estar logado; quem responde é o
próprio app na hora de cadastrar:

- **Se o número está no WhatsApp normal neste mesmo celular:** o WhatsApp
  Business mostra "Usar o número …" e **migra a conta**, com conversas e
  grupos. **Não precisa excluir nada.**
- **Se está no WhatsApp normal em outro celular:** ao confirmar o código no
  celular novo, o antigo sai sozinho. Faça backup antes, se quiser o histórico.
- **Se aparece "este número já é usado na plataforma WhatsApp Business /
  API":** o número está preso a uma conta da API (talvez da antiga Z-API).
  Aí precisa remover o número no Gerenciador do WhatsApp da conta que o
  registrou (ou pedir à Z-API).

Excluir a conta só é necessário para levar o número à Cloud API sem
coexistência. Se mesmo assim quiser: WhatsApp → Configurações → Conta →
Apagar conta → número → Apagar. Isso apaga histórico, grupos e backup e **não
tem volta**.

## 2. Criar (no celular, ~5 min)

1. Instale **WhatsApp Business** (ícone com "B") na Play Store ou App Store.
2. Aceite os termos → informe **+55 91 99113-4515** → confirme o código por
   SMS ou ligação. *(Essa etapa é só sua: código e termos.)*
3. Nome da empresa: **LeadBellus** · Categoria: digite **Software** (se não
   aparecer: "Serviços de TI" ou "Outros"). Não use "Médico e saúde".
4. O CNPJ não é pedido no app. Ele entra depois, na verificação da empresa no
   Meta Business (Configurações do negócio → Central de segurança → Verificação).

## 3. Perfil (Ferramentas comerciais → Perfil comercial)

| Campo | Valor |
|---|---|
| Foto | logo LeadBellus (`public/` ou o kit social) |
| Descrição | `Respostas de WhatsApp para clínicas de estética. Cole a mensagem da cliente e receba 3 respostas no tom da sua clínica. Sua equipe revisa e envia. 5 respostas grátis, sem cartão.` |
| Site | `https://www.leadbellus.com.br/?utm_source=whatsapp&utm_medium=perfil` |
| E-mail | deixe em branco por enquanto (o domínio `leadbellus.com.br` não tem MX: e-mail para `suporte@` não chega) |
| Endereço | em branco (negócio online) |
| Horário | Seg–sex, 9h–18h |

## 4. Mensagens automáticas (Ferramentas comerciais)

**Mensagem de saudação** (enviar a novos contatos):
```
Oi! Aqui é a LeadBellus 👋
A gente ajuda clínicas de estética a responder o WhatsApp mais rápido: você cola a mensagem da cliente e recebe 3 respostas no tom da sua clínica.
Quer testar agora? É só abrir www.leadbellus.com.br e colar uma mensagem real (5 grátis, sem cartão).
Me conta: sua clínica trabalha com toxina, preenchimento ou harmonização?
```

**Mensagem de ausência** (fora do horário):
```
Oi! Agora estamos fora do horário, mas você já pode testar sozinha: www.leadbellus.com.br — cole a mensagem de uma cliente e veja as 3 respostas. Amanhã cedo eu te respondo por aqui.
```

**Respostas rápidas:**

| Atalho | Texto |
|---|---|
| `/teste` | Abre www.leadbellus.com.br, cola a última mensagem que uma cliente te mandou e escolhe a situação. Em 10 segundos aparecem 3 respostas. São 5 grátis, sem cartão. |
| `/envia` | Não, ela não envia nada sozinha. A LeadBellus só escreve: você revisa, ajusta se quiser e copia para o WhatsApp. Nada sai sem você. |
| `/preco` | O plano Start é R$97/mês, cancela quando quiser. Antes disso você testa 5 respostas grátis, sem cartão. |
| `/dados` | A mensagem que você cola vai para a IA só para gerar as respostas e fica no histórico da sua conta, que só você vê. A gente não fala com a sua cliente e não acessa o seu WhatsApp. Dica: tire o nome da cliente antes de colar. |

**Etiquetas:** `Novo contato` · `Testou grátis` · `Checkout iniciado` ·
`Cliente` · `Sem interesse`.

## 5. Ligar ao Instagram e ao Facebook

WhatsApp Business → Ferramentas comerciais → **Facebook e Instagram** →
entre com a conta que administra a Página e o Instagram da LeadBellus →
confirme o número. Depois, no Instagram: Editar perfil → Botões de ação →
**WhatsApp** → este número. É isso que libera anúncios "Enviar mensagem"
(Click-to-WhatsApp) e o botão no perfil.
