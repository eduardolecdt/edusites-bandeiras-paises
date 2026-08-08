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

// --- países
teste('196 países', lib.listarPaises().length, 196)
teste('196 códigos', lib.listarCodigos().length, 196)
teste('obterPais BR', lib.obterPais('BR'), { nome: 'Brasil', codigo: 'BR', telefone: '55' })
teste('obterPais minúsculo', lib.obterPais('br').codigo, 'BR')
teste('obterPais inexistente', lib.obterPais('XX'), null)
teste('obterPais null', lib.obterPais(null), null)
teste('obterCodigoPais DDI', lib.obterCodigoPais('55'), 'BR')
teste('obterCodigoPais com máscara', lib.obterCodigoPais('+55'), 'BR')
teste('obterCodigoPais DDI inválido', lib.obterCodigoPais('9999'), null)
teste('buscarPaises sem acento', lib.buscarPaises('africa').map((p) => p.codigo), ['ZA', 'CF'])
teste('buscarPaises com acento', lib.buscarPaises('África').map((p) => p.codigo), ['ZA', 'CF'])
// 'BR' casa com o ISO do Brasil e com o nome 'Brunei' — busca ampla é o esperado
teste('buscarPaises por ISO', lib.buscarPaises('BR').map((p) => p.codigo), ['BR', 'BN'])
teste('buscarPaises por DDI', lib.buscarPaises('55').map((p) => p.codigo).includes('BR'), true)
teste('buscarPaises termo vazio devolve todos', lib.buscarPaises('').length, 196)
teste('temPais existente', lib.temPais('BR'), true)
teste('temPais minúsculo', lib.temPais('br'), true)
teste('temPais inexistente', lib.temPais('XX'), false)
teste('temPais null', lib.temPais(null), false)

const lista = lib.listarPaises()
lista[0].nome = 'ALTERADO'
teste('listarPaises devolve cópia defensiva', lib.listarPaises()[0].nome !== 'ALTERADO', true)

// --- svgPais sob demanda
// Em Node (e no SSR) o monolítico já está em memória, então a versão síncrona
// resolve de primeira — é o que faz a bandeira sair no HTML do servidor.
teste('svgPais resolve síncrono no servidor', lib.svgPais('BR').startsWith('<svg'), true)
teste('svgPais código inválido', lib.svgPais('XX'), null)
teste('svgPaisAsync inexistente', await lib.svgPaisAsync('XX'), null)
teste('svgPaisAsync null', await lib.svgPaisAsync(null), null)

const svgBr = await lib.svgPaisAsync('BR')
teste('svgPaisAsync devolve SVG', svgBr.startsWith('<svg'), true)
teste('svgPaisAsync aplica classe', svgBr.includes('class="edusites-bandeira"'), true)
teste('tamanho padrão é 1em', svgBr.includes('width:1em'), true)
teste('svgPais consistente após async', lib.svgPais('BR') !== null, true)
teste('aceita string direto', (await lib.svgPaisAsync('br')).startsWith('<svg'), true)

const svg24 = await lib.svgPaisAsync({ nome: 'BR', tamanho: 24 })
teste('tamanho numérico vira px', svg24.includes('width:24px'), true)

const svgRem = await lib.svgPaisAsync({ nome: 'BR', tamanho: '1.5rem' })
teste('tamanho string passa direto', svgRem.includes('width:1.5rem'), true)

const svgRedonda = await lib.svgPaisAsync({ nome: 'BR', redonda: true })
teste('redonda aplica border-radius', svgRedonda.includes('border-radius:50%'), true)
teste('não-redonda não aplica border-radius', svgBr.includes('border-radius'), false)

const svgClasse = await lib.svgPaisAsync({ nome: 'BR', className: 'minha-classe' })
teste('className extra é concatenado', svgClasse.includes('class="edusites-bandeira minha-classe"'), true)

// --- resolverBruto devolve o SVG sem alterações
const bruto = await lib.resolverBruto('BR')
teste('resolverBruto não injeta classe', bruto.includes('edusites-bandeira'), false)
teste('resolverBruto é SVG', bruto.startsWith('<svg'), true)

// --- todas as 196 carregam e são SVG válido
const invalidos = []
for (const codigo of lib.listarCodigos()) {
  const svg = await lib.resolverBruto(codigo)
  if (!svg || !svg.startsWith('<svg') || !svg.endsWith('</svg>')) invalidos.push(codigo)
}
teste('as 196 bandeiras carregam e são SVG válido', invalidos, [])
teste('precarregar devolve o total em cache', await lib.precarregar(), 196)

// --- componente Vue
const render = (props) => renderToString(createSSRApp({ render: () => h(lib.SvgPais, props) }))

const componente = await render({ nome: 'BR' })
teste('componente renderiza o SVG', componente.includes('<svg'), true)
teste('componente usa span wrapper', componente.includes('edusites-pais'), true)

const componente24 = await render({ nome: 'BR', tamanho: 24 })
teste('componente respeita tamanho', componente24.includes('width:24px'), true)

const componenteRedonda = await render({ nome: 'BR', redonda: true })
teste('componente redonda', componenteRedonda.includes('border-radius:50%'), true)

const componenteInvalido = await render({ nome: 'XX' })
teste('código inválido não renderiza SVG', componenteInvalido.includes('<svg'), false)

console.log(falhas ? `\n${falhas} de ${total} testes falharam` : `\n✓ ${total} testes passaram`)
process.exit(falhas ? 1 : 0)
