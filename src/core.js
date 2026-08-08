import { PAISES } from './paises.js'
import { RESOLVEDORES } from './resolvedor.js'

const BASE_PADRAO = '/bandeiras'
const CACHE = new Map()

let base = BASE_PADRAO

function normalizarIso(codigo) {
  const iso = String(codigo == null ? '' : codigo)
    .trim()
    .toLowerCase()
  return /^[a-z]{2}$/.test(iso) ? iso : ''
}

function normalizarBase(caminho) {
  const limpo = String(caminho == null ? '' : caminho).trim()
  if (!limpo) return ''
  return limpo.endsWith('/') ? limpo.slice(0, -1) : limpo
}

export function definirBase(caminho) {
  base = normalizarBase(caminho) || BASE_PADRAO
  return base
}

export function obterBase() {
  return base
}

export function urlBandeira(codigo) {
  const iso = normalizarIso(codigo)
  if (!iso || !(iso in RESOLVEDORES)) return ''
  return `${base}/${iso}.svg`
}

export function temBandeira(codigo) {
  const iso = normalizarIso(codigo)
  return Boolean(iso) && iso in RESOLVEDORES
}

export function svgBandeira(codigo) {
  const iso = normalizarIso(codigo)
  if (!iso) return null
  return CACHE.get(iso) || null
}

export async function svgBandeiraAsync(codigo) {
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
  await Promise.all(lista.map((codigo) => svgBandeiraAsync(codigo)))
  return CACHE.size
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
