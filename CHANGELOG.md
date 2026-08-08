# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-08-08

Primeira versão.

### Adicionado

- **196 bandeiras em SVG**, ISO-3166 alpha-2, proporção 4x3. Origem:
  `flag-icons` v7.2.3, com Sérvia, Dominica e Irã substituídas pela versão do
  `flagcdn` (bem menores: 177→28 KB, 14→4 KB, 13→1 KB).
- **Componente Vue `SvgPais`** — `<SvgPais nome="BR" />`. Props `nome`,
  `tamanho`, `redonda` e `className`. Sem `tamanho`, herda `1em` da fonte, como
  um ícone. Código inexistente vira um `<span>` vazio do tamanho certo, nunca
  uma imagem quebrada.
- **Plugin Nuxt** — `instalarPaises(nuxtApp)` via
  `@edusites/bandeiras-paises/nuxt` registra o componente globalmente.
- **`svgPaisAsync(opcoes)`** para JS puro, React e Svelte; `svgPais()` para
  leitura síncrona do cache; `resolverBruto()` para o SVG sem estilo injetado;
  `precarregar()` para aquecer.
- **Lista de 196 países** — `{ nome, codigo, telefone }`, nomes em
  português-BR, ordenada por nome. Cobertura verificada: 196/196 países com
  bandeira, nenhuma bandeira órfã.
- **Helpers de país** — `obterPais`, `obterCodigoPais` (aceita DDI com
  máscara), `buscarPaises` (nome sem acento, ISO ou DDI), `listarCodigos`,
  `temPais`.
- **Subpath exports** — `/core` (sem Vue), `/paises` e `/nuxt`.
- **42 testes** cobrindo a API e o componente via SSR.

### Decisões de projeto

- **Tree-shaking por bandeira.** Cada uma é um módulo próprio em
  `src/bandeiras/{iso}.js`, carregado por `import()` sob demanda. As 196 somam
  1,7 MB — num módulo único o bundler incluiria tudo mesmo para quem usa só o
  Brasil.
- **Nada de configuração no projeto consumidor.** Instalou, importou, usou —
  o mesmo contrato do `@edusites/icons`. Sem copiar pasta de assets, sem
  `publicAssets` no Nitro, sem servir arquivo estático.
