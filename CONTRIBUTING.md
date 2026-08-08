# Contribuindo

Obrigado por considerar contribuir com `@edusites/bandeiras-paises`!

## Estrutura

```
src/bandeiras/      196 módulos .js, um por bandeira (é o que permite tree-shaking)
src/resolvedor.js   mapa iso → import() — GERADO, não edite à mão
src/paises.js       lista de países
src/core.js         API pública sem Vue
src/SvgPais.js      componente Vue
src/nuxt.js         plugin Nuxt
scripts/gerar.mjs   importa SVGs e regenera o resolvedor
test/lib.test.mjs   suíte de testes
```

## Adicionar ou atualizar uma bandeira

1. **Importe o SVG** — o script minifica e grava o módulo no lugar certo:

   ```bash
   node scripts/gerar.mjs caminho/para/br.svg
   ```

   O nome do arquivo precisa ser o ISO-3166 alpha-2 **minúsculo** (`br.svg`).
   Prefira proporção 4x3, para bater com as demais, e a versão mais leve
   disponível — bandeiras com brasão passam de 100 KB, e vale comparar
   `flag-icons` com `flagcdn` antes de escolher.

2. **Adicione o país** em `src/paises.js`, mantendo a ordem alfabética por nome
   (pt-BR):

   ```js
   { nome: 'Brasil', codigo: 'BR', telefone: '55' }
   ```

3. **Regenere e confira** a cobertura — países sem bandeira e bandeiras sem país
   devem ser zero:

   ```bash
   node scripts/gerar.mjs
   ```

4. **Rode os testes**:

   ```bash
   npm test
   ```

## Regras que não devem ser quebradas

- **Uma bandeira por módulo.** Nada de juntar tudo num `bandeiras.js` — as 196
  somam 1,7 MB e iriam inteiras para o bundle de quem usa só o Brasil.
- **Zero configuração no consumidor.** Instalou, importou, usou. Sem copiar
  pasta de assets, sem mexer no `nuxt.config`.
- **Código inválido não quebra a tela** — devolve `null` (ou um `<span>` vazio
  no componente), nunca uma imagem quebrada.
- **Case-insensitive** na entrada — as stores usam `'BR'`, os módulos são `br`.

## Estilo de código

- Português-BR nos nomes públicos (`svgPais`, `listarPaises`, `tamanho`).
- Sem ponto e vírgula, aspas simples — ver `.prettierrc`.
- Zero dependências no núcleo. `vue` é peer dependency **opcional**.

## Publicando

```bash
npm version <patch|minor|major>
npm publish --access public
```

Atualize o `CHANGELOG.md` antes de publicar.
