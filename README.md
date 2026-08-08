<div align="center">

# @edusites/bandeiras-paises

**Bandeiras dos 196 países em SVG + lista de países em português com DDI. Fora do bundle, carregadas sob demanda. Vue, Nuxt e JS puro.**

[![npm version](https://img.shields.io/npm/v/@edusites/bandeiras-paises?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/@edusites/bandeiras-paises)
[![npm downloads](https://img.shields.io/npm/dm/@edusites/bandeiras-paises?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/@edusites/bandeiras-paises)
[![license](https://img.shields.io/npm/l/@edusites/bandeiras-paises?style=flat&colorA=18181B&colorB=28CF8D)](./LICENSE)
[![países](https://img.shields.io/badge/países-196-28CF8D?style=flat&colorA=18181B)](https://lecdt.com/libs/bandeiras-paises)

[Release Notes](https://github.com/eduardolecdt/edusites-bandeiras-paises/releases) · [Changelog](./CHANGELOG.md)

</div>

## Por que `@edusites/bandeiras-paises`?

- 🌍 **196 países** — ISO-3166 alpha-2, com nome em português-BR e DDI.
- 📦 **Fora do bundle** — as bandeiras são arquivos SVG independentes. Usar o Brasil não baixa a Sérvia.
- 🚫 **Zero serviço externo** — nada de `flagsapi.com`. Os arquivos são seus, servidos do seu domínio.
- 🐢 **`loading="lazy"` por padrão** — uma lista de 196 bandeiras só baixa as visíveis.
- 🛡️ **ISO inválido nunca quebra** — `urlBandeira('xx')` devolve `''`, não uma `<img>` estourada.
- 🔤 **Case-insensitive** — a store usa `'BR'`, o arquivo é `br.svg`. Você não se preocupa.

## Instalação

```bash
npm install @edusites/bandeiras-paises
# ou
pnpm add @edusites/bandeiras-paises
# ou
yarn add @edusites/bandeiras-paises
```

## Os dois modos de uso

O pacote entrega as bandeiras de duas formas. Escolha uma — ou use as duas.

| Modo | Como funciona | Quando usar |
|---|---|---|
| **Por URL** (padrão) | `<img src="/bandeiras/br.svg">`, servido como asset estático | Listas grandes, seletor de telefone, qualquer `<img>` |
| **Inline** | O SVG vira um módulo JS carregado por `import()` sob demanda | Quando você precisa do markup do SVG (estilizar `fill`, animar) |

Em nenhum dos dois as 196 bandeiras entram no bundle.

---

## Modo 1 — por URL (recomendado)

### Passo 1: servir os arquivos

Copie a pasta `flags/` do pacote para os assets estáticos do seu projeto.

**Nuxt** — em `nuxt.config.js`:

```js
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  nitro: {
    publicAssets: [
      {
        baseURL: '/bandeiras',
        dir: fileURLToPath(new URL('./node_modules/@edusites/bandeiras-paises/flags', import.meta.url))
      }
    ]
  }
})
```

**Qualquer projeto** — copie no `postinstall`:

```json
{
  "scripts": {
    "postinstall": "cp -R node_modules/@edusites/bandeiras-paises/flags public/bandeiras"
  }
}
```

### Passo 2: usar

```js
import { urlBandeira } from '@edusites/bandeiras-paises'

urlBandeira('BR')    // → '/bandeiras/br.svg'
urlBandeira('br')    // → '/bandeiras/br.svg'  (case-insensitive)
urlBandeira('xx')    // → ''  (país inexistente)
urlBandeira(null)    // → ''
```

```vue
<img v-if="urlBandeira(pais.codigo)" :src="urlBandeira(pais.codigo)" :alt="pais.nome" loading="lazy" decoding="async" />
```

### Base diferente de `/bandeiras`

Se você serviu os arquivos em outro caminho (ou num CDN):

```js
import { definirBase } from '@edusites/bandeiras-paises'

definirBase('/assets/flags')            // → urlBandeira('BR') === '/assets/flags/br.svg'
definirBase('https://cdn.seusite.com/bandeiras')
```

Chame uma vez no boot da aplicação (plugin Nuxt, `main.js`, etc.).

---

## Modo 2 — inline (SVG como string)

Não precisa servir arquivo nenhum: o SVG vem de um módulo JS carregado sob demanda.

```js
import { svgBandeiraAsync, svgBandeira, precarregar } from '@edusites/bandeiras-paises'

const svg = await svgBandeiraAsync('BR')  // → '<svg xmlns="..." viewBox="0 0 640 480">…'

svgBandeira('BR')                          // → síncrono, só se já estiver em cache
await precarregar(['BR', 'US', 'PT'])      // → aquece o cache dessas três
await precarregar()                        // → todas as 196 (evite no boot)
```

---

## Componente Vue

```js
import { SvgBandeira } from '@edusites/bandeiras-paises'
```

```vue
<SvgBandeira codigo="BR" />
<SvgBandeira codigo="BR" :tamanho="18" redonda />
<SvgBandeira codigo="BR" :tamanho="24" inline />
```

| Prop | Tipo | Padrão | O que faz |
|---|---|---|---|
| `codigo` | `String` | — | ISO alpha-2, maiúsculo ou minúsculo (`'BR'`, `'br'`) |
| `tamanho` | `Number \| String` | `18` | Número vira `px`; string passa direto (`'1.5rem'`) |
| `redonda` | `Boolean` | `false` | `border-radius: 50%` + `object-fit: cover` |
| `inline` | `Boolean` | `false` | Renderiza o SVG inline em vez de `<img>` |
| `alt` | `String` | o código | Texto alternativo da `<img>` |
| `className` | `String` | — | Classe extra no elemento |

Em modo `<img>` (padrão) o componente já sai com `loading="lazy"` e `decoding="async"`. Código inexistente renderiza um `<span>` vazio do tamanho certo — nunca uma imagem quebrada.

### Nuxt — registrar global

```js
// plugins/bandeiras.js
import { instalarBandeiras } from '@edusites/bandeiras-paises/nuxt'

export default defineNuxtPlugin((nuxtApp) => {
  instalarBandeiras(nuxtApp)
})
```

Depois é só usar `<SvgBandeira codigo="BR" />` em qualquer componente, sem import.

---

## Lista de países

```js
import { listarPaises, obterPais, obterCodigoPais, buscarPaises, listarCodigos, temBandeira } from '@edusites/bandeiras-paises'

listarPaises()
// → [{ nome: 'Afeganistão', codigo: 'AF', telefone: '93' }, …] — 196 itens, ordenados por nome (pt-BR)

obterPais('BR')          // → { nome: 'Brasil', codigo: 'BR', telefone: '55' }
obterCodigoPais('55')    // → 'BR'
obterCodigoPais('+55')   // → 'BR'  (aceita com máscara)

buscarPaises('brasil')   // → [{ nome: 'Brasil', … }]
buscarPaises('africa')   // → busca sem acento também
buscarPaises('55')       // → busca por DDI

listarCodigos()          // → ['AF', 'ZA', 'AL', …]
temBandeira('BR')        // → true
temBandeira('XX')        // → false
```

### Seletor de telefone completo

```vue
<script setup>
import { listarPaises, urlBandeira } from '@edusites/bandeiras-paises'

const paises = listarPaises()
const selecionado = ref('BR')
</script>

<template>
  <ul>
    <li v-for="pais in paises" :key="pais.codigo" @click="selecionado = pais.codigo">
      <img :src="urlBandeira(pais.codigo)" :alt="pais.nome" loading="lazy" decoding="async" width="18" height="18" style="border-radius: 50%; object-fit: cover" />
      <span>{{ pais.nome }}</span>
      <span>+{{ pais.telefone }}</span>
    </li>
  </ul>
</template>
```

---

## API

### Bandeiras

| Função | Retorno | Descrição |
|---|---|---|
| `urlBandeira(codigo)` | `String` | Caminho do SVG, ou `''` se o país não existir |
| `temBandeira(codigo)` | `Boolean` | Se existe bandeira para esse ISO |
| `svgBandeiraAsync(codigo)` | `Promise<String\|null>` | Carrega o SVG sob demanda |
| `svgBandeira(codigo)` | `String\|null` | Versão síncrona; só devolve se já estiver em cache |
| `precarregar(codigos?)` | `Promise<Number>` | Aquece o cache; sem argumento carrega tudo |
| `definirBase(caminho)` | `String` | Muda o prefixo das URLs (padrão `/bandeiras`) |
| `obterBase()` | `String` | Prefixo atual |

### Países

| Função | Retorno | Descrição |
|---|---|---|
| `listarPaises()` | `Array` | Os 196 países, ordenados por nome |
| `obterPais(codigo)` | `Object\|null` | Um país pelo ISO |
| `obterCodigoPais(ddi)` | `String\|null` | ISO a partir do DDI |
| `buscarPaises(termo)` | `Array` | Busca por nome (sem acento), ISO ou DDI |
| `listarCodigos()` | `Array` | Só os códigos ISO |
| `PAISES` | `Array` | A constante crua (não copie — use `listarPaises()`) |

### Imports parciais

```js
import { urlBandeira } from '@edusites/bandeiras-paises/core'   // sem Vue
import { PAISES } from '@edusites/bandeiras-paises/paises'      // só a lista
import { instalarBandeiras } from '@edusites/bandeiras-paises/nuxt'
import bandeiraBr from '@edusites/bandeiras-paises/flags/br.svg'
```

---

## Migrando de `flagsapi.com`

```bash
grep -rn "flagsapi" --include="*.vue" --include="*.js" .
```

```diff
- <img :src="`https://flagsapi.com/${pais.codigo}/flat/16.png`" />
+ <img :src="urlBandeira(pais.codigo)" loading="lazy" decoding="async" />
```

Se o projeto já tem um `helpers/bandeira.js` local, a assinatura de `urlBandeira(codigo)` é idêntica de propósito — troque o import e apague o helper e a pasta `public/bandeiras/`.

---

## Licença

Código sob [MIT](./LICENSE).

As bandeiras vêm de [flag-icons](https://github.com/lipis/flag-icons) (MIT) e [flagcdn.com](https://flagcdn.com) (domínio público). Bandeiras nacionais em si não são protegidas por copyright na maioria das jurisdições.
