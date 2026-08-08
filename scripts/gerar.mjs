// Regenera src/bandeiras/*.js e src/resolvedor.js a partir de flags/*.svg
// e confere a cobertura contra src/paises.js.
//
//   node scripts/gerar.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR_FLAGS = path.join(RAIZ, 'flags')
const DIR_MODULOS = path.join(RAIZ, 'src/bandeiras')

const { PAISES } = await import(path.join(RAIZ, 'src/paises.js'))

const flags = fs
  .readdirSync(DIR_FLAGS)
  .filter((arquivo) => arquivo.endsWith('.svg'))
  .sort()

// --- cobertura: todo país precisa de bandeira, toda bandeira precisa de país
const isos = new Set(flags.map((arquivo) => arquivo.replace('.svg', '')))
const semBandeira = PAISES.filter((pais) => !isos.has(pais.codigo.toLowerCase()))
const semPais = [...isos].filter((iso) => !PAISES.some((pais) => pais.codigo.toLowerCase() === iso))

console.log(`países: ${PAISES.length} | bandeiras: ${flags.length}`)
if (semBandeira.length) console.log(`⚠️  países sem bandeira: ${semBandeira.map((p) => p.codigo).join(', ')}`)
if (semPais.length) console.log(`⚠️  bandeiras sem país: ${semPais.join(', ')}`)
if (!semBandeira.length && !semPais.length) console.log('✓ cobertura completa')

// --- módulos, um por bandeira
function minificar(svg) {
  return svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .trim()
}

fs.rmSync(DIR_MODULOS, { recursive: true, force: true })
fs.mkdirSync(DIR_MODULOS, { recursive: true })

for (const arquivo of flags) {
  const iso = arquivo.replace('.svg', '')
  const svg = minificar(fs.readFileSync(path.join(DIR_FLAGS, arquivo), 'utf8'))
  fs.writeFileSync(path.join(DIR_MODULOS, `${iso}.js`), `export default ${JSON.stringify(svg)}\n`)
}

// --- resolvedor: mapa estático de imports dinâmicos
const entradas = flags.map((arquivo) => arquivo.replace('.svg', '')).map((iso) => `  '${iso}': () => import('./bandeiras/${iso}.js')`)

fs.writeFileSync(
  path.join(RAIZ, 'src/resolvedor.js'),
  `// Gerado automaticamente — mapa de import dinâmico por ISO alpha-2.\n// Cada bandeira é um chunk próprio: o bundler não inclui nenhuma sem ser pedida.\n\nexport const RESOLVEDORES = {\n${entradas.join(',\n')}\n}\n\nexport const ISOS = Object.keys(RESOLVEDORES)\n\nexport default RESOLVEDORES\n`
)

console.log(`✓ ${flags.length} módulos + resolvedor gerados`)
