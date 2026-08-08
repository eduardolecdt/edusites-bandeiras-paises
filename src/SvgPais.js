import { defineComponent, ref, watchEffect, h } from 'vue'
import { svgPais, svgPaisAsync } from './core.js'

export default defineComponent({
  name: 'SvgPais',
  props: {
    nome: { type: String, required: true },
    tamanho: { type: [Number, String], default: undefined },
    redonda: { type: Boolean, default: false },
    className: { type: String, default: undefined }
  },
  setup(props) {
    const opcoes = () => ({
      nome: props.nome,
      tamanho: props.tamanho == null ? '1em' : props.tamanho,
      redonda: props.redonda,
      className: props.className
    })

    const svg = ref(svgPais(opcoes()) || '')

    const dimensaoPlaceholder = () => {
      const t = props.tamanho
      if (t == null) return '1em'
      return typeof t === 'number' || /^\d+$/.test(String(t)) ? `${t}px` : String(t)
    }

    watchEffect(async () => {
      const { nome } = opcoes()
      const sincrono = svgPais(opcoes())
      if (sincrono) {
        svg.value = sincrono
        return
      }
      const resultado = await svgPaisAsync(opcoes())
      if (props.nome === nome) svg.value = resultado || ''
    })

    return () => {
      const d = dimensaoPlaceholder()
      // Só a versão redonda tem caixa quadrada; a original é 4x3 e define a
      // altura pela proporção, senão o desenho achata.
      const style = props.redonda ? `display:inline-flex;line-height:0;width:${d};height:${d}` : `display:inline-flex;line-height:0;width:${d}`

      if (!svg.value) {
        return h('span', {
          class: 'edusites-pais',
          style
        })
      }
      return h('span', {
        class: 'edusites-pais',
        style,
        innerHTML: svg.value
      })
    }
  }
})
