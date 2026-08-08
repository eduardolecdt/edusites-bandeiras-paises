<div align="center">

# @edusites/bandeiras-paises

**Bandeiras dos 196 países em SVG + a lista de países em português com DDI. Tree-shakeable, para Vue, Nuxt, React, Svelte e JS puro.**

[![npm version](https://img.shields.io/npm/v/@edusites/bandeiras-paises?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/@edusites/bandeiras-paises)
[![npm downloads](https://img.shields.io/npm/dm/@edusites/bandeiras-paises?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/@edusites/bandeiras-paises)
[![license](https://img.shields.io/npm/l/@edusites/bandeiras-paises?style=flat&colorA=18181B&colorB=28CF8D)](./LICENSE)
[![países](https://img.shields.io/badge/países-196-28CF8D?style=flat&colorA=18181B)](https://lecdt.com/libs/bandeiras-paises)

[Galeria de bandeiras](https://lecdt.com/libs/bandeiras-paises) · [Release Notes](https://github.com/eduardolecdt/edusites-bandeiras-paises/releases) · [Changelog](./CHANGELOG.md)

</div>

## Por que `@edusites/bandeiras-paises`?

- 🌍 **196 países** — ISO-3166 alpha-2, com nome em português-BR e DDI já no pacote.
- 🌳 **Tree-shakeable** — cada bandeira é um chunk próprio. Usar o Brasil **não** baixa a Sérvia.
- 🚫 **Zero serviço externo** — nada de `flagsapi.com`. Nenhuma requisição sai do seu domínio.
- 🔤 **Case-insensitive** — a store usa `'BR'`, você não se preocupa com maiúscula.
- ⚡ **Multi-framework** — Vue, Nuxt, React, Svelte e JS puro. Zero dependências no núcleo.
- 📞 **Feito para formulário** — seletor de telefone pronto: nome, ISO e DDI na mesma lista.

## Instalação

```bash
npm install @edusites/bandeiras-paises
# ou
pnpm add @edusites/bandeiras-paises
# ou
yarn add @edusites/bandeiras-paises
```

## Uso

```js
import { SvgPais } from '@edusites/bandeiras-paises'
```

```vue
<SvgPais nome="BR" />
<SvgPais nome="BR" :tamanho="24" />
<SvgPais nome="BR" :tamanho="18" redonda />
```

Só isso. Sem configurar nada, sem copiar pasta, sem servir arquivo.

| Prop | Tipo | Padrão | O que faz |
|---|---|---|---|
| `nome` | `String` | — | ISO alpha-2, maiúsculo ou minúsculo (`'BR'`, `'br'`) |
| `tamanho` | `Number \| String` | `1em` | Número vira `px`; string passa direto (`'1.5rem'`) |
| `redonda` | `Boolean` | `false` | `border-radius: 50%` + `object-fit: cover` |
| `className` | `String` | — | Classe extra no SVG |

Sem `tamanho`, a bandeira herda o tamanho da fonte (`1em`) — funciona como um ícone dentro do texto. Código inexistente renderiza um `<span>` vazio do tamanho certo, nunca uma imagem quebrada.

### Nuxt — registrar global

```js
// plugins/edusites-bandeiras.js
import { instalarPaises } from '@edusites/bandeiras-paises/nuxt'

export default defineNuxtPlugin((nuxtApp) => {
  instalarPaises(nuxtApp)
})
```

Depois é só usar `<SvgPais nome="BR" />` em qualquer componente, sem import.

### JavaScript puro

```js
import { svgPaisAsync } from '@edusites/bandeiras-paises'

const svg = await svgPaisAsync({ nome: 'BR', tamanho: 32, redonda: true })
document.getElementById('app').innerHTML = svg
```

### React

```jsx
import { svgPaisAsync } from '@edusites/bandeiras-paises'
import { useEffect, useState } from 'react'

function Bandeira({ nome, tamanho, redonda }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    svgPaisAsync({ nome, tamanho, redonda }).then((r) => setSvg(r || ''))
  }, [nome, tamanho, redonda])

  return <span dangerouslySetInnerHTML={{ __html: svg }} />
}
```

### Svelte

```svelte
<script>
  import { svgPaisAsync } from '@edusites/bandeiras-paises'

  export let nome
  export let tamanho = undefined
  export let redonda = false

  $: promessa = svgPaisAsync({ nome, tamanho, redonda })
</script>

{#await promessa then svg}
  {@html svg}
{/await}
```

---

## Lista de países

```js
import { listarPaises, obterPais, obterCodigoPais, buscarPaises, listarCodigos, temPais } from '@edusites/bandeiras-paises'

listarPaises()
// → [{ nome: 'Afeganistão', codigo: 'AF', telefone: '93' }, …] — 196 itens, ordenados por nome (pt-BR)

obterPais('BR')          // → { nome: 'Brasil', codigo: 'BR', telefone: '55' }
obterCodigoPais('55')    // → 'BR'
obterCodigoPais('+55')   // → 'BR'  (aceita com máscara)

buscarPaises('brasil')   // → [{ nome: 'Brasil', … }]
buscarPaises('africa')   // → busca sem acento também
buscarPaises('55')       // → busca por DDI

listarCodigos()          // → ['AF', 'ZA', 'AL', …]
temPais('BR')            // → true
temPais('XX')            // → false
```

### Seletor de telefone completo

```vue
<script setup>
import { listarPaises, SvgPais } from '@edusites/bandeiras-paises'

const paises = listarPaises()
const selecionado = ref('BR')
</script>

<template>
  <ul>
    <li v-for="pais in paises" :key="pais.codigo" @click="selecionado = pais.codigo">
      <SvgPais :nome="pais.codigo" :tamanho="18" redonda />
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
| `svgPais(opcoes)` | `String\|null` | Síncrono; só devolve se a bandeira já estiver em cache |
| `svgPaisAsync(opcoes)` | `Promise<String\|null>` | Carrega e devolve o SVG pronto para renderizar |
| `resolverBruto(codigo)` | `Promise<String\|null>` | O SVG original, sem classe/estilo injetados |
| `precarregar(codigos?)` | `Promise<Number>` | Aquece o cache; sem argumento carrega as 196 |
| `temPais(codigo)` | `Boolean` | Se existe bandeira para esse ISO |

`opcoes` aceita `{ nome, tamanho, redonda, className }` ou só a string do ISO (`svgPaisAsync('BR')`).

### Países

| Função | Retorno | Descrição |
|---|---|---|
| `listarPaises()` | `Array` | Os 196 países, ordenados por nome |
| `obterPais(codigo)` | `Object\|null` | Um país pelo ISO |
| `obterCodigoPais(ddi)` | `String\|null` | ISO a partir do DDI |
| `buscarPaises(termo)` | `Array` | Busca por nome (sem acento), ISO ou DDI |
| `listarCodigos()` | `Array` | Só os códigos ISO |
| `PAISES` | `Array` | A constante crua (não mute — use `listarPaises()`) |

### Imports parciais

```js
import { svgPaisAsync } from '@edusites/bandeiras-paises/core'   // sem Vue
import { PAISES } from '@edusites/bandeiras-paises/paises'       // só a lista
import { instalarPaises } from '@edusites/bandeiras-paises/nuxt'
```

---

## Migrando de `flagsapi.com`

```bash
grep -rn "flagsapi" --include="*.vue" --include="*.js" .
```

```diff
- <img :src="`https://flagsapi.com/${pais.codigo}/flat/16.png`" />
+ <SvgPais :nome="pais.codigo" :tamanho="18" redonda />
```

---

## Licença

Código sob [MIT](./LICENSE).

As bandeiras vêm de [flag-icons](https://github.com/lipis/flag-icons) (MIT) e [flagcdn.com](https://flagcdn.com) (domínio público). Bandeiras nacionais em si não são protegidas por copyright na maioria das jurisdições.
