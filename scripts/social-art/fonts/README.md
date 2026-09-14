# Fontes do gerador de artes

- `inter-variable.woff2` — **Inter**, subset latin (variável 100–900), baixado do
  Google Fonts. Licença: SIL Open Font License 1.1.
  https://fonts.google.com/specimen/Inter

A **Fraunces** (wordmark) não é duplicada aqui: o gerador lê
`public/brand/fonts/Fraunces.ttf`, que já é o arquivo oficial do pacote de marca
(também OFL).

Ambas são embutidas em base64 no momento do render, para que as artes saiam
idênticas em qualquer máquina, sem depender de rede nem das fontes do sistema.
