// Testes da lib — node test/lib.test.mjs
// Requer as devDependencies (vue, @vue/server-renderer) instaladas.

import * as lib from '../src/index.js'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

let falhas = 0
let total = 0

function teste(nome, real, esperado) {
  total++
  if (JSON.stringify(real) === JSON.stringify(esperado)) return
  falhas++
  console.log(`✗ ${nome}\n    obtido:   ${JSON.stringify(real)}\n    esperado: ${JSON.stringify(esperado)}`)
}

// --- urlBandeira
teste('urlBandeira maiúsculo', lib.urlBandeira('BR'), '/bandeiras/br.svg')
teste('urlBandeira minúsculo', lib.urlBandeira('br'), '/bandeiras/br.svg')
teste('urlBandeira com espaços', lib.urlBandeira(' BR '), '/bandeiras/br.svg')
teste('urlBandeira país inexistente', lib.urlBandeira('xx'), '')
teste('urlBandeira string vazia', lib.urlBandeira(''), '')
teste('urlBandeira null', lib.urlBandeira(null), '')
teste('urlBandeira undefined', lib.urlBandeira(undefined), '')
teste('urlBandeira número', lib.urlBandeira(55), '')
teste('default export é urlBandeira', lib.default('BR'), '/bandeiras/br.svg')

// --- base customizada
lib.definirBase('https://cdn.exemplo.com/f/')
teste('definirBase remove barra final', lib.urlBandeira('BR'), 'https://cdn.exemplo.com/f/br.svg')
lib.definirBase('')
teste('definirBase vazio volta ao padrão', lib.urlBandeira('BR'), '/bandeiras/br.svg')
teste('obterBase', lib.obterBase(), '/bandeiras')

// --- países
teste('196 países', lib.listarPaises().length, 196)
teste('196 códigos', lib.listarCodigos().length, 196)
teste('obterPais BR', lib.obterPais('BR'), { nome: 'Brasil', codigo: 'BR', telefone: '55' })
teste('obterPais inexistente', lib.obterPais('XX'), null)
teste('obterCodigoPais DDI', lib.obterCodigoPais('55'), 'BR')
teste('obterCodigoPais com máscara', lib.obterCodigoPais('+55'), 'BR')
teste('obterCodigoPais DDI inválido', lib.obterCodigoPais('9999'), null)
teste('buscarPaises sem acento', lib.buscarPaises('africa').map((p) => p.codigo), ['ZA', 'CF'])
teste('buscarPaises com acento', lib.buscarPaises('África').map((p) => p.codigo), ['ZA', 'CF'])
teste('buscarPaises termo vazio devolve todos', lib.buscarPaises('').length, 196)
teste('temBandeira existente', lib.temBandeira('BR'), true)
teste('temBandeira inexistente', lib.temBandeira('XX'), false)

const lista = lib.listarPaises()
lista[0].nome = 'ALTERADO'
teste('listarPaises devolve cópia defensiva', lib.listarPaises()[0].nome !== 'ALTERADO', true)

// --- SVG sob demanda
teste('svgBandeira antes do cache', lib.svgBandeira('BR'), null)
const svgBr = await lib.svgBandeiraAsync('BR')
teste('svgBandeiraAsync devolve SVG', svgBr.startsWith('<svg'), true)
teste('svgBandeira depois do cache', lib.svgBandeira('BR') === svgBr, true)
teste('svgBandeiraAsync inexistente', await lib.svgBandeiraAsync('XX'), null)

const invalidos = []
for (const codigo of lib.listarCodigos()) {
  const svg = await lib.svgBandeiraAsync(codigo)
  if (!svg || !svg.startsWith('<svg') || !svg.endsWith('</svg>')) invalidos.push(codigo)
}
teste('as 196 bandeiras carregam e são SVG válido', invalidos, [])

// --- componente Vue
const render = (props) => renderToString(createSSRApp({ render: () => h(lib.SvgBandeira, props) }))

const img = await render({ codigo: 'BR' })
teste('componente aponta para o SVG', img.includes('/bandeiras/br.svg'), true)
teste('componente usa loading lazy', img.includes('loading="lazy"'), true)
teste('componente usa decoding async', img.includes('decoding="async"'), true)
teste('componente tem alt', img.includes('alt="BR"'), true)
teste('tamanho padrão 18px', img.includes('width:18px'), true)

const redonda = await render({ codigo: 'BR', tamanho: 24, redonda: true })
teste('redonda aplica border-radius', redonda.includes('border-radius:50%'), true)
teste('tamanho numérico vira px', redonda.includes('width:24px'), true)

const emRem = await render({ codigo: 'BR', tamanho: '1.5rem' })
teste('tamanho string passa direto', emRem.includes('width:1.5rem'), true)

const invalido = await render({ codigo: 'XX' })
teste('código inválido não gera img', invalido.includes('<img'), false)

const inline = await render({ codigo: 'BR', inline: true })
teste('modo inline renderiza o SVG', inline.includes('<svg'), true)

console.log(falhas ? `\n${falhas} de ${total} testes falharam` : `\n✓ ${total} testes passaram`)
process.exit(falhas ? 1 : 0)
