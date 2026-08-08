# Contribuindo

Obrigado por considerar contribuir com `@edusites/bandeiras-paises`!

## Estrutura

```
flags/              196 arquivos .svg — a fonte da verdade
src/bandeiras/      196 módulos .js — gerados a partir de flags/
src/resolvedor.js   mapa iso → import() — gerado
src/paises.js       lista de países — gerado/curado
src/core.js         API pública sem Vue
src/SvgBandeira.js  componente Vue
src/nuxt.js         plugin Nuxt
```

Os arquivos em `src/bandeiras/` e `src/resolvedor.js` são **gerados**. Nunca os
edite à mão — mexa no `.svg` correspondente e rode o gerador.

## Adicionar ou atualizar uma bandeira

1. **Coloque o SVG** em `flags/{iso}.svg`:

   - Nome do arquivo = ISO-3166 alpha-2 **minúsculo** (`br.svg`, `us.svg`).
   - Proporção 4x3, para bater com as demais.
   - Prefira a versão mais leve disponível. Bandeiras com brasão podem passar de
     100 KB — vale comparar `flag-icons` com `flagcdn` antes de escolher.

2. **Adicione o país** em `src/paises.js`, mantendo a ordem alfabética por nome
   (pt-BR):

   ```js
   { nome: 'Brasil', codigo: 'BR', telefone: '55' }
   ```

3. **Regenere** os módulos e o resolvedor:

   ```bash
   node scripts/gerar.mjs
   ```

4. **Verifique** que a cobertura continua fechando — o gerador imprime países
   sem bandeira e bandeiras sem país. Os dois devem ser zero.

## Regras que não devem ser quebradas

- **ISO inválido devolve `''`**, nunca uma URL. Uma `<img>` quebrada na tela é
  pior que uma bandeira ausente.
- **Case-insensitive** na entrada — as stores usam `'BR'`, os arquivos são
  `br.svg`.
- **`loading="lazy"` + `decoding="async"`** por padrão no componente. Sem isso,
  uma lista de 196 dispara 196 downloads de uma vez.
- **Nada de módulo inline com todas as bandeiras.** O ponto do pacote é que as
  196 fiquem fora do bundle.

## Estilo de código

- Português-BR nos nomes públicos (`urlBandeira`, `listarPaises`, `tamanho`).
- Sem ponto e vírgula, aspas simples — ver `.prettierrc`.
- Zero dependências no núcleo. `vue` é peer dependency **opcional**.

## Publicando

```bash
npm version <patch|minor|major>
npm publish --access public
```

Atualize o `CHANGELOG.md` antes de publicar.
