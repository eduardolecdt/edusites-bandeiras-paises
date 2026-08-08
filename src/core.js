import { PAISES } from './paises.js'
import { RESOLVEDORES } from './resolvedor.js'

const CACHE = new Map()

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
  const arredondamento = redonda ? 'border-radius:50%;' : ''
  const estilo = `width:${dimensao};height:${dimensao};${arredondamento}object-fit:cover;display:inline-block;vertical-align:middle`

  return svg.replace(/^<svg/, `<svg class="${classes}" style="${estilo}" preserveAspectRatio="xMidYMid slice"`)
}

export function svgPais(opcoes) {
  const { nome, tamanho, redonda, className } = typeof opcoes === 'string' ? { nome: opcoes } : opcoes || {}

  const iso = normalizarIso(nome)
  if (!iso) return null

  const svg = CACHE.get(iso)
  if (!svg) return null

  return montarSvg(svg, { tamanho, redonda, className })
}

export async function svgPaisAsync(opcoes) {
  const { nome, tamanho, redonda, className } = typeof opcoes === 'string' ? { nome: opcoes } : opcoes || {}

  const iso = normalizarIso(nome)
  if (!iso) return null

  const svg = await resolverBruto(iso)
  if (!svg) return null

  return montarSvg(svg, { tamanho, redonda, className })
}

export async function resolverBruto(codigo) {
  const iso = normalizarIso(codigo)
  if (!iso) return null
  if (CACHE.has(iso)) return CACHE.get(iso)

  const resolvedor = RESOLVEDORES[iso]
  if (!resolvedor) return null

  const modulo = await resolvedor()
  const svg = modulo.default || null
  if (svg) CACHE.set(iso, svg)
  return svg
}

export async function precarregar(codigos) {
  const lista = Array.isArray(codigos) ? codigos : Object.keys(RESOLVEDORES)
  await Promise.all(lista.map((codigo) => resolverBruto(codigo)))
  return CACHE.size
}

export function temPais(codigo) {
  const iso = normalizarIso(codigo)
  return Boolean(iso) && iso in RESOLVEDORES
}

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
