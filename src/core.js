import { PAISES } from './paises.js'
import { ISOS } from './isos.js'
import { resolverBrutoSync, resolverBrutoAsync, precarregarBrutos } from './resolvedor.js'

const DISPONIVEIS = new Set(ISOS)

function normalizarIso(codigo) {
  const iso = String(codigo == null ? '' : codigo)
    .trim()
    .toLowerCase()
  return /^[a-z]{2}$/.test(iso) ? iso : ''
}

function montarSvg(svg, opcoes) {
  const { tamanho, redonda, className } = opcoes

  const dimensao = tamanho == null ? '1em' : typeof tamanho === 'number' || /^\d+$/.test(String(tamanho)) ? `${tamanho}px` : String(tamanho)

  const classes = className ? `edusites-bandeira ${className}` : 'edusites-bandeira'

  // Redonda: recorta um círculo do centro, então precisa de caixa quadrada + cover.
  // Original: as bandeiras são 4x3, então só a largura é fixada — forçar quadrado
  // aqui achataria o desenho.
  const caixa = redonda ? `width:${dimensao};height:${dimensao};border-radius:50%;object-fit:cover` : `width:${dimensao};height:auto`

  const proporcao = redonda ? ' preserveAspectRatio="xMidYMid slice"' : ''

  return svg.replace(/^<svg/, `<svg class="${classes}" style="${caixa};display:inline-block;vertical-align:middle"${proporcao}`)
}

export function svgPais(opcoes) {
  const { nome, tamanho, redonda, className } = typeof opcoes === 'string' ? { nome: opcoes } : opcoes || {}

  const iso = normalizarIso(nome)
  if (!iso) return null

  const svg = resolverBrutoSync(iso)
  if (!svg) return null

  return montarSvg(svg, { tamanho, redonda, className })
}

export async function svgPaisAsync(opcoes) {
  const { nome, tamanho, redonda, className } = typeof opcoes === 'string' ? { nome: opcoes } : opcoes || {}

  const iso = normalizarIso(nome)
  if (!iso) return null

  const svg = await resolverBrutoAsync(iso)
  if (!svg) return null

  return montarSvg(svg, { tamanho, redonda, className })
}

export async function resolverBruto(codigo) {
  const iso = normalizarIso(codigo)
  if (!iso) return null
  return resolverBrutoAsync(iso)
}

export async function precarregar(codigos) {
  const lista = (Array.isArray(codigos) ? codigos : ISOS).map(normalizarIso).filter(Boolean)
  await precarregarBrutos(lista)
  return lista.length
}

export function temPais(codigo) {
  const iso = normalizarIso(codigo)
  return Boolean(iso) && DISPONIVEIS.has(iso)
}

export { ISOS }

export function listarPaises() {
  return PAISES.map((pais) => ({ ...pais }))
}

export function obterPais(codigo) {
  const iso = normalizarIso(codigo)
  if (!iso) return null
  const pais = PAISES.find((item) => item.codigo.toLowerCase() === iso)
  return pais ? { ...pais } : null
}

export function obterCodigoPais(ddi) {
  const telefone = String(ddi == null ? '' : ddi)
    .trim()
    .replace(/\D/g, '')
  if (!telefone) return null
  const pais = PAISES.find((item) => item.telefone === telefone)
  return pais ? pais.codigo : null
}

export function buscarPaises(termo) {
  const busca = String(termo == null ? '' : termo)
    .trim()
    .toLowerCase()
  if (!busca) return listarPaises()

  const semAcento = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '')
  const alvo = semAcento(busca)

  return PAISES.filter((pais) => semAcento(pais.nome.toLowerCase()).includes(alvo) || pais.codigo.toLowerCase().includes(alvo) || pais.telefone.includes(alvo)).map((pais) => ({ ...pais }))
}

export function listarCodigos() {
  return PAISES.map((pais) => pais.codigo)
}

export { PAISES }
