// Regenera src/bandeiras.js (monolítico do servidor) e src/isos.js a partir dos
// módulos em src/bandeiras/, e confere a cobertura contra src/paises.js.
//
// O resolvedor (src/resolvedor.js) é escrito à mão — usa import.meta.glob e não
// precisa de geração.
//
//   node scripts/gerar.mjs
//
// Para adicionar/atualizar uma bandeira, passe o .svg de origem:
//
//   node scripts/gerar.mjs caminho/para/br.svg [outro.svg …]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR_MODULOS = path.join(RAIZ, 'src/bandeiras')

const { PAISES } = await import(path.join(RAIZ, 'src/paises.js'))

function minificar(svg) {
  return svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .trim()
}

// --- importa os SVGs passados na linha de comando, se houver
const entrada = process.argv.slice(2)
for (const arquivo of entrada) {
  const iso = path.basename(arquivo, '.svg').toLowerCase()
  if (!/^[a-z]{2}$/.test(iso)) {
    console.log(`⚠️  ignorado (nome não é ISO alpha-2): ${arquivo}`)
    continue
  }
  const svg = minificar(fs.readFileSync(arquivo, 'utf8'))
  fs.writeFileSync(path.join(DIR_MODULOS, `${iso}.js`), `export default ${JSON.stringify(svg)}\n`)
  console.log(`✓ importado ${iso}.svg`)
}

// --- cobertura: todo país precisa de bandeira, toda bandeira precisa de país
const modulos = fs
  .readdirSync(DIR_MODULOS)
  .filter((arquivo) => arquivo.endsWith('.js'))
  .map((arquivo) => arquivo.replace('.js', ''))
  .sort()

const isos = new Set(modulos)
const semBandeira = PAISES.filter((pais) => !isos.has(pais.codigo.toLowerCase()))
const semPais = modulos.filter((iso) => !PAISES.some((pais) => pais.codigo.toLowerCase() === iso))

console.log(`países: ${PAISES.length} | bandeiras: ${modulos.length}`)
if (semBandeira.length) console.log(`⚠️  países sem bandeira: ${semBandeira.map((p) => p.codigo).join(', ')}`)
if (semPais.length) console.log(`⚠️  bandeiras sem país: ${semPais.join(', ')}`)
if (!semBandeira.length && !semPais.length) console.log('✓ cobertura completa')

// --- monolítico do servidor: carregado só no SSR, nunca no bundle do cliente
const entradas = modulos.map((iso) => {
  const svg = JSON.parse(fs.readFileSync(path.join(DIR_MODULOS, `${iso}.js`), 'utf8').replace(/^export default /, '').trim())
  return `  '${iso}': ${JSON.stringify(svg)}`
})

fs.writeFileSync(
  path.join(RAIZ, 'src/bandeiras.js'),
  `// Gerado automaticamente — todas as bandeiras num objeto só.\n// Carregado APENAS no servidor (import dinâmico), para que o SSR resolva de\n// forma síncrona. No cliente cada bandeira vem do seu próprio chunk lazy.\n\nexport const BANDEIRAS = {\n${entradas.join(',\n')}\n}\n\nexport default BANDEIRAS\n`
)

// --- lista de ISOs disponíveis (leve, pode ir para o cliente)
fs.writeFileSync(
  path.join(RAIZ, 'src/isos.js'),
  `// Gerado automaticamente — códigos ISO alpha-2 com bandeira disponível.\n\nexport const ISOS = ${JSON.stringify(modulos)}\n\nexport default ISOS\n`
)

console.log(`✓ bandeiras.js e isos.js gerados com ${modulos.length} bandeiras`)
