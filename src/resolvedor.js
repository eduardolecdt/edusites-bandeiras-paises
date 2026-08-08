// Resolvedor de SVG bruto — mesma arquitetura de 3 camadas do @edusites/icons,
// que dá tree-shaking no cliente SEM quebrar a renderização no SSR.
//
// O dilema: com `<SvgPais nome="BR">` (nome dinâmico em runtime) é impossível ter,
// ao mesmo tempo, (a) resolução síncrona, (b) tree-shaking e (c) nome dinâmico —
// o bundler não sabe o código em build-time. A saída é separar por ambiente:
//
// - SERVIDOR (SSR/Node): o peso não vai pro cliente, então carregamos todas as
//   bandeiras do objeto monolítico e resolvemos SÍNCRONO. A bandeira entra no
//   HTML do SSR em vez de aparecer só depois da hidratação.
//
// - CLIENTE: `import.meta.glob` LAZY — cada bandeira é um chunk separado, baixado
//   sob demanda. Só as que aparecem entram no bundle. As já resolvidas no SSR
//   chegam quentes no cache; as demais carregam sob demanda.

// ---- Detecção de ambiente ----
function ehServidor() {
  try {
    if (typeof import.meta !== 'undefined' && typeof import.meta.server !== 'undefined') {
      return import.meta.server
    }
  } catch {
    /* noop */
  }
  return typeof window === 'undefined'
}

// ---- Glob lazy (só resolvido pelo Vite; null fora dele) ----
let GLOB = null
try {
  if (typeof import.meta !== 'undefined' && typeof import.meta.glob === 'function') {
    GLOB = import.meta.glob('./bandeiras/*.js')
  }
} catch {
  GLOB = null
}

const CACHE_BRUTO = new Map()

// ---- Monolítico (server bundle / fallback sem-Vite) ----
// Import DINÂMICO, então nunca entra no bundle do cliente Vite.
let monoliticoSync = null
let promessaMono = null

function carregarMonoAsync() {
  if (monoliticoSync) return Promise.resolve(monoliticoSync)
  if (!promessaMono) {
    promessaMono = import('./bandeiras.js').then((mod) => {
      monoliticoSync = mod.BANDEIRAS
      return monoliticoSync
    })
  }
  return promessaMono
}

// No servidor, carrega bloqueante com top-level await para que a resolução
// síncrona funcione já na primeira chamada — sem custo algum para o cliente.
if (ehServidor()) {
  try {
    await carregarMonoAsync()
  } catch {
    /* segue com fallback async */
  }
}

function chaveGlob(iso) {
  return `./bandeiras/${iso}.js`
}

export function temGlob() {
  return GLOB !== null
}

// ---- Resolução assíncrona (caminho universal) ----
export async function resolverBrutoAsync(iso) {
  if (CACHE_BRUTO.has(iso)) return CACHE_BRUTO.get(iso)

  let bruto = null

  if (ehServidor() || !GLOB) {
    const bandeiras = await carregarMonoAsync()
    bruto = (bandeiras && bandeiras[iso]) || null
  } else {
    const carregar = GLOB[chaveGlob(iso)]
    if (carregar) {
      const mod = await carregar()
      bruto = (mod && mod.default) || null
    }
  }

  CACHE_BRUTO.set(iso, bruto)
  return bruto
}

// ---- Resolução síncrona ----
// Servidor: resolve de verdade a partir do monolítico já em memória.
// Cliente: devolve do cache (quente via SSR) ou null, disparando o load async.
export function resolverBrutoSync(iso) {
  if (CACHE_BRUTO.has(iso)) return CACHE_BRUTO.get(iso)

  if (monoliticoSync) {
    const bruto = monoliticoSync[iso] || null
    CACHE_BRUTO.set(iso, bruto)
    return bruto
  }

  resolverBrutoAsync(iso).catch(() => {})
  return null
}

export async function precarregarBrutos(isos) {
  const lista = Array.isArray(isos) ? isos : [isos]
  await Promise.all(lista.map((iso) => resolverBrutoAsync(iso)))
}

// Semeia o cache a partir de dados externos (ex: payload de hidratação).
export function semear(mapa) {
  if (!mapa) return
  for (const iso of Object.keys(mapa)) {
    if (!CACHE_BRUTO.has(iso)) CACHE_BRUTO.set(iso, mapa[iso])
  }
}
