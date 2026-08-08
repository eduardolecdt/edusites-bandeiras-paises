# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-08-08

Primeira versão.

### Adicionado

- **196 bandeiras em SVG** (`flags/{iso}.svg`), ISO-3166 alpha-2 minúsculo,
  proporção 4x3. Origem: `flag-icons` v7.2.3, com Sérvia, Dominica e Irã
  substituídas pela versão do `flagcdn` (bem menores: 177→28 KB, 14→4 KB,
  13→1 KB).
- **Lista de 196 países** em `src/paises.js` — `{ nome, codigo, telefone }`,
  nomes em português-BR, ordenada por nome. Cobertura verificada: 196/196
  países com bandeira, nenhuma bandeira órfã.
- **`urlBandeira(codigo)`** — caminho do SVG, case-insensitive. Devolve `''`
  para ISO inválido ou inexistente, então nunca gera uma `<img>` quebrada.
- **`definirBase(caminho)` / `obterBase()`** — permite servir as bandeiras em
  outro caminho ou num CDN (padrão `/bandeiras`).
- **Modo inline** — `svgBandeiraAsync(codigo)` carrega o SVG como módulo JS sob
  demanda, com cache. `svgBandeira()` para leitura síncrona do cache e
  `precarregar()` para aquecer.
- **Componente Vue `SvgBandeira`** — props `codigo`, `tamanho`, `redonda`,
  `inline`, `alt`, `className`. Em modo `<img>` sai com `loading="lazy"` e
  `decoding="async"` por padrão; código inexistente vira um `<span>` vazio do
  tamanho certo.
- **Plugin Nuxt** — `instalarBandeiras(nuxtApp)` via
  `@edusites/bandeiras-paises/nuxt` registra o componente globalmente.
- **Helpers de país** — `obterPais`, `obterCodigoPais` (aceita DDI com máscara),
  `buscarPaises` (nome sem acento, ISO ou DDI), `listarCodigos`, `temBandeira`.
- **Subpath exports** — `/core`, `/paises`, `/nuxt` e `/flags/*`.

### Decisões de projeto

- As bandeiras **não são inline num único módulo**. Um `icones.js` com as 196
  pesaria ~1.7 MB e o bundler o incluiria inteiro mesmo para quem usa só o
  Brasil. Cada bandeira é um arquivo (`flags/`) e um módulo próprio
  (`src/bandeiras/`), então nada entra no bundle sem ser pedido.
